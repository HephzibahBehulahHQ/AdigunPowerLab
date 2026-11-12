import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";
import {
  Activity,
  Zap,
  LayoutDashboard,
  Table2,
  Network,
  GitBranch,
  Clock3,
  Cable,
  Cog,
  Waves,
  Calculator,
  Sun,
  CarFront,
  GitCompareArrows,
  CircleDollarSign,
  Library,
  FileText,
  BookOpen,
  History,
  Settings2,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Download,
  Upload,
  Search,
  Undo2,
  Redo2,
  Save,
  X,
  ArrowUpRight,
  ChevronRight,
  Copy,
  Bot,
  ExternalLink,
  AlertTriangle,
  Check,
  Info,
  HelpCircle,
  LoaderCircle,
  ChevronDown,
  ArrowRight,
  Trash2,
  RefreshCw,
  FolderOpen,
  SlidersHorizontal,
} from "lucide-react";
import type { Project, Load } from "./domain/types";
import {
  createProject,
  createLoad,
  duplicateProject,
  validateProjectImport,
} from "./domain/project";
import { calculateProject } from "./engine/electrical";
import {
  REFERENCE_CASES,
  createReferenceProject,
} from "./data/reference-projects";
import {
  listProjects,
  saveProject,
  setTrashed,
  projectHistory,
  readPreference,
  writePreference,
} from "./storage/projects";
import type { ProjectRecord } from "./storage/projects";
import {
  downloadFile,
  exportProject,
  exportLoads,
  previewImport,
  parseCSV,
  safeName,
} from "./import-export/files";
import type { ImportPreview, CSVImportMapping } from "./import-export/files";
import {
  mergeProjectObjects,
  replaceProjectContents,
} from "./import-export/projectDestination";
import {
  LanguageContext,
  languages,
  translate,
  numberFormat,
  money,
} from "./i18n";
import type { Locale } from "./i18n";
import { LocaleNumberInput } from "./i18n/LocaleNumberInput";
import { CommandReview } from "./features/CommandReview";
import type {
  CommandPreview,
  ProjectCommand,
} from "./commands/projectCommands";
import { Modal, Field, Notice, ResizeHandle } from "./features/ui";
import { LoadEditor } from "./features/LoadEditor";
import { HelpSupport } from "./features/HelpSupport";
import { searchHelp } from "./help/content";
import {
  DetailModeControl,
  LoadCalculationDetails,
  type DetailMode,
} from "./features/DetailViews";
import { UpdateBanner } from "./features/UpdateBanner";
import { useUpdateGuard } from "./pwa/useUpdateGuard";
import { updateBlockers } from "./pwa/updates";
import {
  Overview,
  Loads,
  Boards,
  Diagram,
  Simulation,
} from "./features/WorkspacePages";
import {
  Renewables,
  EVPlanner,
  Costs,
  Scenarios,
} from "./features/EnergyPages";
import { Toolbox } from "./features/Toolbox";
import { EquipmentLibrary } from "./features/EquipmentLibrary";
import {
  ScenarioWorkspace,
  RevisionComparison,
} from "./features/ProjectComparison";
import { WorkspaceRecovery } from "./features/WorkspaceRecovery";
import { LoadOperations } from "./features/LoadOperations";
import { TopologyEditor } from "./features/TopologyEditor";
import { AdvancedPlanning } from "./features/AdvancedPlanning";
import { FeederAssessment } from "./features/FeederAssessment";
import { SourceRegistry, ProjectOrganization } from "./features/SourceRegistry";

import type { ReportContext } from "./import-export/reportSnapshot";
import type {
  CalendarResult,
  RangeOptions,
  EnergyOptions,
} from "./engine/simulation";
import {
  previewProjectCommand,
  applyProjectCommand,
} from "./commands/projectCommands";
import { tools } from "./tools";
import { resetBotWindowState } from "./bot/windowState";
const ReportWorkspace = lazy(() =>
  import("./features/ReportWorkspace").then((module) => ({
    default: module.ReportWorkspace,
  })),
);
const Billing = lazy(() =>
  import("./features/Billing").then((m) => ({ default: m.Billing })),
);
const SpatialView = lazy(() => import("./features/SpatialView"));
const Measurements = lazy(() => import("./features/Measurements"));
const LocalBot = lazy(() =>
  import("./bot/LocalBot").then((m) => ({ default: m.LocalBot })),
);
const routes = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    group: "Workspace",
  },
  { id: "loads", label: "Load Schedule", icon: Table2, group: "Workspace" },
  {
    id: "boards",
    label: "Boards & Circuits",
    icon: Network,
    group: "Workspace",
  },
  {
    id: "diagram",
    label: "Single-Line Studio",
    icon: GitBranch,
    group: "Workspace",
  },
  {
    id: "simulation",
    label: "Schedules & Simulation",
    icon: Clock3,
    group: "Workspace",
  },
  {
    id: "cables",
    label: "Cables & Protection",
    icon: Cable,
    group: "Engineering",
  },
  { id: "motors", label: "Motors & Supply", icon: Cog, group: "Engineering" },
  { id: "quality", label: "Power Quality", icon: Waves, group: "Engineering" },
  {
    id: "tools",
    label: "Engineering Toolbox",
    icon: Calculator,
    group: "Engineering",
  },
  {
    id: "renewables",
    label: "Renewables & Storage",
    icon: Sun,
    group: "Energy & Planning",
  },
  {
    id: "ev",
    label: "EV & Flexible Loads",
    icon: CarFront,
    group: "Energy & Planning",
  },
  {
    id: "scenarios",
    label: "Scenarios & Optimization",
    icon: GitCompareArrows,
    group: "Energy & Planning",
  },
  {
    id: "costs",
    label: "Costs & Carbon",
    icon: CircleDollarSign,
    group: "Energy & Planning",
  },
  {
    id: "library",
    label: "Equipment Library",
    icon: Library,
    group: "Resources",
  },
  {
    id: "reports",
    label: "Reports & Estimates",
    icon: FileText,
    group: "Resources",
  },
  {
    id: "reference",
    label: "Engineering Reference",
    icon: BookOpen,
    group: "Resources",
  },
  {
    id: "history",
    label: "History & Issues",
    icon: History,
    group: "Resources",
  },
  { id: "settings", label: "Settings", icon: Settings2, group: "Resources" },
];
const equipment: [string, string, number, number, number][] = [
  ["LED lighting point", "Lighting", 0.01, 1, 5],
  ["LED panel", "Lighting", 0.04, 0.95, 8],
  ["Resistive heater", "Heating", 2, 1, 4],
  ["Domestic kettle", "Appliances", 2.3, 1, 0.25],
  ["Electric oven", "Appliances", 2.5, 1, 1],
  ["Refrigerator", "Refrigeration", 0.15, 0.85, 24],
  ["Desktop workstation", "IT & servers", 0.15, 0.95, 8],
  ["Network rack", "IT & servers", 0.5, 0.95, 24],
  ["Laptop power supply", "IT & servers", 0.065, 0.95, 8],
  ["Ventilation fan", "HVAC", 0.12, 0.8, 8],
  ["Small water pump", "Pumps", 0.75, 0.8, 4],
  ["Workshop drill", "Workshop", 0.8, 0.8, 1],
  ["Air compressor", "Workshop", 2.2, 0.85, 4],
  ["Washing machine", "Appliances", 2, 1, 1],
  ["Water heater", "Heating", 3, 1, 2],
  ["EV single-phase charger", "EV", 7.4, 1, 4],
  ["General three-phase motor", "Motor", 7.5, 0.85, 4],
  ["User-entered equipment", "General", 0, 1, 0],
];
export default function App() {
  const [locale, setLocale] = useState<Locale>(() =>
    readPreference("locale", "en"),
  );
  const t = (s: string) => translate(s, locale);
  const [project, setProject] = useState<Project>(() =>
    createProject("Untitled project"),
  );
  const [loaded, setLoaded] = useState(false);
  const [records, setRecords] = useState<ProjectRecord[]>([]);
  const [route, setRoute] = useState(() => {
    const r = location.hash.slice(2);
    return routes.some((x) => x.id === r) ? r : "overview";
  });
  const [saveState, setSaveState] = useState("Saving");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(() => readPreference("theme", "dark"));
  const [motion, setMotion] = useState(() =>
    readPreference("motion", "system"),
  );
  const [sidebar, setSidebar] = useState(() =>
    readPreference("sidebar", innerWidth > 900),
  );
  const [sidebarWidth, setSidebarWidth] = useState(() =>
    readPreference("sidebarWidth", 240),
  );
  const [inspectorWidth, setInspectorWidth] = useState(() =>
    readPreference("inspectorWidth", 300),
  );
  const [detailMode, setDetailMode] = useState<DetailMode>(() =>
    readPreference<string>("detailMode", "engineering") === "simple"
      ? "simple"
      : "engineering",
  );
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>(() =>
    readPreference("collapsedGroups", []),
  );
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar",
      sidebarWidth + "px",
    );
    document.documentElement.style.setProperty(
      "--inspector",
      inspectorWidth + "px",
    );
    writePreference("sidebarWidth", sidebarWidth);
    writePreference("inspectorWidth", inspectorWidth);
    writePreference("detailMode", detailMode);
    writePreference("collapsedGroups", collapsedGroups);
  }, [sidebarWidth, inspectorWidth, detailMode, collapsedGroups]);
  const [selected, setSelected] = useState<string>();
  const [showTrace, setShowTrace] = useState(false);
  const [diagramView, setDiagramView] = useState<"single" | "spatial">(
    "single",
  );
  const [editor, setEditor] = useState<{ load?: Load } | null>(null);
  const [dialog, setDialog] = useState<
    "projects" | "import" | "commands" | "references" | "rename" | "help" | null
  >(null);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [helpQuery, setHelpQuery] = useState("");
  const [helpNavigationBlocked, setHelpNavigationBlocked] = useState(false);
  const commandOpener = useRef<HTMLElement | null>(null);
  const helpOpener = useRef<HTMLElement | null>(null);
  const [commandReview, setCommandReview] = useState<{
    preview: CommandPreview;
    selectedId?: string;
  }>();
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importBusy, setImportBusy] = useState(false);
  const [csvFile, setCSVFile] = useState<File>();
  const [csvHeaders, setCSVHeaders] = useState<string[]>([]);
  const [csvMapping, setCSVMapping] = useState<CSVImportMapping>({});
  const [mappingDirty, setMappingDirty] = useState(false);
  const [importMode, setImportMode] = useState<"new" | "merge" | "replace">(
    "new",
  );
  const [importTarget, setImportTarget] = useState<{
    id: string;
    revision: number;
  }>();
  const [botOpen, setBotOpen] = useState(false);
  const [reportTab, setReportTab] = useState<"engineering" | "billing">(
    "engineering",
  );
  const [, setReportBusy] = useState(false);
  const [reportContext, setReportContext] = useState<ReportContext>({});
  useEffect(
    () =>
      setReportContext((previous) => {
        const next = { ...previous };
        for (const key of ["calendar", "energy", "ev"] as const)
          if (
            next[key] &&
            (next[key]!.projectId !== project.id ||
              next[key]!.revision !== project.revision)
          )
            delete next[key];
        return next;
      }),
    [project.id, project.revision],
  );
  const rememberCalendar = (
    calculated: CalendarResult,
    inputs: Record<string, unknown> | RangeOptions,
  ) =>
    setReportContext((context) => ({
      ...context,
      calendar: {
        projectId: project.id,
        revision: project.revision,
        calculatedAt: new Date().toISOString(),
        result: calculated,
        inputs: inputs as RangeOptions,
        source: "Completed calendar simulation",
      },
    }));
  const [toolId, setToolId] = useState("");
  const [toolRequest, setToolRequest] = useState(0);
  const [revisions, setRevisions] = useState<Project[]>([]);
  const undo = useRef<Project[]>([]),
    redo = useRef<Project[]>([]);
  const [historyTick, setHistoryTick] = useState(0);
  const latest = useRef(project);
  latest.current = project;
  const lastSaved = useRef(new Map<string, number>());
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const channel = useRef<BroadcastChannel | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const result = useMemo(() => calculateProject(project), [project]);
  const selectedLoad = project.loads.find((l) => l.id === selected);
  const selectedResult = result.loads.find((l) => l.id === selected);
  const selectedBoard = project.boards.find((row) => row.id === selected);
  const selectedCircuit = project.circuits.find((row) => row.id === selected);
  const selectedSource = project.sources?.find((row) => row.id === selected);
  const selectedObject =
    selectedLoad ?? selectedBoard ?? selectedCircuit ?? selectedSource;
  const refreshRecords = useCallback(async () => {
    try {
      setRecords(await listProjects(true));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    let alive = true;
    listProjects(true)
      .then((all) => {
        if (!alive) return;
        setRecords(all);
        const id = readPreference("currentProject", "");
        const found =
          all.find((r) => r.id === id && !r.deleted) ||
          all.find((r) => !r.deleted);
        if (found) {
          lastSaved.current.set(found.id, found.project.revision);
          setProject(found.project);
          setSaveState("Saved locally");
        }
        setLoaded(true);
      })
      .catch((e) => {
        if (alive) {
          setError((e as Error).message);
          setSaveState("Save failed");
          setLoaded(true);
        }
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    const media = matchMedia("(max-width: 800px)");
    const closeSmall = () => {
      if (media.matches) setSidebar(false);
    };
    media.addEventListener("change", closeSmall);
    return () => media.removeEventListener("change", closeSmall);
  }, []);
  useEffect(() => {
    writePreference("locale", locale);
    document.documentElement.lang = locale;
    writePreference("theme", theme);
    writePreference("motion", motion);
    writePreference("sidebar", sidebar);
    const mq = matchMedia("(prefers-color-scheme: light)");
    const apply = () => {
      document.documentElement.dataset.theme =
        theme === "system" ? (mq.matches ? "light" : "dark") : theme;
    };
    apply();
    mq.addEventListener("change", apply);
    document.documentElement.dataset.motion = motion;
    return () => mq.removeEventListener("change", apply);
  }, [locale, theme, motion, sidebar]);
  function persist(p: Project = latest.current) {
    setSaveState("Saving");
    const work = saveQueue.current
      .catch(() => {})
      .then(async () => {
        await saveProject(p, lastSaved.current.get(p.id));
        lastSaved.current.set(p.id, p.revision);
        if (
          latest.current.id === p.id &&
          latest.current.revision === p.revision
        )
          setSaveState("Saved locally");
        if (latest.current.id === p.id) writePreference("currentProject", p.id);
        channel.current?.postMessage({
          id: p.id,
          revision: p.revision,
          updatedAt: p.updatedAt,
        });
        await refreshRecords();
      });
    saveQueue.current = work;
    work.catch((e) => {
      setSaveState("Save failed");
      setError((e as Error).message);
    });
    return work;
  }
  useEffect(() => {
    if (!loaded) return;
    setSaveState("Unsaved changes");
    const id = setTimeout(() => {
      void persist(project);
    }, 450);
    return () => clearTimeout(id);
  }, [project, loaded]);
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const c = new BroadcastChannel("AdigunPowerLab");
    channel.current = c;
    c.onmessage = (e) => {
      if (
        e.data.id === latest.current.id &&
        e.data.updatedAt !== latest.current.updatedAt &&
        e.data.revision >= latest.current.revision
      ) {
        setError(
          "Another tab has changed this project. Export your work, save a copy, or reopen the saved project.",
        );
        setSaveState("Save failed");
      }
      void refreshRecords();
    };
    return () => c.close();
  }, [refreshRecords]);
  useEffect(() => {
    const handler = (e: Event) => setError((e as CustomEvent<string>).detail);
    window.addEventListener("powerlab-storage-warning", handler);
    return () =>
      window.removeEventListener("powerlab-storage-warning", handler);
  }, []);
  function change(mutator: (draft: Project) => void) {
    const previous = latest.current;
    const draft = structuredClone(previous);
    try {
      mutator(draft);
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
    draft.revision = previous.revision + 1;
    draft.updatedAt = new Date().toISOString();
    undo.current.push(previous);
    if (undo.current.length > 50) undo.current.shift();
    redo.current = [];
    latest.current = draft;
    setSaveState("Unsaved changes");
    setProject(draft);
    setHistoryTick((n) => n + 1);
    return true;
  }
  function undoChange() {
    const next = undo.current.pop();
    if (!next) return;
    const current = latest.current;
    redo.current.push(current);
    const restored = {
      ...structuredClone(next),
      revision: current.revision + 1,
      updatedAt: new Date().toISOString(),
    };
    latest.current = restored;
    setProject(restored);
    setHistoryTick((n) => n + 1);
  }
  function redoChange() {
    const next = redo.current.pop();
    if (!next) return;
    const current = latest.current;
    undo.current.push(current);
    const restored = {
      ...structuredClone(next),
      revision: current.revision + 1,
      updatedAt: new Date().toISOString(),
    };
    latest.current = restored;
    setProject(restored);
    setHistoryTick((n) => n + 1);
  }
  function go(r: string) {
    setRoute(r);
    history.replaceState(null, "", "#/" + r);
    setDialog(null);
    setQuery("");
    if (innerWidth < 900) setSidebar(false);
    if (r === "history")
      void projectHistory(project.id)
        .then(setRevisions)
        .catch((e) => setError(e.message));
  }
  function openHelp(query = "") {
    helpOpener.current =
      dialog === "commands"
        ? commandOpener.current
        : (document.activeElement as HTMLElement | null);
    setHelpQuery(query);
    setHelpNavigationBlocked(false);
    setDialog("help");
  }
  function openCommands() {
    commandOpener.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setDialog("commands");
  }
  async function openProject(next: Project) {
    try {
      const source = latest.current;
      if (saveState === "Save failed" && next.id === source.id) {
        if (
          !confirm("Reload the saved project? Export your unsaved work first.")
        )
          return;
        setError("");
      } else {
        await persist(source);
        if (
          latest.current.id !== source.id ||
          latest.current.revision !== source.revision
        ) {
          setError(
            "Project changed during saving. Your edits are preserved; open the other project again.",
          );
          return;
        }
      }
      undo.current = [];
      redo.current = [];
      setHistoryTick((n) => n + 1);
      lastSaved.current.set(
        next.id,
        records.find((r) => r.id === next.id)?.project.revision ??
          next.revision,
      );
      latest.current = structuredClone(next);
      writePreference("currentProject", next.id);
      setProject(latest.current);
      setSelected(undefined);
      setDialog(null);
      go("overview");
    } catch {
      /* Preserve current project when persistence fails. */
    }
  }
  async function createAndOpen(next: Project) {
    try {
      const source = latest.current;
      await persist(source);
      if (
        latest.current.id !== source.id ||
        latest.current.revision !== source.revision
      ) {
        setError(
          "Project changed during saving. Your edits are preserved; create the project again.",
        );
        return;
      }
      await saveProject(next);
      lastSaved.current.set(next.id, next.revision);
      await refreshRecords();
      undo.current = [];
      redo.current = [];
      latest.current = next;
      writePreference("currentProject", next.id);
      setProject(next);
      setSelected(undefined);
      setDialog(null);
      go("overview");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function closeProject(trash: boolean) {
    const source = latest.current;
    const next = createProject("Untitled project");
    await createAndOpen(next);
    if (latest.current.id !== next.id) return;
    try {
      if (trash) await setTrashed(source.id, true);
      await refreshRecords();
      setMessage(
        t(
          trash
            ? "Project moved to trash"
            : "Project closed; saved work remains available in Open project.",
        ),
      );
    } catch (error) {
      setError((error as Error).message);
    }
  }
  function saveLoad(load: Load) {
    const prior = project.loads.find((row) => row.id === load.id);
    if (
      prior?.locked &&
      (prior.phase !== load.phase ||
        prior.connection !== load.connection ||
        JSON.stringify(prior.phasePair) !== JSON.stringify(load.phasePair))
    )
      throw new Error(
        t("Unlock the load first before changing its phase or connection."),
      );
    const commands: ProjectCommand[] = [];
    if (!prior) commands.push({ kind: "loads.insert", loads: [load] });
    else {
      const { id, phase, boardId, circuitId, ...patch } = load;
      commands.push({ kind: "loads.patch", ids: [id], patch });
      if (prior.circuitId !== circuitId || prior.boardId !== boardId)
        commands.push({ kind: "loads.assign", ids: [id], boardId, circuitId });
      if (prior.phase !== phase)
        commands.push({ kind: "loads.phase", ids: [id], phase });
    }
    const reviewed = previewProjectCommand(project, {
      kind: "batch",
      commands,
    });
    if (reviewed.errors.length) throw new Error(reviewed.errors.join(" "));
    if (reviewed.changes.some((item) => item.objectId !== load.id)) {
      setEditor(null);
      setCommandReview({ preview: reviewed, selectedId: load.id });
      return;
    }
    if (change((p) => Object.assign(p, applyProjectCommand(p, reviewed)))) {
      setEditor(null);
      setSelected(load.id);
      setMessage(t("Load updated"));
      go("loads");
    }
  }
  async function pdf() {
    setReportBusy(true);
    setError("");
    try {
      const { createEngineeringPdf } = await import("./import-export/reports");
      const frozen = structuredClone(project);
      const blob = await createEngineeringPdf(
        frozen,
        calculateProject(frozen),
        { locale },
      );
      downloadFile(
        safeName(project.name) + "-engineering-report.pdf",
        blob,
        "application/pdf",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setReportBusy(false);
    }
  }
  useEffect(() => {
    function key(e: KeyboardEvent) {
      const input = (e.target as HTMLElement)?.closest(
        'input,textarea,select,[contenteditable="true"]',
      );
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openCommands();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void persist();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !input) {
        e.preventDefault();
        e.shiftKey ? redoChange() : undoChange();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y" && !input) {
        e.preventDefault();
        redoChange();
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [project]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3500);
    return () => clearTimeout(timer);
  }, [message]);
  async function importFile(file: File) {
    setImportBusy(true);
    setError("");
    try {
      let next: ImportPreview;
      setCSVFile(undefined);
      setCSVHeaders([]);
      setCSVMapping({});
      setMappingDirty(false);
      if (file.name.toLowerCase().endsWith(".csv") && file.size <= 5_000_000) {
        const headers = parseCSV(await file.text())[0] ?? [];
        setCSVFile(file);
        setCSVHeaders(headers);
        const aliases: Record<string, string> = {
          power_kw: "rating",
          kw: "rating",
          power: "rating",
          hours: "hoursperday",
          powerfactor: "pf",
        };
        const columns: Record<string, number> = {};
        headers.forEach((header, index) => {
          const key = header
            .trim()
            .toLowerCase()
            .replace(/^\uFEFF/, "");
          if (
            [
              "name",
              "rating",
              "quantity",
              "entrymode",
              "voltage",
              "connection",
              "pf",
              "phase",
              "hoursperday",
              "starthour",
              "duty",
              "utilization",
              "efficiency",
              "reactive",
              "standbyw",
              "pfkind",
              "reactivekvar",
              "phasepair",
              "source",
            ].includes(aliases[key] ?? key)
          )
            columns[aliases[key] ?? key] = index;
        });
        setCSVMapping({ columns, ratingUnit: "native" });
        try {
          next = await previewImport(file);
        } catch (error) {
          next = {
            kind: "loads",
            loads: [],
            warnings: [],
            errors: [(error as Error).message],
          };
        }
      } else next = await previewImport(file);
      if (next.kind !== "project") {
        next.project = {
          ...createProject(file.name.replace(/\.[^.]+$/, "")),
          loads: next.loads,
        };
      }
      setPreview(next);
      setImportMode(next.kind === "project" ? "new" : "merge");
      setImportTarget({
        id: latest.current.id,
        revision: latest.current.revision,
      });
      setDialog("import");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setImportBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  async function applyImport() {
    if (!preview?.project || preview.errors.length) return;
    setError("");
    try {
      if (
        importMode !== "new" &&
        (latest.current.id !== importTarget?.id ||
          latest.current.revision !== importTarget?.revision)
      )
        throw new Error(
          t("Project changed. Preview the import again before applying."),
        );
      if (importMode === "new") {
        const next = duplicateProject(
          preview.project,
          preview.project.name + " Â· imported",
        );
        await createAndOpen(next);
        if (latest.current.id !== next.id) return;
      } else {
        const next =
          importMode === "merge"
            ? mergeProjectObjects(latest.current, preview.project)
            : replaceProjectContents(latest.current, preview.project);
        if (
          !change((p) => {
            for (const key of Object.keys(p))
              delete (p as unknown as Record<string, unknown>)[key];
            Object.assign(p, next);
          })
        )
          return;
      }
      setDialog(null);
      setPreview(null);
      go("loads");
    } catch (error) {
      setError((error as Error).message);
    }
  }
  function libraryPage() {
    return (
      <>
        <EquipmentLibrary
          key={project.id}
          project={project}
          detailMode={detailMode}
          onDetailModeChange={setDetailMode}
          change={change}
          onAdd={(load) => setEditor({ load })}
        />
        <Notice>
          {t("Typical estimate")}. Generic analytical starting values, clearly
          identified as assumptions. Review each rating and source before adding
          to your project.
        </Notice>
        <div className="equipment-grid">
          {equipment.map(([name, category, rating, pf, hours]) => (
            <button
              className="panel equipment-card"
              key={name}
              onClick={() =>
                setEditor({
                  load: createLoad({
                    name,
                    category,
                    rating,
                    pf,
                    hoursPerDay: hours,
                    connection:
                      name === "General three-phase motor" ? "three" : "single",
                    voltage: name === "General three-phase motor" ? 400 : 230,
                    duty: name === "Refrigerator" ? 0.35 : 1,
                    source: {
                      kind: "estimate",
                      reference:
                        "AdigunPowerLab generic analytical starting value; verify actual nameplate. Not manufacturer data.",
                    },
                  }),
                })
              }
            >
              <span className="equipment-icon">
                <Zap size={22} />
              </span>
              <span className="eyebrow">{category}</span>
              <h3>{name}</h3>
              <p>
                {rating} kW Â· PF {pf}
              </p>
              <span className="text-button">
                {t("Add load")}
                <Plus size={16} />
              </span>
            </button>
          ))}
        </div>
        <div className="panel panel-pad">
          <h3>{t("Worked reference case")}</h3>
          <div className="reference-grid">
            {REFERENCE_CASES.map((c) => (
              <button
                key={c.id}
                className="reference-card"
                onClick={() => setDialog("references")}
              >
                <BookOpen size={20} />
                <strong>{c.name}</strong>
                <small>{c.description}</small>
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }
  function historyPage() {
    return (
      <>
        <RevisionComparison
          key={project.id}
          project={project}
          revisions={revisions}
          change={change}
        />
        <section className="panel panel-pad">
          <div className="panel-title">
            <h3>{t("Issues")}</h3>
            <span className="tag amber">{result.issues.length}</span>
          </div>
          {result.issues.length ? (
            result.issues.map((issue) => (
              <div className="issue-detail" key={issue.id}>
                <AlertTriangle size={18} />
                <div>
                  <span
                    className={
                      "tag " + (issue.severity === "error" ? "red" : "amber")
                    }
                  >
                    {issue.assessment}
                  </span>
                  <p>{t(issue.message)}</p>
                  {issue.entityId && (
                    <button
                      className="text-button"
                      onClick={() => {
                        setSelected(issue.entityId);
                        go("loads");
                      }}
                    >
                      {t("Show details")}
                      <ArrowUpRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>{t("No unresolved issues")}</p>
          )}
        </section>
        <section className="panel panel-pad">
          <div className="panel-title">
            <h3>{t("History & Issues")}</h3>
            <button
              className="button"
              onClick={() => void projectHistory(project.id).then(setRevisions)}
            >
              <RefreshCw size={15} />
              {t("History")}
            </button>
          </div>
          <div className="history-list">
            {revisions.map((p) => (
              <div key={p.revision}>
                <span className="history-dot" />
                <span>
                  <strong>
                    {t("Revision")} {p.revision}
                  </strong>
                  <small>
                    {new Date(p.updatedAt).toLocaleString(
                      locale === "pcm" ? "en-NG" : locale,
                    )}{" "}
                    Â· {p.loads.length} loads Â·{" "}
                    {calculateProject(p).installedKW.toFixed(3)} kW
                  </small>
                </span>
                <button
                  className="button"
                  onClick={() => {
                    if (
                      confirm(`${t("Restore")} ${t("Revision")} ${p.revision}?`)
                    )
                      change((d) => {
                        const id = d.id;
                        for (const key of Object.keys(d))
                          delete (d as unknown as Record<string, unknown>)[key];
                        Object.assign(d, structuredClone(p), { id });
                      });
                  }}
                >
                  {t("Restore")}
                </button>
              </div>
            ))}
          </div>
          <Notice>
            Local revisions and undo history. Export a project backup for
            recovery on another device.
          </Notice>
        </section>
      </>
    );
  }
  function referencePage() {
    return (
      <>
        <div className="panel panel-pad">
          <span className="eyebrow">
            ADIGUNPOWERLAB Â· ENGINE {result.engineVersion}
          </span>
          <h2>{t("Engineering Reference")}</h2>
          <p>{t("Engineering estimate, not installation approval.")}</p>
          <div className="formula-grid">
            {[
              ["Single-phase AC", "P = V Ã— I Ã— PF"],
              ["Balanced three-phase AC", "P = âˆš3 Ã— VLL Ã— I Ã— PF"],
              ["Motor mechanical output", "Pin = Pshaft / Î·"],
              ["Signed reactive power", "Q = Â±P Ã— tan(acos(PF))"],
              ["Combined sinusoidal power", "S = âˆš((Î£P)Â² + (Î£Q)Â²)"],
              ["Energy integration", "E = Î£(Pinterval Ã— elapsed Î”t)"],
              ["Single-phase voltage drop", "Î”V = 2 I L (R cosÏ† + X sinÏ†)"],
              ["Power-factor compensation", "Qc = P (tanÏ†â‚ âˆ’ tanÏ†â‚‚)"],
            ].map(([label, formula]) => (
              <div key={label}>
                <span>{label}</span>
                <code>{formula}</code>
              </div>
            ))}
          </div>
          <h3>{t("Assumptions")}</h3>
          <ul>
            {result.trace.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
          <Notice>
            On-state conductor current and energy duty are separate. Three-phase
            supply assumes a stiff neutral. True power factor does not determine
            a harmonic spectrum. Manual cable/device data must include its
            source.
          </Notice>
          <h3>{t("Sources")}</h3>
          {[
            [
              "Schneider Electric Â· voltage drop",
              "https://www.electrical-installation.org/enwiki/Calculation_of_voltage_drop_in_steady_load_conditions",
            ],
            [
              "Schneider Electric Â· actual maximum demand",
              "https://www.electrical-installation.org/enwiki/Estimation_of_actual_maximum_kVA_demand",
            ],
            [
              "Schneider Electric Â· cable sizing",
              "https://www.electrical-installation.org/enwiki/General_method_for_cable_sizing",
            ],
            [
              "Project calculation methods",
              "https://github.com/HephzibahBehulahHQ/AdigunPowerLab/blob/main/docs/CALCULATION_METHODS.md",
            ],
          ].map(([label, url]) => (
            <a
              className="reference-link"
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              {label}
              <ExternalLink size={15} />
            </a>
          ))}
        </div>
        <div className="panel panel-pad">
          <h3>{t("Keyboard")}</h3>
          <dl className="detail-list">
            <dt>Ctrl / âŒ˜ K</dt>
            <dd>{t("Search")}</dd>
            <dt>Ctrl / âŒ˜ S</dt>
            <dd>{t("Save")}</dd>
            <dt>Ctrl / âŒ˜ Z</dt>
            <dd>{t("Undo")}</dd>
            <dt>Ctrl / âŒ˜ Shift Z</dt>
            <dd>{t("Redo")}</dd>
            <dt>Esc</dt>
            <dd>{t("Close")}</dd>
          </dl>
        </div>
      </>
    );
  }
  const current = routes.find((r) => r.id === route)!;
  return (
    <LanguageContext.Provider value={locale}>
      <div
        className={
          "app " +
          (sidebar ? "" : "sidebar-collapsed") +
          " " +
          detailMode +
          "-mode"
        }
      >
        <a href="#workspace" className="skip-link">
          {t("Workspace")}
        </a>
        <header className="topbar">
          <div className="brand">
            <a
              className="corporate-logo"
              href="https://hephzibahbehulahhq.github.io/"
              target="_blank"
              rel="noreferrer"
              aria-label="Hephzibah Behulah"
            >
              <img
                src="./assets/corporate/hephzibah-behulah-official.jpg"
                alt="Hephzibah Behulah"
              />
            </a>
            <div>
              <h1>
                Adigun<span>PowerLab</span>
              </h1>
              <p>BY HB ELEKTRONIKER</p>
            </div>
            <span className="brand-divider" />
          </div>
          <button
            className="project-switch"
            onClick={() => {
              setDialog("projects");
              void refreshRecords();
            }}
          >
            <FolderOpen size={16} />
            <span>{project.name}</span>
            <ChevronDown size={14} />
          </button>
          <span
            className={
              "save-badge " + (saveState === "Save failed" ? "bad" : "")
            }
            title={t(saveState)}
          >
            {saveState === "Saving" ? (
              <LoaderCircle size={13} className="spin" />
            ) : saveState === "Saved locally" ? (
              <Check size={13} />
            ) : (
              <span className="small-dot" />
            )}
            <span>{t(saveState)}</span>
          </span>
          <span className="spacer" />
          <button className="command-button" onClick={openCommands}>
            <Search size={16} />
            <span>{t("Search")}</span>
            <kbd>âŒ˜ K</kbd>
          </button>
          <select
            className="language-select"
            aria-label={t("Language")}
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
          >
            {Object.entries(languages).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
          <button
            className="icon-button"
            title={t("Settings")}
            onClick={() => go("settings")}
          >
            <Settings2 size={18} />
          </button>
        </header>
        <aside className="sidebar">
          <div className="sidebar-head">
            <span>{t("Workspace")}</span>
            <button
              className="icon-button"
              aria-label={t("Collapse navigation")}
              onClick={() => setSidebar(false)}
            >
              <PanelLeftClose size={17} />
            </button>
          </div>
          <nav aria-label="Main navigation">
            {["Workspace", "Engineering", "Energy & Planning", "Resources"].map(
              (group) => (
                <div className="nav-group" key={group}>
                  <button
                    className="nav-heading nav-group-toggle"
                    aria-expanded={!collapsedGroups.includes(group)}
                    onClick={() =>
                      setCollapsedGroups((groups) =>
                        groups.includes(group)
                          ? groups.filter((item) => item !== group)
                          : [...groups, group],
                      )
                    }
                  >
                    {t(group)}
                    <ChevronDown size={12} />
                  </button>
                  {!collapsedGroups.includes(group) &&
                    routes
                      .filter((r) => r.group === group)
                      .map((r) => (
                        <button
                          key={r.id}
                          className={
                            "nav-item " + (route === r.id ? "active" : "")
                          }
                          onClick={() => go(r.id)}
                          aria-current={route === r.id ? "page" : undefined}
                        >
                          <r.icon size={17} />
                          <span>{t(r.label)}</span>
                          {r.id === "loads" && (
                            <span className="nav-count">
                              {project.loads.length}
                            </span>
                          )}
                          {r.id === "tools" && (
                            <span className="nav-count">{tools.length}</span>
                          )}
                        </button>
                      ))}
                </div>
              ),
            )}
          </nav>
          <div className="sidebar-bottom">
            <div className="local-dot" />
            <div>
              <strong>{t("Local only")}</strong>
              <small>{t("No cloud connection")}</small>
            </div>
            <button
              className="icon-button"
              title={t("Help & Support")}
              aria-label={t("Help & Support")}
              onClick={() => openHelp()}
            >
              <HelpCircle size={17} />
            </button>
          </div>
          <ResizeHandle
            value={sidebarWidth}
            min={190}
            max={390}
            variable="--sidebar"
            label={t("Navigation width")}
            onChange={setSidebarWidth}
          />
        </aside>
        <div className="workspace-shell">
          <div className="workspace-toolbar">
            {!sidebar && (
              <button
                className="icon-button"
                aria-label={t("Open navigation")}
                onClick={() => setSidebar(true)}
              >
                <PanelLeftOpen size={19} />
              </button>
            )}
            <div className="breadcrumb">
              <span>{t(current?.group || "Workspace")}</span>
              <ChevronRight size={14} />
              <strong>{t(current?.label || "Overview")}</strong>
            </div>
            <span className="spacer" />
            <details className="project-actions">
              <summary className="button small-button">{t("Project")}</summary>
              <div
                className="project-menu"
                role="group"
                aria-label={t("Project actions")}
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest("button"))
                    (
                      event.currentTarget.parentElement as HTMLDetailsElement
                    ).open = false;
                }}
              >
                <button
                  onClick={() => {
                    setName("");
                    setDialog("projects");
                    void refreshRecords();
                  }}
                >
                  {t("New project")}
                </button>
                <button
                  onClick={() => {
                    setDialog("projects");
                    void refreshRecords();
                  }}
                >
                  {t("Open project")}
                </button>
                <button
                  onClick={() => {
                    setName(project.name);
                    setDialog("rename");
                  }}
                >
                  {t("Rename project")}
                </button>
                <button
                  onClick={() => void createAndOpen(duplicateProject(project))}
                >
                  {t("Duplicate project")}
                </button>
                <button onClick={() => void persist()}>{t("Save")}</button>
                <button onClick={() => exportProject(project)}>
                  {t("Export project")}
                </button>
                <button onClick={() => fileInput.current?.click()}>
                  {t("Import project")}
                </button>
                <button onClick=×Ý¶öÚ$z{-®éÜj×ˆ
Âˆ‹‹œ›ÝËˆ›Ý]Nˆ›[ÝÜœÈ‹ˆJJKˆ‹‹Š›Ú™XÝ™\]Z\Y[Xœ˜\žHÏÈ×JK›X\

›ÝÊHOˆ
Âˆ‹‹œ›ÝËˆ›Ý]Nˆ›Xœ˜\žH‹ˆJJKˆBˆ™š[\Š
›ÝÊHO‚ˆ›ÝË›˜[YBˆÓØØ[SÝÙ\Ø\ÙJ
Bˆš[˜ÛY\Ê]Y\žKÓØØ[SÝÙ\Ø\ÙJ
JKˆ
BˆœÛXÙJLŠBˆ›X\

›ÝÊHOˆ
ˆ]Û‚ˆÙ^O^Ü›ÝËšYBˆÛÛXÚÏ^Ê
HOˆÂˆÙ]Ù[XÝY
›ÝËšY
NÂˆÛÊ›ÝËœ›Ý]JNÂˆ_Bˆ‚ˆ™]ÛÜšÈÚ^™O^ÌMßHÏ‚ˆÜ›ÝË›˜[Y_BˆÚ]œ›Û”šYÚÚ^™O^ÌMHÏ‚ˆØ]Û‚ˆ
J_BˆÙ]‚ˆÙ]‚ˆÓ[Ù[‚ˆ
_BˆÙX[ÙÈOOHš[ˆ	‰ˆ
ˆ[Ù[ˆ]O^Ý
’[	ˆÝ\ÜŠ_BˆÛÛÜÙO^Ê
HOˆÙ]X[ÙÊ[
_Bˆ™]\›‘›ØÝ\Ï^Ú[Ü[™\‹˜Ý\œ™[BˆÚYBˆ‚ˆÚ[˜]šYØ][Û›ØÚÙY	‰ˆ
ˆ]ˆ›ÛOHœÝ]\È‚ˆ›ÝXÙHÛ™OHØ\›š[™È‚ˆÝ
ˆ‘š[š\ÚÜˆØ[˜Ù[[Ý\ˆÝ\œ™[Y]È™Y›Ü™HÜ[š[™È[›Ý\ˆÛÜšÜÜXÙKˆ‹ˆ
_BˆÓ›ÝXÙO‚ˆÙ]‚ˆ
_Bˆ[Ý\Üˆ[š]X[]Y\žO^Ú[]Y\ž_BˆÛ“˜]šYØ]O^Ê™^›Ý]K™^ÛÛY
HOˆÂˆYˆ
\]P›ØÚÙ\œÊ
K›[™Ý
HÂˆÙ][˜]šYØ][Û›ØÚÙY
YJNÂˆ™]\›ŽÂˆBˆYˆ
™^ÛÛY
HÂˆÙ]ÛÛY
™^ÛÛY
NÂˆÙ]ÛÛ™\]Y\Ý

™\]Y\Ý
HOˆ™\]Y\Ý
ÈJNÂˆBˆÛÊ™^›Ý]JNÂˆ_BˆÏ‚ˆÓ[Ù[‚ˆ
_BˆÙ]‚ˆÓ[™ÝXYÙPÛÛ^”›ÝšY\‚ˆ
NÂŸB™[˜Ý[Ûˆ›Ú™XÝÙ][™ÜÊÂˆ›Ú™XÝˆÚ[™ÙKŸNˆÂˆ›Ú™XÝˆ›Ú™XÝÂˆÚ[™ÙNˆ
]]]ÜŽˆ
ˆ›Ú™XÝ
HOˆ›ÚY
HOˆ›ÚYÂŸJHÂˆÛÛœÝÙ˜YÙ]˜YHH\ÙTÝ]JÝXÝ\™YÛÛ™J›Ú™XÝ
JNÂˆÛÛœÝÝ[œØ]™Y[œ]Ù][œØ]™Y[œ]HH\ÙTÝ]J˜[ÙJNÂˆÛÛœÝÙ\œ›Ü‹Ù]\œ›Ü—HH\ÙTÝ]JˆŠNÂˆÛÛœÝØØ[HH\ÙPÛÛ^ØØ[J
NÂˆÛÛœÝH
ÎˆÝš[™ÊHOˆ˜[œÛ]JËØØ[JNÂˆ\ÙU\]QÝX\™
[œØ]™Y[œ]
”›Ú™XÝÙ][™ÜÈŠJNÂˆ™]\›ˆ
ˆ›Ü›BˆÛ\ÜÓ˜[YOHœ[™[[™[\Y‚ˆÛÚ[™ÙPØ\\™O^Ê
HOˆÙ][œØ]™Y[œ]
YJ_BˆÛ”ÝX›Z]^ÊJHOˆÂˆKœ™]™[Y˜][

NÂˆÛÛœÝˆH˜[Y]T›Ú™XÝ[\Ü
˜Y
NÂˆYˆ
]‹˜[Y
HÂˆÙ]\œ›ÜŠ‹™\œ›ÜœËš›Ú[ŠˆŠJNÂˆ™]\›ŽÂˆBˆÚ[™ÙJ

HOˆÂˆ›˜[YHH˜Y›˜[YNÂˆ˜ÛÛ^H˜Y˜ÛÛ^Âˆ˜Ý\œ™[˜ÞHH˜Y˜Ý\œ™[˜ÞNÂˆ[Y^›Û™HH˜Y[Y^›Û™NÂˆš\š\ÙXÝ[ÛˆH˜Yš\š\ÙXÝ[ÛŽÂˆœÝ\HH˜YœÝ\NÂˆ˜ÛÚ[˜ÚY[˜ÙHH˜Y˜ÛÚ[˜ÚY[˜ÙNÂˆ™Ü›ÝÝ\˜Ù[H˜Y™Ü›ÝÝ\˜Ù[Âˆ››Ý\ÈH˜Y››Ý\ÎÂˆJNÂˆÙ]\œ›ÜŠˆŠNÂˆÙ][œØ]™Y[œ]
˜[ÙJNÂˆ_Bˆ‚ˆÏžÝ
”›Ú™XÝÙ][™ÜÈŠ_OÚÏ‚ˆ]ˆÛ\ÜÓ˜[YOH™›Ü›KYÜšY™YH‚ˆšY[X™[^Ý
”›Ú™XÝ˜[YHŠ_O‚ˆ[œ]ˆ™\]Z\™Yˆ˜[YO^Ù˜Y›˜[Y_BˆÛÚ[™ÙO^ÊJHOˆÙ]˜Y
È‹‹™˜Y˜[YNˆK\™Ù]˜[YHJ_BˆÏ‚ˆÑšY[‚ˆšY[X™[^Ý
ÛÛ^Š_O‚ˆÙ[XÝˆ˜[YO^Ù˜Y˜ÛÛ^BˆÛÚ[™ÙO^ÊJHOˆÙ]˜Y
È‹‹™˜YÛÛ^ˆK\™Ù]˜[YHJ_Bˆ‚ˆÖÂˆ”™\ÚY[X[‹ˆÛÛ[Y\˜ÚX[‹ˆ•ÛÜšÜÚÜ‹ˆ’[™\ÝšX[‹ˆYÜšXÝ[\˜[‹ˆÛÛ[][š]H‹ˆK›X\

ÊHOˆ
ˆÜ[ÛˆÙ^O^ØßOžØßOÛÜ[Û‚ˆ
J_BˆÜÙ[XÝ‚ˆÑšY[‚ˆšY[X™[^Ý
Ý\œ™[˜ÞHŠ_O‚ˆÙ[XÝˆ˜[YO^Ù˜Y˜Ý\œ™[˜Þ_BˆÛÚ[™ÙO^ÊJHOˆÙ]˜Y
È‹‹™˜YÝ\œ™[˜ÞNˆK\™Ù]˜[YHJ_Bˆ‚ˆÖÈ‘UTˆ‹“‘Óˆ‹•TÑ‹‘Ð”‹’”H‹’ÕÑ—K›X\

ÊHOˆ
ˆÜ[ÛˆÙ^O^ØßOžØßOÛÜ[Û‚ˆ
J_BˆÜÙ[XÝ‚ˆÑšY[‚ˆšY[X™[^Ý
•[Y^›Û™HŠ_O‚ˆ[œ]ˆ™\]Z\™Yˆ˜[YO^Ù˜Y[Y^›Û™_BˆÛÚ[™ÙO^ÊJHOˆÙ]˜Y
È‹‹™˜Y[Y^›Û™NˆK\™Ù]˜[YHJ_BˆÏ‚ˆÑšY[‚ˆšY[X™[^Ý
’\š\ÙXÝ[ÛˆŠ_O‚ˆ[œ]ˆ˜[YO^Ù˜Yš\š\ÙXÝ[ÛŸBˆÛÚ[™ÙO^ÊJHO‚ˆÙ]˜Y
È‹‹™˜Y\š\ÙXÝ[ÛŽˆK\™Ù]˜[YHJBˆBˆÏ‚ˆÑšY[‚ˆÖÂˆÈ›ÛYÙSˆ‹“8 $Óˆ›ÛYÙH‹•ˆ—KˆÈ›ÛYÙS‹“8 $Ó›ÛYÙH‹•ˆ—KˆÈ™œ™\]Y[˜ÞH‹‘œ™\]Y[˜ÞH‹’ˆ—KˆÈ›[Z]H‹”Ý\H[Z]‹H—KˆK›X\

ÚÙ^KX™[[š]JHOˆ
ˆšY[Ù^O^ÚÙ^_HX™[^Ý
X™[
_H[š]^Ý[š]O‚ˆØØ[S[X™\’[œ]ˆ™\]Z\™YˆZ[^ÌŒ_Bˆ˜[YO^Ù˜YœÝ\VÚÙ^H\ÈÙ^[Ùˆ\[Ùˆ˜YœÝ\W_BˆÛ•˜[YPÚ[™ÙO^Ê˜[YJHO‚ˆÙ]˜Y
Âˆ‹‹™˜YˆÝ\NˆÈ‹‹™˜YœÝ\KÚÙ^WNˆ˜[YHKˆJBˆBˆÏ‚ˆÑšY[‚ˆ
J_BˆšY[X™[^Ý
ÛÚ[˜ÚY[˜ÙH˜XÝÜˆŠ_H[š]HŒ8 $ÌH‚ˆØØ[S[X™\’[œ]ˆ™\]Z\™YˆZ[^ÌBˆX^^Ì_Bˆ˜[YO^Ù˜Y˜ÛÚ[˜ÚY[˜Ù_BˆÛ•˜[YPÚ[™ÙO^Ê˜[YJHO‚ˆÙ]˜Y
È‹‹™˜YÛÚ[˜ÚY[˜ÙNˆ˜[YHJBˆBˆÏ‚ˆÑšY[‚ˆšY[X™[^Ý
‘Ü›ÝÝ[ÝØ[˜ÙHŠ_H[š]H‰H‚ˆØØ[S[X™\’[œ]ˆ™\]Z\™YˆZ[^ÌBˆ˜[YO^Ù˜Y™Ü›ÝÝ\˜Ù[BˆÛ•˜[YPÚ[™ÙO^Ê˜[YJHO‚ˆÙ]˜Y
È‹‹™˜YÜ›ÝÝ\˜Ù[ˆ˜[YHJBˆBˆÏ‚ˆÑšY[‚ˆÙ]‚ˆšY[X™[^Ý
“›Ý\ÈŠ_O‚ˆ^\™XBˆ›ÝÜÏ^ÌßBˆ˜[YO^Ù˜Y››Ý\ßBˆÛÚ[™ÙO^ÊJHOˆÙ]˜Y
È‹‹™˜Y›Ý\ÎˆK\™Ù]˜[YHJ_BˆÏ‚ˆÑšY[‚ˆÙ\œ›Üˆ	‰ˆ
ˆ›ÛOH˜[\ˆÛ\ÜÓ˜[YOH™\œ›Ü‹]^‚ˆÙ\œ›ÜŸBˆÜ‚ˆ
_Bˆ]ÛˆÛ\ÜÓ˜[YOH˜]Ûˆš[X\žH‚ˆØ]™HÚ^™O^ÌMŸHÏ‚ˆÝ
”Ø]™HŠ_BˆØ]Û‚ˆÙ›Ü›O‚ˆ
NÂŸBš[\ÜÈ\ÙPÛÛ^Hœ›ÛHœ™XXÝŽÂ™[˜Ý[Ûˆ\ÙPÛÛ^ØØ[J
HÂˆ™]\›ˆ\ÙPÛÛ^
[™ÝXYÙPÛÛ^
NÂŸB