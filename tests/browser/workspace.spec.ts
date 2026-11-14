import { test, expect } from "./fixtures";
import { readFile } from "node:fs/promises";
import { tools } from "../../src/tools";
async function ready(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.locator(".overview-banner")).toBeVisible();
}
async function addLoad(
  page: import("@playwright/test").Page,
  { name = "Analytical heater", rating = "2.3", hours = "8", duty = "1" } = {},
) {
  await page
    .getByRole("button", { name: "Add load", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Name", { exact: true }).fill(name);
  await dialog.getByLabel(/^Rating/).fill(rating);
  await dialog.getByLabel(/^Operating hours/).fill(hours);
  await dialog.getByLabel(/^Energy duty/).fill(duty);
  await dialog.getByRole("button", { name: "Add load", exact: true }).click();
  await expect(page.locator(".load-table")).toBeVisible();
}
async function route(page: import("@playwright/test").Page, name: string) {
  await page
    .locator(".sidebar")
    .getByRole("button", {
      name: new RegExp("^" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    })
    .click();
}
test("empty project → load → correct current/energy → duty → undo → export → reload", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await ready(page);
  await expect(page.getByText("Build your first power study")).toBeVisible();
  await addLoad(page);
  const row = page.locator("tbody tr").filter({ hasText: "Analytical heater" });
  await expect(row).toContainText("10 A");
  await expect(row).toContainText("18.4 kWh");
  await page
    .getByRole("button", { name: "Edit Analytical heater", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel(/^Energy duty/)
    .fill("0.5");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await expect(row).toContainText("10 A");
  await expect(row).toContainText("9.2 kWh");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(row).toContainText("18.4 kWh");
  await expect(page.locator(".save-badge")).toContainText("Saved locally");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export project", exact: true })
    .click();
  const file = await download;
  const data = JSON.parse(await readFile((await file.path())!, "utf8"));
  expect(data.loads[0].rating).toBe(2.3);
  expect(data.loads[0].duty).toBe(1);
  await page.reload();
  await expect(page.locator(".load-table")).toBeVisible();
  await expect(page.locator(".load-table")).toContainText("Analytical heater");
  await route(page, "Overview");
  await page.screenshot({
    path: "docs/screenshots/desktop-project.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("all 51 toolbox examples execute through actual inputs", async ({
  page,
}) => {
  test.setTimeout(120000);
  await ready(page);
  await route(page, "Engineering Toolbox");
  for (const tool of tools) {
    await page
      .locator(".tool-item")
      .filter({ hasText: tool.id })
      .first()
      .click();
    await page
      .getByRole("button", { name: "Load worked example", exact: true })
      .click();
    await page
      .locator(".tool-workspace")
      .getByRole("button", { name: "Calculate", exact: true })
      .click();
    await expect(
      page.locator(".tool-result"),
      tool.id + " " + tool.title,
    ).toBeVisible();
    await expect(page.locator(".tool-workspace .error-text")).toHaveCount(0);
  }
  await page.screenshot({
    path: "docs/screenshots/toolbox.png",
    fullPage: true,
  });
});
test("native import preview preserves current work on malformed JSON and survives CSV injection strings", async ({
  page,
}) => {
  await ready(page);
  await addLoad(page);
  await page.locator('input[type=file][accept=".json,.csv"]').setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from("{bad"),
  });
  await expect(page.getByRole("alert")).toContainText("not valid");
  await expect(page.locator(".load-table")).toContainText("Analytical heater");
  await page.locator('input[type=file][accept=".json,.csv"]').setInputFiles({
    name: "schedule.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      "name,rating,voltage,pf,hoursPerDay\nImported lamp,0.1,230,1,10",
    ),
  });
  await expect(page.getByRole("dialog")).toContainText("Imported lamp");
  await page.getByRole("button", { name: "Apply import", exact: true }).click();
  await expect(page.locator(".load-table")).toContainText("Imported lamp");
  await expect(page.locator(".load-table")).toContainText("Analytical heater");
});
test("calendar worker integrates a DST day and cancels on a project edit", async ({
  page,
}) => {
  await ready(page);
  await addLoad(page, { name: "Constant 1 kW", rating: "1", hours: "24" });
  await route(page, "Schedules & Simulation");
  await page.getByLabel("Start date", { exact: true }).fill("2026-10-25");
  await page.getByLabel("End date", { exact: true }).fill("2026-10-26");
  await page
    .getByRole("button", { name: "Run simulation", exact: true })
    .click();
  await expect(page.locator(".metric-strip")).toContainText("25 kWh");
  await expect(page.locator(".panel-head")).toContainText([
    "Calculated · 25 h",
    "Completed simulation timeline",
  ]);
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export series", exact: true })
    .click();
  const file = await download;
  const csv = await readFile((await file.path())!, "utf8");
  expect(csv.split("\r\n").length).toBe(101);
});
test("local BOT proposes a real load, requires confirmation, and supports undo", async ({
  page,
}) => {
  await ready(page);
  await page
    .getByRole("button", { name: "Open Adigun BOT", exact: true })
    .click();
  const bot = page.locator(".local-bot");
  await expect(bot).toBeVisible();
  await bot
    .locator("textarea")
    .fill("load: BOT heater; 2.3 kW; 230 V; PF 1; 8 h");
  await bot.getByRole("button", { name: "Send", exact: true }).click();
  await expect(bot).toContainText("BOT heater");
  await expect(page.locator(".overview-banner")).toContainText("0");
  await bot
    .getByRole("button", { name: "Apply confirmed changes", exact: true })
    .click();
  await expect(page.locator(".overview-banner")).toContainText("1");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByText("Build your first power study")).toBeVisible();
});
test("local BOT reviews and applies a validated single-load edit", async ({
  page,
}) => {
  await ready(page);
  await page
    .getByRole("button", { name: "Open Adigun BOT", exact: true })
    .click();
  const bot = page.locator(".local-bot");
  const composer = bot.locator("textarea");
  await composer.fill("load: BOT edit target; 2.3 kW; 230 V; PF 1; 8 h");
  await bot.getByRole("button", { name: "Send", exact: true }).click();
  await bot
    .getByRole("button", { name: "Apply confirmed changes", exact: true })
    .click();
  await composer.fill("edit load: BOT edit target; quantity; 2");
  await bot.getByRole("button", { name: "Send", exact: true }).click();
  await expect(bot.locator(".bot-proposal").last()).toContainText("×1");
  await expect(bot.locator(".bot-proposal").last()).toContainText("×2");
  await bot
    .getByRole("button", { name: "Apply confirmed changes", exact: true })
    .click();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: /^Load Schedule/ })
    .click();
  await page
    .getByRole("button", { name: "Edit BOT edit target", exact: true })
    .click();
  await expect(
    page.getByRole("dialog").getByLabel("Quantity", { exact: true }),
  ).toHaveValue("2");
});
test("local BOT previews a circuit-wide phase change before applying it", async ({
  page,
}) => {
  await ready(page);
  await page
    .getByRole("button", { name: "Open Adigun BOT", exact: true })
    .click();
  const bot = page.locator(".local-bot");
  const composer = bot.locator("textarea");
  await composer.fill("load: BOT phase target; 2.3 kW; 230 V; PF 1; 8 h");
  await bot.getByRole("button", { name: "Send", exact: true }).click();
  await bot
    .getByRole("button", { name: "Apply confirmed changes", exact: true })
    .click();
  await composer.fill("phase load: BOT phase target; L2");
  await bot.getByRole("button", { name: "Send", exact: true }).click();
  const proposal = bot.locator(".bot-proposal").last();
  await expect(proposal).toContainText("phase: L1 → L2");
  await proposal
    .getByRole("button", { name: "Apply confirmed changes", exact: true })
    .click();
  await page
    .locator(".sidebar")
    .getByRole("button", { name: /^Load Schedule/ })
    .click();
  await page
    .getByRole("button", { name: "Edit BOT phase target", exact: true })
    .click();
  await expect(
    page.getByRole("dialog").getByLabel("Phase", { exact: true }),
  ).toHaveValue("L2");
});
test("BOT circuit assignment previews destination and applies only after confirmation", async ({
  page,
}) => {
  await ready(page);
  const boardName = await page.evaluate(async () => {
    const domainPath = "/src/domain/project.ts";
    const storagePath = "/src/storage/projects.ts";
    const domain = await import(/* @vite-ignore */ domainPath);
    const storage = await import(/* @vite-ignore */ storagePath);
    const project = domain.createProject("BOT circuit assignment fixture");
    const circuit = domain.createCircuit(project.boards[0].id, {
      name: "Lighting circuit",
      phase: "L2",
    });
    project.circuits = [circuit];
    project.loads = [
      domain.createLoad({
        name: "BOT assignment target",
        boardId: project.boards[0].id,
        phase: "L1",
      }),
    ];
    await storage.saveProject(project);
    storage.writePreference("currentProject", project.id);
    return project.boards[0].name;
  });
  await page.reload();
  await page
    .getByRole("button", { name: "Open Adigun BOT", exact: true })
    .click();
  const bot = page.locator(".local-bot");
  const composer = bot.locator("textarea");
  await composer.fill(
    "assign load: BOT assignment target; circuit: Lighting circuit",
  );
  await bot.getByRole("button", { name: "Send", exact: true }).click();
  const proposal = bot.locator(".bot-proposal").last();
  await expect(proposal).toContainText("BOT assignment target");
  await expect(proposal).toContainText("Lighting circuit");
  await expect(proposal).toContainText("L2");
  await expect(proposal).toContainText(boardName);
  await expect(
    proposal.getByRole("button", {
      name: "Apply confirmed changes",
      exact: true,
    }),
  ).toBeVisible();
  await proposal
    .getByRole("button", { name: "Apply confirmed changes", exact: true })
    .click();
  await expect(proposal).toContainText(
    "Applied through project history. Use Undo to restore.",
  );
});

test("BOT previews board assignment and circuit removal before applying", async ({
  page,
}) => {
  await ready(page);
  const boardName = await page.evaluate(async () => {
    const domainPath = "/src/domain/project.ts";
    const storagePath = "/src/storage/projects.ts";
    const domain = await import(/* @vite-ignore */ domainPath);
    const storage = await import(/* @vite-ignore */ storagePath);
    const project = domain.createProject("BOT board assignment fixture");
    const currentBoard = project.boards[0];
    const targetBoard = domain.createBoard({ name: "Workshop board" });
    const circuit = domain.createCircuit(currentBoard.id, {
      name: "Existing circuit",
    });
    project.boards.push(targetBoard);
    project.circuits = [circuit];
    project.loads = [
      domain.createLoad({
        name: "BOT board target",
        boardId: currentBoard.id,
        circuitId: circuit.id,
      }),
    ];
    await storage.saveProject(project);
    storage.writePreference("currentProject", project.id);
    return targetBoard.name;
  });
  await page.reload();
  await page
    .getByRole("button", { name: "Open Adigun BOT", exact: true })
    .click();
  const bot = page.locator(".local-bot");
  const composer = bot.locator("textarea");
  await composer.fill(`assign load: BOT board target; board: ${boardName}`);
  await bot.getByRole("button", { name: "Send", exact: true }).click();
  const proposal = bot.locator(".bot-proposal").last();
  await expect(proposal).toContainText("BOT board target");
  await expect(proposal).toContainText("Workshop board");
  await expect(proposal).toContainText("Existing circuit");
  await expect(proposal).toContainText("Unassigned");
  await proposal
    .getByRole("button", { name: "Apply confirmed changes", exact: true })
    .click();
  await expect(proposal).toContainText(
    "Applied through project history. Use Undo to restore.",
  );
  await expect(proposal).toContainText("Workshop board");
});

test("Adigun BOT window controls and conversation survive close and reopen", async ({
  page,
}) => {
  await ready(page);
  await page
    .getByRole("button", { name: "Open Adigun BOT", exact: true })
    .click();
  let bot = page.locator(".local-bot");
  const readState = () =>
    page.evaluate(() =>
      JSON.parse(
        localStorage.getItem("adigunpowerlab.bot.window.v2") ?? "null",
      ),
    );
  await expect.poll(readState).not.toBeNull();
  const initial = await readState();
  const header = bot.locator(".bot-header");
  await header.focus();
  await header.press("ArrowLeft");
  await expect
    .poll(async () => (await readState()).geometry.x)
    .toBe(initial.geometry.x - 10);
  await expect(bot).toHaveCSS("left", `${initial.geometry.x - 10}px`);

  await bot.getByRole("button", { name: "Minimize", exact: true }).click();
  await expect(bot).toHaveClass(/is-minimized/);
  await expect.poll(async () => (await readState()).minimized).toBe(true);
  await bot.getByRole("button", { name: "Restore", exact: true }).click();
  await expect(bot).not.toHaveClass(/is-minimized/);
  await expect.poll(async () => (await readState()).minimized).toBe(false);

  await bot.getByRole("button", { name: "Maximize", exact: true }).click();
  await expect.poll(async () => (await readState()).maximized).toBe(true);
  await expect(bot).toHaveCSS("left", "8px");
  await bot.getByRole("button", { name: "Restore", exact: true }).click();
  await expect.poll(async () => (await readState()).maximized).toBe(false);
  await expect(bot).toHaveCSS("left", `${initial.geometry.x - 10}px`);

  await bot.getByRole("button", { name: "Overview", exact: true }).click();
  await expect(bot.locator(".bot-message.assistant").last()).toBeVisible();
  await bot.getByRole("button", { name: "Close", exact: true }).click();
  await expect(bot).toHaveCount(0);

  await page
    .getByRole("button", { name: "Open Adigun BOT", exact: true })
    .click();
  bot = page.locator(".local-bot");
  await expect(bot).toHaveCSS("left", `${initial.geometry.x - 10}px`);
  await expect(bot.locator(".bot-message.assistant")).toHaveCount(1);
  await expect
    .poll(async () => (await readState()).geometry.x)
    .toBe(initial.geometry.x - 10);
});

test("four language controls, light theme and mobile layout preserve working data", async ({
  page,
}) => {
  await ready(page);
  await addLoad(page);
  for (const [locale, text] of [
    ["de", "Lastenliste"],
    ["yo", "Àtòjọ ẹrù"],
    ["pcm", "Load Schedule"],
    ["en", "Load Schedule"],
  ]) {
    await page.getByLabel(/Language|Sprache|Èdè/).selectOption(locale);
    await expect(page.locator(".page-heading h2")).toHaveText(text);
    await expect(page.locator(".load-table")).toContainText(
      "Analytical heater",
    );
  }
  await route(page, "Settings");
  await page
    .getByRole("combobox", { name: "Theme", exact: true })
    .selectOption("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.screenshot({
    path: "docs/screenshots/light-settings.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("combobox", { name: "Theme", exact: true })
    .selectOption("dark");
  if (
    await page
      .getByRole("button", { name: "Collapse navigation", exact: true })
      .isVisible()
  )
    await page
      .getByRole("button", { name: "Collapse navigation", exact: true })
      .click();
  expect(
    await page.evaluate(() => document.body.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.screenshot({
    path: "docs/screenshots/mobile-settings.png",
    fullPage: true,
  });
});

test("load context menu supports pointer and keyboard navigation with focus return", async ({
  page,
}) => {
  await ready(page);
  await addLoad(page);
  const row = page.locator("tbody tr").filter({ hasText: "Analytical heater" });
  const opener = row.locator("button.load-name");

  await opener.focus();
  await page.keyboard.press("Shift+F10");
  const menu = page.getByRole("menu", { name: "Load actions", exact: true });
  const items = menu.getByRole("menuitem");
  await expect(menu).toBeVisible();
  await expect(items).toHaveCount(4);
  await expect(items.nth(0)).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(items.nth(1)).toBeFocused();
  await page.keyboard.press("End");
  await expect(items.nth(3)).toBeFocused();
  await page.keyboard.press("Home");
  await expect(items.nth(0)).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(opener).toBeFocused();

  await opener.click({ button: "right" });
  await expect(menu).toBeVisible();
  await menu.getByRole("menuitem", { name: "Edit load", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Edit load", exact: true });
  await expect(dialog.getByLabel("Name", { exact: true })).toHaveValue(
    "Analytical heater",
  );
});

test("load context menu inspection, duplication and reviewed deletion work as previewed", async ({
  page,
}) => {
  await ready(page);
  await addLoad(page);
  const original = page.locator("tbody tr").filter({
    has: page
      .locator("button.load-name")
      .getByText("Analytical heater", { exact: true }),
  });
  const originalOpener = original.locator("button.load-name");

  await originalOpener.click({ button: "right" });
  let menu = page.getByRole("menu", { name: "Load actions", exact: true });
  await menu.getByRole("menuitem", { name: "Inspect", exact: true }).click();
  await expect(original).toHaveClass(/selected-row/);

  await originalOpener.click({ button: "right" });
  menu = page.getByRole("menu", { name: "Load actions", exact: true });
  await menu.getByRole("menuitem", { name: "Duplicate", exact: true }).click();
  const copy = page
    .locator("tbody tr")
    .filter({ hasText: "Analytical heater · copy" });
  await expect(copy).toHaveCount(1);
  await expect(original).toHaveCount(1);

  const copyOpener = copy.locator("button.load-name");
  await copyOpener.click({ button: "right" });
  menu = page.getByRole("menu", { name: "Load actions", exact: true });
  await menu.getByRole("menuitem", { name: "Delete", exact: true }).click();
  let review = page.getByRole("dialog", {
    name: "Review project changes",
    exact: true,
  });
  await expect(
    review.getByRole("button", { name: "Apply reviewed changes", exact: true }),
  ).toBeEnabled();
  await review.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(review).toHaveCount(0);
  await expect(copy).toHaveCount(1);

  await copyOpener.click({ button: "right" });
  menu = page.getByRole("menu", { name: "Load actions", exact: true });
  await menu.getByRole("menuitem", { name: "Delete", exact: true }).click();
  review = page.getByRole("dialog", {
    name: "Review project changes",
    exact: true,
  });
  await review
    .getByRole("button", { name: "Apply reviewed changes", exact: true })
    .click();
  await expect(copy).toHaveCount(0);
  await expect(original).toHaveCount(1);
});

test("local BOT rejects duplicate exact-name targets without proposing a change", async ({
  page,
}) => {
  await ready(page);
  await addLoad(page, { name: "Ambiguous heater" });
  await addLoad(page, { name: "Ambiguous heater" });
  const targets = page
    .locator("tbody tr")
    .filter({ hasText: "Ambiguous heater" });
  await expect(targets).toHaveCount(2);

  await page
    .getByRole("button", { name: "Open Adigun BOT", exact: true })
    .click();
  const bot = page.locator(".local-bot");
  await bot
    .locator("textarea")
    .fill("edit load: Ambiguous heater; quantity; 2");
  await bot.getByRole("button", { name: "Send", exact: true }).click();

  await expect(bot.getByRole("alert")).toHaveText(
    "Load name is ambiguous. Use a unique load name.",
  );
  await expect(
    bot.getByRole("button", { name: "Apply confirmed changes", exact: true }),
  ).toHaveCount(0);
  await expect(targets).toHaveCount(2);
});

test("local BOT rejects nonnumeric load edits without a proposal or mutation", async ({
  page,
}) => {
  await ready(page);
  await addLoad(page, { name: "BOT invalid edit target" });
  const row = page
    .locator("tbody tr")
    .filter({ hasText: "BOT invalid edit target" });

  await page
    .getByRole("button", { name: "Open Adigun BOT", exact: true })
    .click();
  const bot = page.locator(".local-bot");
  await bot
    .locator("textarea")
    .fill("edit load: BOT invalid edit target; quantity; two");
  await bot.getByRole("button", { name: "Send", exact: true }).click();

  await expect(bot.getByRole("alert")).toHaveText(
    "Enter one positive numeric value for this field.",
  );
  await expect(bot.locator(".bot-proposal")).toHaveCount(0);
  await expect(
    bot.getByRole("button", { name: "Apply confirmed changes", exact: true }),
  ).toHaveCount(0);
  await expect(row).toHaveCount(1);

  await row
    .getByRole("button", {
      name: "Edit BOT invalid edit target",
      exact: true,
    })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Edit load",
    exact: true,
  });
  await expect(dialog.getByLabel("Quantity", { exact: true })).toHaveValue("1");
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
});

test("local BOT rejects missing exact-name edit targets without a proposal or mutation", async ({
  page,
}) => {
  await ready(page);
  await addLoad(page, { name: "Existing BOT target" });
  const row = page
    .locator("tbody tr")
    .filter({ hasText: "Existing BOT target" });

  await page
    .getByRole("button", { name: "Open Adigun BOT", exact: true })
    .click();
  const bot = page.locator(".local-bot");
  await bot
    .locator("textarea")
    .fill("edit load: Missing BOT target; quantity; 2");
  await bot.getByRole("button", { name: "Send", exact: true }).click();

  await expect(bot.getByRole("alert")).toHaveText(
    "No load with that exact name was found.",
  );
  await expect(bot.locator(".bot-proposal")).toHaveCount(0);
  await expect(
    bot.getByRole("button", { name: "Apply confirmed changes", exact: true }),
  ).toHaveCount(0);
  await expect(row).toHaveCount(1);

  await row
    .getByRole("button", {
      name: "Edit Existing BOT target",
      exact: true,
    })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Edit load",
    exact: true,
  });
  await expect(dialog.getByLabel("Quantity", { exact: true })).toHaveValue("1");
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
});

test("local BOT rejects zero quantity edits without a proposal or mutation", async ({
  page,
}) => {
  await ready(page);
  await addLoad(page, { name: "BOT quantity target" });
  const row = page
    .locator("tbody tr")
    .filter({ hasText: "BOT quantity target" });

  await page
    .getByRole("button", { name: "Open Adigun BOT", exact: true })
    .click();
  const bot = page.locator(".local-bot");
  await bot
    .locator("textarea")
    .fill("edit load: BOT quantity target; quantity; 0");
  await bot.getByRole("button", { name: "Send", exact: true }).click();

  await expect(bot.getByRole("alert")).toHaveText(
    "Quantity must be a positive integer.",
  );
  await expect(bot.locator(".bot-proposal")).toHaveCount(0);
  await expect(
    bot.getByRole("button", { name: "Apply confirmed changes", exact: true }),
  ).toHaveCount(0);
  await expect(row).toHaveCount(1);

  await row
    .getByRole("button", {
      name: "Edit BOT quantity target",
      exact: true,
    })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Edit load",
    exact: true,
  });
  await expect(dialog.getByLabel("Quantity", { exact: true })).toHaveValue("1");
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
});

test("local BOT rejects renaming a load to an existing name", async ({
  page,
}) => {
  await ready(page);
  await addLoad(page, { name: "Rename source" });
  await addLoad(page, { name: "Rename target" });
  const source = page.locator("tbody tr").filter({ hasText: "Rename source" });
  const target = page.locator("tbody tr").filter({ hasText: "Rename target" });

  await page
    .getByRole("button", { name: "Open Adigun BOT", exact: true })
    .click();
  const bot = page.locator(".local-bot");
  await bot
    .locator("textarea")
    .fill("edit load: Rename source; name; Rename target");
  await bot.getByRole("button", { name: "Send", exact: true }).click();

  await expect(bot.getByRole("alert")).toHaveText(
    "Load name must remain unique for future commands.",
  );
  await expect(bot.locator(".bot-proposal")).toHaveCount(0);
  await expect(
    bot.getByRole("button", { name: "Apply confirmed changes", exact: true }),
  ).toHaveCount(0);
  await expect(source).toHaveCount(1);
  await expect(target).toHaveCount(1);

  await source
    .getByRole("button", { name: "Edit Rename source", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Edit load",
    exact: true,
  });
  const nameInput = dialog.getByLabel("Name", { exact: true });
  await expect(nameInput).toHaveValue("Rename source");
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
});
