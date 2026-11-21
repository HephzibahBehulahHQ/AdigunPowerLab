import { useState } from "react";
import type { Locale } from "../i18n";
import { downloadFile } from "../import-export/files";
import {
  BRINE_HEAT_CAPACITY_KJ_KG_K,
  calculateGeothermal,
  GEOTHERMAL_FIELDS,
  type GeothermalInputs,
} from "../engine/geothermal";

const source =
  "https://www.energy.gov/hgeo/geothermal/geothermal-electricity-generation";
const fields = Object.entries(GEOTHERMAL_FIELDS) as [
  keyof GeothermalInputs,
  (typeof GEOTHERMAL_FIELDS)[keyof GeothermalInputs],
][];
const defaults = Object.fromEntries(
  fields.map(([key, bounds]) => [key, String(bounds.initial)]),
) as Record<keyof GeothermalInputs, string>;
const units = ["kg/s", "°C", "°C", "°C", "%", "kW", "kW"];

const copy = {
  en: {
    title: "Binary-cycle geothermal generation",
    chain:
      "Production well → brine heat exchanger → reinjection. A separate working-fluid loop drives a turbine and generator.",
    scope:
      "This steady-state case assumes fixed brine heat capacity and a user-entered cycle efficiency. Net power subtracts the entered plant load. A negative value means the plant needs outside power. The model omits reservoir decline, fluid properties by composition, startup and dispatch.",
    fields: [
      "Brine mass flow",
      "Production temperature",
      "Reinjection temperature",
      "Heat sink temperature",
      "Heat-to-gross-electric efficiency",
      "Gross electrical rating",
      "Plant auxiliary load",
    ],
    readings: [
      "Recovered heat",
      "Gross electrical potential",
      "Rating-limited gross output",
      "Net electrical output",
    ],
    invalid:
      "Check the input limits, production ≥ reinjection ≥ heat sink temperature, and the Carnot efficiency ceiling.",
    reset: "Reset geothermal inputs",
    export: "Export geothermal results",
    source: "DOE geothermal electricity generation reference",
  },
  de: {
    title: "Geothermische Stromerzeugung mit Binärkreislauf",
    chain:
      "Förderbohrung → Solewärmetauscher → Reinjektion. Ein separater Arbeitsmittelkreislauf treibt Turbine und Generator an.",
    scope:
      "Das stationäre Modell nutzt eine konstante Wärmekapazität und einen eingegebenen Wirkungsgrad. Die Nettoleistung zieht den Eigenbedarf ab. Negative Werte bedeuten Fremdbezug. Rückgang der Reservoirleistung, Stoffdaten nach Zusammensetzung, Anfahren und Dispatch fehlen.",
    fields: [
      "Solemassenstrom",
      "Fördertemperatur",
      "Reinjektionstemperatur",
      "Temperatur der Wärmesenke",
      "Wärme-zu-Bruttostrom-Wirkungsgrad",
      "Elektrische Bruttonennleistung",
      "Elektrischer Eigenbedarf",
    ],
    readings: [
      "Gewonnene Wärmeleistung",
      "Elektrisches Bruttopotenzial",
      "Begrenzte Bruttoleistung",
      "Elektrische Nettoleistung",
    ],
    invalid:
      "Prüfen Sie die Eingabegrenzen, Fördertemperatur ≥ Reinjektion ≥ Wärmesenke und die Carnot-Grenze.",
    reset: "Geothermie zurücksetzen",
    export: "Geothermie-Ergebnisse exportieren",
    source: "DOE-Referenz zur geothermischen Stromerzeugung",
  },
  yo: {
    title: "Ìmújáde iná láti ooru abẹ́ ilẹ̀ pẹ̀lú binary cycle",
    chain:
      "Kànga ìmújáde → ẹrọ pàṣípààrọ̀ ooru omi → ìdápadà sínú ilẹ̀. Omi iṣẹ́ lọ́tọ̀ ń yí turbine àti generator.",
    scope:
      "Àwòṣe lo heat capacity tó dúró àti efficiency tí a tẹ̀. A yọ agbára tí ilé iṣẹ́ ń lò láti rí net. Iye odi túmọ̀ sí pé ó nílò iná láti òde. Àwòṣe kò ṣírò ìdínkù orísun, àbùdá omi, ìbẹ̀rẹ̀ tàbí dispatch.",
    fields: [
      "Ìṣàn omi abẹ́ ilẹ̀",
      "Ìwọ̀n ooru ìmújáde",
      "Ìwọ̀n ooru ìdápadà",
      "Ìwọ̀n ooru ibi tí ooru ń lọ",
      "Efficiency ooru sí iná gross",
      "Rating iná gross",
      "Agbára tí ilé iṣẹ́ ń lò",
    ],
    readings: [
      "Ooru tí a gba",
      "Agbára iná gross tó ṣeé rí",
      "Agbára gross lábẹ́ rating",
      "Agbára iná net",
    ],
    invalid:
      "Ṣàyẹ̀wò ààlà iye, ìwọ̀n ooru ìmújáde ≥ ìdápadà ≥ ibi tí ooru ń lọ, àti ààlà Carnot.",
    reset: "Dá iye geothermal padà",
    export: "Gba èsì geothermal",
    source: "Ìtọ́kasí DOE fún agbára geothermal",
  },
  pcm: {
    title: "Binary-cycle geothermal generation",
    chain:
      "Production well → brine heat exchanger → reinjection. Separate working fluid dey drive turbine and generator.",
    scope:
      "Di model use steady brine heat capacity and di cycle efficiency wey you enter. Net power remove power wey plant use. Negative value mean plant need outside power. E leave out reservoir decline, fluid composition, startup and dispatch.",
    fields: [
      "Brine mass flow",
      "Production temperature",
      "Reinjection temperature",
      "Heat sink temperature",
      "Heat-to-gross-electric efficiency",
      "Gross electrical rating",
      "Power wey plant use",
    ],
    readings: [
      "Heat wey dem collect",
      "Possible gross electrical power",
      "Gross output after rating cap",
      "Net electrical output",
    ],
    invalid:
      "Check di limits, production ≥ reinjection ≥ heat sink temperature, and di Carnot efficiency limit.",
    reset: "Reset geothermal inputs",
    export: "Export geothermal results",
    source: "DOE geothermal electricity generation reference",
  },
} satisfies Record<
  Locale,
  {
    title: string;
    chain: string;
    scope: string;
    fields: string[];
    readings: string[];
    invalid: string;
    reset: string;
    export: string;
    source: string;
  }
>;

export function GeothermalExperiment({ locale }: { locale: Locale }) {
  const [draft, setDraft] = useState(defaults);
  const text = copy[locale];
  const inputs = Object.fromEntries(
    fields.map(([key]) => [key, draft[key] === "" ? NaN : Number(draft[key])]),
  ) as GeothermalInputs;
  const result = calculateGeothermal(inputs);
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  return (
    <section
      className="panel panel-pad pg-panel"
      aria-labelledby="pg-geothermal"
    >
      <h3 id="pg-geothermal">{text.title}</h3>
      <p>{text.chain}</p>
      <p>{text.scope}</p>
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
              <dd>{format.format(reading)} kW</dd>
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
              "powergrid-geothermal.json",
              JSON.stringify(
                {
                  schemaVersion: 1,
                  model: "steady-state-binary-geothermal",
                  brineHeatCapacityKJKgK: BRINE_HEAT_CAPACITY_KJ_KG_K,
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
