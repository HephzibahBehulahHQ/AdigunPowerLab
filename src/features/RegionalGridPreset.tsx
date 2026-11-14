import { useContext, useState } from "react";
import { MapPin } from "lucide-react";
import {
  REGIONAL_TEACHING_PRESETS,
  type RegionalTeachingPreset,
} from "../engine/powergridRegions";
import { LanguageContext } from "../i18n";
import type { Locale } from "../i18n";

const copy: Record<
  Locale,
  {
    title: string;
    intro: string;
    choose: string;
    nigeria: string;
    germany: string;
    label: string;
    labelGermany: string;
    apply: string;
    applyGermany: string;
    applied: string;
    frequency: string;
    currency: string;
    timeZone: string;
    voltages: string;
    resources: string;
    demand: string;
    scope: string;
    scopeGermany: string;
    source: string;
  }
> = {
  en: {
    title: "Regional teaching scenario",
    intro:
      "Choose a sourced teaching context. Applying it updates only the corresponding voltage fields below.",
    choose: "Engineering region",
    nigeria: "Nigeria-inspired",
    germany: "Germany-inspired · 50Hertz grid-area example",
    label: "Nigeria-inspired · educational, not an operational grid replica",
    labelGermany: "50Hertz-area example · not a complete national grid replica",
    apply: "Apply 132 / 330 / 33 kV stages",
    applyGermany: "Apply 220 / 380 / 110 / 0.4 kV stages",
    applied: "Applied to the voltage comparison and schematic",
    frequency: "Nominal frequency",
    currency: "Currency context",
    timeZone: "Time zone context",
    voltages: "Grid-code nominal stages (line-to-line)",
    resources: "Generation / weather profile",
    demand: "Demand profile",
    scope:
      "The preset applies 132 kV, 330 kV and 33 kV to the corresponding worksheet fields. It leaves generator and consumer voltage unchanged. 11 kV is listed as a documented stage but is not an extra transformer node here. Frequency, currency and time zone are context only; no national grid, weather or demand data is simulated.",
    scopeGermany:
      "The preset applies 220, 380 and 110 kV plus 0.4 kV consumer service; generator voltage remains unchanged. 20 kV is an illustrative point within the published 15–30 kV medium-voltage range. This uses a 50Hertz transmission-area example, not a complete national grid. Frequency is context only; no regional resource or demand data is simulated.",
    source: "Source",
  },
  de: {
    title: "Regionales Lehrszenario",
    intro:
      "Wählen Sie einen belegten Lehrkontext. Beim Anwenden werden nur passende Spannungsfelder geändert.",
    choose: "Technische Region",
    nigeria: "Nigeria-inspiriert",
    germany: "Deutschland-inspiriert · Beispiel aus dem 50Hertz-Netzgebiet",
    label: "Nigeria-inspiriert · Lehrszenario, keine Netzabbildung",
    labelGermany:
      "50Hertz-Gebietsbeispiel · kein vollständiges nationales Netzmodell",
    apply: "Spannungsstufen 132 / 330 / 33 kV anwenden",
    applyGermany: "Spannungsstufen 220 / 380 / 110 / 0,4 kV anwenden",
    applied: "Auf Spannungsvergleich und Schema angewendet",
    frequency: "Nennfrequenz",
    currency: "Währungskontext",
    timeZone: "Zeitzonenkontext",
    voltages: "Nennstufen laut Netzkodex (Leiter-Leiter)",
    resources: "Erzeugungs-/Wetterprofil",
    demand: "Lastprofil",
    scope:
      "Die Vorgabe setzt 132 kV, 330 kV und 33 kV in die passenden Felder ein. Generator- und Verbraucherspannung bleiben unverändert. 11 kV ist als belegte Stufe aufgeführt, aber hier kein zusätzlicher Transformator. Frequenz, Währung und Zeitzone dienen nur als Kontext; nationale Netz-, Wetter- oder Lastdaten werden nicht simuliert.",
    scopeGermany:
      "Die Vorgabe setzt 220, 380 und 110 kV sowie 0,4 kV Verbraucherspannung ein; die Generatorspannung bleibt unverändert. 20 kV ist ein illustrativer Wert im belegten Mittelspannungsbereich 15–30 kV. Verwendet wird ein Beispiel aus dem 50Hertz-Netzgebiet, kein vollständiges nationales Netzmodell. Frequenz ist nur Kontext; regionale Erzeugungs- und Lastprofile werden nicht simuliert.",
    source: "Quelle",
  },
  yo: {
    title: "Àpẹẹrẹ agbègbè fún ìkẹ́kọ̀ọ́",
    intro:
      "Yan àyíká ẹ̀kọ́ tó ní orísun. Bíbá a lò yóò yí àwọn field foliteji tó bá mu nìkan padà.",
    choose: "Agbègbè ẹ̀rọ itanna",
    nigeria: "Àpẹẹrẹ Nigeria",
    germany: "Àpẹẹrẹ Germany · agbègbè 50Hertz",
    label: "Àpẹẹrẹ Nigeria · fún ẹ̀kọ́, kì í ṣe àwòrán grid gidi",
    labelGermany: "Àpẹẹrẹ agbègbè 50Hertz · kì í ṣe gbogbo grid orílẹ̀-èdè",
    apply: "Lo àwọn ipele 132 / 330 / 33 kV",
    applyGermany: "Lo 220 / 380 / 110 / 0.4 kV",
    applied: "A ti fi sí ìfiwéra foliteji àti àwòrán",
    frequency: "Frequency àkọ́kọ́",
    currency: "Àyíká owó",
    timeZone: "Àyíká àkókò",
    voltages: "Àwọn ipele nominal grid-code (laàárín waya)",
    resources: "Àwòrán generation / weather",
    demand: "Àwòrán demand",
    scope:
      "Àpẹẹrẹ yìí fi 132 kV, 330 kV àti 33 kV sí àwọn field tó bá mu. Kò yí voltage generator tàbí consumer padà. A ti darúkọ 11 kV gẹ́gẹ́ bí ipele tó ní ẹ̀rí, ṣùgbọ́n kì í ṣe transformer node míì nínú schema yìí. Frequency, owó àti timezone jẹ́ àlàyé àyíká; a kò ṣe àwòṣe national grid, weather tàbí demand data.",
    scopeGermany:
      "Àpẹẹrẹ yìí fi 220, 380 àti 110 kV pẹ̀lú 0.4 kV consumer voltage sílẹ̀; generator voltage kò yí padà. 20 kV jẹ́ iye àpẹẹrẹ láàárín ìpele 15–30 kV tó ní orísun. Èyí jẹ́ àpẹẹrẹ agbègbè 50Hertz, kì í ṣe gbogbo grid Germany. Frequency jẹ́ àlàyé àyíká; a kò ṣe àwòṣe generation tàbí demand agbègbè.",
    source: "Orísun",
  },
  pcm: {
    title: "Regional teaching scenario",
    intro:
      "Choose sourced learning context. Apply am to change only matching voltage fields below.",
    choose: "Engineering region",
    nigeria: "Nigeria-inspired",
    germany: "Germany-inspired · 50Hertz area example",
    label: "Nigeria-inspired · for learning, e no be real grid replica",
    labelGermany: "50Hertz-area example · e no cover complete national grid",
    apply: "Apply 132 / 330 / 33 kV stages",
    applyGermany: "Apply 220 / 380 / 110 / 0.4 kV stages",
    applied: "E don apply to voltage comparison and diagram",
    frequency: "Normal frequency",
    currency: "Currency context",
    timeZone: "Time zone context",
    voltages: "Grid-code voltage stages (line-to-line)",
    resources: "Generation / weather profile",
    demand: "Demand profile",
    scope:
      "The preset sets 132 kV, 330 kV and 33 kV for their matching fields. E leave generator and consumer voltage as dem be. 11 kV dey as documented stage but no extra transformer node for here. Frequency, currency and timezone na context only; e no dey simulate national grid, weather or demand data.",
    scopeGermany:
      "Di preset sets 220, 380 and 110 kV plus 0.4 kV consumer voltage; generator voltage no change. 20 kV na illustrative point inside di published 15–30 kV medium-voltage range. Na 50Hertz-area example, no be full national grid. Frequency na context only; no regional resource or demand data dey simulate.",
    source: "Source",
  },
};

export function RegionalGridPreset({
  onApply,
}: {
  onApply: (preset: RegionalTeachingPreset) => void;
}) {
  const locale = useContext(LanguageContext);
  const text = copy[locale];
  const [applied, setApplied] = useState(false);
  const [selectedId, setSelectedId] = useState("nigeria-inspired");
  const preset = REGIONAL_TEACHING_PRESETS.find(
    (item) => item.id === selectedId,
  )!;
  const isNigeria = preset.id === "nigeria-inspired";

  return (
    <section
      className="panel panel-pad pg-region"
      aria-labelledby="pg-region-title"
    >
      <header>
        <span className="eyebrow">
          <MapPin size={14} aria-hidden="true" />
          {isNigeria ? text.label : text.labelGermany}
        </span>
        <h3 id="pg-region-title">{text.title}</h3>
        <p>{text.intro}</p>
      </header>
      <label className="pg-field">
        <span>{text.choose}</span>
        <select
          aria-label={text.choose}
          value={selectedId}
          onChange={(event) => {
            setSelectedId(event.currentTarget.value);
            setApplied(false);
          }}
        >
          <option value="nigeria-inspired">{text.nigeria}</option>
          <option value="germany-inspired">{text.germany}</option>
        </select>
      </label>
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
      <p className="pg-region-scope">
        {isNigeria ? text.scope : text.scopeGermany}
      </p>
      <ul className="pg-region-sources">
        {preset.sourceReferences.map((source) => (
          <li key={source.url}>
            {text.source}:{" "}
            <a href={source.url} target="_blank" rel="noreferrer">
              {source.title}
            </a>{" "}
            ({source.date}).
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="button"
        onClick={() => {
          onApply(preset);
          setApplied(true);
        }}
      >
        {isNigeria ? text.apply : text.applyGermany}
      </button>
      {applied && (
        <p className="pg-saved" role="status">
          {text.applied}
        </p>
      )}
    </section>
  );
}
