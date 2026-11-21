import type { Locale } from "../i18n";

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
  },
} as const;

export function PowerGridDispatchLessons({
  locale,
  onLoad,
}: {
  locale: Locale;
  onLoad: (lesson: "solar" | "evening") => void;
}) {
  return (["solar", "evening"] as const).map((lesson) => {
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
