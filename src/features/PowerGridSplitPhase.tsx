import { useState } from "react";
import type { Locale } from "../i18n";
import {
  calculateSplitPhase,
  SPLIT_PHASE_MAX_LOAD_KW,
} from "../engine/powergridSplitPhase";
import { downloadFile } from "../import-export/files";

const defaults = ["1.2", "0.6", "2.4"];
const connections = ["L1–N · 120 V", "L2–N · 120 V", "L1–L2 · 240 V"];
const conductors = ["L1", "L2", "N", "L1–L2"];
const copy = {
  en: [
    "120/240 V split-phase experiment",
    "Balance the two 120 V loads, then increase the 240 V load. Watch which currents change. The model uses resistive loads and ideal source voltages.",
    "Enter 0 to 24 kW per load.",
    "Reset loads",
    "Export split-phase results",
  ],
  de: [
    "120/240-V-Einphasen-Dreileiterversuch",
    "Gleichen Sie die beiden 120-V-Lasten an und erhöhen Sie dann die 240-V-Last. Beobachten Sie die Ströme bei ohmschen Lasten und idealen Quellspannungen.",
    "Geben Sie je Last 0 bis 24 kW ein.",
    "Lasten zurücksetzen",
    "Ergebnisse exportieren",
  ],
  yo: [
    "Ìdánwò split-phase 120/240 V",
    "Ṣe ẹrù 120 V méjèèjì dọ́gba, lẹ́yìn náà mú ẹrù 240 V pọ̀ sí i. Wo ìṣàn tó yí padà nínú àwòṣe ẹrù resistive àti fólítéèjì pípé.",
    "Tẹ 0 sí 24 kW fún ẹrù kọ̀ọ̀kan.",
    "Dá àwọn ẹrù padà",
    "Gba èsì jáde",
  ],
  pcm: [
    "120/240 V split-phase experiment",
    "Make di two 120 V loads equal, then increase di 240 V load. Watch which current change. Di model use resistive loads and ideal supply voltage.",
    "Enter 0 to 24 kW for each load.",
    "Reset loads",
    "Export split-phase results",
  ],
} satisfies Record<Locale, readonly string[]>;

export function PowerGridSplitPhase({ locale }: { locale: Locale }) {
  const [draft, setDraft] = useState(defaults);
  const values = draft.map((input) => (input === "" ? NaN : Number(input)));
  const result = calculateSplitPhase(values[0], values[1], values[2]);
  const [title, scope, invalid, reset, exportLabel] = copy[locale];
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });

  return (
    <section className="pg-panel" aria-labelledby="pg-split-phase">
      <h4 id="pg-split-phase">{title}</h4>
      <p>{scope}</p>
      <div className="pg-fields">
        {connections.map((connection, index) => (
          <label className="pg-field" key={connection}>
            <span>{connection} (kW)</span>
            <input
              type="number"
              min={0}
              max={SPLIT_PHASE_MAX_LOAD_KW}
              step="any"
              value={draft[index]}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setDraft(
                  draft.map((input, position) =>
                    position === index ? value : input,
                  ),
                );
              }}
            />
          </label>
        ))}
      </div>
      {result ? (
        <dl className="pg-foundation-readings" aria-live="polite">
          {Object.values(result).map((current, index) => (
            <div key={conductors[index]}>
              <dt>{conductors[index]}</dt>
              <dd>{format.format(current)} A</dd>
              <dd>
                <meter
                  className="pg-voltage-meter"
                  aria-label={conductors[index]}
                  value={current}
                  max={300}
                />
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p role="status">{invalid}</p>
      )}
      <div className="pg-actions">
        <button
          className="button"
          type="button"
          onClick={() => setDraft(defaults)}
        >
          {reset}
        </button>
        <button
          className="button"
          type="button"
          disabled={!result}
          onClick={() =>
            downloadFile(
              "powergrid-split-phase.json",
              JSON.stringify(
                {
                  schemaVersion: 1,
                  model: "ideal-120-240-v-resistive",
                  loadKW: {
                    l1: values[0],
                    l2: values[1],
                    lineToLine: values[2],
                  },
                  result,
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
      </div>
    </section>
  );
}
