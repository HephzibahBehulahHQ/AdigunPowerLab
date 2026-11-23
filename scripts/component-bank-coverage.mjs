import { componentBank } from "../src/data/componentBank.ts";

// Owner's initial allocation. A record counts in exactly one category.
const allocations = [
  ["transformers", 700],
  ["generators", 500],
  ["prime-movers-and-generation-auxiliaries", 200],
  ["solar-and-wind-equipment", 800],
  ["inverters-and-conversion-equipment", 800],
  ["batteries-and-storage-systems", 600],
  ["ups-and-backup-systems", 400],
  ["protection-devices", 800],
  ["switching-and-transfer-equipment", 600],
  ["cables-and-conductors", 1000],
  ["busbars-and-distribution-systems", 400],
  ["motors-and-motor-driven-equipment", 700],
  ["drives-and-starting-equipment", 500],
  ["commercial-and-industrial-loads", 500],
  ["lighting-equipment", 300],
  ["ev-charging-equipment", 300],
  ["metering-and-power-quality", 400],
  ["monitoring-and-sensors", 200],
  ["earthing-and-bonding-equipment", 100],
  ["enclosures-and-installation-hardware", 200],
];

const counts = new Map(allocations.map(([category]) => [category, 0]));
const ids = new Set();
const identities = new Set();
const readiness = {};
for (const entry of componentBank) {
  const identity = [entry.manufacturer, entry.orderCode ?? entry.model]
    .map((part) => part.trim().toLowerCase())
    .join(":");
  const source = entry.source;
  if (
    ids.has(entry.id) ||
    identities.has(identity) ||
    !counts.has(entry.category) ||
    new URL(source.url).protocol !== "https:" ||
    !source.revision.trim() ||
    !Number.isInteger(source.page) ||
    source.page < 1 ||
    new Set(entry.terminals.map(({ id }) => id)).size !== entry.terminals.length
  ) {
    throw new Error(`Invalid catalogue entry: ${entry.id}`);
  }
  ids.add(entry.id);
  identities.add(identity);
  counts.set(entry.category, counts.get(entry.category) + 1);
  readiness[entry.readiness] = (readiness[entry.readiness] ?? 0) + 1;
}

export const coverage = {
  schemaVersion: 1,
  distinctRecords: ids.size,
  goalMinimum: 10000,
  readiness,
  categories: allocations.map(([category, target]) => {
    const records = counts.get(category);
    return {
      category,
      target,
      records,
      remaining: Math.max(0, target - records),
    };
  }),
};
