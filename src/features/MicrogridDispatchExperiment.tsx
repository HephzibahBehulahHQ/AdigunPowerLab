import { useContext, useMemo, useState } from "react";
import { Download, RotateCcw, Save, SunMedium } from "lucide-react";
import {
  calculateMicrogridDispatch,
  DEFAULT_MICROGRID_DISPATCH_INPUTS,
  validateMicrogridDispatchInputs,
  type MicrogridDispatchInputs,
} from "../engine/microgridDispatch";
import type { PvPerformanceInputs } from "../engine/pvPerformance";
import { LanguageContext } from "../i18n";
import type { Locale } from "../i18n";

const INPUT_KEY = "adigunpowerlab.powergrid.microgrid-dispatch.v1";
const LIMITS =
  "This is an illustrative AC-bus dispatch, not a site forecast or utility operation model. No feeder/transformer losses, exports, fuel use, costs, emissions, frequency response or unit-specific generator model are included. Entered profiles are assumptions. Generic backup capacity is dispatched after storage with the entered ramp-up ceiling; ramp-down is instantaneous.";
const pvDefaults = DEFAULT_MICROGRID_DISPATCH_INPUTS.pvByInterval[0];
const copy: Record<string, [string, string, string]> = {
  "Microgrid dispatch laboratory": [
    "Mikronetz-Dispatch-Labor",
    "Yàrá dispatch microgrid",
    "Microgrid dispatch laboratory",
  ],
  "Combine PV, wind, storage and critical demand across equal time intervals.":
    [
      "Kombinieren Sie PV, Wind, Speicher und kritische Lasten über gleich lange Zeitintervalle.",
      "So PV, wind, storage àti critical demand pọ̀ fún interval tó dọ́gba.",
      "Join PV, wind, storage and critical load across equal-time intervals.",
    ],
  "Wind speed (m/s)": [
    "Windgeschwindigkeit (m/s)",
    "Wind speed (m/s)",
    "Wind speed (m/s)",
  ],
  "Solar irradiance (W/m²)": [
    "Sonneneinstrahlung (W/m²)",
    "Irradiance oorun (W/m²)",
    "Solar irradiance (W/m²)",
  ],
  "Total demand (kW)": [
    "Gesamtlast (kW)",
    "Demand lápapọ̀ (kW)",
    "Total demand (kW)",
  ],
  "Critical demand (kW)": [
    "Kritische Last (kW)",
    "Critical demand (kW)",
    "Critical demand (kW)",
  ],
  "PV array DC rating (kW)": [
    "PV-DC-Nennleistung (kW)",
    "PV DC rating (kW)",
    "PV DC rating (kW)",
  ],
  "PV inverter AC rating (kW)": [
    "PV-Wechselrichterleistung (kW)",
    "PV inverter AC rating (kW)",
    "PV inverter AC rating (kW)",
  ],
  "Wind turbines": ["Windanlagen", "Wind turbine", "Wind turbines"],
  "Interval duration (h)": [
    "Intervalllänge (h)",
    "Àkókò interval (h)",
    "Interval duration (h)",
  ],
  "Battery capacity (kWh)": [
    "Batteriekapazität (kWh)",
    "Battery capacity (kWh)",
    "Battery capacity (kWh)",
  ],
  "Initial battery state of charge (%)": [
    "Batterie-Ladezustand zu Beginn (%)",
    "Battery state of charge ní ìbẹ̀rẹ̀ (%)",
    "Battery charge at start (%)",
  ],
  "Minimum reserve (%)": [
    "Mindestreserve (%)",
    "Reserve tó kéré jù (%)",
    "Minimum reserve (%)",
  ],
  "Battery charge/discharge limit (kW)": [
    "Batterie-Lade-/Entladegrenze (kW)",
    "Battery charge/discharge limit (kW)",
    "Battery charge/discharge limit (kW)",
  ],
  "Dispatchable backup limit (kW)": [
    "Grenze der disponiblen Reserveleistung (kW)",
    "Dispatchable backup limit (kW)",
    "Dispatchable backup limit (kW)",
  ],
  "Backup ramp-up per interval (kW)": [
    "Reserveleistungsanstieg je Intervall (kW)",
    "Backup ramp-up fún interval (kW)",
    "Backup ramp-up each interval (kW)",
  ],
  "Battery charge efficiency (%)": [
    "Batterie-Ladewirkungsgrad (%)",
    "Battery charge efficiency (%)",
    "Battery charge efficiency (%)",
  ],
  "Battery discharge efficiency (%)": [
    "Batterie-Entladewirkungsgrad (%)",
    "Battery discharge efficiency (%)",
    "Battery discharge efficiency (%)",
  ],
  "Available generation": [
    "Verfügbare Erzeugung",
    "Generation tó wà",
    "Generation wey dey available",
  ],
  "Served energy": [
    "Gelieferte Energie",
    "Energy tí a pèsè",
    "Energy supplied",
  ],
  "Unserved critical energy": [
    "Nicht gedeckte kritische Energie",
    "Critical energy tí kò dé",
    "Critical energy wey no get supply",
  ],
  "Renewable curtailment": [
    "Abregelung erneuerbarer Energie",
    "Renewable tí a gé kúrò",
    "Renewable power wey dem cut",
  ],
  "Battery throughput": [
    "Batterie-Energiedurchsatz",
    "Battery throughput",
    "Battery energy wey pass through",
  ],
  Interval: ["Intervall", "Interval", "Interval"],
  "PV kW": ["PV kW", "PV kW", "PV kW"],
  "Wind kW": ["Wind kW", "Wind kW", "Wind kW"],
  "Demand kW": ["Last kW", "Demand kW", "Demand kW"],
  "Battery kW": ["Batterie kW", "Battery kW", "Battery kW"],
  "Backup kW": ["Reserve kW", "Backup kW", "Backup kW"],
  "Unserved kW": [
    "Nicht gedeckt kW",
    "Demand tí kò dé kW",
    "Load wey no get supply kW",
  ],
  "Save scenario locally": [
    "Szenario lokal speichern",
    "Fi scenario pamọ́ sí browser",
    "Save scenario for this browser",
  ],
  "Saved in this browser": [
    "In diesem Browser gespeichert",
    "A fi pamọ́ sínú browser yìí",
    "E don save am for dis browser",
  ],
  "Export dispatch JSON": [
    "Dispatch als JSON exportieren",
    "Export dispatch JSON",
    "Export dispatch JSON",
  ],
  "Export intervals CSV": [
    "Intervalle als CSV exportieren",
    "Export interval CSV",
    "Export interval CSV",
  ],
  "Reset inputs": ["Eingaben zurücksetzen", "Ṣètò input padà", "Reset inputs"],
  "Fix invalid values before saving or exporting.": [
    "Korrigieren Sie ungültige Werte vor dem Speichern oder Export.",
    "Ṣàtúnṣe iye tí kò tọ́ kí o tó fi pamọ́ tàbí export.",
    "Fix invalid values before saving or exporting.",
  ],
  "This is an illustrative AC-bus dispatch, not a site forecast or utility operation model. No feeder/transformer losses, exports, fuel use, costs, emissions, frequency response or unit-specific generator model are included. Entered profiles are assumptions. Generic backup capacity is dispatched after storage with the entered ramp-up ceiling; ramp-down is instantaneous.":
    [
      "Dies ist ein illustratives AC-Sammelschienen-Dispatchmodell, keine Standortprognose oder Netzbetriebsrechnung. Leitungs-/Transformatorverluste, Exporte, Brennstoff, Kosten, Emissionen, Frequenzregelung und ein anlagenspezifisches Generatormodell sind nicht enthalten. Die Profileingaben sind Annahmen. Generische Reserveleistung folgt nach dem Speicher mit der eingegebenen Hochfahrgrenze; das Abfahren erfolgt unmittelbar.",
      "Èyí jẹ́ dispatch AC-bus fún ẹ̀kọ́, kì í ṣe asọtẹ́lẹ̀ ibi kan tàbí model iṣẹ́ utility. A kò fi feeder/transformer loss, export, fuel, iye owó, emission, frequency response tàbí unit-specific generator model kún un. Profile tí a tẹ̀ jẹ́ àfojúsùn. Backup capacity gbogbogbò ń ṣiṣẹ́ lẹ́yìn storage pẹ̀lú ramp-up limit tí a tẹ̀; ramp-down ń ṣẹlẹ̀ lẹ́sẹ̀kẹsẹ̀.",
      "Na AC-bus dispatch teaching model, no be site forecast or utility operation model. E no include feeder/transformer loss, export, fuel use, cost, emission, frequency response or source-specific generator model. Profiles wey you enter na assumptions. Generic backup capacity run after storage with di ramp-up limit; ramp-down happen at once.",
    ],
};

function tr(message: string, locale: Locale) {
  const row = copy[message];
  if (!row || locale === "en") return message;
  return locale === "de" ? row[0] : locale === "yo" ? row[1] : row[2];
}

interface Editable {
  intervalHours: number;
  windSpeeds: number[];
  irradiance: number[];
  demand: number[];
  critical: number[];
  pvDcKW: number;
  pvAcKW: number;
  turbines: number;
  batteryKWh: number;
  initialSoc: number;
  reserveSoc: number;
  batteryPowerKW: number;
  batteryChargeEfficiency: number;
  batteryDischargeEfficiency: number;
  backupKW: number;
  rampKW: number;
}

function defaults(): Editable {
  return {
    intervalHours: DEFAULT_MICROGRID_DISPATCH_INPUTS.intervalHours,
    windSpeeds: DEFAULT_MICROGRID_DISPATCH_INPUTS.wind.windSpeedsMps,
    irradiance: DEFAULT_MICROGRID_DISPATCH_INPUTS.pvByInterval.map(
      (x) => x.planeOfArrayIrradianceWm2,
    ),
    demand: DEFAULT_MICROGRID_DISPATCH_INPUTS.demandKW,
    critical: DEFAULT_MICROGRID_DISPATCH_INPUTS.criticalDemandKW,
    pvDcKW: pvDefaults.dcNameplateKW,
    pvAcKW: pvDefaults.inverterAcRatingKW,
    turbines: DEFAULT_MICROGRID_DISPATCH_INPUTS.wind.turbineCount,
    batteryKWh: DEFAULT_MICROGRID_DISPATCH_INPUTS.battery.capacityKWh,
    initialSoc: DEFAULT_MICROGRID_DISPATCH_INPUTS.battery.initialSocPercent,
    reserveSoc: DEFAULT_MICROGRID_DISPATCH_INPUTS.battery.minimumSocPercent,
    batteryPowerKW: DEFAULT_MICROGRID_DISPATCH_INPUTS.battery.maxDischargeKW,
    batteryChargeEfficiency:
      DEFAULT_MICROGRID_DISPATCH_INPUTS.battery.chargeEfficiency * 100,
    batteryDischargeEfficiency:
      DEFAULT_MICROGRID_DISPATCH_INPUTS.battery.dischargeEfficiency * 100,
    backupKW: DEFAULT_MICROGRID_DISPATCH_INPUTS.backupGenerator.ratedKW,
    rampKW:
      DEFAULT_MICROGRID_DISPATCH_INPUTS.backupGenerator.rampUpKWPerInterval,
  };
}

function readSaved(): Editable {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(INPUT_KEY) ?? "null",
    );
    if (saved && typeof saved === "object" && "demand" in saved) {
      const value = saved as Partial<Editable>;
      if (
        [
          value.windSpeeds,
          value.irradiance,
          value.demand,
          value.critical,
        ].every(Array.isArray)
      )
        return value as Editable;
    }
  } catch {
    /* use the published illustrative lesson defaults */
  }
  return defaults();
}

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function MicrogridDispatchExperiment() {
  const locale = useContext(LanguageContext);
  const label = (s: string) => tr(s, locale);
  const [state, setState] = useState<Editable>(readSaved);
  const [saved, setSaved] = useState(false);
  const inputs: MicrogridDispatchInputs = useMemo(() => {
    const pvByInterval: PvPerformanceInputs[] = state.irradiance.map(
      (planeOfArrayIrradianceWm2) => ({
        ...pvDefaults,
        dcNameplateKW: state.pvDcKW,
        inverterAcRatingKW: state.pvAcKW,
        planeOfArrayIrradianceWm2,
      }),
    );
    return {
      intervalHours: state.intervalHours,
      wind: {
        windSpeedsMps: state.windSpeeds,
        intervalHours: state.intervalHours,
        turbineCount: state.turbines,
      },
      pvByInterval,
      demandKW: state.demand,
      criticalDemandKW: state.critical,
      battery: {
        ...DEFAULT_MICROGRID_DISPATCH_INPUTS.battery,
        capacityKWh: state.batteryKWh,
        initialSocPercent: state.initialSoc,
        minimumSocPercent: state.reserveSoc,
        maxChargeKW: state.batteryPowerKW,
        maxDischargeKW: state.batteryPowerKW,
        chargeEfficiency: state.batteryChargeEfficiency / 100,
        dischargeEfficiency: state.batteryDischargeEfficiency / 100,
      },
      backupGenerator: {
        ratedKW: state.backupKW,
        rampUpKWPerInterval: state.rampKW,
      },
    };
  }, [state]);
  const errors = useMemo(
    () => validateMicrogridDispatchInputs(inputs),
    [inputs],
  );
  const result = useMemo(
    () => (errors.length ? null : calculateMicrogridDispatch(inputs)),
    [errors, inputs],
  );
  const fmt = (v: number) =>
    new Intl.NumberFormat(locale === "pcm" ? "en-NG" : locale, {
      maximumFractionDigits: 2,
    }).format(v);
  const field = (
    key: keyof Editable,
    title: string,
    value: number | number[],
    textarea = false,
  ) => (
    <label className="pg-field" key={key}>
      <span>{label(title)}</span>
      {textarea ? (
        <textarea
          rows={2}
          value={(value as number[]).join(", ")}
          onChange={(e) => {
            const parsed =
              e.currentTarget.value.trim() === ""
                ? []
                : e.currentTarget.value
                    .split(",")
                    .map((x) => (x.trim() === "" ? Number.NaN : Number(x)));
            setState((old) => ({ ...old, [key]: parsed }));
            setSaved(false);
          }}
        />
      ) : (
        <input
          type="number"
          min="0"
          step="any"
          value={value as number}
          onChange={(e) => {
            setState((old) => ({
              ...old,
              [key]: e.currentTarget.valueAsNumber,
            }));
            setSaved(false);
          }}
        />
      )}
    </label>
  );
  const exportResult = (kind: "json" | "csv") => {
    if (!result) return;
    if (kind === "json")
      download(
        "powergrid-microgrid-dispatch.json",
        JSON.stringify(
          {
            model:
              "chronological-ac-bus-dispatch-pv-wind-battery-critical-load",
            inputs,
            result,
            limitations: label(LIMITS),
          },
          null,
          2,
        ),
        "application/json",
      );
    else
      download(
        "powergrid-microgrid-intervals.csv",
        [
          "interval,pv_available_kW,wind_available_kW,renewable_available_kW,demand_kW,critical_demand_kW,battery_charge_kW,battery_discharge_kW,battery_soc_kWh,backup_generation_kW,curtailment_kW,critical_unserved_kW,noncritical_unserved_kW,served_kW,balance_residual_kW",
          ...result.intervals.map((r) =>
            [
              r.interval,
              r.pvAvailableKW,
              r.windAvailableKW,
              r.renewableAvailableKW,
              r.demandKW,
              r.criticalDemandKW,
              r.batteryChargeKW,
              r.batteryDischargeKW,
              r.batterySocKWh,
              r.backupGenerationKW,
              r.renewableCurtailmentKW,
              r.criticalUnservedKW,
              r.nonCriticalUnservedKW,
              r.servedDemandKW,
              r.balanceResidualKW,
            ].join(","),
          ),
        ].join("\r\n"),
        "text/csv;charset=utf-8",
      );
  };

  return (
    <section
      className="panel panel-pad pg-panel pg-pv"
      aria-labelledby="pg-microgrid-title"
    >
      <div className="pg-heading">
        <span className="pg-icon" aria-hidden="true">
          <SunMedium size={18} />
        </span>
        <div>
          <h3 id="pg-microgrid-title">
            {label("Microgrid dispatch laboratory")}
          </h3>
          <p>
            {label(
              "Combine PV, wind, storage and critical demand across equal time intervals.",
            )}
          </p>
        </div>
      </div>
      <div className="pg-wind-controls">
        {field("windSpeeds", "Wind speed (m/s)", state.windSpeeds, true)}
        {field("irradiance", "Solar irradiance (W/m²)", state.irradiance, true)}
        {field("demand", "Total demand (kW)", state.demand, true)}
        {field("critical", "Critical demand (kW)", state.critical, true)}
        {field("pvDcKW", "PV array DC rating (kW)", state.pvDcKW)}
        {field("pvAcKW", "PV inverter AC rating (kW)", state.pvAcKW)}
        {field("turbines", "Wind turbines", state.turbines)}
        {field("intervalHours", "Interval duration (h)", state.intervalHours)}
        {field("batteryKWh", "Battery capacity (kWh)", state.batteryKWh)}
        {field(
          "initialSoc",
          "Initial battery state of charge (%)",
          state.initialSoc,
        )}
        {field("reserveSoc", "Minimum reserve (%)", state.reserveSoc)}
        {field(
          "batteryPowerKW",
          "Battery charge/discharge limit (kW)",
          state.batteryPowerKW,
        )}
        {field(
          "batteryChargeEfficiency",
          "Battery charge efficiency (%)",
          state.batteryChargeEfficiency,
        )}
        {field(
          "batteryDischargeEfficiency",
          "Battery discharge efficiency (%)",
          state.batteryDischargeEfficiency,
        )}
        {field("backupKW", "Dispatchable backup limit (kW)", state.backupKW)}
        {field("rampKW", "Backup ramp-up per interval (kW)", state.rampKW)}
      </div>
      {errors.length > 0 && (
        <div className="pg-errors" role="alert">
          <ul>
            {errors.map((e, i) => (
              <li key={`${e}-${i}`}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      {result && (
        <>
          <dl className="pg-metrics pg-wind-metrics">
            {[
              [
                "Available generation",
                result.renewableEnergyAvailableKWh,
                "kWh",
              ],
              ["Served energy", result.servedEnergyKWh, "kWh"],
              [
                "Unserved critical energy",
                result.criticalUnservedEnergyKWh,
                "kWh",
              ],
              [
                "Renewable curtailment",
                result.renewableEnergyCurtailedKWh,
                "kWh",
              ],
              ["Battery throughput", result.batteryThroughputKWh, "kWh"],
            ].map(([name, value, unit]) => (
              <div key={name as string}>
                <dt>{label(name as string)}</dt>
                <dd>
                  {fmt(value as number)} {unit}
                </dd>
              </div>
            ))}
          </dl>
          <div className="pg-table-wrap">
            <table className="pg-wind-table">
              <thead>
                <tr>
                  {[
                    "Interval",
                    "PV kW",
                    "Wind kW",
                    "Demand kW",
                    "Battery kW",
                    "Backup kW",
                    "Unserved kW",
                  ].map((s) => (
                    <th key={s}>{label(s)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.intervals.map((r) => (
                  <tr key={r.interval}>
                    <th scope="row">{r.interval}</th>
                    <td>{fmt(r.pvAvailableKW)}</td>
                    <td>{fmt(r.windAvailableKW)}</td>
                    <td>{fmt(r.demandKW)}</td>
                    <td>{fmt(r.batteryDischargeKW - r.batteryChargeKW)}</td>
                    <td>{fmt(r.backupGenerationKW)}</td>
                    <td>
                      {fmt(r.criticalUnservedKW + r.nonCriticalUnservedKW)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <p className="pg-model-note">{label(LIMITS)}</p>
      <div className="pg-actions">
        <button
          className="button"
          disabled={!result}
          onClick={() => {
            localStorage.setItem(INPUT_KEY, JSON.stringify(state));
            setSaved(true);
          }}
        >
          <Save size={16} />
          {saved
            ? label("Saved in this browser")
            : label("Save scenario locally")}
        </button>
        <button
          className="button"
          disabled={!result}
          onClick={() => exportResult("json")}
        >
          <Download size={16} />
          {label("Export dispatch JSON")}
        </button>
        <button
          className="button"
          disabled={!result}
          onClick={() => exportResult("csv")}
        >
          <Download size={16} />
          {label("Export intervals CSV")}
        </button>
        <button
          className="button"
          onClick={() => {
            localStorage.removeItem(INPUT_KEY);
            setState(defaults());
            setSaved(false);
          }}
        >
          <RotateCcw size={16} />
          {label("Reset inputs")}
        </button>
      </div>
      {errors.length > 0 && (
        <p role="status">
          {label("Fix invalid values before saving or exporting.")}
        </p>
      )}
    </section>
  );
}

