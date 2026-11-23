import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import {
  componentBank,
  componentBankCsv,
  ic60nBreakers,
  ic60hBreakers,
  ic60lBreakers,
  iidRccbs,
  iswSwitches,
  iemMeters,
  ictContactors,
  rm17Relays,
  linergyDsBlocks,
  linergyEarthBars,
  abl6Transformers,
  pvModules,
} from "../src/data/componentBank";
import { createProject, validateProjectImport } from "../src/domain/project";
import { equipmentConnectionErrors } from "../src/domain/equipmentConnections";
import { cataloguePvStrings } from "../src/engine/cataloguePvStrings";
import {
  calculatePvPerformance,
  DEFAULT_PV_PERFORMANCE_INPUTS,
} from "../src/engine/pvPerformance";

test("ABL6TS stock references preserve the selection-table gaps and winding terminals", () => {
  expect(abl6Transformers).toHaveLength(39);
  expect(abl6Transformers.some(({ model }) => model === "ABL6TS40J")).toBe(
    false,
  );
  const record = abl6Transformers.find(({ model }) => model === "ABL6TS250U");
  expect(record?.ratings).toEqual({
    apparentVA: 2500,
    primaryV: [230, 400],
    secondaryV: 230,
  });
  expect(record?.terminals.map(({ interface: kind }) => kind)).toEqual([
    ...Array(5).fill("transformer-primary"),
    ...Array(2).fill("transformer-secondary"),
  ]);
  const json = readFileSync(
    new URL("../docs/component-bank-abl6.json", import.meta.url),
    "utf8",
  );
  expect(JSON.parse(json)).toEqual({
    schemaVersion: 1,
    entries: abl6Transformers,
  });
});

test("Linergy earth bars preserve the shared PE node and documented connection counts", () => {
  expect(linergyEarthBars.map(({ terminals }) => terminals.length)).toEqual([
    41, 1, 21,
  ]);
  for (const record of linergyEarthBars) {
    expect(
      record.terminals.every(
        ({ group, interface: kind }) =>
          group === "pe" && kind === "protective-bond",
      ),
    ).toBe(true);
  }
  const json = readFileSync(
    new URL("../docs/component-bank-linergy-tb.json", import.meta.url),
    "utf8",
  );
  expect(JSON.parse(json)).toEqual({
    schemaVersion: 1,
    entries: linergyEarthBars,
  });
});

test("Linergy terminal openings share a pole and reject conflicting phases", () => {
  expect(linergyDsBlocks.map(({ terminals }) => terminals.length)).toEqual([
    10, 13, 14,
  ]);
  const model = linergyDsBlocks[0];
  const instances = [
    {
      id: "block",
      name: "Distribution blocks",
      catalogueId: model.id,
      manufacturer: model.manufacturer,
      model: model.model,
      sourceUrl: model.source.url,
      sourceRevision: model.source.revision,
      quantity: 3,
    },
  ];
  const endpoint = (unit: number, terminalId: string) => ({
    instanceId: "block",
    unit,
    terminalId,
  });
  const wires = [
    {
      id: "one",
      from: endpoint(1, "hole-1-1"),
      to: endpoint(2, "hole-1-1"),
      phase: "L1",
    },
    {
      id: "two",
      from: endpoint(1, "hole-2-1"),
      to: endpoint(3, "hole-1-1"),
      phase: "L2",
    },
  ];
  expect(equipmentConnectionErrors(wires, instances)[0]).toContain(
    "conflicting phases",
  );
});

test("RM17 reference variants preserve voltage ranges and output contact groups", () => {
  expect(rm17Relays).toHaveLength(6);
  const model = rm17Relays.find(({ model }) => model === "RM17TG20");
  expect(model?.ratings).toMatchObject({
    voltageMaxV: 440,
    changeoverContacts: 2,
  });
  expect(model?.terminals.map(({ group }) => group)).toEqual([
    "L1",
    "L2",
    "L3",
    "11",
    "12",
    "14",
    "21",
    "22",
    "24",
  ]);
  const json = readFileSync(
    new URL("../docs/component-bank-rm17.json", import.meta.url),
    "utf8",
  );
  expect(JSON.parse(json)).toEqual({ schemaVersion: 1, entries: rm17Relays });
});

test("iC60L preserves K/Z-only order codes and the Icn scope limit", () => {
  expect(ic60lBreakers).toHaveLength(232);
  const record = ic60lBreakers.find(({ model }) => model === "A9F95472");
  expect(record?.ratings).toMatchObject({
    ratedCurrentA: 1.6,
    curve: "K",
    poles: 4,
    icnKA: 15,
  });
  const unrated = ic60lBreakers.find(({ model }) => model === "A9F95163");
  expect(unrated?.ratings.icnKA).toBeNull();
  expect(unrated?.conditions.catalogueApprovalNote).toContain("footnote 3");
  const json = readFileSync(
    new URL("../docs/component-bank-ic60l.json", import.meta.url),
    "utf8",
  );
  expect(JSON.parse(json)).toEqual({
    schemaVersion: 1,
    entries: ic60lBreakers,
  });
});

test("iC60H adds 180 exact catalogue variants with independently rated breaking capacity", () => {
  expect(ic60hBreakers).toHaveLength(180);
  const record = ic60hBreakers.find(({ model }) => model === "A9F85463");
  expect(record?.ratings).toMatchObject({
    ratedCurrentA: 63,
    curve: "D",
    poles: 4,
    icnKA: 10,
  });
  expect(record?.conditions.icnVoltageV).toBe(400);
  expect(record?.terminals.map(({ group }) => group)).toEqual([
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
  ]);
  const json = readFileSync(
    new URL("../docs/component-bank-ic60h.json", import.meta.url),
    "utf8",
  );
  expect(JSON.parse(json)).toEqual({
    schemaVersion: 1,
    entries: ic60hBreakers,
  });
});

test("iCT retains utilization-category ratings and distinct coil terminals", () => {
  expect(ictContactors).toHaveLength(8);
  const model = ictContactors.find(({ model }) => model === "A9C20732");
  expect(model?.ratings).toMatchObject({ ac7aA: 25, ac7bA: 8.5 });
  expect(model?.terminals.map(({ group }) => group)).toEqual([
    "1",
    "2",
    "3",
    "4",
    "A1",
    "A2",
  ]);
  const exported = readFileSync(
    new URL("../docs/component-bank-ict.json", import.meta.url),
    "utf8",
  );
  expect(JSON.parse(exported)).toEqual({
    schemaVersion: 1,
    entries: ictContactors,
  });
});

test("iEM records distinguish pulse outputs and the China-only orders", () => {
  expect(iemMeters).toHaveLength(4);
  const general = iemMeters.find(({ model }) => model === "A9MEM2000");
  const china = iemMeters.find(({ model }) => model === "A9MEM2010C");
  expect(general?.ratings.pulsesPerKWh).toBeNull();
  expect(china?.conditions.marketRestriction).toBe("China only");
  expect(
    china?.terminals
      .filter(({ interface: kind }) => kind === "pulse-output")
      .map(({ group }) => group),
  ).toEqual(["S0+", "S0−"]);
  const exported = readFileSync(
    new URL("../docs/component-bank-iem.json", import.meta.url),
    "utf8",
  );
  expect(JSON.parse(exported)).toEqual({
    schemaVersion: 1,
    entries: iemMeters,
  });
});

test("PV validation follows conductor nodes across multiple wires", () => {
  const model = pvModules[0];
  const instances = [
    {
      id: "panels",
      name: "PV panels",
      catalogueId: model.id,
      manufacturer: model.manufacturer,
      model: model.model,
      quantity: 3,
      sourceUrl: model.source.url,
      sourceRevision: model.source.revision,
    },
  ];
  const terminal = (unit: number, terminalId: string) => ({
    instanceId: "panels",
    unit,
    terminalId,
  });
  const series = {
    id: "series",
    from: terminal(1, "positive"),
    to: terminal(2, "negative"),
  };
  const parallelBranch = {
    id: "branch",
    from: terminal(2, "negative"),
    to: terminal(3, "negative"),
  };
  expect(
    equipmentConnectionErrors([series, parallelBranch], instances),
  ).toEqual([]);
  const short = {
    id: "short",
    from: terminal(3, "negative"),
    to: terminal(1, "negative"),
  };
  expect(
    equipmentConnectionErrors([series, parallelBranch, short], instances),
  ).toEqual([
    "Equipment terminal network: PV terminals share a conductor node for PV panels [1].",
  ]);
});

test("catalogue PV series totals exclude branched and cyclic networks", () => {
  const model = pvModules[0];
  const project = createProject();
  project.catalogueEquipment = [
    {
      id: "pv",
      name: "Modules",
      catalogueId: model.id,
      manufacturer: model.manufacturer,
      model: model.model,
      sourceUrl: model.source.url,
      sourceRevision: model.source.revision,
      quantity: 3,
    },
  ];
  const wire = (from: number, to: number) => ({
    id: `${from}-${to}`,
    from: { instanceId: "pv", unit: from, terminalId: "positive" },
    to: { instanceId: "pv", unit: to, terminalId: "negative" },
  });
  project.equipmentTerminalConnections = [wire(1, 2), wire(2, 3)];
  const [string] = cataloguePvStrings(project);
  expect(string.units.map(({ unit }) => unit)).toEqual([1, 2, 3]);
  expect(string.vocV).toBeCloseTo(106.2);
  expect(string.vmpV).toBeCloseTo(90.6);
  expect(string.impA).toBeCloseTo(14.58);
  expect(string.iscA).toBeCloseTo(15.88);
  expect(string.dcNameplateKW).toBeCloseTo(1.32);
  project.equipmentTerminalConnections.push(wire(3, 1));
  expect(cataloguePvStrings(project)).toEqual([]);
  project.equipmentTerminalConnections = [wire(1, 2), wire(1, 3)];
  expect(cataloguePvStrings(project)).toEqual([]);
});

test("iSW switch records retain the documented terminal numbering and voltage", () => {
  expect(iswSwitches).toHaveLength(12);
  const switchRecord = iswSwitches.find(({ model }) => model === "A9S65363");
  expect(switchRecord?.ratings).toEqual({
    poles: 3,
    ratedCurrentA: 63,
    voltageV: 415,
  });
  expect(switchRecord?.terminals.map(({ group }) => group)).toEqual([
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
  ]);
  const exported = readFileSync(
    new URL("../docs/component-bank-isw.json", import.meta.url),
    "utf8",
  );
  expect(JSON.parse(exported)).toEqual({
    schemaVersion: 1,
    entries: iswSwitches,
  });
});

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
