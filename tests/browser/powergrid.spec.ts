import { expect, test } from "./fixtures";
import { readFile } from "node:fs/promises";

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
    "/assets/thermal-gas-powerhouse.png",
  );
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  await studies.getByRole("button", { name: "Utility-scale solar PV" }).click();
  await expect(image).toHaveAttribute(
    "src",
    "/assets/solar-plant-illustration.jpg",
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
    "/assets/wind-plant-illustration.jpg",
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
    page.getByRole("heading", { name: /synchronous generator/i }),
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
    page.getByRole("heading", { name: /Synchrongenerator/ }),
  ).toBeVisible();
  await language.selectOption("yo");
  await page
    .getByRole("button", { name: /Ṣàyẹ̀wò: Synchronous generator/ })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: /Synchronous generator/ }),
  ).toBeVisible();
  await language.selectOption("pcm");
  await page
    .getByRole("button", { name: /Inspect: Synchronous generator/ })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: /Synchronous generator/ }),
  ).toBeVisible();
});

test("PowerGrid direct hash, history, local save and real JSON/CSV exports", async ({
  page,
}) => {
  await page.goto("/#POWERGRID");
  await expect(page).toHaveURL(/#POWERGRID$/);
  await expect(
    page.getByRole("heading", { name: "Why step up voltage?" }),
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
  const pvSection = page
    .locator(".pg-pv")
    .filter({ has: page.locator("#pg-pv-title") });
  await expect(page.getByText("71.232 kW", { exact: true })).toBeVisible();
  await expect(page.getByText("60 kW", { exact: true })).toBeVisible();
  await expect(page.getByText("9.095 kW", { exact: true })).toBeVisible();

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
  await expect(section.locator("tbody tr").first()).toContainText("50");
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
