import {
  DEFAULT_POWERGRID_INPUTS,
  isPowerGridInputs,
  type PowerGridInputs,
} from "../engine/powergrid";
import { REGIONAL_TEACHING_PRESETS } from "../engine/powergridRegions";

export const POWERGRID_SCENARIO_MODEL =
  "balanced-three-phase-constant-power-line-loss";
export const POWERGRID_SCENARIO_KEY = "adigunpowerlab.powergrid.experiment.v1";
export const POWERGRID_SCENARIO_MAX_BYTES = 64 * 1024;
export const POWERGRID_SCENARIO_NAME_LIMIT = 80;
export const POWERGRID_SCENARIO_NOTES_LIMIT = 400;

export interface PowerGridScenario {
  inputs: PowerGridInputs;
  name: string;
  notes: string;
  regionalPresetId?: string;
}

export function packPowerGridScenario(scenario: PowerGridScenario) {
  return { schemaVersion: 2, model: POWERGRID_SCENARIO_MODEL, ...scenario };
}

function checkedInputs(value: unknown): PowerGridInputs | null {
  if (!value || typeof value !== "object") return null;
  const entries = Object.keys(DEFAULT_POWERGRID_INPUTS).map((key) => [
    key,
    (value as Record<string, unknown>)[key],
  ]);
  const candidate: unknown = Object.fromEntries(entries);
  return isPowerGridInputs(candidate) ? candidate : null;
}

export function unpackPowerGridScenario(
  value: unknown,
): PowerGridScenario | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (
    record.model !== POWERGRID_SCENARIO_MODEL ||
    (record.schemaVersion !== 1 && record.schemaVersion !== 2)
  )
    return null;
  const inputs = checkedInputs(record.inputs);
  if (!inputs) return null;
  if (record.schemaVersion === 1) return { inputs, name: "", notes: "" };
  const { name, notes, regionalPresetId } = record;
  if (
    typeof name !== "string" ||
    name.length > POWERGRID_SCENARIO_NAME_LIMIT ||
    typeof notes !== "string" ||
    notes.length > POWERGRID_SCENARIO_NOTES_LIMIT ||
    (regionalPresetId !== undefined &&
      !REGIONAL_TEACHING_PRESETS.some(
        (preset) => preset.id === regionalPresetId,
      ))
  )
    return null;
  return {
    inputs,
    name,
    notes,
    regionalPresetId: regionalPresetId as string | undefined,
  };
}

export function readStoredPowerGridScenario(): PowerGridScenario | null {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(POWERGRID_SCENARIO_KEY) ?? "null",
    );
    const scenario = unpackPowerGridScenario(saved);
    if (scenario) return scenario;
    const oldInputs = checkedInputs(saved);
    if (oldInputs) return { inputs: oldInputs, name: "", notes: "" };
  } catch {
    // An unavailable or invalid saved copy does not prevent opening the lab.
  }
  return null;
}

export function readSavedPowerGridScenario(): PowerGridScenario {
  return (
    readStoredPowerGridScenario() ?? {
      inputs: DEFAULT_POWERGRID_INPUTS,
      name: "",
      notes: "",
    }
  );
}
