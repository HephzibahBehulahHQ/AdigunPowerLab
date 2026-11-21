import type { CalculationResult, Project } from "../domain/types";
import type { RadialProjectDemandSource } from "./powergridRadial";

export interface ProjectDemandSnapshot {
  projectName: string;
  loadMW: number;
  loadMvar: number;
  source: RadialProjectDemandSource;
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
