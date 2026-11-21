import { useState } from "react";
import {
  calculateTidalStream,
  TIDAL_SEAWATER_DENSITY_KG_M3,
  TIDAL_STREAM_FIELDS,
  type TidalStreamInputs,
} from "../engine/tidalStream";
import type { Locale } from "../i18n";
import { downloadFile } from "../import-export/files";

const source =
  "https://www.energy.gov/sites/default/files/2013/12/f5/1023527.pdf";
const fields = Object.entries(TIDAL_STREAM_FIELDS) as [
  keyof TidalStreamInputs,
  (typeof TIDAL_STREAM_FIELDS)[keyof TidalStreamInputs],
][];
const defaults = Object.fromEntries(
  fields.map(([key, bounds]) => [key, String(bounds.initial)]),
) as Record<keyof TidalStreamInputs, string>;
const units = ["m/s", "m²", "%", "%", "kW", "m/s", "m/s"];
const copy = {
  en: {
    title: "Tidal stream turbine",
    model:
      "A tidal current turns a rotor and generator. This fixed-density teaching model uses current speed, a constant rotor capture fraction and drivetrain efficiency. The nameplate caps output. At or above cut-out speed, the turbine is stopped.",
    limits:
      "The inputs are illustrative. The model omits tides over time, waves, direction changes, wakes and grid dispatch.",
    fields: [
      "Current speed",
      "Rotor swept area",
      "Rotor capture fraction",
      "Drivetrain efficiency",
      "Electrical nameplate",
      "Cut-in speed",
      "Cut-out speed",
    ],
    readings: [
      "Flow power through rotor area",
      "Potential shaft power",
      "Potential electrical power",
      "Available electrical power",
    ],
    invalid:
      "Enter values within the stated limits and set cut-out above cut-in.",
    reset: "Reset tidal stream inputs",
    export: "Export tidal stream results",
    source: "DOE tidal stream resource assessment",
  },
  de: {
    title: "Gezeitenströmungsturbine",
    model:
      "Die Gezeitenströmung treibt Rotor und Generator an. Das Lehrmodell nutzt eine konstante Dichte, Strömungsgeschwindigkeit, Rotorleistungsbeiwert und Antriebswirkungsgrad. Die Nennleistung begrenzt die Leistung. Ab der Abschaltgeschwindigkeit steht die Turbine.",
    limits:
      "Die Eingaben sind beispielhaft. Das Modell vernachlässigt den zeitlichen Tidenverlauf, Wellen, Richtungswechsel, Nachläufe und Netzdispatch.",
    fields: [
      "Strömungsgeschwindigkeit",
      "Rotorfläche",
      "Rotorleistungsbeiwert",
      "Antriebswirkungsgrad",
      "Elektrische Nennleistung",
      "Einschaltgeschwindigkeit",
      "Abschaltgeschwindigkeit",
    ],
    readings: [
      "Strömungsleistung durch Rotorfläche",
      "Mögliche Wellenleistung",
      "Mögliche elektrische Leistung",
      "Verfügbare elektrische Leistung",
    ],
    invalid:
      "Geben Sie Werte innerhalb der Grenzen ein und setzen Sie die Abschaltgeschwindigkeit über die Einschaltgeschwindigkeit.",
    reset: "Gezeitenströmung zurücksetzen",
    export: "Gezeitenergebnisse exportieren",
    source: "DOE-Bewertung der Gezeitenströmung",
  },
  yo: {
    title: "Turbine ìṣàn omi òkun",
    model:
      "Ìṣàn omi òkun ń yí rotor àti generator. Àwòṣe lo iyára omi, ìpín agbára tí rotor gba àti efficiency. Rating dín agbára jáde kù. Turbine dúró ní iyára cut-out tàbí lókè rẹ̀.",
    limits:
      "Iye àpẹẹrẹ ni wọ́n. Àwòṣe kò ka ìyípadà omi pẹ̀lú àkókò, ìgbì, ìtọ́sọ́nà, wakes tàbí dispatch sí.",
    fields: [
      "Iyára omi",
      "Agbègbè rotor",
      "Ìpín tí rotor gba",
      "Efficiency drivetrain",
      "Rating iná",
      "Iyára ìbẹ̀rẹ̀",
      "Iyára ìdádúró",
    ],
    readings: [
      "Agbára omi tó kọjá rotor",
      "Agbára shaft tó ṣeé rí",
      "Agbára iná tó ṣeé rí",
      "Agbára iná tó wà",
    ],
    invalid:
      "Tẹ iye tó wà láàárín ààlà. Iyára ìdádúró gbọ́dọ̀ ju iyára ìbẹ̀rẹ̀ lọ.",
    reset: "Dá ìdánwò omi òkun padà",
    export: "Gba èsì omi òkun",
    source: "Ìwádìí DOE lórí ìṣàn omi òkun",
  },
  pcm: {
    title: "Tidal stream turbine",
    model:
      "Tidal current turn rotor and generator. Di teaching model use steady water density, current speed, rotor capture fraction and drivetrain efficiency. Nameplate cap output, and turbine stop for cut-out speed or above.",
    limits:
      "Di inputs na examples. Di model leave out tide over time, waves, direction changes, wakes and grid dispatch.",
    fields: [
      "Current speed",
      "Rotor area",
      "Rotor capture fraction",
      "Drivetrain efficiency",
      "Electrical nameplate",
      "Cut-in speed",
      "Cut-out speed",
    ],
    readings: [
      "Water power wey pass rotor",
      "Possible shaft power",
      "Possible electrical power",
      "Available electrical power",
    ],
    invalid:
      "Enter values within di limits. Cut-out speed must pass cut-in speed.",
    reset: "Reset tidal stream inputs",
    export: "Export tidal stream results",
    source: "DOE tidal stream resource assessment",
  },
} satisfies Record<
  Locale,
  {
    title: string;
    model: string;
    limits: string;
    fields: string[];
    readings: string[];
    invalid: string;
    reset: string;
    export: string;
    source: string;
  }
>;

export function TidalStreamExperiment({ locale }: { locale: Locale }) {
  const [draft, setDraft] = useState(defaults);
  const text = copy[locale];
  const inputs = Object.fromEntries(
    fields.map(([key]) => [key, draft[key] === "" ? NaN : Number(draft[key])]),
  ) as TidalStreamInputs;
  const result = calculateTidalStream(inputs);
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });

  return (
    <section
      className="panel panel-pad pg-panel"
      aria-labelledby="pg-tidal-stream"
    >
      <h3 id="pg-tidal-stream">{text.title}</h3>
      <p>{text.model}</p>
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
            result.flowKW,
            result.shaftPotentialKW,
            result.electricalPotentialKW,
            result.availableKW,
          ].map((reading, index) => (
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
              "powergrid-tidal-stream.json",
              JSON.stringify(
                {
                  schemaVersion: 1,
                  model: "fixed-density-tidal-stream-turbine",
                  densityKgM3: TIDAL_SEAWATER_DENSITY_KG_M3,
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
