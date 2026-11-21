import {
  unpackPowerGridScenario,
  type PowerGridScenario,
} from "../import-export/powergridScenario";
import { openPowerLabDatabase } from "./database";

export const POWERGRID_RECOVERY_PREFIX = "powergrid-transmission-restore:";
export const powerGridRecoveryRange = () =>
  IDBKeyRange.bound(
    POWERGRID_RECOVERY_PREFIX,
    POWERGRID_RECOVERY_PREFIX + "\uffff",
  );

export function readRecoveredPowerGridRow(raw: unknown) {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (
    typeof row.key !== "string" ||
    !row.key.startsWith(POWERGRID_RECOVERY_PREFIX) ||
    typeof row.restoredAt !== "string" ||
    !Number.isFinite(Date.parse(row.restoredAt))
  )
    return null;
  const scenario = unpackPowerGridScenario(row.scenario);
  return scenario
    ? { key: row.key, restoredAt: row.restoredAt, scenario }
    : null;
}

export interface RecoveredPowerGridScenario {
  key: string;
  restoredAt: string;
  scenario: PowerGridScenario;
}

export async function listRecoveredPowerGridScenarios(): Promise<
  RecoveredPowerGridScenario[]
> {
  const db = await openPowerLabDatabase();
  return new Promise((resolve, reject) => {
    const request = db
      .transaction("metadata")
      .objectStore("metadata")
      .getAll(powerGridRecoveryRange());
    request.onsuccess = () =>
      resolve(
        request.result
          .flatMap((raw) => {
            const row = readRecoveredPowerGridRow(raw);
            return row ? [row] : [];
          })
          .sort((a, b) => b.restoredAt.localeCompare(a.restoredAt)),
      );
    request.onerror = () => reject(request.error);
  });
}
