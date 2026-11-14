import { expect, test } from "./fixtures";
import { readFile } from "node:fs/promises";

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
  await expect(page.getByText("50 Hz", { exact: true })).toBeVisible();
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

test("PowerGrid direct hash, history, local save and real JSON/CSV exports", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  await expect(page).toHaveURL(/#POWERGRID$/);
  await expect(
    page.getByRole("heading", { name: "Why step up voltage?" }),
  ).toBeVisible();
  await expect(page.getByText("437.4 A")).toBeVisible();

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
    page.getByRole("heading", { name: "Why step up voltage?" }),
  ).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/#\/overview$/);
});

test("PowerGrid controls and schematic stay usable on a narrow screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#POWERGRID");
  await expect(
    page.getByRole("heading", { name: "Why step up voltage?" }),
  ).toBeVisible();
  await expect(page.getByLabel("Transmitted real power (MW)")).toBeVisible();
  const layout = await page.evaluate(() => {
    const panel = document.querySelector<HTMLElement>(
      ".pg-panel:has(.pg-schematic)",
    );
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
  await page.getByRole("button", { name: "Set comparison reference" }).click();

  await page.getByLabel("In service: Main north feeder").uncheck();
  await expect(
    page.getByText("Islanded: some consumer groups are unserved"),
  ).toBeVisible();
  await expect(page.getByText("0 → 0.22 MW")).toBeVisible();
  await page.getByLabel("In service: Main north feeder").check();

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
  await expect(page.getByText("71.232 kW", { exact: true })).toBeVisible();
  await expect(page.getByText("60 kW", { exact: true })).toBeVisible();
  await expect(page.getByText("9.095 kW", { exact: true })).toBeVisible();

  await page
    .getByRole("button", { name: "Save current case as reference" })
    .click();
  const irradiance = page.getByLabel("Plane-of-array irradiance (W/m²)");
  await irradiance.fill("500");
  await expect(page.getByText("-16.641 kW", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Save inputs locally" }).click();

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
