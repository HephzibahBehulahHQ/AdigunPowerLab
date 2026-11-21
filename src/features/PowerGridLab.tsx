import { useContext, useMemo, useReducer, useRef, useState } from "react";
import type { SetStateAction } from "react";
import { Download, Save, RotateCcw, Zap } from "lucide-react";
import { LanguageContext } from "../i18n";
import type { Locale } from "../i18n";
import { downloadFile } from "../import-export/files";
import {
  calculatePowerGrid,
  DEFAULT_POWERGRID_INPUTS,
  validatePowerGridInputs,
} from "../engine/powergrid";
import type {
  PowerGridComparison,
  PowerGridInputs,
  PowerGridReading,
} from "../engine/powergrid";
import {
  applyRegionalTeachingPreset,
  REGIONAL_TEACHING_PRESETS,
} from "../engine/powergridRegions";
import {
  packPowerGridScenario,
  readSavedPowerGridScenario,
  unpackPowerGridScenario,
  readStoredPowerGridDocument,
  savePowerGridRevision,
  type PowerGridRevision,
  POWERGRID_SCENARIO_MAX_BYTES,
  POWERGRID_SCENARIO_NAME_LIMIT,
  POWERGRID_SCENARIO_NOTES_LIMIT,
  type PowerGridScenario,
} from "../import-export/powergridScenario";
import { RadialFeederExperiment } from "./RadialFeederExperiment";
import { MeshedPowerFlowExperiment } from "./MeshedPowerFlowExperiment";
import { PowerGridFrequencyExperiment } from "./PowerGridFrequencyExperiment";
import { PvPerformanceExperiment } from "./PvPerformanceExperiment";
import { HydroPerformanceExperiment } from "./HydroPerformanceExperiment";
import { WindResourceExperiment } from "./WindResourceExperiment";
import { MicrogridDispatchExperiment } from "./MicrogridDispatchExperiment";
import { RegionalGridPreset } from "./RegionalGridPreset";
import {
  listRecoveredPowerGridScenarios,
  type RecoveredPowerGridScenario,
} from "../storage/powergridRecovery";
import { SmardHistoricalDay } from "./SmardHistoricalDay";
import { HydroStationScene, type HydroEquipmentId } from "./HydroStationScene";
import { GenerationPlantScene } from "./GenerationPlantScene";
import {
  DistributionNetworkScene,
  type DistributionEquipmentId,
} from "./DistributionNetworkScene";
import {
  PowerGridStation3DScene,
  type Station3DAssetId,
} from "./PowerGridStation3DScene";

const sharedHydroAssets = [
  ["reservoir", "reservoir"],
  ["turbine", "turbine"],
  ["generator", "generator"],
  ["gsu", "unit-transformer"],
  ["tower", "tower"],
] as const satisfies readonly (readonly [HydroEquipmentId, Station3DAssetId])[];

const scenarioCopy = {
  en: [
    "Experiment name",
    "Import scenario JSON",
    "Import preview",
    "Apply imported scenario",
    "Cancel import",
    "Invalid transmission scenario file.",
    "Applying changes the worksheet. Save separately to update the browser copy.",
    "Browser save failed.",
  ],
  de: [
    "Versuchsname",
    "Szenario-JSON importieren",
    "Importvorschau",
    "Importiertes Szenario anwenden",
    "Import abbrechen",
    "Ungültige Datei für das Übertragungsszenario.",
    "Anwenden ändert das Arbeitsblatt. Speichern Sie separat, um die Browserkopie zu aktualisieren.",
    "Speichern im Browser fehlgeschlagen.",
  ],
  yo: [
    "Orúkọ ìdánwò",
    "Gbé JSON àpẹẹrẹ wọlé",
    "Àwòyẹ̀wò ìgbéwọlé",
    "Lo àpẹẹrẹ tí a gbé wọlé",
    "Fagilé ìgbéwọlé",
    "Fáìlì àpẹẹrẹ gbigbe kò péye.",
    "Lílo rẹ̀ yí worksheet padà. Fi pamọ́ lọ́tọ̀ láti mú ẹ̀dà browser dọ́gba.",
    "Ìfipamọ́ browser kùnà.",
  ],
  pcm: [
    "Experiment name",
    "Import scenario JSON",
    "Import preview",
    "Apply imported scenario",
    "Cancel import",
    "This transmission scenario file no valid.",
    "Apply go change worksheet. Save separately to update browser copy.",
    "Browser save fail.",
  ],
} satisfies Record<Locale, string[]>;
const recoveryCopy = {
  en: [
    "Show recovered experiments",
    "Recovered transmission experiments",
    "No recovered transmission experiments.",
    "Could not read recovered experiments.",
    "Unnamed transmission experiment",
  ],
  de: [
    "Wiederhergestellte Versuche anzeigen",
    "Wiederhergestellte Übertragungsversuche",
    "Keine wiederhergestellten Übertragungsversuche.",
    "Wiederhergestellte Versuche konnten nicht gelesen werden.",
    "Unbenannter Übertragungsversuch",
  ],
  yo: [
    "Fi ìdánwò tí a gba padà hàn",
    "Ìdánwò gbigbe tí a gba padà",
    "Kò sí ìdánwò gbigbe tí a gba padà.",
    "A kò lè ka ìdánwò tí a gba padà.",
    "Ìdánwò gbigbe aláìlórúkọ",
  ],
  pcm: [
    "Show recovered experiments",
    "Recovered transmission experiments",
    "No recovered transmission experiments.",
    "We no fit read recovered experiments.",
    "Unnamed transmission experiment",
  ],
} satisfies Record<Locale, string[]>;
const historyCopy = {
  en: ["Undo transmission edit", "Redo transmission edit"],
  de: [
    "Übertragungsänderung rückgängig machen",
    "Übertragungsänderung wiederholen",
  ],
  yo: ["Dá àtúnṣe gbigbe padà", "Tún àtúnṣe gbigbe ṣe"],
  pcm: ["Undo transmission edit", "Redo transmission edit"],
} satisfies Record<Locale, string[]>;
const revisionCopy = {
  en: ["Saved transmission revisions", "No earlier transmission revisions."],
  de: [
    "Gespeicherte Übertragungsrevisionen",
    "Keine früheren Übertragungsrevisionen.",
  ],
  yo: ["Àwọn àtúnṣe gbigbe tí a fi pamọ́", "Kò sí àtúnṣe gbigbe tẹ́lẹ̀."],
  pcm: ["Saved transmission revisions", "No earlier transmission revisions."],
} satisfies Record<Locale, string[]>;
const baselineCopy = {
  en: [
    "Set comparison baseline",
    "Clear comparison baseline",
    "Baseline versus current worksheet",
    "Metric",
    "Baseline",
    "Current",
    "Change",
    "Duplicate transmission experiment",
    "Copy",
    "Unnamed experiment",
  ],
  de: [
    "Vergleichsbasis setzen",
    "Vergleichsbasis löschen",
    "Vergleichsbasis und aktueller Versuch",
    "Messgröße",
    "Basis",
    "Aktuell",
    "Änderung",
    "Übertragungsversuch duplizieren",
    "Kopie",
    "Unbenannter Versuch",
  ],
  yo: [
    "Ṣètò ìpìlẹ̀ àfiwé",
    "Pa ìpìlẹ̀ àfiwé rẹ́",
    "Àfiwé ìpìlẹ̀ àti worksheet lọwọlọwọ",
    "Ìwọ̀n",
    "Ìpìlẹ̀",
    "Lọwọlọwọ",
    "Ìyípadà",
    "Ṣe ẹ̀dà ìdánwò gbigbe",
    "Ẹ̀dà",
    "Ìdánwò aláìlórúkọ",
  ],
  pcm: [
    "Set comparison baseline",
    "Clear comparison baseline",
    "Baseline and current worksheet",
    "Metric",
    "Baseline",
    "Current",
    "Change",
    "Duplicate transmission experiment",
    "Copy",
    "Unnamed experiment",
  ],
} satisfies Record<Locale, string[]>;

interface ScenarioHistory {
  current: PowerGridScenario;
  past: PowerGridScenario[];
  future: PowerGridScenario[];
}
type ScenarioEdit =
  | { type: "edit"; change: SetStateAction<PowerGridScenario> }
  | { type: "undo" }
  | { type: "redo" };
const historyLimit = 40;

function editTransmissionHistory(
  state: ScenarioHistory,
  action: ScenarioEdit,
): ScenarioHistory {
  if (action.type === "undo") {
    const previous = state.past.at(-1);
    return previous
      ? {
          current: previous,
          past: state.past.slice(0, -1),
          future: [state.current, ...state.future],
        }
      : state;
  }
  if (action.type === "redo") {
    const next = state.future[0];
    return next
      ? {
          current: next,
          past: [...state.past, state.current],
          future: state.future.slice(1),
        }
      : state;
  }
  const current =
    typeof action.change === "function"
      ? action.change(state.current)
      : action.change;
  return {
    current,
    past: [...state.past.slice(1 - historyLimit), state.current],
    future: [],
  };
}
const reportCopy = {
  en: [
    "Transmission voltage lab report",
    "Objective",
    "Compare line current and resistive loss at two transmission voltages for the same transmitted power.",
    "Source-to-consumer schematic",
    "Student notes (optional)",
    "Export lab report PDF",
    "PDF export failed.",
  ],
  de: [
    "Laborbericht Übertragungsspannung",
    "Lernziel",
    "Vergleichen Sie Strom und ohmsche Verluste bei zwei Übertragungsspannungen für dieselbe übertragene Leistung.",
    "Schema von der Quelle zum Verbraucher",
    "Notizen (optional)",
    "Laborbericht als PDF exportieren",
    "PDF-Export fehlgeschlagen.",
  ],
  yo: [
    "Ìròyìn ìdánwò foliteji gbigbe",
    "Ète",
    "Fi ìṣàn iná àti àdánù resistance wé fún foliteji gbigbe méjì ní agbára kan náà.",
    "Àwòrán láti orísun dé oníbàárà",
    "Àkọsílẹ̀ akẹ́kọ̀ọ́ (àṣàyàn)",
    "Gbé ìròyìn PDF jáde",
    "Ìgbéjáde PDF kùnà.",
  ],
  pcm: [
    "Transmission voltage lab report",
    "Objective",
    "Compare line current and resistance loss for two transmission voltages with the same transmitted power.",
    "Source to consumer diagram",
    "Student notes (optional)",
    "Export lab report PDF",
    "PDF export fail.",
  ],
} satisfies Record<Locale, string[]>;
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
  const [
    reportTitle,
    reportObjective,
    reportObjectiveText,
    reportNetwork,
    reportNotes,
    reportExport,
    reportFailure,
  ] = reportCopy[locale];
  const [
    experimentNameLabel,
    importLabel,
    previewLabel,
    applyLabel,
    cancelLabel,
    invalidImportLabel,
    previewExplanation,
    saveFailure,
  ] = scenarioCopy[locale];
  const [history, editHistory] = useReducer(
    editTransmissionHistory,
    null,
    () => ({
      current: readSavedPowerGridScenario(),
      past: [],
      future: [],
    }),
  );
  const [undoLabel, redoLabel] = historyCopy[locale];
  const [
    setBaselineLabel,
    clearBaselineLabel,
    baselineCaption,
    metricLabel,
    baselineLabel,
    currentLabel,
    changeLabel,
    duplicateLabel,
    copySuffix,
    unnamedExperiment,
  ] = baselineCopy[locale];
  const [baseline, setBaseline] = useState<{
    scenario: PowerGridScenario;
    result: PowerGridComparison;
  } | null>(null);
  const scenario = history.current;
  const setScenario = (change: SetStateAction<PowerGridScenario>) =>
    editHistory({ type: "edit", change });
  const { inputs, name, notes, regionalPresetId } = scenario;
  const [importPreview, setImportPreview] = useState<PowerGridScenario | null>(
    null,
  );
  const [importError, setImportError] = useState(false);
  const [revisions, setRevisions] = useState<PowerGridRevision[] | null>(null);
  const [revisionHeading, noRevisions] = revisionCopy[locale];
  const [recovered, setRecovered] = useState<
    RecoveredPowerGridScenario[] | null
  >(null);
  const [recoveryError, setRecoveryError] = useState(false);
  const [recoveryBusy, setRecoveryBusy] = useState(false);
  const [
    showRecovered,
    recoveredHeading,
    noRecovered,
    recoveryFailure,
    unnamedRecovered,
  ] = recoveryCopy[locale];
  const importSequence = useRef(0);
  const [reportBusy, setReportBusy] = useState(false);
  const [reportError, setReportError] = useState(false);
  const [stationAsset, setStationAsset] =
    useState<Station3DAssetId>("generator");
  const [hydroAsset, setHydroAsset] = useState<HydroEquipmentId>("generator");
  const [distributionAsset, setDistributionAsset] =
    useState<DistributionEquipmentId>("receivingTransformer");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const errors = useMemo(() => validatePowerGridInputs(inputs), [inputs]);
  const result = useMemo(
    () => (errors.length ? undefined : calculatePowerGrid(inputs)),
    [inputs, errors.length],
  );
  const baselineRows =
    baseline && result
      ? ([
          [
            "powerMW",
            text.power,
            "MW",
            baseline.scenario.inputs.powerMW,
            inputs.powerMW,
          ],
          [
            "baseVoltageKV",
            text.base,
            "kV",
            baseline.result.base.voltageKV,
            result.base.voltageKV,
          ],
          [
            "raisedVoltageKV",
            text.raised,
            "kV",
            baseline.result.raised.voltageKV,
            result.raised.voltageKV,
          ],
          [
            "baseCurrentA",
            `${text.base} · ${text.current}`,
            "A",
            baseline.result.base.currentA,
            result.base.currentA,
          ],
          [
            "raisedCurrentA",
            `${text.raised} · ${text.current}`,
            "A",
            baseline.result.raised.currentA,
            result.raised.currentA,
          ],
          [
            "baseLossMW",
            `${text.base} · ${text.losses}`,
            "MW",
            baseline.result.base.lineLossMW,
            result.base.lineLossMW,
          ],
          [
            "raisedLossMW",
            `${text.raised} · ${text.losses}`,
            "MW",
            baseline.result.raised.lineLossMW,
            result.raised.lineLossMW,
          ],
        ] as const)
      : [];
  const update = (key: keyof PowerGridInputs, value: number) => {
    setScenario((previous) => ({
      ...previous,
      inputs: { ...previous.inputs, [key]: value },
    }));
    setSaved(false);
  };
  const persist = () => {
    if (errors.length) return;
    try {
      const updated = savePowerGridRevision(scenario);
      if (revisions !== null) setRevisions(updated);
      setSaved(true);
      setSaveError(false);
    } catch {
      setSaved(false);
      setSaveError(true);
    }
  };
  const importScenario = async (file: File) => {
    const sequence = ++importSequence.current;
    setImportPreview(null);
    setImportError(false);
    try {
      if (file.size > POWERGRID_SCENARIO_MAX_BYTES)
        throw new Error("Scenario file too large");
      const restored = unpackPowerGridScenario(JSON.parse(await file.text()));
      if (!restored) throw new Error("Invalid scenario");
      if (sequence === importSequence.current) setImportPreview(restored);
    } catch {
      if (sequence === importSequence.current) setImportError(true);
    }
  };
  const exportFile = (kind: "json" | "csv") => {
    if (!result) return;
    const content =
      kind === "json"
        ? JSON.stringify(
            {
              ...packPowerGridScenario(scenario),
              comparison: result,
              baselineComparison: baseline
                ? {
                    scenario: packPowerGridScenario(baseline.scenario),
                    result: baseline.result,
                    changes: Object.fromEntries(
                      baselineRows.map(([key, , , previous, current]) => [
                        key,
                        current - previous,
                      ]),
                    ),
                  }
                : undefined,
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
  const exportPdf = async () => {
    if (!result || reportBusy) return;
    const snapshot = {
      inputs: { ...inputs },
      name,
      notes,
      preset: REGIONAL_TEACHING_PRESETS.find(
        (preset) => preset.id === regionalPresetId,
      )?.engineeringRegion,
      locale: locale === "pcm" ? "en-NG" : locale,
      labels: {
        ...text,
        reportTitle,
        reportObjective,
        reportObjectiveText,
        reportNetwork,
        reportNotes,
      },
    };
    setReportBusy(true);
    setReportError(false);
    try {
      const { createPowerGridReport } =
        await import("../import-export/powergridReport");
      const pdf = await createPowerGridReport(snapshot);
      downloadFile("powergrid-transmission-report.pdf", pdf);
    } catch {
      setReportError(true);
    } finally {
      setReportBusy(false);
    }
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
          setScenario((previous) => ({
            ...previous,
            inputs: applyRegionalTeachingPreset(previous.inputs, preset),
            regionalPresetId: preset.id,
          }));
          setSaved(false);
        }}
      />
      <SmardHistoricalDay locale={locale} />
      <PowerGridStation3DScene
        locale={locale}
        selected={stationAsset}
        onSelect={(asset) => {
          setStationAsset(asset);
          const shared = sharedHydroAssets.find(
            ([, station]) => station === asset,
          );
          if (shared) setHydroAsset(shared[0]);
          if (asset === "receiving-transformer")
            setDistributionAsset("receivingTransformer");
        }}
      />
      <HydroStationScene
        locale={locale}
        selected={hydroAsset}
        onSelect={(asset) => {
          setHydroAsset(asset);
          const shared = sharedHydroAssets.find(([hydro]) => hydro === asset);
          if (shared) setStationAsset(shared[1]);
        }}
      />
      <GenerationPlantScene />
      <DistributionNetworkScene
        locale={locale}
        inputs={inputs}
        selected={distributionAsset}
        onSelect={(asset) => {
          setDistributionAsset(asset);
          if (asset === "receivingTransformer")
            setStationAsset("receiving-transformer");
        }}
      />
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
      <label className="pg-field">
        <span>{experimentNameLabel}</span>
        <input
          maxLength={POWERGRID_SCENARIO_NAME_LIMIT}
          value={name}
          onChange={(event) => {
            setScenario({ ...scenario, name: event.currentTarget.value });
            setSaved(false);
          }}
        />
      </label>
      <label className="pg-field">
        <span>{reportNotes}</span>
        <textarea
          rows={2}
          maxLength={POWERGRID_SCENARIO_NOTES_LIMIT}
          value={notes}
          onChange={(event) => {
            setScenario({ ...scenario, notes: event.currentTarget.value });
            setSaved(false);
          }}
        />
      </label>
      {reportError && <p role="status">{reportFailure}</p>}
      {saveError && <p role="status">{saveFailure}</p>}
      <div className="pg-actions">
        <button
          className="button"
          type="button"
          disabled={!history.past.length}
          onClick={() => {
            editHistory({ type: "undo" });
            setSaved(false);
          }}
        >
          {undoLabel}
        </button>
        <button
          className="button"
          type="button"
          disabled={!history.future.length}
          onClick={() => {
            editHistory({ type: "redo" });
            setSaved(false);
          }}
        >
          {redoLabel}
        </button>
        <button className="button" onClick={persist} disabled={!!errors.length}>
          <Save size={16} />
          {text.save}
        </button>
        <button
          className="button"
          type="button"
          disabled={!result}
          onClick={() => {
            const suffix = ` (${copySuffix})`;
            setScenario({
              ...scenario,
              name: `${(name.trim() || unnamedExperiment).slice(0, POWERGRID_SCENARIO_NAME_LIMIT - suffix.length)}${suffix}`,
            });
            setSaved(false);
          }}
        >
          {duplicateLabel}
        </button>
        <button
          className="button"
          type="button"
          disabled={!result}
          onClick={() => {
            if (result) setBaseline(structuredClone({ scenario, result }));
          }}
        >
          {setBaselineLabel}
        </button>
        {baseline && (
          <button
            className="button"
            type="button"
            onClick={() => setBaseline(null)}
          >
            {clearBaselineLabel}
          </button>
        )}
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
          type="button"
          onClick={() => void exportPdf()}
          disabled={!result || reportBusy}
        >
          <Download size={16} />
          {reportExport}
        </button>
        <button
          className="button"
          onClick={() => {
            setScenario({
              inputs: DEFAULT_POWERGRID_INPUTS,
              name: "",
              notes: "",
            });
            setSaved(false);
          }}
        >
          <RotateCcw size={16} />
          {text.reset}
        </button>
      </div>
      {baseline && result && (
        <div className="pg-table-wrap">
          <table className="pg-wind-table">
            <caption>{baselineCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{metricLabel}</th>
                <th scope="col">
                  {baselineLabel}
                  {baseline.scenario.name ? ` · ${baseline.scenario.name}` : ""}
                </th>
                <th scope="col">
                  {currentLabel}
                  {name ? ` · ${name}` : ""}
                </th>
                <th scope="col">{changeLabel}</th>
              </tr>
            </thead>
            <tbody>
              {baselineRows.map(([key, label, unit, previous, current]) => (
                <tr key={key}>
                  <th scope="row">{label}</th>
                  <td>
                    {fmt(previous, 4)} {unit}
                  </td>
                  <td>
                    {fmt(current, 4)} {unit}
                  </td>
                  <td>
                    {fmt(current - previous, 4)} {unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <label className="pg-field">
        <span>{importLabel}</span>
        <input
          type="file"
          accept=".json,application/json"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (file) void importScenario(file);
          }}
        />
      </label>
      {importError && <p role="alert">{invalidImportLabel}</p>}
      <button
        className="button"
        type="button"
        disabled={recoveryBusy}
        onClick={async () => {
          setRecoveryBusy(true);
          setRecoveryError(false);
          try {
            setRecovered(await listRecoveredPowerGridScenarios());
          } catch {
            setRecoveryError(true);
          } finally {
            setRecoveryBusy(false);
          }
        }}
      >
        {showRecovered}
      </button>
      {recoveryError && <p role="alert">{recoveryFailure}</p>}
      <details
        className="panel panel-pad"
        onToggle={(event) => {
          if (event.currentTarget.open)
            setRevisions(readStoredPowerGridDocument().revisions);
        }}
      >
        <summary>{revisionHeading}</summary>
        {revisions &&
          (revisions.length === 0 ? (
            <p>{noRevisions}</p>
          ) : (
            <ul>
              {revisions.map(({ scenario: revision, savedAt }, index) => (
                <li key={index}>
                  <button
                    className="button"
                    type="button"
                    onClick={() => {
                      importSequence.current++;
                      setImportError(false);
                      setImportPreview(revision);
                    }}
                  >
                    {revision.name || unnamedRecovered} ·{" "}
                    {fmt(revision.inputs.powerMW)} MW
                  </button>
                  {savedAt && (
                    <>
                      {" "}
                      <time dateTime={savedAt}>
                        {new Date(savedAt).toLocaleString(
                          locale === "pcm" ? "en-NG" : locale,
                        )}
                      </time>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ))}
      </details>
      {recovered && (
        <section aria-labelledby="pg-recovered-title">
          <h3 id="pg-recovered-title">{recoveredHeading}</h3>
          {recovered.length === 0 ? (
            <p>{noRecovered}</p>
          ) : (
            <ul>
              {recovered.map((row) => (
                <li key={row.key}>
                  <button
                    className="button"
                    type="button"
                    onClick={() => {
                      importSequence.current++;
                      setImportError(false);
                      setImportPreview(row.scenario);
                    }}
                  >
                    {row.scenario.name || unnamedRecovered}
                  </button>{" "}
                  <time dateTime={row.restoredAt}>
                    {new Date(row.restoredAt).toLocaleString(
                      locale === "pcm" ? "en-NG" : locale,
                    )}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      {importPreview && (
        <section aria-labelledby="pg-scenario-preview-title">
          <h3 id="pg-scenario-preview-title">{previewLabel}</h3>
          {importPreview.name && <p>{importPreview.name}</p>}
          <p>
            {fmt(importPreview.inputs.powerMW)} MW ·{" "}
            {fmt(importPreview.inputs.baseVoltageKV)} /{" "}
            {fmt(importPreview.inputs.raisedVoltageKV)} kV
          </p>
          <dl className="pg-metrics">
            <div>
              <dt>{text.pf}</dt>
              <dd>{fmt(importPreview.inputs.powerFactor)}</dd>
            </div>
            <div>
              <dt>{text.resistance}</dt>
              <dd>{fmt(importPreview.inputs.lineResistanceOhm)} Ω</dd>
            </div>
            <div>
              <dt>{text.generation}</dt>
              <dd>{fmt(importPreview.inputs.generationVoltageKV)} kV</dd>
            </div>
            <div>
              <dt>{text.distribution}</dt>
              <dd>{fmt(importPreview.inputs.distributionVoltageKV)} kV</dd>
            </div>
            <div>
              <dt>{text.consumer}</dt>
              <dd>{fmt(importPreview.inputs.consumerVoltageKV)} kV</dd>
            </div>
          </dl>
          {importPreview.notes && <p>{importPreview.notes}</p>}
          <p>{previewExplanation}</p>
          <div className="pg-actions">
            <button
              className="button"
              type="button"
              onClick={() => {
                setScenario(importPreview);
                setImportPreview(null);
                setSaved(false);
                setSaveError(false);
              }}
            >
              {applyLabel}
            </button>
            <button
              className="button"
              type="button"
              onClick={() => setImportPreview(null)}
            >
              {cancelLabel}
            </button>
          </div>
        </section>
      )}
      <RadialFeederExperiment />
      <PvPerformanceExperiment />
      <HydroPerformanceExperiment locale={locale} />
      <WindResourceExperiment />
      <MicrogridDispatchExperiment />
      <MeshedPowerFlowExperiment locale={locale} />
      <PowerGridFrequencyExperiment locale={locale} />
    </section>
  );
}
