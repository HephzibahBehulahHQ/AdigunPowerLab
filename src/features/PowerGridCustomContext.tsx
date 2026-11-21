import { useState } from "react";
import type { Locale } from "../i18n";
import {
  checkPowerGridCustomContext,
  type PowerGridCustomContext as CustomContext,
} from "../import-export/powergridScenario";

const copy = {
  en: [
    "Custom system",
    "Frequency (Hz)",
    "Currency code",
    "IANA time zone",
    "Apply custom context",
    "Set voltage, loads and topology in the lab worksheets. These settings describe the experiment.",
  ],
  de: [
    "Eigenes System",
    "Frequenz (Hz)",
    "Währungscode",
    "IANA-Zeitzone",
    "Eigenen Kontext übernehmen",
    "Stellen Sie Spannung, Lasten und Topologie in den Laborblättern ein. Diese Angaben beschreiben den Versuch.",
  ],
  yo: [
    "Ètò àdáni",
    "Frequency (Hz)",
    "Kóòdù owó",
    "Agbègbè àkókò IANA",
    "Lo àlàyé ètò àdáni",
    "Ṣètò fólítéèjì, ẹrù àti asopọ̀ nínú worksheet. Àwọn iye wọ̀nyí ṣàlàyé ìdánwò.",
  ],
  pcm: [
    "Custom system",
    "Frequency (Hz)",
    "Currency code",
    "IANA time zone",
    "Apply custom context",
    "Set voltage, loads and connections for di lab worksheets. Dis settings describe di experiment.",
  ],
} satisfies Record<Locale, readonly string[]>;

export function PowerGridCustomContext({
  locale,
  context,
  onApply,
}: {
  locale: Locale;
  context?: CustomContext;
  onApply: (context: CustomContext) => void;
}) {
  const [frequency, setFrequency] = useState(
    String(context?.frequencyHz ?? 50),
  );
  const [currencyCode, setCurrency] = useState(context?.currencyCode ?? "EUR");
  const [timeZone, setTimeZone] = useState(context?.timeZone ?? "UTC");
  const [title, hz, currency, zone, apply, scope] = copy[locale];
  const next = checkPowerGridCustomContext({
    frequencyHz: Number(frequency),
    currencyCode: currencyCode.trim().toUpperCase(),
    timeZone: timeZone.trim(),
  });

  return (
    <details className="panel panel-pad" open={context ? true : undefined}>
      <summary>{title}</summary>
      <p>{scope}</p>
      <div className="pg-fields">
        <label className="pg-field">
          <span>{hz}</span>
          <input
            type="number"
            min={1}
            max={100}
            step="any"
            value={frequency}
            onChange={(event) => setFrequency(event.currentTarget.value)}
          />
        </label>
        <label className="pg-field">
          <span>{currency}</span>
          <input
            maxLength={3}
            value={currencyCode}
            onChange={(event) => setCurrency(event.currentTarget.value)}
          />
        </label>
        <label className="pg-field">
          <span>{zone}</span>
          <input
            maxLength={80}
            value={timeZone}
            onChange={(event) => setTimeZone(event.currentTarget.value)}
          />
        </label>
      </div>
      <button
        className="button"
        type="button"
        disabled={!next}
        onClick={() => next && onApply(next)}
      >
        {apply}
      </button>
    </details>
  );
}
