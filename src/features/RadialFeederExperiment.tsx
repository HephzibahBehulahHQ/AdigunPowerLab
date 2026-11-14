import { useContext, useMemo, useState } from "react";
import { Download, GitCompare, RotateCcw, Save } from "lucide-react";
import { LanguageContext } from "../i18n";
import type { Locale } from "../i18n";
import {
  isRadialNetworkInput,
  solveRadialNetwork,
  validateRadialNetwork,
} from "../engine/powergridRadial";
import type {
  RadialNetworkInput,
  RadialNetworkResult,
} from "../engine/powergridRadial";

const SAVE_KEY = "adigunpowerlab.powergrid.radial.v1";

const INITIAL: RadialNetworkInput = {
  sourceBusId: "source",
  sourceVoltageKV: 11,
  buses: [
    { id: "source", loadMW: 0, loadMvar: 0 },
    { id: "north_feeder", loadMW: 0.14, loadMvar: 0.05, minVoltagePU: 0.95 },
    { id: "north_group", loadMW: 0.08, loadMvar: 0.03, minVoltagePU: 0.95 },
    { id: "south_feeder", loadMW: 0.12, loadMvar: 0.04, minVoltagePU: 0.95 },
  ],
  branches: [
    {
      id: "main_north",
      fromBusId: "source",
      toBusId: "north_feeder",
      resistanceOhm: 0.2,
      reactanceOhm: 0.4,
      thermalLimitA: 30,
      inService: true,
    },
    {
      id: "north_lateral",
      fromBusId: "north_feeder",
      toBusId: "north_group",
      resistanceOhm: 0.3,
      reactanceOhm: 0.5,
      thermalLimitA: 20,
      inService: true,
    },
    {
      id: "main_south",
      fromBusId: "source",
      toBusId: "south_feeder",
      resistanceOhm: 0.25,
      reactanceOhm: 0.35,
      thermalLimitA: 25,
      inService: true,
    },
  ],
};

const copy: Record<Locale, Record<string, string>> = {
  en: {
    title: "Radial feeder: voltage drop and outages",
    intro:
      "Edit the illustrative balanced feeder, solve its AC operating point and inspect every feeder group.",
    illustrative:
      "Illustrative training case. Values are editable and are not customer measurements or equipment ratings.",
    source: "Source bus",
    sourceVoltage: "Source line-to-line voltage (kV)",
    group: "Consumer group",
    north: "North feeder group",
    northEnd: "North lateral group",
    south: "South feeder group",
    loadMW: "Active load (MW)",
    loadMvar: "Reactive load (Mvar)",
    minVoltage: "Minimum voltage (pu)",
    branch: "Feeder branches",
    northMain: "Main north feeder",
    northLateral: "North lateral",
    southMain: "Main south feeder",
    resistance: "R per phase (Ω)",
    reactance: "X per phase (Ω)",
    thermal: "Thermal limit (A)",
    inService: "In service",
    solveStatus: "Solver status",
    converged: "Converged",
    islanded: "Islanded: some consumer groups are unserved",
    notConverged: "Did not converge within the configured iteration limit",
    iterations: "Iterations",
    sourcePower: "Source power",
    servedLoad: "Served load",
    unservedLoad: "Unserved load",
    lineLoss: "Feeder real losses",
    reactiveLoss: "Feeder reactive losses",
    voltage: "Bus voltage",
    current: "Branch current",
    sending: "Sending P / Q",
    receiving: "Receiving P / Q",
    constraint: "Constraint",
    low: "Low voltage",
    high: "High voltage",
    overload: "Over thermal limit",
    within: "Within limits",
    capture: "Set comparison reference",
    reference: "Reference scenario captured",
    comparison: "Reference → current",
    currentCase: "Current case",
    voltageChange: "Minimum served voltage change",
    lossChange: "Real loss change",
    save: "Save feeder locally",
    saved: "Feeder saved in this browser",
    json: "Export solved scenario JSON",
    csv: "Export bus and branch readings CSV",
    reset: "Reset training case",
    lesson: "Why do distant loads see lower voltage?",
    lessonText:
      "Loads draw current through feeder impedance. The backward/forward sweep recalculates constant-P/Q load currents from the solved bus voltages, sums branch currents toward the source, then updates downstream voltage phasors. Longer or more heavily loaded paths usually have larger drops. Opening a branch disconnects downstream groups; the solver reports them as unserved instead of inventing a supply path.",
    model: "Model assumptions and solver limits",
    modelText:
      "One fixed-voltage source; balanced three-phase RMS quantities; each consumer group is a constant active/reactive-power load; branch R and X are per phase. The radial backward/forward-sweep model excludes shunt capacitance, transformer taps, source/generator limits, protection, dynamics and closed-loop power flow. Voltage and thermal flags are model checks, not equipment certification.",
    formula:
      "Per phase: Iload = conjugate((P + jQ) / V); Vto = Vfrom − (R + jX)I. Total three-phase line loss = 3|I|²R.",
    errors: "Correct the feeder inputs before solving or exporting.",
  },
  de: {
    title: "Radialer Abzweig: Spannungsfall und Ausfälle",
    intro:
      "Bearbeiten Sie das illustrative symmetrische Netz, lösen Sie den AC-Betriebspunkt und prüfen Sie jede Verbrauchergruppe.",
    illustrative:
      "Illustrativer Übungsfall. Werte sind editierbar und keine Kundenmessungen oder Betriebsmitteldaten.",
    source: "Einspeisung",
    sourceVoltage: "Quellenspannung Außenleiter (kV)",
    group: "Verbrauchergruppe",
    north: "Gruppe Nordabzweig",
    northEnd: "Gruppe Nordstich",
    south: "Gruppe Südabzweig",
    loadMW: "Wirkleistung (MW)",
    loadMvar: "Blindleistung (Mvar)",
    minVoltage: "Mindestspannung (pu)",
    branch: "Abzweige",
    northMain: "Hauptabzweig Nord",
    northLateral: "Nordstich",
    southMain: "Hauptabzweig Süd",
    resistance: "R je Phase (Ω)",
    reactance: "X je Phase (Ω)",
    thermal: "Stromgrenze (A)",
    inService: "In Betrieb",
    solveStatus: "Solverstatus",
    converged: "Konvergiert",
    islanded: "Insel: Verbrauchergruppen sind unversorgt",
    notConverged: "Konvergiert nicht innerhalb der Iterationsgrenze",
    iterations: "Iterationen",
    sourcePower: "Quellenleistung",
    servedLoad: "Versorgte Last",
    unservedLoad: "Unversorgte Last",
    lineLoss: "Wirkverluste der Abzweige",
    reactiveLoss: "Blindverluste der Abzweige",
    voltage: "Knotenspannung",
    current: "Abzweigstrom",
    sending: "Einspeisung P / Q",
    receiving: "Empfang P / Q",
    constraint: "Grenzwert",
    low: "Unterspannung",
    high: "Überspannung",
    overload: "Stromgrenze überschritten",
    within: "Innerhalb der Grenzen",
    capture: "Vergleichsreferenz speichern",
    reference: "Referenzszenario gespeichert",
    comparison: "Referenz → aktuell",
    currentCase: "Aktueller Fall",
    voltageChange: "Änderung der Mindestspannung",
    lossChange: "Änderung der Wirkleistungsverluste",
    save: "Abzweig lokal speichern",
    saved: "Abzweig in diesem Browser gespeichert",
    json: "Gelöstes Szenario als JSON exportieren",
    csv: "Knoten- und Abzweigwerte als CSV exportieren",
    reset: "Übungsfall zurücksetzen",
    lesson: "Warum ist die Spannung an entfernten Lasten niedriger?",
    lessonText:
      "Lasten ziehen Strom durch die Leitungsimpedanz. Die Rückwärts-/Vorwärtssumme berechnet Konstant-P/Q-Ströme aus den Knotenspannungen, summiert Abzweigströme zur Quelle und aktualisiert danach die Spannungszeiger. Längere oder stärker belastete Wege haben meist größere Spannungsfälle. Ein geöffneter Abzweig trennt nachgelagerte Gruppen; der Solver meldet sie als unversorgt.",
    model: "Modellannahmen und Solvergrenzen",
    modelText:
      "Eine Quelle mit fester Spannung; symmetrische dreiphasige RMS-Werte; Verbrauchergruppen als Konstant-P/Q-Lasten; R und X je Phase. Keine Quer-Kapazität, Transformatorstufen, Quellgrenzen, Schutzfunktionen, Dynamik oder vermaschte Lastflussrechnung. Grenzwertmeldungen sind keine Betriebsmittelzertifizierung.",
    formula:
      "Je Phase: Iload = conjugate((P + jQ) / V); Vto = Vfrom − (R + jX)I. Dreiphasige Leitungsverluste = 3|I|²R.",
    errors: "Korrigieren Sie die Abzweigwerte vor Berechnung oder Export.",
  },
  yo: {
    title: "Ẹ̀ka waya radial: ìṣubú foliteji àti ìjákulẹ̀",
    intro:
      "Ṣàtúnṣe nẹ́tíwọ́ọ̀kì ìdánilẹ́kọ̀ọ́ tó dọ́gba, ṣe ìṣirò AC, kí o sì ṣàyẹ̀wò ẹgbẹ́ oníbàárà kọ̀ọ̀kan.",
    illustrative:
      "Àpẹẹrẹ ìdánilẹ́kọ̀ọ́ ni èyí. Àwọn iye lè yí padà; kì í ṣe ìwọ̀n oníbàárà tàbí ìdánimọ̀ ẹ̀rọ.",
    source: "Bus orísun",
    sourceVoltage: "Foliteji orísun láàárín waya (kV)",
    group: "Ẹgbẹ́ oníbàárà",
    north: "Ẹgbẹ́ ẹ̀ka àríwá",
    northEnd: "Ẹgbẹ́ ẹ̀ka kékeré àríwá",
    south: "Ẹgbẹ́ ẹ̀ka gúúsù",
    loadMW: "Agbára gidi (MW)",
    loadMvar: "Agbára reactive (Mvar)",
    minVoltage: "Foliteji tó kéré jù (pu)",
    branch: "Àwọn ẹ̀ka waya",
    northMain: "Ẹ̀ka àríwá pàtàkì",
    northLateral: "Ẹ̀ka kékeré àríwá",
    southMain: "Ẹ̀ka gúúsù pàtàkì",
    resistance: "R fún phase kan (Ω)",
    reactance: "X fún phase kan (Ω)",
    thermal: "Ààlà current (A)",
    inService: "Ó ń ṣiṣẹ́",
    solveStatus: "Ipò solver",
    converged: "Ó péye",
    islanded: "Ó ya sọ́tọ̀: àwọn ẹgbẹ́ kan kò rí agbára",
    notConverged: "Kò péye láàárín iye ìgbésẹ̀ tó gba",
    iterations: "Ìgbésẹ̀ ìṣirò",
    sourcePower: "Agbára orísun",
    servedLoad: "Ẹrù tó rí agbára",
    unservedLoad: "Ẹrù tí kò rí agbára",
    lineLoss: "Ipadánù gidi waya",
    reactiveLoss: "Ipadánù reactive waya",
    voltage: "Foliteji bus",
    current: "Current ẹ̀ka",
    sending: "P / Q tó ń jáde",
    receiving: "P / Q tó ń dé",
    constraint: "Ààlà",
    low: "Foliteji kéré",
    high: "Foliteji ga",
    overload: "Ó kọjá ààlà current",
    within: "Ó wà láàárín ààlà",
    capture: "Fi ìfiwéra ìbẹ̀rẹ̀ pamọ́",
    reference: "A fi scenario ìbẹ̀rẹ̀ pamọ́",
    comparison: "Ìbẹ̀rẹ̀ → lọ́wọ́lọ́wọ́",
    currentCase: "Ọ̀ràn lọ́wọ́lọ́wọ́",
    voltageChange: "Ìyípadà foliteji tó kéré jù",
    lossChange: "Ìyípadà ipadánù gidi",
    save: "Fi ẹ̀ka waya pamọ́ sí browser",
    saved: "A fi ẹ̀ka waya pamọ́ sí browser yìí",
    json: "Gba scenario tí a ṣírò jáde gẹ́gẹ́ bí JSON",
    csv: "Gba àbájáde bus àti ẹ̀ka jáde gẹ́gẹ́ bí CSV",
    reset: "Padà sí àpẹẹrẹ ìdánilẹ́kọ̀ọ́",
    lesson: "Kí ló dé tí foliteji fi kéré sí àwọn ẹrù tó jìnnà?",
    lessonText:
      "Ẹrù ń fa current gba impedance waya. Ìṣirò ẹ̀ka lọ́wọ́ àti sẹ́yìn ń ṣe current fún load P/Q tó dúró, ó ń kó current ẹ̀ka jọ sí orísun, lẹ́yìn náà ó ń ṣe àtúnṣe phasor foliteji. Ọ̀nà tó gùn tàbí ẹrù tó pọ̀ sábà máa ń ní ìṣubú tó pọ̀. Ẹ̀ka tó ṣí máa ń gé àwọn ẹgbẹ́ tó wà lẹ́yìn rẹ̀; solver yóò sọ pé wọn kò rí agbára.",
    model: "Àfojúsùn àwòṣe àti ààlà solver",
    modelText:
      "Orísun kan tó ní foliteji dúró; iye RMS aláfàsẹ́ mẹ́ta tó dọ́gba; load P/Q dúró; R àti X fún phase kan. A kò ṣírò capacitance, transformer taps, ààlà orísun, protection, dynamics tàbí network tó ní loop. Àmì ààlà kì í ṣe ìjẹ́rìí ẹ̀rọ.",
    formula:
      "Fún phase kan: Iload = conjugate((P + jQ) / V); Vto = Vfrom − (R + jX)I. Ipadánù waya mẹ́ta-phase = 3|I|²R.",
    errors: "Ṣàtúnṣe iye ẹ̀ka kí o tó ṣe ìṣirò tàbí export.",
  },
  pcm: {
    title: "Radial feeder: voltage drop and outage",
    intro:
      "Edit dis illustrative balanced feeder, solve di AC operating point and check every consumer group.",
    illustrative:
      "Dis na training example. Values fit change; dem no be customer measurement or equipment rating.",
    source: "Source bus",
    sourceVoltage: "Source line-to-line voltage (kV)",
    group: "Consumer group",
    north: "North feeder group",
    northEnd: "North lateral group",
    south: "South feeder group",
    loadMW: "Active load (MW)",
    loadMvar: "Reactive load (Mvar)",
    minVoltage: "Minimum voltage (pu)",
    branch: "Feeder branches",
    northMain: "Main north feeder",
    northLateral: "North lateral",
    southMain: "Main south feeder",
    resistance: "R per phase (Ω)",
    reactance: "X per phase (Ω)",
    thermal: "Thermal limit (A)",
    inService: "In service",
    solveStatus: "Solver status",
    converged: "Converged",
    islanded: "Islanded: some consumer groups no get supply",
    notConverged: "No converge within di iteration limit",
    iterations: "Iterations",
    sourcePower: "Source power",
    servedLoad: "Load wey get supply",
    unservedLoad: "Load wey no get supply",
    lineLoss: "Feeder real losses",
    reactiveLoss: "Feeder reactive losses",
    voltage: "Bus voltage",
    current: "Branch current",
    sending: "Sending P / Q",
    receiving: "Receiving P / Q",
    constraint: "Limit",
    low: "Low voltage",
    high: "High voltage",
    overload: "Over thermal limit",
    within: "Within limits",
    capture: "Save comparison reference",
    reference: "Reference scenario saved",
    comparison: "Reference → current",
    currentCase: "Current case",
    voltageChange: "Minimum served voltage change",
    lossChange: "Real loss change",
    save: "Save feeder for this browser",
    saved: "Feeder saved for this browser",
    json: "Export solved scenario JSON",
    csv: "Export bus and branch readings CSV",
    reset: "Reset training example",
    lesson: "Why distant loads dey see lower voltage?",
    lessonText:
      "Loads dey draw current through feeder impedance. Di backward/forward sweep calculate constant P/Q currents from solved bus voltages, add branch currents towards di source, then update downstream voltage phasors. Longer or heavier-loaded paths usually get bigger drops. If branch open, downstream groups disconnect; solver report dem as unserved.",
    model: "Model assumptions and solver limits",
    modelText:
      "One fixed-voltage source; balanced three-phase RMS values; constant P/Q consumer loads; R and X per phase. No shunt capacitance, transformer taps, source limits, protection, dynamics or meshed flow. Constraint warnings no be equipment certificate.",
    formula:
      "Per phase: Iload = conjugate((P + jQ) / V); Vto = Vfrom − (R + jX)I. Three-phase line loss = 3|I|²R.",
    errors: "Fix feeder inputs before you solve or export.",
  },
};

const busLabel: Record<string, keyof (typeof copy)["en"]> = {
  north_feeder: "north",
  north_group: "northEnd",
  south_feeder: "south",
};
const branchLabel: Record<string, keyof (typeof copy)["en"]> = {
  main_north: "northMain",
  north_lateral: "northLateral",
  main_south: "southMain",
};

function fmt(value: number, digits = 3) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: digits,
  }).format(value);
}

function loadSaved(): RadialNetworkInput {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null");
    return isRadialNetworkInput(value) &&
      validateRadialNetwork(value).length === 0
      ? value
      : INITIAL;
  } catch {
    return INITIAL;
  }
}

function download(name: string, mime: string, value: string) {
  const url = URL.createObjectURL(new Blob([value], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function RadialFeederExperiment() {
  const locale = useContext(LanguageContext);
  const text = copy[locale];
  const [input, setInput] = useState<RadialNetworkInput>(loadSaved);
  const [saved, setSaved] = useState(false);
  const [reference, setReference] = useState<{
    input: RadialNetworkInput;
    result: RadialNetworkResult;
  }>();
  const errors = useMemo(() => validateRadialNetwork(input), [input]);
  const simulation = useMemo(
    () => (errors.length ? undefined : solveRadialNetwork(input)),
    [input, errors],
  );
  const result =
    simulation?.status === "not-converged" ? undefined : simulation;
  const busName = (id: string) => text[busLabel[id] ?? "group"];
  const branchName = (id: string) => text[branchLabel[id] ?? "branch"];

  const updateBus = (
    id: string,
    key: "loadMW" | "loadMvar" | "minVoltagePU",
    value: number,
  ) => {
    setInput((previous) => ({
      ...previous,
      buses: previous.buses.map((bus) =>
        bus.id === id ? { ...bus, [key]: value } : bus,
      ),
    }));
    setSaved(false);
  };
  const updateBranch = (
    id: string,
    key: "resistanceOhm" | "reactanceOhm" | "thermalLimitA",
    value: number,
  ) => {
    setInput((previous) => ({
      ...previous,
      branches: previous.branches.map((branch) =>
        branch.id === id ? { ...branch, [key]: value } : branch,
      ),
    }));
    setSaved(false);
  };
  const save = () => {
    if (errors.length) return;
    localStorage.setItem(SAVE_KEY, JSON.stringify(input));
    setSaved(true);
  };
  const capture = () => {
    if (result) setReference({ input: structuredClone(input), result });
  };
  const exportScenario = (kind: "json" | "csv") => {
    if (!result) return;
    if (kind === "json") {
      download(
        "powergrid-radial-scenario.json",
        "application/json",
        JSON.stringify(
          {
            schemaVersion: 1,
            model: "balanced-radial-constant-pq-backward-forward-sweep",
            assumptions: text.modelText,
            input,
            result,
          },
          null,
          2,
        ),
      );
      return;
    }
    const rows = [
      "reading,id,voltage_kV,voltage_pu,current_A,sending_MW,sending_Mvar,receiving_MW,receiving_Mvar,real_loss_MW,reactive_loss_Mvar,constraint",
      ...result.buses.map(
        (bus) =>
          `bus,${bus.busId},${bus.voltageLLKV},${bus.voltagePU},,,,,,,,${bus.voltageConstraint}`,
      ),
      ...result.branches.map(
        (branch) =>
          `branch,${branch.branchId},,,${branch.currentA},${branch.sendingMW},${branch.sendingMvar},${branch.receivingMW},${branch.receivingMvar},${branch.realLossMW},${branch.reactiveLossMvar},${branch.thermalConstraint}`,
      ),
    ].join("\n");
    download("powergrid-radial-readings.csv", "text/csv;charset=utf-8", rows);
  };
  const load = input.buses.filter((bus) => bus.id !== input.sourceBusId);
  const minimumServedVoltage = (
    candidate: RadialNetworkResult,
    scenario: RadialNetworkInput,
  ) => {
    const readings = candidate.buses.filter(
      (bus) => bus.busId !== scenario.sourceBusId,
    );
    return readings.length
      ? Math.min(...readings.map((bus) => bus.voltagePU))
      : 0;
  };
  const unservedLoadMW = (
    candidate: RadialNetworkResult,
    scenario: RadialNetworkInput,
  ) =>
    scenario.buses
      .filter((bus) => candidate.unservedBusIds.includes(bus.id))
      .reduce((sum, bus) => sum + bus.loadMW, 0);

  return (
    <section className="pg-radial" aria-labelledby="pg-radial-title">
      <header className="pg-heading">
        <div>
          <span className="eyebrow">
            HB ELEKTRONIKER · POWER SYSTEMS LEARNING LAB
          </span>
          <h2 id="pg-radial-title">{text.title}</h2>
          <p>{text.intro}</p>
        </div>
      </header>
      <p className="pg-isolation">{text.illustrative}</p>
      <section
        className="panel panel-pad pg-panel"
        aria-labelledby="pg-radial-input-title"
      >
        <h3 id="pg-radial-input-title">{text.group}</h3>
        <label className="pg-field pg-source-field">
          <span>{text.sourceVoltage}</span>
          <span className="pg-input-wrap">
            <input
              aria-label={text.sourceVoltage}
              type="number"
              min="0.001"
              step="0.1"
              value={input.sourceVoltageKV}
              onChange={(event) => {
                const sourceVoltageKV = event.currentTarget.valueAsNumber;
                setInput((previous) => ({
                  ...previous,
                  sourceVoltageKV,
                }));
                setSaved(false);
              }}
            />
            <b>kV L-L</b>
          </span>
        </label>
        <div className="pg-radial-table-wrap">
          <table className="pg-radial-table">
            <thead>
              <tr>
                <th>{text.group}</th>
                <th>{text.loadMW}</th>
                <th>{text.loadMvar}</th>
                <th>{text.minVoltage}</th>
              </tr>
            </thead>
            <tbody>
              {load.map((bus) => (
                <tr key={bus.id}>
                  <th scope="row">{busName(bus.id)}</th>
                  <td>
                    <input
                      aria-label={`${busName(bus.id)} ${text.loadMW}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={bus.loadMW}
                      onChange={(event) =>
                        updateBus(
                          bus.id,
                          "loadMW",
                          event.currentTarget.valueAsNumber,
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      aria-label={`${busName(bus.id)} ${text.loadMvar}`}
                      type="number"
                      step="0.01"
                      value={bus.loadMvar}
                      onChange={(event) =>
                        updateBus(
                          bus.id,
                          "loadMvar",
                          event.currentTarget.valueAsNumber,
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      aria-label={`${busName(bus.id)} ${text.minVoltage}`}
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={bus.minVoltagePU ?? 0.95}
                      onChange={(event) =>
                        updateBus(
                          bus.id,
                          "minVoltagePU",
                          event.currentTarget.valueAsNumber,
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3>{text.branch}</h3>
        <div className="pg-radial-table-wrap">
          <table className="pg-radial-table pg-branch-table">
            <thead>
              <tr>
                <th>{text.branch}</th>
                <th>{text.resistance}</th>
                <th>{text.reactance}</th>
                <th>{text.thermal}</th>
                <th>{text.inService}</th>
              </tr>
            </thead>
            <tbody>
              {input.branches.map((branch) => (
                <tr key={branch.id}>
                  <th scope="row">{branchName(branch.id)}</th>
                  <td>
                    <input
                      aria-label={`${branchName(branch.id)} ${text.resistance}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={branch.resistanceOhm}
                      onChange={(event) =>
                        updateBranch(
                          branch.id,
                          "resistanceOhm",
                          event.currentTarget.valueAsNumber,
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      aria-label={`${branchName(branch.id)} ${text.reactance}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={branch.reactanceOhm}
                      onChange={(event) =>
                        updateBranch(
                          branch.id,
                          "reactanceOhm",
                          event.currentTarget.valueAsNumber,
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      aria-label={`${branchName(branch.id)} ${text.thermal}`}
                      type="number"
                      min="0.001"
                      step="1"
                      value={branch.thermalLimitA ?? ""}
                      onChange={(event) =>
                        updateBranch(
                          branch.id,
                          "thermalLimitA",
                          event.currentTarget.valueAsNumber,
                        )
                      }
                    />
                  </td>
                  <td>
                    <label className="pg-switch">
                      <input
                        type="checkbox"
                        checked={branch.inService}
                        aria-label={`${text.inService}: ${branchName(branch.id)}`}
                        onChange={(event) => {
                          const inService = event.currentTarget.checked;
                          setInput((previous) => ({
                            ...previous,
                            branches: previous.branches.map((item) =>
                              item.id === branch.id
                                ? { ...item, inService }
                                : item,
                            ),
                          }));
                          setSaved(false);
                        }}
                      />
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!!errors.length && (
          <div className="pg-errors" role="alert">
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
        aria-labelledby="pg-radial-results-title"
      >
        <h3 id="pg-radial-results-title">{text.solveStatus}</h3>
        {simulation?.status === "not-converged" && (
          <p className="pg-status pg-status-not-converged" role="status">
            {text.notConverged} · {text.iterations}: {simulation.iterations} ·
            ΔV {fmt(simulation.maxVoltageChangePU, 8)} pu
          </p>
        )}
        {result && (
          <>
            <p className={`pg-status pg-status-${result.status}`} role="status">
              {result.status === "converged"
                ? text.converged
                : result.status === "islanded"
                  ? text.islanded
                  : text.notConverged}{" "}
              · {text.iterations}: {result.iterations} · ΔV{" "}
              {fmt(result.maxVoltageChangePU, 8)} pu
            </p>
            <div className="pg-radial-summary">
              <span>
                {text.sourcePower}
                <b>
                  {fmt(result.sourceMW)} MW / {fmt(result.sourceMvar)} Mvar
                </b>
              </span>
              <span>
                {text.servedLoad}
                <b>
                  {fmt(result.totalLoadMW)} MW / {fmt(result.totalLoadMvar)}{" "}
                  Mvar
                </b>
              </span>
              <span>
                {text.unservedLoad}
                <b>{fmt(unservedLoadMW(result, input))} MW</b>
              </span>
              <span>
                {text.lineLoss}
                <b>{fmt(result.realLossMW)} MW</b>
              </span>
              <span>
                {text.reactiveLoss}
                <b>{fmt(result.reactiveLossMvar)} Mvar</b>
              </span>
            </div>
            <div className="pg-radial-table-wrap">
              <table className="pg-radial-table pg-reading-table">
                <thead>
                  <tr>
                    <th>{text.group}</th>
                    <th>{text.voltage}</th>
                    <th>{text.constraint}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.buses
                    .filter((bus) => bus.busId !== input.sourceBusId)
                    .map((bus) => (
                      <tr key={bus.busId}>
                        <th scope="row">{busName(bus.busId)}</th>
                        <td>
                          {fmt(bus.voltageLLKV, 3)} kV · {fmt(bus.voltagePU, 4)}{" "}
                          pu
                        </td>
                        <td>
                          {bus.voltageConstraint === "ok"
                            ? text.within
                            : bus.voltageConstraint === "low"
                              ? text.low
                              : text.high}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="pg-radial-table-wrap">
              <table className="pg-radial-table pg-reading-table">
                <thead>
                  <tr>
                    <th>{text.branch}</th>
                    <th>{text.current}</th>
                    <th>{text.sending}</th>
                    <th>{text.receiving}</th>
                    <th>{text.lineLoss}</th>
                    <th>{text.constraint}</th>
                  </tr>
                </thead>
                <tbody>
                  {input.branches.map((branch) => {
                    const reading = result.branches.find(
                      (item) => item.branchId === branch.id,
                    );
                    return (
                      <tr key={branch.id}>
                        <th scope="row">{branchName(branch.id)}</th>
                        <td>
                          {reading
                            ? `${fmt(reading.currentA, 2)} A`
                            : branch.inService
                              ? "—"
                              : text.unservedLoad}
                        </td>
                        <td>
                          {reading
                            ? `${fmt(reading.sendingMW, 4)} / ${fmt(reading.sendingMvar, 4)}`
                            : "—"}
                        </td>
                        <td>
                          {reading
                            ? `${fmt(reading.receivingMW, 4)} / ${fmt(reading.receivingMvar, 4)}`
                            : "—"}
                        </td>
                        <td>
                          {reading ? `${fmt(reading.realLossMW, 5)} MW` : "—"}
                        </td>
                        <td>
                          {reading?.thermalConstraint === "overload"
                            ? text.overload
                            : reading
                              ? text.within
                              : text.unservedLoad}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        {errors.length > 0 && (
          <p className="pg-errors" role="status">
            {text.errors}
          </p>
        )}
      </section>

      <div className="pg-actions">
        <button
          className="button"
          onClick={save}
          disabled={!!errors.length || !result}
        >
          <Save size={16} />
          {text.save}
        </button>
        {saved && (
          <span role="status" className="pg-saved">
            {text.saved}
          </span>
        )}
        <button className="button" onClick={capture} disabled={!result}>
          <GitCompare size={16} />
          {text.capture}
        </button>
        <button
          className="button"
          onClick={() => exportScenario("json")}
          disabled={!result}
        >
          <Download size={16} />
          {text.json}
        </button>
        <button
          className="button"
          onClick={() => exportScenario("csv")}
          disabled={!result}
        >
          <Download size={16} />
          {text.csv}
        </button>
        <button
          className="button"
          onClick={() => {
            setInput(structuredClone(INITIAL));
            setReference(undefined);
            setSaved(false);
          }}
        >
          <RotateCcw size={16} />
          {text.reset}
        </button>
      </div>
      {reference && result && (
        <section
          className="panel panel-pad pg-panel"
          aria-label={text.comparison}
        >
          <h3>{text.comparison}</h3>
          <p>{text.reference}</p>
          <div className="pg-radial-summary">
            <span>
              {text.currentCase}
              <b>
                {fmt(result.sourceMW)} MW source · {fmt(result.realLossMW)} MW
                loss
              </b>
            </span>
            <span>
              {text.voltageChange}
              <b>
                {fmt(
                  (minimumServedVoltage(result, input) -
                    minimumServedVoltage(reference.result, reference.input)) *
                    100,
                  3,
                )}{" "}
                percentage points
              </b>
            </span>
            <span>
              {text.lossChange}
              <b>
                {fmt(result.realLossMW - reference.result.realLossMW, 5)} MW
              </b>
            </span>
            <span>
              {text.unservedLoad}
              <b>
                {fmt(unservedLoadMW(reference.result, reference.input))} →{" "}
                {fmt(unservedLoadMW(result, input))} MW
              </b>
            </span>
          </div>
        </section>
      )}
      <details className="panel panel-pad pg-limit">
        <summary>{text.lesson}</summary>
        <p>{text.lessonText}</p>
      </details>
      <details className="panel panel-pad pg-limit">
        <summary>{text.model}</summary>
        <p>{text.modelText}</p>
        <p>
          <strong>{text.formula}</strong>
        </p>
      </details>
    </section>
  );
}
