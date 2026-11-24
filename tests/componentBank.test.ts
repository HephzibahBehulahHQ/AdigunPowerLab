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
  phoenixPtPeTerminals,
  abl6Transformers,
  abt7pduTransformers,
  victronAgmSuperCycle,
  apcSmvUps,
  victronVeDirect230,
  victronVeDirect120,
  evlinkHomeStations,
  altivar320CompactDrives,
  olflexClassic110Cables,
  olflexClassic110CyCables,
  olflexClassic100750Cables,
  philipsDn145bDownlights,
  chromaloxStripHeaters,
  pvModules,
} from "../src/data/componentBank";
import { createProject, validateProjectImport } from "../src/domain/project";
import { equipmentConnectionErrors } from "../src/domain/equipmentConnections";
import {
  catalogueBatteryStrings,
  cataloguePvStrings,
} from "../src/engine/catalogueSeries";
import {
  calculatePvPerformance,
  DEFAULT_PV_PERFORMANCE_INPUTS,
} from "../src/engine/pvPerformance";

test("Chromalox exports preserve distinct voltage PCNs and connector styles", () => {
  expect(chromaloxStripHeaters).toHaveLength(90);
  expect(
    chromaloxStripHeaters.filter(
      ({ ratings }) => ratings.ratedVoltageV === 120,
    ),
  ).toHaveLength(32);
  expect(
    chromaloxStripHeaters.filter(
      ({ ratings }) => ratings.ratedVoltageV === 480,
    ),
  ).toHaveLength(24);
  const highVoltage = chromaloxStripHeaters.find(
    ({ orderCode }) => orderCode === "165868",
  );
  expect(highVoltage).toMatchObject({
    model: "NSL-5403",
    ratings: { powerW: 3000, ratedVoltageV: 480 },
  });
  expect(highVoltage?.terminals.map(({ connector }) => connector)).toEqual([
    "wire lead",
    "wire lead",
  ]);
  const json = readFileSync(
    new URL("../docs/component-bank-chromalox-ns-nsl.json", import.meta.url),
    "utf8",
  );
  expect(JSON.parse(json)).toEqual({
    schemaVersion: 1,
    entries: chromaloxStripHeaters,
  });
});

test("Philips fact sheets retain variant-specific ratings and dates in both exports", () => {
  expect(
    philipsDn145bDownlights.map(({ orderCode, ratings, source }) => [
      orderCode,
      ratings.powerW,
      ratings.luminousFluxLm,
      ratings.colorTemperatureK,
      source.revision,
    ]),
  ).toEqual([
    ["910500465901", 13, 1000, 3000, "Philips fact sheet (2026-10-30)"],
    ["910500465902", 13, 1000, 4000, "Philips fact sheet (2026-10-30)"],
    ["910500465903", 22.5, 2000, 3000, "Philips fact sheet (2026-10-30)"],
    ["910500465904", 22.5, 2000, 4000, "Philips fact sheet (2026-11-20)"],
  ]);
  const json = readFileSync(
    new URL("../docs/component-bank-philips-dn145b.json", import.meta.url),
    "utf8",
  );
  const csv = readFileSync(
    new URL("../docs/component-bank-philips-dn145b.csv", import.meta.url),
    "utf8",
  );
  expect(JSON.parse(json)).toEqual({
    schemaVersion: 1,
    entries: philipsDn145bDownlights,
  });
  expect(csv.replaceAll("\r\n", "\n")).toBe(
    componentBankCsv(philipsDn145bDownlights).replaceAll("\r\n", "\n"),
  );
});

test("LAPP cable records pair both ends of every core and preserve PE variants", () => {
  expect(olflexClassic110Cables).toHaveLength(143);
  const grounded = olflexClassic110Cables.find(
    ({ orderCode }) => orderCode === "1119115",
  );
  const ungrounded = olflexClassic110Cables.find(
    ({ orderCode }) => orderCode === "1119117",
  );
  expect(
    grounded?.terminals
      .filter(({ group }) => group === "PE")
      .map(({ id }) => id),
  ).toEqual(["a-pe", "b-pe"]);
  expect(ungrounded?.terminals.some(({ group }) => group === "PE")).toBe(false);
  for (const cable of olflexClassic110Cables) {
    expect(cable.ratings).toMatchObject({
      nominalU0V: 300,
      nominalUV: 500,
      coreToCoreTestVAc: 4000,
    });
    expect(cable.conditions.electricalReferenceTemperatureC).toBe(20);
    expect(cable.terminals).toHaveLength(cable.ratings.coreCount * 2);
    expect(new Set(cable.terminals.map(({ group }) => group)).size).toBe(
      cable.ratings.coreCount,
    );
  }
  const json = readFileSync(
    new URL("../docs/component-bank-lapp-olflex-110.json", import.meta.url),
    "utf8",
  );
  expect(JSON.parse(json)).toEqual({
    schemaVersion: 1,
    entries: olflexClassic110Cables,
  });
});

test("LAPP shielded cable exports preserve a braid independent of each core", () => {
  expect(olflexClassic110CyCables).toHaveLength(86);
  expect(
    olflexClassic110CyCables.find(({ orderCode }) => orderCode === "1135628"),
  ).toMatchObject({
    source: { page: 3 },
    ratings: {
      coreCount: 5,
      hasPe: true,
      crossSectionMm2: 35,
      outerDiameterMm: 33.2,
    },
  });
  for (const cable of olflexClassic110CyCables) {
    expect(
      cable.terminals
        .filter(({ interface: kind }) => kind === "cable-shield")
        .map(({ id, group }) => [id, group]),
    ).toEqual([
      ["a-shield", "Shield"],
      ["b-shield", "Shield"],
    ]);
    expect(cable.terminals.filter(({ group }) => group === "PE").length).toBe(
      cable.ratings.hasPe ? 2 : 0,
    );
    expect(cable.terminals).toHaveLength(2 * (cable.ratings.coreCount + 1));
  }
  const exportFile = (extension: string) =>
    readFileSync(
      new URL(
        `../docs/component-bank-lapp-olflex-110-cy.${extension}`,
        import.meta.url,
      ),
      "utf8",
    );
  expect(JSON.parse(exportFile("json"))).toEqual({
    schemaVersion: 1,
    entries: olflexClassic110CyCables,
  });
  expect(exportFile("csv").replaceAll("\r\n", "\n")).toBe(
    componentBankCsv(olflexClassic110CyCables).replaceAll("\r\n", "\n"),
  );
});

test("LAPP 450/750 V exports preserve leading zeroes, PE variants and article pages", () => {
  expect(olflexClassic100750Cables).toHaveLength(42);
  const grounded = olflexClassic100750Cables.find(
    ({ orderCode }) => orderCode === "0010087",
  );
  const ungrounded = olflexClassic100750Cables.find(
    ({ orderCode }) => orderCode === "00100933",
  );
  expect(grounded).toMatchObject({
    id: "lapp:0010087",
    source: { page: 3 },
    ratings: { hasPe: true, outerDiameterMm: 9.6 },
  });
  expect(ungrounded).toMatchObject({
    id: "lapp:00100933",
    source: { page: 3 },
    ratings: { hasPe: false },
  });
  for (const cable of olflexClassic100750Cables) {
    expect(cable.ratings).toMatchObject({
      nominalU0V: 450,
      nominalUV: 750,
      testVoltageV: 4000,
    });
    expect(cable.terminals).toHaveLength(2 * cable.ratings.coreCount);
    expect(
      cable.terminals.filter(({ group }) => group === "PE").map(({ id }) => id),
    ).toEqual(cable.ratings.hasPe ? ["a-pe", "b-pe"] : []);
    expect(cable.terminals.some(({ group }) => group === "Shield")).toBe(false);
    expect(cable.missingFields).toContain("article-core-colours");
  }
  const exportFile = (extension: string) =>
    readFileSync(
      new URL(
        `../docs/component-bank-lapp-olflex-100-750.${extension}`,
        import.meta.url,
      ),
      "utf8",
    );
  expect(JSON.parse(exportFile("json"))).toEqual({
    schemaVersion: 1,
    entries: olflexClassic100750Cables,
  });
  expect(exportFile("csv").replaceAll("\r\n", "\n")).toBe(
    componentBankCsv(olflexClassic100750Cables).replaceAll("\r\n", "\n"),
  );
});

test("Phoenix Contact PE exports preserve both clamps and the conductive rail foot", () => {
  expect(
    phoenixPtPeTerminals.map(({ orderCode, ratings }) => [
      orderCode,
      ratings.crossSectionMm2,
      ratings.ratedSurgeKV,
    ]),
  ).toEqual([
    ["3208139", 1.5, 6],
    ["3211822", 6, 8],
    ["3212131", 10, 8],
  ]);
  for (const entry of phoenixPtPeTerminals) {
    expect(entry.source.url).toContain(entry.orderCode);
    expect(entry.source.page).toBe(2);
    expect(entry.terminals.map(({ id }) => id)).toEqual([
      "clamp-1",
      "clamp-2",
      "rail-foot",
    ]);
    expect(
      entry.terminals.every(
        ({ group, interface: kind }) =>
          group === "pe" && kind === "protective-bond",
      ),
    ).toBe(true);
  }
  const exportFile = (extension: string) =>
    readFileSync(
      new URL(
        `../docs/component-bank-phoenix-pt-pe.${extension}`,
        import.meta.url,
      ),
      "utf8",
    );
  expect(JSON.parse(exportFile("json"))).toEqual({
    schemaVersion: 1,
    entries: phoenixPtPeTerminals,
  });
  expect(exportFile("csv").replaceAll("\r\n", "\n")).toBe(
    componentBankCsv(phoenixPtPeTerminals).replaceAll("\r\n", "\n"),
  );
});

test("Altivar compact records distinguish supply phases and continuous motor output", () => {
  expect(altivar320CompactDrives).toHaveLength(20);
  const single = altivar320CompactDrives.find(
    ({ model }) => model === "ATV320U07M2C",
  );
  const three = altivar320CompactDrives.find(
    ({ model }) => model === "ATV320D15M3C",
  );
  expect(single?.ratings).toMatchObject({
    supplyPhases: 1,
    continuousOutputA: 4.8,
  });
  expect(single?.terminals.map(({ group }) => group)).toEqual([
    "R/L1",
    "S/L2/N",
    "U/T1",
    "V/T2",
    "W/T3",
    "PE",
  ]);
  expect(three?.ratings).toMatchObject({
    supplyPhases: 3,
    continuousOutputA: 66,
    motorKW: 15,
  });
  expect(three?.terminals[2].group).toBe("T/L3");
  expect(three?.conditions.nominalSwitchingFrequencyKHz).toBe(4);
  const json = readFileSync(
    new URL("../docs/component-bank-altivar-320-compact.json", import.meta.url),
    "utf8",
  );
  expect(JSON.parse(json)).toEqual({
    schemaVersion: 1,
    entries: altivar320CompactDrives,
  });
});

test("EVlink order codes preserve phase terminals, outlet and published ratings", () => {
  expect(
    new Set(evlinkHomeStations.map(({ orderCode }) => orderCode)).size,
  ).toBe(12);
  const socket = evlinkHomeStations.find(({ model }) => model === "EVH4S07N2");
  const cable = evlinkHomeStations.find(({ model }) => model === "EVH4A11NC");
  expect(socket?.ratings).toEqual({
    powerKW: 7.4,
    ratedCurrentA: 32,
    phases: 1,
    rdcDdMilliamp: 6,
  });
  expect(socket?.terminals.map(({ group }) => group)).toEqual([
    "L1",
    "N",
    "PE",
    "Vehicle",
  ]);
  expect(cable?.ratings).toMatchObject({
    powerKW: 11,
    ratedCurrentA: 16,
    phases: 3,
  });
  expect(cable?.terminals.map(({ group }) => group)).toEqual([
    "L1",
    "L2",
    "L3",
    "N",
    "PE",
    "Vehicle",
  ]);
  expect(cable?.terminals.at(-1)?.connector).toBe("Type 2 cable (5 m)");
  expect(cable?.modelMapping).toBeNull();
  const json = readFileSync(
    new URL("../docs/component-bank-evlink-home.json", import.meta.url),
    "utf8",
  );
  expect(JSON.parse(json)).toEqual({
    schemaVersion: 1,
    entries: evlinkHomeStations,
  });
});

test("Victron 120 V versions retain their own power table and GFCI article codes", () => {
  expect(victronVeDirect120).toHaveLength(36);
  const record = victronVeDirect120.find(
    ({ model }) => model === "PIN242122530",
  );
  expect(record?.ratings).toMatchObject({
    inputNominalV: 24,
    outputNominalV: 120,
    continuousW40C: 1100,
  });
  expect(record?.terminals[2].connector).toBe("GFCI");
  const json = readFileSync(
    new URL(
      "../docs/component-bank-victron-vedirect-120.json",
      import.meta.url,
    ),
    "utf8",
  );
  expect(JSON.parse(json)).toEqual({
    schemaVersion: 1,
    entries: victronVeDirect120,
  });
});

test("Victron article generation preserves socket codes and temperature-conditioned power", () => {
  expect(victronVeDirect230).toHaveLength(72);
  const record = victronVeDirect230.find(
    ({ model }) => model === "PIN241501210",
  );
  expect(record?.ratings).toMatchObject({
    inputNominalV: 24,
    continuousW25C: 450,
    continuousW40C: 380,
  });
  expect(record?.terminals[2].connector).toBe("Schuko (CEE 7/4)");
  expect(victronVeDirect230.some(({ model }) => model === "PIN482161400")).toBe(
    true,
  );
  const json = readFileSync(
    new URL(
      "../docs/component-bank-victron-vedirect-230.json",
      import.meta.url,
    ),
    "utf8",
  );
  expect(JSON.parse(json)).toEqual({
    schemaVersion: 1,
    entries: victronVeDirect230,
  });
});

test("APC SMV variants retain inlet and outlet differences", () => {
  expect(apcSmvUps).toHaveLength(5);
  for (const entry of apcSmvUps) {
    expect(
      entry.terminals.filter(({ connector }) => connector === "IEC C13"),
    ).toHaveLength(6);
    expect(entry.terminals[0].connector).toBe(
      entry.model === "SMV3000CAI" ? "IEC C20" : "IEC C14",
    );
  }
  const json = readFileSync(
    new URL("../docs/component-bank-apc-smv.json", import.meta.url),
    "utf8",
  );
  expect(JSON.parse(json)).toEqual({ schemaVersion: 1, entries: apcSmvUps });
});

test("Victron AGM retains discharge-rate capacity and exact insert variants", () => {
  expect(victronAgmSuperCycle).toHaveLength(8);
  const record = victronAgmSuperCycle.find(
    ({ model }) => model === "BAT412060082",
  );
  expect(record?.ratings).toEqual({
    nominalV: 12,
    c5Ah: 52,
    c10Ah: 56,
    c20Ah: 60,
  });
  expect(record?.terminals.map(({ connector }) => connector)).toEqual([
    "M6 insert",
    "M6 insert",
  ]);
  expect(record?.conditions.dischargeCutoffV).toBe(10.8);
  const json = readFileSync(
    new URL("../docs/component-bank-victron-agm.json", import.meta.url),
    "utf8",
  );
  expect(JSON.parse(json)).toEqual({
    schemaVersion: 1,
    entries: victronAgmSuperCycle,
  });
});

test("AGM links allow series connection but reject indirect battery shorts", () => {
  const model = victronAgmSuperCycle[0];
  const instances = [
    {
      id: "battery",
      name: "Bank",
      catalogueId: model.id,
      manufacturer: model.manufacturer,
      model: model.model,
      sourceUrl: model.source.url,
      sourceRevision: model.source.revision,
      quantity: 2,
    },
  ];
  const from = { instanceId: "battery", unit: 1, terminalId: "positive" };
  const to = { instanceId: "battery", unit: 2, terminalId: "negative" };
  const series = { id: "series", from, to };
  expect(equipmentConnectionErrors([series], instances)).toEqual([]);
  const project = createProject();
  project.catalogueEquipment = instances;
  project.equipmentTerminalConnections = [series];
  expect(catalogueBatteryStrings(project)[0]).toMatchObject({
    nominalV: 24,
    c20Ah: 15,
    nominalKWhC20: 0.36,
    dischargeCutoffV: 21.6,
  });
  expect(cataloguePvStrings(project)).toEqual([]);
  const short = { id: "short", from: { ...from, terminalId: "negative" }, to };
  expect(equipmentConnectionErrors([series, short], instances)).toEqual([
    "Equipment terminal network: Battery terminals share a conductor node for Bank [1].",
  ]);
});

test("ABT7PDU records retain two secondary windings and distinct jumper arrangements", () => {
  expect(abt7pduTransformers).toHaveLength(23);
  expect(abt7pduTransformers.some(({ model }) => model === "ABT7PDU002B")).toBe(
    false,
  );
  const model = abt7pduTransformers.find(
    ({ model }) => model === "ABT7PDU250B",
  );
  expect(model?.ratings).toMatchObject({
    apparentVA: 2500,
    secondaryV: 24,
    secondaryWindings: 2,
  });
  expect(model?.conditions.jumperPlacement).toBe("external");
  expect(
    model?.terminals.filter(
      ({ interface: kind }) => kind === "transformer-secondary",
    ),
  ).toHaveLength(4);
  const json = readFileSync(
    new URL("../docs/component-bank-abt7pdu.json", import.meta.url),
    "utf8",
  );
  expect(JSON.parse(json)).toEqual({
    schemaVersion: 1,
    entries: abt7pduTransformers,
  });
});

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
