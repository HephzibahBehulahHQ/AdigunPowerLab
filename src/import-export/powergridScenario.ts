import {
  DEFAULT_POWERGRID_INPUTS,
  isPowerGridInputs,
  type PowerGridInputs,
} from "../engine/powergrid";
import { REGIONAL_TEACHING_PRESETS } from "../engine/powergridRegions";

export const POWERGRID_SCENARIO_MODEL =
  "balanced-three-phase-constant-power-line-loss";
export const POWERGRID_SCENARIO_KEY = "adigunpowerlab.powergrid.experiment.v1";
const draftKey = "adigunpowerlab.powergrid.transmission-draft.v1";
export const POWERGRID_SCENARIO_MAX_BYTES = 64 * 1024;
export const POWERGRID_SCENARIO_NAME_LIMIT = 80;
export const POWERGRID_SCENARIO_NOTES_LIMIT = 400;

export interface PowerGridScenario {
  inputs: PowerGridInputs;
  name: string;
  notes: string;
  regionalPresetId?: string;
}

export interface PowerGridRevision {
  scenario: PowerGridScenario;
  savedAt?: string;
}
const REVISION_LIMIT = 20;

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

const storedDate = (value: unknown) =>
  typeof value === "string" && Number.isFinite(Date.parse(value))
    ? value
    : undefined;

export function readStoredPowerGridDocument(): {
  current: PowerGridScenario | null;
  savedAt?: string;
  revisions: PowerGridRevision[];
} {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(POWERGRID_SCENARIO_KEY) ?? "null",
    );
    const scenario = unpackPowerGridScenario(saved);
    if (scenario) {
      const record = saved as Record<string, unknown>;
      const revisions = Array.isArray(record.revisions)
        ? record.revisions
            .slice(0, REVISION_LIMIT)
            .flatMap((entry: unknown) => {
              if (!entry || typeof entry !== "object") return [];
              const revision = entry as Record<string, unknown>;
              const scenario = unpackPowerGridScenario(revision.scenario);
              return scenario
                ? [{ scenario, savedAt: storedDate(revision.savedAt) }]
                : [];
            })
        : [];
      return {
        current: scenario,
        savedAt: storedDate(record.savedAt),
        revisions,
      };
    }
    const oldInputs = checkedInputs(saved);
    if (oldInputs)
      return {
        current: { inputs: oldInputs, name: "", notes: "" },
        revisions: [],
      };
  } catch {
    // An unavailable or invalid saved copy does not prevent opening the lab.
  }
  return { current: null, revisions: [] };
}

export function savePowerGridRevision(scenario: PowerGridScenario) {
  const validated = unpackPowerGridScenario(packPowerGridScenario(scenario));
  if (!validated) throw new Error("Invalid transmission scenario.");
  const next = packPowerGridScenario(validated);
  const stored = readStoredPowerGridDocument();
  if (
    stored.current &&
    JSON.stringify(next) ===
      JSON.stringify(packPowerGridScenario(stored.current))
  ) {
    return stored.revisions;
  }
  const revisions = stored.current
    ? [
        { scenario: stored.current, savedAt: stored.savedAt },
        ...stored.revisions,
      ].slice(0, REVISION_LIMIT)
    : [];
  localStorage.setItem(
    POWERGRID_SCENARIO_KEY,
    JSON.stringify({
      ...next,
      savedAt: new Date().toISOString(),
      revisions: revisions.map((revision) => ({
        savedAt: revision.savedAt,
        scenario: packPowerGridScenario(revision.scenario),
      })),
    }),
  );
  return revisions;
}

export function readSavedPowerGridScenario(): PowerGridScenario {
  return (
    readStoredPowerGridDocument().current ?? {
      inputs: DEFAULT_POWERGRID_INPUTS,
      name: "",
      notes: "",
    }
  );
}

export function readPowerGridDraft(): PowerGridScenario | null {
  try {
    const draft = unpackPowerGridScenario(
      JSON.parse(localStorage.getItem(draftKey) ?? "null"),
    );
    return draft && !matchesSavedScenario(draft) ? draft : null;
  } catch {
    return null;
  }
}

function matchesSavedScenario(scenario: PowerGridScenario) {
  return (
    JSON.stringify(packPowerGridScenario(scenario)) ===
    JSON.stringify(packPowerGridScenario(readSavedPowerGridScenario()))
  );
}

export function storePowerGridDraft(scenario: PowerGridScenario) {
  const packed = packPowerGridScenario(scenario);
  if (!unpackPowerGridScenario(packed)) return;
  if (matchesSavedScenario(scenario)) clearPowerGridDraft();
  else localStorage.setItem(draftKey, JSON.stringify(packed));
}

export function clearPowerGridDraft() {
  localStorage.removeItem(draftKey);
}
