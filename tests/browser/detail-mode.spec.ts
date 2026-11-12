import { test, expect } from "./fixtures";

test("simple and engineering modes present tool methods progressively", async ({
  page,
}) => {
  await page.goto("/#/tools");
  await expect(page.locator(".tool-item")).toHaveCount(51);
  const mode = page.locator(".detail-mode-control select");
  await mode.selectOption("simple");
  await page
    .locator(".tool-catalog .tool-item")
    .filter({ hasText: "T01" })
    .click();

  const form = page.locator(".tool-workspace form");
  await form.getByLabel(/^Voltage/).fill("230");
  await form.getByLabel(/^Resistance/).fill("23");
  await form.getByRole("button", { name: "Calculate", exact: true }).click();

  const result = page.locator(".tool-result");
  await expect(result.locator(".result-grid")).toContainText("10");
  const method = result.locator(".tool-formula");
  await expect(method).toBeVisible();
  await expect(method).toHaveJSProperty("open", false);
  await method.locator("summary").click();
  await expect(method.locator(".formula")).toContainText("I =");

  await mode.selectOption("engineering");
  await expect(method).toHaveJSProperty("open", true);
  await expect(form.getByLabel(/^Voltage/)).toHaveValue("230");
  await expect(form.getByLabel(/^Resistance/)).toHaveValue("23");
});
