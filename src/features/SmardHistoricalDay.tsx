import { SMARD_GERMANY_DAY } from "../data/smardGermanyDay";
import type { Locale } from "../i18n";
import { downloadFile } from "../import-export/files";

const copy = {
  en: [
    "Germany: historical load and generation",
    "Reported national values for 18 June 2025, in local time. This historical day is separate from the editable dispatch inputs.",
    "Start (CEST)",
    "Grid load",
    "Solar",
    "Onshore wind",
    "Offshore wind",
    "Load minus solar and wind",
    "Export historical JSON",
  ],
  de: [
    "Deutschland: historische Last und Erzeugung",
    "Gemeldete bundesweite Werte für den 18. Juni 2025 in Ortszeit. Dieser historische Tag ist von den bearbeitbaren Dispatch-Eingaben getrennt.",
    "Beginn (MESZ)",
    "Netzlast",
    "Photovoltaik",
    "Wind an Land",
    "Wind auf See",
    "Last abzüglich Solar und Wind",
    "Historische Daten als JSON exportieren",
  ],
  yo: [
    "Jámánì: ìbéèrè àti ìṣẹ̀dá iná àtijọ́",
    "Àwọn iye orílẹ̀-èdè fún 18 Oṣù Kẹfà 2025, ní àkókò agbègbè. Ọjọ́ àtijọ́ yìí yà sọ́tọ̀ sí ìtẹ̀wọlé dispatch tí a lè ṣàtúnṣe.",
    "Ìbẹ̀rẹ̀ (CEST)",
    "Ìbéèrè grid",
    "Oorun",
    "Afẹ́fẹ́ lórí ilẹ̀",
    "Afẹ́fẹ́ lórí òkun",
    "Ìbéèrè lẹ́yìn yíyọ oorun àti afẹ́fẹ́",
    "Gbé JSON àtijọ́ jáde",
  ],
  pcm: [
    "Germany: past load and generation",
    "Reported country-wide values for 18 June 2025, for local time. This historical day dey separate from dispatch inputs wey you fit edit.",
    "Start (CEST)",
    "Grid load",
    "Solar",
    "Wind for land",
    "Wind for sea",
    "Load minus solar and wind",
    "Export historical JSON",
  ],
} satisfies Record<Locale, string[]>;

export function SmardHistoricalDay({ locale }: { locale: Locale }) {
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
            {SMARD_GERMANY_DAY.intervals.map((row) => (
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
            "powergrid-smard-germany-2025-06-18.json",
            JSON.stringify(SMARD_GERMANY_DAY, null, 2),
            "application/json",
          )
        }
      >
        {exportLabel}
      </button>
    </details>
  );
}
