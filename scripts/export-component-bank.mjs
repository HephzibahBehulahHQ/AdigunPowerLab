import { writeFileSync } from "node:fs";
import {
  componentBankCsv,
  pvModules,
  ic60nBreakers,
} from "../src/data/componentBank.ts";
writeFileSync(
  new URL("../docs/component-bank-pv.json", import.meta.url),
  JSON.stringify({ schemaVersion: 1, entries: pvModules }, null, 2) + "\n",
);
writeFileSync(
  new URL("../docs/component-bank-pv.csv", import.meta.url),
  componentBankCsv(pvModules),
);
writeFileSync(
  new URL("../docs/component-bank-ic60n.json", import.meta.url),
  JSON.stringify({ schemaVersion: 1, entries: ic60nBreakers }, null, 2) + "\n",
);
writeFileSync(
  new URL("../docs/component-bank-ic60n.csv", import.meta.url),
  componentBankCsv(ic60nBreakers),
);
