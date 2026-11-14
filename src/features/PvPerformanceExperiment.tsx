import { useContext, useMemo, useState } from "react";
import { Download, Save, RotateCcw, Sun } from "lucide-react";
import {
  calculatePvPerformance,
  DEFAULT_PV_PERFORMANCE_INPUTS,
  validatePvPerformanceInputs,
  type PvPerformanceInputs,
} from "../engine/pvPerformance";
import { LanguageContext } from "../i18n";
import type { Locale } from "../i18n";

const INPUT_KEY = "adigunpowerlab.powergrid.pv-performance.v1";
const REFERENCE_KEY = "adigunpowerlab.powergrid.pv-reference.v1";
const nrelReference = "https://pvwatts.nrel.gov/downloads/pvwattsv5.pdf";
const sandiaReference =
  "https://pvpmc.sandia.gov/modeling-guide/2-dc-module-iv/cell-temperature/sandia-cell-temperature-model/";

const pvText: Record<string, [string, string, string]> = {
  "PV source performance experiment": [
    "PV-Erzeugungsmodell",
    "Ìdánwò iṣẹ́ PV",
    "PV source performance experiment",
  ],
  "Instantaneous PVWatts-style teaching calculation. Enter the environment values; no weather data is fetched.":
    [
      "Momentane Lehrberechnung nach PVWatts. Geben Sie die Umgebungswerte ein; es werden keine Wetterdaten abgerufen.",
      "Ìṣirò ìkọ́ni PVWatts fún àkókò kan. Tẹ àwọn iye àyíká sínú; a kò gba weather data.",
      "Instantaneous PVWatts-style teaching calculation. Enter the environment values; no weather data dey fetched.",
    ],
  "DC nameplate capacity (kW)": [
    "DC-Nennleistung (kW)",
    "Agbára orúkọ DC (kW)",
    "DC nameplate capacity (kW)",
  ],
  "Inverter AC rating (kW)": [
    "AC-Nennleistung des Wechselrichters (kW)",
    "Agbára AC inverter (kW)",
    "Inverter AC rating (kW)",
  ],
  "Plane-of-array irradiance (W/m²)": [
    "Einstrahlung in Modulebene (W/m²)",
    "Ìmọ́lẹ̀ oorun lórí panel (W/m²)",
    "Plane-of-array irradiance (W/m²)",
  ],
  "Module temperature (°C)": [
    "Modultemperatur (°C)",
    "Ooru module (°C)",
    "Module temperature (°C)",
  ],
  "Cell-to-module temperature rise at 1000 W/m² (°C)": [
    "Temperaturdifferenz Zelle zu Modul bei 1000 W/m² (°C)",
    "Ìyàtọ̀ ooru cell sí module ní 1000 W/m² (°C)",
    "Cell-to-module temperature rise at 1000 W/m² (°C)",
  ],
  "Power temperature coefficient (per °C)": [
    "Leistungstemperaturkoeffizient (je °C)",
    "Temperature coefficient agbára (fún °C kan)",
    "Power temperature coefficient (per °C)",
  ],
  "Inverter efficiency (0–1)": [
    "Wechselrichterwirkungsgrad (0–1)",
    "Efficiency inverter (0–1)",
    "Inverter efficiency (0–1)",
  ],
  "Calculated instruments": [
    "Berechnete Messwerte",
    "Àwọn ìwọ̀n tí a ṣírò",
    "Calculated instruments",
  ],
  "Cell temperature": ["Zelltemperatur", "Ooru cell", "Cell temperature"],
  "Temperature correction": [
    "Temperaturkorrektur",
    "Àtúnṣe temperature",
    "Temperature correction",
  ],
  "PV array DC output": [
    "DC-Ausgangsleistung des PV-Felds",
    "DC output PV array",
    "PV array DC output",
  ],
  "Inverter AC before limit": [
    "AC-Leistung vor Begrenzung",
    "AC inverter kí limit tó wọlé",
    "Inverter AC before limit",
  ],
  "Delivered AC output": [
    "AC-Ausgang",
    "AC output tí a pèsè",
    "Delivered AC output",
  ],
  "Conversion loss": [
    "Umwandlungsverlust",
    "Pàdánù conversion",
    "Conversion loss",
  ],
  "Inverter clipping": [
    "Wechselrichterbegrenzung",
    "Clipping inverter",
    "Inverter clipping",
  ],
  "Saved reference": [
    "Gespeicherte Referenz",
    "Reference tí a pamọ́",
    "Saved reference",
  ],
  "Saved in this browser": [
    "In diesem Browser gespeichert",
    "A fi pamọ́ nínú browser yìí",
    "E don save am for this browser",
  ],
  "Save current case as reference": [
    "Aktuellen Fall als Referenz speichern",
    "Fi case yìí pamọ́ gẹ́gẹ́ bí reference",
    "Save current case as reference",
  ],
  "Save inputs locally": [
    "Eingaben lokal speichern",
    "Fi àwọn input pamọ́ sínú browser",
    "Save inputs locally",
  ],
  "Export PV case JSON": [
    "PV-Fall als JSON exportieren",
    "Export PV case JSON",
    "Export PV case JSON",
  ],
  "Export PV readings CSV": [
    "PV-Messwerte als CSV exportieren",
    "Export àwọn ìwọ̀n PV bí CSV",
    "Export PV readings CSV",
  ],
  "Reset inputs": ["Eingaben zurücksetzen", "Ṣètò input padà", "Reset inputs"],
  "Model assumptions and limits": [
    "Modellannahmen und Grenzen",
    "Àwọn àfojúsùn àti ààlà model",
    "Model assumptions and limits",
  ],
  "Estimated cell temperature uses the Sandia steady-state relation. DC array power uses the NREL PVWatts linear irradiance and temperature relation. Entered inverter efficiency and AC rating determine conversion loss and clipping.":
    [
      "Die Zelltemperatur folgt der stationären Sandia-Beziehung. Die DC-Leistung folgt der linearen NREL-PVWatts-Beziehung für Einstrahlung und Temperatur. Der eingegebene Wechselrichterwirkungsgrad und die AC-Nennleistung bestimmen Umwandlungsverlust und Begrenzung.",
      "Cell temperature ń lo Sandia steady-state relation. DC array power ń lo NREL PVWatts linear irradiance àti temperature relation. Inverter efficiency àti AC rating tí a tẹ̀ wọlé ló pinnu conversion loss àti clipping.",
      "Estimated cell temperature uses the Sandia steady-state relation. DC array power uses the NREL PVWatts linear irradiance and temperature relation. Entered inverter efficiency and AC rating determine conversion loss and clipping.",
    ],
  "No weather, shading, array orientation, module IV curve, mismatch, wiring loss, transient response, degradation, or annual energy is modeled.":
    [
      "Wetter, Verschattung, Ausrichtung, Modul-IV-Kurve, Mismatch, Leitungsverluste, Transienten, Alterung und Jahresenergie werden nicht modelliert.",
      "A kò model weather, shading, array orientation, module IV curve, mismatch, wiring loss, transient response, degradation, tàbí annual energy.",
      "No weather, shading, array orientation, module IV curve, mismatch, wiring loss, transient response, degradation, or annual energy dey modeled.",
    ],
  "Reference AC output": [
    "AC-Ausgang der Referenz",
    "AC output reference",
    "Reference AC output",
  ],
  "AC output change": [
    "Änderung der AC-Leistung",
    "Ìyípadà AC output",
    "AC output change",
  ],
  "Save and export are disabled until all model inputs are valid.": [
    "Speichern und Exportieren sind deaktiviert, solange Eingaben ungültig sind.",
    "Save àti export kò ṣiṣẹ́ títí gbogbo input model yóò fi pé.",
    "Save and export no go work until all model inputs valid.",
  ],
  "Sandia PVPMC cell-temperature relation": [
    "Sandia-PVPMC-Zelltemperaturbeziehung",
    "Sandia PVPMC cell-temperature relation",
    "Sandia PVPMC cell-temperature relation",
  ],
  "NREL PVWatts V5 manual": [
    "NREL-PVWatts-V5-Handbuch",
    "NREL PVWatts V5 manual",
    "NREL PVWatts V5 manual",
  ],
  "DC nameplate capacity must be a finite positive value.": [
    "Die DC-Nennleistung muss endlich und positiv sein.",
    "DC nameplate capacity gbọ́dọ̀ jẹ́ iye rere tó ní ààlà.",
    "DC nameplate capacity must be finite and positive.",
  ],
  "Inverter AC rating must be a finite positive value.": [
    "Die AC-Nennleistung des Wechselrichters muss endlich und positiv sein.",
    "Inverter AC rating gbọ́dọ̀ jẹ́ iye rere tó ní ààlà.",
    "Inverter AC rating must be finite and positive.",
  ],
  "Plane-of-array irradiance must be from 0 to 1500 W/m².": [
    "Die Einstrahlung in Modulebene muss zwischen 0 und 1500 W/m² liegen.",
    "Irradiance lórí panel gbọ́dọ̀ wà láàárín 0 àti 1500 W/m².",
    "Irradiance on panel must dey between 0 and 1500 W/m².",
  ],
  "Module temperature must be from -40 to 100 °C.": [
    "Die Modultemperatur muss zwischen -40 und 100 °C liegen.",
    "Ooru module gbọ́dọ̀ wà láàárín -40 àti 100 °C.",
    "Module temperature must dey between -40 and 100 °C.",
  ],
  "Cell-to-module temperature rise must be from -15 to 15 °C.": [
    "Der Temperaturanstieg von Zelle zu Modul muss zwischen -15 und 15 °C liegen.",
    "Cell-to-module temperature rise gbọ́dọ̀ wà láàárín -15 àti 15 °C.",
    "Cell-to-module temperature rise must dey between -15 and 15 °C.",
  ],
  "Power temperature coefficient must be from -0.01 to 0 per °C.": [
    "Der Leistungstemperaturkoeffizient muss zwischen -0,01 und 0 je °C liegen.",
    "Power temperature coefficient gbọ́dọ̀ wà láàárín -0.01 àti 0 fún °C kan.",
    "Power temperature coefficient must dey between -0.01 and 0 per °C.",
  ],
  "Inverter efficiency must be greater than 0 and at most 1.": [
    "Der Wechselrichterwirkungsgrad muss über 0 und höchstens 1 liegen.",
    "Efficiency inverter gbọ́dọ̀ ju 0 lọ, kò sì gbọ́dọ̀ ju 1 lọ.",
    "Inverter efficiency must pass 0 and must no pass 1.",
  ],
};

function pvTranslate(message: string, locale: Locale): string {
  if (locale === "en") return message;
  const index = locale === "de" ? 0 : locale === "yo" ? 1 : 2;
  return pvText[message]?.[index] ?? message;
}

function readInputs(value: string | null): PvPerformanceInputs | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as Record<string, unknown>;
    const keys = Object.keys(DEFAULT_PV_PERFORMANCE_INPUTS);
    if (
      keys.some((key) => typeof record[key] !== "number") ||
      validatePvPerformanceInputs(record as unknown as PvPerformanceInputs)
        .length > 0
    )
      return null;
    return record as unknown as PvPerformanceInputs;
  } catch {
    return null;
  }
}

const fields: Array<{
  key: keyof PvPerformanceInputs;
  label: string;
  min: number;
  max: number;
  step: number;
}> = [
  {
    key: "dcNameplateKW",
    label: "DC nameplate capacity (kW)",
    min: 0.1,
    max: 1e6,
    step: 1,
  },
  {
    key: "inverterAcRatingKW",
    label: "Inverter AC rating (kW)",
    min: 0.1,
    max: 1e6,
    step: 1,
  },
  {
    key: "planeOfArrayIrradianceWm2",
    label: "Plane-of-array irradiance (W/m²)",
    min: 0,
    max: 1500,
    step: 10,
  },
  {
    key: "moduleTemperatureC",
    label: "Module temperature (°C)",
    min: -40,
    max: 100,
    step: 1,
  },
  {
    key: "cellToModuleDeltaTC",
    label: "Cell-to-module temperature rise at 1000 W/m² (°C)",
    min: -15,
    max: 15,
    step: 0.5,
  },
  {
    key: "powerTemperatureCoefficientPerC",
    label: "Power temperature coefficient (per °C)",
    min: -0.01,
    max: 0,
    step: 0.0001,
  },
  {
    key: "inverterEfficiency",
    label: "Inverter efficiency (0–1)",
    min: 0.8,
    max: 1,
    step: 0.001,
  },
];

function number(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "pcm" ? "en-NG" : locale, {
    maximumFractionDigits: 3,
  }).format(value);
}

function saveFile(name: string, type: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function PvPerformanceExperiment() {
  const locale = useContext(LanguageContext);
  const copy = (message: string) => pvTranslate(message, locale);
  const [inputs, setInputs] = useState<PvPerformanceInputs>(
    () =>
      readInputs(localStorage.getItem(INPUT_KEY)) ??
      DEFAULT_PV_PERFORMANCE_INPUTS,
  );
  const [reference, setReference] = useState<PvPerformanceInputs | null>(() =>
    readInputs(localStorage.getItem(REFERENCE_KEY)),
  );
  const [saved, setSaved] = useState(false);
  const errors = useMemo(() => validatePvPerformanceInputs(inputs), [inputs]);
  const result = useMemo(
    () => (errors.length === 0 ? calculatePvPerformance(inputs) : null),
    [errors, inputs],
  );
  const referenceResult = useMemo(
    () =>
      reference && validatePvPerformanceInputs(reference).length === 0
        ? calculatePvPerformance(reference)
        : null,
    [reference],
  );

  const update = (key: keyof PvPerformanceInputs, value: string) => {
    const numeric = value.trim() === "" ? Number.NaN : Number(value);
    setInputs((current) => ({ ...current, [key]: numeric }));
    setSaved(false);
  };
  const exportResult = (format: "json" | "csv") => {
    if (!result) return;
    if (format === "json") {
      saveFile(
        "powergrid-pv-performance.json",
        "application/json",
        JSON.stringify(
          {
            model: "steady-state-pvwatts-style-instantaneous",
            inputs,
            result,
            comparison: referenceResult,
            comparisonReferenceInputs: reference,
            sourceReferences: [nrelReference, sandiaReference],
            limitations:
              "No weather retrieval, annual energy, shading, IV curve, mismatch, wiring loss or transient model.",
          },
          null,
          2,
        ),
      );
      return;
    }
    const rows: Array<[string, string, string]> = [
      ["quantity", "value", "unit"],
      ["cell temperature", String(result.cellTemperatureC), "degC"],
      ["temperature factor", String(result.temperatureFactor), "1"],
      ["array DC output", String(result.dcPowerKW), "kW"],
      [
        "inverter AC before limit",
        String(result.inverterAcBeforeLimitKW),
        "kW",
      ],
      ["delivered AC output", String(result.acPowerKW), "kW"],
      ["conversion loss", String(result.conversionLossKW), "kW"],
      ["inverter clipping", String(result.clippingKW), "kW"],
    ];
    saveFile(
      "powergrid-pv-readings.csv",
      "text/csv;charset=utf-8",
      rows
        .map((row) =>
          row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
        )
        .join("\r\n"),
    );
  };

  return (
    <section
      className="panel panel-pad pg-panel pg-pv"
      aria-labelledby="pg-pv-title"
    >
      <div className="pg-heading">
        <span className="pg-icon" aria-hidden="true">
          <Sun size={18} />
        </span>
        <div>
          <h3 id="pg-pv-title">{copy("PV source performance experiment")}</h3>
          <p>
            {copy(
              "Instantaneous PVWatts-style teaching calculation. Enter the environment values; no weather data is fetched.",
            )}
          </p>
        </div>
      </div>
      <div className="pg-pv-grid">
        <div className="pg-pv-inputs">
          {fields.map((field) => (
            <label className="pg-field" key={field.key}>
              <span>{copy(field.label)}</span>
              <input
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                value={
                  Number.isFinite(inputs[field.key]) ? inputs[field.key] : ""
                }
                onChange={(event) => update(field.key, event.target.value)}
                aria-label={copy(field.label)}
              />
            </label>
          ))}
        </div>
        <div className="pg-pv-results">
          <h4>{copy("Calculated instruments")}</h4>
          {result ? (
            <dl className="pg-metrics pg-pv-metrics">
              <div>
                <dt>{copy("Cell temperature")}</dt>
                <dd>{number(result.cellTemperatureC, locale)} °C</dd>
              </div>
              <div>
                <dt>{copy("Temperature correction")}</dt>
                <dd>{number(result.temperatureFactor, locale)}</dd>
              </div>
              <div>
                <dt>{copy("PV array DC output")}</dt>
                <dd>{number(result.dcPowerKW, locale)} kW</dd>
              </div>
              <div>
                <dt>{copy("Inverter AC before limit")}</dt>
                <dd>{number(result.inverterAcBeforeLimitKW, locale)} kW</dd>
              </div>
              <div>
                <dt>{copy("Delivered AC output")}</dt>
                <dd>{number(result.acPowerKW, locale)} kW</dd>
              </div>
              <div>
                <dt>{copy("Conversion loss")}</dt>
                <dd>{number(result.conversionLossKW, locale)} kW</dd>
              </div>
              <div>
                <dt>{copy("Inverter clipping")}</dt>
                <dd>{number(result.clippingKW, locale)} kW</dd>
              </div>
            </dl>
          ) : (
            <div className="pg-errors" role="status">
              {errors.map((error) => pvTranslate(error, locale)).join(" ")}
            </div>
          )}
          {referenceResult && result && (
            <p className="pg-pv-reference" role="status">
              {copy("Saved reference")}:{" "}
              {number(referenceResult.acPowerKW, locale)} kW;{" "}
              {copy("AC output change")}:{" "}
              {number(result.acPowerKW - referenceResult.acPowerKW, locale)} kW
            </p>
          )}
        </div>
      </div>
      <details className="panel panel-pad pg-limit">
        <summary>{copy("Model assumptions and limits")}</summary>
        <p>
          {copy(
            "Estimated cell temperature uses the Sandia steady-state relation. DC array power uses the NREL PVWatts linear irradiance and temperature relation. Entered inverter efficiency and AC rating determine conversion loss and clipping.",
          )}
        </p>
        <p>
          {copy(
            "No weather, shading, array orientation, module IV curve, mismatch, wiring loss, transient response, degradation, or annual energy is modeled.",
          )}
        </p>
        <p>
          <a href={sandiaReference} target="_blank" rel="noreferrer">
            {copy("Sandia PVPMC cell-temperature relation")}
          </a>{" "}
          ·{" "}
          <a href={nrelReference} target="_blank" rel="noreferrer">
            {copy("NREL PVWatts V5 manual")}
          </a>
        </p>
      </details>
      <div className="pg-actions">
        <button
          className="button"
          disabled={!result}
          onClick={() => {
            localStorage.setItem(REFERENCE_KEY, JSON.stringify(inputs));
            setReference(inputs);
          }}
        >
          <Save size={16} />
          {copy("Save current case as reference")}
        </button>
        <button
          className="button"
          disabled={errors.length > 0}
          onClick={() => {
            localStorage.setItem(INPUT_KEY, JSON.stringify(inputs));
            setSaved(true);
          }}
        >
          <Save size={16} />
          {copy("Save inputs locally")}
        </button>
        {saved && (
          <span role="status" className="pg-saved">
            {copy("Saved in this browser")}
          </span>
        )}
        <button
          className="button"
          disabled={!result}
          onClick={() => exportResult("json")}
        >
          <Download size={16} />
          {copy("Export PV case JSON")}
        </button>
        <button
          className="button"
          disabled={!result}
          onClick={() => exportResult("csv")}
        >
          <Download size={16} />
          {copy("Export PV readings CSV")}
        </button>
        <button
          className="button"
          onClick={() => {
            setInputs(DEFAULT_PV_PERFORMANCE_INPUTS);
            setSaved(false);
          }}
        >
          <RotateCcw size={16} />
          {copy("Reset inputs")}
        </button>
      </div>
      {errors.length > 0 && (
        <p className="pg-export-warning" role="status">
          {copy(
            "Save and export are disabled until all model inputs are valid.",
          )}
        </p>
      )}
    </section>
  );
}
