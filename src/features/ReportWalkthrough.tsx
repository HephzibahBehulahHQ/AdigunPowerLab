import type { Locale } from "../i18n";

const steps = {
  en: [
    "Watch the report workflow",
    "Choose the report sections",
    "Freeze the report preview",
    "Review the frozen revision before exporting",
  ],
  de: [
    "Berichtsablauf ansehen",
    "Berichtsabschnitte auswählen",
    "Berichtsvorschau fixieren",
    "Fixierten Stand vor dem Export prüfen",
  ],
  yo: [
    "Wo bí a ṣe ń ṣe ìròyìn",
    "Yan àwọn abala ìròyìn",
    "Di àwòkọ ìròyìn mú",
    "Ṣàyẹ̀wò ẹ̀dà náà kí o tó gbé e jáde",
  ],
  pcm: [
    "Watch how to prepare report",
    "Choose di report sections",
    "Freeze di report preview",
    "Check di frozen revision before export",
  ],
} satisfies Record<Locale, readonly string[]>;

export function ReportWalkthrough({ locale }: { locale: Locale }) {
  const [title, ...instructions] = steps[locale];
  return (
    <section className="panel panel-pad" aria-labelledby="report-walkthrough">
      <h3 id="report-walkthrough">{title}</h3>
      <div className="pg-home-video">
        <video
          className="workspace-demo-video"
          controls
          playsInline
          preload="none"
          aria-label={title}
          poster="./assets/workspace-demos/engineering-report.jpg"
          src="./assets/workspace-demos/engineering-report.webm"
        />
        <ol>
          {instructions.map((instruction) => (
            <li key={instruction}>{instruction}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}
