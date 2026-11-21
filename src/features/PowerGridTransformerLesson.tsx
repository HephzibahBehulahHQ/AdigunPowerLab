import { useState } from "react";
import type { Locale } from "../i18n";
import { downloadFile } from "../import-export/files";
import { calculateTransformerLoading } from "../engine/powergridTransformer";

const lossyModel = { ratingKva: 1000, coreLossKw: 2, ratedWindingLossKw: 10 };
const idealModel = {
  ratingKva: lossyModel.ratingKva,
  coreLossKw: 0,
  ratedWindingLossKw: 0,
};
const referenceLoad = 500;
const referenceFactor = 0.8;

const reference = calculateTransformerLoading(
  referenceLoad,
  referenceFactor,
  lossyModel,
);
const idealLabel = {
  en: "Compare with an ideal transformer",
  de: "Mit einem idealen Transformator vergleichen",
  yo: "Fi wé transformer ideal",
  pcm: "Compare with ideal transformer",
} satisfies Record<Locale, string>;
const instrumentCopy = {
  en: [
    "Transformer in a switchyard",
    "Adjust transformer load",
    "Core loss",
    "Winding loss",
  ],
  de: [
    "Transformator im Schaltfeld",
    "Transformatorlast ändern",
    "Eisenverluste",
    "Wicklungsverluste",
  ],
  yo: [
    "Transformer ní ibùdó iná",
    "Ṣàtúnṣe ẹrù transformer",
    "Àdánù core",
    "Àdánù winding",
  ],
  pcm: [
    "Transformer for switchyard",
    "Change transformer load",
    "Core loss",
    "Winding loss",
  ],
} satisfies Record<Locale, readonly string[]>;
const copy = {
  en: [
    "Practical lesson: Transformer loading",
    "Predict what happens to total loss and efficiency when you double the apparent load.",
    "Illustrative 1,000 kVA unit at fixed voltage. Core loss is 2 kW. Winding loss is 10 kW at rating and varies with current squared. The model omits temperature rise and overload duration.",
    "Worked reference at 500 kVA and 0.8 power factor",
    "Apparent load (kVA)",
    "Power factor (transformer)",
    "Rated loading",
    "Total loss",
    "Efficiency",
    "Try 1,000 kVA, then exceed the rating. When does the rating warning appear? At the same kVA, why does a lower power factor reduce efficiency?",
    "Above nameplate rating",
    "Enter 0–1,500 kVA and a power factor above 0 and at most 1.",
    "Reset transformer lesson",
    "Download transformer report (JSON)",
  ],
  de: [
    "Praxisversuch: Transformatorbelastung",
    "Sagen Sie voraus, wie sich Gesamtverluste und Wirkungsgrad ändern, wenn sich die Scheinlast verdoppelt.",
    "Beispieltransformator mit 1.000 kVA bei fester Spannung. Die Eisenverluste betragen 2 kW, die Wicklungsverluste bei Nennlast 10 kW und steigen quadratisch mit dem Strom. Erwärmung und Überlastdauer werden nicht berechnet.",
    "Berechnetes Beispiel bei 500 kVA und Leistungsfaktor 0,8",
    "Scheinlast (kVA)",
    "Leistungsfaktor (Transformator)",
    "Auslastung",
    "Gesamtverluste",
    "Wirkungsgrad",
    "Probieren Sie 1.000 kVA und überschreiten Sie dann die Nennleistung. Wann erscheint die Warnung? Warum senkt ein kleinerer Leistungsfaktor bei gleichen kVA den Wirkungsgrad?",
    "Nennleistung überschritten",
    "Geben Sie 0–1.500 kVA und einen Leistungsfaktor größer 0 bis 1 ein.",
    "Transformatorversuch zurücksetzen",
    "Transformatorbericht herunterladen (JSON)",
  ],
  yo: [
    "Ìdánwò: Ẹrù transformer",
    "Sọ àsọtẹ́lẹ̀ ohun tí yóò ṣẹlẹ̀ sí àdánù lápapọ̀ àti ìmúṣẹ bí o bá sọ apparent load di ìlọ́po méjì.",
    "Àpẹẹrẹ 1,000 kVA pẹ̀lú fólítéèjì tí kò yí padà. Àdánù core jẹ́ 2 kW. Àdánù winding jẹ́ 10 kW ní rating, ó sì tẹ̀lé ìṣàn iná onígun méjì. Àwòṣe kò ṣírò ìgbóná tàbí àkókò overload.",
    "Àpẹẹrẹ ìṣírò ní 500 kVA àti power factor 0.8",
    "Apparent load (kVA)",
    "Power factor (transformer)",
    "Ẹrù ní ìbámu pẹ̀lú rating",
    "Àdánù lápapọ̀",
    "Ìmúṣẹ",
    "Gbìyànjú 1,000 kVA, lẹ́yìn náà kọjá rating. Ìgbà wo ni ìkìlọ̀ hàn? Kí ló dé tí power factor kékeré fi dín ìmúṣẹ kù ní kVA kan náà?",
    "Ẹrù kọjá rating",
    "Tẹ 0–1,500 kVA àti power factor tó ju 0 lọ tí kò sì ju 1 lọ.",
    "Dá ìdánwò transformer padà",
    "Gba ìròyìn transformer (JSON)",
  ],
  pcm: [
    "Practical lesson: Transformer loading",
    "Predict wetin go happen to total loss and efficiency if you double apparent load.",
    "Example 1,000 kVA transformer with steady voltage. Core loss na 2 kW. Winding loss na 10 kW for rated load and e follow current squared. Di model no calculate temperature rise or overload duration.",
    "Worked example for 500 kVA and power factor 0.8",
    "Apparent load (kVA)",
    "Power factor (transformer)",
    "Rated loading",
    "Total loss",
    "Efficiency",
    "Try 1,000 kVA, then pass di rating. When di warning show? For di same kVA, why lower power factor reduce efficiency?",
    "Load don pass nameplate rating",
    "Enter 0–1,500 kVA and power factor wey pass 0 and no pass 1.",
    "Reset transformer lesson",
    "Download transformer report (JSON)",
  ],
} satisfies Record<Locale, readonly string[]>;

export function PowerGridTransformerLesson({ locale }: { locale: Locale }) {
  const [load, setLoad] = useState(String(referenceLoad));
  const [factor, setFactor] = useState(String(referenceFactor));
  const [
    title,
    prediction,
    assumptions,
    worked,
    loadLabel,
    factorLabel,
    loading,
    loss,
    efficiency,
    question,
    overload,
    invalid,
    reset,
    report,
  ] = copy[locale];
  const loadKva = Number(load);
  const [photo, slider, core, winding] = instrumentCopy[locale];
  const powerFactor = Number(factor);
  const result =
    load.trim() &&
    loadKva >= 0 &&
    loadKva <= 1500 &&
    powerFactor > 0 &&
    powerFactor <= 1
      ? calculateTransformerLoading(loadKva, powerFactor, lossyModel)
      : undefined;
  const ideal = result
    ? calculateTransformerLoading(loadKva, powerFactor, idealModel)
    : undefined;
  const percent = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 2,
  });
  const decimal = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  const readings = (value: typeof reference) => (
    <dl>
      <dt>{loading}</dt>
      <dd>{percent.format(value.loading)}</dd>
      <dt>{loss}</dt>
      <dd>{decimal.format(value.lossKw)} kW</dd>
      <dt>{efficiency}</dt>
      <dd>
        {value.efficiency === null ? "—" : percent.format(value.efficiency)}
      </dd>
    </dl>
  );

  return (
    <section
      className="panel panel-pad pg-panel"
      aria-labelledby="pg-transformer-lesson"
    >
      <h3 id="pg-transformer-lesson">{title}</h3>
      <p>{prediction}</p>
      <div className="pg-home-video">
        <figure className="pg-foundation-media">
          <img
            src="./assets/grid-transformer-switchyard.png"
            alt={photo}
            loading="lazy"
          />
          <figcaption>{photo}</figcaption>
        </figure>
        <div>
          <label className="pg-field">
            <span>{slider}</span>
            <input
              type="range"
              min={0}
              max={1500}
              step={10}
              value={
                load.trim() && loadKva >= 0 && loadKva <= 1500
                  ? loadKva
                  : referenceLoad
              }
              onChange={(event) => setLoad(event.currentTarget.value)}
            />
          </label>
          <div className="pg-actions">
            {[referenceLoad, lossyModel.ratingKva, 1200].map((value) => (
              <button
                className="button"
                type="button"
                key={value}
                onClick={() => setLoad(String(value))}
              >
                {decimal.format(value)} kVA
              </button>
            ))}
          </div>
          {result && (
            <>
              <meter
                className="pg-voltage-meter"
                aria-label={loading}
                value={result.loading}
                high={1}
                max={1.5}
                optimum={0}
              />
              <dl className="pg-foundation-readings">
                <div>
                  <dt>{core}</dt>
                  <dd>{decimal.format(lossyModel.coreLossKw)} kW</dd>
                </div>
                <div>
                  <dt>{winding}</dt>
                  <dd>{decimal.format(result.windingLossKw)} kW</dd>
                </div>
              </dl>
            </>
          )}
        </div>
      </div>
      <details>
        <summary>{worked}</summary>
        <p>{assumptions}</p>
        {readings(reference)}
      </details>
      <div className="pg-fields">
        <label className="pg-field">
          <span>{loadLabel}</span>
          <input
            type="number"
            min="0"
            max="1500"
            step="any"
            value={load}
            onChange={(event) => setLoad(event.currentTarget.value)}
          />
        </label>
        <label className="pg-field">
          <span>{factorLabel}</span>
          <input
            type="number"
            max="1"
            step="any"
            value={factor}
            onChange={(event) => setFactor(event.currentTarget.value)}
          />
        </label>
      </div>
      {result ? readings(result) : <p role="status">{invalid}</p>}
      {ideal && (
        <details>
          <summary>{idealLabel[locale]}</summary>
          {readings(ideal)}
        </details>
      )}
      {result?.overloaded && <p role="status">{overload}</p>}
      <p>{question}</p>
      <div className="pg-actions">
        <button
          className="button"
          type="button"
          onClick={() => {
            setLoad(String(referenceLoad));
            setFactor(String(referenceFactor));
          }}
        >
          {reset}
        </button>
        <button
          className="button"
          type="button"
          disabled={!result}
          onClick={() => {
            downloadFile(
              "powergrid-transformer-loading.json",
              JSON.stringify(
                {
                  schemaVersion: 1,
                  model: "constant-core-square-law-winding-loss",
                  ...lossyModel,
                  assumptions,
                  reference,
                  result,
                  ideal,
                },
                null,
                2,
              ),
              "application/json",
            );
          }}
        >
          {report}
        </button>
      </div>
    </section>
  );
}
