import { useState } from "react";
import type { Locale } from "../i18n";

const cases = {
  loads: {
    clip: "939154",
    slug: "usace-completes-installation-two-emergency-generators-hendersonville-nc",
    image: "distribution-consumers.png",
    credit: "Charles Delano · USACE, Wilmington District",
    copy: {
      en: [
        "Build a load list for backup power",
        "Watch backup generators arrive at a treatment plant",
        "In a reference project, double the quantity of one load. Compare installed power and daily energy before and after.",
      ],
      de: [
        "Lastliste für die Ersatzstromversorgung erstellen",
        "Ersatzgeneratoren an einer Kläranlage ansehen",
        "Verdoppeln Sie in einem Referenzprojekt die Stückzahl eines Verbrauchers. Vergleichen Sie installierte Leistung und Tagesenergie.",
      ],
      yo: [
        "Ṣe àkójọ ẹrù fún agbára àfẹ́yinti",
        "Wo bí wọ́n ṣe mú generator dé ilé ìtọ́jú omi",
        "Nínú iṣẹ́ àpẹẹrẹ, ṣe iye ẹrù kan lẹ́ẹ̀mejì. Wé agbára tí a fi sílẹ̀ àti agbára ojoojúmọ́.",
      ],
      pcm: [
        "Build load list for backup power",
        "Watch backup generators reach treatment plant",
        "For reference project, double quantity of one load. Compare installed power and daily energy before and after.",
      ],
    },
    action: {
      en: "Go to the load list",
      de: "Zur Lastliste",
      yo: "Lọ sí àkójọ ẹrù",
      pcm: "Open di load list",
    },
  },
  boards: {
    clip: "1007562",
    slug: "powering-ohio-river-black-lions-mission",
    image: "electrical-test-tools.png",
    credit: "Charles Delano · USACE, Louisville District",
    copy: {
      en: [
        "Compare circuit demand and protection",
        "Watch circuit breaker inspection at Cannelton Locks and Dam",
        "Open a circuit in a reference project and identify its assigned loads. Compare design current with the entered breaker rating.",
      ],
      de: [
        "Stromkreislast und Schutz vergleichen",
        "Leistungsschalterprüfung in Cannelton ansehen",
        "Öffnen Sie einen Stromkreis im Referenzprojekt, prüfen Sie die zugeordneten Verbraucher und vergleichen Sie Bemessungsstrom und Schutzschalterwert.",
      ],
      yo: [
        "Wé ìbéèrè iyíká àti ààbò rẹ̀",
        "Wo àyẹ̀wò breaker ní Cannelton",
        "Ṣí iyíká kan nínú iṣẹ́ àpẹẹrẹ, kí o rí àwọn ẹrù rẹ̀. Wé ìṣàn iná àpẹrẹ pẹ̀lú iye breaker.",
      ],
      pcm: [
        "Compare circuit demand and protection",
        "Watch breaker inspection for Cannelton",
        "Open one circuit for reference project and check di loads wey dey on am. Compare design current and breaker rating.",
      ],
    },
    action: {
      en: "Go to the circuit list",
      de: "Zur Stromkreisliste",
      yo: "Lọ sí àkójọ iyíká",
      pcm: "Open di circuit list",
    },
  },
  diagram: {
    clip: "902345",
    slug: "transformer-installation-timelapse-fort-randall-dam",
    image: "grid-transformer-switchyard.png",
    credit: "Samuel Weldin · USACE, Omaha District",
    copy: {
      en: [
        "Trace the supply in a single-line diagram",
        "Watch a step-up transformer installation",
        "In Single-Line Studio, select a supply node and follow its branches to the connected boards and loads.",
      ],
      de: [
        "Versorgung im Einlinienschema verfolgen",
        "Einbau eines Hochtransformators ansehen",
        "Wählen Sie einen Einspeiseknoten und verfolgen Sie seine Abzweige zu Verteilern und Verbrauchern.",
      ],
      yo: [
        "Tẹ̀lé ipèsè nínú àwòrán ìlà kan",
        "Wo bí wọ́n ṣe fi transformer agbégbè sókè sí",
        "Yan ibi ìpèsè, kí o sì tẹ̀lé ẹ̀ka rẹ̀ dé pátákó àti àwọn ẹrù.",
      ],
      pcm: [
        "Trace supply for single-line diagram",
        "Watch how dem install step-up transformer",
        "Choose one supply node and follow di branches reach di boards and loads.",
      ],
    },
    action: {
      en: "Go to the diagram",
      de: "Zum Schaltbild",
      yo: "Lọ sí àwòrán",
      pcm: "Open di diagram",
    },
  },
  simulation: {
    clip: "993768",
    slug: "usace-powerhouses-support-grid-demands-during-2026-winter-storm",
    image: "powergrid/field-photos/hydro-generator.jpg",
    credit: "U.S. Army Corps of Engineers",
    copy: {
      en: [
        "Find the hours with highest demand",
        "Watch powerhouses respond to winter grid demand",
        "Run the simulation for a project with scheduled loads. Find the peak on the demand chart and inspect the loads running at that time.",
      ],
      de: [
        "Stunden mit höchster Nachfrage finden",
        "Kraftwerke bei winterlicher Netzlast ansehen",
        "Simulieren Sie ein Projekt mit geplanten Lasten. Finden Sie die Lastspitze und prüfen Sie die dann aktiven Verbraucher.",
      ],
      yo: [
        "Wá àkókò tí ìbéèrè agbára ga jù",
        "Wo bí ilé amúná ṣe dáhùn sí ìbéèrè ní òtútù",
        "Ṣe ìdánwò pẹ̀lú ẹrù tí a ṣètò. Wá ibi tí ìbéèrè ga jù, kí o sì wo ẹrù tó ń ṣiṣẹ́ ní àkókò yẹn.",
      ],
      pcm: [
        "Find di hours wey demand high pass",
        "Watch how powerhouses respond to winter grid demand",
        "Run simulation with scheduled loads. Find di demand peak and check di loads wey dey run dat time.",
      ],
    },
    action: {
      en: "Go to the simulation",
      de: "Zur Simulation",
      yo: "Lọ sí ìdánwò",
      pcm: "Open di simulation",
    },
  },
  quality: {
    clip: "-Cp9guj0B_M",
    slug: "",
    image: "electrical-test-tools.png",
    credit: "Schneider Electric",
    copy: {
      en: [
        "Compare capacitor bank demand",
        "Watch a capacitor bank demonstration",
        "Open Power-factor correction. Raise target displacement power factor from 0.95 to 0.98 and compare the required correction in kvar.",
      ],
      de: [
        "Kondensatorbedarf vergleichen",
        "Vorführung einer Kondensatoranlage ansehen",
        "Öffnen Sie die Leistungsfaktorkorrektur. Erhöhen Sie den Zielwert von 0,95 auf 0,98 und vergleichen Sie den Bedarf in kvar.",
      ],
      yo: [
        "Wé iye capacitor tí a nílò",
        "Wo àfihàn àkójọpọ̀ capacitor",
        "Ṣí ìṣírò àtúnṣe power factor. Gbé àfojúsùn sókè láti 0.95 sí 0.98, kí o sì wé iye kvar tí a nílò.",
      ],
      pcm: [
        "Compare capacitor bank demand",
        "Watch di capacitor bank demo",
        "Open Power-factor correction. Raise target power factor from 0.95 to 0.98 and compare di kvar wey e need.",
      ],
    },
  },
  ev: {
    clip: "373814",
    slug: "us-air-force-tests-first-all-electric-vehicle-fleet-california",
    image: "distribution-consumers.png",
    credit: "Krista Knaus · U.S. Air Force",
    copy: {
      en: [
        "Fit charging into the parking window",
        "Watch a fleet charging demonstration",
        "Keep the charger limit fixed and move departure earlier. Compare unmet energy before and after.",
      ],
      de: [
        "Laden innerhalb der Standzeit",
        "Vorführung einer Flottenladestation ansehen",
        "Lassen Sie die Ladeleistung unverändert und setzen Sie die Abfahrt früher an. Vergleichen Sie die fehlende Energie.",
      ],
      yo: [
        "Ṣètò gbigba agbára ní àkókò ìdúró",
        "Wo àfihàn bí ọkọ̀ iná ṣe ń gba agbára",
        "Jẹ́ kí ààlà agbára ṣaja dúró, kí o sì mú ìgbà ìlọ kù. Wé agbára tí kò pé.",
      ],
      pcm: [
        "Fit charging inside parking time",
        "Watch di fleet charging demo",
        "Keep di charger limit di same and move departure earlier. Compare energy wey di vehicle no get.",
      ],
    },
  },
  renewables: {
    clip: "937640",
    slug: "b-roll-ribbon-cutting-ceremony-renewable-energy-microgrid-fort-hunter-liggett",
    image: "powergrid/field-photos/solar-array.jpg",
    credit: "Christopher Oposnow · U.S. Army Reserve",
    copy: {
      en: [
        "Store solar energy for later",
        "Watch the Fort Hunter Liggett microgrid footage",
        "Run the same solar and load profiles with two battery capacities. Compare critical unserved energy.",
      ],
      de: [
        "Solarenergie für später speichern",
        "Video zum Mikronetz in Fort Hunter Liggett ansehen",
        "Berechnen Sie dieselben Solar- und Lastprofile mit zwei Batteriekapazitäten. Vergleichen Sie die unversorgte kritische Energie.",
      ],
      yo: [
        "Fi agbára oòrùn pamọ́ fún ìgbà míì",
        "Wo fídíò microgrid Fort Hunter Liggett",
        "Lo profaili oòrùn àti ẹrù kan náà pẹ̀lú agbára batiri méjì. Wé agbára tí ẹrù pàtàkì kò rí gbà.",
      ],
      pcm: [
        "Store sunlight power for later",
        "Watch di Fort Hunter Liggett microgrid video",
        "Run di same solar and load profiles with two battery sizes. Compare energy wey critical loads no get.",
      ],
    },
  },
  cables: {
    clip: "902345",
    slug: "transformer-installation-timelapse-fort-randall-dam",
    image: "powergrid/field-photos/step-up-transformer.jpg",
    credit: "Samuel Weldin · USACE, Omaha District",
    copy: {
      en: [
        "Follow the cable from the transformer",
        "Watch the Fort Randall transformer installation",
        "In the cable calculator, double the cable length and compare voltage drop.",
      ],
      de: [
        "Vom Transformator zur Leitung",
        "Transformatoreinbau in Fort Randall ansehen",
        "Verdoppeln Sie im Kabelrechner die Länge und vergleichen Sie den Spannungsfall.",
      ],
      yo: [
        "Tẹ̀lé okùn láti transformer",
        "Wo bí wọ́n ṣe fi transformer sí Fort Randall",
        "Ṣe gígùn okùn lẹ́ẹ̀mejì nínú ìṣírò, kí o sì wé ìṣubú fólítéèjì.",
      ],
      pcm: [
        "Follow di cable from transformer",
        "Watch how dem install transformer for Fort Randall",
        "Double cable length for di calculator and compare voltage drop.",
      ],
    },
  },
  motors: {
    clip: "848540",
    slug: "age-maintainers-generator-repair-b-roll",
    image: "hydro-powerhouse-generator.png",
    credit: "Constantine Bambakidis · U.S. Air Force",
    copy: {
      en: [
        "Inspect a motor and its supply",
        "Watch a generator motor replacement",
        "Open Motor start sequence. Compare starting several motors together with starting them one at a time.",
      ],
      de: [
        "Motor und Versorgung untersuchen",
        "Motorwechsel an einem Generator ansehen",
        "Öffnen Sie die Motoranlaufsequenz. Vergleichen Sie gleichzeitige und aufeinanderfolgende Starts.",
      ],
      yo: [
        "Ṣàyẹ̀wò mọ́tò àti orísun agbára rẹ̀",
        "Wo bí wọ́n ṣe rọ́pò mọ́tò generator",
        "Ṣí ìṣírò ìtòlẹ́sẹẹsẹ ìbẹ̀rẹ̀ mọ́tò. Wé bíbẹ̀rẹ̀ wọn papọ̀ àti bíbẹ̀rẹ̀ wọn lọ́kọ̀ọ̀kan.",
      ],
      pcm: [
        "Inspect motor and di supply",
        "Watch how dem change generator motor",
        "Open Motor start sequence. Compare starting plenty motors together with starting dem one by one.",
      ],
    },
  },
} satisfies Record<
  string,
  {
    clip: string;
    slug: string;
    image: string;
    credit: string;
    action?: Record<Locale, string>;
    copy: Record<Locale, [string, string, string]>;
  }
>;

export function EngineeringFieldGuide({
  route,
  locale,
  onOpenCalculator,
}: {
  route: keyof typeof cases;
  locale: Locale;
  onOpenCalculator?: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const study = cases[route];
  const action = "action" in study ? study.action[locale] : undefined;
  const [title, video, exercise] = study.copy[locale];
  const embed =
    route === "quality"
      ? `https://www.youtube-nocookie.com/embed/${study.clip}`
      : `https://www.dvidshub.net/video/embed/${study.clip}`;
  const source =
    route === "quality"
      ? `https://www.youtube.com/watch?v=${study.clip}`
      : `https://www.dvidshub.net/video/${study.clip}/${study.slug}`;
  return (
    <section
      className="panel panel-pad"
      aria-labelledby="engineering-field-guide"
    >
      <h3 id="engineering-field-guide">{title}</h3>
      <div className="pg-home-video">
        <div className="pg-home-video-frame">
          {playing ? (
            <iframe src={embed} title={video} allowFullScreen />
          ) : (
            <button
              className="pg-field-video-play"
              type="button"
              onClick={() => setPlaying(true)}
              style={{
                backgroundImage: `linear-gradient(transparent, #08111e), url("./assets/${study.image}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <span>{video}</span>
            </button>
          )}
        </div>
        <div>
          <p>{exercise}</p>
          <button
            className="button"
            type="button"
            onClick={() => {
              onOpenCalculator?.();
              const calculator = document.getElementById(
                "engineering-calculator",
              );
              calculator?.focus({ preventScroll: true });
              calculator?.scrollIntoView({ block: "start" });
            }}
          >
            {action ??
              (locale === "de"
                ? "Zum Rechner"
                : locale === "yo"
                  ? "Lọ sí ìṣírò"
                  : locale === "pcm"
                    ? "Open di calculator"
                    : "Go to the calculator")}
          </button>
          <p>
            <a href={source} target="_blank" rel="noreferrer">
              {study.credit}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
