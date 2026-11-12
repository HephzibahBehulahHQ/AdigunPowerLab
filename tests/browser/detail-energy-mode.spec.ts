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
