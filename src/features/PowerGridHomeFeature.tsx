import { useState } from "react";
import type { Locale } from "../i18n";

type Copy = {
  title: string;
  intro: string;
  lab: string;
  labDescription: string;
  transmission: string;
  transmissionDescription: string;
  feeder: string;
  feederDescription: string;
  photos: string;
  video: string;
  play: string;
  producer: string;
  videoNote: string;
  sources: string;
};

const copy: Record<Locale, Copy> = {
  en: {
    title: "Power systems, from station to socket",
    intro:
      "Explore real facility photographs and documentary footage, then open the working calculations. These images show named operating facilities; they are not measurements from this project.",
    lab: "Generation, transmission & losses",
    labDescription:
      "Compare three-phase current and conductor losses at two entered transmission voltages.",
    transmission: "Open POWERGRID LAB",
    transmissionDescription:
      "Open the isolated From Source to Socket laboratory.",
    feeder: "Feeder voltage drop",
    feederDescription:
      "Inspect branch voltage, loading and losses from the entered radial network.",
    photos: "Inside real power facilities",
    video: "Powerhouse and river context",
    play: "Play documentary video",
    producer: "U.S. Army Corps of Engineers · DVIDS",
    videoNote:
      "This time lapse shows the Garrison Dam powerhouse and Missouri River. It does not show turbine internals or measured generation.",
    sources: "Open source record",
  },
  de: {
    title: "Energieversorgung vom Kraftwerk bis zur Steckdose",
    intro:
      "Entdecken Sie echte Fotos und dokumentarische Aufnahmen und öffnen Sie anschließend die Berechnungen. Die Bilder zeigen benannte Anlagen, keine Messwerte dieses Projekts.",
    lab: "Erzeugung, Übertragung & Verluste",
    labDescription:
      "Vergleichen Sie Drehstrom und Leiterverluste bei zwei eingegebenen Übertragungsspannungen.",
    transmission: "POWERGRID LAB öffnen",
    transmissionDescription:
      "Öffnet das eigenständige Labor von der Quelle bis zum Verbraucher.",
    feeder: "Spannungsfall im Abzweig",
    feederDescription:
      "Prüfen Sie Spannung, Auslastung und Verluste des eingegebenen Strahlennetzes.",
    photos: "Einblick in reale Energieanlagen",
    video: "Kraftwerk und Fluss",
    play: "Dokumentarfilm abspielen",
    producer: "U.S. Army Corps of Engineers · DVIDS",
    videoNote:
      "Der Zeitraffer zeigt das Kraftwerk am Garrison Dam und den Missouri. Er zeigt weder das Turbineninnere noch gemessene Erzeugung.",
    sources: "Quelldatensatz öffnen",
  },
  yo: {
    title: "Láti ibùdó agbára dé ilé oníbàárà",
    intro:
      "Wo fọ́tò gidi àti fídíò ìwé-àkọsílẹ̀, lẹ́yìn náà ṣí àwọn ìṣirò tó ń ṣiṣẹ́. Àwòrán wọ̀nyí jẹ́ ti àwọn ibùdó tó ní orúkọ; wọn kì í ṣe ìwọ̀n iṣẹ́ agbára yìí.",
    lab: "Ìṣẹ̀dá, gbigbe àti losses",
    labDescription:
      "Fi current aláfàsẹ́ mẹ́ta àti losses waya wé ní transmission voltage méjì tí a tẹ̀.",
    transmission: "Ṣí POWERGRID LAB",
    transmissionDescription: "Ṣí lab From Source to Socket tó yà sọ́tọ̀.",
    feeder: "Voltage drop feeder",
    feederDescription:
      "Ṣàyẹ̀wò voltage ẹ̀ka, loading àti losses nínú network radial tí a tẹ̀.",
    photos: "Wo inú àwọn ibùdó agbára gidi",
    video: "Àwòrán powerhouse àti odò",
    play: "Ṣeré fídíò ìwé-àkọsílẹ̀",
    producer: "U.S. Army Corps of Engineers · DVIDS",
    videoNote:
      "Time-lapse yìí fi powerhouse Garrison Dam àti Odò Missouri hàn. Kò fi turbine inú hàn tàbí generation measurement.",
    sources: "Ṣí àkọsílẹ̀ orísun",
  },
  pcm: {
    title: "From power station reach the socket",
    intro:
      "See real facility photos and documentary footage, then open working calculations. These pictures show named facilities; dem no be measurements from this project.",
    lab: "Generation, transmission and losses",
    labDescription:
      "Compare three-phase current and wire losses at two transmission voltages wey you enter.",
    transmission: "Open POWERGRID LAB",
    transmissionDescription:
      "Open the separate From Source to Socket laboratory.",
    feeder: "Feeder voltage drop",
    feederDescription:
      "Check branch voltage, loading and losses from the radial network wey you enter.",
    photos: "Inside real power facilities",
    video: "Powerhouse and river context",
    play: "Play documentary video",
    producer: "U.S. Army Corps of Engineers · DVIDS",
    videoNote:
      "This time lapse shows Garrison Dam powerhouse and Missouri River. E no show turbine inside or measured generation.",
    sources: "Open source record",
  },
};

const photos = [
  {
    image: "/assets/powergrid/field-photos/hydro-generator.jpg",
    title: {
      en: "Bonneville powerhouse generator",
      de: "Generator im Kraftwerk Bonneville",
      yo: "Generator ilé agbára Bonneville",
      pcm: "Bonneville powerhouse generator",
    },
    alt: {
      en: "Top of a vertical hydroelectric generating unit inside Bonneville Lock and Dam powerhouse.",
      de: "Oberseite einer vertikalen Wasserkraftmaschine im Krafthaus von Bonneville Lock and Dam.",
      yo: "Òkè generator hydroelectric inaro nínú powerhouse Bonneville Lock and Dam.",
      pcm: "Top of one vertical hydroelectric unit inside Bonneville Lock and Dam powerhouse.",
    },
    credit:
      "John Leonard · U.S. Army Corps of Engineers, Northwestern Division",
    source:
      "https://www.dvidshub.net/image/7443974/generator-bonneville-lock-and-dam",
  },
  {
    image: "/assets/powergrid/field-photos/substation-switchyard.jpg",
    title: {
      en: "Al Ameen 400 kV substation",
      de: "Umspannwerk Al Ameen mit 400 kV",
      yo: "Substation Al Ameen 400 kV",
      pcm: "Al Ameen 400 kV substation",
    },
    alt: {
      en: "High-voltage gas-insulated substation bays with tall insulated bushings and metal bus connections.",
      de: "Felder eines gasisolierten Hochspannungs-Umspannwerks mit hohen Durchführungen und metallischen Sammelschienen.",
      yo: "Àwọn bay substation high-voltage pẹ̀lú bushing gíga àti bus connection irin.",
      pcm: "High-voltage substation bays with insulated bushings and metal bus connections.",
    },
    credit: "U.S. Army courtesy photo · DVIDS",
    source:
      "https://www.dvidshub.net/image/6274/al-ameen-substation-400-kilovolt-gas-insulated-system",
  },
  {
    image: "/assets/powergrid/field-photos/distribution-pole-transformer.jpg",
    title: {
      en: "Pole-mounted distribution transformer",
      de: "Masttransformator der Ortsnetzverteilung",
      yo: "Distribution transformer lórí pópó",
      pcm: "Pole-mounted distribution transformer",
    },
    alt: {
      en: "Pole-mounted transformer and distribution conductors delivering utility power at a consumer connection.",
      de: "Masttransformator und Verteilungsleiter an einem Netzanschluss für Verbraucher.",
      yo: "Transformer lórí pópó àti àwọn waya distribution tó ń pèsè agbára sí oníbàárà.",
      pcm: "Pole transformer and distribution conductors at a consumer service connection.",
    },
    credit: "U.S. Army Corps of Engineers · DVIDS",
    source: "https://www.dvidshub.net/image/1811/electrical-line",
  },,

  {
    image: "/assets/powergrid/field-photos/hydro-spillway.jpg",
    title: { en: "Water over the Terminus Dam spillway", de: "Wasser am Überlauf des Terminus Dam", yo: "Omi tó ń ṣàn lórí spillway Terminus Dam", pcm: "Water dey flow over Terminus Dam spillway" },
    alt: { en: "Water flowing over the fuse gates of the Terminus Dam spillway.", de: "Wasser strömt über die Sicherungstore des Terminus-Damms.", yo: "Omi ń ṣàn lórí àwọn fuse gate spillway Terminus Dam.", pcm: "Water dey flow over the fuse gates of Terminus Dam spillway." },
    credit: "Ryan Watson · U.S. Army Corps of Engineers, Sacramento District",
    source: "https://www.dvidshub.net/image/7741243/water-flows-over-fuse-gates-spillway-terminus-dam",
  },
  {
    image: "/assets/powergrid/field-photos/step-up-transformer.jpg",
    title: { en: "Generator step-up transformer delivery", de: "Anlieferung eines Generator-Aufwärtstransformators", yo: "Gbigbe transformer step-up generator", pcm: "Generator step-up transformer delivery" },
    alt: { en: "A generator step-up transformer secured on a rail car during delivery to Fort Randall Powerhouse.", de: "Ein Generator-Aufwärtstransformator ist für die Anlieferung zum Kraftwerk Fort Randall auf einem Güterwagen gesichert.", yo: "A so transformer step-up generator mọ́lẹ̀ lórí kẹ̀kẹ́ ojú irin nígbà tí wọ́n ń gbé e lọ sí Fort Randall Powerhouse.", pcm: "A generator step-up transformer dey secure on rail car as dem carry am go Fort Randall Powerhouse." },
    credit: "Jason Colbert · U.S. Army Corps of Engineers, Omaha District",
    source: "https://www.dvidshub.net/image/7397026/new-generator-step-up-transformers",
  },
  {
    image: "/assets/powergrid/field-photos/transmission-tower-damage.jpg",
    title: { en: "Storm-damaged transmission tower · failure case", de: "Sturmgeschädigter Übertragungsmast · Schadensbeispiel", yo: "Tower gbigbe tó bàjẹ́ ní ìjì · àpẹẹrẹ ìkùnà", pcm: "Transmission tower wey storm damage · failure example" },
    alt: { en: "A damaged steel lattice transmission tower after a storm; shown as a failure case, not a normal operating condition.", de: "Ein beschädigter Stahlgittermast nach einem Sturm; Schadensbeispiel, kein normaler Betriebszustand.", yo: "Tower irin lattice tó bàjẹ́ lẹ́yìn ìjì; àpẹẹrẹ ìkùnà ni, kì í ṣe iṣẹ́ déédéé.", pcm: "Storm-damaged steel lattice transmission tower; failure example, not normal operation." },
    credit: "Eliud Echevarria · Federal Emergency Management Agency",
    source: "https://www.dvidshub.net/image/3867225/damaged-electrical-transmission-tower",
  },
  {
    image: "/assets/powergrid/field-photos/solar-array.jpg",
    title: { en: "Eglin solar energy array", de: "Solarpark auf der Eglin-Anlage", yo: "Solar array agbára Eglin", pcm: "Eglin solar energy array" },
    alt: { en: "Rows of photovoltaic panels across the Eglin solar energy field.", de: "Reihen von Photovoltaikmodulen auf dem Solarfeld Eglin.", yo: "Àwọn photovoltaic panel ní ìlà káàkiri pápá solar agbára Eglin.", pcm: "Rows of solar PV panels across Eglin solar field." },
    credit: "Samuel King Jr. · 96th Test Wing",
    source: "https://www.dvidshub.net/image/7586867/eglin-solar-energy-array",
  },
  {
    image: "/assets/powergrid/field-photos/wind-utility-scale.jpg",
    title: { en: "Wind turbine at Tooele · facility-scale example", de: "Windkraftanlage in Tooele · Beispiel im Anlagenmaßstab", yo: "Wind turbine ní Tooele · àpẹẹrẹ ìwọ̀n facility", pcm: "Wind turbine for Tooele · facility-scale example" },
    alt: { en: "A utility-scale wind turbine above the Stirling solar array at Tooele; the historic source does not establish current operating status.", de: "Eine Windkraftanlage über dem Stirling-Solarfeld in Tooele; die historische Quelle bestätigt keinen aktuellen Betriebszustand.", yo: "Wind turbine ńlá lókè Stirling solar array ní Tooele; orísun àtijọ́ yìí kò fi hàn pé ó ṣì ń ṣiṣẹ́ báyìí.", pcm: "A utility-size wind turbine above Stirling solar array for Tooele; the old source no confirm say e dey operate now." },
    credit: "John Prettyman · U.S. Army Corps of Engineers, Sacramento District",
    source: "https://www.dvidshub.net/image/3117643/second-wind-turbine-brings-tooele-army-depot-closer-to-net-zero-energy",
  },
] as const;

const video = {
  embed: "https://www.dvidshub.net/video/embed/1014627",
  source:
    "https://www.dvidshub.net/video/1014627/garrison-dam-powerhouse-time-lapse",
};

export function PowerGridHomeFeature({
  locale,
  onRoute,
}: {
  locale: Locale;
  onRoute: (route: string) => void;
}) {
  const text = copy[locale];
  const [playing, setPlaying] = useState(false);

  return (
    <section
      className="pg-home-feature"
      aria-labelledby="pg-home-feature-title"
    >
      <header className="pg-home-feature-heading">
        <div>
          <span className="eyebrow">HB ELEKTRONIKER · POWER SYSTEMS</span>
          <h3 id="pg-home-feature-title">{text.title}</h3>
          <p>{text.intro}</p>
        </div>
        <button
          className="button primary"
          type="button"
          onClick={() => onRoute("powergrid")}
        >
          {text.transmission}
        </button>
      </header>

      <div className="pg-home-tools">
        <article>
          <span className="eyebrow">{text.lab}</span>
          <p>{text.labDescription}</p>
          <button
            className="text-button"
            type="button"
            onClick={() => onRoute("powergrid")}
          >
            {text.transmission}
          </button>
        </article>
        <article>
          <span className="eyebrow">{text.feeder}</span>
          <p>{text.feederDescription}</p>
          <button
            className="text-button"
            type="button"
            onClick={() => onRoute("cables")}
          >
            {text.feeder}
          </button>
        </article>
      </div>

      <h4>{text.photos}</h4>
      <div className="pg-home-photo-grid">
        {photos.map((photo) => (
          <article className="pg-home-photo" key={photo.image}>
            <a href={photo.source} target="_blank" rel="noreferrer">
              <img
                src={photo.image}
                alt={photo.alt[locale]}
                loading="lazy"
                decoding="async"
              />
            </a>
            <div>
              <h5>{photo.title[locale]}</h5>
              <p>{photo.credit}</p>
              <a href={photo.source} target="_blank" rel="noreferrer">
                {text.sources}
              </a>
            </div>
          </article>
        ))}
      </div>

      <article className="pg-home-video">
        <div className="pg-home-video-frame">
          {playing ? (
            <iframe
              src={video.embed}
              title={text.video}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              aria-label={text.play}
              onClick={() => setPlaying(true)}
            >
              <span aria-hidden="true">▶</span>
              {text.play}
            </button>
          )}
        </div>
        <div>
          <span className="eyebrow">{text.video}</span>
          <p>{text.videoNote}</p>
          <p>{text.producer}</p>
          <a href={video.source} target="_blank" rel="noreferrer">
            {text.sources}
          </a>
        </div>
      </article>
    </section>
  );
}
