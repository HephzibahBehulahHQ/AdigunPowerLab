import { useState } from "react";
import type { Locale } from "../i18n";
import { downloadFile } from "../import-export/files";
import {
  calculateDieselGenerator,
  DIESEL_FIELDS,
  DIESEL_LHV_KWH_PER_L,
  type DieselInputs,
} from "../engine/dieselGenerator";

const source =
  "https://homerenergy.com/products/pro/docs/latest/fuel_curve.html";
const fields = Object.entries(DIESEL_FIELDS) as [
  keyof DieselInputs,
  (typeof DIESEL_FIELDS)[keyof DieselInputs],
][];
const defaults = Object.fromEntries(
  fields.map(([key, bounds]) => [key, String(bounds.initial)]),
) as Record<keyof DieselInputs, string>;
const units = ["kW", "kW", "%", "L/h", "L/h", "L", "h"];
const outputUnits = ["kW", "kW", "L/h", "L", "L"];
const copy = {
  en: {
    title: "Diesel generator fuel curve",
    scope:
      "The engine-generator converts diesel to electricity. When running, fuel rate is the entered no-load rate plus a term proportional to output. Available power is limited by rating and fuel inventory. The model turns the unit off below minimum stable load.",
    limits:
      "This is a steady-interval teaching case. Use measured fuel rates for a specific generator. Startup fuel, real idle scheduling, ramping, maintenance and emissions are outside the model.",
    fields: [
      "Electrical rating",
      "Requested power",
      "Minimum stable load",
      "No-load fuel rate",
      "Rated fuel rate",
      "Initial diesel inventory",
      "Interval duration",
    ],
    readings: [
      "Available power",
      "Electrical output",
      "Fuel rate",
      "Diesel used",
      "Diesel remaining",
    ],
    invalid:
      "Check input limits. Rated fuel rate must exceed the no-load rate and contain enough energy for rated output.",
    reset: "Reset diesel inputs",
    export: "Export diesel results",
    source: "HOMER straight-line generator fuel curve reference",
  },
  de: {
    title: "Kraftstoffkennlinie eines Dieselgenerators",
    scope:
      "Motor und Generator wandeln Diesel in Strom um. Im Betrieb addiert das Modell zum Leerlaufverbrauch einen zur Leistung proportionalen Anteil. Nennleistung und Vorrat begrenzen die Leistung. Unter der stabilen Mindestlast schaltet das Modell ab.",
    limits:
      "Das Beispiel gilt für ein konstantes Intervall. Verwenden Sie Messwerte für einen konkreten Generator. Startverbrauch, Leerlaufplanung, Rampen, Wartung und Emissionen fehlen.",
    fields: [
      "Elektrische Nennleistung",
      "Angeforderte Leistung",
      "Stabile Mindestlast",
      "Leerlaufverbrauch",
      "Nennlastverbrauch",
      "Anfänglicher Dieselvorrat",
      "Intervalldauer",
    ],
    readings: [
      "Verfügbare Leistung",
      "Elektrische Leistung",
      "Kraftstoffstrom",
      "Verbrauchter Diesel",
      "Verbleibender Diesel",
    ],
    invalid:
      "Prüfen Sie die Eingabegrenzen. Der Nennlastverbrauch muss über dem Leerlaufverbrauch liegen und genügend Energie für die Nennleistung liefern.",
    reset: "Dieselversuch zurücksetzen",
    export: "Dieselergebnisse exportieren",
    source: "HOMER-Referenz zur linearen Kraftstoffkennlinie",
  },
  yo: {
    title: "Ìṣírò idana generator diesel",
    scope:
      "Ẹ́ńjìnnì àti generator yí diesel padà sí iná. Nígbà iṣẹ́, lílo idana jẹ́ iye tí kò ní ẹrù pẹ̀lú apá tó tẹ̀lé agbára jáde. Rating àti ìpamọ́ idana dín agbára kù. Ní ìsàlẹ̀ ẹrù tó kéré jù, àwòṣe pa ẹ̀rọ.",
    limits:
      "Ìṣírò àpẹẹrẹ fún àkókò kan ni. Lo iye idana tí a díwọ̀n fún generator pàtó. Àwòṣe kò ka idana ìbẹ̀rẹ̀, àkókò idle, ramp, ìtọju tàbí emissions sí.",
    fields: [
      "Rating iná",
      "Agbára tí a béèrè",
      "Ẹrù iṣẹ́ tó kéré jù",
      "Lílo idana láìsí ẹrù",
      "Lílo idana ní rating",
      "Ìpamọ́ diesel ìbẹ̀rẹ̀",
      "Gígùn àkókò",
    ],
    readings: [
      "Agbára tó wà",
      "Agbára iná jáde",
      "Ìṣàn idana",
      "Diesel tí a lò",
      "Diesel tó kù",
    ],
    invalid:
      "Ṣàyẹ̀wò ààlà iye. Idana ní rating gbọ́dọ̀ ju iye láìsí ẹrù lọ, ó sì gbọ́dọ̀ tó fún agbára rating.",
    reset: "Dá iye diesel padà",
    export: "Gba èsì diesel",
    source: "Ìtọ́kasí HOMER fún ìṣírò idana generator",
  },
  pcm: {
    title: "Diesel generator fuel curve",
    scope:
      "Engine and generator turn diesel to electricity. When e dey run, fuel rate na no-load rate plus part wey follow power output. Rating and diesel wey remain cap power. Di model turn off di unit below minimum stable load.",
    limits:
      "Na steady-interval example. Use measured fuel rates for particular generator. E leave out startup fuel, idle schedule, ramps, maintenance and emissions.",
    fields: [
      "Electrical rating",
      "Requested power",
      "Minimum stable load",
      "Fuel rate without load",
      "Rated fuel rate",
      "Diesel wey dey at start",
      "Interval duration",
    ],
    readings: [
      "Power wey dey available",
      "Electrical output",
      "Fuel rate",
      "Diesel wey dem use",
      "Diesel wey remain",
    ],
    invalid:
      "Check di input limits. Rated fuel rate must pass no-load rate and get enough energy for rated power.",
    reset: "Reset diesel inputs",
    export: "Export diesel results",
    source: "HOMER straight-line generator fuel curve reference",
  },
} satisfies Record<
  Locale,
  {
    title: string;
    scope: string;
    limits: string;
    fields: string[];
    readings: string[];
    invalid: string;
    reset: string;
    export: string;
    source: string;
  }
>;

export function DieselExperiment({ locale }: { locale: Locale }) {
  const [draft, setDraft] = useState(defaults);
  const text = copy[locale];
  const inputs = Object.fromEntries(
    fields.map(([key]) => [key, draft[key] === "" ? NaN : Number(draft[key])]),
  ) as DieselInputs;
  const result = calculateDieselGenerator(inputs);
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  return (
    <section className="panel panel-pad pg-panel" aria-labelledby="pg-diesel">
      <h3 id="pg-diesel">{text.title}</h3>
      <p>{text.scope}</p>
      <p>{text.limits}</p>
      <div className="pg-fields">
        {fields.map(([key, bounds], index) => (
          <label className="pg-field" key={key}>
            <span>
              {text.fields[index]} ({units[index]})
            </span>
            <input
              type="number"
              step="any"
              min={bounds.min}
              max={bounds.max}
              value={draft[key]}
              onChange={(event) =>
                setDraft({ ...draft, [key]: event.currentTarget.value })
              }
            />
          </label>
        ))}
      </div>
      {result ? (
        <dl>
          {Object.values(result).map((reading, index) => (
            <div key={text.readings[index]}>
              <dt>{text.readings[index]}</dt>
              <dd>
                {format.format(reading)} {outputUnits[index]}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p role="status">{text.invalid}</p>
      )}
      <div className="pg-actions">
        <button
          className="button"
          type="button"
          onClick={() => setDraft(defaults)}
        >
          {text.reset}
        </button>
        <button
          className="button"
          type="button"
          disabled={!result}
          onClick={() =>
            downloadFile(
              "powergrid-diesel.json",
              JSON.stringify(
                {
                  schemaVersion: 1,
                  model: "steady-interval-linear-diesel-curve",
                  dieselLhvKWhL: DIESEL_LHV_KWH_PER_L,
                  inputs,
                  result,
                  source,
                },
                null,
                2,
              ),
              "application/json",
            )
          }
        >
          {text.export}
        </button>
      </div>
      <a href={source} target="_blank" rel="noreferrer">
        {text.source}
      </a>
    </section>
  );
}
