import { componentBank } from "../data/componentBank";
import type {
  CatalogueEquipmentInstance,
  EquipmentTerminalConnection,
  EquipmentTerminalEndpoint,
} from "./types";

export function catalogueRecord(instance: CatalogueEquipmentInstance) {
  return componentBank.find(
    (entry) =>
      entry.id === instance.catalogueId &&
      entry.source.url === instance.sourceUrl &&
      entry.source.revision === instance.sourceRevision,
  );
}

export function equipmentConnectionErrors(
  input: unknown,
  instances: readonly CatalogueEquipmentInstance[],
): string[] {
  if (!Array.isArray(input) || input.length > 10000)
    return ["Expected at most 10,000 equipment terminal connections."];

  const equipment = new Map(instances.map((item) => [item.id, item]));
  const ids = new Set<string>();
  const pairs = new Set<string>();
  const polePhases = new Map<string, string>();
  const errors: string[] = [];
  function resolve(input: unknown) {
    if (typeof input !== "object" || input === null) return;
    const { instanceId, unit, terminalId } =
      input as Partial<EquipmentTerminalEndpoint>;
    if (typeof instanceId !== "string" || typeof unit !== "number") return;
    const instance = equipment.get(instanceId);
    if (
      !instance ||
      !Number.isInteger(unit) ||
      unit < 1 ||
      unit > instance.quantity
    )
      return;
    const model = catalogueRecord(instance);
    const terminal = model?.terminals.find((entry) => entry.id === terminalId);
    if (!terminal) return;
    return {
      key: JSON.stringify([instanceId, unit, terminalId]),
      device: JSON.stringify([instanceId, unit]),
      domain:
        terminal.interface === "dc-positive" ||
        terminal.interface === "dc-negative"
          ? "dc"
          : terminal.interface,
      pole: JSON.stringify([
        instanceId,
        unit,
        terminal.id.replace(/-(top|bottom)$/, ""),
      ]),
    };
  }

  for (const [index, row] of input.entries()) {
    const label = `Equipment terminal connection ${index + 1}`;
    const { id, from, to, phase } = (row ??
      {}) as Partial<EquipmentTerminalConnection>;
    if (
      typeof id !== "string" ||
      !id.trim() ||
      id.length > 256 ||
      ids.has(id)
    ) {
      errors.push(`${label}: invalid or duplicate ID.`);
      continue;
    }
    ids.add(id);
    const left = resolve(from);
    const right = resolve(to);
    if (
      !left ||
      !right ||
      left.device === right.device ||
      left.domain !== right.domain
    ) {
      errors.push(`${label}: missing or incompatible endpoints.`);
      continue;
    }
    const pair = JSON.stringify([left.key, right.key].sort());
    if (pairs.has(pair)) {
      errors.push(`${label}: duplicate endpoint pair.`);
      continue;
    }
    if (left.domain === "ac-line") {
      if (phase !== "L1" && phase !== "L2" && phase !== "L3") {
        errors.push(`${label}: AC line links require L1, L2 or L3.`);
        continue;
      }
      if (
        [left.pole, right.pole].some(
          (pole) => polePhases.has(pole) && polePhases.get(pole) !== phase,
        )
      ) {
        errors.push(`${label}: conflicting phases on the same pole.`);
        continue;
      }
      polePhases.set(left.pole, phase);
      polePhases.set(right.pole, phase);
    } else if (phase !== undefined) {
      errors.push(`${label}: phase is only valid for AC line links.`);
      continue;
    }
    pairs.add(pair);
  }
  return errors;
}
