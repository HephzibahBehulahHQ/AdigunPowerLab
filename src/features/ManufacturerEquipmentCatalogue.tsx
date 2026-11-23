import { Fragment, useContext, useState } from "react";
import { componentBankCsv, componentBank } from "../data/componentBank";
import { downloadFile } from "../import-export/files";
import { LanguageContext, useT } from "../i18n";
import { newId } from "../domain/project";
import type { Project } from "../domain/types";

const copy = {
  en: [
    "Manufacturer equipment",
    "Search manufacturer or model",
    "Inspect model",
    "No matching equipment",
    "Open datasheet",
    "Export record JSON",
    "Export record CSV",
  ],
  de: [
    "Herstellergeräte",
    "Hersteller oder Modell suchen",
    "Modell prüfen",
    "Keine passenden Geräte",
    "Datenblatt öffnen",
    "Datensatz als JSON exportieren",
    "Datensatz als CSV exportieren",
  ],
  yo: [
    "Ohun èlò olupese",
    "Wá olupese tàbí model",
    "Ṣàyẹ̀wò model",
    "Kò sí ohun èlò tó bá mu",
    "Ṣí datasheet",
    "Gbé àkọsílẹ̀ JSON jáde",
    "Gbé àkọsílẹ̀ CSV jáde",
  ],
  pcm: [
    "Manufacturer equipment",
    "Search manufacturer or model",
    "Check model",
    "No equipment match",
    "Open datasheet",
    "Export record JSON",
    "Export record CSV",
  ],
} as const;

const projectCopy = {
  en: [
    "Add to project equipment",
    "Project equipment",
    "Equipment name",
    "Quantity",
    "Remove",
    "Project equipment quantities feed the bill of materials. Electrical studies use their own reviewed inputs.",
  ],
  de: [
    "Zur Projektausrüstung hinzufügen",
    "Projektausrüstung",
    "Gerätename",
    "Menge",
    "Entfernen",
    "Die Projektmengen fließen in die Stückliste ein. Elektrische Studien verwenden separat geprüfte Eingaben.",
  ],
  yo: [
    "Fi kún ohun èlò iṣẹ́",
    "Ohun èlò iṣẹ́",
    "Orúkọ ohun èlò",
    "Iye",
    "Yọ kúrò",
    "Iye ohun èlò wọ bill of materials. Ìṣírò iná lo àwọn input tí a ṣàyẹ̀wò lọ́tọ̀.",
  ],
  pcm: [
    "Add to project equipment",
    "Project equipment",
    "Equipment name",
    "Quantity",
    "Remove",
    "Project quantities enter bill of materials. Electrical studies use their own reviewed inputs.",
  ],
} as const;

const pageSize = 50;
const categories = [...new Set(componentBank.map(({ category }) => category))];
const categoryLabels = {
  "inverters-and-conversion-equipment": "Inverters and conversion equipment",
  "ev-charging-equipment": "EV charging equipment",
  "drives-and-starting-equipment": "Drives and starting equipment",
  "cables-and-conductors": "Cables and conductors",
  generators: "Generators",
  "lighting-equipment": "Lighting equipment",
  "enclosures-and-installation-hardware":
    "Enclosures and installation hardware",
  "ups-and-backup-systems": "UPS and backup systems",
  "batteries-and-storage-systems": "Batteries and storage systems",
  transformers: "Transformers",
  "solar-and-wind-equipment": "Solar and wind equipment",
  "protection-devices": "Protection devices",
  "switching-and-transfer-equipment": "Switching and transfer equipment",
  "metering-and-power-quality": "Metering and power quality",
  "monitoring-and-sensors": "Monitoring and sensors",
  "busbars-and-distribution-systems": "Busbars and distribution systems",
  "earthing-and-bonding-equipment": "Earthing and bonding equipment",
} as const;

const missingFieldLabels: Record<string, string> = {
  "verified-inverter-model-mapping": "Verified inverter calculation mapping",
  "verified-evse-model-mapping": "Verified EV charger calculation mapping",
  "verified-drive-model-mapping": "Verified drive calculation mapping",
  "drive-auxiliary-terminals": "Drive auxiliary terminals",
  "cable-ampacity-and-impedance": "Cable ampacity and impedance",
  "verified-alternator-model-mapping":
    "Verified alternator calculation mapping",
  "verified-cable-model-mapping": "Verified cable calculation mapping",
  "verified-lighting-model-mapping": "Verified lighting calculation mapping",
  "enclosure-bonding-points": "Documented enclosure bonding points",
  "enclosure-thermal-model": "Verified enclosure thermal model",
  "verified-ups-model-mapping": "Verified UPS calculation mapping",
  "battery-and-dry-contact-pinouts": "Battery and dry-contact pinouts",
  "verified-storage-model-mapping": "Verified storage calculation mapping",
  "verified-transformer-model-mapping":
    "Verified transformer calculation mapping",
  "model-specific-bonding-terminal-review":
    "Model-specific bonding terminal review",
  "verified-bonding-model-mapping": "Verified bonding calculation mapping",
  "separate-order-code": "Separate order code",
  "specific-connector-on-delivered-module": "Connector on the delivered module",
  "regional-availability": "Regional availability",
  "verified-protection-model-mapping":
    "Verified protection calculation mapping",
  "verified-switching-model-mapping": "Verified switching calculation mapping",
  "verified-metering-model-mapping": "Verified metering calculation mapping",
  "verified-monitoring-model-mapping":
    "Verified monitoring calculation mapping",
  "contact-current-by-load-category": "Contact current by load category",
  "verified-distribution-model-mapping":
    "Verified distribution calculation mapping",
};

export function ManufacturerEquipmentCatalogue({
  project,
  change,
}: {
  project: Project;
  change: (mutator: (draft: Project) => void) => boolean | void;
}) {
  const locale = useContext(LanguageContext);
  const t = useT();
  const [title, search, inspect, empty, source, exportLabel, exportCsvLabel] =
    copy[locale];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const terms = query.trim().toLowerCase().split(/\s+/);
  const matches = componentBank.filter(
    ({ manufacturer, model, orderCode, category: key }) =>
      (!category || category === key) &&
      terms.every((term) =>
        `${manufacturer} ${model} ${orderCode ?? ""}`
          .toLowerCase()
          .includes(term),
      ),
  );
  const start = page * pageSize;
  const visible = matches.slice(start, start + pageSize);
  const record = visible.find(({ id }) => id === selectedId) ?? visible[0];
  const format = new Intl.NumberFormat(locale);
  const [add, projectTitle, name, quantity, remove, scope] =
    projectCopy[locale];
  return (
    <section
      className="panel panel-pad"
      aria-labelledby="manufacturer-equipment-title"
    >
      <h3 id="manufacturer-equipment-title">{title}</h3>
      <label className="pg-field">
        <span>{search}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            setPage(0);
          }}
        />
      </label>
      <label className="pg-field">
        <span>{t("Equipment category")}</span>
        <select
          value={category}
          onChange={(event) => {
            setCategory(event.currentTarget.value);
            setPage(0);
          }}
        >
          <option value="">{t("All categories")}</option>
          {categories.map((key) => (
            <option key={key} value={key}>
              {t(categoryLabels[key])}
            </option>
          ))}
        </select>
      </label>
      {record ? (
        <>
          {matches.length > pageSize && (
            <div className="button-row">
              <button
                type="button"
                className="button"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                {t("Previous records")}
              </button>
              <span aria-live="polite">
                {format.format(start + 1)}–
                {format.format(Math.min(start + pageSize, matches.length))} /{" "}
                {format.format(matches.length)}
              </span>
              <button
                type="button"
                className="button"
                disabled={start + pageSize >= matches.length}
                onClick={() => setPage(page + 1)}
              >
                {t("Next records")}
              </button>
            </div>
          )}
          <label className="pg-field">
            <span>{inspect}</span>
            <select
              value={record.id}
              onChange={(event) => setSelectedId(event.currentTarget.value)}
            >
              {visible.map(({ id, manufacturer, model }) => (
                <option key={id} value={id}>
                  {manufacturer} {model}
                </option>
              ))}
            </select>
          </label>
          {record.connection === "dc" ? (
            <dl className="pg-metrics">
              <div>
                <dt>Pmax · STC</dt>
                <dd>{format.format(record.ratings.powerW)} W</dd>
              </div>
              <div>
                <dt>Vmp · STC</dt>
                <dd>{format.format(record.ratings.vmpV)} V</dd>
              </div>
              <div>
                <dt>Imp · STC</dt>
                <dd>{format.format(record.ratings.impA)} A</dd>
              </div>
            </dl>
          ) : record.function === "residual-current-circuit-breaker" ? (
            <dl className="pg-metrics">
              <div>
                <dt>Iₙ</dt>
                <dd>
                  {format.format(record.ratings.ratedCurrentA)} A ·{" "}
                  {record.ratings.poles}P
                </dd>
              </div>
              <div>
                <dt>IΔn · {record.conditions.residualCurrentType}</dt>
                <dd>
                  {format.format(record.ratings.tripSensitivityMA)} mA
                  {record.ratings.selective ? " · S" : ""}
                </dd>
              </div>
              <div>
                <dt>Ue · IEC/EN 61008-1</dt>
                <dd>
                  {record.conditions.ratedVoltageMinV}
                  {record.conditions.ratedVoltageMinV !==
                    record.conditions.ratedVoltageMaxV &&
                    `–${record.conditions.ratedVoltageMaxV}`}{" "}
                  V AC
                </dd>
              </div>
            </dl>
          ) : record.function === "direct-energy-meter" ? (
            <dl className="pg-metrics">
              <div>
                <dt>Imax</dt>
                <dd>{format.format(record.ratings.maxCurrentA)} A</dd>
              </div>
              <div>
                <dt>U</dt>
                <dd>{record.ratings.voltageV} V AC</dd>
              </div>
              {record.ratings.pulsesPerKWh && (
                <div>
                  <dt>S0</dt>
                  <dd>{record.ratings.pulsesPerKWh} imp/kWh</dd>
                </div>
              )}
              {record.conditions.marketRestriction && (
                <div>
                  <dt>{t("Regional availability")}</dt>
                  <dd>{t(record.conditions.marketRestriction)}</dd>
                </div>
              )}
            </dl>
          ) : record.function === "modular-contactor" ? (
            <dl className="pg-metrics">
              <div>
                <dt>AC-7a</dt>
                <dd>{format.format(record.ratings.ac7aA)} A</dd>
              </div>
              <div>
                <dt>AC-7b</dt>
                <dd>{format.format(record.ratings.ac7bA)} A</dd>
              </div>
              <div>
                <dt>Uc</dt>
                <dd>
                  {record.ratings.coilMinV}–{record.ratings.coilMaxV} V AC
                </dd>
              </div>
            </dl>
          ) : record.function === "phase-monitoring-relay" ? (
            <dl className="pg-metrics">
              <div>
                <dt>U</dt>
                <dd>
                  {record.ratings.voltageMinV}–{record.ratings.voltageMaxV} V AC
                </dd>
              </div>
              <div>
                <dt>{t("Relay output")}</dt>
                <dd>
                  {record.ratings.changeoverContacts} CO ·{" "}
                  {record.ratings.catalogueContactCurrentA} A
                </dd>
              </div>
            </dl>
          ) : record.function === "single-pole-distribution-block" ? (
            <dl className="pg-metrics">
              <div>
                <dt>Iₙ</dt>
                <dd>{format.format(record.ratings.ratedCurrentA)} A</dd>
              </div>
              <div>
                <dt>Ipk</dt>
                <dd>{format.format(record.ratings.ipkKA)} kA</dd>
              </div>
              <div>
                <dt>Icw</dt>
                <dd>{format.format(record.ratings.icwKA)} kA · 1 s</dd>
              </div>
            </dl>
          ) : record.function === "protective-earth-bar" ? (
            <dl className="pg-metrics">
              <div>
                <dt>Icw</dt>
                <dd>
                  {record.ratings.icwKA} kA rms ·{" "}
                  {format.format(record.conditions.icwDurationSeconds)} s
                </dd>
              </div>
              <div>
                <dt>L</dt>
                <dd>{record.ratings.lengthMm} mm</dd>
              </div>
              <div>
                <dt>{t("Documented terminals")}</dt>
                <dd>{record.terminals.length}</dd>
              </div>
            </dl>
          ) : record.function === "single-phase-control-transformer" ? (
            <dl className="pg-metrics">
              <div>
                <dt>{t("Apparent power")}</dt>
                <dd>{format.format(record.ratings.apparentVA)} VA</dd>
              </div>
              <div>
                <dt>{t("Primary voltage")}</dt>
                <dd>{record.ratings.primaryV.join(" / ")} V AC</dd>
              </div>
              <div>
                <dt>{t("Secondary voltage")}</dt>
                <dd>
                  {"secondaryWindings" in record.ratings
                    ? `${record.ratings.secondaryWindings} × `
                    : ""}
                  {record.ratings.secondaryV} V AC
                </dd>
              </div>
            </dl>
          ) : record.function === "agm-storage-battery" ? (
            <dl className="pg-metrics">
              <div>
                <dt>U</dt>
                <dd>{record.ratings.nominalV} V DC</dd>
              </div>
              <div>
                <dt>C5 / C10 / C20</dt>
                <dd>
                  {record.ratings.c5Ah} / {record.ratings.c10Ah} /{" "}
                  {record.ratings.c20Ah} Ah
                </dd>
              </div>
              <div>
                <dt>{t("Discharge cutoff")}</dt>
                <dd>{format.format(record.conditions.dischargeCutoffV)} V</dd>
              </div>
            </dl>
          ) : record.function === "line-interactive-ups" ? (
            <dl className="pg-metrics">
              <div>
                <dt>{t("Apparent power")}</dt>
                <dd>{format.format(record.ratings.outputVA)} VA</dd>
              </div>
              <div>
                <dt>{t("Rated output")}</dt>
                <dd>{format.format(record.ratings.outputW)} W</dd>
              </div>
              <div>
                <dt>U</dt>
                <dd>{record.ratings.outputNominalV} V AC</dd>
              </div>
            </dl>
          ) : record.function === "standalone-dc-ac-inverter" ? (
            <dl className="pg-metrics">
              <div>
                <dt>25 °C</dt>
                <dd>{format.format(record.ratings.continuousW25C)} W</dd>
              </div>
              <div>
                <dt>40 °C</dt>
                <dd>{format.format(record.ratings.continuousW40C)} W</dd>
              </div>
              <div>
                <dt>DC → AC</dt>
                <dd>
                  {record.ratings.inputNominalV} V DC →{" "}
                  {record.ratings.outputNominalV} V AC
                </dd>
              </div>
            </dl>
          ) : record.function === "recessed-led-downlight" ? (
            <dl className="pg-metrics">
              <div>
                <dt>P</dt>
                <dd>{format.format(record.ratings.powerW)} W</dd>
              </div>
              <div>
                <dt>Φ</dt>
                <dd>{format.format(record.ratings.luminousFluxLm)} lm</dd>
              </div>
              <div>
                <dt>CCT</dt>
                <dd>{format.format(record.ratings.colorTemperatureK)} K</dd>
              </div>
            </dl>
          ) : record.function === "wall-mounted-enclosure" ? (
            <dl className="pg-metrics">
              <div>
                <dt>H × W × D</dt>
                <dd>
                  {record.ratings.heightMm} × {record.ratings.widthMm} ×{" "}
                  {record.ratings.depthMm} mm
                </dd>
              </div>
              <div>
                <dt>IP · IK</dt>
                <dd>
                  {record.ratings.ingressProtection} ·{" "}
                  {record.ratings.impactProtection}
                </dd>
              </div>
            </dl>
          ) : record.function === "synchronous-alternator" ? (
            <dl className="pg-metrics">
              <div>
                <dt>125/40</dt>
                <dd>
                  {format.format(record.ratings.continuousKva125Over40)} kVA
                </dd>
              </div>
              <div>
                <dt>105/40</dt>
                <dd>
                  {format.format(record.ratings.continuousKva105Over40)} kVA
                </dd>
              </div>
              <div>
                <dt>Ue</dt>
                <dd>
                  {record.ratings.ratedLineV.join("/")} V AC ·{" "}
                  {record.conditions.frequencyHz} Hz
                </dd>
              </div>
            </dl>
          ) : record.function === "multicore-control-cable" ? (
            <dl className="pg-metrics">
              <div>
                <dt>{t("Cable cores")}</dt>
                <dd>
                  {record.ratings.coreCount}
                  {record.ratings.hasPe ? " · PE" : ""}
                </dd>
              </div>
              <div>
                <dt>A</dt>
                <dd>{format.format(record.ratings.crossSectionMm2)} mm²</dd>
              </div>
              <div>
                <dt>Ø</dt>
                <dd>{format.format(record.ratings.outerDiameterIn)} in</dd>
              </div>
              <div>
                <dt>U₀/U</dt>
                <dd>
                  {record.ratings.nominalU0V}/{record.ratings.nominalUV} V
                </dd>
              </div>
            </dl>
          ) : record.function === "variable-speed-drive" ? (
            <dl className="pg-metrics">
              <div>
                <dt>{t("Rated output")}</dt>
                <dd>{format.format(record.ratings.motorKW)} kW</dd>
              </div>
              <div>
                <dt>Iₙ</dt>
                <dd>{format.format(record.ratings.continuousOutputA)} A</dd>
              </div>
              <div>
                <dt>Ue</dt>
                <dd>
                  {record.ratings.supplyMinV}–{record.ratings.supplyMaxV} V AC ·{" "}
                  {record.ratings.supplyPhases}P
                </dd>
              </div>
            </dl>
          ) : record.function === "ac-ev-charging-station" ? (
            <dl className="pg-metrics">
              <div>
                <dt>{t("Rated output")}</dt>
                <dd>{format.format(record.ratings.powerKW)} kW</dd>
              </div>
              <div>
                <dt>Iₙ</dt>
                <dd>
                  {record.ratings.ratedCurrentA} A · {record.ratings.phases}P
                </dd>
              </div>
              <div>
                <dt>RDC-DD</dt>
                <dd>{record.ratings.rdcDdMilliamp} mA</dd>
              </div>
            </dl>
          ) : record.function !== "miniature-circuit-breaker" ? (
            <dl className="pg-metrics">
              <div>
                <dt>Iₙ</dt>
                <dd>
                  {format.format(record.ratings.ratedCurrentA)} A ·{" "}
                  {record.ratings.poles}P
                </dd>
              </div>
              <div>
                <dt>Ue</dt>
                <dd>{record.ratings.voltageV} V AC</dd>
              </div>
            </dl>
          ) : (
            <dl className="pg-metrics">
              <div>
                <dt>Iₙ</dt>
                <dd>{format.format(record.ratings.ratedCurrentA)} A</dd>
              </div>
              <div>
                <dt>{record.ratings.family ?? "iC60N"}</dt>
                <dd>
                  {record.ratings.poles}P · {record.ratings.curve}
                </dd>
              </div>
              <div>
                <dt>Icn · IEC/EN 60898-1</dt>
                <dd>
                  {record.ratings.icnKA === null
                    ? t("Not available")
                    : `${record.ratings.icnKA} kA · ${record.conditions.icnVoltageV} V AC`}
                </dd>
              </div>
            </dl>
          )}
          <details>
            <summary>{t("Source, terminals and model readiness")}</summary>
            <dl className="detail-list">
              <dt>{t("Source revision")}</dt>
              <dd>
                {record.source.revision} · {t("Page")}{" "}
                {"pageLabel" in record.source
                  ? record.source.pageLabel
                  : record.source.page}
              </dd>
              {"supplemental" in record.source &&
                record.source.supplemental.map((document) => (
                  <Fragment key={document.url}>
                    <dt>{t("Supplemental manufacturer document")}</dt>
                    <dd>
                      <a href={document.url} target="_blank" rel="noreferrer">
                        {document.revision} · {t("Page")} {document.page}
                      </a>
                    </dd>
                  </Fragment>
                ))}
              <dt>{t("Model readiness")}</dt>
              <dd>
                {t(
                  record.modelMapping
                    ? "PV worksheet inputs reviewed"
                    : "Inventory and diagram only",
                )}
              </dd>
            </dl>
            {record.modelMapping && (
              <dl className="detail-list">
                <dt>{t("DC nameplate power")}</dt>
                <dd>{format.format(record.modelMapping.dcNameplateKW)} kW</dd>
                <dt>{t("Power temperature coefficient")}</dt>
                <dd>
                  {format.format(
                    record.modelMapping.powerTemperatureCoefficientPerC * 100,
                  )}{" "}
                  %/°C
                </dd>
              </dl>
            )}
            <h4>{t("Documented terminals")}</h4>
            <ul>
              {record.terminals.map(({ id, group, connector }) => (
                <li key={id}>
                  {group} · {connector}
                </li>
              ))}
            </ul>
            <h4>{t("Missing or unverified fields")}</h4>
            <ul>
              {record.missingFields.map((field) => (
                <li key={field}>{t(missingFieldLabels[field] ?? field)}</li>
              ))}
            </ul>
          </details>
          <div className="button-row">
            <button
              type="button"
              className="button"
              disabled={(project.catalogueEquipment?.length ?? 0) >= 10000}
              onClick={() => {
                const instance = {
                  id: newId("equipment-instance"),
                  catalogueId: record.id,
                  manufacturer: record.manufacturer,
                  model: record.model,
                  sourceUrl: record.source.url,
                  sourceRevision: record.source.revision,
                  sourcePage: record.source.page,
                  ...("pageLabel" in record.source
                    ? { sourcePageLabel: record.source.pageLabel }
                    : {}),
                  ...(record.orderCode ? { orderCode: record.orderCode } : {}),
                  name: record.model,
                  quantity: 1,
                };
                change((draft) => {
                  (draft.catalogueEquipment ??= []).push(instance);
                });
              }}
            >
              {add}
            </button>
            <a href={record.source.url} target="_blank" rel="noreferrer">
              {source}
            </a>
            <button
              className="button"
              type="button"
              onClick={() =>
                downloadFile(
                  "component-bank-" + record.model + ".json",
                  JSON.stringify({ schemaVersion: 1, entry: record }, null, 2),
                  "application/json",
                )
              }
            >
              {exportLabel}
            </button>
            <button
              className="button"
              type="button"
              onClick={() =>
                downloadFile(
                  `component-bank-${record.model}.csv`,
                  componentBankCsv([record]),
                  "text/csv;charset=utf-8",
                )
              }
            >
              {exportCsvLabel}
            </button>
          </div>
        </>
      ) : (
        <p role="status">{empty}</p>
      )}
      {(project.catalogueEquipment?.length ?? 0) > 0 && (
        <section aria-labelledby="catalogue-instances-title">
          <h4 id="catalogue-instances-title">{projectTitle}</h4>
          <p>{scope}</p>
          {project.catalogueEquipment?.map((instance) => (
            <div className="pg-fields" key={instance.id}>
              <a href={instance.sourceUrl} target="_blank" rel="noreferrer">
                {instance.manufacturer} {instance.model}
              </a>
              <label className="pg-field">
                <span>{name}</span>
                <input
                  key={instance.name}
                  defaultValue={instance.name}
                  maxLength={256}
                  onBlur={(event) => {
                    const value = event.currentTarget.value.trim();
                    if (!value || value === instance.name) {
                      event.currentTarget.value = instance.name;
                      return;
                    }
                    change((draft) => {
                      const row = draft.catalogueEquipment?.find(
                        ({ id }) => id === instance.id,
                      );
                      if (row) row.name = value;
                    });
                  }}
                />
              </label>
              <label className="pg-field">
                <span>{quantity}</span>
                <input
                  key={instance.quantity}
                  type="number"
                  min={1}
                  max={10000}
                  step={1}
                  defaultValue={instance.quantity}
                  onBlur={(event) => {
                    const value = event.currentTarget.valueAsNumber;
                    if (
                      !Number.isInteger(value) ||
                      value < 1 ||
                      value > 10000 ||
                      value === instance.quantity
                    ) {
                      event.currentTarget.value = String(instance.quantity);
                      return;
                    }
                    change((draft) => {
                      const row = draft.catalogueEquipment?.find(
                        ({ id }) => id === instance.id,
                      );
                      if (row) row.quantity = value;
                      draft.equipmentTerminalConnections =
                        draft.equipmentTerminalConnections?.filter(
                          ({ from, to }) =>
                            (from.instanceId !== instance.id ||
                              from.unit <= value) &&
                            (to.instanceId !== instance.id || to.unit <= value),
                        );
                    });
                  }}
                />
              </label>
              <button
                className="button"
                type="button"
                onClick={() =>
                  change((draft) => {
                    draft.catalogueEquipment = draft.catalogueEquipment?.filter(
                      ({ id }) => id !== instance.id,
                    );
                    draft.equipmentTerminalConnections =
                      draft.equipmentTerminalConnections?.filter(
                        ({ from, to }) =>
                          from.instanceId !== instance.id &&
                          to.instanceId !== instance.id,
                      );
                  })
                }
              >
                {remove}
              </button>
            </div>
          ))}
        </section>
      )}
    </section>
  );
}
