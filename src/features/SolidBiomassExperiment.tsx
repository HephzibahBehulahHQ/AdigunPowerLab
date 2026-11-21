import { useState } from "react";
import type { Locale } from "../i18n";
import { downloadFile } from "../import-export/files";
import {
  BIOMASS_FIELDS,
  calculateSolidBiomass,
  MOISTURE_EVAPORATION_MJ_KG,
  type BiomassInputs,
} from "../engine/solidBiomass";

const source =
  "https://www.fpl.fs.usda.gov/documnts/techline/fuel-value-calculator.pdf";
const fields = Object.entries(BIOMASS_FIELDS) as [
  keyof BiomassInputs,
  (typeof BIOMASS_FIELDS)[keyof BiomassInputs],
][];
const defaults = Object.fromEntries(
  fields.map(([key, bounds]) => [key, String(bounds.initial)]),
) as Record<keyof BiomassInputs, string>;
const units = ["kg/h", "%", "MJ/kg", "%", "%", "MW", "MW"];
const outputUnits = ["MJ/kg", "MW", "MW", "kg/h", "MW", "MW", "MW"];
const copy = {
  en: {
    title: "Solid biomass steam generation",
    scope:
      "Wet biomass feeds a boiler, which supplies a steam turbine and generator. Moisture reduces fuel value by displacing dry material and consuming evaporation energy. Electrical nameplate limits gross output and reduces feed used.",
    limits:
      "Moisture is a fraction of total wet mass. This single-point lesson uses fixed efficiencies and subtracts the entered auxiliary demand. Fuel handling, combustion control, ash and emissions are outside the model.",
    fields: [
      "Available wet feed",
      "Wet-basis moisture",
      "Dry fuel lower heating value",
      "Boiler efficiency",
      "Steam cycle efficiency",
      "Gross electrical rating",
      "Auxiliary demand",
    ],
    readings: [
      "Wet fuel lower heating value",
      "Available fuel power",
      "Gross electrical potential",
      "Wet feed used",
      "Heat supplied to steam cycle",
      "Gross electrical output",
      "Net electrical output",
    ],
    invalid: "Enter values within the field limits.",
    reset: "Reset biomass inputs",
    export: "Export biomass results",
    source: "USDA wood fuel heating-value reference",
  },
  de: {
    title: "Dampfkraftwerk mit fester Biomasse",
    scope:
      "Feuchte Biomasse speist den Kessel für Dampfturbine und Generator. Das Wasser ersetzt Trockenmasse und benötigt Verdampfungswärme. Die elektrische Nennleistung begrenzt Bruttoleistung und Brennstoffeinsatz.",
    limits:
      "Die Feuchte bezieht sich auf die gesamte Nassmasse. Das Modell verwendet feste Wirkungsgrade und zieht den Eigenbedarf ab. Brennstoffhandhabung, Feuerungsregelung, Asche und Emissionen fehlen.",
    fields: [
      "Verfügbarer Nassmassenstrom",
      "Feuchte bezogen auf Nassmasse",
      "Heizwert des trockenen Brennstoffs",
      "Kesselwirkungsgrad",
      "Wirkungsgrad des Dampfkreislaufs",
      "Elektrische Bruttonennleistung",
      "Eigenbedarf",
    ],
    readings: [
      "Heizwert des feuchten Brennstoffs",
      "Verfügbare Brennstoffleistung",
      "Elektrisches Bruttopotenzial",
      "Genutzter Nassmassenstrom",
      "Wärme für den Dampfkreislauf",
      "Elektrische Bruttoleistung",
      "Elektrische Nettoleistung",
    ],
    invalid: "Geben Sie Werte innerhalb der Feldgrenzen ein.",
    reset: "Biomasse zurücksetzen",
    export: "Biomasseergebnisse exportieren",
    source: "USDA-Referenz zum Heizwert von Holz",
  },
  yo: {
    title: "Ìmújáde iná láti solid biomass àti steam",
    scope:
      "Biomass olómi ń fún boiler tí ó ń pèsè steam fún turbine àti generator. Omi dín iye ooru idana kù nítorí ó rọ́pò apá gbígbẹ, ó sì nílò ooru láti yí padà sí òru. Rating iná dín agbára gross àti idana tí a lò kù.",
    limits:
      "Ìpín omi jẹ́ apá gbogbo mass olómi. Àwòṣe lo efficiency tó dúró, ó sì yọ agbára tí ẹ̀rọ ń lò kúrò. Kò ṣírò bí a ṣe ń mú idana, combustion control, eérú tàbí emissions.",
    fields: [
      "Ìṣàn idana olómi tó wà",
      "Ìpín omi nínú gbogbo mass",
      "Iye ooru kékeré ti idana gbígbẹ",
      "Efficiency boiler",
      "Efficiency steam cycle",
      "Rating iná gross",
      "Agbára tí ẹ̀rọ ń lò",
    ],
    readings: [
      "Iye ooru kékeré ti idana olómi",
      "Agbára idana tó wà",
      "Agbára iná gross tó ṣeé rí",
      "Idana olómi tí a lò",
      "Ooru fún steam cycle",
      "Agbára iná gross",
      "Agbára iná net",
    ],
    invalid: "Tẹ iye tó wà láàárín ààlà.",
    reset: "Dá iye biomass padà",
    export: "Gba èsì biomass",
    source: "Ìtọ́kasí USDA fún iye ooru igi",
  },
  pcm: {
    title: "Solid biomass steam generation",
    scope:
      "Wet biomass feed boiler wey supply steam turbine and generator. Water replace dry material and use energy to turn to vapour, so e reduce fuel value. Nameplate cap gross power and reduce fuel wey di plant use.",
    limits:
      "Moisture na part of total wet mass. Di model use fixed efficiencies and remove auxiliary demand. E leave out fuel handling, combustion control, ash and emissions.",
    fields: [
      "Wet fuel wey dey available",
      "Moisture for total wet mass",
      "Dry fuel lower heating value",
      "Boiler efficiency",
      "Steam cycle efficiency",
      "Gross electrical rating",
      "Power wey plant use",
    ],
    readings: [
      "Wet fuel lower heating value",
      "Fuel power wey dey available",
      "Possible gross electrical power",
      "Wet fuel wey plant use",
      "Heat wey reach steam cycle",
      "Gross electrical output",
      "Net electrical output",
    ],
    invalid: "Enter values inside di field limits.",
    reset: "Reset biomass inputs",
    export: "Export biomass results",
    source: "USDA wood fuel heating-value reference",
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

export function SolidBiomassExperiment({ locale }: { locale: Locale }) {
  const [draft, setDraft] = useState(defaults);
  const text = copy[locale];
  const inputs = Object.fromEntries(
    fields.map(([key]) => [key, draft[key] === "" ? NaN : Number(draft[key])]),
  ) as BiomassInputs;
  const result = calculateSolidBiomass(inputs);
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 4 });
  return (
    <section className="panel panel-pad pg-panel" aria-labelledby="pg-biomass">
      <h3 id="pg-biomass">{text.title}</h3>
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
              "powergrid-solid-biomass.json",
              JSON.stringify(
                {
                  schemaVersion: 1,
                  model: "steady-state-solid-biomass-steam",
                  moistureEvaporationMJKg: MOISTURE_EVAPORATION_MJ_KG,
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
