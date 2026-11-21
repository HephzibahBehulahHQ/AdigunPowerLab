import { useState } from "react";
import type { Locale } from "../i18n";
import { downloadFile } from "../import-export/files";

const ratingKva = 1000;
const coreLossKw = 2;
const ratedWindingLossKw = 10;
const referenceLoad = 500;
const referenceFactor = 0.8;

function calculate(loadKva: number, powerFactor: number) {
  const loading = loadKva / ratingKva;
  const windingLossKw = ratedWindingLossKw * loading ** 2;
  const outputKw = loadKva * powerFactor;
  const lossKw = coreLossKw + windingLossKw;
  return {
    loadKva,
    powerFactor,
    loading,
    windingLossKw,
    outputKw,
    lossKw,
    inputKw: outputKw + lossKw,
    efficiency: outputKw / (outputKw + lossKw),
    overloaded: loading > 1,
  };
}

const reference = calculate(referenceLoad, referenceFactor);
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
  const powerFactor = Number(factor);
  const result =
    load.trim() &&
    loadKva >= 0 &&
    loadKva <= 1500 &&
    powerFactor > 0 &&
    powerFactor <= 1
      ? calculate(loadKva, powerFactor)
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
      <dd>{percent.format(value.efficiency)}</dd>
    </dl>
  );

  return (
    <section
      className="panel panel-pad pg-panel"
      aria-labelledby="pg-transformer-lesson"
    >
      <h3 id="pg-transformer-lesson">{title}</h3>
      <p>{prediction}</p>
      <p>{assumptions}</p>
      <details>
        <summary>{worked}</summary>
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
                  ratingKva,
                  coreLossKw,
                  ratedWindingLossKw,
                  assumptions,
                  reference,
                  result,
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
