import type { Locale } from "../i18n";

const report = {
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

const backup = {
  en: [
    "Watch the workspace backup workflow",
    "Choose which projects to include",
    "Include saved revisions if needed",
    "Export and keep the backup file outside browser storage",
  ],
  de: [
    "Ablauf der Arbeitsbereichssicherung ansehen",
    "Projekte für die Sicherung auswählen",
    "Bei Bedarf gespeicherte Revisionen einschließen",
    "Sicherung exportieren und außerhalb des Browsers aufbewahren",
  ],
  yo: [
    "Wo bí a ṣe ń ṣe àfẹ́yinti ibi iṣẹ́",
    "Yan àwọn iṣẹ́ tí o fẹ́ kó sínú rẹ̀",
    "Fi àwọn ẹ̀dà tí a fipamọ́ kún un bí ó bá yẹ",
    "Gbé fáìlì àfẹ́yinti jáde kí o sì tọ́jú rẹ̀ níta browser",
  ],
  pcm: [
    "Watch how to make workspace backup",
    "Choose di projects wey go enter",
    "Include saved revisions if you need dem",
    "Export di backup file and keep am outside browser storage",
  ],
} satisfies Record<Locale, readonly string[]>;

const history = {
  en: [
    "Watch how to compare revisions",
    "Choose an earlier saved revision",
    "Review the changed inputs",
    "Select only the fields you want to restore",
  ],
  de: [
    "Vergleich gespeicherter Revisionen ansehen",
    "Frühere gespeicherte Revision auswählen",
    "Geänderte Eingaben prüfen",
    "Nur die gewünschten Felder zur Wiederherstellung auswählen",
  ],
  yo: [
    "Wo bí a ṣe ń fi àwọn ẹ̀dà wé ara wọn",
    "Yan ẹ̀dà àtijọ́ tí a fipamọ́",
    "Ṣàyẹ̀wò àwọn iye tó yí padà",
    "Yan àwọn iye tí o fẹ́ dá padà",
  ],
  pcm: [
    "Watch how to compare revisions",
    "Choose earlier saved revision",
    "Check di inputs wey change",
    "Choose only di fields wey you want restore",
  ],
} satisfies Record<Locale, readonly string[]>;

const help = {
  en: [
    "Watch how to find a guide",
    "Search for the task or tool you need",
    "Read the matching guide",
    "Open its workspace or calculator",
  ],
  de: [
    "Suche nach einem Leitfaden ansehen",
    "Nach Aufgabe oder Werkzeug suchen",
    "Passenden Leitfaden lesen",
    "Arbeitsbereich oder Rechner öffnen",
  ],
  yo: [
    "Wo bí a ṣe ń wá ìtọ́sọ́nà",
    "Wá iṣẹ́ tàbí irinṣẹ́ tí o nílò",
    "Ka ìtọ́sọ́nà tó bá mu",
    "Ṣí ibi iṣẹ́ tàbí ẹ̀rọ ìṣírò rẹ̀",
  ],
  pcm: [
    "Watch how to find guide",
    "Search for di task or tool wey you need",
    "Read di guide wey match",
    "Open di workspace or calculator",
  ],
} satisfies Record<Locale, readonly string[]>;

const recordings = {
  report: { asset: "engineering-report", steps: report },
  backup: { asset: "workspace-backup", steps: backup },
  history: { asset: "revision-comparison", steps: history },
  help: { asset: "help-search", steps: help },
};

export function WorkspaceRecording({
  locale,
  recording,
}: {
  locale: Locale;
  recording: keyof typeof recordings;
}) {
  const { asset, steps } = recordings[recording];
  const [title, ...instructions] = steps[locale];
  return (
    <section
      className="panel panel-pad"
      aria-labelledby={`${asset}-walkthrough`}
    >
      <h3 id={`${asset}-walkthrough`}>{title}</h3>
      <div className="pg-home-video">
        <video
          className="workspace-demo-video"
          controls
          playsInline
          preload="none"
          aria-label={title}
          poster={`./assets/workspace-demos/${asset}.jpg`}
          src={`./assets/workspace-demos/${asset}.webm`}
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
