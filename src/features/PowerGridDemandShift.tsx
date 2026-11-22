import { useState } from "react";
import type { Locale } from "../i18n";
import { MAX_MICROGRID_DEMAND_KW } from "../engine/microgridDispatch";

const copy = {
  en: [
    "Shift flexible demand",
    "Move noncritical demand between equal-duration intervals. Compare backup output and unmet demand after the shift.",
    "From interval",
    "To interval",
    "Power to shift (kW)",
    "Apply demand shift",
    "Flexible demand available",
    "Energy moved",
  ],
  de: [
    "Flexible Last verschieben",
    "Verschieben Sie unkritische Last zwischen gleich langen Intervallen und vergleichen Sie Reserveleistung und ungedeckte Last.",
    "Aus Intervall",
    "In Intervall",
    "Zu verschiebende Leistung (kW)",
    "Last verschieben",
    "Verfügbare flexible Last",
    "Verschobene Energie",
  ],
  yo: [
    "Gbé ìbéèrè tó lè yí padà",
    "Gbé ìbéèrè tí kò ṣe pàtàkì láàárín interval tó dọ́gba. Wé agbára backup àti ìbéèrè tí kò rí ìpèsè lẹ́yìn náà.",
    "Interval ìbẹ̀rẹ̀",
    "Interval ìparí",
    "Agbára láti gbé (kW)",
    "Gbé ìbéèrè",
    "Ìbéèrè tó lè yí padà",
    "Energy tí a gbé",
  ],
  pcm: [
    "Shift flexible demand",
    "Move demand wey no critical between intervals wey get di same length. Compare backup power and demand wey no get supply after di shift.",
    "From interval",
    "To interval",
    "Power to shift (kW)",
    "Apply demand shift",
    "Flexible demand wey dey",
    "Energy wey move",
  ],
} satisfies Record<Locale, string[]>;

export function PowerGridDemandShift({
  locale,
  demand,
  critical,
  intervalHours,
  onShift,
}: {
  locale: Locale;
  demand: number[];
  critical: number[];
  intervalHours: number;
  onShift: (demand: number[]) => void;
}) {
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(1);
  const [power, setPower] = useState("1");
  const [movedKWh, setMovedKWh] = useState<number>();
  const [
    title,
    description,
    fromLabel,
    toLabel,
    powerLabel,
    apply,
    availableLabel,
    movedLabel,
  ] = copy[locale];
  const kw = Number(power);
  const available = Math.min(
    (demand[from] ?? 0) - (critical[from] ?? 0),
    MAX_MICROGRID_DEMAND_KW - (demand[to] ?? 0),
  );
  const canShift =
    from !== to &&
    from < demand.length &&
    to < demand.length &&
    Number.isFinite(kw) &&
    kw > 0 &&
    kw <= available;
  const options = demand.map((_, index) => (
    <option value={index} key={index}>
      {index + 1}
    </option>
  ));
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });

  return (
    <section className="panel panel-pad" aria-labelledby="pg-demand-shift">
      <h4 id="pg-demand-shift">{title}</h4>
      <p>{description}</p>
      <div className="pg-fields">
        <label className="pg-field">
          <span>{fromLabel}</span>
          <select
            value={from}
            onChange={(event) => setFrom(Number(event.currentTarget.value))}
          >
            {options}
          </select>
        </label>
        <label className="pg-field">
          <span>{toLabel}</span>
          <select
            value={to}
            onChange={(event) => setTo(Number(event.currentTarget.value))}
          >
            {options}
          </select>
        </label>
        <label className="pg-field">
          <span>{powerLabel}</span>
          <input
            type="number"
            min={0}
            max={available}
            step="any"
            value={power}
            onChange={(event) => setPower(event.currentTarget.value)}
          />
        </label>
      </div>
      <p>
        {availableLabel} · {format.format(available)} kW
      </p>
      <button
        className="button"
        type="button"
        disabled={!canShift}
        onClick={() => {
          const shifted = [...demand];
          shifted[from] = Math.max(critical[from], shifted[from] - kw);
          shifted[to] += kw;
          onShift(shifted);
          setMovedKWh(kw * intervalHours);
        }}
      >
        {apply}
      </button>
      {movedKWh !== undefined && (
        <p role="status">
          {movedLabel} · {format.format(movedKWh)} kWh
        </p>
      )}
    </section>
  );
}
