import { useState } from "react";
import type { Locale } from "../i18n";
import { downloadFile } from "../import-export/files";
import {
  calculateWaveEnergy,
  WAVE_ENERGY_FIELDS,
  type WaveEnergyInputs,
} from "../engine/waveEnergy";

const source = "https://www.osti.gov/servlets/purl/3014149";
const fields = Object.entries(WAVE_ENERGY_FIELDS) as [
  keyof WaveEnergyInputs,
  (typeof WAVE_ENERGY_FIELDS)[keyof WaveEnergyInputs],
][];
const defaults = Object.fromEntries(
  fields.map(([key, bounds]) => [key, String(bounds.initial)]),
) as Record<keyof WaveEnergyInputs, string>;
const units = ["m", "s", "m", "%", "kW", "m"];
const copy = {
  en: {
    title: "Deep-water wave energy",
    scope:
      "Waves transfer energy to a converter, which drives an electrical generator. The model uses significant wave height and energy period to estimate power per metre of crest. Effective capture width is a user-entered absorption assumption. Output is capped at nameplate and stops at or above the entered shutdown height.",
    limits:
      "This is a single illustrative sea state. It omits depth corrections, a device power matrix, time-varying motion and grid dispatch.",
    fields: [
      "Significant wave height",
      "Wave energy period",
      "Effective capture width",
      "Electrical conversion efficiency",
      "Electrical nameplate",
      "Shutdown wave height",
    ],
    readings: [
      "Wave power per metre",
      "Absorbed power potential",
      "Electrical power potential",
      "Available electrical power",
    ],
    invalid: "Enter values within the field limits.",
    reset: "Reset wave energy inputs",
    export: "Export wave energy results",
    source: "OSTI-hosted deep-water wave flux reference",
  },
  de: {
    title: "Wellenenergie im tiefen Wasser",
    scope:
      "Wellen übertragen Energie auf einen Wandler, der einen Generator antreibt. Signifikante Wellenhöhe und Energieperiode bestimmen die Leistung je Meter Wellenkamm. Die effektive Fangbreite ist eine Eingabe zur Absorption. Die Nennleistung begrenzt die Leistung. Ab der eingegebenen Abschalthöhe steht die Anlage.",
    limits:
      "Ein beispielhafter Seegang. Das Modell verzichtet auf Tiefenkorrekturen, gerätespezifische Leistungsmatrizen, zeitabhängige Bewegungen und Dispatch.",
    fields: [
      "Signifikante Wellenhöhe",
      "Energieperiode",
      "Effektive Fangbreite",
      "Elektrischer Umwandlungswirkungsgrad",
      "Elektrische Nennleistung",
      "Abschaltwellenhöhe",
    ],
    readings: [
      "Wellenleistung je Meter",
      "Mögliche Absorptionsleistung",
      "Mögliche elektrische Leistung",
      "Verfügbare elektrische Leistung",
    ],
    invalid: "Geben Sie Werte innerhalb der Feldgrenzen ein.",
    reset: "Wellenenergie zurücksetzen",
    export: "Wellenergebnisse exportieren",
    source: "OSTI-Referenz zur Wellenleistung im Tiefwasser",
  },
  yo: {
    title: "Agbára ìgbì omi jinlẹ̀",
    scope:
      "Ìgbì ń fún converter ní agbára láti yí generator. Àwòṣe lo gíga ìgbì àti àkókò agbára rẹ̀ láti ṣírò agbára fún mita kan. Effective capture width jẹ́ iye àfojúsùn tí a tẹ̀. Rating dín agbára kù, agbára sì dúró ní gíga ìdádúró tàbí lókè rẹ̀.",
    limits:
      "Ipò omi àpẹẹrẹ kan ni èyí. Àwòṣe kò ka ìjinlẹ̀ tó yàtọ̀, power matrix, ìṣípò pẹ̀lú àkókò tàbí grid dispatch sí.",
    fields: [
      "Gíga ìgbì pàtàkì",
      "Àkókò agbára ìgbì",
      "Fífẹ̀ gba agbára",
      "Efficiency ìyípadà sí iná",
      "Rating iná",
      "Gíga ìgbì ìdádúró",
    ],
    readings: [
      "Agbára ìgbì fún mita",
      "Agbára tí a lè gba",
      "Agbára iná tó ṣeé rí",
      "Agbára iná tó wà",
    ],
    invalid: "Tẹ iye tó wà láàárín ààlà.",
    reset: "Dá iye agbára ìgbì padà",
    export: "Gba èsì agbára ìgbì",
    source: "Ìtọ́kasí OSTI lórí agbára ìgbì omi jinlẹ̀",
  },
  pcm: {
    title: "Deep-water wave energy",
    scope:
      "Wave give converter energy to drive generator. Di model use significant wave height and energy period to estimate power for each metre of crest. Effective capture width na assumption wey you enter. Nameplate cap output and di device stop at shutdown wave height or above.",
    limits:
      "Na one example sea state. E leave out depth correction, device power matrix, changing motion and grid dispatch.",
    fields: [
      "Significant wave height",
      "Wave energy period",
      "Effective capture width",
      "Electrical conversion efficiency",
      "Electrical nameplate",
      "Shutdown wave height",
    ],
    readings: [
      "Wave power per metre",
      "Possible absorbed power",
      "Possible electrical power",
      "Available electrical power",
    ],
    invalid: "Enter values within di field limits.",
    reset: "Reset wave energy inputs",
    export: "Export wave energy results",
    source: "OSTI-hosted deep-water wave flux reference",
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

export function WaveEnergyExperiment({ locale }: { locale: Locale }) {
  const [draft, setDraft] = useState(defaults);
  const text = copy[locale];
  const inputs = Object.fromEntries(
    fields.map(([key]) => [key, draft[key] === "" ? NaN : Number(draft[key])]),
  ) as WaveEnergyInputs;
  const result = calculateWaveEnergy(inputs);
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  return (
    <section
      className="panel panel-pad pg-panel"
      aria-labelledby="pg-wave-energy"
    >
      <h3 id="pg-wave-energy">{text.title}</h3>
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
          {[
            result.crestPowerKWPerM,
            result.absorbedPotentialKW,
            result.electricalPotentialKW,
            result.availableKW,
          ].map((reading, index) => (
            <div key={text.readings[index]}>
              <dt>{text.readings[index]}</dt>
              <dd>
                {format.format(reading)} {index === 0 ? "kW/m" : "kW"}
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
              "powergrid-wave-energy.json",
              JSON.stringify(
                {
                  schemaVersion: 1,
                  model: "deep-water-wave-crest-flux",
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
