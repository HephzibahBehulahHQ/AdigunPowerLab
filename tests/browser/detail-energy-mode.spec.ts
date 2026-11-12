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

  await advanced.locator("summary").click();
  await expect(advanced.getByLabel("Demand averaging method")).toBeVisible();
  await expect(advanced.getByRole("button", { name: "Add tariff band" })).toBeVisible();

  await mode.selectOption("engineering");
  await expect(advanced).toHaveJSProperty("open", true);
  await expect(advanced.getByLabel("Demand averaging method")).toBeVisible();
  await expect(page.getByLabel("Import price")).toBeVisible();
});
