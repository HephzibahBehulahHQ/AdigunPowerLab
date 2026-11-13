import { createLoad } from "../domain/project";
import type { CalculationResult, Issue, Load, Project } from "../domain/types";
import type { Phase } from "../domain/types";
import { calculateProject, normalizeLoad } from "../engine/electrical";
import {
  applyPhaseBalance,
  previewPhaseBalance,
  type BalancePlan,
} from "../engine/planning";
import {
  applyProjectCommand,
  previewProjectCommand,
  type CommandPreview,
} from "../commands/projectCommands";

export const LOCAL_CAPABILITIES = [
  { id: "getProjectSummary", mutates: false },
  { id: "getSelectedObject", mutates: false },
  { id: "explainCalculation", mutates: false },
  { id: "listMissingInputs", mutates: false },
  { id: "runCalculation", mutates: false },
  { id: "proposePhaseBalance", mutates: false },
  { id: "proposeLoadPhase", mutates: false },
  { id: "proposeLoads", mutates: false },
  { id: "proposeLoadEdits", mutates: false },
  { id: "previewProjectChanges", mutates: false },
  { id: "applyConfirmedChanges", mutates: true, requiresConfirmation: true },
  { id: "prepareReportNarrative", mutates: false },
] as const;

export interface LoadProposal {
  kind: "load";
  projectId: string;
  revision: number;
  load: Load;
  beforeKW: number;
  afterKW: number;
}
export interface PhaseProposal {
  kind: "balance";
  projectId: string;
  revision: number;
  plan: BalancePlan;
}
export interface LoadEditProposal {
  kind: "load-edit";
  projectId: string;
  revision: number;
  before: Load;
  after: Load;
  beforeKW: number;
  afterKW: number;
}
export interface CommandProposal {
  kind: "command";
  preview: CommandPreview;
}
export type Proposal =
  LoadProposal | PhaseProposal | LoadEditProposal | CommandProposal;
export interface LocalResponse {
  kind:
    "summary" | "explain" | "issues" | "balance" | "load" | "report" | "help";
  projectId: string;
  revision: number;
  result: CalculationResult;
  selectedLoad?: Load;
  issues?: Issue[];
  proposal?: Proposal;
}

export function getProjectSummary(project: Project): CalculationResult {
  return calculateProject(project);
}
export function getSelectedObject(project: Project, id?: string) {
  return (
    project.loads.find((item) => item.id === id) ??
    project.circuits.find((item) => item.id === id) ??
    project.boards.find((item) => item.id === id)
  );
}
export function listMissingInputs(project: Project): Issue[] {
  return calculateProject(project).issues.filter((issue) =>
    ["incomplete", "unsupported", "failed"].includes(issue.assessment),
  );
}
export function proposePhaseBalance(project: Project): PhaseProposal {
  return {
    kind: "balance",
    projectId: project.id,
    revision: project.revision,
    plan: previewPhaseBalance(project),
  };
}

/** Deliberately narrow typed command, not an imitation language model. */
export function parseLoadProposal(
  project: Project,
  input: string,
): LoadProposal | undefined {
  const match =
    /^load\s*:\s*([^;]{1,120})\s*;\s*(\d+(?:[.,]\d+)?)\s*kw\s*;\s*(\d+(?:[.,]\d+)?)\s*v\s*;\s*pf\s*(\d+(?:[.,]\d+)?)\s*;\s*(\d+(?:[.,]\d+)?)\s*h\s*$/i.exec(
      input.trim(),
    );
  if (!match) return undefined;
  const parse = (number: string) => Number(number.replace(",", "."));
  const load = createLoad({
    name: match[1].trim(),
    rating: parse(match[2]),
    voltage: parse(match[3]),
    pf: parse(match[4]),
    hoursPerDay: parse(match[5]),
    source: {
      kind: "user",
      reference:
        "Explicit typed local-assistant proposal; accepted only after review.",
    },
  });
  const normalized = normalizeLoad(load);
  if (!normalized.valid)
    throw new Error(normalized.issues.map((issue) => issue.message).join(" "));
  const before = calculateProject(project);
  const after = calculateProject({
    ...project,
    loads: [...project.loads, load],
  });
  return {
    kind: "load",
    projectId: project.id,
    revision: project.revision,
    load,
    beforeKW: before.designKW,
    afterKW: after.designKW,
  };
}

/** Exact-name, single-field edits only. The preview never changes project data. */
export function parseLoadEditProposal(
  project: Project,
  input: string,
): LoadEditProposal | undefined {
  const match =
    /^edit\s+load\s*:\s*([^;]{1,120})\s*;\s*(name|rating_kw|voltage_v|power_factor|hours_per_day|quantity)\s*;\s*([^;]{1,120})\s*$/i.exec(
      input.trim(),
    );
  if (!match) return undefined;
  const name = match[1].trim();
  const matches = project.loads.filter(
    (load) =>
      load.name.localeCompare(name, undefined, { sensitivity: "accent" }) === 0,
  );
  if (matches.length !== 1)
    throw new Error(
      matches.length
        ? "Load name is ambiguous. Use a unique load name."
        : "No load with that exact name was found.",
    );
  const before = matches[0];
  const field = match[2].toLocaleLowerCase();
  const after = structuredClone(before);
  const raw = match[3].trim();
  if (field === "name") {
    if (!raw) throw new Error("Load name cannot be empty.");
    if (
      project.loads.some(
        (load) =>
          load.id !== before.id &&
          load.name.toLocaleLowerCase() === raw.toLocaleLowerCase(),
      )
    )
      throw new Error("Load name must remain unique for future commands.");
    after.name = raw;
  } else {
    const numeric = /^(\d+(?:[.,]\d+)?)$/.exec(raw);
    if (!numeric)
      throw new Error("Enter one positive numeric value for this field.");
    const value = Number(numeric[1].replace(",", "."));
    if (field === "rating_kw") {
      if (before.entryMode !== "kw")
        throw new Error("rating_kw can only edit loads entered in kW mode.");
      after.rating = value;
    } else if (field === "voltage_v") after.voltage = value;
    else if (field === "power_factor") after.pf = value;
    else if (field === "hours_per_day") after.hoursPerDay = value;
    else after.quantity = value;
  }
  const normalized = normalizeLoad(after);
  if (!normalized.valid)
    throw new Error(normalized.issues.map((issue) => issue.message).join(" "));
  const afterLoads = project.loads.map((load) =>
    load.id === before.id ? after : load,
  );
  return {
    kind: "load-edit",
    projectId: project.id,
    revision: project.revision,
    before: structuredClone(before),
    after,
    beforeKW: calculateProject(project).designKW,
    afterKW: calculateProject({ ...project, loads: afterLoads }).designKW,
  };
}

/** Typed load-phase command; the project command layer validates all connected loads. */
export function parseLoadPhaseProposal(
  project: Project,
  input: string,
): CommandProposal | undefined {
  const match = /^phase\s+load\s*:\s*([^;]{1,120})\s*;\s*(L[123])\s*$/i.exec(
    input.trim(),
  );
  if (!match) return undefined;
  const name = match[1].trim();
  const matches = project.loads.filter(
    (load) =>
      load.name.localeCompare(name, undefined, { sensitivity: "accent" }) === 0,
  );
  if (matches.length !== 1)
    throw new Error(
      matches.length
        ? "Load name is ambiguous. Use a unique load name."
        : "No load with that exact name was found.",
    );
  const phase = match[2].toUpperCase() as Phase;
  const preview = previewProjectCommand(project, {
    kind: "loads.phase",
    ids: [matches[0].id],
    phase,
  });
  if (preview.errors.length) throw new Error(preview.errors.join(" "));
  if (!preview.changes.length)
    throw new Error(`${matches[0].name} is already assigned to ${phase}.`);
  return { kind: "command", preview };
}

/** Typed exact-name assignment; the preview exposes board and phase side effects. */
export function parseLoadCircuitAssignmentProposal(
  project: Project,
  input: string,
): CommandProposal | undefined {
  const match =
    /^assign\s+load\s*:\s*([^;]{1,120})\s*;\s*circuit\s*:\s*([^;]{1,120})\s*$/i.exec(
      input.trim(),
    );
  if (!match) return undefined;
  const loadName = match[1].trim();
  const circuitName = match[2].trim();
  const loads = project.loads.filter(
    (load) =>
      load.name.localeCompare(loadName, undefined, {
        sensitivity: "accent",
      }) === 0,
  );
  if (loads.length !== 1)
    throw new Error(
      loads.length
        ? "Load name is ambiguous. Use a unique load name."
        : "No load with that exact name was found.",
    );
  const circuits = project.circuits.filter(
    (circuit) =>
      circuit.name.localeCompare(circuitName, undefined, {
        sensitivity: "accent",
      }) === 0,
  );
  if (circuits.length !== 1)
    throw new Error(
      circuits.length
        ? "Circuit name is ambiguous. Use a unique circuit name."
        : "No circuit with that exact name was found.",
    );
  const preview = previewProjectCommand(project, {
    kind: "loads.assign",
    ids: [loads[0].id],
    circuitId: circuits[0].id,
  });
  if (preview.errors.length) throw new Error(preview.errors.join(" "));
  if (!preview.changes.length)
    throw new Error(
      `${loads[0].name} is already assigned to ${circuits[0].name}.`,
    );
  return { kind: "command", preview };
}

export function runLocalCommand(
  project: Project,
  input: string,
  selectedId?: string,
): LocalResponse {
  const result = calculateProject(project);
  const base = { projectId: project.id, revision: project.revision, result };
  const loadProposal = parseLoadProposal(project, input);
  if (loadProposal) return { ...base, kind: "load", proposal: loadProposal };
  const loadEditProposal = parseLoadEditProposal(project, input);
  if (loadEditProposal)
    return { ...base, kind: "load", proposal: loadEditProposal };
  const phaseProposal = parseLoadPhaseProposal(project, input);
  if (phaseProposal)
    return { ...base, kind: "balance", proposal: phaseProposal };
  const circuitAssignmentProposal = parseLoadCircuitAssignmentProposal(
    project,
    input,
  );
  if (circuitAssignmentProposal)
    return { ...base, kind: "load", proposal: circuitAssignmentProposal };
  const command = input.trim().toLocaleLowerCase();
  if (/balance|phasen|ìdọ́gba|ido.gba|phases/.test(command))
    return { ...base, kind: "balance", proposal: proposePhaseBalance(project) };
  if (
    /missing|issue|warn|fehl|hinweis|ìṣòro|ohun.*kù|problem|check/.test(command)
  )
    return { ...base, kind: "issues", issues: listMissingInputs(project) };
  if (/explain|formula|method|erklär|berechn|ṣàlàyé|salaye/.test(command))
    return {
      ...base,
      kind: "explain",
      selectedLoad: project.loads.find((load) => load.id === selectedId),
    };
  if (/report|print|bericht|ìròyìn|iroyin/.test(command))
    return { ...base, kind: "report" };
  if (
    /summary|overview|result|zusammen|übersicht|àkótán|akotan|energy|power|demand/.test(
      command,
    )
  )
    return { ...base, kind: "summary" };
  return { ...base, kind: "help" };
}

/** Run inside the owner's single undoable command. Stale proposal data never changes a newer project. */
export function applyProposal(draft: Project, proposal: Proposal): void {
  const projectId =
    proposal.kind === "command"
      ? proposal.preview.projectId
      : proposal.projectId;
  const revision =
    proposal.kind === "command" ? proposal.preview.revision : proposal.revision;
  if (draft.id !== projectId || draft.revision !== revision)
    throw new Error(
      "Project changed after this preview. Request a new proposal before applying changes.",
    );
  if (proposal.kind === "balance") {
    const next = applyPhaseBalance(
      draft,
      proposal.plan.moves,
      proposal.revision,
    );
    // The root command layer owns revision increments and undo history.
    draft.loads = next.loads;
    draft.circuits = next.circuits;
  } else if (proposal.kind === "load") {
    const normalized = normalizeLoad(proposal.load);
    if (
      !normalized.valid ||
      draft.loads.some((load) => load.id === proposal.load.id)
    )
      throw new Error("Load proposal is invalid or already applied.");
    draft.loads.push(structuredClone(proposal.load));
  } else if (proposal.kind === "load-edit") {
    const index = draft.loads.findIndex(
      (load) => load.id === proposal.before.id,
    );
    if (
      index < 0 ||
      JSON.stringify(draft.loads[index]) !== JSON.stringify(proposal.before)
    )
      throw new Error(
        "Load changed after this preview. Request a new proposal before applying changes.",
      );
    const normalized = normalizeLoad(proposal.after);
    if (!normalized.valid || proposal.after.id !== proposal.before.id)
      throw new Error("Load edit is invalid.");
    draft.loads[index] = structuredClone(proposal.after);
  } else {
    Object.assign(draft, applyProjectCommand(draft, proposal.preview));
  }
}
