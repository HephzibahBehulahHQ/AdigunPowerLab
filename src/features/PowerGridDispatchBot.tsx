import { useState } from "react";
import type { MicrogridDispatchResult } from "../engine/microgridDispatch";
import type { Locale } from "../i18n";

const copy = {
  en: [
    "Adigun BOT · Dispatch explanation",
    "Dispatch interval",
    "Battery discharge is capped by the renewable supply deficit, the battery power setting, and energy available above reserve in this interval. Other available sources can cover the remaining deficit. Critical demand has priority.",
    "Deficit after renewables",
    "Battery discharge power limit",
    "Battery energy limit this interval",
    "Battery supplied",
    "Unmet critical demand",
    "Unmet noncritical demand",
    "Enter valid dispatch inputs to explain an interval.",
  ],
  de: [
    "Adigun BOT · Dispatch-Erklärung",
    "Dispatch-Intervall",
    "Die Speicherentladung ist durch die Versorgungslücke nach den Erneuerbaren, die eingestellte Speicherleistung und die Energie oberhalb der Reserve begrenzt. Andere verfügbare Quellen können die Restlücke decken. Kritische Last hat Vorrang.",
    "Restbedarf nach Erneuerbaren",
    "Entladeleistungsgrenze",
    "Speicherenergiegrenze im Intervall",
    "Speicherleistung",
    "Ungedeckte kritische Last",
    "Ungedeckte unkritische Last",
    "Geben Sie gültige Dispatch-Werte ein, um ein Intervall zu erklären.",
  ],
  yo: [
    "Adigun BOT · Àlàyé dispatch",
    "Àkókò dispatch",
    "Àìní lẹ́yìn agbára àtúnlò, ààlà agbára batiri àti agbára tó wà lókè reserve ló ń dín fífi agbára batiri jáde kù. Àwọn orísun mìíràn lè pèsè fún àìní tó kù. Ẹrù pàtàkì ni a kọ́kọ́ pèsè fún.",
    "Àìní lẹ́yìn agbára àtúnlò",
    "Ààlà agbára tí batiri lè fúnni",
    "Ààlà agbára láti inú ìpamọ́ ní àkókò yìí",
    "Agbára tí batiri pèsè",
    "Ẹrù pàtàkì tí kò rí agbára",
    "Ẹrù mìíràn tí kò rí agbára",
    "Tẹ iye dispatch tó péye láti rí àlàyé àkókò.",
  ],
  pcm: [
    "Adigun BOT · Dispatch explanation",
    "Dispatch interval",
    "Battery discharge get three limits: shortage after renewable supply, battery power setting and energy wey dey above reserve for dis interval. Other available sources fit cover wetin remain. Critical demand get priority.",
    "Shortage after renewables",
    "Battery power limit",
    "Battery energy limit for dis interval",
    "Wetin battery supply",
    "Critical demand wey no get supply",
    "Other demand wey no get supply",
    "Enter valid dispatch values to explain one interval.",
  ],
} satisfies Record<Locale, readonly string[]>;

export function PowerGridDispatchBot({
  locale,
  result,
  batteryPowerKW,
}: {
  locale: Locale;
  result: MicrogridDispatchResult | null;
  batteryPowerKW: number;
}) {
  const [index, setIndex] = useState(0);
  const [
    title,
    interval,
    explanation,
    deficit,
    power,
    energy,
    supplied,
    critical,
    noncritical,
    invalid,
  ] = copy[locale];
  const selected = result?.intervals[index] ?? result?.intervals[0];
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  const rows = selected
    ? ([
        [
          deficit,
          Math.max(0, selected.demandKW - selected.renewableAvailableKW),
        ],
        [power, batteryPowerKW],
        [energy, selected.batteryEnergyLimitKW],
        [supplied, selected.batteryDischargeKW],
        [critical, selected.criticalUnservedKW],
        [noncritical, selected.nonCriticalUnservedKW],
      ] as const)
    : [];
  return (
    <section
      className="panel panel-pad pg-panel"
      aria-labelledby="pg-dispatch-bot"
    >
      <h4 id="pg-dispatch-bot">{title}</h4>
      {selected && result ? (
        <>
          <label className="pg-field">
            <span>{interval}</span>
            <select
              value={selected.interval}
              onChange={(event) => setIndex(event.currentTarget.selectedIndex)}
            >
              {result.intervals.map((row) => (
                <option key={row.interval} value={row.interval}>
                  {row.interval}
                </option>
              ))}
            </select>
          </label>
          <p>{explanation}</p>
          <dl>
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{format.format(value)} kW</dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <p>{invalid}</p>
      )}
    </section>
  );
}
