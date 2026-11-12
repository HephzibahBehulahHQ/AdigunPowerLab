import { test, expect } from "./fixtures";

test("renewables method follows the global detail mode", async ({ page }) => {
  await page.goto("/#/renewables");
  const mode = page.locator(".page-heading .detail-mode-control select");
  await mode.selectOption("simple");

  const method = page.locator(".tool-formula");
  await expect(method).toBeVisible();
  await expect(method).toHaveJSProperty("open", false);
  await expect(method.locator("summary")).toContainText("Method");
  await expect(page.getByText("Daily energy:", { exact: false })).toBeVisible();
  await expect(
    page.getByText("All results use entered assumptions.", { exact: false }),
  ).toBeVisible();

  await method.locator("summary").click();
  await expect(method.locator(".formula")).toContainText("PV = kWp × h × PR");

  await mode.selectOption("engineering");
  await expect(page.locator(".tool-formula")).toHaveCount(0);
  await expect(page.getByText("PV = kWp × h × PR")).toBeVisible();
});

test("EV planning method follows the global detail mode", async ({ page }) => {
  await page.goto("/#/ev");
  const mode = page.locator(".page-heading .detail-mode-control select");
  await mode.selectOption("simple");

  const method = page.locator(".tool-formula");
  await expect(method).toBeVisible();
  await expect(method).toHaveJSProperty("open", false);
  await expect(method.locator(".formula")).toBeHidden();
  await expect(method.locator("summary")).toContainText("Method");
  await expect(
    page.getByText("All results use entered assumptions.", { exact: false }),
  ).toBeVisible();

  await method.locator("summary").click();
  await expect(method.locator(".formula")).toContainText("Sessions reserve");

  await mode.selectOption("engineering");
  await expect(page.locator(".tool-formula")).toHaveCount(0);
  await expect(
    page.getByText("Sessions reserve conservative on-state demand"),
  ).toBeVisible();
});

test("cost tariff details follow the global detail mode", async ({ page }) => {
  await page.goto("/#/costs");
  const mode = page.locator(".page-heading .detail-mode-control select");
  await mode.selectOption("simple");

  const advanced = page.locator(".tariff-engineering-details");
  await expect(advanced).toBeVisible();
  await expect(advanced).toHaveJSProperty("open", false);
  await expect(page.getByLabel("Import price")).toBeVisible();
  await expect(page.getByLabel("Carbon factor")).toBeVisible();
  await expect(advanced.getByLabel("Demand averaging method")).toBeHidden();

  await advanced.locator(":scope > summary").click();
  await expect(advanced.getByLabel("Demand averaging method")).toBeVisible();
  await expect(
    advanced.getByRole("button", { name: "Add tariff band" }),
  ).toBeVisible();

  await mode.selectOption("engineering");
  await expect(advanced).toHaveJSProperty("open", true);
  await expect(advanced.getByLabel("Demand averaging method")).toBeVisible();
  await expect(page.getByLabel("Import price")).toBeVisible();
});

test("scenario baseline details follow the global detail mode", async ({
  page,
}) => {
  await page.goto("/#/scenarios");
  const mode = page.locator(".page-heading .detail-mode-control select");
  const differences = page.locator(".scenario-baseline-changes");

  await mode.selectOption("simple");
  await expect(differences).toBeVisible();
  await expect(differences).toHaveJSProperty("open", false);
  await expect(differences.locator(":scope > summary")).toContainText(
    "Changes from baseline",
  );

  await mode.selectOption("engineering");
  await expect(differences).toHaveJSProperty("open", true);
  await expect(
    differences.getByRole("columnheader", { name: "Object" }),
  ).toBeVisible();
});

test("dated comparison details follow the global detail mode", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".overview-banner")).toBeVisible();

  await page
    .getByRole("button", { name: "Add load", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Name", { exact: true })
    .fill("Detail mode test load");
  await dialog.getByLabel(/^Rating/).fill("1");
  await dialog.getByLabel(/^Operating hours/).fill("1");
  await dialog.getByLabel(/^Energy duty/).fill("1");
  await dialog.getByRole("button", { name: "Add load", exact: true }).click();
  await expect(page.locator(".load-table")).toBeVisible();

  await page
    .locator(".sidebar")
    .getByRole("button", { name: /^Scenarios & Optimization/ })
    .click();
  const mode = page.locator(".page-heading .detail-mode-control select");
  await mode.selectOption("simple");
  await page.getByRole("button", { name: "Run dated comparison" }).click();
  await expect(
    page.getByRole("button", { name: "Export dated comparison JSON" }),
  ).toBeVisible();

  const details = page.locator(".dated-comparison-assumptions");
  await expect(details).toBeVisible();
  await expect(details).toHaveJSProperty("open", false);
  await expect(details.locator(":scope > summary")).toContainText(
    "Methods, assumptions and unresolved checks",
  );

  await mode.selectOption("engineering");
  await expect(details).toHaveJSProperty("open", true);
  await expect(
    page.getByRole("button", { name: "Export dated comparison JSON" }),
  ).toBeVisible();
});
