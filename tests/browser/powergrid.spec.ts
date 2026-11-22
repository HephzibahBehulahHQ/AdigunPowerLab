import { expect, test } from "./fixtures";
import { readFile } from "node:fs/promises";
import { DEFAULT_POWERGRID_INPUTS } from "../../src/engine/powergrid";
import { createLoad, createProject } from "../../src/domain/project";

test("nuclear steam separates gross generation from net electrical energy", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const plant = page.getByRole("region", { name: "Nuclear steam generation" });
  const heat = plant.getByLabel("Heat supplied to the steam cycle (MW)");
  await expect(plant.getByText("950 MW", { exact: true })).toBeVisible();
  const diagram = plant.getByRole("img");
  await diagram.locator("..").scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      diagram.evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
  await heat.fill("100");
  const pending = page.waitForEvent("download");
  await plant
    .getByRole("button", { name: "Export nuclear steam results" })
    .click();
  const { result } = JSON.parse(
    await readFile(await (await pending).path(), "utf8"),
  );
  expect(result).toEqual({
    grossMW: 34,
    netMW: -16,
    netMWh: -64,
    unconvertedHeatMW: 66,
  });
  await plant
    .getByRole("button", { name: "Reset nuclear steam inputs" })
    .click();
  await expect(heat).toHaveValue("3000");
});

test("coal steam inventory caps net output and exports the energy balance", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const plant = page.getByRole("region", { name: "Coal steam generation" });
  const inventory = plant.getByLabel("Coal inventory (t)");
  await expect(plant.getByText("640 t", { exact: true })).toBeVisible();
  await inventory.fill("320");
  const download = page.waitForEvent("download");
  const exportButton = plant.getByRole("button", {
    name: "Export coal results",
  });
  await exportButton.click();
  const { result } = JSON.parse(
    await readFile(await (await download).path(), "utf8"),
  );
  expect(result).toMatchObject({
    outputMW: 200,
    electricityMWh: 800,
    coalUsedTonnes: 320,
    coalRemainingTonnes: 0,
  });
  await inventory.fill("0.005");
  await plant
    .getByRole("button", { name: "Use coal inventory in dispatch" })
    .click();
  const dispatch = page.getByRole("region", {
    name: "Microgrid dispatch laboratory",
  });
  await expect(dispatch.getByTestId("microgrid-backupKW")).toHaveValue(
    "500000",
  );
  await dispatch.getByTestId("microgrid-batteryPowerKW").fill("0");
  const handoff = page.waitForEvent("download");
  await dispatch.getByRole("button", { name: "Export dispatch JSON" }).click();
  const chronological = JSON.parse(
    await readFile(await (await handoff).path(), "utf8"),
  );
  expect(chronological.inputs.backupGenerator.thermal.initialFuelMJ).toBe(125);
  expect(chronological.result.intervals[0]).toMatchObject({
    backupGenerationKW: 12.5,
    backupRemainingFuelMJ: 0,
  });
  expect(chronological.result.intervals[1].backupGenerationKW).toBe(0);
  await inventory.fill("");
  await expect(exportButton).toBeDisabled();
  await plant.getByRole("button", { name: "Reset coal inputs" }).click();
  await expect(inventory).toHaveValue("1000");
});

test("diesel fuel curve limits generation and accounts for the no-load intercept", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const generator = page.getByRole("region", {
    name: "Diesel generator fuel curve",
  });
  const inventory = generator.getByLabel("Initial diesel inventory (L)");
  const exportCase = async () => {
    const pending = page.waitForEvent("download");
    await generator
      .getByRole("button", { name: "Export diesel results" })
      .click();
    return JSON.parse(await readFile(await (await pending).path(), "utf8"))
      .result;
  };
  const base = await exportCase();
  expect(base.fuelRateLH).toBeCloseTo(17.4);
  expect(base.remainingL).toBeCloseTo(25.2);
  await inventory.fill("30");
  const limited = await exportCase();
  expect(limited.outputKW).toBeCloseTo(50);
  expect(limited.remainingL).toBeCloseTo(0);
  await inventory.fill("12");
  const stopped = await exportCase();
  expect(stopped.outputKW).toBe(0);
  expect(stopped.remainingL).toBe(12);
  await generator.getByRole("button", { name: "Reset diesel inputs" }).click();
  await expect(inventory).toHaveValue("60");
  await generator
    .getByRole("button", { name: "Use diesel curve in dispatch" })
    .click();
  const dispatch = page.getByRole("region", {
    name: "Microgrid dispatch laboratory",
  });
  await expect(dispatch.getByTestId("microgrid-backupKW")).toHaveValue("100");
  const handoff = page.waitForEvent("download");
  await dispatch.getByRole("button", { name: "Export dispatch JSON" }).click();
  const settings = JSON.parse(
    await readFile(await (await handoff).path(), "utf8"),
  ).inputs.backupGenerator.thermal;
  expect(settings.minimumStableKW).toBe(30);
  expect(settings.heatRateMJPerKWh).toBeCloseTo(8.5968);
  expect(settings.runningInterceptMJPerHour).toBeCloseTo(107.46);
  expect(settings.initialFuelMJ).toBeCloseTo(2149.2);
});

test("solid biomass derates wet fuel and recalculates net output", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const plant = page.getByRole("region", {
    name: "Solid biomass steam generation",
  });
  const moisture = plant.getByLabel("Wet-basis moisture (%)");
  await expect(
    plant.getByText("Net electrical output", { exact: true }).locator(".."),
  ).toContainText("2.85 MW");
  await moisture.fill("50");
  const pending = page.waitForEvent("download");
  await plant.getByRole("button", { name: "Export biomass results" }).click();
  const result = JSON.parse(
    await readFile(await (await pending).path(), "utf8"),
  ).result;
  expect(result.wetLhvMJKg).toBeCloseTo(7.78);
  expect(result.usedWetFeedKgH).toBe(3600);
  expect(result.steamHeatMW).toBeCloseTo(6.613);
  expect(result.netOutputMW).toBeCloseTo(1.8339);
  const stock = plant.getByLabel(
    "Initial wet biomass for dispatch (kg), optional",
  );
  await stock.fill("1000");
  await plant.getByRole("button", { name: "Use biomass in dispatch" }).click();
  const dispatch = page.getByRole("region", {
    name: "Microgrid dispatch laboratory",
  });
  const handoff = page.waitForEvent("download");
  await dispatch.getByRole("button", { name: "Export dispatch JSON" }).click();
  const { backupGenerator } = JSON.parse(
    await readFile(await (await handoff).path(), "utf8"),
  ).inputs;
  expect(backupGenerator.ratedKW).toBeCloseTo(1833.9);
  expect(backupGenerator.thermal.initialFuelMJ).toBeCloseTo(7780);
  expect(backupGenerator.thermal.runningInterceptMJPerHour).toBeCloseTo(
    (150 * 3.6) / 0.255,
  );
  await plant.getByRole("button", { name: "Reset biomass inputs" }).click();
  await expect(moisture).toHaveValue("30");
  await expect(stock).toHaveValue("");
});

test("biogas engine separates useful heat from rating-limited electric output", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const lab = page.getByRole("region", {
    name: "Biogas engine and heat recovery",
  });
  const methane = lab.getByLabel("Methane by volume (%)");
  const exportCase = async () => {
    const pending = page.waitForEvent("download");
    await lab.getByRole("button", { name: "Export biogas results" }).click();
    return JSON.parse(await readFile(await (await pending).path(), "utf8"))
      .result;
  };
  const base = await exportCase();
  expect(base.grossElectricKW).toBe(200);
  expect(base.netElectricKW).toBe(190);
  expect(base.recoverableHeatKW).toBeCloseTo(177.7778, 4);
  expect(base.usefulHeatKW).toBe(100);
  expect(base.usedBiogasNm3H).toBeLessThan(100);
  await methane.fill("0");
  const transfer = lab.getByRole("button", {
    name: "Use biogas engine in dispatch",
  });
  await expect(transfer).toBeDisabled();
  const standby = await exportCase();
  expect(standby.netElectricKW).toBe(-10);
  expect(standby.usefulHeatKW).toBe(0);
  await lab.getByRole("button", { name: "Reset biogas inputs" }).click();
  await expect(methane).toHaveValue("60");
  await transfer.click();
  const dispatch = page.getByRole("region", {
    name: "Microgrid dispatch laboratory",
  });
  await expect(dispatch.getByTestId("microgrid-backupKW")).toHaveValue("190");
  const handoff = page.waitForEvent("download");
  await dispatch.getByRole("button", { name: "Export dispatch JSON" }).click();
  const { thermal } = JSON.parse(
    await readFile(await (await handoff).path(), "utf8"),
  ).inputs.backupGenerator;
  expect(thermal.heatRateMJPerKWh).toBe(10);
  expect(thermal.runningInterceptMJPerHour).toBe(100);
  expect(thermal.initialFuelMJ).toBeUndefined();
});

test("fuel cell caps AC output and preserves unused hydrogen", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const cell = page.getByRole("region", {
    name: "Hydrogen fuel cell generation",
  });
  const inventory = cell.getByLabel("Initial hydrogen inventory (kg)");
  const exportCase = async () => {
    const pending = page.waitForEvent("download");
    await cell
      .getByRole("button", { name: "Export fuel cell results" })
      .click();
    return JSON.parse(await readFile(await (await pending).path(), "utf8"))
      .result;
  };
  const reference = await exportCase();
  expect(reference.grossAcKW).toBe(200);
  expect(reference.netAcKW).toBe(190);
  expect(reference.remainingKg).toBeCloseTo(
    30 - (200 * 2) / (0.96 * 0.5 * 33.3),
  );
  await inventory.fill("4");
  const limited = await exportCase();
  expect(limited.grossAcKW).toBeCloseTo(31.968);
  expect(limited.fuelUsedKg).toBeCloseTo(4);
  expect(limited.remainingKg).toBeCloseTo(0);
  await cell.getByRole("button", { name: "Use fuel cell in dispatch" }).click();
  const dispatch = page.getByRole("region", {
    name: "Microgrid dispatch laboratory",
  });
  await expect(dispatch.getByTestId("microgrid-backupKW")).toHaveValue("190");
  const handoff = page.waitForEvent("download");
  await dispatch.getByRole("button", { name: "Export dispatch JSON" }).click();
  const { thermal } = JSON.parse(
    await readFile(await (await handoff).path(), "utf8"),
  ).inputs.backupGenerator;
  expect(thermal.heatRateMJPerKWh).toBeCloseTo(7.5);
  expect(thermal.runningInterceptMJPerHour).toBeCloseTo(75);
  expect(thermal.initialFuelMJ).toBeCloseTo(479.52);
  await cell.getByRole("button", { name: "Reset fuel cell inputs" }).click();
  await expect(inventory).toHaveValue("30");
});

test("combined cycle joins gas and steam output and respects stable minimum load", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const plant = page.getByRole("region", {
    name: "Gas and steam combined cycle",
  });
  const request = plant.getByLabel("Requested gross generation (MW)");
  const exportCase = async () => {
    const pending = page.waitForEvent("download");
    await plant
      .getByRole("button", { name: "Export combined cycle results" })
      .click();
    return JSON.parse(await readFile(await (await pending).path(), "utf8"))
      .result;
  };
  const base = await exportCase();
  expect(base.grossPotentialMW).toBeCloseTo(170.4);
  expect(base.availableGrossMW).toBe(160);
  expect(base.gasOutputMW + base.steamOutputMW).toBeCloseTo(150);
  expect(base.fuelUsedMW).toBeCloseTo(150 / 0.568);
  expect(base.netOutputMW).toBe(147);
  await request.fill("10");
  const standby = await exportCase();
  expect(standby.fuelUsedMW).toBe(0);
  expect(standby.netOutputMW).toBe(-3);
  await plant
    .getByRole("button", { name: "Reset combined cycle inputs" })
    .click();
  await expect(request).toHaveValue("150");
  await plant
    .getByRole("button", { name: "Use combined cycle in dispatch" })
    .click();
  const dispatch = page.getByRole("region", {
    name: "Microgrid dispatch laboratory",
  });
  await expect(dispatch.getByTestId("microgrid-backupKW")).toHaveValue(
    "157000",
  );
  const handoff = page.waitForEvent("download");
  await dispatch.getByRole("button", { name: "Export dispatch JSON" }).click();
  const { thermal } = JSON.parse(
    await readFile(await (await handoff).path(), "utf8"),
  ).inputs.backupGenerator;
  expect(thermal.minimumStableKW).toBe(29000);
  expect(thermal.heatRateMJPerKWh).toBeCloseTo(3.6 / 0.568);
  expect(thermal.runningInterceptMJPerHour).toBeCloseTo((3000 * 3.6) / 0.568);
  expect(thermal.initialFuelMJ).toBeUndefined();
});

test("deep-water wave case caps output and shuts down at the configured height", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const wave = page.getByRole("region", { name: "Deep-water wave energy" });
  const height = wave.getByLabel("Significant wave height (m)");
  await expect(
    wave.getByText("Available electrical power", { exact: true }).locator(".."),
  ).toContainText("100 kW");
  await height.fill("5");
  const pending = page.waitForEvent("download");
  const report = wave.getByRole("button", {
    name: "Export wave energy results",
  });
  await report.click();
  const data = JSON.parse(await readFile(await (await pending).path(), "utf8"));
  expect(data.result.crestPowerKWPerM).toBeCloseTo(98.12, 1);
  expect(data.result.electricalPotentialKW).toBeGreaterThan(100);
  expect(data.result.shutdown).toBe(true);
  expect(data.result.availableKW).toBe(0);
  await height.fill("-1");
  await expect(report).toBeDisabled();
  await wave.getByRole("button", { name: "Reset wave energy inputs" }).click();
  await expect(height).toHaveValue("2");
});

test("binary geothermal case separates recovered heat, gross output and net import", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const plant = page.getByRole("region", {
    name: "Binary-cycle geothermal generation",
  });
  await expect(
    plant.getByText("Recovered heat", { exact: true }).locator(".."),
  ).toContainText("14,630 kW");
  await expect(
    plant.getByText("Net electrical output", { exact: true }).locator(".."),
  ).toContainText("1,350 kW");
  const efficiency = plant.getByLabel("Heat-to-gross-electric efficiency (%)");
  await efficiency.fill("50");
  const report = plant.getByRole("button", {
    name: "Export geothermal results",
  });
  await expect(report).toBeDisabled();
  await efficiency.fill("12");
  await plant.getByLabel("Brine mass flow (kg/s)").fill("0");
  const pending = page.waitForEvent("download");
  await report.click();
  const data = JSON.parse(await readFile(await (await pending).path(), "utf8"));
  expect(data.result.grossAvailableKW).toBe(0);
  expect(data.result.netKW).toBe(-150);
  await plant.getByRole("button", { name: "Reset geothermal inputs" }).click();
  await expect(plant.getByLabel("Brine mass flow (kg/s)")).toHaveValue("50");
});

test("tidal stream turbine scales with speed cubed and stops at cut-out", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const turbine = page.getByRole("region", { name: "Tidal stream turbine" });
  const speed = turbine.getByLabel("Current speed (m/s)");
  const flow = turbine
    .getByText("Flow power through rotor area", { exact: true })
    .locator("..");
  await expect(flow).toContainText("410 kW");
  await speed.fill("1");
  await expect(flow).toContainText("51.25 kW");
  await speed.fill("4");
  const pending = page.waitForEvent("download");
  await turbine
    .getByRole("button", { name: "Export tidal stream results" })
    .click();
  const data = JSON.parse(await readFile(await (await pending).path(), "utf8"));
  expect(data.result.electricalPotentialKW).toBeCloseTo(1180.8);
  expect(data.result.availableKW).toBe(0);
  expect(data.result.inOperatingRange).toBe(false);
  await turbine
    .getByRole("button", { name: "Reset tidal stream inputs" })
    .click();
  await expect(
    turbine
      .getByText("Available electrical power", { exact: true })
      .locator(".."),
  ).toContainText("120 kW");
});

test("solar thermal tower separates collected heat, potential and available output", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const tower = page.getByRole("region", { name: "Solar thermal power tower" });
  await expect(
    tower.getByText("Collected heat", { exact: true }).locator(".."),
  ).toContainText("48 MW");
  await expect(
    tower
      .getByText("Available electrical output", { exact: true })
      .locator(".."),
  ).toContainText("15 MW");
  await tower.getByLabel("Direct normal irradiance (W/m²)").fill("100");
  const pending = page.waitForEvent("download");
  await tower
    .getByRole("button", { name: "Export solar thermal results" })
    .click();
  const data = JSON.parse(await readFile(await (await pending).path(), "utf8"));
  expect(data.result.potentialMW).toBeCloseTo(2.1);
  expect(data.result.availableMW).toBe(0);
  await tower.getByLabel("Direct normal irradiance (W/m²)").fill("-1");
  await expect(
    tower.getByRole("button", { name: "Export solar thermal results" }),
  ).toBeDisabled();
  await tower
    .getByRole("button", { name: "Reset solar thermal inputs" })
    .click();
  await expect(tower.getByLabel("Direct normal irradiance (W/m²)")).toHaveValue(
    "800",
  );
});

test("transmission draft autosaves valid edits separately from the named save", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const power = page.getByLabel("Transmitted real power (MW)");
  const save = page.getByRole("button", { name: "Save experiment locally" });
  const restore = page.getByRole("button", {
    name: "Restore transmission draft",
  });
  const name = page.getByRole("textbox", { name: "Experiment name" });
  await name.fill("Saved classroom case");
  await save.click();
  await name.fill("Working draft");
  await power.fill("120");
  await power.fill("");
  await page.reload();
  await expect(name).toHaveValue("Saved classroom case");
  await expect(power).toHaveValue("100");
  await restore.click();
  await expect(name).toHaveValue("Working draft");
  await expect(power).toHaveValue("120");
  await page.reload();
  await page
    .getByRole("button", { name: "Discard transmission draft" })
    .click();
  await page.reload();
  await expect(restore).toHaveCount(0);
  await expect(name).toHaveValue("Saved classroom case");
});

test("PowerGrid round trip preserves a customer edit after local storage rejects it", async ({
  page,
}) => {
  await page.goto("/#/loads");
  const badge = page.locator(".save-badge");
  await expect(badge).toContainText("Saved locally");
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args: Parameters<typeof put>) {
      if (this.name === "projects")
        throw new DOMException("Test write failure", "QuotaExceededError");
      return put.apply(this, args);
    };
  });
  await page
    .getByRole("button", { name: "Add load", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Name", { exact: true })
    .fill("Unsaved customer load");
  await dialog.getByLabel(/^Rating/).fill("2.3");
  await dialog.getByRole("button", { name: "Add load", exact: true }).click();
  await expect(badge).toContainText("Save failed");
  await page
    .getByRole("banner")
    .getByRole("button", { name: "POWERGRID LAB", exact: true })
    .click();
  await expect(page).toHaveURL(/#POWERGRID$/);
  const power = page.getByLabel("Transmitted real power (MW)");
  await expect(power).toHaveValue("100");
  await power.fill("120");
  await page.goBack();
  await expect(page).toHaveURL(/#\/loads$/);
  await expect(badge).toContainText("Save failed");
  await expect(page.locator(".load-table")).toContainText(
    "Unsaved customer load",
  );
  const pending = page.waitForEvent("download");
  await page
    .locator(".app-alert")
    .getByRole("button", { name: "Export project", exact: true })
    .click();
  const exported = JSON.parse(
    await readFile(await (await pending).path(), "utf8"),
  );
  expect(exported.loads).toContainEqual(
    expect.objectContaining({ name: "Unsaved customer load", rating: 2.3 }),
  );
});

test("transmission BOT rejects a stale proposal and supports confirmation and undo", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const bot = page.getByRole("region", {
    name: "Adigun BOT · Transmission worksheet",
  });
  const preview = bot.getByRole("button", {
    name: "Preview 10% higher transmission voltage",
  });
  const confirm = bot.getByRole("button", { name: "Confirm voltage change" });
  const voltage = page.getByLabel("Raised transmission voltage (kV)", {
    exact: true,
  });
  const undo = page.getByRole("button", { name: "Undo transmission edit" });
  await preview.click();
  await expect(voltage).toHaveValue("330");
  await expect(
    bot.getByRole("group", {
      name: "Voltage, current and loss before → after",
    }),
  ).toContainText("363 kV");
  await voltage.fill("400");
  await undo.click();
  await expect(confirm).toHaveCount(0);
  await expect(bot.getByRole("status")).toContainText("Prepare a new preview");
  await preview.click();
  await confirm.click();
  await expect(voltage).toHaveValue("363");
  await undo.click();
  await expect(voltage).toHaveValue("330");
});

test("foundations lessons trace edited stages and restore the worked case", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const source = page.getByRole("region", {
    name: "Practical lesson: Source to socket",
  });
  const step = page.getByRole("region", {
    name: "Practical lesson: Why step up voltage?",
  });
  await expect(source).toContainText("11 kV → 330 kV → 33 kV → 0.4 kV");
  await expect(step).toContainText("0.459 MW");
  const transformer = source.getByRole("button", {
    name: "Step-up transformer",
  });
  await transformer.focus();
  await page.keyboard.press("Enter");
  await expect(transformer).toHaveAttribute("aria-pressed", "true");
  await expect(source).toContainText("30×");
  await expect(
    source.getByRole("img", { name: "Step-up transformer" }),
  ).toBeVisible();
  await source.getByRole("button", { name: "Play powerhouse footage" }).click();
  await expect(source.locator("iframe")).toHaveAttribute("src", /993768$/);
  const slider = step.getByRole("slider");
  await slider.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(slider).toHaveValue("329");
  await slider.fill("200");
  await expect(step).toContainText("1.25 MW");
  const lossMeter = step.getByRole("meter", {
    name: "Conductor loss · 200 kV",
  });
  expect(
    await lossMeter.evaluate((meter: HTMLMeterElement) => meter.value),
  ).toBeCloseTo(1.25);
  await step
    .getByRole("button", { name: "Watch a step-up transformer installation" })
    .click();
  await expect(step.locator("iframe")).toHaveAttribute("src", /902345$/);
  const generator = page.getByLabel("Generator voltage (kV)", { exact: true });
  await generator.fill("13.8");
  await expect(source).toContainText("23.913043×");
  await expect(source).toContainText("13.8 kV → 330 kV → 33 kV → 0.4 kV");
  await page
    .getByLabel("Student notes (optional)")
    .fill("Receiving transformers reduce voltage.");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export lab report PDF" }).click();
  expect(
    (await readFile(await (await pending).path())).subarray(0, 5).toString(),
  ).toBe("%PDF-");
  await step
    .getByRole("button", { name: "Restore worked transmission inputs" })
    .click();
  await expect(generator).toHaveValue("11");
  await expect(page.getByLabel("Student notes (optional)")).toHaveValue(
    "Receiving transformers reduce voltage.",
  );
});

test("community capstone exports the worked supply design and an outage comparison", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const section = page.getByRole("region", {
    name: "Microgrid dispatch laboratory",
  });
  const capstone = section.getByRole("region", {
    name: "Capstone: Community supply design",
  });
  const reset = capstone.getByRole("button", {
    name: "Load or reset community case",
  });
  await reset.click();
  await expect(section.getByTestId("microgrid-backupKW")).toHaveValue("30");
  await expect(section.getByTestId("microgrid-rampKW")).toHaveValue("30");
  await capstone
    .getByRole("button", { name: "Pin current dispatch as reference" })
    .click();
  await capstone
    .getByRole("button", { name: "Test a backup outage in interval 5" })
    .click();
  await expect(
    section.getByLabel("Backup outage intervals (optional)"),
  ).toHaveValue("5");
  const peak = capstone.getByRole("table", {
    name: "Evening peak · interval 5",
  });
  await expect(
    peak
      .getByRole("row", { name: /Backup generation/ })
      .getByRole("cell")
      .last(),
  ).toHaveText("0 kW");
  await section.getByTestId("microgrid-batteryPowerKW").fill("0");
  const notes = capstone.getByLabel("Design justification");
  await notes.fill(
    "Critical load needs storage support during the evening outage.",
  );
  const pending = page.waitForEvent("download");
  await section.getByRole("button", { name: "Export dispatch JSON" }).click();
  const data = JSON.parse(await readFile(await (await pending).path(), "utf8"));
  expect(data.capstone.reference.result.servedEnergyKWh).toBeCloseTo(448);
  expect(data.capstone.reference.result.criticalUnservedEnergyKWh).toBe(0);
  expect(data.result.criticalUnservedEnergyKWh).toBeGreaterThan(0);
  expect(data.capstone.justification).toContain("storage support");
  await reset.click();
  await expect(notes).toHaveValue("");
  await expect(capstone.getByRole("status")).toHaveCount(0);
});

test("regional lesson recalculates both sourced cases from the shared worksheet", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const lesson = page.getByRole("region", {
    name: "Practical lesson: Regional comparison",
  });
  const comparison = lesson.getByRole("table", {
    name: "Live regional comparison",
  });
  await expect(
    comparison.getByRole("row", { name: /Nigeria-inspired/ }),
  ).toContainText("330 kV");
  await expect(
    comparison.getByRole("row", { name: /Germany-inspired/ }),
  ).toContainText("380 kV");
  const resistance = page.getByLabel("Line resistance per phase (Ω/phase)", {
    exact: true,
  });
  const regionalLoss = lesson.getByRole("meter", {
    name: /Raised-stage loss · Nigeria-inspired/,
  });
  const originalLoss = await regionalLoss.evaluate(
    (meter: HTMLMeterElement) => meter.value,
  );
  await lesson.getByRole("button", { name: "10 Ω", exact: true }).click();
  await expect(resistance).toHaveValue("10");
  expect(
    await regionalLoss.evaluate((meter: HTMLMeterElement) => meter.value),
  ).toBeCloseTo(2 * originalLoss);
  const pending = page.waitForEvent("download");
  await lesson
    .getByRole("button", { name: "Download regional comparison (JSON)" })
    .click();
  const data = JSON.parse(await readFile(await (await pending).path(), "utf8"));
  expect(
    data.cases.map(
      (entry: { inputs: { raisedVoltageKV: number } }) =>
        entry.inputs.raisedVoltageKV,
    ),
  ).toEqual([330, 380]);
  for (const [index, entry] of data.cases.entries()) {
    expect(entry.result.raised.lineLossMW).toBeCloseTo(
      2 * data.reference[index].result.raised.lineLossMW,
    );
    expect(entry.preset.sourceReferences.length).toBeGreaterThan(0);
  }
  await lesson
    .getByRole("button", { name: "Reset shared regional lesson inputs" })
    .click();
  await expect(resistance).toHaveValue("5");
});

test("generator outage lesson exports trip, restart and restored critical supply", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const section = page.getByRole("region", {
    name: "Microgrid dispatch laboratory",
  });
  const load = section.getByRole("button", {
    name: "Load or reset generator outage",
  });
  const lesson = section.getByRole("region", {
    name: "Practical lesson: Generator outage",
  });
  const generatorOutput = lesson
    .getByText("Generator output", { exact: true })
    .locator("..");
  await expect(generatorOutput).toContainText("0 kW");
  await lesson.getByRole("button", { name: "Interval 3", exact: true }).click();
  await expect(generatorOutput).toContainText("7 kW");
  const outages = section.getByLabel("Backup outage intervals (optional)");
  const exportDispatch = async () => {
    const pending = page.waitForEvent("download");
    await section.getByRole("button", { name: "Export dispatch JSON" }).click();
    return JSON.parse(await readFile(await (await pending).path(), "utf8"))
      .result.intervals;
  };
  await load.click();
  const [before, trip, restart] = await exportDispatch();
  expect(before.backupHeadroomKW).toBeCloseTo(5);
  expect(trip.backupGenerationKW).toBe(0);
  expect(trip.criticalUnservedKW).toBeCloseTo(5);
  expect(trip.nonCriticalUnservedKW).toBeCloseTo(20);
  expect(restart.backupGenerationKW).toBeCloseTo(7);
  await outages.fill("");
  const [, uninterrupted] = await exportDispatch();
  expect(uninterrupted.backupGenerationKW).toBeCloseTo(15);
  expect(uninterrupted.criticalUnservedKW).toBe(0);
  await load.click();
  await expect(outages).toHaveValue("2");
});

test("midday solar and evening peak lessons export their worked dispatch", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const section = page.getByRole("region", {
    name: "Microgrid dispatch laboratory",
  });
  const exportDispatch = async () => {
    const pending = page.waitForEvent("download");
    await section.getByRole("button", { name: "Export dispatch JSON" }).click();
    return JSON.parse(await readFile(await (await pending).path(), "utf8"))
      .result.intervals;
  };
  await section
    .getByRole("button", { name: "Load or reset midday solar" })
    .click();
  let [midday] = await exportDispatch();
  expect(midday.batteryChargeKW).toBe(20);
  expect(midday.renewableCurtailmentKW).toBe(10);
  await section
    .getByLabel("Grid export limit (kW)", { exact: true })
    .fill("10");
  [midday] = await exportDispatch();
  expect(midday.gridExportKW).toBe(10);
  expect(midday.renewableCurtailmentKW).toBe(0);
  await section
    .getByRole("button", { name: "Load or reset evening peak" })
    .click();
  const [charged, evening] = await exportDispatch();
  expect(charged.gridExportKW).toBe(0);
  expect(charged.batterySocKWh).toBe(20);
  expect(evening.batteryDischargeKW).toBe(20);
  expect(evening.criticalUnservedKW).toBe(0);
  expect(evening.nonCriticalUnservedKW).toBe(25);
  const bot = section.getByRole("region", {
    name: "Adigun BOT · Dispatch explanation",
  });
  await bot.getByLabel("Dispatch interval").selectOption("2");
  expect(evening.batteryEnergyLimitKW).toBe(20);
  await expect(
    bot.getByText("Unmet noncritical demand").locator(".."),
  ).toContainText("25 kW");
  await section.getByTestId("microgrid-batteryPowerKW").fill("10");
  await expect(bot.getByText("Battery supplied").locator("..")).toContainText(
    "10 kW",
  );
  await expect(
    bot.getByText("Unmet noncritical demand").locator(".."),
  ).toContainText("35 kW");
});

test("transformer lesson calculates losses and flags overload in the report", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const lesson = page.getByRole("region", {
    name: "Practical lesson: Transformer loading",
  });
  const load = lesson.getByLabel("Apparent load (kVA)");
  await expect(lesson.getByText("4.5 kW").last()).toBeVisible();
  await lesson.getByRole("button", { name: "1,000 kVA", exact: true }).click();
  await expect(lesson.getByText("12 kW", { exact: true })).toBeVisible();
  await expect(lesson.getByText("Above nameplate rating")).toHaveCount(0);
  await lesson
    .getByRole("slider", { name: "Adjust transformer load" })
    .fill("1200");
  await expect(load).toHaveValue("1200");
  await expect(
    lesson.getByRole("meter", { name: "Rated loading" }),
  ).toHaveAttribute("value", "1.2");
  await expect(lesson.getByText("Above nameplate rating")).toBeVisible();
  const pending = page.waitForEvent("download");
  await lesson
    .getByRole("button", { name: "Download transformer report (JSON)" })
    .click();
  const data = JSON.parse(await readFile(await (await pending).path(), "utf8"));
  expect(data.result.lossKw).toBeCloseTo(16.4);
  expect(data.result.efficiency).toBeCloseTo(960 / 976.4);
  expect(data.result.overloaded).toBe(true);
  await lesson
    .getByText("Compare with an ideal transformer", { exact: true })
    .click();
  await expect(lesson.getByText("100%", { exact: true })).toBeVisible();
  expect(data.ideal.inputKw).toBeCloseTo(960);
  expect(data.ideal.lossKw).toBe(0);
  await lesson
    .getByRole("button", { name: "Reset transformer lesson" })
    .click();
  await expect(load).toHaveValue("500");
});

test("distance lesson scales impedance and exports the solved voltage comparison", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const lesson = page.getByRole("region", {
    name: "Practical lesson: Transmission distance",
  });
  const length = lesson.getByLabel("Line length (km)", { exact: true });
  const substation = lesson.getByRole("img", {
    name: "Transmission substation",
  });
  await substation.locator("..").scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      substation.evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBeGreaterThan(0);
  await lesson.getByRole("button", { name: "5 km", exact: true }).click();
  await expect(length).toHaveValue("5");
  await lesson.getByRole("slider", { name: "Adjust line length" }).fill("40");
  await expect(length).toHaveValue("40");
  const report = lesson.getByRole("button", {
    name: "Download distance lesson report (JSON)",
  });
  await length.fill("41");
  await expect(report).toBeDisabled();
  await lesson.getByRole("slider", { name: "Adjust line length" }).fill("39.5");
  await lesson.getByRole("slider", { name: "Adjust line length" }).fill("40");
  await lesson
    .getByLabel("Student interpretation")
    .fill("Voltage fell below 0.95 pu.");
  const pending = page.waitForEvent("download");
  await report.click();
  const data = JSON.parse(await readFile(await (await pending).path(), "utf8"));
  expect(data.current.input.branches[0].resistanceOhm).toBe(8);
  expect(data.current.input.branches[0].reactanceOhm).toBe(16);
  expect(data.current.result.status).toBe("converged");
  expect(data.reference.result.buses[1].voltageConstraint).toBe("ok");
  expect(data.current.result.buses[1].voltageConstraint).toBe("low");
  expect(data.current.result.realLossMW).toBeGreaterThan(
    data.reference.result.realLossMW,
  );
  expect(data.notes).toBe("Voltage fell below 0.95 pu.");
  await lesson.getByRole("button", { name: "Reset distance lesson" }).click();
  await expect(length).toHaveValue("25");
  await expect(lesson.getByLabel("Student interpretation")).toHaveValue("");
});

test("poor power factor lesson loads a worked case and resets edited inputs", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const lesson = page.getByRole("region", {
    name: "Practical lesson: Poor power factor",
  });
  await lesson.getByText("Worked reference", { exact: true }).click();
  await expect(lesson.getByRole("row", { name: /0.80/ })).toContainText(
    "4.484",
  );
  await expect(lesson.getByRole("row", { name: /1.00/ })).toContainText(
    "2.870",
  );
  const load = lesson.getByRole("button", {
    name: "Load or reset lesson inputs",
  });
  const factor = page.getByLabel("Power factor (PF)", { exact: true });
  await load.click();
  await expect(factor).toHaveValue("0.8");
  await page.getByRole("button", { name: "Set comparison baseline" }).click();
  const slider = lesson.getByRole("slider", { name: "Try a power factor" });
  await slider.fill("0.9");
  await lesson
    .getByRole("button", { name: "Use this setting in the worksheet" })
    .click();
  await expect(factor).toHaveValue("0.9");
  await lesson
    .getByRole("button", { name: "Watch a capacitor bank demonstration" })
    .click();
  await expect(lesson.locator("iframe")).toHaveAttribute("src", /-Cp9guj0B_M$/);
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export scenario JSON" }).click();
  const data = JSON.parse(await readFile(await (await pending).path(), "utf8"));
  expect(data.baselineComparison.changes.raisedLossMW).toBeLessThan(0);
  await load.click();
  await expect(factor).toHaveValue("0.8");
});

test("radial feeder imports only reviewed project demand and records provenance", async ({
  page,
}) => {
  await page.goto("/");
  const project = createProject("Downstream design fixture");
  project.coincidence = 1;
  project.growthPercent = 0;
  project.loads = [
    createLoad({ name: "Design heater", rating: 2, pf: 1, hoursPerDay: 24 }),
  ];
  await page.locator('input[type=file][accept=".json,.csv"]').setInputFiles({
    name: "downstream.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(project)),
  });
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Apply import", exact: true })
    .click();
  await expect(page.locator(".load-table")).toContainText("Design heater");
  const exportProject = async () => {
    const pending = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Export project", exact: true })
      .first()
      .click();
    return JSON.parse(await readFile(await (await pending).path(), "utf8"));
  };
  const original = await exportProject();
  await page.goto("/#POWERGRID");
  const feeder = page.getByRole("region", {
    name: "Radial feeder: voltage drop and outages",
  });
  const demand = feeder.getByLabel("South feeder group Active load (MW)", {
    exact: true,
  });
  await feeder
    .getByRole("button", { name: "Review active project demand" })
    .click();
  const preview = feeder.getByRole("region", {
    name: "Project demand snapshot",
  });
  await expect(preview).toContainText("Downstream design fixture");
  await expect(demand).toHaveValue("0.12");
  await preview.getByRole("button", { name: "Apply project demand" }).click();
  await expect(demand).toHaveValue("0.002");
  const promise = page.waitForEvent("download");
  await feeder
    .getByRole("button", { name: "Export solved scenario JSON" })
    .click();
  const download = await promise;
  const exported = JSON.parse(await readFile(await download.path(), "utf8"));
  const downstream = exported.input.buses.find(
    (bus: { id: string }) => bus.id === "south_feeder",
  );
  expect(downstream.demandSource).toMatchObject({
    projectId: original.id,
    revision: original.revision,
    basis: "balanced-project-design-pq",
  });
  expect(downstream.demandSource.revision).toEqual(expect.any(Number));
  const microgrid = page
    .locator(".pg-pv")
    .filter({ has: page.locator("#pg-microgrid-title") });
  await microgrid
    .getByRole("button", { name: "Review active project demand day" })
    .click();
  const recurring = microgrid.getByRole("region", {
    name: "Recurring project demand preview",
  });
  await expect(recurring).toContainText("48 kWh / 24 h");
  await recurring
    .getByRole("button", { name: "Apply recurring demand" })
    .click();
  const dispatchDownload = page.waitForEvent("download");
  await microgrid.getByRole("button", { name: "Export dispatch JSON" }).click();
  const dispatch = JSON.parse(
    await readFile(await (await dispatchDownload).path(), "utf8"),
  );
  expect(dispatch.result.intervals).toHaveLength(24);
  expect(dispatch.result.totalDemandKWh).toBeCloseTo(48);
  expect(dispatch.projectDemandSource.source).toMatchObject({
    projectId: original.id,
    revision: original.revision,
    basis: "project-recurring-hourly-active-demand",
  });
  expect(dispatch.projectDemandSource.hourlyKW).toEqual(Array(24).fill(2));
  await page.goto("/#/overview");
  const after = await exportProject();
  expect(after).toMatchObject({
    id: original.id,
    revision: original.revision,
    loads: original.loads,
  });
});

test("transmission comparison keeps a pinned baseline while editing a working copy", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const name = page.getByRole("textbox", { name: "Experiment name" });
  await name.fill("Original experiment");
  await page.getByRole("button", { name: "Save experiment locally" }).click();
  await page.getByRole("button", { name: "Set comparison baseline" }).click();
  await page
    .getByRole("button", { name: "Duplicate transmission experiment" })
    .click();
  await expect(name).toHaveValue("Original experiment (Copy)");
  await page.getByLabel("Transmitted real power (MW)").fill("120");
  const comparison = page.getByRole("table", {
    name: "Baseline versus current worksheet",
  });
  await expect(
    comparison.getByRole("cell", { name: "20 MW", exact: true }),
  ).toBeVisible();
  const promise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export scenario JSON" }).click();
  const download = await promise;
  const payload = JSON.parse(await readFile(await download.path(), "utf8"));
  expect(payload.baselineComparison.scenario.name).toBe("Original experiment");
  expect(payload.baselineComparison.changes.powerMW).toBe(20);
  expect(payload.baselineComparison.changes.raisedLossMW).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Clear comparison baseline" }).click();
  await expect(comparison).toHaveCount(0);
  await page.reload();
  await expect(name).toHaveValue("Original experiment");
});

test("workspace backup restores a separate transmission experiment copy", async ({
  page,
}) => {
  await page.goto("/#/settings");
  await expect(page.locator(".save-badge")).toContainText("Saved locally");
  await page.goto("/#POWERGRID");
  await page
    .getByRole("textbox", { name: "Experiment name" })
    .fill("Earlier transmission");
  await page.getByRole("button", { name: "Save experiment locally" }).click();
  await page
    .getByRole("textbox", { name: "Experiment name" })
    .fill("Archived transmission");
  await page.getByRole("button", { name: "Save experiment locally" }).click();
  await page.goto("/#/settings");
  const backup = page.getByRole("region", {
    name: "Workspace backup & restore",
  });
  const promise = page.waitForEvent("download");
  await backup.getByRole("button", { name: "Export workspace backup" }).click();
  const download = await promise;
  const bytes = await readFile(await download.path());
  const archive = JSON.parse(bytes.toString());
  expect(archive.projects.length).toBeGreaterThan(0);
  expect(archive.powergridTransmission[0].name).toBe("Archived transmission");
  expect(archive.powergridTransmission[1].name).toBe("Earlier transmission");
  await page.goto("/#POWERGRID");
  await page
    .getByRole("textbox", { name: "Experiment name" })
    .fill("Current transmission");
  await page.getByRole("button", { name: "Save experiment locally" }).click();
  await page.goto("/#/settings");
  await backup.locator('input[type="file"]').setInputFiles({
    name: "workspace.json",
    mimeType: "application/json",
    buffer: bytes,
  });
  await expect(backup.getByText("Archived transmission")).toBeVisible();
  await backup.getByRole("button", { name: "Restore reviewed backup" }).click();
  await expect(page).toHaveURL(/#\/overview$/);
  await page.goto("/#POWERGRID");
  const labName = page.getByRole("textbox", { name: "Experiment name" });
  await expect(labName).toHaveValue("Current transmission");
  await page.getByText("Saved transmission revisions", { exact: true }).click();
  await page
    .getByRole("button", { name: "Earlier transmission · 100 MW" })
    .click();
  await expect(
    page.getByRole("region", { name: "Import preview" }),
  ).toContainText("Earlier transmission");
  await expect(labName).toHaveValue("Current transmission");
  await page.getByRole("button", { name: "Cancel import" }).click();
  await page
    .getByRole("button", { name: "Show recovered experiments" })
    .click();
  await page
    .getByRole("button", { name: "Archived transmission", exact: true })
    .click();
  await expect(labName).toHaveValue("Current transmission");
  await page.getByRole("button", { name: "Apply imported scenario" }).click();
  await expect(labName).toHaveValue("Archived transmission");
  await page.reload();
  await expect(labName).toHaveValue("Current transmission");
});

test("transmission import previews, applies and saves separately", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const name = page.getByRole("textbox", { name: "Experiment name" });
  const power = page.getByLabel("Transmitted real power (MW)");
  const picker = page.getByLabel("Import scenario JSON");
  const upload = (value: unknown) =>
    picker.setInputFiles({
      name: "transmission.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(value)),
    });
  const save = page.getByRole("button", { name: "Save experiment locally" });
  await save.click();
  await upload({
    schemaVersion: 1,
    model: "balanced-three-phase-constant-power-line-loss",
    inputs: { ...DEFAULT_POWERGRID_INPUTS, powerMW: 120 },
  });
  await expect(
    page.getByRole("region", { name: "Import preview" }),
  ).toContainText("120 MW");
  await expect(power).toHaveValue("100");
  await page.getByRole("button", { name: "Apply imported scenario" }).click();
  await expect(power).toHaveValue("120");
  const undo = page.getByRole("button", { name: "Undo transmission edit" });
  const redo = page.getByRole("button", { name: "Redo transmission edit" });
  await undo.click();
  await expect(power).toHaveValue("100");
  await redo.click();
  await expect(power).toHaveValue("120");
  await undo.click();
  await power.fill("110");
  await expect(redo).toBeDisabled();
  await undo.click();
  await expect(power).toHaveValue("100");
  await page.reload();
  await expect(power).toHaveValue("100");
  await upload({
    schemaVersion: 2,
    model: "balanced-three-phase-constant-power-line-loss",
    inputs: { ...DEFAULT_POWERGRID_INPUTS, powerMW: 125 },
    name: "Transmission review",
    notes: "Compare line loss.",
  });
  await expect(
    page.getByRole("region", { name: "Import preview" }),
  ).toContainText("Transmission review");
  await page.getByRole("button", { name: "Apply imported scenario" }).click();
  await save.click();
  await page.reload();
  await expect(name).toHaveValue("Transmission review");
  await expect(power).toHaveValue("125");
  await expect(undo).toBeDisabled();
  await expect(
    page.getByRole("textbox", { name: "Student notes (optional)" }),
  ).toHaveValue("Compare line loss.");
  const exportPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export scenario JSON" }).click();
  const download = await exportPromise;
  const exported = JSON.parse(await readFile(await download.path(), "utf8"));
  expect(exported).toMatchObject({
    schemaVersion: 2,
    inputs: { powerMW: 125 },
    name: "Transmission review",
    notes: "Compare line loss.",
  });
  await upload({
    schemaVersion: 99,
    model: "balanced-three-phase-constant-power-line-loss",
  });
  await expect(page.getByRole("alert")).toContainText(
    "Invalid transmission scenario file.",
  );
  await expect(power).toHaveValue("125");
});

test("transmission lab exports a paginated PDF with a pinned baseline and student notes", async ({
  page,
}, testInfo) => {
  await page.goto("/#POWERGRID");
  await page
    .getByRole("textbox", { name: "Experiment name" })
    .fill("Transmission review");
  await page.getByRole("button", { name: "Set comparison baseline" }).click();
  await page.getByLabel("Transmitted real power (MW)").fill("120");
  await page
    .getByRole("textbox", { name: "Student notes (optional)" })
    .fill(
      Array.from({ length: 26 }, (_, index) => `${index}: Yorùbá`).join("\n"),
    );
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export lab report PDF" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(
    "powergrid-transmission-report.pdf",
  );
  const path = testInfo.outputPath("powergrid-transmission-report.pdf");
  await download.saveAs(path);
  const bytes = await readFile(path);
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  expect(
    bytes.toString("latin1").match(/\/Type \/Page\b/g)?.length ?? 0,
  ).toBeGreaterThan(1);
});

test("primary frequency response recalculates and exports the dynamic trace", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const section = page.getByRole("region", {
    name: "Primary frequency response",
  });
  await expect(section).toContainText("-0.1 Hz/s");
  const inertia = section.getByRole("spinbutton", {
    name: "Aggregate inertia H (s)",
  });
  await inertia.fill("10");
  await expect(section).toContainText("-0.05 Hz/s");
  await expect(
    section.getByRole("img", { name: "Primary frequency response" }),
  ).toBeVisible();
  const promise = page.waitForEvent("download");
  await section.getByRole("button", { name: "Export frequency trace" }).click();
  const download = await promise;
  const payload = JSON.parse(await readFile(await download.path(), "utf8"));
  expect(payload.result.initialRoCoFHzPerSecond).toBe(-0.05);
  expect(payload.result.nadir.frequencyHz).toBeLessThan(50);
  expect(payload.result.samples.at(-1).seconds).toBe(30);
  await inertia.fill("0");
  await expect(
    section.getByRole("button", { name: "Export frequency trace" }),
  ).toBeDisabled();
});

test("meshed AC case solves the triangle and blocks export of an island", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const section = page.getByRole("region", { name: "Meshed AC power flow" });
  await expect(section.getByRole("status")).toContainText("Converged");
  const branches = section.getByRole("table", { name: "Branch results" });
  await expect(branches.getByRole("row")).toHaveCount(4);
  await section
    .getByRole("button", { name: "Compare single branch outages" })
    .click();
  const comparison = section.getByRole("table", {
    name: "Single branch outage comparison",
  });
  await expect(comparison.getByRole("row")).toHaveCount(5);
  await section.getByRole("checkbox", { name: "A–B" }).uncheck();
  await expect(branches.getByRole("row")).toHaveCount(3);
  await expect(comparison.getByRole("cell", { name: "Islanded" })).toHaveCount(
    2,
  );
  const promise = page.waitForEvent("download");
  await section.getByRole("button", { name: "Export AC results" }).click();
  const download = await promise;
  const payload = JSON.parse(await readFile(await download.path(), "utf8"));
  expect(
    payload.result.branches.map((branch: { id: string }) => branch.id),
  ).toEqual(["A–C", "B–C"]);
  expect(payload.comparison.outages).toEqual([
    { openedBranch: "A–C", status: "islanded" },
    { openedBranch: "B–C", status: "islanded" },
  ]);
  await section.getByRole("checkbox", { name: "A–C" }).uncheck();
  await expect(section.getByRole("status")).toContainText(
    "island has no slack bus",
  );
  await expect(
    section.getByRole("button", { name: "Export AC results" }),
  ).toBeDisabled();
});

test("POWERGRID camera redraws without allocating scene buffers", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const prototype = WebGLRenderingContext.prototype;
    const createBuffer = prototype.createBuffer;
    prototype.createBuffer = function () {
      if (this.canvas instanceof HTMLCanvasElement) {
        this.canvas.dataset.buffers = String(
          Number(this.canvas.dataset.buffers ?? 0) + 1,
        );
      }
      return createBuffer.call(this);
    };
    const drawArrays = prototype.drawArrays;
    prototype.drawArrays = function (mode, first, count) {
      if (this.canvas instanceof HTMLCanvasElement) {
        this.canvas.dataset.draws = String(
          Number(this.canvas.dataset.draws ?? 0) + 1,
        );
      }
      return drawArrays.call(this, mode, first, count);
    };
  });
  await page.goto("/#POWERGRID");
  const scene = page.getByRole("region", {
    name: "Navigable power station and grid model",
  });
  const canvas = scene.locator("canvas");
  await expect(canvas).toHaveCount(1);
  await expect(scene.locator("canvas[data-draws]")).toHaveCount(0);
  await canvas.scrollIntoViewIfNeeded();
  await expect(
    canvas
      .locator("xpath=..")
      .getByRole("status")
      .or(scene.locator("canvas[data-draws]")),
  ).toHaveCount(1);
  test.skip(
    await scene.getByRole("status").isVisible(),
    "WebGL is unavailable in this browser",
  );
  const buffers = await canvas.getAttribute("data-buffers");
  const draws = Number(await canvas.getAttribute("data-draws"));
  await scene.getByLabel("3D azimuth").fill("0.61");
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-draws")))
    .toBeGreaterThan(draws);
  await expect(canvas).toHaveAttribute("data-buffers", buffers!);
  const idleDraws = await canvas.evaluate(async (element) => {
    const before = element.dataset.draws;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    return { before, after: element.dataset.draws };
  });
  expect(idleDraws.after).toBe(idleDraws.before);
  const contextCanBeLost = await canvas.evaluate(
    (element: HTMLCanvasElement) => {
      const loseContext = element
        .getContext("webgl")
        ?.getExtension("WEBGL_lose_context");
      if (!loseContext) return false;
      element.addEventListener(
        "restore-test-context",
        () => loseContext.restoreContext(),
        { once: true },
      );
      loseContext.loseContext();
      return true;
    },
  );
  if (contextCanBeLost) {
    await expect(scene.getByRole("status")).toContainText(
      "3D view unavailable",
    );
    await canvas.dispatchEvent("restore-test-context");
    await expect(canvas).toBeVisible();
    await expect(scene.getByLabel("3D azimuth")).toHaveValue("0.61");
    await expect
      .poll(async () => Number(await canvas.getAttribute("data-buffers")))
      .toBeGreaterThan(Number(buffers));
  }
});

test("POWERGRID retains equipment inspection when WebGL is unavailable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = new Proxy(
      HTMLCanvasElement.prototype.getContext,
      {
        apply(original, canvas, args) {
          return String(args[0]).startsWith("webgl")
            ? null
            : Reflect.apply(original, canvas, args);
        },
      },
    );
  });
  await page.goto("/#POWERGRID");
  const scene = page.getByRole("region", {
    name: "Navigable power station and grid model",
  });
  await scene.getByRole("heading").first().scrollIntoViewIfNeeded();
  await expect(scene.getByRole("status")).toContainText("3D view unavailable");
  await expect(scene.locator("canvas")).toBeHidden();
  const sceneFits = await scene.evaluate(
    (section) =>
      section.scrollWidth <= section.clientWidth &&
      section.getBoundingClientRect().right <= window.innerWidth,
  );
  expect(sceneFits).toBe(true);
  await scene
    .getByRole("button", { name: "Transmission tower & conductors" })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    page
      .locator('section[aria-labelledby="pg-station-title"]')
      .getByRole("button", { name: /Inspect: Lattice transmission tower/ })
      .first(),
  ).toHaveAttribute("aria-pressed", "true");
});

test("microgrid dispatch persists scaled historical generation and keeps source data in JSON", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const section = page
    .locator(".pg-pv")
    .filter({ has: page.locator("#pg-microgrid-title") });
  await section
    .getByRole("button", { name: "Load scaled German historical day" })
    .click();
  await expect(
    section.getByRole("textbox", { name: "Wind speed (m/s)" }),
  ).toHaveCount(0);
  await section.getByRole("button", { name: "Save scenario locally" }).click();
  await page.reload();
  await expect(
    section.getByRole("textbox", { name: "Wind speed (m/s)" }),
  ).toHaveCount(0);
  const promise = page.waitForEvent("download");
  await section.getByRole("button", { name: "Export dispatch JSON" }).click();
  const download = await promise;
  const payload = JSON.parse(await readFile(await download.path(), "utf8"));
  expect(payload.result.intervals).toHaveLength(24);
  expect(payload.result.intervalHours).toBe(1);
  const first = payload.result.intervals[0];
  expect(first.demandKW).toBeCloseTo(45.1378, 6);
  expect(first.pvAvailableKW).toBeCloseTo(0.05475, 6);
  expect(first.windAvailableKW).toBeCloseTo(4.78125, 6);
  expect(first.balanceResidualKW).toBeCloseTo(0, 8);
  expect(payload.historicalSource).toMatchObject({
    date: "2025-06-18",
    license: "CC BY 4.0",
    teachingKWPerReportedHourlyMWh: 0.001,
  });
  await section
    .getByRole("button", { name: "Load scaled German winter day" })
    .click();
  await section.getByRole("button", { name: "Save scenario locally" }).click();
  await page.reload();
  await expect(
    section.getByText("Selected historical day 2025-01-22.", { exact: false }),
  ).toBeVisible();
  const winterPromise = page.waitForEvent("download");
  await section.getByRole("button", { name: "Export dispatch JSON" }).click();
  const winter = JSON.parse(
    await readFile(await (await winterPromise).path(), "utf8"),
  );
  expect(winter.result.intervals[0].demandKW).toBeCloseTo(52.8245, 6);
  expect(winter.result.intervals[0].windAvailableKW).toBeCloseTo(6.451, 6);
  expect(winter.historicalSource.intervals[0].start).toBe(
    "2025-01-22T00:00:00+01:00",
  );
});

test("historical SMARD day shows all hours and exports attributed measurements", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  await page
    .getByText("Germany: historical load and generation", { exact: true })
    .click();
  const table = page.getByRole("table", {
    name: "Germany: historical load and generation · MWh",
  });
  await expect(table.getByRole("row")).toHaveCount(25);
  const promise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export historical JSON" }).click();
  const download = await promise;
  const payload = JSON.parse(await readFile(await download.path(), "utf8"));
  expect(payload.attribution).toBe("Bundesnetzagentur | SMARD.de");
  expect(payload.license).toBe("CC BY 4.0");
  expect(payload.intervals).toHaveLength(24);
  expect(payload.intervals[0]).toMatchObject({
    start: "2025-06-18T00:00:00+02:00",
    gridLoadMWh: 45137.8,
    residualMWh: 40301.8,
  });
  await page
    .getByRole("combobox", { name: "Historical date" })
    .selectOption("2025-01-22");
  await expect(table.getByRole("row")).toHaveCount(25);
  await expect(table.getByText("00:00", { exact: true })).toHaveAttribute(
    "datetime",
    "2025-01-22T00:00:00+01:00",
  );
});

test("microgrid dispatch loads and exports the rural teaching day", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const section = page
    .locator(".pg-pv")
    .filter({ has: page.locator("#pg-microgrid-title") });
  await section
    .getByRole("button", { name: "Load rural microgrid teaching scenario" })
    .click();
  await expect(section.getByTestId("microgrid-intervalHours")).toHaveValue("4");
  const promise = page.waitForEvent("download");
  await section.getByRole("button", { name: "Export dispatch JSON" }).click();
  const download = await promise;
  const payload = JSON.parse(await readFile(await download.path(), "utf8"));
  expect(payload.result.intervals).toHaveLength(6);
  expect(payload.result.totalDemandKWh).toBe(448);
  const operating = section.getByRole("region", {
    name: "Practical lesson: Microgrid operation",
  });
  await operating.getByRole("button", { name: "16–20 h", exact: true }).click();
  const batteryMeter = operating.getByRole("meter", {
    name: "Battery state of charge",
  });
  expect(
    await batteryMeter.evaluate((meter: HTMLMeterElement) => meter.value),
  ).toBeCloseTo(payload.result.intervals[4].batterySocPercent);
  await operating.getByText("Worked result", { exact: true }).click();
  await expect(
    operating.getByText("Battery throughput (kWh)", { exact: true }),
  ).toBeVisible();
  await section.getByTestId("microgrid-batteryPowerKW").fill("0");
  const lessonReport = page.waitForEvent("download");
  await operating
    .getByRole("button", { name: "Download microgrid operation report (JSON)" })
    .click();
  const lesson = JSON.parse(
    await readFile(await (await lessonReport).path(), "utf8"),
  );
  expect(lesson.operatingReference.result).toEqual(payload.result);
  expect(lesson.result.batteryThroughputKWh).toBe(0);
  await operating
    .getByRole("button", { name: "Load or reset operating case" })
    .click();
  await expect(section.getByTestId("microgrid-batteryPowerKW")).toHaveValue(
    String(payload.inputs.battery.maxDischargeKW),
  );
});

test("microgrid dispatch exports thermal backup fuel and direct CO₂", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const section = page
    .locator(".pg-pv")
    .filter({ has: page.locator("#pg-microgrid-title") });
  await section.getByTestId("microgrid-batteryPowerKW").fill("0");
  await section
    .getByRole("checkbox", { name: "Model thermal backup fuel use" })
    .check();
  const factor = section.getByRole("spinbutton", {
    name: "Direct CO₂ factor (kg/GJ), optional",
  });
  await factor.fill("60");
  await section.getByTestId("microgrid-backupStartupFuel").fill("30");
  const inventory = section.getByRole("spinbutton", {
    name: "Initial fuel inventory (MJ), optional",
  });
  await inventory.fill("150");
  const minimum = section.getByTestId("microgrid-backupMinimumStableKW");
  await minimum.fill("12");
  await section.getByRole("button", { name: "Save scenario locally" }).click();
  await page.reload();
  await expect(factor).toHaveValue("60");
  await expect(inventory).toHaveValue("150");
  await expect(minimum).toHaveValue("12");
  const exportPromise = page.waitForEvent("download");
  await section.getByRole("button", { name: "Export dispatch JSON" }).click();
  const download = await exportPromise;
  const payload = JSON.parse(await readFile(await download.path(), "utf8"));
  expect(payload.result.intervals[0]).toMatchObject({
    backupGenerationKW: 12,
    backupFuelEnergyMJ: 150,
    backupStartupFuelMJ: 30,
    backupRemainingFuelMJ: 0,
    backupDirectCO2Kg: 9,
  });
  await minimum.fill("13");
  const stoppedExport = page.waitForEvent("download");
  await section.getByRole("button", { name: "Export dispatch JSON" }).click();
  const stopped = JSON.parse(
    await readFile(await (await stoppedExport).path(), "utf8"),
  );
  expect(stopped.result.intervals[0]).toMatchObject({
    backupGenerationKW: 0,
    backupStartupFuelMJ: 0,
    backupRemainingFuelMJ: 150,
  });
  await minimum.fill("0");
  await section.getByTestId("microgrid-backupRunningIntercept").fill("10");
  const interceptExport = page.waitForEvent("download");
  await section.getByRole("button", { name: "Export dispatch JSON" }).click();
  const withIntercept = JSON.parse(
    await readFile(await (await interceptExport).path(), "utf8"),
  );
  expect(withIntercept.result.intervals[0]).toMatchObject({
    backupGenerationKW: 11,
    backupFuelEnergyMJ: 150,
    backupRemainingFuelMJ: 0,
  });
});

test("microgrid dispatch saves grid outages and exports islanding state", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const section = page
    .locator(".pg-pv")
    .filter({ has: page.locator("#pg-microgrid-title") });
  await section.getByTestId("microgrid-batteryPowerKW").fill("0");
  await section.getByTestId("microgrid-gridImportLimit").fill("10");
  const outages = section.getByRole("textbox", {
    name: "Grid outage intervals (optional)",
  });
  await outages.fill("7");
  await expect(section.getByRole("alert")).toContainText(
    "outage interval numbers",
  );
  await outages.fill("2");
  const backupOutages = section.getByRole("textbox", {
    name: "Backup outage intervals (optional)",
  });
  await backupOutages.fill("0");
  await expect(section.getByRole("alert")).toContainText(
    "backup outage interval numbers",
  );
  await backupOutages.fill("2");
  await section.getByRole("button", { name: "Save scenario locally" }).click();
  await page.reload();
  await expect(outages).toHaveValue("2");
  await expect(backupOutages).toHaveValue("2");
  await expect(
    section.getByRole("cell", { name: "Out of service", exact: true }),
  ).toHaveCount(1);
  await expect(section.getByRole("cell", { name: "Islanded" })).toHaveCount(1);
  const exportPromise = page.waitForEvent("download");
  await section.getByRole("button", { name: "Export dispatch JSON" }).click();
  const download = await exportPromise;
  const payload = JSON.parse(await readFile(await download.path(), "utf8"));
  expect(payload.result.intervals[0]).toMatchObject({
    gridConnected: true,
    gridImportKW: 10,
  });
  expect(payload.result.intervals[1]).toMatchObject({
    gridConnected: false,
    gridImportKW: 0,
    gridExportKW: 0,
    backupInService: false,
    backupGenerationKW: 0,
    backupHeadroomKW: 0,
  });
});

test("microgrid dispatch exports pumped storage delivery and losses", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const section = page
    .locator(".pg-pv")
    .filter({ has: page.locator("#pg-microgrid-title") });
  await section.getByTestId("microgrid-batteryPowerKW").fill("0");
  await section.getByTestId("microgrid-pumpedCapacity").fill("20");
  await section.getByTestId("microgrid-pumpedInitial").fill("10");
  await section.getByTestId("microgrid-pumpedGenerationEfficiency").fill("80");
  await expect(
    section.getByRole("columnheader", { name: "Pumped storage losses (kWh)" }),
  ).toBeVisible();
  const csvPromise = page.waitForEvent("download");
  await section.getByRole("button", { name: "Export intervals CSV" }).click();
  const download = await csvPromise;
  const [header, first] = (await readFile(await download.path(), "utf8")).split(
    /\r?\n/,
  );
  expect(header.split(",").slice(-4)).toEqual([
    "pump_input_kW",
    "pumped_generation_kW",
    "hydraulic_storage_kWh",
    "pumped_storage_losses_kWh",
  ]);
  expect(first.split(",").slice(-4).map(Number)).toEqual([0, 8, 0, 2]);
});

test("microgrid dispatch saves and exports optional hydro generation", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const section = page
    .locator(".pg-pv")
    .filter({ has: page.locator("#pg-microgrid-title") });
  const flow = section.getByRole("textbox", {
    name: "Hydro flow by interval (m³/s), optional",
  });
  await flow.fill("1");
  await expect(section.getByRole("alert")).toContainText(
    "Hydro flow must have one value per demand interval.",
  );
  await flow.fill("1, 0, 0, 0, 0, 0");
  await section.getByRole("button", { name: "Save scenario locally" }).click();
  await page.reload();
  await expect(flow).toHaveValue("1, 0, 0, 0, 0, 0");
  const exportPromise = page.waitForEvent("download");
  await section.getByRole("button", { name: "Export dispatch JSON" }).click();
  const download = await exportPromise;
  const payload = JSON.parse(await readFile(await download.path(), "utf8"));
  expect(payload.result.intervals[0].hydroAvailableKW).toBe(50);
  expect(payload.result.intervals[1].hydroAvailableKW).toBe(0);
  await section
    .getByRole("textbox", {
      name: "Reservoir inflow by interval (m³/s), optional",
    })
    .fill("0, 0, 0, 0, 0, 0");
  await section
    .getByRole("spinbutton", { name: "Initial reservoir water (m³)" })
    .fill("0");
  await section
    .getByRole("spinbutton", { name: "Head rise at full reservoir (m)" })
    .fill("10");
  await expect(
    section.getByRole("columnheader", { name: "Reservoir water (m³)" }),
  ).toBeVisible();
  const reservoirExport = page.waitForEvent("download");
  await section.getByRole("button", { name: "Export dispatch JSON" }).click();
  const reservoirPayload = JSON.parse(
    await readFile(await (await reservoirExport).path(), "utf8"),
  );
  expect(reservoirPayload.result.intervals[0].hydroAvailableKW).toBe(0);
  expect(reservoirPayload.result.intervals[0].hydroWater.storageM3).toBe(0);
  expect(reservoirPayload.result.intervals[0].hydroWater.netHeadM).toBe(30);
});

test("hydropower recalculates, saves inputs and exports the rating-limited output", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const hydro = page.getByRole("region", { name: "Hydropower head and flow" });
  const rating = hydro.getByLabel("Installed electrical rating (kW)");
  await rating.fill("500");
  await expect(hydro).toContainText("500 kW");
  await hydro.getByRole("button", { name: "Save locally" }).click();
  await expect(hydro.getByRole("status")).toHaveText("Saved");
  await page.reload();
  await expect(rating).toHaveValue("500");
  const exportPromise = page.waitForEvent("download");
  await hydro.getByRole("link", { name: "Export JSON" }).click();
  const download = await exportPromise;
  expect(download.suggestedFilename()).toBe("powergrid-hydro.json");
  const payload = JSON.parse(await readFile(await download.path(), "utf8"));
  expect(payload.result.availableKW).toBe(500);
  await rating.fill("");
  await expect(
    hydro.getByRole("button", { name: "Save locally" }),
  ).toBeDisabled();
  await expect(hydro.getByRole("link", { name: "Export JSON" })).toHaveCount(0);
});

test("POWERGRID documentary facility gallery renders every local photo", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const gallery = page.locator(".pg-field-photo-grid");
  await expect(gallery).toBeVisible();
  const photos = gallery.locator("img");
  await expect(photos).toHaveCount(8);

  for (const photo of await photos.all()) {
    await photo.scrollIntoViewIfNeeded();
    await expect(photo).toHaveAttribute("alt", /.+/);
    await expect
      .poll(() =>
        photo.evaluate((image: HTMLImageElement) => image.naturalWidth),
      )
      .toBeGreaterThan(0);
  }
});

test("POWERGRID field videos are titled, source-linked and accurately scoped", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const section = page.locator(".pg-field-video-section");
  await expect(section).toBeVisible();
  const cards = section.locator(".pg-field-video-card");
  await expect(cards).toHaveCount(4);

  const videoIds = ["993768", "1014627", "1015702", "1026500"];
  for (const [index, card] of (await cards.all()).entries()) {
    await expect(
      card.getByRole("button", { name: /Play video/ }),
    ).toBeVisible();
    await expect(
      card.getByRole("link", { name: "Open original video record" }),
    ).toHaveAttribute("href", /^https:\/\/www\.dvidshub\.net\/video\//);
    if (index === 0) {
      await card.getByRole("button", { name: /Play video/ }).click();
      await expect(card.locator("iframe")).toHaveAttribute(
        "src",
        `https://www.dvidshub.net/video/embed/${videoIds[index]}`,
      );
      await expect(card.locator("iframe")).toHaveAttribute("title", /.+/);
    }
  }
  await expect(section).toContainText("not dispatch telemetry");
  await expect(section).toContainText("not a running generator");
});

test("receiving substation scene follows editable voltage inputs and exposes selectable terminals", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const scene = page.locator("section.pg-downstream");
  await expect(scene).toBeVisible();
  await expect(scene.getByText("330 kV → 33 kV → 0.4 kV")).toBeVisible();
  await expect(
    scene.getByRole("heading", { name: "Receiving step-down transformer" }),
  ).toBeVisible();
  await expect(
    scene.getByText(/HV primary A\/B\/C; MV secondary/),
  ).toBeVisible();
  await page.getByLabel("Raised transmission voltage (kV)").fill("275");
  await expect(scene.getByText("275 kV → 33 kV → 0.4 kV")).toBeVisible();
  await scene
    .getByRole("button", { name: /Inspect: Three-phase motor/ })
    .click();
  await expect(
    scene.getByRole("heading", { name: "Three-phase industrial motor" }),
  ).toBeVisible();
  await expect(scene.getByText(/U\/V\/W phase terminals/)).toBeVisible();
  await scene.getByRole("button", { name: /Inspect: N · neutral/ }).focus();
  await page.keyboard.press("Enter");
  await expect(
    scene.getByRole("heading", { name: "Neutral conductor · N" }),
  ).toBeVisible();
  await expect(
    scene.getByText(/not a protective-earth conductor/),
  ).toBeVisible();
});

test("generation plant studies switch real illustrations and expose equipment interfaces", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const studies = page.locator("section.pg-generation-study");
  await expect(
    studies.getByRole("heading", { name: "Explore other generation plants" }),
  ).toBeVisible();
  const image = studies.locator("figure img");
  await expect(image).toHaveAttribute(
    "src",
    "./assets/thermal-gas-powerhouse.png",
  );
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  await studies.getByRole("button", { name: "Utility-scale solar PV" }).click();
  await expect(image).toHaveAttribute(
    "src",
    "./assets/solar-plant-illustration.jpg",
  );
  await expect(image).toHaveAttribute(
    "alt",
    /custom training illustration tracing utility photovoltaic/i,
  );
  await studies
    .getByRole("button", { name: "PV modules and string circuits" })
    .click();
  await expect(
    studies.getByRole("heading", { name: "PV modules and string circuits" }),
  ).toBeVisible();
  await expect(
    studies.getByText(/DC string positive and negative conductors/),
  ).toBeVisible();
  await studies.getByRole("button", { name: "Central inverter" }).click();
  await expect(studies.getByText(/DC input and AC output/)).toBeVisible();

  await studies.getByRole("button", { name: "Utility wind plant" }).click();
  await expect(image).toHaveAttribute(
    "src",
    "./assets/wind-plant-illustration.jpg",
  );
  await studies
    .getByRole("button", { name: "Rotor blades, hub and pitch system" })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    studies.getByRole("heading", {
      name: "Rotor blades, hub and pitch system",
    }),
  ).toBeVisible();
  await expect(
    studies.getByText(/no external electrical terminals/),
  ).toBeVisible();
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);

  await studies.getByRole("button", { name: "Utility-scale solar PV" }).click();
  const language = page.locator(".language-select");
  for (const [locale, title, caption] of [
    [
      "de",
      "Weitere Kraftwerkstypen erkunden",
      "Eigene Lehrillustration · Photovoltaik-Solarpark",
    ],
    [
      "yo",
      "Ṣàyẹ̀wò àwọn irú ilé-iṣẹ́ ìṣẹ̀dá agbára mìíràn",
      "Àwòrán ẹ̀kọ́ àtilẹ̀wá · utility solar PV plant",
    ],
    [
      "pcm",
      "Explore other generation plants",
      "Custom training illustration · utility solar PV plant",
    ],
  ]) {
    await language.selectOption(locale);
    await expect(studies.getByRole("heading", { name: title })).toBeVisible();
    await expect(studies.locator("figcaption")).toHaveText(caption);
  }
});

test("regional teaching scenario applies sourced voltage stages only", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  await expect(
    page.getByRole("heading", { name: "Regional teaching scenario" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Nigeria-inspired · educational, not an operational grid replica",
    ),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Regional teaching scenario" })
      .getByText("50 Hz", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("NGN", { exact: true })).toBeVisible();
  await expect(page.getByText("Africa/Lagos", { exact: true })).toBeVisible();
  await page.getByLabel("Base transmission voltage (kV)").fill("120");
  await page.getByLabel("Raised transmission voltage (kV)").fill("250");
  await page.getByLabel("Distribution voltage (kV)").fill("22");
  await page
    .getByRole("button", { name: "Apply 132 / 330 / 33 kV stages" })
    .click();
  await expect(page.getByLabel("Base transmission voltage (kV)")).toHaveValue(
    "132",
  );
  await expect(page.getByLabel("Raised transmission voltage (kV)")).toHaveValue(
    "330",
  );
  await expect(page.getByLabel("Distribution voltage (kV)")).toHaveValue("33");
  await expect(page.getByLabel("Consumer voltage (kV)")).toHaveValue("0.4");
  await expect(
    page
      .getByRole("status")
      .getByText("Applied to the voltage comparison and schematic"),
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Nigerian Grid Code, Version 02, public consultation copy",
    }),
  ).toHaveAttribute("href", /nerc\.gov\.ng/);
});

test("Germany-inspired scenario applies the 50Hertz-area voltage context", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  await page.getByLabel("Engineering region").selectOption("germany-inspired");
  await expect(
    page.getByText(
      "50Hertz-area example · not a complete national grid replica",
    ),
  ).toBeVisible();
  await expect(page.getByText("Europe/Berlin", { exact: true })).toBeVisible();
  await expect(page.getByText("EUR", { exact: true })).toBeVisible();
  await expect(
    page.getByText("380 kV · 220 kV · 110 kV · 20 kV · 0.4 kV"),
  ).toBeVisible();
  await page.getByLabel("Base transmission voltage (kV)").fill("200");
  await page.getByLabel("Raised transmission voltage (kV)").fill("350");
  await page.getByLabel("Distribution voltage (kV)").fill("22");
  await page.getByLabel("Generator voltage (kV)").fill("13.8");
  await page.getByLabel("Consumer voltage (kV)").fill("0.23");
  await page
    .getByRole("button", { name: "Apply 220 / 380 / 110 / 0.4 kV stages" })
    .click();
  await expect(page.getByLabel("Base transmission voltage (kV)")).toHaveValue(
    "220",
  );
  await expect(page.getByLabel("Raised transmission voltage (kV)")).toHaveValue(
    "380",
  );
  await expect(page.getByLabel("Distribution voltage (kV)")).toHaveValue("110");
  await expect(page.getByLabel("Generator voltage (kV)")).toHaveValue("13.8");
  await expect(page.getByLabel("Consumer voltage (kV)")).toHaveValue("0.4");
  await expect(
    page.getByRole("link", {
      name: "50Hertz transmission grid and network levels",
    }),
  ).toHaveAttribute("href", "https://www.50hertz.com/en/Grid");
  await expect(
    page.getByRole("link", {
      name: "Bundesnetzagentur Monitoringbericht Energie 2024",
    }),
  ).toHaveAttribute("href", /MonitoringberichtEnergie2024\.pdf/);
});

test("hydro station cutaway traces real equipment, phase conductors and distinct grounding", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto("/#POWERGRID");
  page.setDefaultTimeout(5_000);
  await expect(
    page.getByRole("heading", {
      name: "Hydroelectric generating station · teaching cutaway",
    }),
  ).toBeVisible();
  const hydroSvg = page.locator(
    ".pg-station:not(.pg-downstream) .pg-station-svg",
  );
  await expect(hydroSvg).toBeVisible();
  const phaseA = hydroSvg.locator(".pg-wire-a").first();
  const phaseB = hydroSvg.locator(".pg-wire-b").first();
  const phaseC = hydroSvg.locator(".pg-wire-c").first();
  const neutral = hydroSvg.locator(".pg-neutral-wire").first();
  const earth = hydroSvg.locator(".pg-ground-line").first();
  const shield = hydroSvg.locator(".pg-shield-wire").first();
  for (const conductor of [phaseA, phaseB, phaseC, neutral, earth, shield]) {
    await expect(conductor).toBeAttached();
  }
  await expect(phaseA).toHaveCSS("stroke", "rgb(155, 89, 55)");
  await expect(phaseB).toHaveCSS("stroke", "rgb(34, 43, 54)");
  await expect(phaseC).toHaveCSS("stroke", "rgb(170, 178, 191)");
  await expect(neutral).toHaveCSS("stroke", "rgb(55, 143, 224)");
  await expect(earth).toHaveClass(/pg-ground-line/);
  await expect(shield).toHaveClass(/pg-shield-wire/);
  await expect(
    page
      .locator(".pg-station .pg-equipment-detail")
      .getByRole("heading", { name: /^Synchronous generator/ }),
  ).toBeVisible();
  await expect(page.getByText(/N is not PE/i)).toBeVisible();

  await hydroSvg.locator("text").getByText("A · B · C bus").click();
  await expect(
    page.getByRole("heading", { name: "Three-phase switchyard busbar" }),
  ).toBeVisible();
  await expect(page.getByText(/separate rigid phase bars/i)).toBeVisible();

  await page
    .getByRole("button", { name: "Inspect: Overhead three-phase circuit" })
    .last()
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Overhead three-phase circuit" }),
  ).toBeVisible();
  await expect(
    page.getByText(/no neutral on this depicted transmission circuit/i),
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "DOE · Hydropower supply chain and unit cutaway",
    }),
  ).toHaveAttribute("href", /energy\.gov/);
  await page
    .locator(".pg-station:not(.pg-downstream) .pg-station-svg text")
    .getByText("PROTECTION / SCADA")
    .click();
  await expect(
    page.getByRole("heading", { name: "Protection and SCADA panel" }),
  ).toBeVisible();
  await expect(
    page.getByText(/does not simulate live telemetry/i),
  ).toBeVisible();
  await page
    .locator(".pg-station:not(.pg-downstream) .pg-station-svg text")
    .getByText("Surge arrester")
    .click();
  await expect(
    page.getByRole("heading", { name: "Surge arrester" }),
  ).toBeVisible();
  await expect(page.getByText(/phase-to-earth arrester/i)).toBeVisible();

  const language = page.locator(".language-select");
  await language.selectOption("de");
  await page
    .getByRole("button", { name: /Prüfen: Synchrongenerator/ })
    .first()
    .click();
  await expect(
    page
      .locator(".pg-station .pg-equipment-detail")
      .getByRole("heading", { name: /Synchrongenerator/ }),
  ).toBeVisible();
  await language.selectOption("yo");
  await page
    .getByRole("button", { name: /Ṣàyẹ̀wò: Synchronous generator/ })
    .first()
    .click();
  await expect(
    page
      .locator(".pg-station .pg-equipment-detail")
      .getByRole("heading", { name: /Synchronous generator/ }),
  ).toBeVisible();
  await language.selectOption("pcm");
  await page
    .getByRole("button", { name: /Inspect: Synchronous generator/ })
    .first()
    .click();
  await expect(
    page
      .locator(".pg-station .pg-equipment-detail")
      .getByRole("heading", { name: /Synchronous generator/ }),
  ).toBeVisible();
});

test("PowerGrid direct hash, history, local save and real JSON/CSV exports", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  await expect(page).toHaveURL(/#POWERGRID$/);
  await expect(
    page.getByRole("heading", { name: "Why step up voltage?", exact: true }),
  ).toBeVisible();
  const stationIllustration = page.getByRole("img", {
    name: /Custom hydroelectric station illustration/,
  });
  await expect(stationIllustration).toBeVisible();
  await expect
    .poll(() =>
      stationIllustration.evaluate(
        (image) => (image as HTMLImageElement).naturalWidth,
      ),
    )
    .toBeGreaterThan(0);
  await expect(
    page
      .locator('[aria-labelledby="pg-results-title"]')
      .getByText("437.4 A", { exact: true }),
  ).toBeVisible();

  await page.getByLabel("Transmitted real power (MW)").fill("120");
  await expect(page.getByText("524.9 A")).toBeVisible();
  await page.getByRole("button", { name: "Save experiment locally" }).click();
  await expect(
    page.getByRole("status").getByText("Saved in this browser"),
  ).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export readings CSV" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("powergrid-readings.csv");

  const jsonDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export scenario JSON" }).click();
  const jsonDownload = await jsonDownloadPromise;
  expect(jsonDownload.suggestedFilename()).toBe("powergrid-experiment.json");
  const exported = JSON.parse(
    await readFile((await jsonDownload.path())!, "utf8"),
  );
  expect(exported.model).toBe("balanced-three-phase-constant-power-line-loss");
  expect(exported.inputs.powerMW).toBe(120);
  expect(exported.comparison.base.currentA).toBeCloseTo(524.9, 0);

  await page.reload();
  await expect(page.getByLabel("Transmitted real power (MW)")).toHaveValue(
    "120",
  );
  await expect(page.getByText("524.9 A")).toBeVisible();

  await page
    .getByRole("button", { name: /^Overview/ })
    .first()
    .click();
  await expect(page).toHaveURL(/#\/overview$/);
  await page.goBack();
  await expect(page).toHaveURL(/#POWERGRID$/);
  await expect(
    page.getByRole("heading", { name: "Why step up voltage?", exact: true }),
  ).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/#\/overview$/);
});

test("PowerGrid entry is reachable at the right edge on desktop, tablet and phone", async ({
  page,
}) => {
  const header = page.getByRole("banner");
  const entry = header.getByRole("button", {
    name: "POWERGRID LAB",
    exact: true,
  });
  const language = header.getByLabel("Language");
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/overview");
    await expect(entry).toBeInViewport({ ratio: 1 });
    const entryBox = (await entry.boundingBox())!;
    const languageBox = (await language.boundingBox())!;
    expect(entryBox.x).toBeGreaterThanOrEqual(
      languageBox.x + languageBox.width,
    );
    expect(entryBox.x + entryBox.width).toBeLessThanOrEqual(width);
    if (width === 1440) {
      await expect(
        header.getByRole("button", { name: "Settings", exact: true }),
      ).toBeVisible();
      await header.locator(".command-button").click();
    } else {
      await page.keyboard.press("Control+k");
    }
    const search = page.getByRole("dialog", { name: "Search", exact: true });
    await expect(search).toBeVisible();
    expect(
      await page.locator(".topbar .powergrid-entry").boundingBox(),
    ).toEqual(entryBox);
    await page.keyboard.press("Escape");
    await expect(search).toBeHidden();
    expect(await entry.boundingBox()).toEqual(entryBox);
    await entry.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#POWERGRID$/);
    await expect(entry).toHaveAttribute("aria-current", "page");
  }
});

test("PowerGrid controls and schematic stay usable on a narrow screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#POWERGRID");
  await expect(
    page.getByRole("heading", { name: "Why step up voltage?", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Transmitted real power (MW)")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Equipment used from generation to the consumer",
    }),
  ).toBeVisible();
  const equipmentImages = page.locator(".pg-gallery-card img");
  await expect(equipmentImages).toHaveCount(6);
  for (const image of await equipmentImages.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((element) => (element as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  const layout = await page.evaluate(() => {
    const panel = document.querySelector<HTMLElement>(".pg-station-scroll");
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      schematicScrollsLocally: Boolean(
        panel && panel.scrollWidth > panel.clientWidth,
      ),
    };
  });
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.schematicScrollsLocally).toBe(true);
  await page.getByLabel("Transmitted real power (MW)").fill("120");
  await expect(page.getByText("524.9 A")).toBeVisible();
});

test("PowerGrid rejects impossible losses and Help searches its guide", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  await page.getByLabel("Line resistance per phase (Ω/phase)").fill("1000");
  await expect(page.getByRole("alert")).toContainText(
    "Calculated line loss must be below transmitted real power.",
  );
  await expect(
    page.getByRole("button", { name: "Export readings CSV" }),
  ).toBeDisabled();
  await page.locator(".help-launch").click();
  await page.getByLabel("Search help").fill("Why step up voltage");
  await expect(
    page.getByRole("heading", {
      name: "POWERGRID LAB: compare transmission voltage",
    }),
  ).toBeVisible();
  await page.getByLabel("Search help").fill("PVWatts");
  await expect(
    page.getByRole("heading", {
      name: "POWERGRID LAB: compare transmission voltage",
    }),
  ).toBeVisible();
});

test("radial feeder solves loads, compares an outage, saves and exports readings", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  await expect(
    page.getByRole("heading", {
      name: "Radial feeder: voltage drop and outages",
    }),
  ).toBeVisible();
  await expect(page.getByText(/Converged ·/)).toBeVisible();
  const lesson = page.getByRole("region", {
    name: "Practical lesson: Feeder trip",
  });
  await lesson.getByText("Worked restoration sequence").click();
  await expect(lesson.getByText(/0.22 MW total/)).toBeVisible();
  await page.getByRole("button", { name: "Set comparison reference" }).click();

  const map = lesson.getByRole("list", { name: "Feeder switch map" });
  await map
    .getByRole("button", { name: "Main north feeder", exact: true })
    .click();
  await expect(
    page.getByLabel("In service: Main north feeder"),
  ).not.toBeChecked();
  await expect(map.getByText("Disconnected", { exact: true })).toHaveCount(2);
  await expect(
    page.getByText("Islanded: some consumer groups are unserved"),
  ).toBeVisible();
  await expect(page.getByText("0 → 0.22 MW")).toBeVisible();
  const lateral = page.getByLabel("In service: North lateral", { exact: true });
  await lateral.uncheck();
  await page.getByLabel("In service: Main north feeder").check();
  await expect(map.getByText("Disconnected", { exact: true })).toHaveCount(1);
  await expect(page.getByText("0 → 0.08 MW")).toBeVisible();
  const partialDownload = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export solved scenario JSON" })
    .click();
  const partial = JSON.parse(
    await readFile(await (await partialDownload).path(), "utf8"),
  );
  expect(partial.result.unservedBusIds).toEqual(["north_group"]);
  expect(partial.reference.result.unservedBusIds).toEqual([]);
  await lateral.check();
  await expect(page.getByText(/Converged ·/)).toBeVisible();

  const load = page.getByLabel("North feeder group Active load (MW)");
  await load.fill("0.2");
  await page.getByRole("button", { name: "Save feeder locally" }).click();
  await expect(page.getByText("Feeder saved in this browser")).toBeVisible();
  await page.reload();
  await expect(
    page.getByLabel("North feeder group Active load (MW)"),
  ).toHaveValue("0.2");

  const jsonPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export solved scenario JSON" })
    .click();
  const json = await jsonPromise;
  expect(json.suggestedFilename()).toBe("powergrid-radial-scenario.json");
  const scenario = JSON.parse(await readFile((await json.path())!, "utf8"));
  expect(scenario.model).toBe(
    "balanced-radial-constant-pq-backward-forward-sweep",
  );
  expect(
    scenario.input.buses.find(
      (bus: { id: string }) => bus.id === "north_feeder",
    ).loadMW,
  ).toBe(0.2);
  expect(scenario.result.status).toBe("converged");

  const csvPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export bus and branch readings CSV" })
    .click();
  const csv = await csvPromise;
  expect(csv.suggestedFilename()).toBe("powergrid-radial-readings.csv");
  const csvText = await readFile((await csv.path())!, "utf8");
  expect(csvText).toContain("bus,north_feeder");
  expect(csvText).toContain("branch,main_north");
});

test("PV source model responds to inputs, saves a reference and exports results", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  await expect(
    page.getByRole("heading", { name: "PV source performance experiment" }),
  ).toBeVisible();
  const pvSection = page
    .locator(".pg-pv")
    .filter({ has: page.locator("#pg-pv-title") });
  await expect(pvSection.getByText("71.232 kW", { exact: true })).toBeVisible();
  await expect(pvSection.getByText("60 kW", { exact: true })).toBeVisible();
  await expect(pvSection.getByText("9.095 kW", { exact: true })).toBeVisible();

  await page
    .getByRole("button", { name: "Save current case as reference" })
    .click();
  const irradiance = page.getByLabel("Plane-of-array irradiance (W/m²)");
  await irradiance.fill("500");
  await expect(page.getByText("-16.641 kW", { exact: false })).toBeVisible();
  await pvSection.getByRole("button", { name: "Save inputs locally" }).click();

  const jsonPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PV case JSON" }).click();
  const json = await jsonPromise;
  expect(json.suggestedFilename()).toBe("powergrid-pv-performance.json");
  const exported = JSON.parse(await readFile((await json.path())!, "utf8"));
  expect(exported.model).toBe("steady-state-pvwatts-style-instantaneous");
  expect(exported.inputs.planeOfArrayIrradianceWm2).toBe(500);
  expect(exported.result.dcPowerKW).toBeCloseTo(44.7, 2);
  expect(exported.sourceReferences).toHaveLength(2);

  const csvPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PV readings CSV" }).click();
  const csv = await csvPromise;
  expect(csv.suggestedFilename()).toBe("powergrid-pv-readings.csv");
  const csvText = await readFile((await csv.path())!, "utf8");
  const acRow = csvText
    .split("\r\n")
    .find((row) => row.startsWith('"delivered AC output"'));
  expect(Number(acRow?.split(",")[1]?.replaceAll('"', ""))).toBeCloseTo(
    43.359,
    3,
  );
  expect(csvText).toContain('"inverter clipping","0","kW"');

  await page.reload();
  await expect(irradiance).toHaveValue("500");
  await irradiance.fill("1600");
  await expect(
    page.getByRole("button", { name: "Export PV case JSON" }),
  ).toBeDisabled();
  await expect(
    page.getByText("Plane-of-array irradiance must be from 0 to 1500 W/m²."),
  ).toBeVisible();
});

test("NREL reference wind curve calculates, saves and exports entered intervals", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const title = page.locator("#pg-wind-title");
  const section = page.locator(".pg-pv").filter({ has: title });
  await expect(title).toBeVisible();
  await expect(section.getByText("15,129 kWh")).toBeVisible();
  const wind = section.getByRole("textbox", {
    name: "Wind speed by interval (m/s, comma-separated)",
  });
  await wind.fill("4, 5, 12, 26");
  await expect(section.getByText("6,808 kWh")).toBeVisible();
  await section.getByRole("button", { name: "Save inputs locally" }).click();
  await expect(section.locator(".pg-saved")).toHaveText(
    "Saved in this browser",
  );

  const jsonPromise = page.waitForEvent("download");
  await section.getByRole("button", { name: "Export wind case JSON" }).click();
  const json = await jsonPromise;
  expect(json.suggestedFilename()).toBe("powergrid-wind-reference-case.json");
  const jsonPath = await json.path();
  expect(jsonPath).toBeTruthy();
  const jsonContent = await readFile(jsonPath!, "utf8");
  expect(JSON.parse(jsonContent).result.totalEnergyKWh).toBe(6808);

  const csvPromise = page.waitForEvent("download");
  await section
    .getByRole("button", { name: "Export wind readings CSV" })
    .click();
  const csv = await csvPromise;
  expect(csv.suggestedFilename()).toBe("powergrid-wind-readings.csv");
  const csvPath = await csv.path();
  const csvContent = await readFile(csvPath!, "utf8");
  expect(csvContent).toContain("12,6000,6000,6000");

  await page.reload();
  const restoredSection = page
    .locator(".pg-pv")
    .filter({ has: page.locator("#pg-wind-title") });
  const restored = restoredSection.getByRole("textbox", {
    name: "Wind speed by interval (m/s, comma-separated)",
  });
  await expect(restored).toHaveValue("4, 5, 12, 26");
  const reference = restoredSection.getByRole("combobox", {
    name: /Reference turbine/,
  });
  await reference.selectOption("onshore");
  await expect(restoredSection.getByText("4,719 kWh")).toBeVisible();
  const ratedOutput = restoredSection.getByRole("meter", {
    name: "Per turbine · Interval 3",
  });
  await expect(ratedOutput).toHaveAttribute("max", "4000");
  await expect(ratedOutput).toHaveAttribute("value", "4000");
  await restoredSection
    .getByRole("button", { name: "Save inputs locally" })
    .click();
  await page.reload();
  await expect(reference).toHaveValue("onshore");
  const onshoreDownload = page.waitForEvent("download");
  await restoredSection
    .getByRole("button", { name: "Export wind case JSON" })
    .click();
  const onshore = JSON.parse(
    await readFile(await (await onshoreDownload).path(), "utf8"),
  );
  expect(onshore.inputs.reference).toBe("onshore");
  expect(onshore.result.totalEnergyKWh).toBe(4719);
  expect(onshore.source).toContain("662d920de487f61e3806c044a893e334c07701fe");
});

test("microgrid dispatch recalculates, validates, saves and exports interval balance", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const title = page.locator("#pg-microgrid-title");
  const section = page.locator(".pg-pv").filter({ has: title });
  await expect(title).toBeVisible();
  await section
    .getByRole("textbox", { name: "Wind speed (m/s)" })
    .fill("3, 3, 3, 3, 3, 3");
  await section
    .getByRole("textbox", { name: "Solar irradiance (W/m²)" })
    .fill("0, 0, 0, 0, 0, 0");
  await section
    .getByRole("textbox", { name: "Total demand (kW)" })
    .fill("50, 50, 50, 50, 50, 50");
  await section
    .getByRole("textbox", { name: "Critical demand (kW)" })
    .fill("20, 20, 20, 20, 20, 20");
  await expect(section.getByTestId("microgrid-batteryKWh")).toHaveAttribute(
    "aria-label",
    "Battery capacity (kWh)",
  );
  await section.getByTestId("microgrid-batteryKWh").fill("1");
  await section.getByTestId("microgrid-initialSoc").fill("0");
  await section.getByTestId("microgrid-reserveSoc").fill("0");
  await section.getByTestId("microgrid-batteryPowerKW").fill("0");
  await section.getByTestId("microgrid-backupKW").fill("0");
  await expect(
    section.locator(".pg-wind-table tbody tr").first(),
  ).toContainText("50");
  await section.getByRole("button", { name: "Save scenario locally" }).click();
  await expect(
    section.getByRole("button", { name: "Saved in this browser" }),
  ).toBeVisible();

  const jsonPromise = page.waitForEvent("download");
  await section.getByRole("button", { name: "Export dispatch JSON" }).click();
  const json = await jsonPromise;
  expect(json.suggestedFilename()).toBe("powergrid-microgrid-dispatch.json");
  const jsonPath = await json.path();
  expect(
    JSON.parse(await readFile(jsonPath!, "utf8")).result.intervals[0]
      .criticalUnservedKW,
  ).toBe(20);

  const csvPromise = page.waitForEvent("download");
  await section.getByRole("button", { name: "Export intervals CSV" }).click();
  const csv = await csvPromise;
  expect(csv.suggestedFilename()).toBe("powergrid-microgrid-intervals.csv");
  const csvPath = await csv.path();
  expect(await readFile(csvPath!, "utf8")).toContain("1,0,0,0,50,20");

  await page.reload();
  const restored = page
    .locator(".pg-pv")
    .filter({ has: page.locator("#pg-microgrid-title") });
  await expect(
    restored.getByRole("textbox", { name: "Total demand (kW)" }),
  ).toHaveValue("50, 50, 50, 50, 50, 50");
  await restored
    .getByRole("textbox", { name: "Wind speed (m/s)" })
    .fill("3, 3");
  await expect(
    restored.getByRole("button", { name: "Export dispatch JSON" }),
  ).toBeDisabled();
  await expect(restored.getByRole("alert")).toContainText(
    "same number of intervals",
  );
});

test("POWERGRID navigable station scene selects named equipment and keeps a keyboard fallback", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  const scene = page.getByRole("region", {
    name: "Navigable power station and grid model",
  });
  await expect(scene).toBeVisible();
  const tower = scene.getByRole("button", {
    name: "Transmission tower & conductors",
    exact: true,
  });
  await tower.focus();
  await page.keyboard.press("Enter");
  await expect(tower).toHaveAttribute("aria-pressed", "true");
  const cutaway = page.locator('section[aria-labelledby="pg-station-title"]');
  const towerPicks = cutaway.getByRole("button", {
    name: /Inspect: Lattice transmission tower/,
  });
  await expect(towerPicks.first()).toHaveAttribute("aria-pressed", "true");
  await expect(towerPicks.last()).toHaveAttribute("aria-pressed", "true");
  const stationBot = page.getByRole("region", {
    name: "Adigun BOT · Transmission worksheet",
  });
  await stationBot
    .getByText("Explain selected station equipment", { exact: true })
    .click();
  await expect(
    stationBot.getByRole("heading", {
      name: "Transmission tower & conductors",
    }),
  ).toBeVisible();
  await expect(stationBot).toContainText(
    "insulated phase conductors and a shield wire",
  );
  await expect(scene.locator("article")).toContainText(
    "insulated phase conductors and a shield wire",
  );
  await expect(scene.getByLabel("3D azimuth")).toBeVisible();
  await scene.getByLabel("3D azimuth").fill("0.61");
  await expect(scene.getByLabel("3D azimuth")).toHaveValue("0.61");
  await expect
    .poll(
      async () =>
        (await scene.locator("canvas").isVisible()) ||
        (await scene.getByRole("status").isVisible()),
    )
    .toBe(true);
  await expect(scene).toContainText("L1/L2/L3");
  await expect(scene).toContainText("PE");
  const stepUp = cutaway
    .getByRole("button", { name: /Inspect: Generator step-up transformer/ })
    .first();
  await stepUp.focus();
  await page.keyboard.press("Enter");
  await expect(
    scene.getByRole("button", { name: /Generator step-up transformer/ }),
  ).toHaveAttribute("aria-pressed", "true");
  const downstream = page.locator(
    'section[aria-labelledby="pg-downstream-title"]',
  );
  await downstream
    .getByRole("button", { name: /Inspect: HV → MV transformer/ })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    scene.getByRole("button", { name: "Receiving-substation transformer" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    stationBot.getByRole("heading", {
      name: "Receiving-substation transformer",
    }),
  ).toBeVisible();
});
