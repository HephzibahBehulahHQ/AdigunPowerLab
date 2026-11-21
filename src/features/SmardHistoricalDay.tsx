import { useState } from "react";
import {
  SMARD_GERMANY_DAY,
  SMARD_GERMANY_WINTER_DAY,
} from "../data/smardGermanyDay";
import type { Locale } from "../i18n";
import { downloadFile } from "../import-export/files";

const copy = {
  en: [
    "Germany: historical load and generation",
    "Reported national values in local time. Select a day to inspect its hourly observations.",
    "Start (local time)",
    "Grid load",
    "Solar",
    "Onshore wind",
    "Offshore wind",
    "Load minus solar and wind",
    "Export historical JSON",
  ],
  de: [
    "Deutschland: historische Last und Erzeugung",
    "Gemeldete bundesweite Werte in Ortszeit. Wählen Sie einen Tag, um seine Stundenwerte zu prüfen.",
    "Beginn (Ortszeit)",
    "Netzlast",
    "Photovoltaik",
    "Wind an Land",
    "Wind auf See",
    "Last abzüglich Solar und Wind",
    "Historische Daten als JSON exportieren",
  ],
  yo: [
    "Jámánì: ìbéèrè àti ìṣẹ̀dá iná àtijọ́",
    "Àwọn iye orílẹ̀-èdè ní àkókò agbègbè. Yan ọjọ́ kan láti ṣàyẹ̀wò iye wákàtí rẹ̀.",
    "Ìbẹ̀rẹ̀ (àkókò agbègbè)",
    "Ìbéèrè grid",
    "Oorun",
    "Afẹ́fẹ́ lórí ilẹ̀",
    "Afẹ́fẹ́ lórí òkun",
    "Ìbéèrè lẹ́yìn yíyọ oorun àti afẹ́fẹ́",
    "Gbé JSON àtijọ́ jáde",
  ],
  pcm: [
    "Germany: past load and generation",
    "Reported country-wide values for local time. Choose one day to check the hourly values.",
    "Start (local time)",
    "Grid load",
    "Solar",
    "Wind for land",
    "Wind for sea",
    "Load minus solar and wind",
    "Export historical JSON",
  ],
} satisfies Record<Locale, string[]>;

export function SmardHistoricalDay({ locale }: { locale: Locale }) {
  const [winter, setWinter] = useState(false);
  const day = winter ? SMARD_GERMANY_WINTER_DAY : SMARD_GERMANY_DAY;
  const dateLabel = {
    en: "Historical date",
    de: "Historisches Datum",
    yo: "Ọjọ́ àtijọ́",
    pcm: "Historical date",
  }[locale];
  const [
    title,
    note,
    hour,
    load,
    solar,
    onshore,
    offshore,
    residual,
    exportLabel,
  ] = copy[locale];
  const format = new Intl.NumberFormat(locale === "pcm" ? "en-NG" : locale, {
    maximumFractionDigits: 2,
  });
  return (
    <details className="panel panel-pad pg-panel">
      <summary>{title}</summary>
      <p>{note}</p>
      <label className="pg-field">
        <span>{dateLabel}</span>
        <select
          value={day.date}
          onChange={(event) =>
            setWinter(
              event.currentTarget.value === SMARD_GERMANY_WINTER_DAY.date,
            )
          }
        >
          <option value={SMARD_GERMANY_DAY.date}>
            {SMARD_GERMANY_DAY.date} (UTC+02:00)
          </option>
          <option value={SMARD_GERMANY_WINTER_DAY.date}>
            {SMARD_GERMANY_WINTER_DAY.date} (UTC+01:00)
          </option>
        </select>
      </label>
      <p>
        <a href={SMARD_GERMANY_DAY.dataUseUrl}>
          {SMARD_GERMANY_DAY.attribution}
        </a>
        {" · "}
        <a href={SMARD_GERMANY_DAY.licenseUrl}>{SMARD_GERMANY_DAY.license}</a>
      </p>
      <div className="pg-table-wrap">
        <table className="pg-wind-table">
          <caption>{title} · MWh</caption>
          <thead>
            <tr>
              {[hour, load, solar, onshore, offshore, residual].map(
                (column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {day.intervals.map((row) => (
              <tr key={row.start}>
                <th scope="row">
                  <time dateTime={row.start}>{row.start.slice(11, 16)}</time>
                </th>
                {[
                  row.gridLoadMWh,
                  row.solarMWh,
                  row.onshoreMWh,
                  row.offshoreMWh,
                  row.residualMWh,
                ].map((value, index) => (
                  <td key={index}>{format.format(value)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="button"
        onClick={() =>
          downloadFile(
            `powergrid-smard-germany-${day.date}.json`,
            JSON.stringify(day, null, 2),
            "application/json",
          )
        }
      >
        {exportLabel}
      </button>
    </details>
  );
}
