import { preview } from "vite";
import { chromium } from "@playwright/test";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
const basePath = process.env.POWERLAB_BASE_PATH || "/";
const evidenceDir = process.env.POWERLAB_OFFLINE_EVIDENCE_DIR || "docs";
const appURL = "http://127.0.0.1:4178" + basePath;
const server = await preview({
  base: basePath,
  preview: { host: "127.0.0.1", port: 4178, strictPort: true },
});
let browser;
try {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  browser = await chromium.launch(
    executablePath
      ? {
          executablePath,
          args: ["--no-sandbox", "--no-zygote", "--single-process"],
        }
      : { headless: true },
  );
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const errors = [];
  const networkFailures = [];
  page.on("requestfailed", (r) =>
    networkFailures.push({ url: r.url(), failure: r.failure() }),
  );
  page.on("console", (m) => {
    if (m.type() === "error") console.log("browser-error", m.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(appURL);
  await page.locator(".overview-banner").waitFor();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  const powergridLoadedOnOverview = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .some(({ name }) => /\/PowerGridLab-[^/]+\.js(?:\?|$)/.test(name)),
  );
  if (powergridLoadedOnOverview)
    throw new Error("The PowerGrid module loaded on Overview.");
  await mkdir(join(evidenceDir, "screenshots"), { recursive: true });
  await page
    .getByRole("button", { name: "Add load", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Name", { exact: true })
    .fill("Offline analytical heater");
  await dialog.getByLabel(/^Rating/).fill("2.3");
  await dialog.getByRole("button", { name: "Add load", exact: true }).click();
  await page.waitForFunction(() =>
    document
      .querySelector(".save-badge")
      ?.textContent?.includes("Saved locally"),
  );
  console.log(
    "before-offline",
    await page.evaluate(() => ({
      hash: location.hash,
      save: document.querySelector(".save-badge")?.textContent,
      caches: !!navigator.serviceWorker.controller,
    })),
  );
  await context.setOffline(true);
  try {
    await page.reload();
    await page.locator(".load-table").waitFor({ timeout: 12000 });
  } catch (error) {
    await page.screenshot({
      path: join(evidenceDir, "screenshots", "offline-failure.png"),
      fullPage: true,
    });
    console.log(
      "offline-state",
      JSON.stringify({
        url: page.url(),
        body: (await page.locator("body").innerText()).slice(0, 1400),
        networkFailures,
        cacheState: await page.evaluate(async () => ({
          keys: await caches.keys(),
          urls: (await caches.open((await caches.keys())[0]))
            .keys()
            .then((rs) => rs.map((r) => r.url)),
          controlled: !!navigator.serviceWorker.controller,
        })),
        errors,
      }),
    );
    throw error;
  }
  if (
    !(await page.locator(".load-table").textContent()).includes(
      "Offline analytical heater",
    )
  )
    throw new Error("Offline saved project was not recovered.");
  await page
    .locator(".sidebar")
    .getByRole("button", { name: /^Engineering Toolbox/ })
    .click();
  await page.locator(".tool-item").first().click();
  await page
    .getByRole("button", { name: "Load worked example", exact: true })
    .click();
  await page
    .locator(".tool-workspace")
    .getByRole("button", { name: "Calculate", exact: true })
    .click();
  await page.locator(".tool-result").waitFor();
  await page.screenshot({
    path: join(evidenceDir, "screenshots", "offline-tool.png"),
    fullPage: true,
  });
  await page.goto(appURL + "#POWERGRID");
  await page
    .getByRole("heading", { name: "Why step up voltage?", exact: true })
    .waitFor();
  await page
    .getByRole("heading", { name: "Meshed AC power flow", exact: true })
    .waitFor();
  await page
    .locator('img[src$="powergrid-hydro-station-illustration.png"]')
    .first()
    .scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    [...document.images].some(
      (image) =>
        image.src.endsWith("powergrid-hydro-station-illustration.png") &&
        image.naturalWidth > 0,
    ),
  );
  const powergridPdf = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export lab report PDF", exact: true })
    .click();
  const report = await readFile(await (await powergridPdf).path());
  if (report.subarray(0, 5).toString("ascii") !== "%PDF-")
    throw new Error("Offline PowerGrid report is invalid");
  await page.goto(appURL + "#/overview");
  await page
    .locator(".sidebar")
    .getByRole("button", { name: "Reports & Estimates", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Customer bill", exact: true })
    .click();
  await page
    .getByLabel("Document number", { exact: true })
    .fill("OFFLINE-ANALYTICAL");
  await page
    .getByLabel("Supplier", { exact: true })
    .fill("Analytical test supplier");
  await page
    .getByLabel("Customer", { exact: true })
    .fill("Offline analytical fixture");
  await page.getByRole("button", { name: "Add line", exact: false }).click();
  await page
    .getByLabel("Description 1", { exact: true })
    .fill("Offline cable calculation");
  await page.getByLabel("Qty 1", { exact: true }).fill("2");
  await page.getByLabel("Unit price 1", { exact: true }).fill("10");
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF", exact: true }).click();
  const pdf = await readFile(await (await downloaded).path());
  if (pdf.subarray(0, 5).toString("ascii") !== "%PDF-")
    throw new Error("Offline PDF is invalid");
  const evidence = {
    basePath,
    offlineReload: true,
    savedProjectRecovered: true,
    toolCalculationOffline: true,
    lazyBillingOffline: true,
    pdfExportOffline: true,
    powergridRouteDeferred: !powergridLoadedOnOverview,
    powergridOfflineColdEntry: true,
    powergridPdfOffline: true,
    powergridImageOffline: true,
    serviceWorkerControlled: await page.evaluate(
      () => !!navigator.serviceWorker.controller,
    ),
    font: await page
      .locator("h3")
      .first()
      .evaluate((e) => getComputedStyle(e).fontFamily),
    errors,
    networkFailures,
  };
  await writeFile(
    join(evidenceDir, "offline-verification.json"),
    JSON.stringify(evidence, null, 2),
  );
  console.log(JSON.stringify(evidence));
  if (errors.length) throw new Error("Page errors: " + errors.join("; "));
  if (networkFailures.length)
    throw new Error(
      "Offline requests failed: " + JSON.stringify(networkFailures),
    );
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
