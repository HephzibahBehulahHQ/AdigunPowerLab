import { useContext, useState } from "react";
import { MapPin } from "lucide-react";
import { NIGERIA_TEACHING_PRESET } from "../engine/powergridRegions";
import { LanguageContext } from "../i18n";
import type { Locale } from "../i18n";

const copy: Record<
  Locale,
  {
    title: string;
    intro: string;
    label: string;
    apply: string;
    applied: string;
    frequency: string;
    currency: string;
    timeZone: string;
    voltages: string;
    resources: string;
    demand: string;
    scope: string;
    source: string;
  }
> = {
  en: {
    title: "Regional teaching scenario",
    intro:
      "Start with a sourced Nigeria-inspired voltage context. This preset changes only the matching voltage fields below.",
    label: "Nigeria-inspired · educational, not an operational grid replica",
    apply: "Apply 132 / 330 / 33 kV stages",
    applied: "Applied to the voltage comparison and schematic",
    frequency: "Nominal frequency",
    currency: "Currency context",
    timeZone: "Time zone context",
    voltages: "Grid-code nominal stages (line-to-line)",
    resources: "Generation / weather profile",
    demand: "Demand profile",
    scope:
      "The preset applies 132 kV, 330 kV and 33 kV to the corresponding worksheet fields. It leaves generator and consumer voltage unchanged. 11 kV is listed as a documented stage but is not an extra transformer node here. Frequency, currency and time zone are context only; no national grid, weather or demand data is simulated.",
    source: "Source",
  },
  de: {
    title: "Regionales Lehrszenario",
    intro:
      "Beginnen Sie mit einem belegten Nigeria-inspirierten Spannungskontext. Nur passende Spannungsfelder werden geändert.",
    label: "Nigeria-inspiriert · Lehrszenario, keine Netzabbildung",
    apply: "Spannungsstufen 132 / 330 / 33 kV anwenden",
    applied: "Auf Spannungsvergleich und Schema angewendet",
    frequency: "Nennfrequenz",
    currency: "Währungskontext",
    timeZone: "Zeitzonenkontext",
    voltages: "Nennstufen laut Netzkodex (Leiter-Leiter)",
    resources: "Erzeugungs-/Wetterprofil",
    demand: "Lastprofil",
    scope:
      "Die Vorgabe setzt 132 kV, 330 kV und 33 kV in die passenden Felder ein. Generator- und Verbraucherspannung bleiben unverändert. 11 kV ist als belegte Stufe aufgeführt, aber hier kein zusätzlicher Transformator. Frequenz, Währung und Zeitzone dienen nur als Kontext; nationale Netz-, Wetter- oder Lastdaten werden nicht simuliert.",
    source: "Quelle",
  },
  yo: {
    title: "Àpẹẹrẹ agbègbè fún ìkẹ́kọ̀ọ́",
    intro:
      "Bẹ̀rẹ̀ pẹ̀lú àpẹẹrẹ foliteji tó ní orísun fún Nigeria. Àwọn field foliteji tó bá mu nìkan ni yóò yí padà.",
    label: "Àpẹẹrẹ Nigeria · fún ẹ̀kọ́, kì í ṣe àwòrán grid gidi",
    apply: "Lo àwọn ipele 132 / 330 / 33 kV",
    applied: "A ti fi sí ìfiwéra foliteji àti àwòrán",
    frequency: "Frequency àkọ́kọ́",
    currency: "Àyíká owó",
    timeZone: "Àyíká àkókò",
    voltages: "Àwọn ipele nominal grid-code (laàárín waya)",
    resources: "Àwòrán generation / weather",
    demand: "Àwòrán demand",
    scope:
      "Àpẹẹrẹ yìí fi 132 kV, 330 kV àti 33 kV sí àwọn field tó bá mu. Kò yí voltage generator tàbí consumer padà. A ti darúkọ 11 kV gẹ́gẹ́ bí ipele tó ní ẹ̀rí, ṣùgbọ́n kì í ṣe transformer node míì nínú schema yìí. Frequency, owó àti timezone jẹ́ àlàyé àyíká; a kò ṣe àwòṣe national grid, weather tàbí demand data.",
    source: "Orísun",
  },
  pcm: {
    title: "Regional teaching scenario",
    intro:
      "Start with sourced Nigeria-inspired voltage context. Na the matching voltage fields below go change.",
    label: "Nigeria-inspired · for learning, e no be real grid replica",
    apply: "Apply 132 / 330 / 33 kV stages",
    applied: "E don apply to voltage comparison and diagram",
    frequency: "Normal frequency",
    currency: "Currency context",
    timeZone: "Time zone context",
    voltages: "Grid-code voltage stages (line-to-line)",
    resources: "Generation / weather profile",
    demand: "Demand profile",
    scope:
      "The preset sets 132 kV, 330 kV and 33 kV for their matching fields. E leave generator and consumer voltage as dem be. 11 kV dey as documented stage but no extra transformer node for here. Frequency, currency and timezone na context only; e no dey simulate national grid, weather or demand data.",
    source: "Source",
  },
};

export function RegionalGridPreset({ onApply }: { onApply: () => void }) {
  const locale = useContext(LanguageContext);
  const text = copy[locale];
  const [applied, setApplied] = useState(false);
  const preset = NIGERIA_TEACHING_PRESET;

  return (
    <section
      className="panel panel-pad pg-region"
      aria-labelledby="pg-region-title"
    >
      <header>
        <span className="eyebrow">
          <MapPin size={14} aria-hidden="true" /> {text.label}
        </span>
        <h3 id="pg-region-title">{text.title}</h3>
        <p>{text.intro}</p>
      </header>
      <dl className="pg-region-facts">
        <div>
          <dt>{text.frequency}</dt>
          <dd>{preset.frequencyHz} Hz</dd>
        </div>
        <div>
          <dt>{text.currency}</dt>
          <dd>{preset.currencyCode}</dd>
        </div>
        <div>
          <dt>{text.timeZone}</dt>
          <dd>{preset.timeZone}</dd>
        </div>
        <div>
          <dt>{text.voltages}</dt>
          <dd>
            {preset.nominalVoltageStagesKV.map((v) => `${v} kV`).join(" · ")}
          </dd>
        </div>
        <div>
          <dt>{text.resources}</dt>
          <dd>{preset.resourceProfile}</dd>
        </div>
        <div>
          <dt>{text.demand}</dt>
          <dd>{preset.demandProfile}</dd>
        </div>
      </dl>
      <p className="pg-region-scope">{text.scope}</p>
      <p className="pg-region-source">
        {text.source}:{" "}
        <a href={preset.sourceUrl} target="_blank" rel="noreferrer">
          {preset.sourceTitle}
        </a>{" "}
        ({preset.sourceDate}).
      </p>
      <button
        type="button"
        className="button"
        onClick={() => {
          onApply();
          setApplied(true);
        }}
      >
        {text.apply}
      </button>
      {applied && (
        <p className="pg-saved" role="status">
          {text.applied}
        </p>
      )}
    </section>
  );
}
