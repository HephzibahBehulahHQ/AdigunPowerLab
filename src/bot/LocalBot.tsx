import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { CalculationResult, Project } from "../domain/types";
import { helpTopics, searchHelp, type HelpTopic } from "../help/content";
import { LanguageContext, numberFormat, useT, type Locale } from "../i18n";
import {
  applyProposal,
  runLocalCommand,
  type LocalResponse,
  type Proposal,
} from "./adapter";
import "./bot.css";
import { createBotSessionStore } from "./sessionState";
import {
  clampBotGeometry,
  readBotWindowState,
  writeBotWindowState,
  type BotGeometry,
} from "./windowState";
export { resetBotWindowState } from "./windowState";

export interface LocalBotProps {
  project: Project;
  result: CalculationResult;
  selectedId?: string;
  onChange: (mutator: (draft: Project) => void) => void | boolean;
  onNavigate: (route: string, toolId?: string) => boolean;
  tourRequest: number;
  onClose: () => void;
  onReport: () => void;
}
interface Message {
  id: number;
  role: "user" | "assistant";
  text?: string;
  response?: LocalResponse;
  helpTopic?: HelpTopic;
  applied?: boolean;
  dismissed?: boolean;
}
type Geometry = BotGeometry;
const sessions = createBotSessionStore<Message>();
let nextMessageId = 1;

const text: Record<string, [string, string, string]> = {
  "Deterministic tools. No external AI connection.": [
    "Deterministische Werkzeuge. Keine externe KI-Verbindung.",
    "Irinṣẹ́ ìṣírò pàtó. Kò sí ìsopọ̀ AI òde.",
    "Na fixed calculation tools. No external AI connection.",
  ],
  "Session history only": [
    "Verlauf nur für diese Sitzung",
    "Ìtàn fún ìgbà yìí nìkan",
    "History na for this session only",
  ],
  "Local assistant controls": [
    "Lokale Assistentensteuerung",
    "Ètò olùrànlọ́wọ́ abẹ́lé",
    "Local assistant controls",
  ],
  "Move window with arrow keys; Home centers it.": [
    "Fenster mit Pfeiltasten verschieben; Pos1 zentriert es.",
    "Lo kọ́kọ́rọ́ ọfà láti gbé fèrèsé; Home yóò fi sí àárín.",
    "Use arrow keys move window; Home go center am.",
  ],
  "Center window": [
    "Fenster zentrieren",
    "Gbé fèrèsé sí àárín",
    "Center window",
  ],
  "Resize larger": ["Vergrößern", "Mú un tóbi", "Make am bigger"],
  "Resize smaller": ["Verkleinern", "Mú un kéré", "Make am smaller"],
  "Live assistance": [
    "Laufende Unterstützung",
    "Ìrànlọ́wọ́ aláṣiṣẹ́",
    "Live assistance",
  ],
  Off: ["Aus", "Pa", "Off"],
  Quiet: ["Leise", "Dákẹ́", "Quiet"],
  Standard: ["Standard", "Boṣewa", "Standard"],
  Proactive: ["Proaktiv", "Ṣáájú", "Proactive"],
  "I can explain this project, list missing inputs, preview phase balancing, or open the real report exporter.":
    [
      "Ich kann dieses Projekt erklären, fehlende Eingaben auflisten, einen Phasenausgleich vorschlagen oder den tatsächlichen Berichtsexport öffnen.",
      "Mo lè ṣàlàyé iṣẹ́ yìí, fi ohun tó kù hàn, ṣàyẹ̀wò ìdọ́gba fásì, tàbí ṣí ìròyìn.",
      "I fit explain this project, show missing inputs, preview phase balance or open the real report export.",
    ],
  "Typed load command": [
    "Strukturierter Lastbefehl",
    "Àṣẹ ẹrù tí a kọ",
    "Typed load command",
  ],
  "Typed load edit command": [
    "Strukturierter Befehl zum Ändern einer Last",
    "Àṣẹ láti ṣàtúnṣe ẹrù tí a kọ",
    "Typed command to edit one load",
  ],
  "Typed phase command": [
    "Strukturierter Phasenbefehl",
    "Àṣẹ fásì tí a kọ",
    "Typed command to change a load phase",
  ],
  "Phase changes can also move other single-phase loads on the same circuit. Locked phases stay unchanged.":
    [
      "Eine Phasenänderung kann auch andere einphasige Lasten desselben Stromkreises verschieben. Gesperrte Phasen bleiben unverändert.",
      "Àtúnṣe fásì lè tún gbé àwọn ẹrù fásì-kan míì tó wà lórí síkítì kan náà. Àwọn fásì tó ní lock kì í yí padà.",
      "Phase change fit also move other single-phase loads for that same circuit. Locked phases no go change.",
    ],
  "Typed circuit assignment command": [
    "Strukturierter Stromkreiszuweisungsbefehl",
    "Àṣẹ láti so ẹrù mọ́ síkítì",
    "Typed command to assign a load to a circuit",
  ],
  "Assignment updates the served board and aligns an unlocked single-phase load with the circuit phase. Incompatible assignments are rejected.":
    [
      "Die Zuweisung aktualisiert die versorgende Verteilung und passt eine nicht gesperrte einphasige Last an die Stromkreisphase an. Unzulässige Zuweisungen werden abgelehnt.",
      "Ìsopọ̀ yìí máa ṣe àtúnṣe pátákó tó ń pèsè iná, ó sì máa mú fásì ẹrù fásì-kan tí kò ní lock bá fásì síkítì mu. A ó kọ ìsopọ̀ tí kò bá yẹ.",
      "Assignment go update the board wey circuit dey serve and match unlocked single-phase load phase with circuit phase. Wrong assignment no go pass.",
    ],
  "Typed board assignment command": [
    "Strukturierter Verteilungszuweisungsbefehl",
    "Àṣẹ láti so ẹrù mọ́ pátákó",
    "Typed command to assign a load to a board",
  ],
  "A board-only assignment removes the load from its current circuit. Review that change before confirming.":
    [
      "Eine reine Verteilungszuweisung löst die Last von ihrem aktuellen Stromkreis. Prüfen Sie diese Änderung vor der Bestätigung.",
      "Ìsopọ̀ sí pátákó nìkan yóò yọ ẹrù kúrò lórí síkítì tó wà. Ṣàyẹ̀wò àtúnṣe yìí kí o tó fọwọ́sí.",
      "Board assignment alone go remove the load from the circuit wey e dey on. Check the change before you confirm.",
    ],
  Unassigned: ["Nicht zugewiesen", "A kò tíì yàn", "No assignment"],
  "This assignment removes the existing circuit:": [
    "Diese Zuweisung löst den vorhandenen Stromkreis:",
    "Ìsopọ̀ yìí yóò yọ síkítì tó wà:",
    "This assignment go remove the existing circuit:",
  ],
  "Supported fields: name, rating_kw, voltage_v, power_factor, hours_per_day, quantity. Use the exact current load name; edits to rating_kw require kW entry mode.":
    [
      "Felder: name, rating_kw, voltage_v, power_factor, hours_per_day, quantity. Verwenden Sie den exakten aktuellen Lastnamen; rating_kw gilt nur im kW-Eingabemodus.",
      "Àwọn pápá: name, rating_kw, voltage_v, power_factor, hours_per_day, quantity. Lo orúkọ ẹrù tó wà gan-an; rating_kw nílò kW entry mode.",
      "Fields: name, rating_kw, voltage_v, power_factor, hours_per_day, quantity. Use the exact current load name; rating_kw needs kW entry mode.",
    ],
  "All proposals require your confirmation.": [
    "Alle Vorschläge benötigen Ihre Bestätigung.",
    "Gbogbo àbá nílò ìfọwọ́sí rẹ.",
    "You must confirm every proposal.",
  ],
  "Load to remove": [
    "Zu entfernende Last",
    "Ẹrù láti yọ kúrò",
    "Load to remove",
  ],
  "Circuit to remove": [
    "Zu entfernender Stromkreis",
    "Síkítì láti yọ",
    "Circuit to remove",
  ],
  "Loads to unassign": [
    "Zu lösende Lasten",
    "Àwọn ẹrù láti yọ kúrò ní ìsopọ̀",
    "Loads to unassign",
  ],
  "No connected loads": [
    "Keine verbundenen Lasten",
    "Kò sí ẹrù tó so mọ́ ọn",
    "No connected loads",
  ],
  "Loads remain in the project but become unassigned. Undo restores the complete previous project.":
    [
      "Die Lasten bleiben im Projekt, werden aber nicht mehr zugewiesen. Mit Rückgängig wird das vollständige vorherige Projekt wiederhergestellt.",
      "Àwọn ẹrù yóò dúró nínú iṣẹ́ náà, ṣùgbọ́n wọn kò ní sí nínú board tàbí circuit mọ́. Dápadà yóò mú gbogbo iṣẹ́ àtijọ́ padà.",
      "Loads go remain for the project, but dem go unassigned. Undo go restore the full previous project.",
    ],
  "Dependent start events and flexible-load plans are removed with the loads. Undo restores the complete previous project.":
    [
      "Zugehörige Startvorgänge und Pläne für flexible Lasten werden ebenfalls entfernt. Mit Rückgängig wird das vollständige vorherige Projekt wiederhergestellt.",
      "A ó tún yọ àwọn ìṣẹ̀lẹ̀ ìbẹ̀rẹ̀ àti ètò ẹrù tó rọrùn tó so mọ́ ẹrù náà kúrò. Dápadà yóò mú gbogbo iṣẹ́ àtijọ́ padà.",
      "Related start events and flexible-load plans go remove with the loads. Undo go restore the full previous project.",
    ],
  "Review proposal": ["Vorschlag prüfen", "Ṣàyẹ̀wò àbá", "Review proposal"],
  "Apply confirmed changes": [
    "Bestätigte Änderungen anwenden",
    "Lo àtúnṣe tí o fọwọ́ sí",
    "Apply changes you confirm",
  ],
  Dismiss: ["Verwerfen", "Kọ̀", "Dismiss"],
  "Applied through project history. Use Undo to restore.": [
    "Über den Projektverlauf angewendet. Mit Rückgängig wiederherstellen.",
    "A ti lo àtúnṣe sí ìtàn iṣẹ́. Lo Dápadà láti mú padà.",
    "Changes don enter project history. Use Undo to restore.",
  ],
  "This preview is stale. Request a new one.": [
    "Diese Vorschau ist veraltet. Fordern Sie eine neue an.",
    "Àbá yìí ti kọjá. Béèrè tuntun.",
    "This preview don old. Ask for new one.",
  ],
  "No certified installation approval is produced.": [
    "Keine zertifizierte Freigabe der Installation.",
    "Èyí kì í ṣe ìfọwọ́sí ìfìsí iná.",
    "This one no be certified installation approval.",
  ],
  "Local command failed": [
    "Lokaler Befehl fehlgeschlagen",
    "Àṣẹ abẹ́lé kùnà",
    "Local command no work",
  ],
  "Response copied": ["Antwort kopiert", "A da èsì kọ", "Response copied"],
  "Copy failed": ["Kopieren fehlgeschlagen", "Dídàkọ kùnà", "Copy no work"],
  "Copy response": ["Antwort kopieren", "Da ìdáhùn kọ", "Copy response"],
  "No supported command found. Choose an action below.": [
    "Kein unterstützter Befehl gefunden. Wählen Sie eine Aktion unten.",
    "A kò rí àṣẹ tó bá mu. Yan ìṣe ní ìsàlẹ̀.",
    "No supported command match. Choose one action below.",
  ],
  "Open report exporter": [
    "Berichtsexport öffnen",
    "Ṣí irinṣẹ́ ìròyìn",
    "Open report exporter",
  ],
  "Current project inputs": [
    "Aktuelle Projekteingaben",
    "Àwọn ìwọlé iṣẹ́ lọ́wọ́lọ́wọ́",
    "Current project inputs",
  ],
  "Circuit checks and manufacturer evidence remain separate.": [
    "Stromkreisprüfungen und Herstellernachweise bleiben separat.",
    "Ìṣàyẹ̀wò àyíká àti ẹ̀rí olùṣe nílò ìtọ́jú wọn.",
    "Circuit checks and manufacturer evidence still need separate review.",
  ],
  "Technical diagnostic": [
    "Technischer Hinweis",
    "Àlàyé ìmọ̀ ẹ̀rọ",
    "Technical diagnostic",
  ],
  "Project data changed. Recheck the current issues before applying an older proposal.":
    [
      "Projektdaten geändert. Prüfen Sie aktuelle Hinweise, bevor Sie einen älteren Vorschlag anwenden.",
      "Àwọn ìwọlé iṣẹ́ yí padà. Ṣàyẹ̀wò àwọn ìṣòro lọ́wọ́lọ́wọ́.",
      "Project data don change. Check current issues before you apply old proposal.",
    ],
  "Confirm clear session history?": [
    "Sitzungsverlauf wirklich löschen?",
    "Ṣé kí a pa ìtàn ìgbà yìí rẹ́?",
    "You confirm make we clear session history?",
  ],
  "Cancel pending command": [
    "Ausstehenden Befehl abbrechen",
    "Fagilé àṣẹ tó ń dúró",
    "Cancel pending command",
  ],
  Working: ["Wird bearbeitet", "Ń ṣiṣẹ́", "Working"],
  "Preview defaults: one single-phase unit on L1, start 08:00, duty 1, utilization 1. Review before applying.":
    [
      "Vorschauannahmen: ein einphasiges Gerät an L1, Start 08:00, Tastgrad 1, Auslastung 1. Vor Übernahme prüfen.",
      "Àwọn èrò àbá: ohun èlò fásì kan lórí L1, ìbẹ̀rẹ̀ 08:00, duty 1, ìlò 1. Ṣàyẹ̀wò kí o tó lò ó.",
      "Preview defaults: one single-phase unit for L1, start 08:00, duty 1, utilization 1. Review before apply.",
    ],
};
function local(key: string, locale: Locale): string {
  return locale === "en"
    ? key
    : (text[key]?.[locale === "de" ? 0 : locale === "yo" ? 1 : 2] ?? key);
}
const helpQuestionWords = new Set(
  "how do i use what is are the a an can could please tell me about for to show find where why help me with wie was ist sind der die das ein eine ich du bitte mir mit über benutzen benutzt benutze bawo ni mo se lo kini ta ni e je ka how e fit make abeg wetin dey na"
    .toLocaleLowerCase()
    .split(/\s+/),
);
function findBotHelpTopic(
  query: string,
  locale: Locale,
): HelpTopic | undefined {
  const terms = query
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter((term) => term && !helpQuestionWords.has(term));
  if (!terms.length) return undefined;
  return searchHelp(terms.join(" "), locale, 1)[0];
}
function clampGeometry(g: Geometry): Geometry {
  return clampBotGeometry(g, {
    width: window.innerWidth,
    height: window.innerHeight,
  });
}

export default function LocalBot({
  project,
  result,
  selectedId,
  onChange,
  onNavigate,
  tourRequest,
  onClose,
  onReport,
}: LocalBotProps) {
  const t = useT();
  const locale = useContext(LanguageContext);
  const l = (key: string) => local(key, locale);
  const { messages, draft: input } = useSyncExternalStore(
    useCallback(
      (listener) => sessions.subscribe(project.id, listener),
      [project.id],
    ),
    useCallback(() => sessions.get(project.id), [project.id]),
  );
  const setMessages = useCallback(
    (value: Message[] | ((previous: Message[]) => Message[])) =>
      sessions.setMessages(project.id, value),
    [project.id],
  );
  const setInput = (value: string) => sessions.setDraft(project.id, value);
  const [busy, setBusy] = useState(false);
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const [tourNavigationBlocked, setTourNavigationBlocked] = useState(false);
  const tourTopics = helpTopics
    .filter((topic) => topic.kind === "workflow" && topic.route)
    .filter(
      (topic, index, topics) =>
        topics.findIndex((candidate) => candidate.route === topic.route) ===
        index,
    );
  const [error, setError] = useState("");
  const [initialWindow] = useState(() => readBotWindowState());
  const [geometry, setGeometry] = useState(initialWindow.geometry);
  const [minimized, setMinimized] = useState(initialWindow.minimized);
  const [maximized, setMaximized] = useState(initialWindow.maximized);
  const [live, setLive] = useState<"off" | "quiet" | "standard" | "proactive">(
    "quiet",
  );
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const drag = useRef<{ x: number; y: number; geometry: Geometry } | null>(
    null,
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commandId = useRef(0);
  const latest = useRef({ project, selectedId });
  latest.current = { project, selectedId };
  const windowRef = useRef<HTMLElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const returnFocus = useRef(
    document.activeElement instanceof HTMLElement &&
      document.activeElement !== document.body
      ? document.activeElement
      : null,
  );
  const composing = useRef(false);
  const log = useRef<HTMLDivElement>(null);
  const lastSuggestion = useRef(0);
  const lastSeenRevision = useRef(project.revision);
  const firstProject = useRef(project.id);
  const lastTourRequest = useRef(0);
  const format = (value: number, digits = 2) =>
    Number.isFinite(value) ? numberFormat(value, digits, locale) : "—";

  useEffect(() => {
    if (tourRequest > lastTourRequest.current) {
      lastTourRequest.current = tourRequest;
      setTourIndex(0);
    }
  }, [tourRequest]);
  useEffect(() => {
    if (!windowRef.current?.closest("[inert]"))
      (composerRef.current ?? headerRef.current)?.focus({
        preventScroll: true,
      });
  }, []);

  const close = () => {
    const botWindow = windowRef.current;
    onClose();
    requestAnimationFrame(() => {
      const active = document.activeElement;
      if (
        active instanceof HTMLElement &&
        active !== document.body &&
        active !== document.documentElement &&
        !botWindow?.contains(active)
      )
        return;
      const candidates = [
        returnFocus.current,
        document.querySelector<HTMLButtonElement>(".bot-launcher"),
      ];
      candidates
        .find(
          (target) =>
            target?.isConnected &&
            !target.closest("[inert]") &&
            !target.matches(":disabled") &&
            target.getClientRects().length > 0,
        )
        ?.focus({ preventScroll: true });
    });
  };

  useEffect(() => {
    if (firstProject.current !== project.id) {
      firstProject.current = project.id;
      setError("");
      commandId.current++;
      if (timer.current) clearTimeout(timer.current);
      setBusy(false);
      lastSeenRevision.current = project.revision;
    }
  }, [project.id, project.revision]);
  useEffect(() => {
    writeBotWindowState({ geometry, minimized, maximized });
  }, [geometry, minimized, maximized]);
  useEffect(() => {
    const resize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      setGeometry((previous) => clampGeometry(previous));
    };
    const move = (event: PointerEvent) => {
      if (drag.current)
        setGeometry(
          clampGeometry({
            ...drag.current.geometry,
            x: drag.current.geometry.x + event.clientX - drag.current.x,
            y: drag.current.geometry.y + event.clientY - drag.current.y,
          }),
        );
    };
    const end = () => {
      drag.current = null;
    };
    const reset = () => {
      const state = readBotWindowState({ getItem: () => null });
      setGeometry(state.geometry);
      setMinimized(false);
      setMaximized(false);
    };
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("powerlab-bot-reset", reset);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("powerlab-bot-reset", reset);
      commandId.current++;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [messages, minimized]);
  useEffect(() => {
    if (
      live === "off" ||
      live === "quiet" ||
      input.trim() ||
      project.revision === lastSeenRevision.current
    )
      return;
    const current = project.revision;
    const timeout = setTimeout(() => {
      if (
        Date.now() - lastSuggestion.current <
        (live === "proactive" ? 20000 : 30000)
      )
        return;
      if (
        latest.current.project.id !== project.id ||
        latest.current.project.revision !== current ||
        !result.issues.length
      )
        return;
      lastSuggestion.current = Date.now();
      lastSeenRevision.current = current;
      setMessages((previous) => [
        ...previous,
        {
          id: nextMessageId++,
          role: "assistant",
          response: runLocalCommand(latest.current.project, "issues"),
        },
      ]);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [project.revision, project.id, live, input, result.issues.length]);

  const send = (quickCommand?: string) => {
    const command = quickCommand ?? input;
    if (!command.trim() || busy) return;
    if (quickCommand === undefined) setInput("");
    setError("");
    setBusy(true);
    const id = ++commandId.current;
    const captured = { project: structuredClone(project), selectedId };
    const userId = nextMessageId++;
    setMessages((previous) => [
      ...previous,
      { id: userId, role: "user", text: command.trim() },
    ]);
    timer.current = setTimeout(() => {
      if (
        id !== commandId.current ||
        latest.current.project.id !== captured.project.id
      )
        return;
      try {
        const response = runLocalCommand(
          captured.project,
          command,
          captured.selectedId,
        );
        const helpTopic =
          response.kind === "help"
            ? findBotHelpTopic(command, locale)
            : undefined;
        const responseId = nextMessageId++;
        if (id === commandId.current)
          setMessages((previous) => [
            ...previous,
            { id: responseId, role: "assistant", response, helpTopic },
          ]);
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : l("Local command failed"),
        );
      } finally {
        if (id === commandId.current) setBusy(false);
      }
    }, 0);
  };
  const apply = (proposal: Proposal, messageId: number) => {
    try {
      const proposalProjectId =
        proposal.kind === "command"
          ? proposal.preview.projectId
          : proposal.projectId;
      const proposalRevision =
        proposal.kind === "command"
          ? proposal.preview.revision
          : proposal.revision;
      if (
        project.id !== proposalProjectId ||
        project.revision !== proposalRevision
      )
        throw new Error(l("This preview is stale. Request a new one."));
      const accepted = onChange((draft) => applyProposal(draft, proposal));
      if (accepted === false)
        throw new Error(l("This preview is stale. Request a new one."));
      setMessages((previous) =>
        previous.map((message) =>
          message.id === messageId ? { ...message, applied: true } : message,
        ),
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : l("Local command failed"),
      );
    }
  };
  const startDrag = (event: ReactPointerEvent) => {
    if (
      maximized ||
      viewport.width < 600 ||
      (event.target as HTMLElement).closest("button,details,summary")
    )
      return;
    drag.current = { x: event.clientX, y: event.clientY, geometry };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const mobile = viewport.width < 600;
  const style: CSSProperties =
    maximized || mobile
      ? {
          left: 8,
          top: 8,
          width: viewport.width - 16,
          height: minimized ? 56 : viewport.height - 16,
        }
      : {
          left: geometry.x,
          top: geometry.y,
          width: geometry.width,
          height: minimized ? 56 : geometry.height,
        };
  const summary = (response: LocalResponse) => (
    <dl className="bot-metrics">
      <div>
        <dt>{t("Design demand")}</dt>
        <dd>{format(response.result.designKW)} kW</dd>
      </div>
      <div>
        <dt>{t("Daily energy")}</dt>
        <dd>{format(response.result.dailyKWh)} kWh</dd>
      </div>
      <div>
        <dt>{t("Apparent power")}</dt>
        <dd>{format(response.result.apparentKVA)} kVA</dd>
      </div>
      <div>
        <dt>{t("Issues")}</dt>
        <dd>{response.result.issues.length}</dd>
      </div>
    </dl>
  );
  const renderResponse = (message: Message) => {
    const response = message.response!;
    const proposal = response.proposal;
    const stale =
      response.projectId !== project.id ||
      response.revision !== project.revision;
    return (
      <>
        <div className="bot-message-meta">
          Adigun BOT · {t("Revision")} {response.revision}
        </div>
        {(response.kind === "summary" || response.kind === "report") && (
          <>
            {summary(response)}
            <p>{t("All results use entered assumptions.")}</p>
          </>
        )}
        {response.kind === "explain" && (
          <>
            {response.selectedLoad && (
              <p>
                <strong>{response.selectedLoad.name}</strong> ·{" "}
                {response.selectedLoad.rating} {response.selectedLoad.entryMode}{" "}
                · {response.selectedLoad.voltage} V · PF{" "}
                {response.selectedLoad.pf} · ×{response.selectedLoad.quantity}
              </p>
            )}
            {summary(response)}
            <p className="bot-formula">{t(response.result.trace.formula)}</p>
            <p>
              {l("Circuit checks and manufacturer evidence remain separate.")}
            </p>
            <a
              href="https://www.electrical-installation.org/enwiki/Estimation_of_actual_maximum_kVA_demand"
              target="_blank"
              rel="noopener noreferrer"
            >
              Schneider Electric · {t("Sources")}
            </a>
          </>
        )}
        {response.kind === "issues" && (
          <>
            {response.issues?.length ? (
              <ul>
                {response.issues.map((issue) => (
                  <li key={issue.id}>
                    <strong>{t("Incomplete")}: </strong>
                    {t(issue.message)}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t("No unresolved issues")}</p>
            )}
            <p>{l("No certified installation approval is produced.")}</p>
          </>
        )}
        {response.kind === "report" && (
          <button className="button" onClick={onReport}>
            {l("Open report exporter")}
          </button>
        )}
        {proposal && (
          <div className="bot-proposal">
            <strong>{l("Review proposal")}</strong>
            {proposal.kind === "balance" ? (
              <>
                <p>
                  {t("Before")}: {format(proposal.plan.beforeImbalance)}% →{" "}
                  {t("After")}: {format(proposal.plan.afterImbalance)}%
                </p>
                {proposal.plan.moves.length ? (
                  <ul>
                    {proposal.plan.moves.map((move) => (
                      <li key={move.loadId}>
                        {project.loads.find((load) => load.id === move.loadId)
                          ?.name ?? move.loadId}
                        : {move.from} → {move.to}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{t("No phase moves required")}</p>
                )}
              </>
            ) : proposal.kind === "load" ? (
              <>
                <p>
                  {proposal.load.name} · {proposal.load.rating} kW ·{" "}
                  {proposal.load.voltage} V · PF {proposal.load.pf} ·{" "}
                  {proposal.load.hoursPerDay} h
                </p>
                <p>
                  {l(
                    "Preview defaults: one single-phase unit on L1, start 08:00, duty 1, utilization 1. Review before applying.",
                  )}
                </p>
                <p>
                  {t("Design demand")}: {format(proposal.beforeKW)} →{" "}
                  {format(proposal.afterKW)} kW
                </p>
              </>
            ) : proposal.kind === "load-edit" ? (
              <>
                <p>
                  {t("Before")}: {proposal.before.name} ·{" "}
                  {proposal.before.rating} {proposal.before.entryMode} ·{" "}
                  {proposal.before.voltage} V · PF {proposal.before.pf} · ×
                  {proposal.before.quantity} · {proposal.before.hoursPerDay} h
                </p>
                <p>
                  {t("After")}: {proposal.after.name} · {proposal.after.rating}{" "}
                  {proposal.after.entryMode} · {proposal.after.voltage} V · PF{" "}
                  {proposal.after.pf} · ×{proposal.after.quantity} ·{" "}
                  {proposal.after.hoursPerDay} h
                </p>
                <p>
                  {t("Design demand")}: {format(proposal.beforeKW)} →{" "}
                  {format(proposal.afterKW)} kW
                </p>
              </>
            ) : (
              <>
                {proposal.preview.command.kind === "loads.delete" ? (
                  <>
                    <p>
                      {l("Load to remove")}:{" "}
                      {project.loads.find(
                        (load) =>
                          load.id ===
                          ("ids" in proposal.preview.command
                            ? proposal.preview.command.ids[0]
                            : ""),
                      )?.name ??
                        ("ids" in proposal.preview.command
                          ? proposal.preview.command.ids[0]
                          : "")}
                    </p>
                    {proposal.preview.warnings.map((warning) => (
                      <p key={warning}>{l(warning)}</p>
                    ))}
                  </>
                ) : proposal.preview.command.kind === "circuit.remove" ? (
                  (() => {
                    const circuit = project.circuits.find(
                      (item) => item.id === proposal.preview.command.id,
                    );
                    const loads = project.loads.filter(
                      (item) => item.circuitId === proposal.preview.command.id,
                    );
                    return (
                      <>
                        <p>
                          {l("Circuit to remove")}: {circuit?.name}
                        </p>
                        <p>
                          {l("Loads to unassign")}:{" "}
                          {loads.length
                            ? loads.map((item) => item.name).join(", ")
                            : l("No connected loads")}
                        </p>
                        <p>
                          {l(
                            "Loads remain in the project but become unassigned. Undo restores the complete previous project.",
                          )}
                        </p>
                      </>
                    );
                  })()
                ) : (
                  <p>{proposal.preview.summary}</p>
                )}
                {proposal.preview.command.kind === "loads.assign" &&
                  proposal.preview.command.circuitId &&
                  (() => {
                    const command = proposal.preview.command;
                    if (command.kind !== "loads.assign" || !command.circuitId)
                      return null;
                    const circuit = project.circuits.find(
                      (item) => item.id === command.circuitId,
                    );
                    const board = project.boards.find(
                      (item) => item.id === circuit?.boardId,
                    );
                    const load = proposal.preview.changes.find(
                      (change) => change.field === "circuitId",
                    );
                    return (
                      <p>
                        {load?.name} → {circuit?.name} · {board?.name} ·{" "}
                        {circuit?.phase}
                      </p>
                    );
                  })()}
                {proposal.preview.command.kind === "loads.assign" &&
                  !proposal.preview.command.circuitId &&
                  proposal.preview.command.boardId &&
                  (() => {
                    const command = proposal.preview.command;
                    if (command.kind !== "loads.assign" || command.circuitId)
                      return null;
                    const board = project.boards.find(
                      (item) => item.id === command.boardId,
                    );
                    const load = proposal.preview.changes.find(
                      (change) => change.field === "boardId",
                    );
                    const circuitChange = proposal.preview.changes.find(
                      (change) => change.field === "circuitId",
                    );
                    const priorCircuit = project.circuits.find(
                      (item) => item.id === circuitChange?.before,
                    );
                    return (
                      <>
                        <p>
                          {load?.name} → {board?.name ?? l("Unassigned")}
                        </p>
                        {circuitChange?.before && (
                          <p>
                            {l("This assignment removes the existing circuit:")}{" "}
                            {priorCircuit?.name ?? circuitChange.before}
                          </p>
                        )}
                      </>
                    );
                  })()}
                {proposal.preview.command.kind !== "loads.delete" &&
                  proposal.preview.command.kind !== "circuit.remove" && (
                    <ul>
                      {proposal.preview.changes.map((change, index) => {
                        const isAssignment =
                          proposal.preview.command.kind === "loads.assign";
                        const readable = (field: string, value: string) => {
                          if (!isAssignment) return value;
                          if (!value || value === "—") return l("Unassigned");
                          if (field === "boardId")
                            return (
                              project.boards.find((board) => board.id === value)
                                ?.name ?? value
                            );
                          if (field === "circuitId")
                            return (
                              project.circuits.find(
                                (circuit) => circuit.id === value,
                              )?.name ?? value
                            );
                          return value;
                        };
                        return (
                          <li
                            key={`${change.objectId}:${change.field}:${index}`}
                          >
                            <strong>{change.name}</strong> · {change.field}:{" "}
                            {readable(change.field, change.before)} →{" "}
                            {readable(change.field, change.after)}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                {proposal.preview.command.kind === "loads.phase" && (
                  <p>
                    {l(
                      "Phase changes can also move other single-phase loads on the same circuit. Locked phases stay unchanged.",
                    )}
                  </p>
                )}
                {proposal.preview.command.kind === "loads.assign" &&
                  proposal.preview.command.circuitId && (
                    <p>
                      {l(
                        "Assignment updates the served board and aligns an unlocked single-phase load with the circuit phase. Incompatible assignments are rejected.",
                      )}
                    </p>
                  )}
                {proposal.preview.command.kind === "loads.assign" &&
                  !proposal.preview.command.circuitId && (
                    <p>
                      {l(
                        "A board-only assignment removes the load from its current circuit. Review that change before confirming.",
                      )}
                    </p>
                  )}
              </>
            )}
            {message.applied ? (
              <p role="status">
                {l("Applied through project history. Use Undo to restore.")}
              </p>
            ) : message.dismissed ? (
              <p>{l("Dismiss")}</p>
            ) : stale ? (
              <p className="bot-stale">
                {l("This preview is stale. Request a new one.")}
              </p>
            ) : (
              <div className="bot-actions">
                <button
                  className="button"
                  disabled={
                    (proposal.kind === "balance" &&
                      proposal.plan.moves.length === 0) ||
                    (proposal.kind === "command" &&
                      (!proposal.preview.changes.length ||
                        proposal.preview.errors.length > 0))
                  }
                  onClick={() => apply(proposal, message.id)}
                >
                  {l("Apply confirmed changes")}
                </button>
                <button
                  className="button secondary"
                  onClick={() =>
                    setMessages((previous) =>
                      previous.map((item) =>
                        item.id === message.id
                          ? { ...item, dismissed: true }
                          : item,
                      ),
                    )
                  }
                >
                  {l("Dismiss")}
                </button>
              </div>
            )}
          </div>
        )}
        {response.kind === "help" && message.helpTopic ? (
          <>
            <strong>{t(message.helpTopic.title)}</strong>
            <p>{t(message.helpTopic.summary)}</p>
            <ol>
              {message.helpTopic.steps.map((step) => (
                <li key={step}>{t(step)}</li>
              ))}
            </ol>
            {message.helpTopic.route && (
              <button
                className="button"
                type="button"
                onClick={() =>
                  setTourNavigationBlocked(
                    !onNavigate(
                      message.helpTopic!.route!,
                      message.helpTopic!.toolId,
                    ),
                  )
                }
              >
                {t("Open workspace")}
              </button>
            )}
            {tourNavigationBlocked && (
              <p role="status">
                {t(
                  "Finish or cancel your current edits before opening another workspace.",
                )}
              </p>
            )}
          </>
        ) : (
          response.kind === "help" && (
            <>
              <p>{l("No supported command found. Choose an action below.")}</p>
              <p>{l("Typed load command")}:</p>
              <code>load: Heater; 2.3 kW; 230 V; PF 1; 8 h</code>
              <p>{l("Typed load edit command")}:</p>
              <code>edit load: Heater; rating_kw; 3.1</code>
              <small>
                {l(
                  "Supported fields: name, rating_kw, voltage_v, power_factor, hours_per_day, quantity. Use the exact current load name; edits to rating_kw require kW entry mode.",
                )}
              </small>
              <p>{l("Typed board assignment command")}:</p>
              <code>assign load: Heater; board: Main board</code>
              <small>
                {l(
                  "A board-only assignment removes the load from its current circuit. Review that change before confirming.",
                )}
              </small>
              <p>{l("Typed circuit assignment command")}:</p>
              <code>assign load: Heater; circuit: Lighting circuit</code>
              <small>
                {l(
                  "Assignment updates the served board and aligns an unlocked single-phase load with the circuit phase. Incompatible assignments are rejected.",
                )}
              </small>
              <p>{l("Typed phase command")}:</p>
              <code>phase load: Heater; L2</code>
              <small>
                {l(
                  "Phase changes can also move other single-phase loads on the same circuit. Locked phases stay unchanged.",
                )}
              </small>
              <p>{l("All proposals require your confirmation.")}</p>
            </>
          )
        )}
        <button
          className="bot-copy"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                JSON.stringify(response, null, 2),
              );
              setError("");
            } catch {
              setError(l("Copy failed"));
            }
          }}
        >
          {l("Copy response")}
        </button>
      </>
    );
  };

  return (
    <section
      ref={windowRef}
      className={`local-bot ${minimized ? "is-minimized" : ""}`}
      style={style}
      aria-label="Adigun BOT"
      role="region"
      onKeyDown={(event) => {
        if (
          event.key === "Escape" &&
          !event.defaultPrevented &&
          !composing.current &&
          !event.nativeEvent.isComposing &&
          event.nativeEvent.keyCode !== 229
        ) {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      }}
    >
      <header
        ref={headerRef}
        className="bot-header"
        onPointerDown={startDrag}
        tabIndex={0}
        title={l("Move window with arrow keys; Home centers it.")}
        aria-label={l("Move window with arrow keys; Home centers it.")}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget || maximized || mobile)
            return;
          const step = event.shiftKey ? 40 : 10;
          if (
            ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
              event.key,
            )
          ) {
            event.preventDefault();
            setGeometry((previous) =>
              clampGeometry({
                ...previous,
                x:
                  previous.x +
                  (event.key === "ArrowRight"
                    ? step
                    : event.key === "ArrowLeft"
                      ? -step
                      : 0),
                y:
                  previous.y +
                  (event.key === "ArrowDown"
                    ? step
                    : event.key === "ArrowUp"
                      ? -step
                      : 0),
          …40888 tokens truncated…t(
    page
      .locator(".tool-workspace")
      .getByRole("heading", { name: "Ohm’s law", exact: true }),
  ).toBeVisible();
}

async function calculateOhmExample(page: Page) {
  const worksheet = page.locator(".tool-workspace");
  await worksheet.getByLabel(/^Voltage/).fill("230");
  await worksheet.getByLabel(/^Resistance/).fill("23");
  await worksheet
    .getByRole("button", { name: "Calculate", exact: true })
    .click();
  const current = worksheet.locator(".result-grid > div").filter({
    has: page.getByText("Current", { exact: true }),
  });
  await expect(current.locator("strong")).toHaveText("10 A");
  await expect(worksheet.locator(".tool-result")).toContainText("2,300");
}

async function projectSnapshot(page: Page) {
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export project", exact: true })
    .click();
  const file = await download;
  return JSON.parse(await readFile((await file.path())!, "utf8"));
}

test("visible Help supports keyboard focus, useful empty results and safe external support", async ({
  page,
}) => {
  await ready(page);
  const launcher = page.locator(".help-launch");
  await expect(launcher).toBeVisible();
  const help = await openHelp(page);
  const search = help.getByRole("searchbox", {
    name: "Search help",
    exact: true,
  });
  await expect(search).toBeFocused();
  const close = help.getByRole("button", { name: "Close", exact: true });
  const support = help.getByRole("link", {
    name: "Open a GitHub issue",
    exact: true,
  });
  await expect(support).toHaveAttribute(
    "href",
    "https://github.com/HephzibahBehulahHQ/AdigunPowerLab/issues/new",
  );
  await expect(support).toHaveAttribute("rel", /noopener/);
  await close.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(support).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await search.fill("unmatched-question-709531");
  await expect(
    help.getByRole("heading", {
      name: "No matching help topics.",
      exact: true,
    }),
  ).toBeVisible();
  await help
    .locator(".help-empty")
    .getByRole("button", { name: "Clear search", exact: true })
    .click();
  await expect(search).toHaveValue("");
  await expect(search).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(help).toHaveCount(0);
  await expect(launcher).toBeFocused();
});

test("Help remains discoverable and usable on a narrow mobile screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  const launcher = page.locator(".help-launch");
  await expect(launcher).toBeInViewport();
  const box = await launcher.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(391);
  const help = await openHelp(page);
  const search = help.getByRole("searchbox", {
    name: "Search help",
    exact: true,
  });
  await expect(search).toBeInViewport();
  await search.fill("T01");
  await expect(
    help.getByRole("article", { name: "Ohm’s law", exact: true }),
  ).toContainText("230");
  await help.getByRole("button", { name: "Open tool", exact: true }).click();
  await expect(
    page
      .locator(".tool-workspace")
      .getByRole("heading", { name: "Ohm’s law", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.body.scrollWidth),
  ).toBeLessThanOrEqual(390);
});

test("English, German, Yoruba and Pidgin queries open the translated guide", async ({
  page,
}) => {
  await ready(page);
  for (const [locale, title, label, query, toolTitle] of [
    ["en", "Help & Support", "Search help", "Ohm's law", "Ohm’s law"],
    [
      "de",
      "Hilfe & Support",
      "Hilfe durchsuchen",
      "Ohmsches Gesetz",
      "Ohmsches Gesetz",
    ],
    ["yo", "Ìrànlọ́wọ́ àti àtìlẹ́yìn", "Wá ìrànlọ́wọ́", "Ofin Ohm", "Òfin Ohm"],
    ["pcm", "Help & Support", "Search help", "Ohm law", "Ohm law"],
  ]) {
    await page.locator(".language-select").selectOption(locale);
    await page
      .locator(".page-heading")
      .getByRole("button", { name: title, exact: true })
      .click();
    const help = page.getByRole("dialog", { name: title, exact: true });
    await help.getByRole("searchbox", { name: label, exact: true }).fill(query);
    await expect(
      help.getByRole("article", { name: toolTitle, exact: true }),
    ).toBeVisible();
    await expect(help.locator(".help-topic-list")).toContainText("T01");
    await page.keyboard.press("Escape");
    await expect(help).toHaveCount(0);
  }
});

test("command search finds practical help and restores its launcher after the handoff", async ({
  page,
}) => {
  await ready(page);
  const launcher = page.locator(".command-button");
  await launcher.click();
  const commands = page.getByRole("dialog", { name: "Search", exact: true });
  await commands
    .getByPlaceholder("Search tools, loads and pages", { exact: true })
    .fill("Save failed");
  await commands
    .getByRole("button", {
      name: "Help · Understand results and solve problems",
      exact: true,
    })
    .click();
  const help = page.getByRole("dialog", {
    name: "Help & Support",
    exact: true,
  });
  await expect(
    help.getByRole("article", {
      name: "Understand results and solve problems",
      exact: true,
    }),
  ).toContainText("keep the tab open");
  await expect(
    help.getByRole("searchbox", { name: "Search help", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(help).toHaveCount(0);
  await expect(launcher).toBeFocused();
});

test("guide-to-tool navigation calculates real inputs, handles repeat requests and preserves saved work", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await ready(page);
  await page.getByRole("button", { name: "Add load", exact: true }).click();
  const editor = page.getByRole("dialog", { name: "Add load", exact: true });
  await editor
    .getByLabel("Name", { exact: true })
    .fill("Help regression heater");
  await editor.getByLabel(/^Rating/).fill("2.3");
  await editor.getByRole("button", { name: "Add load", exact: true }).click();
  await expect(page.locator(".save-badge")).toContainText("Saved locally");
  const before = await projectSnapshot(page);
  await openOhmGuideTool(page);
  await calculateOhmExample(page);
  await page.locator(".tool-item").filter({ hasText: "T02" }).click();
  await expect(page.locator(".tool-workspace .eyebrow")).toContainText("T02");
  await openOhmGuideTool(page);
  await calculateOhmExample(page);
  await page.locator(".tool-item").filter({ hasText: "T02" }).click();
  await page.locator(".command-button").click();
  const commands = page.getByRole("dialog", { name: "Search", exact: true });
  await commands
    .getByPlaceholder("Search tools, loads and pages", { exact: true })
    .fill("T01");
  await commands
    .getByRole("button", { name: "T01 · Ohm’s law", exact: true })
    .click();
  await expect(commands).toHaveCount(0);
  await expect(page.locator(".tool-workspace .eyebrow")).toContainText("T01");
  await calculateOhmExample(page);
  expect(await projectSnapshot(page)).toEqual(before);
  await page.reload();
  await expect(page.locator(".save-badge")).toContainText("Saved locally");
  expect(await projectSnapshot(page)).toEqual(before);
  expect(errors).toEqual([]);
});

test("Help does not discard an unfinished settings draft when a guide requests navigation", async ({
  page,
}) => {
  await ready(page, "/#/settings");
  const name = page.getByLabel("Project name", { exact: true });
  await name.fill("Uncommitted help draft");
  const help = await openHelp(page);
  await help
    .getByRole("searchbox", { name: "Search help", exact: true })
    .fill("T01");
  await help.getByRole("button", { name: "Open tool", exact: true }).click();
  await expect(help).toBeVisible();
  await expect(
    help.getByRole("status").filter({
      hasText:
        "Finish or cancel your current edits before opening another workspace.",
    }),
  ).toBeVisible();
  await expect(page).toHaveURL(/#\/settings$/);
  await page.keyboard.press("Escape");
  await expect(name).toHaveValue("Uncommitted help draft");
  const settings = page.locator("form").filter({ has: name });
  await settings.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator(".save-badge")).toContainText("Saved locally");
  await openOhmGuideTool(page);
  expect((await projectSnapshot(page)).name).toBe("Uncommitted help draft");
});

test("cached production Help and linked calculations remain available offline", async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.config.metadata.production,
    "Requires production service worker",
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await ready(page);
  await page.evaluate(() =>
    navigator.serviceWorker.ready.then(() => undefined),
  );
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.context().setOffline(true);
  await page.reload();
  await expect(page.locator(".help-launch")).toBeVisible();
  await openOhmGuideTool(page);
  await calculateOhmExample(page);
  expect(errors).toEqual([]);
});
