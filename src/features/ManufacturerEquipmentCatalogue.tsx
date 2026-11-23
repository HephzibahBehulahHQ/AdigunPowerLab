import { useContext, useState } from "react";
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
  "solar-and-wind-equipment": "Solar and wind equipment",
  "protection-devices": "Protection devices",
} as const;

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
    ({ manufacturer, model, category: key }) =>
      (!category || category === key) &&
      terms.every((term) =>
        `${manufacturer} ${model}`.toLowerCase().includes(term),
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
          ) : (
            <dl className="pg-metrics">
              <div>
                <dt>Iₙ</dt>
                <dd>{format.format(record.ratings.ratedCurrentA)} A</dd>
              </div>
              <div>
                <dt>iC60N</dt>
                <dd>
                  {record.ratings.poles}P · {record.ratings.curve}
                </dd>
              </div>
              <div>
                <dt>Icn · IEC/EN 60898-1</dt>
                <dd>
                  {record.ratings.icnKA} kA · {record.conditions.icnVoltageV} V
                  AC
                </dd>
              </div>
            </dl>
          )}
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
