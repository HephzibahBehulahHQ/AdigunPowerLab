import { writeFileSync } from "node:fs";
import { coverage } from "./component-bank-coverage.mjs";
import {
  componentBankCsv,
  pvModules,
  ic60nBreakers,
  iidRccbs,
  iswSwitches,
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
writeFileSync(
  new URL("../docs/component-bank-iid.json", import.meta.url),
  JSON.stringify({ schemaVersion: 1, entries: iidRccbs }, null, 2) + "\n",
);
writeFileSync(
  new URL("../docs/component-bank-iid.csv", import.meta.url),
  componentBankCsv(iidRccbs),
);
writeFileSync(
  new URL("../docs/component-bank-isw.json", import.meta.url),
  JSON.stringify({ schemaVersion: 1, entries: iswSwitches }, null, 2) + "\n",
);
writeFileSync(
  new URL("../docs/component-bank-isw.csv", import.meta.url),
  componentBankCsv(iswSwitches),
);
writeFileSync(
  new URL("../docs/component-bank-coverage.json", import.meta.url),
  JSON.stringify(coverage, null, 2) + "\n",
);
