import { useMemo, useState } from "react";
import {
  solveMeshedPowerFlow,
  type MeshedInputs,
} from "../engine/powergridMeshed";
import type { Locale } from "../i18n";
import { downloadFile } from "../import-export/files";

const labels = {
  en: [
    "Meshed demand profile",
    "Low-load demand (%)",
    "Peak demand (%)",
    "Interval",
    "Demand multiplier",
    "Minimum voltage (pu)",
    "Real loss (MW)",
    "Solve status",
    "Solved",
    "Export demand profile",
    "Three independent steady-state solves scale active and reactive demand together. The case keeps the current generator settings and branch states.",
  ],
  de: [
    "Lastprofil im Maschennetz",
    "Niedrige Last (%)",
    "Spitzenlast (%)",
    "Intervall",
    "Lastmultiplikator",
    "Kleinste Spannung (pu)",
    "Wirkverluste (MW)",
    "Lösungsstatus",
    "Gelöst",
    "Lastprofil exportieren",
    "Drei unabhängige stationäre Berechnungen skalieren Wirk- und Blindlast gemeinsam. Generatoreinstellungen und Zweigzustände werden übernommen.",
  ],
  yo: [
    "Àpẹẹrẹ ìbéèrè nẹ́tíwọ́ọ̀kì meshed",
    "Ìbéèrè kékeré (%)",
    "Ìbéèrè tó ga (%)",
    "Interval",
    "Ìpín ìbéèrè",
    "Foliteji tó kéré jù (pu)",
    "Àdánù agbára (MW)",
    "Ipò ìṣírò",
    "Tí a yanju",
    "Gbé àpẹẹrẹ ìbéèrè jáde",
    "Ìṣírò steady-state mẹ́ta ń yí P àti Q load papọ̀. Ipò ẹ̀ka àti ètò generator dúró.",
  ],
  pcm: [
    "Meshed demand profile",
    "Low demand (%)",
    "Peak demand (%)",
    "Interval",
    "Demand multiplier",
    "Lowest voltage (pu)",
    "Real loss (MW)",
    "Solve status",
    "Solved",
    "Export demand profile",
    "Three separate steady-state calculations scale active and reactive demand together. Generator settings and branch states stay di same.",
  ],
} satisfies Record<Locale, string[]>;

const failureLabels = {
  invalid: [
    "Invalid inputs",
    "Ungültige Eingaben",
    "Input kò wúlò",
    "Invalid inputs",
  ],
  islanded: [
    "Island without slack bus",
    "Netzinsel ohne Referenzknoten",
    "Island láìsí slack bus",
    "Island without slack bus",
  ],
  "not-converged": [
    "No convergence",
    "Keine Konvergenz",
    "Ìṣírò kò converge",
    "No convergence",
  ],
} as const;

export function PowerGridMeshedProfile({
  locale,
  input,
}: {
  locale: Locale;
  input: MeshedInputs;
}) {
  const [low, setLow] = useState(60);
  const [peak, setPeak] = useState(125);
  const localeIndex = { en: 0, de: 1, yo: 2, pcm: 3 }[locale];
  const [
    title,
    lowLabel,
    peakLabel,
    intervalLabel,
    scaleLabel,
    voltageLabel,
    lossLabel,
    statusLabel,
    solvedLabel,
    exportLabel,
    scope,
  ] = labels[locale];
  const rows = useMemo(
    () =>
      [low, 100, peak].map((demandPercent, index) => {
        const scale = demandPercent / 100;
        const intervalInput: MeshedInputs = {
          ...input,
          buses: input.buses.map((bus) =>
            bus.kind === "pq"
              ? {
                  ...bus,
                  netMW: bus.netMW * scale,
                  netMvar: bus.netMvar * scale,
                }
              : bus,
          ),
        };
        return {
          interval: index + 1,
          demandPercent,
          input: intervalInput,
          result: solveMeshedPowerFlow(intervalInput),
        };
      }),
    [input, low, peak],
  );
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 4 });

  return (
    <section className="panel panel-pad" aria-labelledby="pg-meshed-profile">
      <h4 id="pg-meshed-profile">{title}</h4>
      <p>{scope}</p>
      <div className="pg-fields">
        <label className="pg-field">
          <span>{lowLabel}</span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={low}
            onChange={(event) => setLow(event.currentTarget.valueAsNumber)}
          />
        </label>
        <label className="pg-field">
          <span>{peakLabel}</span>
          <input
            type="range"
            min={100}
            max={200}
            step={1}
            value={peak}
            onChange={(event) => setPeak(event.currentTarget.valueAsNumber)}
          />
        </label>
      </div>
      <div className="pg-table-wrap">
        <table className="pg-wind-table">
          <thead>
            <tr>
              {[
                intervalLabel,
                scaleLabel,
                voltageLabel,
                lossLabel,
                statusLabel,
              ].map((label) => (
                <th scope="col" key={label}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ interval, demandPercent, result }) => (
              <tr key={interval}>
                <th scope="row">{interval}</th>
                <td>{demandPercent}%</td>
                <td>
                  {result.converged
                    ? format.format(
                        Math.min(...result.buses.map((bus) => bus.voltagePU)),
                      )
                    : "—"}
                </td>
                <td>
                  {result.converged
                    ? format.format(
                        result.branches.reduce(
                          (loss, branch) => loss + branch.lossMW,
                          0,
                        ),
                      )
                    : "—"}
                </td>
                <td>
                  {result.converged
                    ? solvedLabel
                    : failureLabels[result.reason][localeIndex]}
                </td>
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
            "powergrid-meshed-profile.json",
            JSON.stringify(
              {
                schemaVersion: 1,
                model: "independent-balanced-ac-demand-intervals",
                intervals: rows,
              },
              null,
              2,
            ),
            "application/json",
          )
        }
      >
        {exportLabel}
      </button>
    </section>
  );
}
