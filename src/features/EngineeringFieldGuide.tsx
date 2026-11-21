import { useState } from "react";
import type { Locale } from "../i18n";

const cases = {
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
    copy: Record<Locale, [string, string, string]>;
  }
>;

export function EngineeringFieldGuide({
  route,
  locale,
}: {
  route: keyof typeof cases;
  locale: Locale;
}) {
  const [playing, setPlaying] = useState(false);
  const study = cases[route];
  const [title, video, exercise] = study.copy[locale];
  return (
    <section
      className="panel panel-pad"
      aria-labelledby="engineering-field-guide"
    >
      <h3 id="engineering-field-guide">{title}</h3>
      <div className="pg-home-video">
        <div className="pg-home-video-frame">
          {playing ? (
            <iframe
              src={`https://www.dvidshub.net/video/embed/${study.clip}`}
              title={video}
              allowFullScreen
            />
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
              const calculator = document.getElementById(
                "engineering-calculator",
              );
              calculator?.focus({ preventScroll: true });
              calculator?.scrollIntoView({ block: "start" });
            }}
          >
            {locale === "de"
              ? "Zum Rechner"
              : locale === "yo"
                ? "Lọ sí ìṣírò"
                : locale === "pcm"
                  ? "Open di calculator"
                  : "Go to the calculator"}
          </button>
          <p>
            <a
              href={`https://www.dvidshub.net/video/${study.clip}/${study.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              {study.credit}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
