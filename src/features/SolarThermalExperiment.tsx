import { useState } from "react";
import type { Locale } from "../i18n";
import {
  calculateSolarThermal,
  SOLAR_THERMAL_FIELDS,
  type SolarThermalInputs,
} from "../engine/solarThermal";
import { downloadFile } from "../import-export/files";

const source =
  "https://www.energy.gov/cmei/systems/power-tower-system-concentrating-solar-thermal-power-basics";
const fields = Object.keys(
  SOLAR_THERMAL_FIELDS,
) as (keyof SolarThermalInputs)[];
const defaults = Object.fromEntries(
  fields.map((key) => [key, String(SOLAR_THERMAL_FIELDS[key].initial)]),
) as Record<keyof SolarThermalInputs, string>;

const copy = {
  en: [
    "Solar thermal power tower",
    "Mirrors concentrate direct sunlight on a receiver. Recovered heat drives a steam turbine and generator.",
    "This steady-state lesson uses entered efficiencies and a minimum operating load. It omits thermal storage, startup, ramps and grid dispatch.",
    "Direct normal irradiance",
    "Mirror aperture",
    "Field and receiver efficiency",
    "Net heat-to-power efficiency",
    "Electrical nameplate",
    "Minimum stable load",
    "Incident solar power",
    "Collected heat",
    "Electrical potential",
    "Minimum electrical output",
    "Available electrical output",
    "Enter values within the displayed limits.",
    "Reset solar thermal inputs",
    "Export solar thermal results",
    "U.S. Department of Energy power tower reference",
  ],
  de: [
    "Solarthermisches Turmkraftwerk",
    "Spiegel bündeln direktes Sonnenlicht auf dem Receiver. Die gewonnene Wärme treibt Dampfturbine und Generator an.",
    "Das stationäre Modell verwendet eingegebene Wirkungsgrade und eine Mindestlast. Wärmespeicher, Anfahren, Rampen und Netzdispatch fehlen.",
    "Direkte Normalstrahlung",
    "Spiegelapertur",
    "Wirkungsgrad Spiegelfeld und Receiver",
    "Netto-Wärme-zu-Strom-Wirkungsgrad",
    "Elektrische Nennleistung",
    "Stabile Mindestlast",
    "Einstrahlungsleistung",
    "Gewonnene Wärmeleistung",
    "Elektrisches Potenzial",
    "Elektrische Mindestleistung",
    "Verfügbare elektrische Leistung",
    "Geben Sie Werte innerhalb der angezeigten Grenzen ein.",
    "Solarthermie zurücksetzen",
    "Solarthermie-Ergebnisse exportieren",
    "US-Energieministerium zum Turmkraftwerk",
  ],
  yo: [
    "Ilé agbára ooru oòrùn",
    "Dígí kó ìmọ́lẹ̀ oòrùn taara jọ sí receiver. Ooru tí a gba ń ṣiṣẹ́ turbine àti generator.",
    "Àwòṣe yìí lo efficiency àti ẹrù iṣẹ́ tó kéré jù tí a tẹ̀. Kò ka ìpamọ́ ooru, ìbẹ̀rẹ̀, ramp tàbí grid dispatch sí.",
    "Ìmọ́lẹ̀ oòrùn taara",
    "Agbègbè dígí",
    "Efficiency dígí àti receiver",
    "Efficiency ooru sí iná",
    "Rating iná",
    "Ẹrù iṣẹ́ tó kéré jù",
    "Agbára oòrùn tó wọlé",
    "Ooru tí a gba",
    "Agbára iná tó ṣeé rí",
    "Agbára iná tó kéré jù",
    "Agbára iná tó wà",
    "Tẹ iye tó wà láàárín ààlà.",
    "Dá ìdánwò ooru oòrùn padà",
    "Gba èsì ooru oòrùn",
    "Àlàyé U.S. Department of Energy",
  ],
  pcm: [
    "Solar thermal power tower",
    "Mirror gather direct sunlight for receiver. Di heat drive steam turbine and generator.",
    "Di steady-state lesson use efficiencies and minimum load wey you enter. E leave out heat storage, startup, ramps and grid dispatch.",
    "Direct normal sunlight",
    "Mirror aperture",
    "Field and receiver efficiency",
    "Net heat-to-power efficiency",
    "Electrical rating",
    "Minimum stable load",
    "Sun power wey enter",
    "Heat wey dem collect",
    "Possible electrical output",
    "Minimum electrical output",
    "Available electrical output",
    "Enter values inside di displayed limits.",
    "Reset solar thermal inputs",
    "Export solar thermal results",
    "U.S. Department of Energy power tower reference",
  ],
} satisfies Record<Locale, readonly string[]>;
const units = ["W/m²", "m²", "%", "%", "MW", "%"];

export function SolarThermalExperiment({ locale }: { locale: Locale }) {
  const [draft, setDraft] = useState(defaults);
  const [title, chain, assumptions, ...labels] = copy[locale];
  const inputs = Object.fromEntries(
    fields.map((key) => [key, draft[key] === "" ? NaN : Number(draft[key])]),
  ) as SolarThermalInputs;
  const result = calculateSolarThermal(inputs);
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });

  return (
    <section
      className="panel panel-pad pg-panel"
      aria-labelledby="pg-solar-thermal"
    >
      <h3 id="pg-solar-thermal">{title}</h3>
      <p>{chain}</p>
      <p>{assumptions}</p>
      <div className="pg-fields">
        {fields.map((key, index) => (
          <label className="pg-field" key={key}>
            <span>
              {labels[index]} ({units[index]})
            </span>
            <input
              type="number"
              step="any"
              min={SOLAR_THERMAL_FIELDS[key].min}
              max={SOLAR_THERMAL_FIELDS[key].max}
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
          {Object.entries(result).map(([key, value], index) => (
            <div key={key}>
              <dt>{labels[6 + index]}</dt>
              <dd>{format.format(value)} MW</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p role="status">{labels[11]}</p>
      )}
      <div className="pg-actions">
        <button
          type="button"
          className="button"
          onClick={() => setDraft(defaults)}
        >
          {labels[12]}
        </button>
        <button
          type="button"
          className="button"
          disabled={!result}
          onClick={() =>
            downloadFile(
              "powergrid-solar-thermal.json",
              JSON.stringify(
                {
                  schemaVersion: 1,
                  model: "steady-state-direct-solar-thermal-tower",
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
          {labels[13]}
        </button>
      </div>
      <a href={source} target="_blank" rel="noreferrer">
        {labels[14]}
      </a>
    </section>
  );
}
