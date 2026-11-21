import { useState } from "react";
import type { Locale } from "../i18n";
import { downloadFile } from "../import-export/files";
import {
  calculateFuelCell,
  FUEL_CELL_FIELDS,
  HYDROGEN_LHV_KWH_PER_KG,
  type FuelCellInputs,
} from "../engine/fuelCell";

const source = "https://afdc.energy.gov/fuels/properties";
const fields = Object.entries(FUEL_CELL_FIELDS) as [
  keyof FuelCellInputs,
  (typeof FUEL_CELL_FIELDS)[keyof FuelCellInputs],
][];
const defaults = Object.fromEntries(
  fields.map(([key, bounds]) => [key, String(bounds.initial)]),
) as Record<keyof FuelCellInputs, string>;
const units = ["kg", "kg/h", "h", "%", "kW", "%", "kW", "kW"];
const copy = {
  en: {
    title: "Hydrogen fuel cell generation",
    scope:
      "The fuel cell converts hydrogen chemical energy to DC power, then an inverter supplies AC. The model uses the lower heating value, a finite fuel inventory and constant conversion efficiencies. It reduces fuel use if either electrical rating limits output.",
    limits:
      "This is a steady-interval energy balance. Entered auxiliary demand is deducted even without generation. The model omits hydrogen production, storage-system design, startup, ramps and long-term degradation.",
    fields: [
      "Initial hydrogen inventory",
      "Maximum hydrogen feed",
      "Interval duration",
      "Stack electrical efficiency",
      "Stack DC rating",
      "Inverter efficiency",
      "Inverter AC rating",
      "Auxiliary demand",
    ],
    readings: [
      "Fuel-limited DC potential",
      "Stack DC output",
      "Gross AC output",
      "Net AC output",
      "Hydrogen used",
      "Hydrogen remaining",
    ],
    invalid: "Enter values within the field limits.",
    reset: "Reset fuel cell inputs",
    export: "Export fuel cell results",
    source: "DOE lower heating value reference",
  },
  de: {
    title: "Wasserstoff-Brennstoffzelle",
    scope:
      "Die Brennstoffzelle wandelt chemische Energie in Gleichstrom um. Ein Wechselrichter liefert Wechselstrom. Das Modell nutzt den Heizwert, einen endlichen Vorrat und konstante Wirkungsgrade. Bei einer Leistungsgrenze verbraucht es weniger Brennstoff.",
    limits:
      "Die Energiebilanz gilt für ein konstantes Intervall. Der eingegebene Eigenbedarf wird auch ohne Erzeugung abgezogen. Wasserstoffproduktion, Speicherauslegung, Anfahren, Rampen und Alterung werden nicht berechnet.",
    fields: [
      "Anfänglicher Wasserstoffvorrat",
      "Maximaler Wasserstoffstrom",
      "Intervalldauer",
      "Elektrischer Stackwirkungsgrad",
      "DC-Stacknennleistung",
      "Wechselrichterwirkungsgrad",
      "AC-Wechselrichternennleistung",
      "Eigenbedarf",
    ],
    readings: [
      "Brennstoffbegrenztes DC-Potenzial",
      "DC-Leistung des Stacks",
      "Brutto-AC-Leistung",
      "Netto-AC-Leistung",
      "Verbrauchter Wasserstoff",
      "Verbleibender Wasserstoff",
    ],
    invalid: "Geben Sie Werte innerhalb der Feldgrenzen ein.",
    reset: "Brennstoffzelle zurücksetzen",
    export: "Brennstoffzellenergebnisse exportieren",
    source: "DOE-Referenz zum Heizwert",
  },
  yo: {
    title: "Ìmújáde iná pẹ̀lú hydrogen fuel cell",
    scope:
      "Fuel cell yí agbára kemika hydrogen padà sí DC, inverter sì pèsè AC. Àwòṣe lo iye ooru kékeré, ìpamọ́ idana tó ní ààlà àti efficiency tí kò yí padà. Ó dín lílo idana kù bí rating iná bá di agbára jáde.",
    limits:
      "Ìṣírò agbára fún àkókò kan ni. A yọ agbára tí ilé iṣẹ́ ń lò kúrò bí ìmújáde kò tilẹ̀ sí. Àwòṣe kò ṣírò ìmújáde hydrogen, àpẹrẹ ìpamọ́, ìbẹ̀rẹ̀, ramp tàbí ìbàjẹ́ pẹ̀lú àkókò.",
    fields: [
      "Ìpamọ́ hydrogen ìbẹ̀rẹ̀",
      "Ìṣàn hydrogen tó pọ̀ jù",
      "Gígùn àkókò",
      "Efficiency iná stack",
      "Rating DC stack",
      "Efficiency inverter",
      "Rating AC inverter",
      "Agbára tí ẹ̀rọ ń lò",
    ],
    readings: [
      "Agbára DC lábẹ́ ààlà idana",
      "Agbára DC stack",
      "Agbára AC gross",
      "Agbára AC net",
      "Hydrogen tí a lò",
      "Hydrogen tó kù",
    ],
    invalid: "Tẹ iye tó wà láàárín ààlà.",
    reset: "Dá iye fuel cell padà",
    export: "Gba èsì fuel cell",
    source: "Ìtọ́kasí DOE fún iye ooru kékeré",
  },
  pcm: {
    title: "Hydrogen fuel cell generation",
    scope:
      "Fuel cell turn hydrogen chemical energy to DC power, then inverter supply AC. Di model use lower heating value, limited fuel supply and fixed efficiencies. E use less fuel if electrical rating cap output.",
    limits:
      "Na energy balance for one steady interval. E remove auxiliary demand even if no power dey generate. E leave out hydrogen production, storage design, startup, ramps and long-term wear.",
    fields: [
      "Hydrogen wey dey at start",
      "Maximum hydrogen feed",
      "Interval duration",
      "Stack electrical efficiency",
      "Stack DC rating",
      "Inverter efficiency",
      "Inverter AC rating",
      "Power wey plant use",
    ],
    readings: [
      "Possible DC power from fuel",
      "Stack DC output",
      "Gross AC output",
      "Net AC output",
      "Hydrogen wey dem use",
      "Hydrogen wey remain",
    ],
    invalid: "Enter values inside di field limits.",
    reset: "Reset fuel cell inputs",
    export: "Export fuel cell results",
    source: "DOE lower heating value reference",
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

export function FuelCellExperiment({ locale }: { locale: Locale }) {
  const [draft, setDraft] = useState(defaults);
  const text = copy[locale];
  const inputs = Object.fromEntries(
    fields.map(([key]) => [key, draft[key] === "" ? NaN : Number(draft[key])]),
  ) as FuelCellInputs;
  const result = calculateFuelCell(inputs);
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  return (
    <section
      className="panel panel-pad pg-panel"
      aria-labelledby="pg-fuel-cell"
    >
      <h3 id="pg-fuel-cell">{text.title}</h3>
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
                {format.format(reading)} {index >= 4 ? "kg" : "kW"}
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
              "powergrid-fuel-cell.json",
              JSON.stringify(
                {
                  schemaVersion: 1,
                  model: "steady-interval-hydrogen-fuel-cell",
                  hydrogenLhvKWhKg: HYDROGEN_LHV_KWH_PER_KG,
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
