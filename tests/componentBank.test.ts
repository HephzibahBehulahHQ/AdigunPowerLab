import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { pvModules } from "../src/data/componentBank";
import { createProject, validateProjectImport } from "../src/domain/project";
import {
  calculatePvPerformance,
  DEFAULT_PV_PERFORMANCE_INPUTS,
} from "../src/engine/pvPerformance";

test("the PV batch has stable distinct identities and traceable worksheet inputs", () => {
  expect(new Set(pvModules.map(({ id }) => id)).size).toBe(pvModules.length);
  expect(
    new Set(
      pvModules.map(({ manufacturer, model }) => `${manufacturer}:${model}`),
    ).size,
  ).toBe(pvModules.length);
  for (const record of pvModules) {
    expect(record.source.url).toMatch(/^https:\/\/www\.canadiansolar\.com\//);
    expect(new Set(record.terminals.map(({ id }) => id)).size).toBe(3);
    expect(record.terminals.map(({ group }) => group)).toEqual([
      "dc-positive",
      "dc-negative",
      "frame-bond",
    ]);
    expect(record.ratings.vocV).toBeGreaterThan(record.ratings.vmpV);
    expect(record.ratings.iscA).toBeGreaterThan(record.ratings.impA);
    const result = calculatePvPerformance({
      ...DEFAULT_PV_PERFORMANCE_INPUTS,
      ...record.modelMapping,
      planeOfArrayIrradianceWm2: record.conditions.irradianceWm2,
      moduleTemperatureC: record.conditions.cellTemperatureC,
      cellToModuleDeltaTC: 0,
    });
    expect(result.dcPowerKW * 1000).toBeCloseTo(record.ratings.powerW);
  }
});

test("the committed JSON and CSV describe every runtime record", () => {
  const json = readFileSync(
    new URL("../docs/component-bank-pv.json", import.meta.url),
    "utf8",
  );
  const csv = readFileSync(
    new URL("../docs/component-bank-pv.csv", import.meta.url),
    "utf8",
  );
  expect(JSON.parse(json)).toEqual({ schemaVersion: 1, entries: pvModules });
  const headers = Object.keys(pvModules[0]);
  const escaped = (value: unknown) =>
    `"${String(value == null ? "" : typeof value === "object" ? JSON.stringify(value) : value).replaceAll('"', '""')}"`;
  const rows = pvModules.map((record) =>
    Object.values(record).map(escaped).join(","),
  );
  expect(csv.trimEnd().split(/\r?\n/)).toEqual([headers.join(","), ...rows]);
});

test("native project import validates indexed and compatible equipment terminals", () => {
  const project = createProject();
  const model = pvModules[0];
  project.catalogueEquipment = [
    {
      id: "panel",
      catalogueId: model.id,
      manufacturer: model.manufacturer,
      model: model.model,
      name: "Two panels",
      sourceUrl: model.source.url,
      sourceRevision: model.source.revision,
      quantity: 2,
    },
  ];
  const from = { instanceId: "panel", unit: 1, terminalId: "positive" };
  const to = { instanceId: "panel", unit: 2, terminalId: "negative" };
  const wire = { id: "wire", from, to };
  project.equipmentTerminalConnections = [wire];
  expect(validateProjectImport(project).errors).toEqual([]);
  for (const endpoint of [
    { ...to, unit: 3 },
    { ...to, unit: 1 },
    { ...to, terminalId: "frame" },
    { ...to, terminalId: "missing" },
  ]) {
    project.equipmentTerminalConnections = [{ ...wire, to: endpoint }];
    expect(validateProjectImport(project).errors).toContain(
      "Equipment terminal connection 1: missing or incompatible endpoints.",
    );
  }
  project.equipmentTerminalConnections = [
    wire,
    { id: "reverse", from: to, to: from },
  ];
  expect(validateProjectImport(project).errors).toContain(
    "Equipment terminal connection 2: duplicate endpoint pair.",
  );
});
