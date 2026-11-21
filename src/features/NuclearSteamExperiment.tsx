import { useState } from "react";
import type { Locale } from "../i18n";
import { downloadFile } from "../import-export/files";
import {
  calculateNuclearSteam,
  NUCLEAR_STEAM_FIELDS,
  type NuclearSteamInputs,
} from "../engine/nuclearSteam";

const source =
  "https://www.eia.gov/energyexplained/nuclear/nuclear-power-plants-types-of-reactors.php";
const fields = Object.entries(NUCLEAR_STEAM_FIELDS) as [
  keyof NuclearSteamInputs,
  (typeof NUCLEAR_STEAM_FIELDS)[keyof NuclearSteamInputs],
][];
const defaults = Object.fromEntries(
  fields.map(([key, bounds]) => [key, String(bounds.initial)]),
) as Record<keyof NuclearSteamInputs, string>;
const inputUnits = ["MW", "MW", "%", "MW", "h"];
const outputUnits = ["MW", "MW", "MWh", "MW"];
const copy = {
  en: {
    title: "Nuclear steam generation",
    scope:
      "Compare gross generation, plant electricity use and net grid output from an entered supply of steam-cycle heat.",
    fields: [
      "Heat supplied to the steam cycle",
      "Gross generator rating",
      "Gross conversion efficiency",
      "Plant electricity use",
      "Interval",
    ],
    readings: [
      "Gross generation",
      "Net grid output",
      "Net electrical energy",
      "Heat not converted to electricity",
    ],
    invalid: "Check the input limits.",
    reset: "Reset nuclear steam inputs",
    exportLabel: "Export nuclear steam results",
    source: "EIA reference and NRC illustration",
    alt: "Illustration of a pressurized-water plant feeding steam to a turbine-generator.",
  },
  de: {
    title: "Kernkraft mit Dampfturbine",
    scope:
      "Vergleichen Sie Bruttoerzeugung, Eigenbedarf und Netzeinspeisung bei vorgegebener Wärmezufuhr zum Dampfkreis.",
    fields: [
      "Wärmezufuhr zum Dampfkreis",
      "Brutto-Nennleistung",
      "Bruttowirkungsgrad",
      "Elektrischer Eigenbedarf",
      "Intervall",
    ],
    readings: [
      "Bruttoerzeugung",
      "Netzeinspeisung",
      "Elektrische Nettoenergie",
      "Nicht in Strom umgewandelte Wärme",
    ],
    invalid: "Prüfen Sie die Eingabegrenzen.",
    reset: "Eingaben zurücksetzen",
    exportLabel: "Ergebnisse exportieren",
    source: "EIA-Quelle und NRC-Abbildung",
    alt: "Schema eines Druckwasserwerks mit Dampfzufuhr zur Turbine.",
  },
  yo: {
    title: "Ìmújáde iná pẹ̀lú òru omi nuclear",
    scope:
      "Wé agbára àpapọ̀, agbára tí ilé-iṣẹ́ ń lò àti agbára tó lọ sí grid láti inú ooru tí a fi sí steam cycle.",
    fields: [
      "Ooru sí steam cycle",
      "Agbára orúkọ generator",
      "Ìmúṣẹ ìyípadà àpapọ̀",
      "Agbára tí ilé-iṣẹ́ ń lò",
      "Àkókò",
    ],
    readings: [
      "Agbára àpapọ̀",
      "Agbára sí grid",
      "Agbára iná lápapọ̀",
      "Ooru tí kò yí sí iná",
    ],
    invalid: "Ṣàyẹ̀wò ààlà àwọn iye.",
    reset: "Dá àwọn iye padà",
    exportLabel: "Gba èsì jáde",
    source: "Orísun EIA àti àwòrán NRC",
    alt: "Àwòrán ilé-iṣẹ́ nuclear tí òru omi ń lọ sí turbine-generator.",
  },
  pcm: {
    title: "Nuclear steam power",
    scope:
      "Compare gross power, electricity wey di plant use and net power wey reach grid from di steam-cycle heat you enter.",
    fields: [
      "Heat wey reach steam cycle",
      "Gross generator rating",
      "Gross conversion efficiency",
      "Power wey plant use",
      "Time period",
    ],
    readings: [
      "Gross generation",
      "Net power to grid",
      "Net electricity",
      "Heat wey no turn to electricity",
    ],
    invalid: "Check di input limits.",
    reset: "Reset inputs",
    exportLabel: "Export nuclear steam results",
    source: "EIA source and NRC illustration",
    alt: "Drawing of pressurized-water plant wey dey send steam to turbine-generator.",
  },
};

export function NuclearSteamExperiment({ locale }: { locale: Locale }) {
  const [draft, setDraft] = useState(defaults);
  const text = copy[locale];
  const inputs = Object.fromEntries(
    fields.map(([key]) => [key, draft[key] === "" ? NaN : Number(draft[key])]),
  ) as NuclearSteamInputs;
  const result = calculateNuclearSteam(inputs);
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });

  return (
    <section className="panel panel-pad pg-panel" aria-labelledby="pg-nuclear">
      <h3 id="pg-nuclear">{text.title}</h3>
      <p>{text.scope}</p>
      <div className="pg-home-video">
        <figure className="pg-foundation-media">
          <img
            src="./assets/powergrid/nrc-steam-generation.jpg"
            alt={text.alt}
            loading="lazy"
          />
          <figcaption>
            <a href={source} target="_blank" rel="noreferrer">
              {text.source}
            </a>
          </figcaption>
        </figure>
        <div className="pg-fields">
          {fields.map(([key, bounds], index) => (
            <label className="pg-field" key={key}>
              <span>
                {text.fields[index]} ({inputUnits[index]})
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
      </div>
      {result ? (
        <dl className="pg-foundation-readings">
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
              "powergrid-nuclear-steam.json",
              JSON.stringify(
                {
                  schemaVersion: 1,
                  model: "steady-steam-cycle-net-energy-balance",
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
          {text.exportLabel}
        </button>
      </div>
    </section>
  );
}
