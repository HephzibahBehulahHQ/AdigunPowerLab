import { useContext, useMemo, useState } from "react";
import { Download, RotateCcw, Save, Wind } from "lucide-react";
import {
  calculateWindPerformance,
  DEFAULT_WIND_PERFORMANCE_INPUTS,
  validateWindPerformanceInputs,
  type WindPerformanceInputs,
} from "../engine/windPerformance";
import { LanguageContext } from "../i18n";
import type { Locale } from "../i18n";

const INPUT_KEY = "adigunpowerlab.powergrid.wind-performance.v1";
const source = "https://www.nrel.gov/docs/fy17osti/67414.pdf";
const strings: Record<string, [string, string, string]> = {
  "Wind resource and generation experiment": [
    "Windressourcen- und Erzeugungsexperiment",
    "Ìdánwò orísun afẹ́fẹ́ àti ìṣẹ̀dá agbára",
    "Wind resource and generation experiment",
  ],
  "Apply the NREL 6 MW reference-turbine power curve to your interval wind speeds. No site weather is loaded.":
    [
      "Wenden Sie die NREL-Leistungskurve der 6-MW-Referenzanlage auf Ihre Windgeschwindigkeiten an. Es werden keine Standortwetterdaten geladen.",
      "Lo power curve NREL 6 MW reference turbine sí wind speed interval rẹ. A kò gba weather data ibùdó.",
      "Apply di NREL 6 MW reference-turbine power curve to your interval wind speeds. No site weather dey load.",
    ],
  "Wind speed by interval (m/s, comma-separated)": [
    "Windgeschwindigkeit je Intervall (m/s, durch Komma getrennt)",
    "Wind speed fún interval (m/s, fi comma yà wọn)",
    "Wind speed per interval (m/s, use commas)",
  ],
  "Interval duration (h)": [
    "Intervalllänge (h)",
    "Àkókò interval (h)",
    "Interval duration (h)",
  ],
  "Number of identical reference turbines": [
    "Anzahl gleicher Referenzanlagen",
    "Iye reference turbine kan náà",
    "Number of identical reference turbines",
  ],
  "Rated farm power": [
    "Nennleistung des Windparks",
    "Agbára farm ní rated",
    "Rated farm power",
  ],
  "Profile energy": ["Energie des Profils", "Energy profile", "Profile energy"],
  "Mean farm output": [
    "Mittlere Windparkleistung",
    "Agbára farm ní average",
    "Mean farm output",
  ],
  "Profile capacity factor": [
    "Kapazitätsfaktor des Profils",
    "Capacity factor profile",
    "Profile capacity factor",
  ],
  Interval: ["Intervall", "Interval", "Interval"],
  Wind: ["Wind", "Afẹ́fẹ́", "Wind"],
  "Per turbine": ["Je Anlage", "Fún turbine kan", "Per turbine"],
  "Farm output": ["Windparkleistung", "Agbára farm", "Farm output"],
  Energy: ["Energie", "Energy", "Energy"],
  "Save inputs locally": [
    "Eingaben lokal speichern",
    "Fi input pamọ́ sí browser",
    "Save inputs for this browser",
  ],
  "Saved in this browser": [
    "In diesem Browser gespeichert",
    "A fi pamọ́ sínú browser yìí",
    "E don save am for dis browser",
  ],
  "Export wind case JSON": [
    "Windfall als JSON exportieren",
    "Export wind case JSON",
    "Export wind case JSON",
  ],
  "Export wind readings CSV": [
    "Windmesswerte als CSV exportieren",
    "Export wind readings CSV",
    "Export wind readings CSV",
  ],
  "Reset inputs": ["Eingaben zurücksetzen", "Ṣètò input padà", "Reset inputs"],
  "Model and data limits": [
    "Modell- und Datengrenzen",
    "Ààlà model àti data",
    "Model and data limits",
  ],
  "The published NREL 6 MW reference turbine table is linearly interpolated between its supplied points; below the tabulated curve it starts at zero, and the cut-out region follows the published zero-output points.":
    [
      "Die veröffentlichte NREL-Tabelle der 6-MW-Referenzanlage wird zwischen den Messpunkten linear interpoliert; unterhalb der Kurve beginnt die Leistung bei null, der Abschaltbereich folgt den veröffentlichten Nullwerten.",
      "A NREL table fún 6 MW reference turbine ni a ń interpolate láàárín àwọn point rẹ; output bẹ̀rẹ̀ ní zero ní abẹ́ curve, cut-out sì tẹ̀lé àwọn zero point tí a tẹ̀ jáde.",
      "Di published NREL 6 MW reference turbine table dey interpolate between its points; power start from zero below di curve, and cut-out follows di published zero points.",
    ],
  "Wind speeds and interval length are entered teaching inputs, not measured weather. The reference turbine is not a commercial machine or a site-specific yield estimate; air density, shear, turbulence, wakes, availability, electrical losses, curtailment and operating strategy are not modeled.":
    [
      "Windgeschwindigkeiten und Intervalllängen sind eingegebene Lehrwerte, keine gemessenen Wetterdaten. Die Referenzanlage ist keine kommerzielle Maschine und keine standortspezifische Ertragsprognose; Luftdichte, Windscherung, Turbulenz, Nachläufe, Verfügbarkeit, elektrische Verluste, Abregelung und Betriebsstrategie werden nicht modelliert.",
      "Wind speed àti interval jẹ́ input ìkọ́ni tí a tẹ̀ wọlé, kì í ṣe weather tí a wọn. Reference turbine yìí kì í ṣe commercial machine tàbí ìṣírò yield ibi kan; a kò model air density, shear, turbulence, wake, availability, electrical loss, curtailment tàbí operating strategy.",
      "Wind speeds and interval length na teaching inputs wey user enter, no be measured weather. Di reference turbine no be commercial machine or site yield estimate; air density, shear, turbulence, wakes, availability, electrical losses, curtailment and operating strategy no dey modeled.",
    ],
  "Fix invalid values before saving or exporting.": [
    "Ungültige Werte vor dem Speichern oder Export korrigieren.",
    "Ṣàtúnṣe iye tí kò tọ́ kí o tó fi pamọ́ tàbí export.",
    "Fix invalid values before you save or export.",
  ],
};

function text(message: string, locale: Locale) {
  const translated = strings[message];
  if (!translated || locale === "en") return message;
  return locale === "de"
    ? translated[0]
    : locale === "yo"
      ? translated[1]
      : translated[2];
}

function validSaved(value: unknown): value is WindPerformanceInputs {
  if (!value || typeof value !== "object") return false;
  const candidate = value as WindPerformanceInputs;
  return validateWindPerformanceInputs(candidate).length === 0;
}

function saveFile(filename: string, mime: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function WindResourceExperiment() {
  const locale = useContext(LanguageContext);
  const label = (message: string) => text(message, locale);
  const [windText, setWindText] = useState(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem(INPUT_KEY) ?? "null",
      );
      if (validSaved(saved)) return saved.windSpeedsMps.join(", ");
    } catch {
      /* use the editable reference exercise */
    }
    return DEFAULT_WIND_PERFORMANCE_INPUTS.windSpeedsMps.join(", ");
  });
  const [intervalHours, setIntervalHours] = useState(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem(INPUT_KEY) ?? "null",
      );
      if (validSaved(saved)) return saved.intervalHours;
    } catch {
      /* use the editable reference exercise */
    }
    return DEFAULT_WIND_PERFORMANCE_INPUTS.intervalHours;
  });
  const [turbineCount, setTurbineCount] = useState(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem(INPUT_KEY) ?? "null",
      );
      if (validSaved(saved)) return saved.turbineCount;
    } catch {
      /* use the editable reference exercise */
    }
    return DEFAULT_WIND_PERFORMANCE_INPUTS.turbineCount;
  });
  const [saved, setSaved] = useState(false);
  const speeds = useMemo(
    () =>
      windText.trim() === ""
        ? []
        : windText
            .split(",")
            .map((part) => (part.trim() === "" ? Number.NaN : Number(part))),
    [windText],
  );
  const inputs: WindPerformanceInputs = {
    windSpeedsMps: speeds,
    intervalHours,
    turbineCount,
  };
  const errors = useMemo(
    () => validateWindPerformanceInputs(inputs),
    [windText, intervalHours, turbineCount],
  );
  const result = useMemo(
    () => (errors.length ? null : calculateWindPerformance(inputs)),
    [errors, windText, intervalHours, turbineCount],
  );
  const format = (value: number) =>
    new Intl.NumberFormat(locale === "pcm" ? "en-NG" : locale, {
      maximumFractionDigits: 2,
    }).format(value);

  const exportCase = (kind: "json" | "csv") => {
    if (!result) return;
    if (kind === "json") {
      saveFile(
        "powergrid-wind-reference-case.json",
        "application/json",
        JSON.stringify(
          {
            model:
              "nrel-6mw-reference-turbine-tabulated-power-curve-linear-interpolation",
            inputs,
            result,
            source,
            limitations:
              "User-entered wind profile; not site weather, commercial turbine data, or a site-yield forecast.",
          },
          null,
          2,
        ),
      );
    } else {
      const rows = [
        "interval,elapsed_h,wind_speed_mps,power_per_turbine_kW,farm_power_kW,farm_energy_kWh",
        ...result.intervals.map((row) =>
          [
            row.interval,
            row.elapsedHours,
            row.windSpeedMps,
            row.powerPerTurbineKW,
            row.farmPowerKW,
            row.farmEnergyKWh,
          ].join(","),
        ),
      ];
      saveFile(
        "powergrid-wind-readings.csv",
        "text/csv;charset=utf-8",
        rows.join("\r\n"),
      );
    }
  };

  return (
    <section
      className="panel panel-pad pg-panel pg-pv"
      aria-labelledby="pg-wind-title"
    >
      <div className="pg-heading">
        <span className="pg-icon" aria-hidden="true">
          <Wind size={18} />
        </span>
        <div>
          <h3 id="pg-wind-title">
            {label("Wind resource and generation experiment")}
          </h3>
          <p>
            {label(
              "Apply the NREL 6 MW reference-turbine power curve to your interval wind speeds. No site weather is loaded.",
            )}
          </p>
        </div>
      </div>
      <div className="pg-wind-controls">
        <label className="pg-field">
          <span>{label("Wind speed by interval (m/s, comma-separated)")}</span>
          <textarea
            rows={3}
            value={windText}
            onChange={(event) => {
              setWindText(event.currentTarget.value);
              setSaved(false);
            }}
            aria-label={label("Wind speed by interval (m/s, comma-separated)")}
          />
        </label>
        <label className="pg-field">
          <span>{label("Interval duration (h)")}</span>
          <input
            type="number"
            min="0.01"
            max="24"
            step="0.25"
            value={intervalHours}
            onChange={(event) => {
              setIntervalHours(event.currentTarget.valueAsNumber);
              setSaved(false);
            }}
          />
        </label>
        <label className="pg-field">
          <span>{label("Number of identical reference turbines")}</span>
          <input
            type="number"
            min="1"
            max="10000"
            step="1"
            value={turbineCount}
            onChange={(event) => {
              setTurbineCount(event.currentTarget.valueAsNumber);
              setSaved(false);
            }}
          />
        </label>
      </div>
      {errors.length > 0 && (
        <div role="alert" className="pg-errors">
          <ul>
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {result && (
        <>
          <dl className="pg-metrics pg-wind-metrics">
            <div>
              <dt>{label("Rated farm power")}</dt>
              <dd>{format(result.ratedFarmPowerKW)} kW</dd>
            </div>
            <div>
              <dt>{label("Profile energy")}</dt>
              <dd>{format(result.totalEnergyKWh)} kWh</dd>
            </div>
            <div>
              <dt>{label("Mean farm output")}</dt>
              <dd>{format(result.meanPowerKW)} kW</dd>
            </div>
            <div>
              <dt>{label("Profile capacity factor")}</dt>
              <dd>{format(result.capacityFactorPercent)}%</dd>
            </div>
          </dl>
          <div className="pg-table-wrap">
            <table className="pg-wind-table">
              <thead>
                <tr>
                  {[
                    "Interval",
                    "Wind",
                    "Per turbine",
                    "Farm output",
                    "Energy",
                  ].map((label) => (
                    <th key={label}>{text(label, locale)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.intervals.map((row) => (
                  <tr key={row.interval}>
                    <th scope="row">{row.interval}</th>
                    <td>{format(row.windSpeedMps)} m/s</td>
                    <td>{format(row.powerPerTurbineKW)} kW</td>
                    <td>{format(row.farmPowerKW)} kW</td>
                    <td>{format(row.farmEnergyKWh)} kWh</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <details className="panel panel-pad pg-limit">
        <summary>{label("Model and data limits")}</summary>
        <p>
          {label(
            "The published NREL 6 MW reference turbine table is linearly interpolated between its supplied points; below the tabulated curve it starts at zero, and the cut-out region follows the published zero-output points.",
          )}
        </p>
        <p>
          {label(
            "Wind speeds and interval length are entered teaching inputs, not measured weather. The reference turbine is not a commercial machine or a site-specific yield estimate; air density, shear, turbulence, wakes, availability, electrical losses, curtailment and operating strategy are not modeled.",
          )}
        </p>
        <a href={source} target="_blank" rel="noreferrer">
          NREL/TP-6A20-67414 · Appendix D, reference turbine power curves
        </a>
      </details>
      <div className="pg-actions">
        <button
          className="button"
          disabled={!result}
          onClick={() => {
            localStorage.setItem(INPUT_KEY, JSON.stringify(inputs));
            setSaved(true);
          }}
        >
          <Save size={16} />
          {label("Save inputs locally")}
        </button>
        {saved && (
          <span role="status" className="pg-saved">
            {label("Saved in this browser")}
          </span>
        )}
        <button
          className="button"
          disabled={!result}
          onClick={() => exportCase("json")}
        >
          <Download size={16} />
          {label("Export wind case JSON")}
        </button>
        <button
          className="button"
          disabled={!result}
          onClick={() => exportCase("csv")}
        >
          <Download size={16} />
          {label("Export wind readings CSV")}
        </button>
        <button
          className="button"
          onClick={() => {
            setWindText(
              DEFAULT_WIND_PERFORMANCE_INPUTS.windSpeedsMps.join(", "),
            );
            setIntervalHours(DEFAULT_WIND_PERFORMANCE_INPUTS.intervalHours);
            setTurbineCount(DEFAULT_WIND_PERFORMANCE_INPUTS.turbineCount);
            setSaved(false);
          }}
        >
          <RotateCcw size={16} />
          {label("Reset inputs")}
        </button>
      </div>
      {errors.length > 0 && (
        <p className="pg-export-warning" role="status">
          {label("Fix invalid values before saving or exporting.")}
        </p>
      )}
    </section>
  );
}
