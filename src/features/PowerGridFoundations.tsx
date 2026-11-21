import { useState } from "react";
import type { Locale } from "../i18n";
import {
  calculatePowerGrid,
  DEFAULT_POWERGRID_INPUTS,
  type PowerGridInputs,
} from "../engine/powergrid";

const equipment = [
  "hydro-generator",
  "step-up-transformer",
  "transmission-tower-damage",
  "substation-switchyard",
  "distribution-pole-transformer",
];

const terminalLabels = {
  en: [
    "Input voltage",
    "Output voltage",
    "Output ÷ input",
    "Storm damage example",
  ],
  de: [
    "Eingangsspannung",
    "Ausgangsspannung",
    "Ausgang ÷ Eingang",
    "Beispiel für Sturmschäden",
  ],
  yo: [
    "Fólítéèjì tó wọlé",
    "Fólítéèjì tó jáde",
    "Ìjáde ÷ ìwọlé",
    "Àpẹẹrẹ ìpalára ìjì",
  ],
  pcm: [
    "Input voltage",
    "Output voltage",
    "Output ÷ input",
    "Example of storm damage",
  ],
} satisfies Record<Locale, readonly string[]>;

const benchCopy = {
  en: [
    "Generator",
    "Step-up transformer",
    "Transmission tower",
    "Receiving substation",
    "Local transformer",
    "Play powerhouse footage",
    "Line current",
    "Conductor loss",
    "Test voltage",
    "Watch a step-up transformer installation",
  ],
  de: [
    "Generator",
    "Hochtransformator",
    "Freileitungsmast",
    "Umspannwerk",
    "Ortsnetztransformator",
    "Video aus dem Krafthaus abspielen",
    "Leiterstrom",
    "Leiterverlust",
    "Prüfspannung",
    "Einbau eines Hochtransformators ansehen",
  ],
  yo: [
    "Ẹ̀rọ amúná",
    "Transformer agbégbè sókè",
    "Ilé gogoro ìlà",
    "Ibùdó ìgbàwọlé",
    "Transformer agbègbè",
    "Wo fídíò ilé amúná",
    "Ìṣàn iná ìlà",
    "Àdánù okùn",
    "Fólítéèjì ìdánwò",
    "Wo bí wọ́n ṣe fi transformer agbégbè sókè sí",
  ],
  pcm: [
    "Generator",
    "Step-up transformer",
    "Transmission tower",
    "Receiving substation",
    "Local transformer",
    "Play powerhouse video",
    "Line current",
    "Wire loss",
    "Test voltage",
    "Watch how dem install step-up transformer",
  ],
} satisfies Record<Locale, readonly string[]>;

const copy = {
  en: [
    "Practical lesson: Source to socket",
    "Predict where the voltage rises and falls between the generator and the consumer.",
    "The worked route is generator 11 kV → step-up transformer → transmission 330 kV → receiving transformer → distribution 33 kV → local transformer → consumer 0.4 kV. Values are illustrative line-to-line voltages. Transformers are ideal in this experiment.",
    "Current route from generator to consumer (line-to-line)",
    "Change the generator or distribution voltage in the worksheet. Find that stage in the equipment diagrams. Which transformer ratio changes? Which stage delivers power to the consumer?",
    "Practical lesson: Why step up voltage?",
    "Predict the direction of change in line current and loss when voltage rises from 132 to 330 kV.",
    "At fixed 100 MW, unity power factor and 5 Ω per phase, current falls from about 437.4 A to 175.0 A and loss falls from 2.870 MW to 0.459 MW. The worksheet models a balanced line with equal resistance in both cases.",
    "Change the raised voltage. Explain why conductor loss changes faster than current. Record your answers in Student notes and export the lab report PDF.",
    "Restore worked transmission inputs",
  ],
  de: [
    "Praxisversuch: Von der Quelle zur Steckdose",
    "Sagen Sie voraus, wo die Spannung zwischen Generator und Verbraucher steigt oder fällt.",
    "Beispielweg: Generator 11 kV → Hochtransformator → Übertragung 330 kV → Umspannwerk → Verteilung 33 kV → Ortsnetztransformator → Verbraucher 0,4 kV. Die Leiterspannungen sind illustrativ, die Transformatoren ideal.",
    "Aktueller Weg vom Generator zum Verbraucher (Leiterspannungen)",
    "Ändern Sie die Generator- oder Verteilungsspannung und suchen Sie die Stufe im Schaltbild. Welches Übersetzungsverhältnis ändert sich? Welche Stufe versorgt den Verbraucher?",
    "Praxisversuch: Warum die Spannung erhöhen?",
    "Sagen Sie voraus, wie sich Strom und Verlust bei der Erhöhung von 132 auf 330 kV ändern.",
    "Bei 100 MW, Leistungsfaktor 1 und 5 Ω je Phase sinkt der Strom etwa von 437,4 A auf 175,0 A, der Verlust von 2,870 MW auf 0,459 MW. Das Blatt modelliert eine symmetrische Leitung mit gleichem Widerstand in beiden Fällen.",
    "Ändern Sie die höhere Spannung. Warum ändert sich der Verlust stärker als der Strom? Halten Sie Ihre Antworten in den Notizen fest und exportieren Sie den Laborbericht als PDF.",
    "Spannungsbeispiel wiederherstellen",
  ],
  yo: [
    "Ìdánwò: Láti orísun dé ibi lílo",
    "Sọ àsọtẹ́lẹ̀ ibi tí fólítéèjì yóò gòkè tàbí sọ̀kalẹ̀ láàárín generator àti oníbàárà.",
    "Ọ̀nà àpẹẹrẹ: generator 11 kV → transformer tó gbé fólítéèjì sókè → gbigbe 330 kV → transformer ìgbàwọlé → pinpin 33 kV → transformer agbègbè → oníbàárà 0.4 kV. Fólítéèjì láàárín àwọn ìpele jẹ́ àpẹẹrẹ; transformer jẹ́ ideal.",
    "Ọ̀nà lọwọlọwọ láti generator dé oníbàárà (fólítéèjì láàárín ìpele)",
    "Yí fólítéèjì generator tàbí pinpin padà kí o sì rí ìpele náà nínú àwòrán. Ìpín transformer wo ló yí padà? Ìpele wo ló ń fún oníbàárà ní agbára?",
    "Ìdánwò: Kí ló dé tí a fi ń gbé fólítéèjì sókè?",
    "Sọ àsọtẹ́lẹ̀ bí ìṣàn iná àti àdánù ṣe máa yí padà láti 132 sí 330 kV.",
    "Ní 100 MW, power factor 1 àti 5 Ω fún ìpele, ìṣàn iná dín kù láti 437.4 sí 175.0 A, àdánù sì dín kù láti 2.870 sí 0.459 MW. Okùn ìpele mẹ́ta dọ́gba, ìdènà rẹ̀ sì jẹ́ kan náà.",
    "Yí fólítéèjì gíga padà. Kí ló dé tí àdánù fi yí ju ìṣàn iná lọ? Kọ ìdáhùn rẹ sínú àkọsílẹ̀ kí o sì gba PDF.",
    "Dá àwọn iye àpẹẹrẹ gbigbe padà",
  ],
  pcm: [
    "Practical lesson: Source to socket",
    "Predict where voltage go rise and fall from generator reach consumer.",
    "Example route na generator 11 kV → step-up transformer → transmission 330 kV → receiving transformer → distribution 33 kV → local transformer → consumer 0.4 kV. Na example line-to-line voltages and ideal transformers.",
    "Voltage route from generator reach consumer (line to line)",
    "Change generator or distribution voltage for worksheet. Find dat stage for di equipment drawing. Which transformer ratio change? Which stage supply di consumer?",
    "Practical lesson: Why step up voltage?",
    "Predict wetin go happen to line current and loss if voltage rise from 132 to 330 kV.",
    "At 100 MW, power factor 1 and 5 Ω per phase, current drop from about 437.4 A to 175.0 A and loss drop from 2.870 MW to 0.459 MW. Na balanced line with di same resistance for both cases.",
    "Change di higher voltage. Explain why wire loss change faster than current. Write your answers for student notes and download di lab report PDF.",
    "Restore worked transmission values",
  ],
} satisfies Record<Locale, readonly string[]>;

export function PowerGridFoundations({
  locale,
  inputs,
  onReset,
}: {
  locale: Locale;
  inputs: PowerGridInputs;
  onReset: () => void;
}) {
  const [
    source,
    sourcePrediction,
    sourceReference,
    route,
    sourceQuestion,
    stepUp,
    stepPrediction,
    stepReference,
    stepQuestion,
    reset,
  ] = copy[locale];
  const [stage, setStage] = useState(0);
  const [video, setVideo] = useState(false);
  const [transformerVideo, setTransformerVideo] = useState(false);
  const [voltage, setVoltage] = useState(330);
  const labels = benchCopy[locale];
  const comparison = calculatePowerGrid({
    ...DEFAULT_POWERGRID_INPUTS,
    raisedVoltageKV: voltage,
  });
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 6 });
  const {
    generationVoltageKV,
    raisedVoltageKV,
    distributionVoltageKV,
    consumerVoltageKV,
  } = inputs;
  const terminals = [
    [undefined, generationVoltageKV],
    [generationVoltageKV, raisedVoltageKV],
    [raisedVoltageKV, raisedVoltageKV],
    [raisedVoltageKV, distributionVoltageKV],
    [distributionVoltageKV, consumerVoltageKV],
  ];
  const [incoming, outgoing] = terminals[stage];
  const validVoltage = (value: number | undefined): value is number =>
    value !== undefined && Number.isFinite(value) && value > 0;
  const reading = (value: number | undefined) =>
    validVoltage(value) ? `${format.format(value)} kV` : "—";
  const [inputLabel, outputLabel, ratioLabel, damageLabel] =
    terminalLabels[locale];
  return (
    <>
      <section
        className="panel panel-pad pg-panel"
        aria-labelledby="pg-source-lesson"
      >
        <h3 id="pg-source-lesson">{source}</h3>
        <p>{sourcePrediction}</p>
        <div className="pg-actions">
          {equipment.map((photo, index) => (
            <button
              className="button"
              type="button"
              key={photo}
              aria-pressed={stage === index}
              onClick={() => setStage(index)}
            >
              {labels[index]}
            </button>
          ))}
        </div>
        <figure className="pg-foundation-media">
          <img
            src={`./assets/powergrid/field-photos/${equipment[stage]}.jpg`}
            alt={labels[stage]}
            loading="lazy"
          />
          <figcaption>{stage === 2 ? damageLabel : labels[stage]}</figcaption>
        </figure>
        <dl className="pg-foundation-readings" aria-live="polite">
          {incoming !== undefined && (
            <div>
              <dt>{inputLabel}</dt>
              <dd>{reading(incoming)}</dd>
            </div>
          )}
          <div>
            <dt>{outputLabel}</dt>
            <dd>{reading(outgoing)}</dd>
          </div>
          {[1, 3, 4].includes(stage) && (
            <div>
              <dt>{ratioLabel}</dt>
              <dd>
                {validVoltage(incoming) && validVoltage(outgoing)
                  ? `${format.format(outgoing / incoming)}×`
                  : "—"}
              </dd>
            </div>
          )}
        </dl>
        <p>
          {route}{" "}
          <b>
            {[
              inputs.generationVoltageKV,
              inputs.raisedVoltageKV,
              inputs.distributionVoltageKV,
              inputs.consumerVoltageKV,
            ]
              .map(reading)
              .join(" → ")}
          </b>
        </p>
        <p>{sourceQuestion}</p>
        {video ? (
          <iframe
            className="pg-field-video-player"
            src="https://www.dvidshub.net/video/embed/993768"
            title={labels[5]}
            allowFullScreen
          />
        ) : (
          <button
            className="button"
            type="button"
            onClick={() => setVideo(true)}
          >
            {labels[5]}
          </button>
        )}
        <details>
          <summary>{route}</summary>
          <p>{sourceReference}</p>
        </details>
      </section>
      <section
        className="panel panel-pad pg-panel"
        aria-labelledby="pg-step-lesson"
      >
        <h3 id="pg-step-lesson">{stepUp}</h3>
        <p>{stepPrediction}</p>
        <div className="pg-home-video-frame pg-transformer-video">
          {transformerVideo ? (
            <iframe
              src="https://www.dvidshub.net/video/embed/902345"
              title={labels[9]}
              allowFullScreen
            />
          ) : (
            <button
              className="pg-field-video-play"
              type="button"
              onClick={() => setTransformerVideo(true)}
            >
              <img
                src="./assets/powergrid/field-photos/step-up-transformer.jpg"
                alt=""
                loading="lazy"
              />
              <span>{labels[9]}</span>
            </button>
          )}
        </div>
        <label className="pg-field">
          <span>
            {labels[8]} ({voltage} kV)
          </span>
          <input
            type="range"
            min={133}
            max={400}
            value={voltage}
            onChange={(event) => setVoltage(event.currentTarget.valueAsNumber)}
          />
        </label>
        <table>
          <thead>
            <tr>
              <th scope="col">kV</th>
              <th scope="col">{labels[6]} (A)</th>
              <th scope="col">{labels[7]} (MW)</th>
            </tr>
          </thead>
          <tbody>
            {[comparison.base, comparison.raised].map((reading, index) => {
              const caseVoltage = index === 0 ? 132 : voltage;
              return (
                <tr key={caseVoltage}>
                  <th scope="row">{caseVoltage}</th>
                  <td>
                    <meter
                      className="pg-voltage-meter"
                      aria-label={`${labels[6]} · ${caseVoltage} kV`}
                      value={reading.currentA}
                      max={comparison.base.currentA}
                    />
                    {reading.currentA.toLocaleString(locale, {
                      maximumFractionDigits: 1,
                    })}{" "}
                    A
                  </td>
                  <td>
                    <meter
                      className="pg-voltage-meter"
                      aria-label={`${labels[7]} · ${caseVoltage} kV`}
                      value={reading.lineLossMW}
                      max={comparison.base.lineLossMW}
                    />
                    {reading.lineLossMW.toLocaleString(locale, {
                      maximumFractionDigits: 3,
                    })}{" "}
                    MW
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <details>
          <summary>{stepPrediction}</summary>
          <p>{stepReference}</p>
        </details>
        <p>{stepQuestion}</p>
        <button
          className="button"
          type="button"
          onClick={() => {
            setVoltage(330);
            onReset();
          }}
        >
          {reset}
        </button>
      </section>
    </>
  );
}
