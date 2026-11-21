import { useState } from "react";
import type { Locale } from "../i18n";
import { downloadFile } from "../import-export/files";
import {
  calculateCoalSteam,
  COAL_STEAM_FIELDS,
  type CoalSteamInputs,
} from "../engine/coalSteam";

const source = "https://www.eia.gov/tools/faqs/faq.php?id=667&t=3";
const fields = Object.entries(COAL_STEAM_FIELDS) as [
  keyof CoalSteamInputs,
  (typeof COAL_STEAM_FIELDS)[keyof CoalSteamInputs],
][];
const defaults = Object.fromEntries(
  fields.map(([key, bounds]) => [key, String(bounds.initial)]),
) as Record<keyof CoalSteamInputs, string>;
const inputUnits = ["MW", "MW", "MJ/kWh", "MJ/kg", "t", "h"];
const outputUnits = ["MW", "MW", "MWh", "t", "t", "%"];
const copy = {
  en: {
    title: "Coal steam generation",
    scope:
      "A coal boiler feeds steam to a turbine and generator. Compare net output, fuel use and remaining stock over one steady interval. Enter heat rate and coal heat content on the same heating-value basis.",
    fields: [
      "Plant capacity",
      "Requested output",
      "Net heat rate",
      "Coal heat content",
      "Coal inventory",
      "Interval",
    ],
    readings: [
      "Available power",
      "Net output",
      "Electricity generated",
      "Coal consumed",
      "Coal remaining",
      "Net efficiency",
    ],
    invalid: "Check the input limits.",
    reset: "Reset coal inputs",
    exportLabel: "Export coal results",
    source: "EIA fuel-use calculation",
  },
  de: {
    title: "Stromerzeugung mit Kohledampf",
    scope:
      "Ein Kohlekessel liefert Dampf an Turbine und Generator. Vergleichen Sie Nettoleistung, Kohleverbrauch und Restbestand für ein konstantes Intervall. Wärmebedarf und Energiegehalt müssen dieselbe Heizwertbasis verwenden.",
    fields: [
      "Anlagenleistung",
      "Angeforderte Leistung",
      "Netto-Wärmebedarf",
      "Energiegehalt der Kohle",
      "Kohlevorrat",
      "Intervall",
    ],
    readings: [
      "Verfügbare Leistung",
      "Nettoleistung",
      "Erzeugte Strommenge",
      "Kohleverbrauch",
      "Restbestand",
      "Nettowirkungsgrad",
    ],
    invalid: "Prüfen Sie die Eingabegrenzen.",
    reset: "Kohledaten zurücksetzen",
    exportLabel: "Kohleergebnisse exportieren",
    source: "EIA-Berechnung des Brennstoffverbrauchs",
  },
  yo: {
    title: "Ìmújáde iná pẹ̀lú òru omi láti èédú",
    scope:
      "Ìkòkò èédú ń fi òru omi ránṣẹ́ sí turbine àti ẹ̀rọ amúná. Ṣe àfiwé agbára, èédú tí a lò àti èédú tó kù. Lo ìpìlẹ̀ iye ooru kan náà fún ìwọ̀n ooru àti iye ooru èédú.",
    fields: [
      "Agbára ẹ̀rọ",
      "Agbára tí a béèrè",
      "Ìwọ̀n ooru",
      "Iye ooru èédú",
      "Èédú tó wà",
      "Àkókò",
    ],
    readings: [
      "Agbára tó wà",
      "Agbára tí a rí",
      "Iná tí a mú jáde",
      "Èédú tí a lò",
      "Èédú tó kù",
      "Ìmúlò agbára",
    ],
    invalid: "Ṣàyẹ̀wò ààlà àwọn iye.",
    reset: "Dá iye èédú padà",
    exportLabel: "Gba èsì èédú jáde",
    source: "Ìṣírò èédú EIA",
  },
  pcm: {
    title: "Coal steam power",
    scope:
      "Coal boiler dey send steam go turbine and generator. Compare net power, coal wey e use and coal wey remain for one steady period. Use di same heating-value basis for heat rate and coal heat content.",
    fields: [
      "Plant capacity",
      "Power wey you request",
      "Net heat rate",
      "Coal heat content",
      "Coal wey dey",
      "Time period",
    ],
    readings: [
      "Power wey dey",
      "Net power",
      "Electricity wey e make",
      "Coal wey e use",
      "Coal wey remain",
      "Net efficiency",
    ],
    invalid: "Check di input limits.",
    reset: "Reset coal inputs",
    exportLabel: "Export coal results",
    source: "EIA calculation for fuel use",
  },
};

export function CoalSteamExperiment({ locale }: { locale: Locale }) {
  const [draft, setDraft] = useState(defaults);
  const text = copy[locale];
  const inputs = Object.fromEntries(
    fields.map(([key]) => [key, draft[key] === "" ? NaN : Number(draft[key])]),
  ) as CoalSteamInputs;
  const result = calculateCoalSteam(inputs);
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });

  return (
    <section className="panel panel-pad pg-panel" aria-labelledby="pg-coal">
      <h3 id="pg-coal">{text.title}</h3>
      <p>{text.scope}</p>
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
              "powergrid-coal-steam.json",
              JSON.stringify(
                {
                  schemaVersion: 1,
                  model: "steady-interval-coal-steam",
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
      <a href={source} target="_blank" rel="noreferrer">
        {text.source}
      </a>
    </section>
  );
}
