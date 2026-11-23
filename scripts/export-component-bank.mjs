import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { coverage } from "./component-bank-coverage.mjs";
import {
  componentBankCsv,
  componentBank,
  pvModules,
  ic60nBreakers,
  ic60hBreakers,
  ic60lBreakers,
  iidRccbs,
  iswSwitches,
  iemMeters,
  ictContactors,
  rm17Relays,
  linergyDsBlocks,
  linergyEarthBars,
  abl6Transformers,
} from "../src/data/componentBank.ts";
import { join } from "node:path";

const serialize = (data) => JSON.stringify(data, null, 2) + "\n";
const batches = {
  pv: pvModules,
  ic60n: ic60nBreakers,
  ic60h: ic60hBreakers,
  ic60l: ic60lBreakers,
  iid: iidRccbs,
  isw: iswSwitches,
  iem: iemMeters,
  ict: ictContactors,
  rm17: rm17Relays,
  linergy: linergyDsBlocks,
  "linergy-tb": linergyEarthBars,
  abl6: abl6Transformers,
};
for (const [batch, entries] of Object.entries(batches)) {
  writeFileSync(
    new URL(`../docs/component-bank-${batch}.json`, import.meta.url),
    serialize({ schemaVersion: 1, entries }),
  );
  writeFileSync(
    new URL(`../docs/component-bank-${batch}.csv`, import.meta.url),
    componentBankCsv(entries),
  );
}
writeFileSync(
  new URL("../docs/component-bank-coverage.json", import.meta.url),
  serialize(coverage),
);

if (process.argv.includes("--individual")) {
  const destination = fileURLToPath(
    new URL("../output/component-bank/", import.meta.url),
  );
  mkdirSync(destination, { recursive: true });
  const directory = mkdtempSync(join(destination, "entries-"));
  const files = componentBank.map((entry, index) => {
    // Numbered filenames avoid platform restrictions and path collisions.
    const name = String(index + 1).padStart(5, "0");
    const json = `${name}.json`;
    const csv = `${name}.csv`;
    writeFileSync(
      join(directory, json),
      serialize({ schemaVersion: 1, entry }),
    );
    writeFileSync(join(directory, csv), componentBankCsv([entry]));
    return { id: entry.id, json, csv };
  });
  writeFileSync(
    join(directory, "index.json"),
    serialize({ schemaVersion: 1, files }),
  );
  console.log(directory);
}
