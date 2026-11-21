import { useState } from "react";
import type { Locale } from "../i18n";
import {
  calculateHydroPerformance,
  DEFAULT_HYDRO_INPUTS,
} from "../engine/hydroPerformance";

const fields = [
  [
    "netHeadM",
    "Net head (m)",
    "Nettofallhöhe (m)",
    "Gíga omi tó kù (m)",
    "Net water head (m)",
  ],
  [
    "flowM3s",
    "Turbine flow (m³/s)",
    "Turbinendurchfluss (m³/s)",
    "Ìṣàn omi turbine (m³/s)",
    "Water flow through turbine (m³/s)",
  ],
  [
    "efficiencyPercent",
    "Combined efficiency (%)",
    "Gesamtwirkungsgrad (%)",
    "Ìmúṣẹ àpapọ̀ (%)",
    "Combined efficiency (%)",
  ],
  [
    "ratedKW",
    "Installed electrical rating (kW)",
    "Elektrische Nennleistung (kW)",
    "Agbára iná tí a fi sílẹ̀ (kW)",
    "Installed electrical rating (kW)",
  ],
] as const;

const storageKey = "adigunpowerlab.powergrid.hydro.v1";
const source = "https://www.energy.gov/documents/28assessingresourcespdf";

function loadInputs() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    if (saved && calculateHydroPerformance(saved))
      return saved as typeof DEFAULT_HYDRO_INPUTS;
  } catch {
    // Use the teaching example if storage is inaccessible or invalid.
  }
  return DEFAULT_HYDRO_INPUTS;
}

export function HydroPerformanceExperiment({ locale }: { locale: Locale }) {
  const [inputs, setInputs] = useState(loadInputs);
  const [saved, setSaved] = useState<boolean | null>(null);
  const result = calculateHydroPerformance(inputs);
  const language =
    locale === "de" ? 1 : locale === "yo" ? 2 : locale === "pcm" ? 3 : 0;
  const hydroText = (...strings: [string, string, string, string]) =>
    strings[language];
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  const title = hydroText(
    "Hydropower head and flow",
    "Wasserkraft: Fallhöhe und Durchfluss",
    "Agbára omi: gíga àti ìṣàn",
    "Hydropower head and water flow",
  );

  return (
    <section
      className="panel panel-pad pg-panel pg-pv"
      aria-labelledby="pg-hydro-heading"
    >
      <h2 id="pg-hydro-heading">{title}</h2>
      <p>
        {hydroText(
          "Net head already accounts for waterway losses. This steady-state model estimates available generator power before grid losses. Reservoir scheduling and dispatch are outside its scope.",
          "Die Nettofallhöhe enthält bereits die Verluste im Wasserweg. Das stationäre Modell schätzt die verfügbare Generatorleistung vor Netzverlusten. Speicherplanung und Einsatzplanung sind nicht enthalten.",
          "Gíga omi tó kù ti ka àdánù ọ̀nà omi. Àwòṣe yìí ṣírò agbára generator tó wà kí àdánù grid tó wáyé. Kò ṣètò ìpamọ́ omi tàbí bí a ṣe ń pín agbára.",
          "Net head don count loss for waterway. This steady-state model estimate generator power wey dey available before grid loss. E no cover reservoir schedule or dispatch.",
        )}
      </p>
      <div className="pg-pv-grid">
        <div className="pg-pv-inputs">
          {fields.map(([key, en, de, yo, pcm]) => (
            <label className="pg-field" key={key}>
              {hydroText(en, de, yo, pcm)}
              <input
                type="number"
                step="any"
                min={0}
                value={Number.isFinite(inputs[key]) ? inputs[key] : ""}
                onChange={(event) => {
                  setInputs({
                    ...inputs,
                    [key]: event.currentTarget.valueAsNumber,
                  });
                  setSaved(null);
                }}
              />
            </label>
          ))}
        </div>
        <div className="pg-pv-results" aria-live="polite">
          {result ? (
            <dl className="pg-metrics pg-pv-metrics">
              <div>
                <dt>
                  {hydroText(
                    "Hydraulic power",
                    "Hydraulische Leistung",
                    "Agbára inú omi",
                    "Water power",
                  )}
                </dt>
                <dd>{format.format(result.hydraulicKW)} kW</dd>
              </div>
              <div>
                <dt>
                  {hydroText(
                    "Electrical power before rating limit",
                    "Elektrische Leistung vor Begrenzung",
                    "Agbára iná ṣáájú ààlà",
                    "Electrical power before rating limit",
                  )}
                </dt>
                <dd>{format.format(result.uncappedElectricalKW)} kW</dd>
              </div>
              <div>
                <dt>
                  {hydroText(
                    "Available generator power",
                    "Verfügbare Generatorleistung",
                    "Agbára generator tó wà",
                    "Generator power wey dey available",
                  )}
                </dt>
                <dd>{format.format(result.availableKW)} kW</dd>
              </div>
            </dl>
          ) : (
            <p className="pg-errors">
              {hydroText(
                "Enter finite nonnegative head and flow, 0–100% efficiency and a positive rating.",
                "Geben Sie endliche, nichtnegative Höhe und Durchfluss, 0–100 % Wirkungsgrad und eine positive Nennleistung ein.",
                "Tẹ gíga àti ìṣàn tí kò kéré ju òdo, ìmúṣẹ 0–100% àti agbára orúkọ tó ju òdo lọ.",
                "Enter head and flow wey no negative, 0–100% efficiency and rating wey pass zero.",
              )}
            </p>
          )}
        </div>
      </div>
      <p>
        {" "}
        P<sub>hyd</sub> = ρgQH · P<sub>available</sub> = min(ηP<sub>hyd</sub>, P
        <sub>rated</sub>) · <a href={source}>NREL</a>
      </p>
      <div className="pg-actions">
        <button
          type="button"
          className="button"
          disabled={!result}
          onClick={() => {
            try {
              localStorage.setItem(storageKey, JSON.stringify(inputs));
              setSaved(true);
            } catch {
              setSaved(false);
            }
          }}
        >
          {hydroText(
            "Save locally",
            "Lokal speichern",
            "Fi pamọ́ sí ẹ̀rọ",
            "Save for this device",
          )}
        </button>
        {result && (
          <a
            className="button"
            download="powergrid-hydro.json"
            href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify({ version: 1, model: "steady-state-hydropower", source, inputs, result }, null, 2))}`}
          >
            {hydroText(
              "Export JSON",
              "JSON exportieren",
              "Gbé JSON jáde",
              "Export JSON",
            )}
          </a>
        )}
        {saved !== null && (
          <span role="status">
            {saved
              ? hydroText("Saved", "Gespeichert", "A ti fipamọ́", "Saved")
              : hydroText(
                  "Save failed",
                  "Speichern fehlgeschlagen",
                  "Ìfipamọ́ kùnà",
                  "Save fail",
                )}
          </span>
        )}
      </div>
    </section>
  );
}
