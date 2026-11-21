import type { CalculationResult, Project } from "../domain/types";
import type { RadialProjectDemandSource } from "./powergridRadial";

export interface ProjectDemandSnapshot {
  projectName: string;
  loadMW: number;
  loadMvar: number;
  source: RadialProjectDemandSource;
}

export interface RecurringProjectDemand {
  source: Omit<RadialProjectDemandSource, "basis"> & {
    basis: "project-recurring-hourly-active-demand";
  };
  hourlyKW: number[];
}

export function isRecurringProjectDemand(
  value: unknown,
): value is RecurringProjectDemand {
  if (!value || typeof value !== "object") return false;
  const { source, hourlyKW } = value as Partial<RecurringProjectDemand>;
  return Boolean(
    source &&
    source.basis === "project-recurring-hourly-active-demand" &&
    typeof source.projectId === "string" &&
    source.projectId.length > 0 &&
    Number.isSafeInteger(source.revision) &&
    source.revision >= 0 &&
    typeof source.engineVersion === "string" &&
    source.engineVersion.length > 0 &&
    typeof source.capturedAt === "string" &&
    Number.isFinite(Date.parse(source.capturedAt)) &&
    Array.isArray(hourlyKW) &&
    hourlyKW.length === 24 &&
    hourlyKW.every((kw) => Number.isFinite(kw) && kw >= 0 && kw <= 1_000_000) &&
    hourlyKW.some((kw) => kw > 0),
  );
}

export function snapshotRecurringProjectDemand(
  project: Project,
  result: CalculationResult,
): RecurringProjectDemand | null {
  if (
    result.revision !== project.revision ||
    project.loads.some((load) => load.connection === "dc") ||
    result.loads.some((load) => !load.valid) ||
    result.profile.some((point, index) => point.hour !== index)
  )
    return null;
  const snapshot: RecurringProjectDemand = {
    source: {
      projectId: project.id,
      revision: project.revision,
      engineVersion: result.engineVersion,
      capturedAt: new Date().toISOString(),
      basis: "project-recurring-hourly-active-demand",
    },
    hourlyKW: result.profile.map((point) => point.kw),
  };
  return isRecurringProjectDemand(snapshot) ? snapshot : null;
}

export function snapshotProjectDemand(
  project: Project,
  result: CalculationResult,
): ProjectDemandSnapshot | null {
  if (
    result.revision !== project.revision ||
    project.loads.some((load) => load.connection === "dc") ||
    result.loads.some((load) => !load.valid) ||
    !Number.isFinite(result.designKW) ||
    result.designKW <= 0 ||
    result.reactiveKvar === null ||
    !Number.isFinite(result.reactiveKvar)
  )
    return null;
  return {
    projectName: project.name,
    loadMW: result.designKW / 1000,
    loadMvar: result.reactiveKvar / 1000,
    source: {
      projectId: project.id,
      revision: project.revision,
      engineVersion: result.engineVersion,
      capturedAt: new Date().toISOString(),
      basis: "balanced-project-design-pq",
    },
  };
}
