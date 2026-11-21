import { useState } from "react";
import type { Locale } from "../i18n";

const cases = {
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
