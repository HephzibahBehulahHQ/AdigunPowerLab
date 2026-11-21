import { useState } from "react";
import { solveRadialNetwork } from "../engine/powergridRadial";
import type { RadialNetworkInput } from "../engine/powergridRadial";
import type { Locale } from "../i18n";
import { downloadFile } from "../import-export/files";

const referenceKm = 5;
const exampleKm = 25;
const resistancePerKm = 0.2;
const reactancePerKm = 0.4;

function solveDistance(lengthKm: number) {
  const input: RadialNetworkInput = {
    sourceBusId: "source",
    sourceVoltageKV: 11,
    buses: [
      { id: "source", loadMW: 0, loadMvar: 0 },
      { id: "receiving", loadMW: 0.5, loadMvar: 0.2, minVoltagePU: 0.95 },
    ],
    branches: [
      {
        id: "line",
        fromBusId: "source",
        toBusId: "receiving",
        resistanceOhm: resistancePerKm * lengthKm,
        reactanceOhm: reactancePerKm * lengthKm,
        inService: true,
      },
    ],
  };
  return { lengthKm, input, result: solveRadialNetwork(input) };
}

const reference = solveDistance(referenceKm);
const example = solveDistance(exampleKm);

const visualCopy = {
  en: [
    "Transmission substation",
    "Adjust line length",
    "Sending voltage",
    "Receiving voltage",
  ],
  de: [
    "Umspannwerk",
    "Leitungslänge ändern",
    "Sendespannung",
    "Empfangsspannung",
  ],
  yo: [
    "Ibùdó gbigbe iná",
    "Ṣàtúnṣe gígùn okùn",
    "Fólítéèjì ìfiranṣẹ́",
    "Fólítéèjì ìgbàwọlé",
  ],
  pcm: [
    "Transmission substation",
    "Change line length",
    "Sending voltage",
    "Receiving voltage",
  ],
} satisfies Record<Locale, readonly string[]>;

const copy = {
  en: {
    title: "Practical lesson: Transmission distance",
    prediction:
      "Predict what a longer line does to receiving voltage and real loss with the same load.",
    assumptions:
      "Balanced 11 kV source and constant 0.50 MW + 0.20 Mvar load. Each phase has 0.20 Ω/km resistance and 0.40 Ω/km reactance. The model omits shunt capacitance.",
    worked: "Worked comparison at 5 km and 25 km",
    length: "Line length (km)",
    voltage: "Receiving voltage (kV)",
    loss: "Line loss (kW)",
    compare: "Your comparison with the 5 km reference",
    invalid: "Enter a length from 1 to 40 km.",
    question:
      "At what distance does receiving voltage first fall below 95% of 11 kV? How do resistance and reactance affect your reading?",
    reset: "Reset distance lesson",
    notes: "Student interpretation",
    report: "Download distance lesson report (JSON)",
  },
  de: {
    title: "Praxisversuch: Übertragungsentfernung",
    prediction:
      "Sagen Sie voraus, wie eine längere Leitung bei gleicher Last die Empfangsspannung und den Wirkleistungsverlust verändert.",
    assumptions:
      "Symmetrische 11-kV-Quelle und konstante Last von 0,50 MW + 0,20 Mvar. Je Phase gelten 0,20 Ω/km Widerstand und 0,40 Ω/km Reaktanz. Das Modell vernachlässigt die Querkapazität.",
    worked: "Berechneter Vergleich für 5 km und 25 km",
    length: "Leitungslänge (km)",
    voltage: "Empfangsspannung (kV)",
    loss: "Leitungsverlust (kW)",
    compare: "Ihr Vergleich mit der 5-km-Referenz",
    invalid: "Geben Sie eine Länge von 1 bis 40 km ein.",
    question:
      "Bei welcher Entfernung fällt die Empfangsspannung erstmals unter 95 % von 11 kV? Wie beeinflussen Widerstand und Reaktanz den Wert?",
    reset: "Entfernungsversuch zurücksetzen",
    notes: "Auswertung",
    report: "Bericht zum Entfernungsversuch herunterladen (JSON)",
  },
  yo: {
    title: "Ìdánwò: Ìjìnnà gbigbe iná",
    prediction:
      "Sọ àsọtẹ́lẹ̀ bí okùn tó gùn sí i yóò ṣe ní ipa lórí fólítéèjì ìgbàwọlé àti àdánù agbára gidi fún ẹrù kan náà.",
    assumptions:
      "Orísun 11 kV tí ìpele rẹ̀ dọ́gba àti ẹrù 0.50 MW + 0.20 Mvar tí kò yí padà. Ìdènà jẹ́ 0.20 Ω/km, reactance sì jẹ́ 0.40 Ω/km fún ìpele kọ̀ọ̀kan. Àwòṣe kò ka shunt capacitance sí.",
    worked: "Ìṣírò àfiwé fún 5 km àti 25 km",
    length: "Gígùn okùn (km)",
    voltage: "Fólítéèjì ìgbàwọlé (kV)",
    loss: "Àdánù agbára inú okùn (kW)",
    compare: "Àfiwé rẹ pẹ̀lú àpẹẹrẹ 5 km",
    invalid: "Tẹ gígùn láti 1 sí 40 km.",
    question:
      "Ní ìjìnnà wo ni fólítéèjì ìgbàwọlé kọ́kọ́ kéré ju 95% ti 11 kV lọ? Báwo ni ìdènà àti reactance ṣe ní ipa lórí iye náà?",
    reset: "Dá ìdánwò ìjìnnà padà",
    notes: "Ìtumọ̀ akẹ́kọ̀ọ́",
    report: "Gba ìròyìn ìdánwò ìjìnnà (JSON)",
  },
  pcm: {
    title: "Practical lesson: Transmission distance",
    prediction:
      "Predict wetin longer line go do to receiving voltage and real power loss if load stay di same.",
    assumptions:
      "Balanced 11 kV source and steady load of 0.50 MW + 0.20 Mvar. Each phase get 0.20 Ω/km resistance and 0.40 Ω/km reactance. Di model leave out shunt capacitance.",
    worked: "Worked comparison for 5 km and 25 km",
    length: "Line length (km)",
    voltage: "Receiving voltage (kV)",
    loss: "Line loss (kW)",
    compare: "Your comparison with di 5 km reference",
    invalid: "Enter length from 1 to 40 km.",
    question:
      "For which distance receiving voltage first drop below 95% of 11 kV? How resistance and reactance affect di reading?",
    reset: "Reset distance lesson",
    notes: "Student explanation",
    report: "Download distance lesson report (JSON)",
  },
} satisfies Record<Locale, Record<string, string>>;

export function PowerGridDistanceLesson({ locale }: { locale: Locale }) {
  const [length, setLength] = useState(String(exampleKm));
  const [notes, setNotes] = useState("");
  const km = Number(length);
  const valid = km >= 1 && km <= 40;
  const current = valid ? solveDistance(km) : undefined;
  const text = copy[locale];
  const [photoLabel, sliderLabel, sourceLabel, receiverLabel] =
    visualCopy[locale];
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  const table = (label: string, cases: (typeof reference)[]) => (
    <table aria-label={label}>
      <thead>
        <tr>
          <th scope="col">{text.length}</th>
          <th scope="col">{text.voltage}</th>
          <th scope="col">{text.loss}</th>
        </tr>
      </thead>
      <tbody>
        {cases.map(({ lengthKm, result }, index) => (
          <tr key={index}>
            <th scope="row">{format.format(lengthKm)}</th>
            <td>{format.format(result.buses[1].voltageLLKV)}</td>
            <td>{format.format(result.realLossMW * 1000)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <section
      className="panel panel-pad pg-panel"
      aria-labelledby="pg-distance-title"
    >
      <h3 id="pg-distance-title">{text.title}</h3>
      <p>{text.prediction}</p>
      <div className="pg-home-video">
        <figure className="pg-foundation-media">
          <img
            src="./assets/transmission-substation.png"
            alt={photoLabel}
            loading="lazy"
          />
          <figcaption>{photoLabel}</figcaption>
        </figure>
        <div>
          <label className="pg-field">
            <span>{sliderLabel}</span>
            <input
              type="range"
              min={1}
              max={40}
              step={0.5}
              value={valid ? km : exampleKm}
              onChange={(event) => setLength(event.currentTarget.value)}
            />
          </label>
          <div className="pg-actions">
            {[referenceKm, exampleKm].map((distance) => (
              <button
                className="button"
                type="button"
                key={distance}
                onClick={() => setLength(String(distance))}
              >
                {distance} km
              </button>
            ))}
          </div>
          <dl className="pg-foundation-readings">
            <div>
              <dt>{sourceLabel}</dt>
              <dd>11 kV</dd>
            </div>
            <div>
              <dt>{receiverLabel}</dt>
              <dd>
                {current
                  ? `${format.format(current.result.buses[1].voltageLLKV)} kV`
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <details>
        <summary>{text.worked}</summary>
        <p>{text.assumptions}</p>
        {table(text.worked, [reference, example])}
      </details>
      <label className="pg-field">
        <span>{text.length}</span>
        <input
          type="number"
          min="1"
          max="40"
          step="any"
          value={length}
          aria-invalid={!valid}
          onChange={(event) => setLength(event.currentTarget.value)}
        />
      </label>
      {current ? (
        table(text.compare, [reference, current])
      ) : (
        <p role="status">{text.invalid}</p>
      )}
      <p>{text.question}</p>
      <label className="pg-field">
        <span>{text.notes}</span>
        <textarea
          rows={2}
          maxLength={2000}
          value={notes}
          onChange={(event) => setNotes(event.currentTarget.value)}
        />
      </label>
      <div className="pg-actions">
        <button
          className="button"
          type="button"
          onClick={() => {
            setLength(String(exampleKm));
            setNotes("");
          }}
        >
          {text.reset}
        </button>
        <button
          className="button"
          type="button"
          disabled={!current}
          onClick={() =>
            downloadFile(
              "powergrid-transmission-distance.json",
              JSON.stringify(
                {
                  schemaVersion: 1,
                  model: "balanced-radial-constant-pq-backward-forward-sweep",
                  objective: text.prediction,
                  assumptions: text.assumptions,
                  interpretationQuestion: text.question,
                  notes,
                  reference,
                  current,
                },
                null,
                2,
              ),
              "application/json",
            )
          }
        >
          {text.report}
        </button>
      </div>
    </section>
  );
}
