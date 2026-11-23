import { writeFileSync } from "node:fs";
import { pvModules } from "../src/data/componentBank.ts";

const columns = Object.keys(pvModules[0]);
const csvField = (value) => {
  const serialized =
    typeof value === "object" && value !== null
      ? JSON.stringify(value)
      : String(value ?? "");
  return `"${serialized.replaceAll('"', '""')}"`;
};
const rows = pvModules.map((record) =>
  columns.map((column) => csvField(record[column])).join(","),
);
writeFileSync(
  new URL("../docs/component-bank-pv.json", import.meta.url),
  JSON.stringify({ schemaVersion: 1, entries: pvModules }, null, 2) + "\n",
);
writeFileSync(
  new URL("../docs/component-bank-pv.csv", import.meta.url),
  [columns.join(","), ...rows].join("\r\n") + "\r\n",
);
