import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
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
  iem205xMeters,
  iem24xxMeters,
  ictContactors,
  rm17Relays,
  linergyDsBlocks,
  linergyDsFourPoleBlocks,
  linergyNeutralBars,
  linergyEarthBars,
  phoenixPtPeTerminals,
  abl6Transformers,
  abt7pduTransformers,
  victronAgmSuperCycle,
  apcSmvUps,
  victronVeDirect230,
  victronVeDirect120,
  evlinkHomeStations,
  altivar320CompactDrives,
  olflexClassic110Cables,
  olflexClassic110CyCables,
  olflexClassic100750Cables,
  olflexClassic100500Cables,
  olflexClassic110BlackCables,
  olflexClassic110HCables,
  olflexClassic110ChCables,
  olflexClassic115CyCables,
  olflexClassic130HCables,
  stamfordWinding311Alternators,
  spacialS3hdEnclosures,
  philipsDn145bDownlights,
  philipsDn145bPsuDownlights,
  wegW22Motors,
  wegW22NemaMotors,
  chromaloxStripHeaters,
  stamfordAs480Regulators,
} from "../src/data/componentBank.ts";
import { join } from "node:path";

const serialize = (data) => JSON.stringify(data, null, 2) + "\n";
const checkOnly = process.argv.includes("--check");
const exportIndividual = process.argv.includes("--individual");
if (checkOnly && exportIndividual) {
  throw new Error("Use --check and --individual in separate runs.");
}
const staleDocuments = [];
function writeCatalogueDocument(path, contents) {
  const existing = existsSync(path) ? readFileSync(path, "utf8") : "";
  const normalizeNewlines = (value) => value.replaceAll("\r\n", "\n");
  if (normalizeNewlines(existing) !== normalizeNewlines(contents)) {
    if (checkOnly) {
      staleDocuments.push(fileURLToPath(path));
    } else {
      writeFileSync(path, contents);
    }
  }
}
const batches = {
  pv: pvModules,
  ic60n: ic60nBreakers,
  ic60h: ic60hBreakers,
  ic60l: ic60lBreakers,
  iid: iidRccbs,
  isw: iswSwitches,
  iem: iemMeters,
  iem205x: iem205xMeters,
  iem24xx: iem24xxMeters,
  ict: ictContactors,
  rm17: rm17Relays,
  linergy: linergyDsBlocks,
  "linergy-four-pole": linergyDsFourPoleBlocks,
  "linergy-neutral-bars": linergyNeutralBars,
  "linergy-tb": linergyEarthBars,
  "phoenix-pt-pe": phoenixPtPeTerminals,
  abl6: abl6Transformers,
  abt7pdu: abt7pduTransformers,
  "victron-agm": victronAgmSuperCycle,
  "apc-smv": apcSmvUps,
  "victron-vedirect-230": victronVeDirect230,
  "victron-vedirect-120": victronVeDirect120,
  "evlink-home": evlinkHomeStations,
  "altivar-320-compact": altivar320CompactDrives,
  "lapp-olflex-110": olflexClassic110Cables,
  "lapp-olflex-110-cy": olflexClassic110CyCables,
  "lapp-olflex-100-750": olflexClassic100750Cables,
  "lapp-olflex-100-500": olflexClassic100500Cables,
  "lapp-olflex-110-black": olflexClassic110BlackCables,
  "lapp-olflex-110-h": olflexClassic110HCables,
  "lapp-olflex-110-ch": olflexClassic110ChCables,
  "lapp-olflex-115-cy": olflexClassic115CyCables,
  "lapp-olflex-130-h": olflexClassic130HCables,
  "stamford-winding-311": stamfordWinding311Alternators,
  "spacial-s3hd": spacialS3hdEnclosures,
  "philips-dn145b": philipsDn145bDownlights,
  "philips-dn145b-psu": philipsDn145bPsuDownlights,
  "weg-w22": wegW22Motors,
  "weg-w22-nema": wegW22NemaMotors,
  "chromalox-ns-nsl": chromaloxStripHeaters,
  "stamford-as480": stamfordAs480Regulators,
};
const unexported = new Set(componentBank);
for (const [batch, entries] of Object.entries(batches)) {
  for (const entry of entries) {
    if (!unexported.delete(entry)) {
      throw new Error(
        `Batch ${batch} has a duplicate or unknown record: ${entry.id}`,
      );
    }
  }
}
if (unexported.size > 0) {
  throw new Error(
    `Batch exports omit: ${[...unexported].map(({ id }) => id).join(", ")}`,
  );
}

for (const [batch, entries] of Object.entries(batches)) {
  writeCatalogueDocument(
    new URL(`../docs/component-bank-${batch}.json`, import.meta.url),
    serialize({ schemaVersion: 1, entries }),
  );
  writeCatalogueDocument(
    new URL(`../docs/component-bank-${batch}.csv`, import.meta.url),
    componentBankCsv(entries),
  );
}
writeCatalogueDocument(
  new URL("../docs/component-bank-coverage.json", import.meta.url),
  serialize(coverage),
);

if (staleDocuments.length > 0) {
  throw new Error(
    `Regenerate the stale catalogue exports:\n${staleDocuments.join("\n")}`,
  );
}
if (checkOnly) {
  console.log(`Catalogue exports match all ${componentBank.length} records.`);
}

if (exportIndividual) {
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
