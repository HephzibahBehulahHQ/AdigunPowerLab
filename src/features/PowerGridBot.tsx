import { useState } from "react";
import {
  calculatePowerGrid,
  validatePowerGridInputs,
} from "../engine/powergrid";
import type { PowerGridComparison, PowerGridInputs } from "../engine/powergrid";
import type { Locale } from "../i18n";
import {
  describeStationAsset,
  type Station3DAssetId,
} from "./PowerGridStation3DScene";

const selectedAssetLabel = {
  en: "Explain selected station equipment",
  de: "Ausgewähltes Betriebsmittel erklären",
  yo: "Ṣàlàyé ohun èlò tí a yàn",
  pcm: "Explain di station equipment wey you select",
} satisfies Record<Locale, string>;

export interface TransmissionVoltageProposal<Revision> {
  kind: "raise-transmission-voltage";
  revision: Revision;
  raisedVoltageKV: number;
}

const copy = {
  en: [
    "Adigun BOT · Transmission worksheet",
    "At fixed real power and power factor, raising voltage lowers line current. With the same conductor resistance, line loss follows current squared.",
    "Enter valid transmission inputs to get a result or preview a change.",
    "Raised-voltage current and loss",
    "Preview 10% higher transmission voltage",
    "Voltage, current and loss before → after",
    "Confirm voltage change",
    "Cancel preview",
    "Worksheet changed. Prepare a new preview.",
    "Export current lab report",
    "Next lesson: Transmission distance",
  ],
  de: [
    "Adigun BOT · Übertragungsblatt",
    "Bei konstanter Wirkleistung und konstantem Leistungsfaktor sinkt der Strom mit steigender Spannung. Bei gleichem Leiterwiderstand ändern sich die Verluste quadratisch mit dem Strom.",
    "Geben Sie gültige Übertragungswerte ein, um Ergebnisse oder eine Vorschau zu erhalten.",
    "Strom und Verluste bei höherer Spannung",
    "10 % höhere Übertragungsspannung prüfen",
    "Spannung, Strom und Verluste vorher → nachher",
    "Spannungsänderung bestätigen",
    "Vorschau abbrechen",
    "Das Arbeitsblatt wurde geändert. Erstellen Sie eine neue Vorschau.",
    "Aktuellen Laborbericht exportieren",
    "Nächster Versuch: Übertragungsentfernung",
  ],
  yo: [
    "Adigun BOT · Worksheet gbigbe",
    "Ní agbára gidi àti power factor kan náà, fólítéèjì gíga dín ìṣàn iná kù. Bí ìdènà okùn kò bá yí padà, àdánù tẹ̀lé ìṣàn iná onígun méjì.",
    "Tẹ iye gbigbe tó péye láti rí èsì tàbí àwòyẹ̀wò ìyípadà.",
    "Ìṣàn àti àdánù ní fólítéèjì gíga",
    "Ṣàyẹ̀wò fólítéèjì gbigbe tó ga sí i ní 10%",
    "Fólítéèjì, ìṣàn àti àdánù ṣáájú → lẹ́yìn",
    "Jẹ́rìí ìyípadà fólítéèjì",
    "Fagilé àwòyẹ̀wò",
    "Worksheet ti yí padà. Ṣe àwòyẹ̀wò tuntun.",
    "Gba ìròyìn ìdánwò lọwọlọwọ",
    "Ìdánwò tó kàn: Ìjìnnà gbigbe",
  ],
  pcm: [
    "Adigun BOT · Transmission worksheet",
    "If real power and power factor stay di same, higher voltage reduce line current. If wire resistance no change, line loss follow current squared.",
    "Enter valid transmission values to see result or preview a change.",
    "Current and loss for higher voltage",
    "Preview transmission voltage wey high by 10%",
    "Voltage, current and loss before → after",
    "Confirm voltage change",
    "Cancel preview",
    "Worksheet don change. Prepare new preview.",
    "Download current lab report",
    "Next lesson: Transmission distance",
  ],
} satisfies Record<Locale, readonly string[]>;

export function PowerGridBot<Revision>({
  locale,
  inputs,
  result,
  revision,
  stationAsset,
  reportBusy,
  onApply,
  onReport,
}: {
  locale: Locale;
  inputs: PowerGridInputs;
  result?: PowerGridComparison;
  revision: Revision;
  stationAsset: Station3DAssetId;
  reportBusy: boolean;
  onApply: (proposal: TransmissionVoltageProposal<Revision>) => void;
  onReport: () => void;
}) {
  const [proposal, setProposal] =
    useState<TransmissionVoltageProposal<Revision>>();
  const [
    title,
    explanation,
    invalid,
    summary,
    preview,
    beforeAfter,
    confirm,
    cancel,
    stale,
    report,
    next,
  ] = copy[locale];
  const target = {
    ...inputs,
    raisedVoltageKV: (inputs.raisedVoltageKV * 11) / 10,
  };
  const canPreview = !!result && validatePowerGridInputs(target).length === 0;
  const active =
    proposal?.revision === revision && proposal !== undefined && canPreview;
  const equipment = describeStationAsset(stationAsset, locale);
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  const describe = (reading: PowerGridComparison["raised"]) =>
    `${format.format(reading.voltageKV)} kV · ${format.format(reading.currentA)} A · ${format.format(reading.lineLossMW)} MW`;
  return (
    <section
      className="panel panel-pad pg-panel"
      aria-labelledby="pg-bot-title"
    >
      <h3 id="pg-bot-title">{title}</h3>
      <details>
        <summary>{selectedAssetLabel[locale]}</summary>
        <h4>{equipment.name}</h4>
        <p>{equipment.role}</p>
        <p>{equipment.terminals}</p>
      </details>
      <p>{explanation}</p>
      <p>{result ? `${summary} · ${describe(result.raised)}` : invalid}</p>
      <div className="pg-actions">
        <button
          className="button"
          type="button"
          disabled={!canPreview}
          onClick={() =>
            setProposal({
              kind: "raise-transmission-voltage",
              revision,
              raisedVoltageKV: target.raisedVoltageKV,
            })
          }
        >
          {preview}
        </button>
        <button
          className="button"
          type="button"
          disabled={!result || reportBusy}
          onClick={onReport}
        >
          {report}
        </button>
      </div>
      {proposal && (
        <div role="group" aria-label={beforeAfter}>
          {active && result ? (
            <>
              <p>
                {describe(result.raised)} →{" "}
                {describe(
                  calculatePowerGrid({
                    ...inputs,
                    raisedVoltageKV: proposal.raisedVoltageKV,
                  }).raised,
                )}
              </p>
              <button
                className="button"
                type="button"
                onClick={() => {
                  onApply(proposal);
                  setProposal(undefined);
                }}
              >
                {confirm}
              </button>
            </>
          ) : (
            <p role="status">{stale}</p>
          )}
          <button
            className="button"
            type="button"
            onClick={() => setProposal(undefined)}
          >
            {cancel}
          </button>
        </div>
      )}
      <p>{next}</p>
    </section>
  );
}
