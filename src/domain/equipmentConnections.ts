import { componentBank } from "../data/componentBank";
import type {
  CatalogueEquipmentInstance,
  EquipmentTerminalConnection,
  EquipmentTerminalEndpoint,
} from "./types";

const recordsById = new Map(componentBank.map((entry) => [entry.id, entry]));

export function catalogueRecord(instance: CatalogueEquipmentInstance) {
  const entry = recordsById.get(instance.catalogueId);
  if (
    entry?.source.url === instance.sourceUrl &&
    entry?.source.revision === instance.sourceRevision &&
    (instance.sourcePage === undefined ||
      instance.sourcePage === entry.source.page) &&
    (instance.orderCode === undefined || instance.orderCode === entry.orderCode)
  )
    return entry;
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
  const dcWires = new Map<string, Set<string>>();
  const dcTerminals = new Map<
    string,
    { device: string; polarity: string; label: string }
  >();
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
    if (!terminal || terminal.interface === "pulse-output") return;
    return {
      key: JSON.stringify([instanceId, unit, terminalId]),
      device: JSON.stringify([instanceId, unit]),
      label: `${instance.name} [${unit}]`,
      polarity: terminal.interface,
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
    if (left.domain === "dc") {
      for (const [end, other] of [
        [left, right],
        [right, left],
      ]) {
        const neighbours = dcWires.get(end.key) ?? new Set<string>();
        neighbours.add(other.key);
        dcWires.set(end.key, neighbours);
        dcTerminals.set(end.key, end);
      }
    }
  }

  // Walk conductor nodes only. A PV module itself never joins its two terminals.
  const visited = new Set<string>();
  const shortedDevices = new Set<string>();
  for (const key of dcWires.keys()) {
    if (visited.has(key)) continue;
    const pending = [key];
    visited.add(key);
    const polarities = new Map<string, string>();
    while (pending.length) {
      const current = pending.pop()!;
      const terminal = dcTerminals.get(current)!;
      const existing = polarities.get(terminal.device);
      if (
        existing &&
        existing !== terminal.polarity &&
        !shortedDevices.has(terminal.device)
      ) {
        shortedDevices.add(terminal.device);
        errors.push(
          `Equipment terminal network: PV terminals share a conductor node for ${terminal.label}.`,
        );
      }
      polarities.set(terminal.device, terminal.polarity);
      for (const neighbour of dcWires.get(current)!) {
        if (!visited.has(neighbour)) {
          visited.add(neighbour);
          pending.push(neighbour);
        }
      }
    }
  }
  return errors;
}
