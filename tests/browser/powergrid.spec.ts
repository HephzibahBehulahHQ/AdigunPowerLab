import { expect, test } from "./fixtures";
import { readFile } from "node:fs/promises";

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
});
