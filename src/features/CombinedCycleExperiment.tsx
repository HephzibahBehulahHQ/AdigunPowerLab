import { useState } from "react";
import type { Locale } from "../i18n";
import { downloadFile } from "../import-export/files";
import {
  calculateCombinedCycle,
  COMBINED_CYCLE_FIELDS,
  type CombinedCycleInputs,
} from "../engine/combinedCycle";

const source = "https://www.energy.gov/hgeo/how-gas-turbine-power-plants-work";
const fields = Object.entries(COMBINED_CYCLE_FIELDS) as [
  keyof CombinedCycleInputs,
  (typeof COMBINED_CYCLE_FIELDS)[keyof CombinedCycleInputs],
][];
const defaults = Object.fromEntries(
  fields.map(([key, bounds]) => [key, String(bounds.initial)]),
) as Record<keyof CombinedCycleInputs, string>;
const units = ["MW", "%", "%", "%", "MW", "%", "MW", "MW"];
const copy = {
  en: {
    title: "Gas and steam combined cycle",
    scope:
      "Fuel drives the gas turbine. A heat recovery steam generator transfers a fraction of the remaining fuel energy to the steam cycle. At a single operating point, the model caps gross output by fuel and nameplate, and uses zero generation below minimum stable load.",
    limits:
      "The entered auxiliary load is deducted even in standby. Fixed efficiency assumptions omit part-load performance, startup, ramping, fuel composition and emissions.",
    fields: [
      "Available fuel thermal power",
      "Gas turbine electrical efficiency",
      "Residual heat recovery fraction",
      "Steam cycle electrical efficiency",
      "Gross electrical rating",
      "Minimum stable gross output",
      "Requested gross generation",
      "Plant auxiliary load",
    ],
    readings: [
      "Fuel-limited gross potential",
      "Available gross generation",
      "Dispatched gross generation",
      "Thermal fuel used",
      "Gas turbine electrical output",
      "Recovered heat for steam cycle",
      "Steam turbine electrical output",
      "Net electrical output",
    ],
    invalid: "Enter values within the field limits.",
    reset: "Reset combined cycle inputs",
    export: "Export combined cycle results",
    source: "DOE gas turbine power plant reference",
  },
  de: {
    title: "Gas-und-Dampf-Kombikraftwerk",
    scope:
      "Brennstoff treibt die Gasturbine an. Der Abhitzedampferzeuger überträgt einen Anteil der verbleibenden Energie in den Dampfkreislauf. Das Modell begrenzt die Bruttoleistung durch Brennstoff und Nennleistung. Unter der stabilen Mindestlast wird kein Strom erzeugt.",
    limits:
      "Der eingegebene Eigenbedarf wird auch im Bereitschaftsbetrieb abgezogen. Die Wirkungsgrade sind konstant. Teillastverhalten, Anfahren, Rampen, Brennstoffzusammensetzung und Emissionen fehlen.",
    fields: [
      "Verfügbare Brennstoffwärmeleistung",
      "Elektrischer Wirkungsgrad der Gasturbine",
      "Anteil der zurückgewonnenen Restwärme",
      "Elektrischer Wirkungsgrad des Dampfkreislaufs",
      "Elektrische Bruttonennleistung",
      "Stabile Bruttomindestlast",
      "Angeforderte Bruttoleistung",
      "Elektrischer Eigenbedarf",
    ],
    readings: [
      "Brennstoffbegrenztes Bruttopotenzial",
      "Verfügbare Bruttoleistung",
      "Abgerufene Bruttoleistung",
      "Genutzte Brennstoffwärmeleistung",
      "Elektrische Gasturbinenleistung",
      "Gewonnene Wärme für den Dampfkreislauf",
      "Elektrische Dampfturbinenleistung",
      "Elektrische Nettoleistung",
    ],
    invalid: "Geben Sie Werte innerhalb der Feldgrenzen ein.",
    reset: "Kombikraftwerk zurücksetzen",
    export: "Kombikraftwerk-Ergebnisse exportieren",
    source: "DOE-Referenz zu Gasturbinenkraftwerken",
  },
  yo: {
    title: "Ìmújáde iná pẹ̀lú turbine gáàsì àti steam",
    scope:
      "Idana ń ṣiṣẹ́ turbine gáàsì. Ẹ̀rọ ìgbàpadà ooru rán apá ooru tó kù sí steam. Didára idana àti rating dín agbára gross kù. Ní ìsàlẹ̀ ẹrù iṣẹ́ tó kéré jù, agbára jáde jẹ́ òdo.",
    limits:
      "A yọ agbára tí ilé iṣẹ́ ń lò kúrò, kódà ní ìmúrasílẹ̀. Àwòṣe kò ka efficiency tí ẹrù ń yí, ìbẹ̀rẹ̀, ramp, àbùdá idana tàbí emissions sí.",
    fields: [
      "Agbára ooru idana tó wà",
      "Efficiency turbine gáàsì",
      "Ìpín ooru tó kù tí a gba",
      "Efficiency steam cycle",
      "Rating iná gross",
      "Ẹrù gross tó kéré jù",
      "Agbára gross tí a béèrè",
      "Agbára tí ilé iṣẹ́ ń lò",
    ],
    readings: [
      "Agbára gross lábẹ́ ààlà idana",
      "Agbára gross tó wà",
      "Agbára gross tí a pèsè",
      "Agbára ooru idana tí a lò",
      "Agbára iná turbine gáàsì",
      "Ooru tí a gba fún steam",
      "Agbára iná turbine steam",
      "Agbára iná net",
    ],
    invalid: "Tẹ iye tó wà láàárín ààlà.",
    reset: "Dá iye combined cycle padà",
    export: "Gba èsì combined cycle",
    source: "Ìtọ́kasí DOE fún turbine gáàsì",
  },
  pcm: {
    title: "Gas and steam combined cycle",
    scope:
      "Fuel drive gas turbine. Heat recovery boiler send part of di remaining energy to steam cycle. Di model use fuel and nameplate to cap gross output. Generation na zero below minimum stable load.",
    limits:
      "Di model remove plant power use even for standby. Efficiencies stay fixed and e leave out part-load behaviour, startup, ramps, fuel composition and emissions.",
    fields: [
      "Fuel heat power wey dey available",
      "Gas turbine electrical efficiency",
      "Fraction of remaining heat wey dem recover",
      "Steam cycle electrical efficiency",
      "Gross electrical rating",
      "Minimum stable gross output",
      "Requested gross generation",
      "Power wey plant use",
    ],
    readings: [
      "Possible gross power from fuel",
      "Available gross generation",
      "Dispatched gross generation",
      "Fuel heat power wey dem use",
      "Gas turbine electrical output",
      "Recovered heat for steam cycle",
      "Steam turbine electrical output",
      "Net electrical output",
    ],
    invalid: "Enter values inside di field limits.",
    reset: "Reset combined cycle inputs",
    export: "Export combined cycle results",
    source: "DOE gas turbine power plant reference",
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

export function CombinedCycleExperiment({ locale }: { locale: Locale }) {
  const [draft, setDraft] = useState(defaults);
  const text = copy[locale];
  const inputs = Object.fromEntries(
    fields.map(([key]) => [key, draft[key] === "" ? NaN : Number(draft[key])]),
  ) as CombinedCycleInputs;
  const result = calculateCombinedCycle(inputs);
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  return (
    <section
      className="panel panel-pad pg-panel"
      aria-labelledby="pg-combined-cycle"
    >
      <h3 id="pg-combined-cycle">{text.title}</h3>
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
              <dd>{format.format(reading)} MW</dd>
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
              "powergrid-combined-cycle.json",
              JSON.stringify(
                {
                  schemaVersion: 1,
                  model: "steady-state-combined-cycle",
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
