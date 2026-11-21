import type { Locale } from "../i18n";
import type { MicrogridDispatchResult } from "../engine/microgridDispatch";

export type DispatchLesson = "solar" | "evening" | "outage";

const ruralCopy = {
  en: [
    "Practical lesson: Microgrid operation",
    "Predict which resource will serve the rural microgrid after sunset and which load will go unserved first.",
    "The worked case represents six four-hour intervals of an illustrative day. The islanded system uses 48 kW DC of PV, an 80 kWh battery starting half full, and 15 kW of generic backup. Demand and critical demand are separate inputs.",
    "Worked result",
    "Backup energy (kWh)",
    "Battery throughput (kWh)",
    "Critical energy unserved (kWh)",
    "Noncritical energy unserved (kWh)",
    "Load the reference and reduce the battery power limit. Which intervals use more backup? Can you reduce noncritical shortfalls without increasing unmet critical demand? Export your run alongside the reference.",
    "Load or reset operating case",
    "Download microgrid operation report (JSON)",
  ],
  de: [
    "Praxisversuch: Mikronetzbetrieb",
    "Welche Ressource versorgt das ländliche Mikronetz nach Sonnenuntergang und welche Last bleibt zuerst ungedeckt?",
    "Das Beispiel umfasst sechs vierstündige Intervalle. Das Inselnetz nutzt 48 kW DC PV, einen anfangs halb geladenen 80-kWh-Speicher und 15 kW Reserveleistung. Gesamtlast und kritische Last sind getrennte Eingaben.",
    "Berechnetes Beispiel",
    "Reserveenergie (kWh)",
    "Speicherdurchsatz (kWh)",
    "Ungedeckte kritische Energie (kWh)",
    "Ungedeckte unkritische Energie (kWh)",
    "Laden Sie die Referenz und senken Sie die Speicherleistungsgrenze. In welchen Intervallen steigt die Reserveerzeugung? Können Sie unkritische Ausfälle reduzieren, ohne kritische Ausfälle zu erhöhen? Exportieren Sie Ihren Lauf mit der Referenz.",
    "Betriebsfall laden oder zurücksetzen",
    "Mikronetzbericht herunterladen (JSON)",
  ],
  yo: [
    "Ìdánwò: Ṣíṣiṣẹ́ microgrid",
    "Sọ àsọtẹ́lẹ̀ orísun tí yóò pèsè fún microgrid abúlé lẹ́yìn tí oòrùn bá wọ̀ àti ẹrù tí kò ní kọ́kọ́ rí agbára.",
    "Àpẹẹrẹ ní àkókò mẹ́fà tí ọ̀kọ̀ọ̀kan jẹ́ wákàtí mẹ́rin. Microgrid aládàáṣiṣẹ́ ní PV 48 kW DC, batiri 80 kWh tó bẹ̀rẹ̀ ní ìdajì, àti afẹ́yinti 15 kW. Ẹrù lápapọ̀ àti ẹrù pàtàkì jẹ́ iye ọ̀tọ̀.",
    "Èsì àpẹẹrẹ",
    "Agbára afẹ́yinti (kWh)",
    "Agbára tó gba inú batiri kọjá (kWh)",
    "Agbára pàtàkì tí kò rí ìpèsè (kWh)",
    "Agbára mìíràn tí kò rí ìpèsè (kWh)",
    "Gbé àpẹẹrẹ wọlé kí o sì dín ààlà agbára batiri kù. Àkókò wo ló nílò afẹ́yinti púpọ̀ sí i? Ṣé o lè dín àìní ẹrù mìíràn kù láìfi kún àìní ẹrù pàtàkì? Gba èsì rẹ pẹ̀lú àpẹẹrẹ.",
    "Gbé àpẹẹrẹ iṣẹ́ wọlé tàbí dá a padà",
    "Gba ìròyìn iṣẹ́ microgrid (JSON)",
  ],
  pcm: [
    "Practical lesson: Microgrid operation",
    "Predict which resource go supply di rural microgrid after sunset and which load no go get supply first.",
    "Di example day get six four-hour intervals. Di island grid get 48 kW DC of PV, 80 kWh battery wey start half full and 15 kW backup. Total load and critical load get separate inputs.",
    "Worked result",
    "Backup energy (kWh)",
    "Energy wey pass through battery (kWh)",
    "Critical energy wey no get supply (kWh)",
    "Other energy wey no get supply (kWh)",
    "Load di reference and reduce di battery power limit. Which intervals use more backup? You fit reduce shortage for other load without leaving more critical load unserved? Download your run with di reference.",
    "Load or reset operating case",
    "Download microgrid operation report (JSON)",
  ],
} satisfies Record<Locale, readonly string[]>;

export function PowerGridOperatingLesson({
  locale,
  reference,
  canExport,
  onReset,
  onExport,
}: {
  locale: Locale;
  reference: MicrogridDispatchResult;
  canExport: boolean;
  onReset: () => void;
  onExport: () => void;
}) {
  const [
    title,
    prediction,
    assumptions,
    worked,
    backup,
    battery,
    critical,
    other,
    question,
    reset,
    report,
  ] = ruralCopy[locale];
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  return (
    <section
      className="panel panel-pad pg-panel"
      aria-labelledby="pg-operating-lesson"
    >
      <h4 id="pg-operating-lesson">{title}</h4>
      <p>{prediction}</p>
      <p>{assumptions}</p>
      <details>
        <summary>{worked}</summary>
        <dl>
          <dt>{backup}</dt>
          <dd>{format.format(reference.backupEnergyKWh)}</dd>
          <dt>{battery}</dt>
          <dd>{format.format(reference.batteryThroughputKWh)}</dd>
          <dt>{critical}</dt>
          <dd>{format.format(reference.criticalUnservedEnergyKWh)}</dd>
          <dt>{other}</dt>
          <dd>{format.format(reference.nonCriticalUnservedEnergyKWh)}</dd>
        </dl>
      </details>
      <p>{question}</p>
      <div className="pg-actions">
        <button className="button" type="button" onClick={onReset}>
          {reset}
        </button>
        <button
          className="button"
          type="button"
          disabled={!canExport}
          onClick={onExport}
        >
          {report}
        </button>
      </div>
    </section>
  );
}

const lessons = {
  en: {
    solar: [
      "Practical lesson: Solar at midday",
      "Predict where midday PV goes when local demand is 10 kW and battery charging is limited to 20 kW.",
      "The noon hour has 40 kW available from the inverter. Demand takes 10 kW, the battery takes 20 kW, and 10 kW is curtailed because export starts at zero.",
      "Try a 10 kW grid export limit. How much curtailment remains? Which output would change if you increased battery capacity alone?",
      "Load or reset midday solar",
    ],
    evening: [
      "Practical lesson: Evening peak",
      "Predict how much of a 45 kW evening peak the battery can cover after the midday charge.",
      "The two one-hour intervals have no wind or backup, and ideal storage efficiency. After charging to 20 kWh, the battery serves 20 kW of the evening peak. All 10 kW of critical demand is served, and 25 kW of noncritical demand goes unserved.",
      "Increase starting charge, then vary battery power. Which limit controls evening discharge? Export the interval CSV to compare your cases.",
      "Load or reset evening peak",
    ],
    outage: [
      "Practical lesson: Generator outage",
      "Predict which loads lose supply when the generator trips in interval 2. The scene has no renewables or grid connection. A full 15 kWh battery supplies up to 5 kW and the 20 kW generator can ramp up by 10 kW per hour.",
      "Before the trip the generator supplies 5 kW with 5 kW of headroom. During the trip the battery alone supplies 5 kW, leaving 5 kW of critical and 20 kW of other load unserved. At restart the generator supplies 7 kW from zero.",
      "Clear the outage field and compare interval 2. Why is generator output limited even without a trip? Export the interval readings from both runs.",
      "Load or reset generator outage",
    ],
  },
  de: {
    solar: [
      "Praxisversuch: Solarstrom am Mittag",
      "Sagen Sie voraus, wohin der Solarstrom bei 10 kW Last und einer Ladegrenze von 20 kW fließt.",
      "Mittags liefert der Wechselrichter 40 kW. Die Verbraucher benötigen 10 kW, der Speicher lädt mit 20 kW und 10 kW werden bei zunächst gesperrter Einspeisung abgeregelt.",
      "Setzen Sie die Einspeisegrenze auf 10 kW. Wie viel bleibt abgeregelt? Welcher Wert ändert sich, wenn Sie nur die Speicherkapazität erhöhen?",
      "Mittagsversuch laden oder zurücksetzen",
    ],
    evening: [
      "Praxisversuch: Abendspitze",
      "Sagen Sie voraus, wie viel der abendlichen 45 kW der Speicher nach dem Laden am Mittag deckt.",
      "Die zwei einstündigen Intervalle haben weder Wind noch Reserveerzeuger. Der Speicher arbeitet verlustfrei. Nach dem Laden auf 20 kWh liefert er abends 20 kW. Die kritische Last von 10 kW wird vollständig versorgt, 25 kW unkritische Last bleiben ungedeckt.",
      "Erhöhen Sie die Anfangsladung und ändern Sie dann die Speicherleistung. Welche Grenze bestimmt die Entladung? Exportieren Sie die Intervall-CSV zum Vergleich.",
      "Abendversuch laden oder zurücksetzen",
    ],
    outage: [
      "Praxisversuch: Generatorausfall",
      "Welche Lasten fallen beim Generatorausfall im zweiten Intervall aus? Ohne Netz und erneuerbare Erzeugung liefert der volle 15-kWh-Speicher bis zu 5 kW. Der 20-kW-Generator erhöht seine Leistung um höchstens 10 kW pro Stunde.",
      "Vor dem Ausfall liefert der Generator 5 kW mit 5 kW Reserve. Beim Ausfall liefert nur der Speicher 5 kW. Damit bleiben 5 kW kritische Last und 20 kW sonstige Last ungedeckt. Beim Wiederanlauf liefert der Generator 7 kW ausgehend von null.",
      "Leeren Sie das Ausfallfeld und vergleichen Sie das zweite Intervall. Warum ist die Generatorleistung auch ohne Ausfall begrenzt? Exportieren Sie beide Intervallergebnisse.",
      "Generatorausfall laden oder zurücksetzen",
    ],
  },
  yo: {
    solar: [
      "Ìdánwò: Agbára oòrùn ní ọ̀sán",
      "Sọ àsọtẹ́lẹ̀ ibi tí agbára oòrùn yóò lọ bí ẹrù bá jẹ́ 10 kW tí ààlà gbigba agbara batiri sì jẹ́ 20 kW.",
      "Inverter ní 40 kW ní ọ̀sán. Ẹrù gba 10 kW, batiri gba 20 kW, a sì dín 10 kW kù nítorí ààlà fífi ránṣẹ́ bẹ̀rẹ̀ ní òdo.",
      "Gbìyànjú ààlà fífi 10 kW ránṣẹ́ sí grid. Iye wo ni a ṣì dín kù? Èsì wo ló yí padà bí o bá fi kún agbára ìpamọ́ batiri nìkan?",
      "Gbé àpẹẹrẹ ọ̀sán wọlé tàbí dá a padà",
    ],
    evening: [
      "Ìdánwò: Ẹrù gíga ní ìrọ̀lẹ́",
      "Sọ àsọtẹ́lẹ̀ iye tí batiri lè pèsè fún ẹrù 45 kW ní ìrọ̀lẹ́ lẹ́yìn gbigba agbara ọ̀sán.",
      "Afẹ́fẹ́ àti generator afẹ́yinti kò sí ní wákàtí méjèèjì. Batiri àpẹẹrẹ kò ní àdánù. Lẹ́yìn tó gba 20 kWh, ó pèsè 20 kW ní ìrọ̀lẹ́. Gbogbo ẹrù pàtàkì 10 kW rí agbára, 25 kW ẹrù mìíràn kò rí agbára.",
      "Fi kún iye ìbẹ̀rẹ̀ batiri, lẹ́yìn náà yí agbára batiri padà. Ààlà wo ló ń darí fífi agbára jáde? Gba CSV láti fi àwọn àpẹẹrẹ wé ara wọn.",
      "Gbé àpẹẹrẹ ìrọ̀lẹ́ wọlé tàbí dá a padà",
    ],
    outage: [
      "Ìdánwò: Ìdádúró generator",
      "Ẹrù wo ni kò ní rí agbára bí generator bá dá dúró ní àkókò kejì? Grid àti agbára àtúnlò kò sí. Batiri 15 kWh tí ó kún lè fúnni ní 5 kW. Generator 20 kW lè fi 10 kW kún iṣẹ́ rẹ̀ ní wákàtí kan.",
      "Ṣáájú ìdádúró, generator ń fúnni ní 5 kW, 5 kW sì kù. Nígbà ìdádúró, batiri nìkan ń fúnni ní 5 kW. Ẹrù pàtàkì 5 kW àti ẹrù mìíràn 20 kW kò rí agbára. Ní ìbẹ̀rẹ̀ padà, generator ń fúnni ní 7 kW láti òdo.",
      "Pa iye ìdádúró rẹ́ kí o sì wé àkókò kejì. Kí ló dé tí agbára generator ní ààlà bí kò bá dá dúró? Gba èsì méjèèjì.",
      "Gbé àpẹẹrẹ ìdádúró wọlé tàbí dá a padà",
    ],
  },
  pcm: {
    solar: [
      "Practical lesson: Solar for midday",
      "Predict where midday PV go if local demand na 10 kW and battery fit charge up to 20 kW.",
      "Inverter get 40 kW for noon. Load take 10 kW, battery take 20 kW and dem cut 10 kW because export limit start for zero.",
      "Try export limit of 10 kW. How much solar dem still cut? Which reading go change if na only battery capacity you increase?",
      "Load or reset midday solar",
    ],
    evening: [
      "Practical lesson: Evening peak",
      "Predict how much of di 45 kW evening peak battery fit serve after midday charging.",
      "No wind or backup for di two one-hour intervals, and battery no get losses for dis case. After e charge to 20 kWh, e supply 20 kW for evening. All 10 kW critical load get supply, and 25 kW of other load no get supply.",
      "Increase starting charge, then change battery power. Which limit control evening discharge? Download interval CSV to compare your cases.",
      "Load or reset evening peak",
    ],
    outage: [
      "Practical lesson: Generator outage",
      "Which loads no go get supply if generator trip for interval 2? No renewables or grid dey. Full 15 kWh battery fit give 5 kW. Di 20 kW generator fit add up to 10 kW each hour.",
      "Before di trip, generator supply 5 kW and 5 kW still dey available. During trip na only battery supply 5 kW. Critical load of 5 kW and other load of 20 kW no get supply. Generator restart from zero and supply 7 kW.",
      "Clear di outage field and compare interval 2. Why generator output get limit even without trip? Download interval readings for both runs.",
      "Load or reset generator outage",
    ],
  },
} as const;

export function PowerGridDispatchLessons({
  locale,
  onLoad,
}: {
  locale: Locale;
  onLoad: (lesson: DispatchLesson) => void;
}) {
  return (["solar", "evening", "outage"] as const).map((lesson) => {
    const [title, prediction, reference, question, load] =
      lessons[locale][lesson];
    const id = `pg-dispatch-lesson-${lesson}`;
    return (
      <section
        key={lesson}
        className="panel panel-pad pg-panel"
        aria-labelledby={id}
      >
        <h4 id={id}>{title}</h4>
        <p>{prediction}</p>
        <p>{reference}</p>
        <p>{question}</p>
        <button className="button" type="button" onClick={() => onLoad(lesson)}>
          {load}
        </button>
      </section>
    );
  });
}
