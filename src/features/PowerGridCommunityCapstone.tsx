import type { Locale } from "../i18n";
import type { MicrogridDispatchResult } from "../engine/microgridDispatch";

const copy = {
  en: [
    "Capstone: Community supply design",
    "Design an islanded supply that serves every critical load during the evening peak. Explain what changes if the backup generator is unavailable in that interval.",
    "The reference uses six four-hour intervals and 448 kWh of total demand. With the rural teaching day's PV and battery, a 30 kW backup with a 30 kW ramp limit serves all 448 kWh when the unit is available. These are illustrative profiles and a single-day energy balance.",
    "Load the rural case and pin it before you edit. Try changing PV size, battery capacity or backup power. Add an outage in interval 5 to test your design. Which resource supports the critical demand, and which risk remains? Record your justification and export the dispatch JSON.",
    "Load or reset community case",
    "Pin current dispatch as reference",
    "Design justification",
    "Critical energy unserved (kWh), reference → current",
  ],
  de: [
    "Abschlussaufgabe: Versorgung einer Gemeinde",
    "Entwerfen Sie eine Inselversorgung, die in der Abendspitze alle kritischen Lasten deckt. Erklären Sie die Folgen eines Generatorausfalls in diesem Intervall.",
    "Die Referenz nutzt sechs vierstündige Intervalle und 448 kWh Gesamtbedarf. Mit PV und Speicher des ländlichen Übungsfalls deckt ein verfügbarer 30-kW-Reservegenerator mit 30 kW Rampengrenze alle 448 kWh. Dies sind illustrative Profile und eine Energiebilanz für einen Tag.",
    "Laden und fixieren Sie den Übungsfall vor Änderungen. Ändern Sie PV-Größe, Speicherkapazität oder Generatorleistung. Testen Sie einen Ausfall im fünften Intervall. Welche Ressource versorgt die kritischen Lasten, und welches Risiko bleibt? Erfassen Sie Ihre Begründung und exportieren Sie das JSON.",
    "Gemeindefall laden oder zurücksetzen",
    "Aktuelle Simulation als Referenz fixieren",
    "Entwurfsbegründung",
    "Ungedeckte kritische Energie (kWh), Referenz → aktuell",
  ],
  yo: [
    "Ìdánwò ìparí: Àpẹrẹ ìpèsè agbára àwùjọ",
    "Ṣe àpẹrẹ ìpèsè aládàáṣiṣẹ́ fún gbogbo ẹrù pàtàkì ní ìrọ̀lẹ́. Ṣàlàyé ohun tó yí padà bí generator afẹ́yinti kò bá ṣiṣẹ́ ní àkókò yẹn.",
    "Àpẹẹrẹ ní àkókò mẹ́fà tí ọ̀kọ̀ọ̀kan jẹ́ wákàtí mẹ́rin àti 448 kWh ẹrù lápapọ̀. Pẹ̀lú PV àti batiri àpẹẹrẹ abúlé, generator 30 kW tó ní ààlà ìgòkè 30 kW lè pèsè gbogbo 448 kWh bí ó bá ṣiṣẹ́. Àpẹẹrẹ àti ìṣírò agbára ọjọ́ kan ni wọ́n.",
    "Gbé àpẹẹrẹ abúlé wọlé, kí o sì fi ṣe ìpìlẹ̀ kí o tó yí i padà. Yí PV, batiri tàbí generator padà. Fi ìdádúró sí àkókò karùn-ún láti dán àpẹrẹ wò. Orísun wo ló ń pèsè fún ẹrù pàtàkì? Ewu wo ló kù? Kọ ìdí rẹ kí o sì gba JSON.",
    "Gbé àpẹẹrẹ àwùjọ wọlé tàbí dá a padà",
    "Fi dispatch lọwọlọwọ ṣe ìpìlẹ̀",
    "Ìdí fún àpẹrẹ",
    "Agbára pàtàkì tí kò rí ìpèsè (kWh), ìpìlẹ̀ → lọwọlọwọ",
  ],
  pcm: [
    "Capstone: Community power design",
    "Design island supply wey go serve all critical loads for evening peak. Explain wetin change if backup generator no dey available for dat interval.",
    "Di reference get six four-hour intervals and 448 kWh total demand. With PV and battery from di rural case, available 30 kW backup with 30 kW ramp limit serve all 448 kWh. Na example profiles and energy balance for one day.",
    "Load rural case and pin am before you edit. Try change PV size, battery capacity or backup power. Add outage for interval 5 to test di design. Which resource support critical loads and which risk remain? Write your reason and download dispatch JSON.",
    "Load or reset community case",
    "Pin current dispatch as reference",
    "Reason for design",
    "Critical energy wey no get supply (kWh), reference → current",
  ],
} satisfies Record<Locale, readonly string[]>;

export function PowerGridCommunityCapstone({
  locale,
  reference,
  result,
  notes,
  onNotes,
  onLoad,
  onPin,
}: {
  locale: Locale;
  reference?: MicrogridDispatchResult;
  result: MicrogridDispatchResult | null;
  notes: string;
  onNotes: (notes: string) => void;
  onLoad: () => void;
  onPin: () => void;
}) {
  const [title, prediction, worked, question, load, pin, noteLabel, compare] =
    copy[locale];
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });

  return (
    <section
      className="panel panel-pad pg-panel"
      aria-labelledby="pg-community-capstone"
    >
      <h4 id="pg-community-capstone">{title}</h4>
      <p>{prediction}</p>
      <p>{worked}</p>
      <p>{question}</p>
      <div className="pg-actions">
        <button className="button" type="button" onClick={onLoad}>
          {load}
        </button>
        <button
          className="button"
          type="button"
          disabled={!result}
          onClick={onPin}
        >
          {pin}
        </button>
      </div>
      {reference && result && (
        <p role="status">
          {compare} {format.format(reference.criticalUnservedEnergyKWh)} →{" "}
          {format.format(result.criticalUnservedEnergyKWh)}
        </p>
      )}
      <label className="pg-field">
        <span>{noteLabel}</span>
        <textarea
          rows={2}
          maxLength={2000}
          value={notes}
          onChange={(event) => onNotes(event.currentTarget.value)}
        />
      </label>
    </section>
  );
}
