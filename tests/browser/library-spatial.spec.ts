import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import type { Project } from "../../src/domain/types";
import {
  createProject,
  createLoad,
  createBoard,
  createCircuit,
} from "../../src/domain/project";
async function route(page: Page, name: string) {
  if (!(await page.locator(".sidebar").isVisible()))
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
  await page
    .locator(".sidebar")
    .getByRole("button", {
      name: new RegExp("^" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    })
    .click();
}
async function seed(page: Page) {
  await page.goto("/");
  await expect(page.locator(".overview-banner")).toBeVisible();
  const p = createProject("Library and spatial validation"),
    board = createBoard({ name: "Validation board" }),
    circuit = createCircuit(board.id, { name: "Validation circuit" });
  p.boards = [board];
  p.circuits = [circuit];
  p.loads = [
    createLoad({
      name: "Analytical heater",
      rating: 2.3,
      boardId: board.id,
      circuitId: circuit.id,
      hoursPerDay: 8,
      startHour: 8,
    }),
  ];
  await page.locator('input[type=file][accept=".json,.csv"]').setInputFiles({
    name: "fixture.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(p)),
  });
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Apply import", exact: true })
    .click();
  await expect(page.locator(".load-table")).toBeVisible();
}
async function exported(page: Page): Promise<Project> {
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export project", exact: true })
    .click();
  const file = await pending;
  return JSON.parse(await readFile((await file.path())!, "utf8"));
}
test("library favorites, linked replacement review, version history and undo", async ({
  page,
}) => {
  await seed(page);
  const initial = await exported(page);
  await route(page, "Equipment Library");
  const library = page.locator(".equipment-workspace");
  const history = library.locator("details").filter({
    has: page.getByText("Equipment version history", { exact: true }),
  });
  const detailLevel = page.getByRole("combobox", { name: "Detail level" });
  await expect(history).toHaveAttribute("open", "");
  await detailLevel.selectOption("simple");
  await expect(history).not.toHaveAttribute("open");
  await detailLevel.selectOption("engineering");
  await expect(history).toHaveAttribute("open", "");
  await library
    .getByLabel("Save an existing load as a template", { exact: true })
    .selectOption(initial.loads[0].id);
  await library
    .getByRole("button", { name: "Save selected equipment", exact: true })
    .click();
  await library
    .getByRole("button", { name: "Favorite Analytical heater", exact: true })
    .click();
  await library.getByLabel("Favorites only", { exact: true }).check();
  await expect(library.locator("tbody tr").first()).toContainText(
    "Analytical heater",
  );
  await library.getByRole("button", { name: "Add load", exact: true }).click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Name", { exact: true }).fill("Library heater");
  await dialog.locator(".modal-footer .primary").click();
  await expect(page.locator(".load-table")).toContainText("Library heater");
  await route(page, "Equipment Library");
  await library
    .getByRole("button", { name: "Edit Analytical heater", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel(/^Rating/).fill("4.6");
  await dialog.locator(".modal-footer .primary").click();
  dialog = page.getByRole("dialog", {
    name: "Review equipment replacement",
    exact: true,
  });
  await expect(dialog).toContainText("2.3");
  await expect(dialog).toContainText("4.6");
  await dialog.getByLabel(/Library heater/).check();
  await dialog
    .getByRole("button", { name: /Apply reviewed replacement/ })
    .click();
  await expect(dialog).toHaveCount(0);
  let p = await exported(page);
  expect(p.loads.find((load) => load.name === "Library heater")?.rating).toBe(
    4.6,
  );
  expect(
    p.loads.find((load) => load.name === "Analytical heater")?.rating,
  ).toBe(2.3);
  expect(p.equipmentLibrary?.[0].libraryRef?.version).toBe(2);
  expect(p.equipmentVersions?.[0].record.rating).toBe(2.3);
  expect(p.equipmentFavorites).toEqual([p.equipmentLibrary?.[0].id]);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  p = await exported(page);
  expect(p.loads.find((load) => load.name === "Library heater")?.rating).toBe(
    2.3,
  );
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(page.locator(".save-badge")).toContainText("Saved locally");
  await page.reload();
  await expect(page.locator(".equipment-workspace")).toBeVisible();
  p = await exported(page);
  expect(p.equipmentVersions).toHaveLength(1);
  expect(
    p.loads.find((load) => load.name === "Library heater")?.libraryRef?.version,
  ).toBe(2);
});
test("spatial graph follows real objects and hourly flow with keyboard orbit and vector export", async ({
  page,
}) => {
  await seed(page);
  await route(page, "Single-Line Studio");
  await page
    .getByRole("button", { name: "Analytical spatial view", exact: true })
    .click();
  const spatial = page.locator(".spatial-workspace");
  const scene = spatial.getByRole("img", {
    name: "Perspective project graph",
    exact: true,
  });
  const heaterPower = scene
    .getByRole("button", { name: /: Analytical heater$/ })
    .locator("text")
    .last();
  await expect(spatial).toBeVisible();
  await spatial.getByLabel("Representative hour", { exact: true }).fill("12");
  await expect(heaterPower).toHaveText("2.3 kW");
  await spatial.getByLabel("Representative hour", { exact: true }).fill("2");
  await expect(heaterPower).toHaveText("0 kW");
  await spatial.getByLabel("Orbit angle", { exact: false }).focus();
  await spatial.getByLabel("Orbit angle", { exact: false }).press("ArrowRight");
  await expect(spatial.getByLabel("Orbit angle", { exact: false })).toHaveValue(
    "-24",
  );
  await spatial
    .getByLabel("Isolate board", { exact: true })
    .selectOption({ label: "Validation board" });
  await expect(scene).toContainText("Validation circuit");
  await expect(scene).not.toContainText("Grid / supply");
  await spatial
    .getByLabel("Inspect spatial object", { exact: true })
    .selectOption({ label: "Analytical heater" });
  const spatialHeater = scene.getByRole("button", {
    name: /Analytical heater$/,
  });
  await expect(spatialHeater).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".inspector")).toContainText("Analytical heater");
  const mode = page.locator(".page-heading .detail-mode-control select");
  const objectDetail = spatial.locator(".spatial-object-detail");
  await mode.selectOption("simple");
  await expect(objectDetail).toHaveJSProperty("open", false);
  await expect(spatial).toContainText("Analytical heater");
  await expect(spatial).toContainText("0 kW");
  await mode.selectOption("engineering");
  await expect(objectDetail).toHaveJSProperty("open", true);
  await page
    .getByRole("button", { name: "Single-line diagram", exact: true })
    .click();
  const diagramHeater = page.locator(
    '.topology-node[aria-label$="Analytical heater"]',
  );
  await expect(diagramHeater).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Analytical spatial view", exact: true })
    .click();
  await expect(
    scene.getByRole("button", { name: /Analytical heater$/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Single-line diagram", exact: true })
    .click();
  const diagramCircuit = page.locator(
    '.topology-node[aria-label$="Validation circuit"]',
  );
  await diagramCircuit.click();
  await expect(diagramCircuit).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Analytical spatial view", exact: true })
    .click();
  await expect(
    scene.getByRole("button", { name: /Validation circuit$/ }),
  ).toHaveAttribute("aria-pressed", "true");
  const pending = page.waitForEvent("download");
  await spatial
    .getByRole("button", { name: "Export spatial SVG", exact: true })
    .click();
  const file = await pending;
  const text = await readFile((await file.path())!, "utf8");
  expect(text).toContain("<svg");
  expect(text).toContain("Analytical heater");
  expect(text).not.toContain("NaN");
  await page.screenshot({
    path: "docs/screenshots/spatial-workspace.png",
    fullPage: true,
  });
});
test("responsive layouts, persisted split widths, reduced motion and keyboard context menu", async ({
  page,
}) => {
  await seed(page);
  const loadName = page
    .getByRole("button", { name: /Analytical heater/ })
    .filter({ has: page.locator("strong") });
  await loadName.focus();
  await loadName.press("Shift+F10");
  await expect(
    page.getByRole("menu", { name: "Load actions", exact: true }),
  ).toBeVisible();
  await page.getByRole("menuitem", { name: "Edit load", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await route(page, "Settings");
  await page.getByRole("slider", { name: /Navigation width/ }).fill("300");
  await page.getByRole("slider", { name: /Inspector width/ }).fill("340");
  await page.getByLabel("Motion", { exact: true }).selectOption("paused");
  const detailLevel = page
    .locator(".page-heading")
    .getByLabel("Detail level", { exact: true });
  await detailLevel.selectOption("simple");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  await page.reload();
  await expect(detailLevel).toHaveValue("simple");
  expect(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--sidebar")
        .trim(),
    ),
  ).toBe("300px");
  for (const width of [360, 768, 1440, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator(".main-content")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 360, height: 900 });
  await page.screenshot({
    path: "docs/screenshots/mobile-settings-complete.png",
    fullPage: true,
  });
});

test("diagram settings follow global detail mode without changing project data", async ({
  page,
}) => {
  await seed(page);
  const before = await exported(page);
  await route(page, "Single-Line Studio");
  const mode = page.locator(".page-heading .detail-mode-control select");
  const settings = page.locator(".diagram-settings");
  await mode.selectOption("simple");
  await expect(settings).toBeVisible();
  await expect(settings).toHaveJSProperty("open", false);
  await mode.selectOption("engineering");
  await expect(settings).toHaveJSProperty("open", true);
  await mode.selectOption("simple");
  await expect(settings).toHaveJSProperty("open", false);
  expect(await exported(page)).toEqual(before);
});
test("manufacturer catalogue searches and exports the exact model", async ({
  page,
}) => {
  await page.goto("/#/library");
  const catalogue = page.getByRole("region", {
    name: "Manufacturer equipment",
  });
  const search = catalogue.getByRole("searchbox");
  const model = catalogue.getByRole("combobox", { name: "Inspect model" });
  await catalogue
    .getByLabel("Equipment category")
    .selectOption("protection-devices");
  await expect(model.getByRole("option")).toHaveCount(50);
  await catalogue.getByRole("button", { name: "Next records" }).click();
  await expect(catalogue.getByText("51–100 / 673")).toBeVisible();
  await search.fill("A9F95472");
  await expect(catalogue.getByText("15 kA · 400 V AC")).toBeVisible();
  await search.fill("A9F85463");
  await expect(catalogue.getByText("10 kA · 400 V AC")).toBeVisible();
  await search.fill("A9R08263");
  await expect(catalogue.getByText("110 V AC")).toBeVisible();
  await search.fill("A9R17440");
  await expect(catalogue.getByText("500 mA · S")).toBeVisible();
  await search.fill("Schneider A9F74106");
  await expect(model).toHaveValue("schneider-electric:a9f74106");
  await catalogue
    .getByLabel("Equipment category")
    .selectOption("ev-charging-equipment");
  await search.fill("EVH4A11NC");
  await expect(model).toHaveValue("schneider-electric:evh4a11nc");
  await expect(catalogue.getByText("11 kW", { exact: true })).toBeVisible();
  await expect(catalogue.getByText("16 A · 3P")).toBeVisible();
  const evlinkDownload = page.waitForEvent("download");
  await catalogue.getByRole("button", { name: "Export record JSON" }).click();
  const evlink = JSON.parse(
    await readFile(await (await evlinkDownload).path(), "utf8"),
  );
  expect(JSON.stringify(evlink)).toContain("Type 2 cable (5 m)");
  await catalogue
    .getByLabel("Equipment category")
    .selectOption("drives-and-starting-equipment");
  await search.fill("ATV320D15M3C");
  await expect(model).toHaveValue("schneider-electric:atv320d15m3c");
  await expect(catalogue.getByText("15 kW", { exact: true })).toBeVisible();
  await expect(catalogue.getByText("66 A", { exact: true })).toBeVisible();
  await expect(catalogue.getByText("200–240 V AC · 3P")).toBeVisible();
  const driveDownload = page.waitForEvent("download");
  await catalogue.getByRole("button", { name: "Export record JSON" }).click();
  const drive = JSON.parse(
    await readFile(await (await driveDownload).path(), "utf8"),
  );
  expect(drive.entry.source.supplemental[0].page).toBe(144);
  await catalogue.getByText("Source, terminals and model readiness").click();
  await expect(
    catalogue.getByRole("link", { name: "NVE41289.09 (04/2025) · Page 144" }),
  ).toHaveAttribute("href", /p_Doc_Ref=NVE41289/);
  await catalogue.getByText("Source, terminals and model readiness").click();
  expect(
    drive.entry.terminals.map(({ group }: { group: string }) => group),
  ).toContain("T/L3");
  await catalogue
    .getByLabel("Equipment category")
    .selectOption("cables-and-conductors");
  await search.fill("1119115");
  await expect(model).toHaveValue("lapp:1119115");
  await expect(catalogue.getByText("15 · PE", { exact: true })).toBeVisible();
  await expect(catalogue.getByText("0.75 mm²", { exact: true })).toBeVisible();
  await expect(catalogue.getByText("300/500 V", { exact: true })).toBeVisible();
  await catalogue.getByText("Source, terminals and model readiness").click();
  await expect(
    catalogue.getByRole("link", {
      name: "DB1119752EN v12 (2023-03-03) · Page 1",
    }),
  ).toHaveAttribute("href", /dam-media\.lapp\.com/);
  await catalogue.getByText("Source, terminals and model readiness").click();
  const cableDownload = page.waitForEvent("download");
  await catalogue.getByRole("button", { name: "Export record JSON" }).click();
  const cable = JSON.parse(
    await readFile(await (await cableDownload).path(), "utf8"),
  );
  expect(cable.entry.terminals).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: "a-pe", group: "PE" }),
      expect.objectContaining({ id: "b-pe", group: "PE" }),
    ]),
  );
  expect(cable.entry.ratings.coreToCoreTestVAc).toBe(4000);
  await search.fill("1119100");
  await expect(model).toHaveValue("lapp:1119100");
  await expect(catalogue.getByText("100 · PE", { exact: true })).toBeVisible();
  const highCoreDownload = page.waitForEvent("download");
  await catalogue.getByRole("button", { name: "Export record JSON" }).click();
  const highCore = JSON.parse(
    await readFile(await (await highCoreDownload).path(), "utf8"),
  );
  expect(highCore.entry.terminals).toHaveLength(200);
  expect(
    highCore.entry.terminals.slice(-4).map(({ id }: { id: string }) => id),
  ).toEqual(["a-99", "b-99", "a-pe", "b-pe"]);
  await search.fill("1135628");
  await expect(model).toHaveValue("lapp:1135628");
  await expect(catalogue.getByText("33.2 mm", { exact: true })).toBeVisible();
  const shieldedDownload = page.waitForEvent("download");
  await catalogue.getByRole("button", { name: "Export record JSON" }).click();
  const shielded = JSON.parse(
    await readFile(await (await shieldedDownload).path(), "utf8"),
  );
  expect(shielded.entry.terminals).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: "a-shield", group: "Shield" }),
      expect.objectContaining({ id: "b-shield", group: "Shield" }),
      expect.objectContaining({ id: "a-pe", group: "PE" }),
      expect.objectContaining({ id: "b-pe", group: "PE" }),
    ]),
  );
  await search.fill("00100933");
  await expect(model).toHaveValue("lapp:00100933");
  await expect(catalogue.getByText("450/750 V", { exact: true })).toBeVisible();
  const classic100Download = page.waitForEvent("download");
  await catalogue.getByRole("button", { name: "Export record JSON" }).click();
  const classic100 = JSON.parse(
    await readFile(await (await classic100Download).path(), "utf8"),
  );
  expect(classic100.entry.orderCode).toBe("00100933");
  expect(classic100.entry.terminals).toHaveLength(6);
  expect(classic100.entry.ratings.hasPe).toBe(false);
  await catalogue.getByLabel("Equipment category").selectOption("generators");
  await search.fill("STAMFORD S1L2-Y1");
  await expect(model).toHaveValue("stamford:s1l2-y1-311");
  await expect(catalogue.getByText("62.5 kVA", { exact: true })).toBeVisible();
  await expect(catalogue.getByText("56.9 kVA", { exact: true })).toBeVisible();
  await expect(catalogue.getByText("400/415 V AC · 50 Hz")).toBeVisible();
  const alternatorDownload = page.waitForEvent("download");
  await catalogue.getByRole("button", { name: "Export record JSON" }).click();
  const alternator = JSON.parse(
    await readFile(await (await alternatorDownload).path(), "utf8"),
  );
  expect(
    alternator.entry.terminals.map(({ group }: { group: string }) => group),
  ).toEqual([
    "U1",
    "U2",
    "U5",
    "U6",
    "V1",
    "V2",
    "V5",
    "V6",
    "W1",
    "W2",
    "W5",
    "W6",
  ]);
  expect(alternator.entry.source.page).toBe(6);
  await catalogue
    .getByLabel("Equipment category")
    .selectOption("enclosures-and-installation-hardware");
  await search.fill("NSYS3HD3215");
  await expect(model).toHaveValue("schneider-electric:nsys3hd3215");
  await expect(catalogue.getByText("343 × 200 × 180 mm")).toBeVisible();
  await expect(catalogue.getByText("IP66 · IK10")).toBeVisible();
  const enclosureDownload = page.waitForEvent("download");
  await catalogue.getByRole("button", { name: "Export record JSON" }).click();
  const enclosure = JSON.parse(
    await readFile(await (await enclosureDownload).path(), "utf8"),
  );
  expect(enclosure.entry.source.pageLabel).toBe("4, 16");
  expect(enclosure.entry.missingFields).toContain("enclosure-bonding-points");
  await catalogue
    .getByLabel("Equipment category")
    .selectOption("lighting-equipment");
  await search.fill("910500465901");
  await expect(model).toHaveValue("philips:910500465901");
  await expect(catalogue.getByText("1,000 lm", { exact: true })).toBeVisible();
  await expect(catalogue.getByText("3,000 K", { exact: true })).toBeVisible();
  const lightingDownload = page.waitForEvent("download");
  await catalogue.getByRole("button", { name: "Export record JSON" }).click();
  const lighting = JSON.parse(
    await readFile(await (await lightingDownload).path(), "utf8"),
  );
  expect(
    lighting.entry.terminals.map(({ group }: { group: string }) => group),
  ).toEqual(["L", "N", "DA/N", "DA/Ls"]);
  expect(lighting.entry.source).toMatchObject({
    page: 2,
    revision: "Philips fact sheet (2026-10-30)",
  });
  await catalogue.getByLabel("Equipment category").selectOption("");
  await catalogue
    .getByLabel("Equipment category")
    .selectOption("motors-and-motor-driven-equipment");
  await search.fill("15833976");
  await expect(model).toHaveValue("weg:15833976");
  await expect(catalogue.getByText("230/400 V · 50 Hz")).toBeVisible();
  await expect(catalogue.getByText("2.92/1.68 A · 1,435 rpm")).toBeVisible();
  const motorDownload = page.waitForEvent("download");
  await catalogue.getByRole("button", { name: "Export record JSON" }).click();
  const motor = JSON.parse(
    await readFile(await (await motorDownload).path(), "utf8"),
  );
  expect(motor.entry.ratings.operatingPoints).toHaveLength(4);
  expect(motor.entry.ratings.operatingPoints[1]).toMatchObject({
    powerFactor: 0.78,
    efficiencyPercent: 82.5,
  });
  expect(motor.entry.missingFields).toContain("motor-terminal-diagram");
  await catalogue
    .getByLabel("Equipment category")
    .selectOption("commercial-and-industrial-loads");
  await search.fill("165850");
  await expect(model).toHaveValue("chromalox:165850");
  await expect(catalogue.getByText("3,000 W", { exact: true })).toBeVisible();
  await expect(catalogue.getByText("240 V", { exact: true })).toBeVisible();
  const heaterDownload = page.waitForEvent("download");
  await catalogue.getByRole("button", { name: "Export record JSON" }).click();
  const heater = JSON.parse(
    await readFile(await (await heaterDownload).path(), "utf8"),
  );
  expect(heater.entry).toMatchObject({
    model: "NSL-5403",
    orderCode: "165850",
  });
  expect(
    heater.entry.terminals.map(
      ({ connector }: { connector: string }) => connector,
    ),
  ).toEqual(["wire lead", "wire lead"]);
  await search.fill("NSL-5403");
  await expect(
    model.getByRole("option", { name: /NSL-5403 · 165868/ }),
  ).toBeAttached();
  await model.selectOption("chromalox:165868");
  await expect(catalogue.getByText("480 V", { exact: true })).toBeVisible();
  const highVoltageDownload = page.waitForEvent("download");
  await catalogue.getByRole("button", { name: "Export record CSV" }).click();
  expect((await highVoltageDownload).suggestedFilename()).toBe(
    "component-bank-165868.csv",
  );
  await catalogue
    .getByLabel("Equipment category")
    .selectOption("prime-movers-and-generation-auxiliaries");
  await search.fill("STAMFORD AS480");
  await expect(model).toHaveValue("stamford:as480");
  await expect(
    catalogue.getByText("100–264 V AC", { exact: true }),
  ).toBeVisible();
  await expect(
    catalogue.getByText("7.5 A DC · 10 s", { exact: true }),
  ).toBeVisible();
  const avrDownload = page.waitForEvent("download");
  await catalogue.getByRole("button", { name: "Export record JSON" }).click();
  const avr = JSON.parse(
    await readFile(await (await avrDownload).path(), "utf8"),
  );
  expect(
    avr.entry.terminals.map(({ group }: { group: string }) => group),
  ).toEqual(["7", "8", "F1", "F2"]);
  expect(avr.entry.conditions.externalMountingCurrentDeratePercent).toBe(20);
  await catalogue.getByLabel("Equipment category").selectOption("");
  await search.fill("PIN242122530");
  await expect(catalogue.getByText("24 V DC → 120 V AC")).toBeVisible();
  await search.fill("PIN241501210");
  await expect(catalogue.getByText("380 W", { exact: true })).toBeVisible();
  await search.fill("SMV3000CAI");
  await expect(catalogue.getByText("2,100 W")).toBeVisible();
  await search.fill("BAT412060082");
  await expect(catalogue.getByText("52 / 56 / 60 Ah")).toBeVisible();
  await search.fill("ABT7PDU004B");
  await expect(catalogue.getByText("2 × 24 V AC")).toBeVisible();
  await search.fill("ABL6TS25B");
  await expect(catalogue.getByText("250 VA")).toBeVisible();
  await expect(catalogue.getByText("24 V AC", { exact: true })).toBeVisible();
  await search.fill("LVS04200");
  await expect(catalogue.getByText("9 kA rms · 0.5 s")).toBeVisible();
  await search.fill("3212131");
  await expect(model).toHaveValue("phoenix-contact:3212131");
  await expect(catalogue.getByText("10 mm²", { exact: true })).toBeVisible();
  await expect(catalogue.getByText("8 kV", { exact: true })).toBeVisible();
  const peDownload = page.waitForEvent("download");
  await catalogue.getByRole("button", { name: "Export record JSON" }).click();
  const pe = JSON.parse(
    await readFile(await (await peDownload).path(), "utf8"),
  );
  expect(
    pe.entry.terminals.map(({ id, group }: { id: string; group: string }) => [
      id,
      group,
    ]),
  ).toEqual([
    ["clamp-1", "pe"],
    ["clamp-2", "pe"],
    ["rail-foot", "pe"],
  ]);
  await search.fill("3211025");
  await expect(model).toHaveValue("phoenix-contact:3211025");
  await expect(catalogue.getByText("2.5 mm²", { exact: true })).toBeVisible();
  const quattroDownload = page.waitForEvent("download");
  await catalogue.getByRole("button", { name: "Export record JSON" }).click();
  const quattro = JSON.parse(
    await readFile(await (await quattroDownload).path(), "utf8"),
  );
  expect(quattro.entry.terminals.map(({ id }: { id: string }) => id)).toEqual([
    "clamp-1",
    "clamp-2",
    "clamp-3",
    "clamp-4",
    "rail-foot",
  ]);
  await search.fill("LGY112510");
  await expect(catalogue.getByText("4.2 kA · 1 s")).toBeVisible();
  await search.fill("RM17TG20");
  await expect(catalogue.getByText("208–440 V AC")).toBeVisible();
  await expect(catalogue.getByText("2 CO · 5 A")).toBeVisible();
  await search.fill("A9MEM2010C");
  await expect(catalogue.getByText("100 imp/kWh")).toBeVisible();
  await expect(catalogue.getByText("China only")).toBeVisible();
  await search.fill("no matching product");
  await expect(catalogue.getByRole("status")).toHaveText(
    "No matching equipment",
  );
  await search.fill("CS6.2-48TM-455H");
  await expect(model).toHaveValue("canadian-solar:cs6.2-48tm-455h");
  await expect(catalogue.getByText("455 W", { exact: true })).toBeVisible();
  await catalogue.getByText("Source, terminals and model readiness").click();
  await expect(
    catalogue.getByText("PV worksheet inputs reviewed"),
  ).toBeVisible();
  await expect(catalogue.getByText("Separate order code")).toBeVisible();
  const pending = page.waitForEvent("download");
  await catalogue.getByRole("button", { name: "Export record JSON" }).click();
  expect((await pending).suggestedFilename()).toBe(
    "component-bank-CS6.2-48TM-455H.json",
  );
  const csv = page.waitForEvent("download");
  await catalogue.getByRole("button", { name: "Export record CSV" }).click();
  const contents = await readFile(await (await csv).path(), "utf8");
  expect(contents.trimEnd().split(/\r?\n/)).toHaveLength(2);
  expect(contents).toContain('"canadian-solar:cs6.2-48tm-455h"');
  await search.fill("A9F74106");
  await expect(model).toHaveValue("schneider-electric:a9f74106");
  await expect(catalogue.getByText("6 A", { exact: true })).toBeVisible();
  await expect(catalogue.getByText("6 kA · 230 V AC")).toBeVisible();
  await catalogue
    .getByRole("button", { name: "Add to project equipment" })
    .click();
  const equipment = page.getByRole("region", { name: "Project equipment" });
  await equipment.getByRole("spinbutton").fill("2");
  await equipment.getByRole("spinbutton").press("Tab");
  await page
    .locator(".workspace-toolbar")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await expect(page.locator(".save-badge")).toContainText("Saved locally");
  await page.goto("/#/diagram");
  await page.getByRole("button", { name: /equipment: .*A9F74106/ }).click();
  const inspector = page.getByRole("complementary", {
    name: "Topology object inspector",
  });
  await inspector.getByLabel("Phase", { exact: true }).selectOption("L2");
  await inspector.getByLabel("To unit").fill("2");
  await inspector.getByLabel("To terminal").selectOption("pole-1-bottom");
  await inspector.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(inspector).toContainText("L2 ·");
  await expect(
    page
      .locator("svg title")
      .filter({ hasText: "L2 · 1 · pole-1-top ↔ 2 · pole-1-bottom" }),
  ).toHaveCount(1);
});

test("sourced equipment keeps its edited quantity in the saved project BOM", async ({
  page,
}) => {
  await page.goto("/#/library");
  const catalogue = page.getByRole("region", {
    name: "Manufacturer equipment",
  });
  await catalogue.getByRole("searchbox").fill("CS6.2-48TM-455H");
  await catalogue
    .getByRole("button", { name: "Add to project equipment" })
    .click();
  const equipment = page.getByRole("region", { name: "Project equipment" });
  await equipment.getByRole("textbox").fill("Roof array");
  await equipment.getByRole("textbox").press("Tab");
  await equipment.getByRole("spinbutton").fill("24");
  await equipment.getByRole("spinbutton").press("Tab");
  await page
    .locator(".workspace-toolbar")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await expect(page.locator(".save-badge")).toContainText("Saved locally");
  await page.reload();
  await expect(equipment.getByRole("textbox")).toHaveValue("Roof array");
  await expect(equipment.getByRole("spinbutton")).toHaveValue("24");
  await page.goto("/#/diagram");
  await page.getByRole("button", { name: "equipment: Roof array" }).click();
  const inspector = page.getByRole("complementary", {
    name: "Topology object inspector",
  });
  await expect(inspector).toContainText("dc-positive");
  await expect(inspector).toContainText("dc-negative");
  await expect(inspector).toContainText("frame-bond");
  await inspector.getByLabel("To unit").fill("2");
  await inspector.getByLabel("To terminal").selectOption("negative");
  await inspector.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(inspector).toContainText(
    "Roof array [1] · positive ↔ Roof array [2] · negative",
  );
  await page
    .locator(".workspace-toolbar")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await expect(page.locator(".save-badge")).toContainText("Saved locally");
  await page.reload();
  await page.getByRole("button", { name: "equipment: Roof array" }).click();
  await expect(
    inspector.getByRole("button", { name: "Disconnect" }),
  ).toBeVisible();
  const svgDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export SVG", exact: true }).click();
  const svg = await readFile(await (await svgDownload).path(), "utf8");
  expect(svg).toContain('stroke-dasharray="5 3"');
  expect(svg).toContain("1 · positive ↔ 2 · negative");
  await expect(inspector).toContainText("Voc 72 V · Vmp 61.6 V · Imp 14.78 A");
  await inspector.getByLabel("From terminal").selectOption("negative");
  await inspector.getByLabel("To unit").fill("2");
  await inspector.getByLabel("To terminal").selectOption("negative");
  await inspector.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(inspector.getByRole("alert")).toBeVisible();
  await expect(
    inspector.getByRole("button", { name: "Disconnect" }),
  ).toHaveCount(1);
  await page.goto("/#/reports");
  await page
    .getByRole("checkbox", { name: "Model-derived bill of materials" })
    .check();
  await page.getByRole("button", { name: "Freeze report preview" }).click();
  const preview = page.locator("#engineering-report-preview");
  await expect(preview).toContainText("Catalogue equipment wiring schedule");
  await expect(preview).toContainText("Roof array [1] · positive");
  await expect(preview).toContainText("Roof array [2] · negative");
  await expect(preview).toContainText("PV series string at STC");
  const stringRow = preview
    .getByRole("row")
    .filter({ hasText: "Roof array [1] → Roof array [2]" });
  await expect(stringRow.getByRole("cell").nth(1)).toHaveText("72");
  await expect(stringRow.getByRole("cell").nth(2)).toHaveText("61.6");
  await expect(stringRow.getByRole("cell").nth(3)).toHaveText("14.78");
  await expect(stringRow.getByRole("cell").nth(4)).toHaveText("16.09");
  await expect(stringRow.getByRole("cell").nth(5)).toHaveText("0.91");
  await expect(preview).toContainText("· p. 2 ·");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export frozen report data" }).click();
  const exported = JSON.parse(
    await readFile(await (await download).path(), "utf8"),
  );
  expect(exported.project.equipmentTerminalConnections).toHaveLength(1);
  expect(exported.project.catalogueEquipment[0]).toMatchObject({
    sourcePage: 2,
    model: "CS6.2-48TM-455H",
    quantity: 24,
  });
  await page.goto("/#/diagram");
  await page.getByRole("button", { name: "equipment: Roof array" }).click();
  await inspector.getByRole("button", { name: "Disconnect" }).click();
  await expect(
    inspector.getByRole("button", { name: "Disconnect" }),
  ).toHaveCount(0);
});

test("battery wiring persists a series link and rejects a shared terminal node", async ({
  page,
}) => {
  await page.goto("/#/library");
  const catalogue = page.getByRole("region", {
    name: "Manufacturer equipment",
  });
  await catalogue.getByRole("searchbox").fill("BAT412060082");
  await catalogue
    .getByRole("button", { name: "Add to project equipment" })
    .click();
  const quantity = page
    .getByRole("region", { name: "Project equipment" })
    .getByRole("spinbutton");
  await quantity.fill("2");
  await quantity.press("Tab");
  const save = page
    .locator(".workspace-toolbar")
    .getByRole("button", { name: "Save", exact: true });
  await save.click();
  await expect(page.locator(".save-badge")).toContainText("Saved locally");
  await page.goto("/#/diagram");
  await page.getByRole("button", { name: /equipment: .*BAT412060082/ }).click();
  const inspector = page.getByRole("complementary", {
    name: "Topology object inspector",
  });
  await inspector.getByLabel("To unit").fill("2");
  await inspector.getByLabel("To terminal").selectOption("negative");
  await inspector.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(
    inspector.getByRole("button", { name: "Disconnect" }),
  ).toHaveCount(1);
  await save.click();
  await expect(page.locator(".save-badge")).toContainText("Saved locally");
  await page.reload();
  await page.getByRole("button", { name: /equipment: .*BAT412060082/ }).click();
  await expect(inspector).toContainText("24 V · 60 Ah C20 · 1.44 kWh");
  await inspector.getByLabel("From terminal").selectOption("negative");
  await inspector.getByLabel("To unit").fill("2");
  await inspector.getByLabel("To terminal").selectOption("negative");
  await inspector.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(inspector.getByRole("alert")).toBeVisible();
  await expect(
    inspector.getByRole("button", { name: "Disconnect" }),
  ).toHaveCount(1);
  await page.goto("/#/reports");
  await page
    .getByRole("checkbox", { name: "Model-derived bill of materials" })
    .check();
  await page.getByRole("button", { name: "Freeze report preview" }).click();
  const preview = page.locator("#engineering-report-preview");
  await expect(preview).toContainText("Battery series nameplate estimate");
  const row = preview
    .getByRole("row")
    .filter({ hasText: /BAT412060082 \[1\].*→.*BAT412060082 \[2\]/ });
  await expect(row.getByRole("cell").nth(1)).toHaveText("24");
  await expect(row.getByRole("cell").nth(2)).toHaveText("60");
  await expect(row.getByRole("cell").nth(3)).toHaveText("1.44");
  await expect(row.getByRole("cell").nth(4)).toHaveText("21.6");
});
