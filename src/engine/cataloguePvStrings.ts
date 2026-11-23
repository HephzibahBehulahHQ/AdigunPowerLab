import { catalogueRecord } from "../domain/equipmentConnections";
import type { EquipmentTerminalEndpoint, Project } from "../domain/types";

/** Isolated, same-model series chains only. Values are published STC nameplates. */
export function cataloguePvStrings(project: Project) {
  const equipment = new Map(
    (project.catalogueEquipment ?? []).map((item) => [item.id, item]),
  );
  const endpointKey = ({ instanceId, unit }: EquipmentTerminalEndpoint) =>
    JSON.stringify([instanceId, unit]);
  const adjacency = new Map<string, string[]>();
  const ends = new Map<string, EquipmentTerminalEndpoint>();
  const next = new Map<string, string>();
  const previous = new Map<string, string>();
  const unsupported = new Set<string>();

  for (const { from, to } of project.equipmentTerminalConnections ?? []) {
    const a = equipment.get(from.instanceId);
    const b = equipment.get(to.instanceId);
    if (!a || !b || from.terminalId === "frame" || to.terminalId === "frame")
      continue;
    if (
      catalogueRecord(a)?.connection !== "dc" ||
      catalogueRecord(b)?.connection !== "dc"
    )
      continue;
    const left = endpointKey(from);
    const right = endpointKey(to);
    for (const [key, other, endpoint] of [
      [left, right, from],
      [right, left, to],
    ] as const) {
      const neighbours = adjacency.get(key) ?? [];
      neighbours.push(other);
      adjacency.set(key, neighbours);
      ends.set(key, endpoint);
    }
    if (from.terminalId === to.terminalId || a.catalogueId !== b.catalogueId) {
      unsupported.add(left);
      unsupported.add(right);
      continue;
    }
    const [negative, positive] =
      from.terminalId === "negative" ? [left, right] : [right, left];
    if (next.has(positive) || previous.has(negative)) {
      unsupported.add(positive);
      unsupported.add(negative);
    }
    next.set(positive, negative);
    previous.set(negative, positive);
  }

  const strings = [];
  const visited = new Set<string>();
  for (const key of adjacency.keys()) {
    if (visited.has(key)) continue;
    const members = [key];
    visited.add(key);
    for (const member of members) {
      for (const other of adjacency.get(member) ?? []) {
        if (visited.has(other)) continue;
        visited.add(other);
        members.push(other);
      }
    }
    if (members.some((member) => unsupported.has(member))) continue;
    const starts = members.filter((member) => !previous.has(member));
    if (starts.length !== 1) continue;
    const ordered = [starts[0]];
    for (
      let tail = next.get(starts[0]);
      tail && ordered.length < members.length;
      tail = next.get(tail)
    )
      ordered.push(tail);
    if (ordered.length !== members.length) continue;
    const units = ordered.map((member) => ends.get(member)!);
    const model = catalogueRecord(equipment.get(units[0].instanceId)!);
    if (model?.connection !== "dc") continue;
    strings.push({
      key: starts[0],
      units,
      vocV: model.ratings.vocV * units.length,
      vmpV: model.ratings.vmpV * units.length,
      impA: model.ratings.impA,
    });
  }
  return strings;
}
