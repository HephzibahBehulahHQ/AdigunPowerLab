import { useContext, useMemo, useState } from "react";
import { Download, Save, RotateCcw, Zap } from "lucide-react";
import { LanguageContext } from "../i18n";
import type { Locale } from "../i18n";
import {
  calculatePowerGrid,
  DEFAULT_POWERGRID_INPUTS,
  isPowerGridInputs,
  validatePowerGridInputs,
} from "../engine/powergrid";
import type { PowerGridInputs, PowerGridReading } from "../engine/powergrid";
import { applyRegionalTeachingPreset } from "../engine/powergridRegions";
import { RadialFeederExperiment } from "./RadialFeederExperiment";
import { PvPerformanceExperiment } from "./PvPerformanceExperiment";
import { RegionalGridPreset } from "./RegionalGridPreset";
import { HydroStationScene } from "./HydroStationScene";

const SAVE_KEY = "adigunpowerlab.powergrid.experiment.v1";
const copy: Record<Locale, Record<string, string>> = {
  en: {
    title: "Why step up voltage?",
    intro:
      "Compare the same three-phase power transfer at two transmission voltages.",
    power: "Transmitted real power",
    pf: "Power factor",
    resistance: "Line resistance per phase",
    base: "Base transmission voltage",
    raised: "Raised transmission voltage",
    generation: "Generator voltage",
    distribution: "Distribution voltage",
    consumer: "Consumer voltage",
    schematic: "Power path",
    generator: "Generation",
    stepUp: "Step-up transformer",
    line: "Transmission line",
    stepDown: "Step-down transformer",
    network: "Distribution",
    load: "Consumer",
    comparison: "Calculated comparison",
    current: "Line current",
    losses: "Three-phase line losses",
    lossShare: "Loss share",
    delivered: "Power after modeled line loss",
    reducedCurrent: "Current reduction",
    reducedLoss: "Loss reduction",
    save: "Save experiment locally",
    saved: "Saved in this browser",
    exportJson: "Export scenario JSON",
    exportCsv: "Export readings CSV",
    reset: "Reset example",
    assumptions: "Model and limits",
    assumptionText:
      "Balanced three-phase, constant transmitted real power and power factor, equal entered resistance per phase in both cases. Ideal transformer voltage changes do not add transformer losses. Distribution and consumer voltage labels are scenario inputs; their feeder losses are not calculated.",
    formula: "I = P / (√3 × VLL × PF); Ploss = 3 × I² × Rphase.",
    errors: "Correct the inputs to show current results.",
    independent:
      "This lab stores its own experiment and does not edit the active customer project.",
    invalidSave: "Fix invalid inputs before saving or exporting.",
  },
  de: {
    title: "Warum die Spannung erhöhen?",
    intro:
      "Vergleichen Sie dieselbe dreiphasige Leistungsübertragung bei zwei Übertragungsspannungen.",
    power: "Übertragene Wirkleistung",
    pf: "Leistungsfaktor",
    resistance: "Leitungswiderstand je Phase",
    base: "Ausgangs-Übertragungsspannung",
    raised: "Erhöhte Übertragungsspannung",
    generation: "Generatorspannung",
    distribution: "Verteilungsspannung",
    consumer: "Verbraucherspannung",
    schematic: "Leistungsweg",
    generator: "Erzeugung",
    stepUp: "Aufwärtstransformator",
    line: "Übertragungsleitung",
    stepDown: "Abwärtstransformator",
    network: "Verteilung",
    load: "Verbraucher",
    comparison: "Berechneter Vergleich",
    current: "Leitungsstrom",
    losses: "Dreiphasige Leitungsverluste",
    lossShare: "Verlustanteil",
    delivered: "Leistung nach modelliertem Leitungsverlust",
    reducedCurrent: "Stromsenkung",
    reducedLoss: "Verlustsenkung",
    save: "Experiment lokal speichern",
    saved: "In diesem Browser gespeichert",
    exportJson: "Szenario als JSON exportieren",
    exportCsv: "Messwerte als CSV exportieren",
    reset: "Beispiel zurücksetzen",
    assumptions: "Modell und Grenzen",
    assumptionText:
      "Symmetrisches Dreiphasensystem, konstante übertragene Wirkleistung und konstanter Leistungsfaktor, gleicher eingegebener Phasenwiderstand in beiden Fällen. Ideale Transformator-Spannungsänderungen berücksichtigen keine Transformatorverluste. Verteilungs- und Verbraucherspannungen sind Szenarioeingaben; deren Leitungsverluste werden nicht berechnet.",
    formula: "I = P / (√3 × VLL × PF); Ploss = 3 × I² × Rphase.",
    errors: "Korrigieren Sie die Eingaben, um aktuelle Ergebnisse anzuzeigen.",
    independent:
      "Dieses Labor speichert sein eigenes Experiment und ändert das aktive Kundenprojekt nicht.",
    invalidSave:
      "Korrigieren Sie ungültige Eingaben vor dem Speichern oder Exportieren.",
  },
  yo: {
    title: "Kí nìdí la fi ń gbé foliteji sókè?",
    intro: "Fi gbigbe agbára aláfàsẹ́ mẹ́ta kan náà wé ní foliteji ìrìnàjò méjì.",
    power: "Agbára gidi tí a ń gbé",
    pf: "Power factor",
    resistance: "Ìdènà waya fún aláfàsẹ́ kan",
    base: "Foliteji ìrìnàjò àkọ́kọ́",
    raised: "Foliteji ìrìnàjò gíga",
    generation: "Foliteji generator",
    distribution: "Foliteji pínpín",
    consumer: "Foliteji oníbàárà",
    schematic: "Ọ̀nà agbára",
    generator: "Ìṣẹ̀dá agbára",
    stepUp: "Transformer gbígbé sókè",
    line: "Waya ìrìnàjò",
    stepDown: "Transformer dídín kù",
    network: "Pípín agbára",
    load: "Oníbàárà",
    comparison: "Ìfiwéra ìṣirò",
    current: "Ìṣàn waya",
    losses: "Pipadánù waya aláfàsẹ́ mẹ́ta",
    lossShare: "Ìpín ipadánù",
    delivered: "Agbára lẹ́yìn ipadánù waya tí a ṣe àwòṣe",
    reducedCurrent: "Dídín ìṣàn kù",
    reducedLoss: "Dídín ipadánù kù",
    save: "Fi ìdánwò pamọ́ sí ẹ̀rọ yìí",
    saved: "A fi pamọ́ sí browser yìí",
    exportJson: "Gba scenario JSON jáde",
    exportCsv: "Gba readings CSV jáde",
    reset: "Padà sí àpẹẹrẹ",
    assumptions: "Àwòṣe àti ààlà",
    assumptionText:
      "Aláfàsẹ́ mẹ́ta tó dọ́gba, agbára gidi àti power factor kan náà, àti ìdènà aláfàsẹ́ kan náà nínú ìfiwéra méjèèjì. A kò fi ipadánù transformer kún ìyípadà foliteji tó péye. Foliteji pípín àti oníbàárà jẹ́ ìwọlé scenario; a kò ṣe ìṣirò ipadánù àwọn waya wọ̀nyẹn.",
    formula: "I = P / (√3 × VLL × PF); Ploss = 3 × I² × Rphase.",
    errors: "Ṣàtúnṣe àwọn ìwọlé kí o tó rí àbájáde tuntun.",
    independent:
      "Laboratory yìí ní ìdánwò tirẹ̀, kò sì yí project oníbàárà tó ṣí padà.",
    invalidSave: "Ṣàtúnṣe ìwọlé tí kò tọ́ kí o tó fi pamọ́ tàbí ṣe export.",
  },
  pcm: {
    title: "Why we dey step up voltage?",
    intro:
      "Compare di same three-phase power transfer for two transmission voltages.",
    power: "Real power wey dey transmit",
    pf: "Power factor",
    resistance: "Line resistance per phase",
    base: "First transmission voltage",
    raised: "Higher transmission voltage",
    generation: "Generator voltage",
    distribution: "Distribution voltage",
    consumer: "Consumer voltage",
    schematic: "Power route",
    generator: "Generation",
    stepUp: "Step-up transformer",
    line: "Transmission line",
    stepDown: "Step-down transformer",
    network: "Distribution",
    load: "Consumer",
    comparison: "Calculated comparison",
    current: "Line current",
    losses: "Three-phase line losses",
    lossShare: "Loss share",
    delivered: "Power after model line loss",
    reducedCurrent: "Current reduction",
    reducedLoss: "Loss reduction",
    save: "Save experiment for this browser",
    saved: "Saved for this browser",
    exportJson: "Export scenario JSON",
    exportCsv: "Export readings CSV",
    reset: "Reset example",
    assumptions: "Model and limits",
    assumptionText:
      "Balanced three-phase, same transmitted real power and power factor, same entered resistance per phase for both cases. Ideal transformer voltage change no include transformer losses. Distribution and consumer voltage values na scenario input; their feeder losses no dey calculate.",
    formula: "I = P / (√3 × VLL × PF); Ploss = 3 × I² × Rphase.",
    errors: "Correct di inputs make current results show.",
    independent:
      "This lab get its own experiment save; e no dey edit di active customer project.",
    invalidSave: "Fix invalid inputs before you save or export.",
  },
};

function fmt(value: number, digits = 3) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: digits,
  }).format(value);
}

function Meter({
  reading,
  label,
  text,
}: {
  reading: PowerGridReading;
  label: string;
  text: Record<string, string>;
}) {
  return (
    <article className="pg-result">
      <h4>
        {label} · {fmt(reading.voltageKV, 1)} kV
      </h4>
      <dl>
        <div>
          <dt>{text.current}</dt>
          <dd>{fmt(reading.currentA, 1)} A</dd>
        </div>
        <div>
          <dt>{text.losses}</dt>
          <dd>{fmt(reading.lineLossMW, 3)} MW</dd>
        </div>
        <div>
          <dt>{text.lossShare}</dt>
          <dd>{fmt(reading.lossPercent, 2)}%</dd>
        </div>
        <div>
          <dt>{text.delivered}</dt>
          <dd>{fmt(reading.deliveredMW, 3)} MW</dd>
        </div>
      </dl>
    </article>
  );
}

export function PowerGridLab() {
  const locale = useContext(LanguageContext);
  const text = copy[locale];
  const [inputs, setInputs] = useState<PowerGridInputs>(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem(SAVE_KEY) ?? "null",
      );
      return isPowerGridInputs(saved) ? saved : DEFAULT_POWERGRID_INPUTS;
    } catch {
      return DEFAULT_POWERGRID_INPUTS;
    }
  });
  const [saved, setSaved] = useState(false);
  const errors = useMemo(() => validatePowerGridInputs(inputs), [inputs]);
  const result = useMemo(
    () => (errors.length ? undefined : calculatePowerGrid(inputs)),
    [inputs, errors.length],
  );
  const update = (key: keyof PowerGridInputs, value: number) => {
    setInputs((previous) => ({ ...previous, [key]: value }));
    setSaved(false);
  };
  const persist = () => {
    if (errors.length) return;
    localStorage.setItem(SAVE_KEY, JSON.stringify(inputs));
    setSaved(true);
  };
  const exportFile = (kind: "json" | "csv") => {
    if (!result) return;
    const content =
      kind === "json"
        ? JSON.stringify(
            {
              schemaVersion: 1,
              model: "balanced-three-phase-constant-power-line-loss",
              inputs,
              comparison: result,
              assumptions: text.assumptionText,
            },
            null,
            2,
          )
        : [
            "case,voltage_kV,current_A,line_loss_MW,loss_percent,power_after_loss_MW",
            ...(["base", "raised"] as const).map((key) => {
              const row = result[key];
              return `${key},${row.voltageKV},${row.currentA},${row.lineLossMW},${row.lossPercent},${row.deliveredMW}`;
            }),
          ].join("\n");
    const blob = new Blob([content], {
      type: kind === "json" ? "application/json" : "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      kind === "json" ? "powergrid-experiment.json" : "powergrid-readings.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const field = (
    key: keyof PowerGridInputs,
    label: string,
    unit: string,
    step: string,
  ) => (
    <label className="pg-field" key={key}>
      <span>{label}</span>
      <span className="pg-input-wrap">
        <input
          type="number"
          min="0.001"
          step={step}
          value={inputs[key]}
          onChange={(event) => update(key, event.currentTarget.valueAsNumber)}
          aria-label={`${label} (${unit})`}
        />
        <b>{unit}</b>
      </span>
    </label>
  );

  const pctCurrent = result?.currentReductionPercent;
  const pctLoss = result?.lossReductionPercent;
  return (
    <section className="pg-lab" aria-labelledby="pg-title">
      <header className="pg-heading">
        <div>
          <span className="eyebrow">
            HB ELEKTRONIKER · POWER SYSTEMS LEARNING LAB
          </span>
          <h2 id="pg-title">
            <Zap aria-hidden="true" />
            {text.title}
          </h2>
          <p>{text.intro}</p>
        </div>
      </header>
      <p className="pg-isolation">{text.independent}</p>
      <RegionalGridPreset
        onApply={(preset) => {
          setInputs((previous) =>
            applyRegionalTeachingPreset(previous, preset),
          );
          setSaved(false);
        }}
      />
      <HydroStationScene locale={locale} />
      <p className="pg-equation">{text.formula}</p>
      <div className="pg-columns">
        <section
          className="panel panel-pad pg-panel"
          aria-labelledby="pg-input-title"
        >
          <h3 id="pg-input-title">{text.intro}</h3>
          <div className="pg-fields">
            {field("powerMW", text.power, "MW", "1")}
            {field("powerFactor", text.pf, "PF", "0.01")}
            {field("lineResistanceOhm", text.resistance, "Ω/phase", "0.1")}
            {field("baseVoltageKV", text.base, "kV", "1")}
            {field("raisedVoltageKV", text.raised, "kV", "1")}
            {field("generationVoltageKV", text.generation, "kV", "0.1")}
            {field("distributionVoltageKV", text.distribution, "kV", "0.1")}
            {field("consumerVoltageKV", text.consumer, "kV", "0.01")}
          </div>
          {!!errors.length && (
            <div role="alert" className="pg-errors">
              <strong>{text.errors}</strong>
              <ul>
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
        <section
          className="panel panel-pad pg-panel"
          aria-labelledby="pg-results-title"
        >
          <h3 id="pg-results-title">{text.comparison}</h3>
          {result ? (
            <>
              <div className="pg-results">
                <Meter reading={result.base} label={text.base} text={text} />
                <Meter
                  reading={result.raised}
                  label={text.raised}
                  text={text}
                />
              </div>
              <div className="pg-delta">
                <span>
                  {text.reducedCurrent}
                  <b>{fmt(pctCurrent!, 1)}%</b>
                </span>
                <span>
                  {text.reducedLoss}
                  <b>{fmt(pctLoss!, 1)}%</b>
                </span>
              </div>
            </>
          ) : (
            <div role="status" className="pg-errors">
              {text.errors}
            </div>
          )}
        </section>
      </div>
      <details className="panel panel-pad pg-limit">
        <summary>{text.assumptions}</summary>
        <p>{text.assumptionText}</p>
        <p>
          <strong>{text.formula}</strong>
        </p>
      </details>
      {errors.length > 0 && (
        <p className="pg-export-warning" role="status">
          {text.invalidSave}
        </p>
      )}
      <div className="pg-actions">
        <button className="button" onClick={persist} disabled={!!errors.length}>
          <Save size={16} />
          {text.save}
        </button>
        {saved && (
          <span role="status" className="pg-saved">
            {text.saved}
          </span>
        )}
        <button
          className="button"
          onClick={() => exportFile("json")}
          disabled={!result}
        >
          <Download size={16} />
          {text.exportJson}
        </button>
        <button
          className="button"
          onClick={() => exportFile("csv")}
          disabled={!result}
        >
          <Download size={16} />
          {text.exportCsv}
        </button>
        <button
          className="button"
          onClick={() => {
            setInputs(DEFAULT_POWERGRID_INPUTS);
            setSaved(false);
          }}
        >
          <RotateCcw size={16} />
          {text.reset}
        </button>
      </div>
      <RadialFeederExperiment />
      <PvPerformanceExperiment />
    </section>
  );
}
