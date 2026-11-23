import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import {
  componentBank,
  componentBankCsv,
  ic60nBreakers,
  iidRccbs,
  pvModules,
} from "../src/data/componentBank";
import { createProject, validateProjectImport } from "../src/domain/project";
import { equipmentConnectionErrors } from "../src/domain/equipmentConnections";
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

test("iC60N exports retain exact catalogue identities and pole terminals", () => {
  expect(new Set(componentBank.map(({ id }) => id)).size).toBe(
    componentBank.length,
  );
  expect(ic60nBreakers).toHaveLength(180);
  expect(
    ic60nBreakers.find(({ model }) => model === "A9F73170")?.ratings,
  ).toMatchObject({ ratedCurrentA: 0.5, curve: "B", poles: 1 });
  expect(
    ic60nBreakers.find(({ model }) => model === "A9F75463")?.ratings,
  ).toMatchObject({ ratedCurrentA: 63, curve: "D", poles: 4 });
  for (const record of ic60nBreakers) {
    expect(new Set(record.terminals.map(({ group }) => group)).size).toBe(
      record.ratings.poles * 2,
    );
    expect(record.modelMapping).toBeNull();
  }
  const read = (extension: string) =>
    readFileSync(
      new URL(`../docs/component-bank-ic60n.${extension}`, import.meta.url),
      "utf8",
    );
  expect(JSON.parse(read("json"))).toEqual({
    schemaVersion: 1,
    entries: ic60nBreakers,
  });
  expect(read("csv").replaceAll("\r\n", "\n")).toBe(
    componentBankCsv(ic60nBreakers).replaceAll("\r\n", "\n"),
  );
});

test("iID records preserve the selective variants and support neutral-to-neutral links", () => {
  expect(iidRccbs).toHaveLength(81);
  expect(
    iidRccbs.find(({ model }) => model === "A9R08463")?.conditions,
  ).toMatchObject({
    ratedVoltageMinV: 230,
    ratedVoltageMaxV: 230,
    residualCurrentType: "A",
  });
  const model = iidRccbs.find(({ model }) => model === "A9R17440")!;
  expect(model.ratings).toEqual({
    ratedCurrentA: 40,
    poles: 4,
    tripSensitivityMA: 500,
    selective: true,
  });
  expect(model.terminals).toHaveLength(8);
  const instances = [
    {
      id: "rcd",
      name: "RCDs",
      catalogueId: model.id,
      manufacturer: model.manufacturer,
      model: model.model,
      quantity: 2,
      sourceUrl: model.source.url,
      sourceRevision: model.source.revision,
    },
  ];
  const from = { instanceId: "rcd", unit: 1, terminalId: "neutral-bottom" };
  const to = { instanceId: "rcd", unit: 2, terminalId: "neutral-top" };
  expect(
    equipmentConnectionErrors([{ id: "neutral", from, to }], instances),
  ).toEqual([]);
  expect(
    equipmentConnectionErrors(
      [{ id: "mixed", from, to: { ...to, terminalId: "pole-1-top" } }],
      instances,
    )[0],
  ).toContain("incompatible");
  const json = readFileSync(
    new URL("../docs/component-bank-iid.json", import.meta.url),
    "utf8",
  );
  expect(JSON.parse(json)).toEqual({ schemaVersion: 1, entries: iidRccbs });
});

test("AC links require a consistent phase across the two terminals of each installed pole", () => {
  const model = ic60nBreakers[0];
  const instances = [
    {
      id: "breaker",
      name: "Breakers",
      catalogueId: model.id,
      manufacturer: model.manufacturer,
      model: model.model,
      sourceUrl: model.source.url,
      sourceRevision: model.source.revision,
      quantity: 3,
    },
  ];
  const terminal = (unit: number, side: string) => ({
    instanceId: "breaker",
    unit,
    terminalId: `pole-1-${side}`,
  });
  const first = {
    id: "first",
    from: terminal(1, "bottom"),
    to: terminal(2, "top"),
  };
  const second = {
    id: "second",
    from: terminal(2, "bottom"),
    to: terminal(3, "top"),
  };
  expect(equipmentConnectionErrors([first], instances)[0]).toContain(
    "require L1",
  );
  const live = { ...first, phase: "L2" };
  expect(
    equipmentConnectionErrors([live, { ...second, phase: "L2" }], instances),
  ).toEqual([]);
  expect(
    equipmentConnectionErrors([live, { ...second, phase: "L1" }], instances)[0],
  ).toContain("conflicting phases");
});
test("coverage artifact accounts for every record and all 20 target categories", () => {
  const coverage = JSON.parse(
    readFileSync(
      new URL("../docs/component-bank-coverage.json", import.meta.url),
      "utf8",
    ),
  );
  expect(coverage.distinctRecords).toBe(componentBank.length);
  expect(coverage.goalMinimum).toBe(10000);
  expect(coverage.categories).toHaveLength(20);
  expect(
    new Set(
      coverage.categories.map(({ category }: { category: string }) => category),
    ).size,
  ).toBe(20);
  for (const row of coverage.categories) {
    expect(row.records).toBe(
      componentBank.filter(({ category }) => category === row.category).length,
    );
    expect(row.remaining).toBe(Math.max(0, row.target - row.records));
  }
  const readinessCounts = new Map<string, number>();
  for (const { readiness } of componentBank)
    readinessCounts.set(readiness, (readinessCounts.get(readiness) ?? 0) + 1);
  expect(coverage.readiness).toEqual(Object.fromEntries(readinessCounts));
});
