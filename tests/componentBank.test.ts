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
  iem205xMeters,
  iem24xxMeters,
  ictContactors,
  rm17Relays,
  linergyDsBlocks,
  linergyDsFourPoleBlocks,
  linergyEarthBars,
  linergyNeutralBars,
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
  olflexClassic100500Cables,
  olflexClassic110BlackCables,
  olflexClassic110HCables,
  olflexClassic110ChCables,
  olflexClassic115CyCables,
  olflexClassic130HCables,
  philipsDn145bDownlights,
  philipsDn145bPsuDownlights,
  chromaloxStripHeaters,
  wegW22NemaMotors,
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

test("Philips PSU variants preserve separate colour temperatures and two-pole inputs", () => {
  expect(
    philipsDn145bPsuDownlights.map(({ orderCode, ratings }) => [
      orderCode,
      ratings.colorTemperatureK,
      ratings.powerW,
      ratings.luminousFluxLm,
    ]),
  ).toEqual([
    ["911401805980", 3000, 11, 1100],
    ["911401806080", 4000, 11, 1100],
    ["911401805780", 3000, 6.5, 650],
    ["911401805880", 4000, 6.5, 650],
  ]);
  for (const article of philipsDn145bPsuDownlights) {
    expect(article.terminals.map(({ group }) => group)).toEqual(["L", "N"]);
    expect(article.ratings).toMatchObject({
      inputMinV: 220,
      inputMaxV: 240,
    });
    expect(article.source.url).toContain(article.orderCode);
    expect(article.source.page).toBe(2);
  }
  const file = (extension: string) =>
    readFileSync(
      new URL(
        `../docs/component-bank-philips-dn145b-psu.${extension}`,
        import.meta.url,
      ),
      "utf8",
    );
  expect(JSON.parse(file("json"))).toEqual({
    schemaVersion: 1,
    entries: philipsDn145bPsuDownlights,
  });
  expect(file("csv").replaceAll("\r\n", "\n")).toBe(
    componentBankCsv(philipsDn145bPsuDownlights).replaceAll("\r\n", "\n"),
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

test("LAPP 300/500 V separates cross-section and diameter in the merged PDF rows", () => {
  expect(olflexClassic100500Cables).toHaveLength(94);
  const file = (extension: string) =>
    readFileSync(
      new URL(
        `../docs/component-bank-lapp-olflex-100-500.${extension}`,
        import.meta.url,
      ),
      "utf8",
    );
  expect(JSON.parse(file("json"))).toEqual({
    schemaVersion: 1,
    entries: olflexClassic100500Cables,
  });
  expect(file("csv").replaceAll("\r\n", "\n")).toBe(
    componentBankCsv(olflexClassic100500Cables).replaceAll("\r\n", "\n"),
  );
  for (const [code, diameter] of [
    ["00100424", 6],
    ["00102034", 6],
    ["0010045", 8],
    ["0010046", 8],
  ]) {
    expect(
      olflexClassic100500Cables.find(({ orderCode }) => orderCode === code),
    ).toMatchObject({
      ratings: { crossSectionMm2: 1, outerDiameterMm: diameter },
      source: { page: 4 },
    });
  }
});

test("LAPP 600/1000 V exports preserve numbered cores and optional PE", () => {
  expect(olflexClassic110BlackCables).toHaveLength(62);
  for (const record of olflexClassic110BlackCables) {
    expect(record.ratings).toMatchObject({
      nominalU0V: 600,
      nominalUV: 1000,
      testVoltageV: 4000,
    });
    expect(record.conditions.coreIdentification).toBe("numbered");
    expect(record.source.revision).toContain("2026-01-25");
    expect(
      record.terminals.filter(
        ({ interface: kind }) => kind === "cable-numbered-core",
      ),
    ).toHaveLength(
      2 * (record.ratings.coreCount - Number(record.ratings.hasPe)),
    );
    expect(
      record.terminals
        .filter(({ group }) => group === "PE")
        .map(({ id }) => id),
    ).toEqual(record.ratings.hasPe ? ["a-pe", "b-pe"] : []);
    expect(record.terminals).toHaveLength(2 * record.ratings.coreCount);
  }
  const file = (extension: string) =>
    readFileSync(
      new URL(
        `../docs/component-bank-lapp-olflex-110-black.${extension}`,
        import.meta.url,
      ),
      "utf8",
    );
  expect(JSON.parse(file("json"))).toEqual({
    schemaVersion: 1,
    entries: olflexClassic110BlackCables,
  });
  expect(file("csv").replaceAll("\r\n", "\n")).toBe(
    componentBankCsv(olflexClassic110BlackCables).replaceAll("\r\n", "\n"),
  );
});

test("LAPP 110 H exports preserve article and technical pages independently", () => {
  expect(olflexClassic110HCables).toHaveLength(66);
  for (const cable of olflexClassic110HCables) {
    expect(cable.ratings).toMatchObject({
      nominalU0V: 300,
      nominalUV: 500,
      testVoltageV: 4000,
    });
    expect(cable.source.supplemental.map(({ page }) => page)).toEqual([2, 3]);
    expect([4, 5]).toContain(cable.source.page);
  }
  for (const [orderCode, crossSectionMm2] of [
    ["10019934", 1.5],
    ["10019946", 2.5],
  ]) {
    expect(
      olflexClassic110HCables.find((cable) => cable.orderCode === orderCode),
    ).toMatchObject({
      ratings: { crossSectionMm2, outerDiameterMm: 9 },
      source: { page: 5 },
    });
  }
  const file = (extension: string) =>
    readFileSync(
      new URL(
        `../docs/component-bank-lapp-olflex-110-h.${extension}`,
        import.meta.url,
      ),
      "utf8",
    );
  expect(JSON.parse(file("json"))).toEqual({
    schemaVersion: 1,
    entries: olflexClassic110HCables,
  });
  expect(file("csv").replaceAll("\r\n", "\n")).toBe(
    componentBankCsv(olflexClassic110HCables).replaceAll("\r\n", "\n"),
  );
});

test("LAPP 110 CH exports distinguish shield braid from protective earth", () => {
  expect(olflexClassic110ChCables).toHaveLength(57);
  expect(
    olflexClassic110ChCables.find(({ orderCode }) => orderCode === "10035069"),
  ).toMatchObject({
    ratings: { hasPe: false, outerDiameterMm: 9, crossSectionMm2: 1.5 },
    source: { page: 5 },
  });
  for (const cable of olflexClassic110ChCables) {
    expect(
      cable.terminals
        .filter(({ group }) => group === "Shield")
        .map(({ id }) => id),
    ).toEqual(["a-shield", "b-shield"]);
    expect(
      cable.terminals.filter(({ group }) => group === "PE").map(({ id }) => id),
    ).toEqual(cable.ratings.hasPe ? ["a-pe", "b-pe"] : []);
    expect(cable.terminals).toHaveLength(2 * (cable.ratings.coreCount + 1));
  }
  const file = (extension: string) =>
    readFileSync(
      new URL(
        `../docs/component-bank-lapp-olflex-110-ch.${extension}`,
        import.meta.url,
      ),
      "utf8",
    );
  expect(JSON.parse(file("json"))).toEqual({
    schemaVersion: 1,
    entries: olflexClassic110ChCables,
  });
  expect(file("csv").replaceAll("\r\n", "\n")).toBe(
    componentBankCsv(olflexClassic110ChCables).replaceAll("\r\n", "\n"),
  );
});

test("WEG NEMA exports retain nameplate ratings and separately sourced leads", () => {
  expect(
    wegW22NemaMotors.map(({ orderCode, terminals }) => [
      orderCode,
      terminals.length,
    ]),
  ).toEqual([
    ["11416668", 9],
    ["11166654", 12],
  ]);
  const motor = wegW22NemaMotors.find(
    ({ orderCode }) => orderCode === "11166654",
  );
  expect(motor).toMatchObject({
    ratings: {
      operatingPoints: [
        { lineVoltageV: [230, 460], lineCurrentA: [137, 68.3] },
      ],
    },
    source: { page: 16, supplemental: [{ page: 4 }] },
  });
  expect(motor?.terminals.at(-1)).toMatchObject({
    id: "t12",
    group: "T12",
    interface: "motor-winding-lead",
  });
  const file = (extension: string) =>
    readFileSync(
      new URL(
        `../docs/component-bank-weg-w22-nema.${extension}`,
        import.meta.url,
      ),
      "utf8",
    );
  expect(JSON.parse(file("json"))).toEqual({
    schemaVersion: 1,
    entries: wegW22NemaMotors,
  });
  expect(file("csv").replaceAll("\r\n", "\n")).toBe(
    componentBankCsv(wegW22NemaMotors).replaceAll("\r\n", "\n"),
  );
});

test("LAPP 115 CY exports preserve the braid and protective-earth variants", () => {
  expect(olflexClassic115CyCables).toHaveLength(71);
  for (const cable of olflexClassic115CyCables) {
    expect(cable.ratings).toMatchObject({
      nominalU0V: 300,
      nominalUV: 500,
      testVoltageV: 4000,
    });
    expect(
      cable.terminals
        .filter(({ group }) => group === "Shield")
        .map(({ id }) => id),
    ).toEqual(["a-shield", "b-shield"]);
    expect(
      cable.terminals.filter(({ group }) => group === "PE").map(({ id }) => id),
    ).toEqual(cable.ratings.hasPe ? ["a-pe", "b-pe"] : []);
    expect(cable.terminals).toHaveLength(2 * (cable.ratings.coreCount + 1));
    expect([3, 4, 5]).toContain(cable.source.page);
  }
  const file = (extension: string) =>
    readFileSync(
      new URL(
        `../docs/component-bank-lapp-olflex-115-cy.${extension}`,
        import.meta.url,
      ),
      "utf8",
    );
  expect(JSON.parse(file("json"))).toEqual({
    schemaVersion: 1,
    entries: olflexClassic115CyCables,
  });
  expect(file("csv").replaceAll("\r\n", "\n")).toBe(
    componentBankCsv(olflexClassic115CyCables).replaceAll("\r\n", "\n"),
  );
});

test("LAPP 130 H exports retain verified diameters and PE variants", () => {
  expect(olflexClassic130HCables).toHaveLength(85);
  for (const [orderCode, crossSectionMm2, hasPe] of [
    ["1123114", 1.5, true],
    ["1123115", 1.5, false],
    ["1123142", 2.5, true],
  ]) {
    expect(
      olflexClassic130HCables.find((cable) => cable.orderCode === orderCode),
    ).toMatchObject({
      ratings: { outerDiameterMm: 9, crossSectionMm2, hasPe },
      source: { page: 4 },
    });
  }
  for (const cable of olflexClassic130HCables) {
    expect(cable.terminals).toHaveLength(2 * cable.ratings.coreCount);
    expect(
      cable.terminals.filter(({ group }) => group === "PE").map(({ id }) => id),
    ).toEqual(cable.ratings.hasPe ? ["a-pe", "b-pe"] : []);
  }
  const file = (extension: string) =>
    readFileSync(
      new URL(
        `../docs/component-bank-lapp-olflex-130-h.${extension}`,
        import.meta.url,
      ),
      "utf8",
    );
  expect(JSON.parse(file("json"))).toEqual({
    schemaVersion: 1,
    entries: olflexClassic130HCables,
  });
  expect(file("csv").replaceAll("\r\n", "\n")).toBe(
    componentBankCsv(olflexClassic130HCables).replaceAll("\r\n", "\n"),
  );
});

test("Phoenix Contact PE exports preserve each clamp and the conductive rail foot", () => {
  expect(
    phoenixPtPeTerminals.map(({ orderCode, ratings }) => [
      orderCode,
      ratings.crossSectionMm2,
      ratings.ratedSurgeKV,
    ]),
  ).toEqual([
    ["3208139", 1.5, 6],
    ["3209536", 2.5, 6],
    ["3211766", 4, 8],
    ["3211822", 6, 8],
    ["3212131", 10, 8],
    ["3211025", 2.5, 6],
    ["3209594", 2.5, 8],
  ]);
  for (const entry of phoenixPtPeTerminals) {
    expect(entry.source.url).toContain(entry.orderCode);
    expect(entry.source.page).toBe(2);
    expect(entry.terminals.map(({ id }) => id)).toEqual([
      "clamp-1",
      "clamp-2",
      ...(["3211025", "3209594"].includes(entry.orderCode)
        ? ["clamp-3", "clamp-4"]
        : []),
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
  expect(general?.ratings.pulseOutput).toBeNull();
  expect(china?.ratings.pulseOutput).toEqual({
    voltageMinVdc: 5,
    voltageMaxVdc: 35,
    currentMinMa: 1,
    currentMaxMa: 20,
    pulseDurationMs: 120,
  });
  expect(china?.source.supplemental[0].page).toBe(1);
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
  const csv = readFileSync(
    new URL("../docs/component-bank-iem.csv", import.meta.url),
    "utf8",
  );
  expect(csv.replaceAll("\r\n", "\n")).toBe(
    componentBankCsv(iemMeters).replaceAll("\r\n", "\n"),
  );
});

test("iEM205x exports distinguish the mains, S0 and RS-485 terminals", () => {
  expect(iem205xMeters.map(({ orderCode }) => orderCode)).toEqual([
    "A9MEM2050",
    "A9MEM2055",
  ]);
  for (const meter of iem205xMeters) {
    expect(meter.ratings).toMatchObject({
      maxCurrentA: 45,
      voltageV: 230,
      accuracyClass: 1,
    });
    expect(
      meter.terminals.map(({ id, interface: kind }) => [id, kind]),
    ).toEqual([
      ["1", "ac-line"],
      ["3", "ac-line"],
      ["4", "ac-neutral"],
      ["6", "ac-neutral"],
      ["20", "pulse-output"],
      ["21", "pulse-output"],
      ["23", "rs485"],
      ["24", "rs485"],
    ]);
    expect(meter.source.supplemental.map(({ page }) => page)).toEqual([10]);
  }
  const file = (extension: string) =>
    readFileSync(
      new URL(`../docs/component-bank-iem205x.${extension}`, import.meta.url),
      "utf8",
    );
  expect(JSON.parse(file("json"))).toEqual({
    schemaVersion: 1,
    entries: iem205xMeters,
  });
  expect(file("csv").replaceAll("\r\n", "\n")).toBe(
    componentBankCsv(iem205xMeters).replaceAll("\r\n", "\n"),
  );
});

test("iEM2400 exports preserve the model-specific bus and both pulse pairs", () => {
  expect(iem24xxMeters.map(({ orderCode }) => orderCode)).toEqual([
    "A9MEM2435",
    "A9MEM2455",
    "METSEEM2214",
  ]);
  const [mbus, modbus, pulseOnly] = iem24xxMeters;
  expect(pulseOnly.conditions).toMatchObject({
    communication: null,
    tariffs: 1,
  });
  expect(
    mbus.terminals
      .filter(({ interface: kind }) => kind === "m-bus")
      .map(({ id }) => id),
  ).toEqual(["10", "11"]);
  expect(
    modbus.terminals
      .filter(({ interface: kind }) => kind === "rs485")
      .map(({ id }) => id),
  ).toEqual(["10", "11"]);
  for (const meter of iem24xxMeters) {
    expect(meter.ratings).toMatchObject({ voltageV: 230, maxCurrentA: 100 });
    expect(meter.terminals.map(({ id }) => id)).toEqual([
      "1",
      "3",
      "4",
      "6",
      ...(meter.conditions.communication ? ["10", "11"] : []),
      "18",
      "19",
      "20",
      "21",
    ]);
    expect(meter.terminals.slice(-4).map(({ group }) => group)).toEqual([
      "S0 forward +",
      "S0 forward −",
      "S0 reverse +",
      "S0 reverse −",
    ]);
    expect(meter.source.supplemental[0].page).toBe(
      meter.conditions.communication ? 10 : 2,
    );
  }
  const file = (extension: string) =>
    readFileSync(
      new URL(`../docs/component-bank-iem24xx.${extension}`, import.meta.url),
      "utf8",
    );
  expect(JSON.parse(file("json"))).toEqual({
    schemaVersion: 1,
    entries: iem24xxMeters,
  });
  expect(file("csv").replaceAll("\r\n", "\n")).toBe(
    componentBankCsv(iem24xxMeters).replaceAll("\r\n", "\n"),
  );
});

test.each([
  ["LGY412548", 125, 4.2, { 9: 1, 7.5: 7, 6.5: 4 }],
  ["LGY412560", 125, 4.2, { 9.5: 1, 8.5: 3, 6.5: 11 }],
  ["LGY416048", 160, 8.4, { 12: 1, 9: 3, 7.5: 8 }],
] as const)(
  "%s preserves the documented screw holes per pole",
  (model, ratedCurrentA, icwKA, sizes) => {
    const block = linergyDsFourPoleBlocks.find(
      (entry) => entry.model === model,
    )!;
    expect(block.ratings).toMatchObject({ ratedCurrentA, icwKA, poles: 4 });
    expect(block.source.pageLabel).toBe("B-3");
    expect(new Set(block.terminals.map(({ id }) => id)).size).toBe(
      block.terminals.length,
    );
    for (const pole of [1, 2, 3, 4]) {
      const terminals = block.terminals.filter(
        ({ group }) => group === `pole-${pole}`,
      );
      expect(terminals).toHaveLength(
        Object.values(sizes).reduce((sum: number, count) => sum + count, 0),
      );
      for (const [diameter, count] of Object.entries(sizes)) {
        expect(
          terminals.filter(
            ({ connector }) => connector === `Ø ${diameter} mm screw terminal`,
          ),
        ).toHaveLength(count);
      }
    }
  },
);

test("Linergy neutral strips export one neutral node with every screw terminal", () => {
  expect(
    linergyNeutralBars.map(({ model, ratings, terminals }) => [
      model,
      ratings.ratedCurrentA,
      terminals.length,
    ]),
  ).toEqual([
    ["LGYN1007", 100, 7],
    ["LGYN12512", 125, 12],
    ["LGYN12515", 125, 15],
  ]);
  for (const strip of linergyNeutralBars) {
    expect(
      strip.terminals.every(
        ({ group, interface: terminalInterface }) =>
          group === "neutral" && terminalInterface === "neutral-bus",
      ),
    ).toBe(true);
    expect(strip.source.pageLabel).toBe("B-3");
    expect(strip.modelMapping).toBeNull();
  }
  const file = (extension: string) =>
    readFileSync(
      new URL(
        `../docs/component-bank-linergy-neutral-bars.${extension}`,
        import.meta.url,
      ),
      "utf8",
    );
  expect(JSON.parse(file("json"))).toEqual({
    schemaVersion: 1,
    entries: linergyNeutralBars,
  });
  expect(file("csv").replaceAll("\r\n", "\n")).toBe(
    componentBankCsv(linergyNeutralBars).replaceAll("\r\n", "\n"),
  );
});

test("Linergy LGY410028 exports four isolated groups of seven connections", () => {
  const [block] = linergyDsFourPoleBlocks;
  expect(block).toMatchObject({
    orderCode: "LGY410028",
    ratings: { poles: 4, ratedCurrentA: 100, ipkKA: 24, icwKA: 3 },
    conditions: { icwDurationSeconds: 1 },
  });
  expect(block.terminals).toHaveLength(28);
  expect(new Set(block.terminals.map(({ group }) => group))).toEqual(
    new Set(["pole-1", "pole-2", "pole-3", "pole-4"]),
  );
  for (const pole of ["pole-1", "pole-2", "pole-3", "pole-4"]) {
    const connectors = block.terminals
      .filter(({ group }) => group === pole)
      .map(({ connector }) => connector);
    expect(
      connectors.filter((label) => label === "Ø 7.5 mm screw terminal"),
    ).toHaveLength(2);
    expect(
      connectors.filter((label) => label === "Ø 5.5 mm screw terminal"),
    ).toHaveLength(5);
  }
  expect(block.missingFields).toContain("distribution-pole-phase-assignment");
  const file = (extension: string) =>
    readFileSync(
      new URL(
        `../docs/component-bank-linergy-four-pole.${extension}`,
        import.meta.url,
      ),
      "utf8",
    );
  expect(JSON.parse(file("json"))).toEqual({
    schemaVersion: 1,
    entries: linergyDsFourPoleBlocks,
  });
  expect(file("csv").replaceAll("\r\n", "\n")).toBe(
    componentBankCsv(linergyDsFourPoleBlocks).replaceAll("\r\n", "\n"),
  );
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
