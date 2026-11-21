import { useState } from "react";
import type { Locale } from "../i18n";
import { downloadFile } from "../import-export/files";
import {
  BIOGAS_FIELDS,
  calculateBiogasChp,
  METHANE_LHV_KWH_PER_NM3,
  type BiogasInputs,
} from "../engine/biogasChp";

const source =
  "https://19january2021snapshot.epa.gov/sites/static/files/2014-12/documents/protocol.pdf";
const fields = Object.entries(BIOGAS_FIELDS) as [
  keyof BiogasInputs,
  (typeof BIOGAS_FIELDS)[keyof BiogasInputs],
][];
const defaults = Object.fromEntries(
  fields.map(([key, bounds]) => [key, String(bounds.initial)]),
) as Record<keyof BiogasInputs, string>;
const units = ["Nm³/h", "%", "%", "kW", "%", "kW", "kW"];
const copy = {
  en: {
    title: "Biogas engine and heat recovery",
    scope:
      "Cleaned biogas feeds an engine-generator. Methane fraction and flow determine available fuel power. Electrical output is capped by the nameplate. A fraction of residual fuel energy can supply a heat load.",
    limits:
      "Gas volume is referenced to 0 °C and one atmosphere. This steady-state model does not calculate digestion, gas cleaning, equipment sizing or emissions. Entered auxiliary load is deducted even without generation.",
    fields: [
      "Available dry biogas flow",
      "Methane by volume",
      "Gross electrical efficiency",
      "Electrical nameplate",
      "Residual heat recovery",
      "Useful heat demand",
      "Auxiliary electrical load",
    ],
    readings: [
      "Available fuel power",
      "Biogas used",
      "Gross electrical output",
      "Net electrical output",
      "Recoverable heat",
      "Heat supplied to demand",
    ],
    invalid: "Enter values within the field limits.",
    reset: "Reset biogas inputs",
    export: "Export biogas results",
    source: "EPA anaerobic digestion performance protocol",
  },
  de: {
    title: "Biogasmotor und Wärmerückgewinnung",
    scope:
      "Gereinigtes Biogas speist einen Motor mit Generator. Methananteil und Gasstrom bestimmen die Brennstoffleistung. Die Nennleistung begrenzt die Stromerzeugung. Ein Anteil der Restenergie kann als Wärme genutzt werden.",
    limits:
      "Das Gasvolumen bezieht sich auf 0 °C und eine Atmosphäre. Das stationäre Modell berechnet weder Vergärung, Gasreinigung, Auslegung noch Emissionen. Der Eigenbedarf wird auch ohne Erzeugung abgezogen.",
    fields: [
      "Verfügbarer trockener Biogasstrom",
      "Methananteil nach Volumen",
      "Elektrischer Bruttowirkungsgrad",
      "Elektrische Nennleistung",
      "Restwärmerückgewinnung",
      "Nutzwärmebedarf",
      "Elektrischer Eigenbedarf",
    ],
    readings: [
      "Verfügbare Brennstoffleistung",
      "Genutzter Biogasstrom",
      "Elektrische Bruttoleistung",
      "Elektrische Nettoleistung",
      "Rückgewinnbare Wärme",
      "Gelieferte Nutzwärme",
    ],
    invalid: "Geben Sie Werte innerhalb der Feldgrenzen ein.",
    reset: "Biogas zurücksetzen",
    export: "Biogasergebnisse exportieren",
    source: "EPA-Protokoll zur Leistung anaerober Vergärung",
  },
  yo: {
    title: "Ẹ́ńjìnnì biogas àti ìgbàpadà ooru",
    scope:
      "Biogas tí a ti sọ di mímọ́ ń ṣiṣẹ́ ẹ́ńjìnnì àti generator. Ìpín methane àti ìṣàn gaasi ló pinnu agbára idana. Rating dín agbára iná kù. Apá ooru tó kù lè pèsè fún ẹrù ooru.",
    limits:
      "Iye gaasi jẹ́ ní 0 °C àti atmosphere kan. Àwòṣe kò ṣírò digestion, ìwẹ̀nùmọ́ gaasi, àpẹrẹ ẹrọ tàbí emissions. A yọ agbára tí ẹ̀rọ ń lò kúrò bí ìmújáde kò tilẹ̀ sí.",
    fields: [
      "Ìṣàn biogas gbígbẹ tó wà",
      "Ìpín methane nípa volume",
      "Efficiency iná gross",
      "Rating iná",
      "Ìgbàpadà ooru tó kù",
      "Ìbéèrè ooru",
      "Agbára iná tí ẹ̀rọ ń lò",
    ],
    readings: [
      "Agbára idana tó wà",
      "Biogas tí a lò",
      "Agbára iná gross",
      "Agbára iná net",
      "Ooru tí a lè gba",
      "Ooru tí a pèsè",
    ],
    invalid: "Tẹ iye tó wà láàárín ààlà.",
    reset: "Dá iye biogas padà",
    export: "Gba èsì biogas",
    source: "Ìtọ́kasí EPA lórí anaerobic digestion",
  },
  pcm: {
    title: "Biogas engine and heat recovery",
    scope:
      "Cleaned biogas dey feed engine and generator. Methane fraction and gas flow decide fuel power. Nameplate cap electricity output. Part of di remaining fuel energy fit supply heat demand.",
    limits:
      "Gas volume na for 0 °C and one atmosphere. Di steady model no calculate digestion, gas cleaning, equipment sizing or emissions. E remove plant power use even if generation no dey.",
    fields: [
      "Dry biogas flow wey dey available",
      "Methane by volume",
      "Gross electrical efficiency",
      "Electrical nameplate",
      "Residual heat recovery",
      "Useful heat demand",
      "Power wey plant use",
    ],
    readings: [
      "Available fuel power",
      "Biogas wey dem use",
      "Gross electrical output",
      "Net electrical output",
      "Heat wey dem fit recover",
      "Heat wey reach demand",
    ],
    invalid: "Enter values inside di field limits.",
    reset: "Reset biogas inputs",
    export: "Export biogas results",
    source: "EPA anaerobic digestion performance protocol",
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

export function BiogasExperiment({ locale }: { locale: Locale }) {
  const [draft, setDraft] = useState(defaults);
  const text = copy[locale];
  const inputs = Object.fromEntries(
    fields.map(([key]) => [key, draft[key] === "" ? NaN : Number(draft[key])]),
  ) as BiogasInputs;
  const result = calculateBiogasChp(inputs);
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  return (
    <section className="panel panel-pad pg-panel" aria-labelledby="pg-biogas">
      <h3 id="pg-biogas">{text.title}</h3>
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
                {format.format(reading)} {index === 1 ? "Nm³/h" : "kW"}
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
              "powergrid-biogas.json",
              JSON.stringify(
                {
                  schemaVersion: 1,
                  model: "steady-state-biogas-engine-chp",
                  methaneLhvKWhNm3: METHANE_LHV_KWH_PER_NM3,
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
