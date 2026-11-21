import { useMemo, useState } from "react";
import {
  DEFAULT_FREQUENCY_INPUTS,
  FREQUENCY_FIELDS,
  simulateFrequencyResponse,
  type FrequencyInputs,
} from "../engine/powergridFrequency";
import type { Locale } from "../i18n";
import { downloadFile } from "../import-export/files";

const source = "https://docs.nrel.gov/docs/fy24osti/88101.pdf";
const fields = [
  [
    "nominalHz",
    "Nominal frequency (Hz)",
    "Nennfrequenz (Hz)",
    "Igbohunsafẹfẹ àkọ́kọ́ (Hz)",
    "Nominal frequency (Hz)",
  ],
  [
    "inertiaSeconds",
    "Aggregate inertia H (s)",
    "Aggregierte Trägheitskonstante H (s)",
    "Àpapọ̀ inertia H (s)",
    "Combined inertia H (s)",
  ],
  [
    "lossPercent",
    "Generation loss (% of system base)",
    "Erzeugungsausfall (% der Systembasis)",
    "Ìpàdánù ìṣẹ̀dá (% ti ìpìlẹ̀ ètò)",
    "Generation loss (% of system base)",
  ],
  [
    "damping",
    "Load damping (pu power / pu frequency)",
    "Lastdämpfung (pu Leistung / pu Frequenz)",
    "Damping ẹrù (pu agbára / pu igbohunsafẹfẹ)",
    "Load damping (pu power / pu frequency)",
  ],
  [
    "droopPercent",
    "Governor droop (%)",
    "Reglerstatik (%)",
    "Droop governor (%)",
    "Governor droop (%)",
  ],
  [
    "governorSeconds",
    "Governor time constant (s)",
    "Reglerzeitkonstante (s)",
    "Àkókò governor (s)",
    "Governor time constant (s)",
  ],
  [
    "reservePercent",
    "Upward reserve (% of system base)",
    "Positive Reserve (% der Systembasis)",
    "Agbára ìpamọ́ tó lè pọ̀ sí i (% ti ìpìlẹ̀ ètò)",
    "Upward reserve (% of system base)",
  ],
  [
    "durationSeconds",
    "Study duration (s)",
    "Untersuchungsdauer (s)",
    "Àkókò ìdánwò (s)",
    "Study duration (s)",
  ],
] as const;

export function PowerGridFrequencyExperiment({ locale }: { locale: Locale }) {
  const [input, setInput] = useState<FrequencyInputs>(DEFAULT_FREQUENCY_INPUTS);
  const result = useMemo(() => simulateFrequencyResponse(input), [input]);
  const frequencyText = (...values: [string, string, string, string]) =>
    values[
      locale === "de" ? 1 : locale === "yo" ? 2 : locale === "pcm" ? 3 : 0
    ];
  const title = frequencyText(
    "Primary frequency response",
    "Primäre Frequenzregelung",
    "Ìdáhùn igbohunsafẹfẹ àkọ́kọ́",
    "Primary frequency response",
  );
  const fmt = new Intl.NumberFormat(locale === "pcm" ? "en-NG" : locale, {
    maximumFractionDigits: 4,
  });
  const end = result?.samples.at(-1);
  const min = Math.min(
    input.nominalHz - 0.01,
    result?.nadir.frequencyHz ?? input.nominalHz,
  );
  const max = Math.max(
    input.nominalHz + 0.01,
    ...(result?.samples.map((sample) => sample.frequencyHz) ?? []),
  );
  const y = (hz: number) => 160 - (140 * (hz - min)) / (max - min);
  return (
    <section
      className="panel panel-pad pg-panel"
      aria-labelledby="pg-frequency-title"
    >
      <h3 id="pg-frequency-title">{title}</h3>
      <p>
        {frequencyText(
          "A sudden generation loss drives an aggregate swing equation with load damping and a lagged droop governor. The trace stops if deviation exceeds 5% of nominal. The model covers primary response only.",
          "Ein plötzlicher Erzeugungsausfall treibt eine aggregierte Schwunggleichung mit Lastdämpfung und verzögertem Statikregler. Die Kurve stoppt bei mehr als 5 % Frequenzabweichung. Das Modell umfasst die Primärregelung.",
          "Ìpàdánù agbára lójijì ń darí ìṣirò inertia, damping ẹrù àti governor droop tó ní ìdádúró. Àwòrán dúró bí ìyapa bá ju 5% lọ. Àwòṣe yìí bo ìdáhùn àkọ́kọ́.",
          "Sudden generation loss drive aggregate swing equation with load damping and slow droop governor. Trace stop if deviation pass 5% of nominal. The model cover primary response.",
        )}{" "}
        <a href={source}>NREL</a>
      </p>
      <div className="pg-wind-controls">
        {fields.map(([key, en, de, yo, pcm]) => {
          const { min, max } = FREQUENCY_FIELDS[key];
          return (
            <label key={key} className="pg-field">
              <span>{frequencyText(en, de, yo, pcm)}</span>
              <input
                type="number"
                min={min}
                max={max}
                step="any"
                value={Number.isFinite(input[key]) ? input[key] : ""}
                onChange={(event) =>
                  setInput({
                    ...input,
                    [key]: event.currentTarget.valueAsNumber,
                  })
                }
              />
            </label>
          );
        })}
      </div>
      {!result && (
        <p role="status">
          {frequencyText(
            "Enter values within the shown input bounds.",
            "Geben Sie Werte innerhalb der Eingabegrenzen ein.",
            "Tẹ iye tó wà láàárín ààlà tí a fi hàn.",
            "Enter values inside the input limits.",
          )}
        </p>
      )}
      {result && end && (
        <>
          {result.stoppedAtModelLimit && (
            <p role="status">
              {frequencyText(
                "Trace stopped at the 5% model limit.",
                "Kurve an der 5-%-Modellgrenze gestoppt.",
                "Àwòrán dúró ní ààlà 5%.",
                "Trace stop at the 5% model limit.",
              )}
            </p>
          )}
          <dl className="pg-metrics pg-wind-metrics">
            <div>
              <dt>
                {frequencyText(
                  "Initial RoCoF",
                  "Anfänglicher Frequenzgradient",
                  "RoCoF ìbẹ̀rẹ̀",
                  "Starting RoCoF",
                )}
              </dt>
              <dd>{fmt.format(result.initialRoCoFHzPerSecond)} Hz/s</dd>
            </div>
            <div>
              <dt>
                {frequencyText(
                  "Lowest modeled frequency",
                  "Niedrigste modellierte Frequenz",
                  "Igbohunsafẹfẹ tó kéré jù",
                  "Lowest modeled frequency",
                )}
              </dt>
              <dd>
                {fmt.format(result.nadir.frequencyHz)} Hz ·{" "}
                {fmt.format(result.nadir.seconds)} s
              </dd>
            </div>
            <div>
              <dt>
                {frequencyText(
                  "Final modeled frequency",
                  "Letzte modellierte Frequenz",
                  "Igbohunsafẹfẹ ìkẹyìn",
                  "Final modeled frequency",
                )}
              </dt>
              <dd>
                {fmt.format(end.frequencyHz)} Hz · {fmt.format(end.seconds)} s
              </dd>
            </div>
          </dl>
          <svg
            viewBox="0 0 600 190"
            role="img"
            aria-label={title}
            style={{ width: "100%", maxWidth: "600px" }}
          >
            <line
              x1="75"
              x2="585"
              y1={y(input.nominalHz)}
              y2={y(input.nominalHz)}
              stroke="currentColor"
              strokeDasharray="5 5"
              opacity="0.5"
            />
            <polyline
              points={result.samples
                .map(
                  (sample) =>
                    `${75 + (510 * sample.seconds) / input.durationSeconds},${y(sample.frequencyHz)}`,
                )
                .join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <g fontSize="12" fill="currentColor">
              <text x="0" y={y(input.nominalHz)}>
                {fmt.format(input.nominalHz)} Hz
              </text>
              <text x="75" y="183">
                0 s
              </text>
              <text x="585" y="183" textAnchor="end">
                {fmt.format(input.durationSeconds)} s
              </text>
            </g>
          </svg>
        </>
      )}
      <div className="pg-actions">
        <button
          type="button"
          className="button"
          disabled={!result}
          onClick={() =>
            downloadFile(
              "powergrid-frequency-response.json",
              JSON.stringify(
                { model: "aggregate-swing-droop", source, input, result },
                null,
                2,
              ),
              "application/json",
            )
          }
        >
          {frequencyText(
            "Export frequency trace",
            "Frequenzkurve exportieren",
            "Gbé àwòrán igbohunsafẹfẹ jáde",
            "Export frequency trace",
          )}
        </button>
      </div>
    </section>
  );
}
