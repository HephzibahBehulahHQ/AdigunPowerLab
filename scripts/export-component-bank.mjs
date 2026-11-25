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
  ictContactors,
  rm17Relays,
  linergyDsBlocks,
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
  stamfordWinding311Alternators,
  spacialS3hdEnclosures,
  philipsDn145bDownlights,
  wegW22Motors,
  wegW22NemaMotors,
  chromaloxStripHeaters,
  stamfordAs480Regulators,
} from "../src/data/componentBank.ts";
import { join } from "node:path";

const serialize = (data) => JSON.stringify(data, null, 2) + "\n";
function writeCatalogueDocument(path, contents) {
  const existing = existsSync(path) ? readFileSync(path, "utf8") : "";
  const normalizeNewlines = (value) => value.replaceAll("\r\n", "\n");
  if (normalizeNewlines(existing) !== normalizeNewlines(contents)) {
    writeFileSync(path, contents);
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
  ict: ictContactors,
  rm17: rm17Relays,
  linergy: linergyDsBlocks,
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
  "stamford-winding-311": stamfordWinding311Alternators,
  "spacial-s3hd": spacialS3hdEnclosures,
  "philips-dn145b": philipsDn145bDownlights,
  "weg-w22": wegW22Motors,
  "weg-w22-nema": wegW22NemaMotors,
  "chromalox-ns-nsl": chromaloxStripHeaters,
  "stamford-as480": stamfordAs480Regulators,
};
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
