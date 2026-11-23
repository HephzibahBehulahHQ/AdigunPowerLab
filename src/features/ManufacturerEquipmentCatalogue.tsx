import { useContext, useState } from "react";
import { componentBankCsv, pvModules } from "../data/componentBank";
import { downloadFile } from "../import-export/files";
import { LanguageContext } from "../i18n";

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

export function ManufacturerEquipmentCatalogue() {
  const locale = useContext(LanguageContext);
  const [title, search, inspect, empty, source, exportLabel, exportCsvLabel] =
    copy[locale];
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const matches = pvModules.filter(({ manufacturer, model }) =>
    `${manufacturer} ${model}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const record = matches.find(({ id }) => id === selectedId) ?? matches[0];
  const format = new Intl.NumberFormat(locale);
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
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
      </label>
      {record ? (
        <>
          <label className="pg-field">
            <span>{inspect}</span>
            <select
              value={record.id}
              onChange={(event) => setSelectedId(event.currentTarget.value)}
            >
              {matches.map(({ id, manufacturer, model }) => (
                <option key={id} value={id}>
                  {manufacturer} {model}
                </option>
              ))}
            </select>
          </label>
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
          <div className="button-row">
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
    </section>
  );
}
