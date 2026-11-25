import { translate } from "../i18n";
import type { Locale } from "../i18n";
import { tools } from "../tools";

export interface HelpTopic {
  id: string;
  kind: "workflow" | "tool";
  title: string;
  summary: string;
  steps: readonly string[];
  example?: string;
  route?: string;
  toolId?: string;
  category: string;
  keywords: readonly string[];
}

const workflows: Omit<HelpTopic, "kind" | "category">[] = [
  {
    id: "getting-started",
    title: "Start a project and find your way",
    summary:
      "Create your own installation, then use Overview to see what your entered equipment needs.",
    steps: [
      "Open Project in the toolbar. New starts a named project; Open returns to saved projects. Rename and Duplicate help organize separate studies.",
      "Open Settings and enter the supply, voltage, timezone and currency. Choose Add load to enter equipment from its nameplate or measurement.",
      "Use the left navigation to change workspaces. Collapse groups or open the navigation button on a small screen. Select a load to inspect it; Calculation trace explains its result.",
    ],
    example:
      "For a small workshop, enter the lights and heater first. Check installed power, design demand and daily energy in Overview before adding more equipment.",
    route: "overview",
    keywords: [
      "navigation",
      "menu",
      "header",
      "dashboard",
      "new",
      "open",
      "rename",
      "duplicate",
      "inspector",
      "trace",
    ],
  },
  {
    id: "project-menu",
    title: "Use the Project menu",
    summary:
      "Create, reopen, copy, import and organize projects from the toolbar.",
    steps: [
      "Open Project in the header. New project creates a named blank workspace; Open project lists saved workspaces. Choose one to continue that saved project.",
      "Rename project changes the active name. Duplicate project opens an independent copy so you can keep a separate study. Close project saves the active workspace and opens a blank one.",
      "Save stores the current engineering project in this browser. Export project downloads its engineering JSON. Import project first previews and validates a file, then lets you create a new project, merge into the current project or replace its contents. Read the preview and warnings before applying it.",
      "Revision history opens History & Issues. Move to trash removes the active project after confirmation; use Open project then Restore from trash to recover it. Save a workspace backup in Settings before moving work to another browser or device.",
    ],
    route: "overview",
    keywords: [
      "project menu",
      "toolbar",
      "new project",
      "open project",
      "rename project",
      "duplicate project",
      "close project",
      "save",
      "export",
      "import",
      "merge",
      "replace",
      "revision history",
      "trash",
      "restore from trash",
      "workspace backup",
    ],
  },
  {
    id: "save-and-recover",
    title: "Save, reopen and recover work",
    summary:
      "Saved projects belong to this browser. Download a backup to keep a portable copy.",
    steps: [
      "Engineering changes autosave. Use Project → Save or Ctrl/Cmd+S and wait for Saved locally before refreshing or closing this tab. If changes are still unsaved, the browser asks whether to stay or leave; leaving discards only edits not yet saved. The next load opens the last saved project. Open project resumes a saved project. Close saves it and opens a blank workspace; a failed save keeps the current work so you can export a backup or save a copy.",
      "Export project saves engineering JSON; Export loads saves CSV. Import previews and validates a file before New project, Merge or Replace. A failed validation leaves the current project intact.",
      "Settings → Workspace backup includes saved projects, revisions, bills, measurements and library records. Save each draft first. Validate the archive and review its restore mode before restoring.",
      "Use History & Issues to compare or restore revisions, and Undo/Redo for project edits. Move to trash and Restore are in the project switcher. A downloaded backup is needed on another device.",
    ],
    example:
      "Before clearing browser data or changing device, export a Workspace backup and keep the downloaded file. Local history cannot recover storage that the browser has removed.",
    route: "history",
    keywords: [
      "Save",
      "Saved locally",
      "Unsaved changes",
      "resume",
      "recovery",
      "backup",
      "restore",
      "trash",
      "import",
      "export",
      "history",
      "undo",
      "redo",
      "close",
      "JSON",
      "CSV",
    ],
  },
  {
    id: "load-schedule",
    title: "Load Schedule",
    summary:
      "A load is an appliance or piece of equipment that uses electricity.",
    steps: [
      "Choose Add load. Enter a name, quantity, rating, connection, voltage basis and power factor. Use shaft output only for a motor's mechanical rating, with its efficiency.",
      "Enter operating hours, start time, utilization and energy duty. Record the source of each rating, then save. Duty changes average energy; it does not reduce on-state current.",
      "Select rows to review Bulk operations. Filter by category, phase, board, source or issue. Right-click a load, or press Shift+F10 on its name, for Inspect, Edit, Duplicate or Delete.",
    ],
    example:
      "For a heater marked 2 kW electrical input, use electrical kW and its actual schedule. Do not enter the same rating as motor shaft output.",
    route: "loads",
    keywords: [
      "appliance",
      "equipment",
      "add",
      "edit",
      "duplicate",
      "delete",
      "bulk",
      "clipboard",
      "nameplate",
      "power factor",
    ],
  },
  {
    id: "boards-and-circuits",
    title: "Boards & Circuits",
    summary: "Group loads into their actual distribution boards and circuits.",
    steps: [
      "Create a board, add its circuits and assign the appropriate loads. Use site, building and zone groups to organize the project without inventing electrical connections.",
      "Review phase loading and phase-balancing proposals before applying them. A circuit phase change moves its associated single-phase loads; locked loads stay protected.",
      "Check issues after editing assignments. Supply topology, load connections and dependent objects must remain compatible.",
    ],
    example:
      "Put workshop lighting on its actual lighting circuit and assign that circuit to the workshop board. A zone name alone does not connect the circuit.",
    route: "boards",
    keywords: [
      "distribution",
      "phase",
      "balance",
      "lock",
      "site",
      "building",
      "zone",
      "group",
      "assignment",
    ],
  },
  {
    id: "single-line-studio",
    title: "Single-Line Studio",
    summary: "Inspect the diagram made from your actual project connections.",
    steps: [
      "Select an object to inspect it. Use Connect/Disconnect and the topology controls to change supported connections; check issues after every change.",
      "Select catalogue equipment to see its datasheet and terminal groups. Choose the unit numbers and terminals to connect or disconnect a PV wire in the diagram. These wires do not contribute to power flow calculations.",
      "For an AC line link, choose L1, L2 or L3. Both terminals of a breaker pole must use the same phase.",
      "For an iID neutral link, select N and choose a neutral terminal at both ends.",
      "Choose protective bonding terminals at both ends to link a catalogue earth bar to a PV frame.",
      "Battery links use the catalogue battery terminals. The editor rejects a wire that would put both terminals of one battery on the same conductor node.",
      "An isolated series chain of identical batteries shows nominal voltage, C20 capacity and nominal energy in the inspector.",
      "The editor rejects a PV wire when it would join one module’s positive and negative terminals through the saved wires.",
      "Dashed wires show saved catalogue terminal links in the diagram and its exports.",
      "An isolated chain of identical PV modules shows its string voltage and current at standard test conditions in the inspector.",
      "String nameplate power is the number of wired modules times the published power per module.",
      "Use zoom, fit, labels, notes, manual positions or auto-layout to make the diagram readable. Export SVG or PDF for a copy of the displayed diagram.",
      "Open Analytical spatial view for orbit, elevation, zoom, board isolation and the hourly cursor. Selecting an object there highlights the same object in the single-line diagram and inspector. Pause flow animation when needed. Chart tables provide the underlying values.",
    ],
    example:
      "Use Fit after adding a board, then export the diagram. Its line lengths and spatial coordinates do not measure installed cable lengths.",
    route: "diagram",
    keywords: [
      "diagram",
      "connect",
      "disconnect",
      "zoom",
      "fit",
      "SVG",
      "PDF",
      "spatial",
      "3D",
      "orbit",
      "animation",
    ],
  },
  {
    id: "simulation-and-measurements",
    title: "Schedules & Simulation",
    summary:
      "Calculate an actual date range or import measured power intervals.",
    steps: [
      "Choose the date range and check the project timezone before running. Cancel stops a new run; a previous completed run retains its own dates. Use Play/Pause, step and speed controls to inspect it.",
      "Advanced planning supports operating windows, weekdays, seasons, holidays, timed cycles and start events. Review a proposed flexible schedule before applying it.",
      "Measured intervals imports CSV: map timestamp and power columns, choose W or kW and enter interval minutes. Timestamps need Z or a UTC offset. Preview, then Save measured data; Reopen saved measurements restores it.",
    ],
    example:
      "For readings every 15 minutes, enter 15 as the interval. Missing rows remain gaps; the app does not invent measurements. Export the cleaned CSV or completed simulation series.",
    route: "simulation",
    keywords: [
      "calendar",
      "date",
      "timezone",
      "DST",
      "schedule",
      "worker",
      "cancel",
      "measurement",
      "measured",
      "CSV",
      "profile",
      "timeline",
    ],
  },
  {
    id: "cables-and-protection",
    title: "Cables & Protection",
    summary:
      "Assess a feeder or use a cable/protection worksheet with your actual evidence.",
    steps: [
      "Open Feeder assessment and select the actual source-to-load route. Enter conductor impedance, ampacity and the conditions supporting those values.",
      "Review voltage drop, losses and capacity separately, including running and starting assumptions. Missing evidence produces an incomplete check.",
      "Use the cable and protection worksheets for a specific calculation. Read the method and source conditions; a computed value is not installation certification.",
    ],
    example:
      "If you have no verified ampacity for a cable's installation method, obtain that evidence before accepting a capacity check.",
    route: "cables",
    keywords: [
      "feeder",
      "cable",
      "voltage drop",
      "ampacity",
      "fault",
      "protection",
      "earthing",
      "breaker",
      "loss",
    ],
  },
  {
    id: "motors-and-supply",
    title: "Motors & Supply",
    summary:
      "Keep motor input, starting demand and supply capability separate.",
    steps: [
      "Choose the motor, transformer, generator, inverter or UPS worksheet that matches your question. Enter the stated units and the rating basis.",
      "Use Source register to record actual source ratings, derating, evidence, served boundary and any verified overload envelope.",
      "Review continuous kW, kVA, phase current and starting capacity independently. Island, transfer and black-start entries describe evidence; they do not switch equipment.",
    ],
    example:
      "A generator that meets running kW may still lack starting kVA. Check both with the actual motor and generator data.",
    route: "motors",
    keywords: [
      "motor",
      "transformer",
      "generator",
      "inverter",
      "UPS",
      "source",
      "starting",
      "derating",
      "black start",
    ],
  },
  {
    id: "power-quality",
    title: "Power Quality",
    summary:
      "Study power factor, capacitor sizing and supplied harmonic data within each stated model.",
    steps: [
      "Select a worksheet and read its description. Enter the actual P, Q, power-factor or harmonic values it requires, including leading/lagging direction where requested.",
      "Calculate, then review assumptions and warnings. Do not infer a harmonic spectrum from one power-factor value or assume a simple sinusoidal model fits distorted waveforms.",
    ],
    example:
      "Use measured harmonic components when assessing harmonics. A capacitor-sizing result alone does not establish suitable switching or resonance protection.",
    route: "quality",
    keywords: [
      "power factor",
      "capacitor",
      "harmonic",
      "THD",
      "reactive",
      "leading",
      "lagging",
    ],
  },
  {
    id: "using-the-toolbox",
    title: "Engineering Toolbox",
    summary:
      "Find a worksheet by name, category or tool ID. Every tool guide below uses the live catalogue.",
    steps: [
      "Open a tool, read its description and enter your values in the displayed units. Load worked example fills labelled training values; it does not describe your installation.",
      "Choose Calculate, then inspect the result, formula, assumptions, sources and warnings. Reset clears that worksheet's inputs and result.",
      "Copy or export the calculated result when available. A supported Apply action previews project changes for review; a calculation alone does not change your project.",
    ],
    example:
      "Open T01, load its worked example of 230 V and 23 Ω, then Calculate. Replace the example with your actual resistor data before using it for your own study.",
    route: "tools",
    keywords: [
      "calculator",
      "worksheet",
      "example",
      "copy",
      "reset",
      "apply",
      "tool",
      "formula",
    ],
  },
  {
    id: "renewables-and-storage",
    title: "Renewables & Storage",
    summary:
      "Model generation and battery dispatch using a real chronological profile and explicit limits.",
    steps: [
      "Enter PV or wind generation profiles, grid/inverter limits, battery capacity, reserve and the chosen dispatch strategy.",
      "Run the study and inspect import, export, curtailment, losses and unmet demand. For an outage, enter its actual time range and check source, transfer and islanding evidence.",
    ],
    example:
      "Peak-sun-hours can support a daily estimate but cannot replace an hourly PV profile for battery dispatch. Grid-tied-only PV does not automatically supply an islanded load.",
    route: "renewables",
    keywords: [
      "PV",
      "solar",
      "wind",
      "battery",
      "storage",
      "dispatch",
      "outage",
      "import",
      "export",
      "curtailment",
    ],
  },
  {
    id: "ev-and-flexible-loads",
    title: "EV & Flexible Loads",
    summary:
      "Check whether charging or flexible work can finish within its allowed window.",
    steps: [
      "Enter charging arrival and departure, required energy or SOC, charger/vehicle limits and one/three-phase constraints.",
      "Run the planner and inspect delivered energy, unmet energy and deadline feasibility. Review any generation-following or price priority, then preview before applying dated load schedules.",
    ],
    example:
      "A short charging window can remain infeasible even when the charger rating is high. Check the vehicle limit and actual energy delivered before changing the plan.",
    route: "ev",
    keywords: [
      "EV",
      "vehicle",
      "charger",
      "charging",
      "SOC",
      "deadline",
      "flexible",
      "session",
      "unmet",
    ],
  },
  {
    id: "scenarios-and-optimization",
    title: "Scenarios & Optimization",
    summary: "Compare changes against a frozen baseline before applying them.",
    steps: [
      "Create a scenario from the project. Change its inputs, then compare field-level differences and metrics with its saved baseline.",
      "For a dated engineering comparison, run both input sets over the same explicit period, up to 31 elapsed days. You can add a common outage and export CSV or JSON.",
      "Review selected differences before applying them. Undo restores the prior project. Missing evidence remains unavailable, and different currencies are not subtracted.",
    ],
    example:
      "Compare existing lighting with a proposed lower-power design while keeping the operating period the same. Explain any changed hours or tariffs in the assumptions.",
    route: "scenarios",
    keywords: [
      "scenario",
      "baseline",
      "compare",
      "optimization",
      "sensitivity",
      "difference",
      "dated",
    ],
  },
  {
    id: "costs-and-carbon",
    title: "Costs & Carbon",
    summary:
      "Estimate energy cost and emissions using the prices and factors you enter.",
    steps: [
      "Enter currency, import/export prices, tariff bands, charges, taxes and emissions factors with their source and conditions.",
      "Inspect the cost breakdown and the period being calculated. Daily and 30-day estimates differ from a simulation of actual calendar dates.",
    ],
    example:
      "Use your actual tariff's day and night bands instead of one flat rate when the price changes with time. An estimate is not a supplier invoice.",
    route: "costs",
    keywords: [
      "cost",
      "tariff",
      "price",
      "tax",
      "carbon",
      "CO2",
      "emissions",
      "currency",
      "energy bill",
    ],
  },
  {
    id: "equipment-library",
    title: "Equipment Library",
    summary:
      "Reuse sourced equipment records while keeping project copies independent.",
    steps: [
      "Search or filter the library, mark favorites, create a sourced record or save an existing load as a template. Check generic starting assumptions before use.",
      "In Manufacturer equipment, search by maker or model and review or export the sourced record. PV modules can be applied in the PV worksheet.",
      "Open Source, terminals and model readiness to review source revision, documented terminal groups, calculation inputs and missing fields.",
      "For shielded cables, inspect the braid ends and any separate PE core in the terminal list.",
      "Compare the voltage, cross-section and protective-earth core of exact LAPP cable articles before adding them to a diagram.",
      "In the LAPP CLASSIC 110 BLACK range, compare the numbered core ends and any PE pair before placing the cable in a diagram.",
      "For LAPP CLASSIC 110 H cables, open the article page for dimensions and the technical pages for rated and test voltages.",
      "Select LAPP CLASSIC 110 CH article 10035069 to inspect both shield ends and the three numbered cores.",
      "Compare the nine winding leads of WEG 11416668 with the twelve leads of WEG 11166654 in the terminal list.",
      "For Phoenix Contact PT-PE blocks, the terminal list shows the wire clamps and the DIN-rail foot in one protective-earth group.",
      "Filter manufacturer equipment by category and use Previous records or Next records to browse large result sets.",
      "Search for an iC60N order code to inspect the breaker ratings and terminal groups. Breaker records are available for inventories and diagrams.",
      "Use Add to project equipment to save a model in the project. Edit its name or quantity to update the bill of materials.",
      "Adding a template creates an independent load. When updating a template, review which linked loads receive new nameplate fields and evidence; schedules, names and assignments remain as entered.",
      "Worked reference projects are labelled learning examples. Equipment JSON and Workspace backup preserve saved version history.",
    ],
    example:
      "Keep the manufacturer's datasheet reference with a motor template. An attractive library card does not make an assumed rating a verified manufacturer specification.",
    route: "library",
    keywords: [
      "equipment",
      "template",
      "favorite",
      "source",
      "library",
      "reference project",
      "version",
      "datasheet",
    ],
  },
  {
    id: "engineering-reports",
    title: "Reports & Estimates",
    summary:
      "Review an immutable report preview before sharing engineering results.",
    steps: [
      "Enter report metadata, save it and choose the report sections. Complete any calendar, renewable or EV analyses needed for those sections.",
      "Choose Freeze report preview. Review the project revision, input evidence, assumptions and unresolved issues, then export PDF, print, snapshot JSON or report CSV.",
      "The model-derived BOM leaves unknown prices blank. Enter prices, labour, waste and contingency, review proposed bill changes and apply them explicitly; manual bill lines are preserved.",
      "Include the model-derived bill of materials to report the saved catalogue equipment and its terminal links.",
      "For supported PV series strings, the frozen bill-of-materials report also lists the module order and standard-test-condition values.",
      "Supported battery series chains appear with their nominal voltage, C20 capacity and nameplate energy in the frozen bill-of-materials report.",
    ],
    example:
      "If you edit a load after a simulation, rerun that analysis before including it in a new report. An older run is not evidence for changed inputs.",
    route: "reports",
    keywords: [
      "report",
      "PDF",
      "print",
      "snapshot",
      "freeze",
      "metadata",
      "BOM",
      "materials",
      "estimate",
    ],
  },
  {
    id: "customer-bills",
    title: "Print a customer estimate or invoice",
    summary:
      "Prepare a separate priced customer document with your actual business and customer details.",
    steps: [
      "Open Reports & Estimates → Customer bill. Choose Customer estimate or Invoice and enter the document number, dates, supplier, customer and payment details.",
      "Add material, labour or other lines with description, quantity and unit price. Enter discount and tax, then check subtotal, net, tax and total in the preview.",
      "Choose Save draft locally. Download PDF exports the document; Print / Save PDF opens the browser print dialog; Export CSV saves the priced schedule. Invalid fields keep exports disabled with an explanation.",
      "Export draft JSON and Import draft JSON move a bill independently. Save billing drafts before a Workspace backup; engineering JSON alone is not a billing backup.",
    ],
    example:
      "Enter three hours of labour as quantity 3 with your actual hourly price. Check the tax treatment and customer details before printing; the app supplies no invented business identity.",
    route: "reports",
    keywords: [
      "bill",
      "invoice",
      "customer",
      "estimate",
      "print",
      "PDF",
      "billing",
      "tax",
      "discount",
      "labour",
    ],
  },
  {
    id: "settings-and-shortcuts",
    title: "Settings, display and keyboard shortcuts",
    summary:
      "Choose a comfortable view without changing the meaning of your engineering inputs.",
    steps: [
      "Choose English, Deutsch, Yorùbá or Nigerian Pidgin in the header. Settings controls supply defaults, theme, detail mode, motion, layout widths and recovery. Language does not change currency or engineering criteria.",
      "Simple mode explains core quantities; Engineering mode exposes more detail. Failed or incomplete checks remain visible. Paused motion stops decorative effects and playback. Reset layout restores the default widths.",
      "Ctrl/Cmd+K opens search, Ctrl/Cmd+S saves, Ctrl/Cmd+Z undoes and Ctrl/Cmd+Shift+Z redoes outside text fields. Escape closes a dialog. Tab moves between controls; the split handles support arrows, Home and End.",
    ],
    example:
      "For German entry, use decimal commas in numeric fields. Use semicolons between list values; imported canonical CSV numbers use decimal points.",
    route: "settings",
    keywords: [
      "settings",
      "keyboard",
      "shortcut",
      "language",
      "Deutsch",
      "Yoruba",
      "Pidgin",
      "simple",
      "engineering",
      "theme",
      "motion",
      "layout",
      "decimal",
    ],
  },
  {
    id: "local-bot",
    title: "Use Adigun BOT",
    summary:
      "The local assistant explains actual project results and prepares proposals for your review.",
    steps: [
      "Open the Adigun BOT launcher. Ask about project results or missing inputs. Type balance to preview phase balancing, or ask for a report to open the actual report exporter. These questions do not change equipment. Local mode works without an online model provider.",
      "From Help and Guide, choose Start guided tour. Adigun BOT walks through the guide topics and can open the related section; use Next or Previous to move between steps.",
      "Add a load with this command form: load: Heater; 2.3 kW; 230 V; PF 1; 8 h. Use a unique name. Review the proposed values and demand impact, then explicitly choose Apply. A name that duplicates an existing load is rejected.",
      "For an existing load, supported commands are edit load: Heater; rating_kw; 3.1, phase load: Heater; L2, assign load: Heater; board: Main board, and assign load: Heater; circuit: Lighting circuit. Use the exact current load name. Supported edit fields are name, rating_kw, voltage_v, power_factor, hours_per_day and quantity; rating_kw requires kW entry mode.",
      "Remove one load with delete load: Heater. The exact name must match one current load. Review the removal and dependent start-event/flexible-load cleanup before explicitly choosing Apply; Undo restores the complete change. Missing or ambiguous names are rejected.",
      "Remove a circuit with remove circuit: Lighting circuit. The exact name must match one current circuit. Preview the circuit and every connected load; Apply removes the circuit and leaves those loads in the project unassigned. Undo restores the complete previous project. Missing or ambiguous names are rejected.",
      "Review every proposal before choosing Apply. Board-only assignment clears the current circuit; circuit assignment updates the served board and may align an unlocked single-phase load. Phase changes may move other unlocked single-phase loads on that circuit. Invalid, incompatible or stale proposals do not change the project.",
      "Close, minimize, maximize and restore control the assistant window. Chat context stays with each project during the session; it is not part of the engineering backup.",
    ],
    example:
      "Try this supported command: load: Workshop heater; 2.3 kW; 230 V; PF 1; 8 h",
    keywords: [
      "Adigun BOT",
      "assistant",
      "chat",
      "AI",
      "proposal",
      "apply",
      "load",
      "edit load",
      "phase load",
      "assign load",
      "delete load",
      "remove load",
      "remove circuit",
      "rating_kw",
      "board",
      "circuit",
      "maximize",
      "minimize",
      "local",
    ],
  },
  {
    id: "results-and-troubleshooting",
    title: "Understand results and solve problems",
    summary:
      "A result is useful only when its inputs, method and limits match your installation.",
    steps: [
      "Calculated means the supported arithmetic ran. Incomplete means inputs or evidence are missing; Unsupported means the selected condition is outside the model. Read the issue and Calculation trace before using the result.",
      "If saving fails, keep the tab open and use Export project to preserve the current engineering work before reloading. If another tab saved a newer revision, preserve your work as an export or copy, then reopen the saved project.",
      "If an import fails, fix the fields listed in its preview. If a calculation fails, check units, required values and model assumptions. Engineering Reference links the supported formulas and sources.",
      "App updates wait while edits or calculations are active. Finish or cancel them before reloading. Help works offline after the app has been cached; external source and GitHub links need an internet connection.",
    ],
    example:
      "For a reproducible problem, note the workspace, tool ID, steps and exact message. Share a minimal example only after removing customer details and other private data.",
    route: "reference",
    keywords: [
      "error",
      "issue",
      "troubleshooting",
      "Save failed",
      "storage",
      "quota",
      "conflict",
      "unsupported",
      "incomplete",
      "support",
      "offline",
      "update",
      "reference",
    ],
  },
  {
    id: "powergrid-lab",
    title: "POWERGRID LAB: compare transmission voltage",
    summary:
      "Open the isolated PowerGrid lab, inspect selectable generation and distribution equipment, compare transmission losses, solve a radial feeder, calculate PV and NREL reference-wind performance, dispatch entered PV/wind profiles with storage and critical demand, save scenarios or export actual results.",
    steps: [
      "Select POWERGRID LAB at the right edge of the top bar or enter #POWERGRID in the address bar. The exact hash opens the lab directly; refresh keeps it open and browser Back/Forward follows route changes.",
      "On Overview, scroll to PowerGrid learning for credited photos of a generator, substation and distribution transformer. Choose Play documentary video to start the cited facility footage; it is visual context, not live telemetry or a measurement. Use the links there to open the transmission-loss lab or feeder calculation.",
      "On Overview, choose a group in Explore the workspace. Open an illustrated destination to find a field video and exercise, or an application recording for reports, backups, history and Help.",
      "In POWERGRID LAB, use the controls beside the equipment images to change voltage, distance, power factor and transformer loading. In the dispatch lessons choose an interval, and in Feeder trip use the map to see which load groups disconnect.",
      "Choose United States-inspired in Engineering region to apply Pacific Northwest transmission stages. The residential 120/240 V example is separate from the balanced three-phase worksheet.",
      "In the split-phase experiment, balance the two 120 V loads and then add 240 V load. Compare the line and neutral currents.",
      "Select the South African teaching preset to compare 275 and 400 kV and view dated coal and renewable generation totals.",
      "Use Custom system to save an entered frequency, currency and time zone with the transmission experiment.",
      "In Hydropower head and flow, edit net head, turbine flow, combined efficiency and installed rating. Compare hydraulic power with available generator power, then save locally or export JSON.",
      "In Microgrid dispatch, enter one optional hydro flow per demand interval, plus fixed net head, efficiency and rating. The available hydro output contributes to the shared power balance.",
      "To model reservoir hydro, enter an inflow and requested turbine flow for each interval. Set storage capacity, starting volume and bypass flow, then inspect storage, spill and bypass shortfall.",
      "Enter a head rise at full reservoir to model changing head. Each interval uses its starting fill fraction. Enter zero for fixed head.",
      "In Microgrid dispatch, enter a positive pumped storage capacity to use remaining renewable surplus for pumping and recover power before backup. Inspect pump input, generated power, stored hydraulic energy and losses.",
      "Set grid import and export limits and optionally enter outage interval numbers. During an outage the microgrid relies on local resources. The interval table shows islanding, reconnection and grid exchange.",
      "Enter backup outage intervals to make the backup generator unavailable. When it returns, it ramps from zero. Backup headroom is unused capacity within the interval ramp limit.",
      "Enable thermal backup fuel use and enter the generator’s net heat rate. Enter a direct CO₂ factor on the same fuel heating-value basis to include direct combustion CO₂ in the results.",
      "Enter startup fuel per start and an optional initial fuel inventory. With a finite inventory, the generator needs enough fuel to start and can only deliver as much power as the remaining fuel allows.",
      "Set minimum stable backup output to keep the generator off when remaining demand, ramping or available fuel cannot support that output.",
      "To use a linear fuel curve, enter the fixed running fuel intercept in MJ/h and the incremental rate in MJ/kWh.",
      "Load the rural microgrid teaching scenario to replace the current dispatch inputs with an editable 24-hour clinic and community example.",
      "Open Germany: historical load and generation to compare one day of national grid load, solar and wind from SMARD. Export JSON to retain timestamps, source links and license.",
      "Load the scaled German historical day in Microgrid dispatch to use SMARD solar and wind observations as fixed hourly output. Demand and critical load remain editable, and JSON retains the original observations and scaling.",
      "Switch between the January and June SMARD days to compare seasonal examples. Both dispatch presets use the same scale and one-hour intervals.",
      "Scroll to the hydro station cutaway. Select Reservoir, trash rack, intake gate, penstock, draft tube, turbine, generator, transformer, control house/SCADA, breaker, disconnector, CT/VT, surge arrester, busbar, tower, conductors or earth grid. The inspection card names the equipment, explains its job and identifies its shown terminals. Keyboard users can Tab to a device and press Enter or Space.",
      "The custom hydro overview depicts the dam water path, turbine-generator, transformer, switchyard, transmission and consumer destinations. It is a teaching illustration; use the interactive schematic below it for labeled connections and terminals.",
      "Below the electrical drawings, use the navigable power station and grid model. Adjust Azimuth, Elevation and Zoom, then choose an equipment name to inspect its function and represented connections. The 3D view is simplified teaching geometry, not a surveyed site or installation design. If WebGL is unavailable, the labeled station schematic remains available.",
      "The 3D model shares selection with the hydro cutaway and single-line for the reservoir, turbine, generator, step-up transformer and tower. The receiving transformer also shares selection with the distribution diagram.",
      "Scroll to the 3D station model to start its renderer. Use the keyboard to adjust the camera or inspect equipment.",
      "On narrow screens, camera controls and the equipment inspector are stacked so both can be used without horizontal scrolling.",
      "In Meshed AC power flow, edit the generator, load or A–B tap and open a branch to compare solved bus voltages and flows. The solver reports islands without a slack bus and shows when the generator reaches a reactive limit.",
      "Choose Compare single branch outages to open each active branch in turn. Compare the voltage band and apparent-power ratings, and inspect any islanded cases separately.",
      "In Primary frequency response, vary inertia, droop, reserve and the size of a sudden generation loss. Compare the initial rate of change and lowest modeled frequency, or export the modeled trace.",
      "Add optional student notes and export the transmission comparison as a lab report PDF. The report freezes the active inputs, calculated readings, formula and model assumptions.",
      "Choose Import scenario JSON to preview a transmission experiment. Apply imports the name, notes and inputs into the worksheet. Save separately to replace the stored browser copy.",
      "An all-project workspace backup includes saved transmission experiments. After restoring a backup, choose Show recovered experiments in PowerGrid Lab to preview and apply a recovered copy.",
      "Use Undo transmission edit and Redo transmission edit to step through changes in the open worksheet, including imports and presets. Save separately to update the stored browser copy.",
      "Open Saved transmission revisions to preview earlier explicit saves. Applying a revision updates the open worksheet. Save again to make that version the current browser copy.",
      "Set a comparison baseline before editing, or duplicate the transmission experiment to explore a named variation. The live comparison shows changes from the pinned baseline and is included in JSON export.",
      "In Radial feeder, review the active project’s calculated design demand and choose a downstream group. Applying the snapshot replaces only that group’s balanced load and includes the source project revision in the solved scenario JSON.",
      "In Microgrid dispatch, review the active project’s recurring demand day before applying its 24 hourly loads. The dispatch JSON carries the original hourly profile and source revision.",
      "After the workspace finishes caching its files, you can open PowerGrid Lab and export a transmission report offline, even if the lab was never opened online.",
      "In the poor power factor lesson, make a prediction, reveal the worked reference, and load the lesson inputs. Compare your readings after editing power factor, then record your interpretation in the transmission PDF.",
      "In the transmission distance lesson, compare 5 km and 25 km, vary the length to find the receiving-voltage threshold, and download the calculation report.",
      "In the feeder trip lesson, reset the radial training case, set a comparison reference, and restore the north loads in stages. Export the solved JSON to record the current case and reference.",
      "In the transformer loading lesson, change apparent load and power factor, compare losses and efficiency with the worked reference, and download the calculation report.",
      "Open the ideal transformer comparison to see how zero core and winding losses change efficiency at the same load. Both cases are included in the JSON report.",
      "Load the midday solar or evening peak lesson in microgrid dispatch. Change the export limit or battery settings, then compare the interval readings and export the results.",
      "Load the generator outage lesson in microgrid dispatch. Compare available backup and unmet loads during the trip, then clear the outage and export the comparison runs.",
      "In the regional comparison lesson, change the shared transmission power, power factor or resistance. Compare both sourced voltage cases and download the calculation report.",
      "For the community capstone, load and pin the rural case, test your design during a backup outage, and export dispatch JSON with your justification.",
      "In the microgrid operation lesson, load the rural reference and change the battery power limit. Export the edited run and the worked reference together.",
      "For Source to socket and Why step up voltage, compare the worked cases, edit the transmission worksheet, and record your explanation in the lab report PDF.",
      "In the lab Adigun BOT panel, preview a higher transmission voltage before confirming it. Any intervening worksheet edit invalidates the preview. Undo restores the preceding worksheet state.",
      "Use Explain selected station equipment in the lab BOT to read the function and interfaces of the active station component.",
      "In the dispatch BOT, choose an interval to compare battery discharge limits with the power supplied and the unmet critical and noncritical demand.",
      "In meshed AC power flow, outage comparison recalculates after an edit. Wait for the updated rows before exporting a comparison.",
      "Use Meshed demand profile to compare three independent AC solves at low, normal and peak demand. Check minimum voltage, losses and convergence, then export the three cases.",
      "Save case locally also remembers the low and peak demand slider values.",
      "Pin a transmission baseline before editing to include the named reference and signed changes in the lab report PDF.",
      "Valid transmission edits autosave as a separate draft. After reopening the lab, restore or discard that draft before autosave resumes. Use Save experiment locally to update the named saved experiment.",
      "In the solar thermal power tower, vary direct irradiance and compare collected heat with electrical output. Below the minimum stable load, available output is zero.",
      "In the tidal stream turbine, vary current speed and compare flow power, shaft potential and available electrical power. Use cut-in and cut-out to explore the operating range.",
      "In binary-cycle geothermal generation, vary brine flow or temperature drop. Compare recovered heat, gross output and net power after plant auxiliaries, then export the results.",
      "In deep-water wave energy, vary wave height or energy period. Compare power per metre with device output, then try the shutdown height and export the case.",
      "In the gas and steam combined cycle worksheet, compare gas turbine power with steam generation from recovered heat. Change the requested gross output to explore the minimum stable load.",
      "Choose Manufacturer PV module and review the datasheet before applying its DC rating and power temperature coefficient. The PV case export includes the applied equipment record.",
      "Use combined cycle in dispatch to copy the net output limit, minimum load and running fuel requirements into the chronological worksheet.",
      "Compare open-cycle and combined-cycle net output using equal fuel input and ratings. Use open cycle in dispatch to transfer the gas turbine case without steam recovery.",
      "In hydrogen fuel cell generation, vary starting inventory, interval duration or the AC rating. Compare gross and net AC output and check how much hydrogen remains.",
      "Use fuel cell in dispatch to copy the net AC power limit, running fuel use and starting hydrogen inventory. The dispatch timeline determines when the inventory runs out.",
      "In biogas engine and heat recovery, vary methane concentration and heat demand. Compare net electricity, recoverable heat and heat actually supplied.",
      "In solid biomass steam generation, vary wet-basis moisture and compare wet fuel heating value, heat to the steam cycle and net electrical output.",
      "In the diesel generator worksheet, change the electrical request or fuel inventory. Compare the fuel curve, available output and remaining diesel.",
      "Use diesel curve in dispatch transfers the rating, minimum load and fuel curve to the chronological worksheet.",
      "In the coal steam worksheet, change coal inventory or net heat rate and compare net generation and remaining coal.",
      "Use coal inventory in dispatch to carry plant capacity, net heat rate and fuel stock into the chronological worksheet.",
      "Use biomass in dispatch to transfer wet-feed-limited output and the fuel energy in the optional initial wet stock.",
      "Use biogas engine in dispatch to transfer the electrical limit and fuel requirements. Heat recovery remains in the biogas worksheet.",
      "In the nuclear steam worksheet, adjust the heat supplied to the steam cycle and compare gross generation with net power after plant electricity use.",
      "Below the hydro cutaway, select the combined-cycle gas, utility solar PV or wind study. Choose each equipment control to read its purpose and representative process or electrical interface. Terminal markings, ratings, protection and arrangement vary by manufacturer and site; confirm them from approved drawings. The custom plant images are teaching illustrations, not photographs of an identified operating facility.",
      "Below the interactive station drawing, the image checklist covers the generator and excitation plant, transformer and switchyard, transmission tower and line protection, distribution equipment and customer motors, plus electrical test instruments and safe-isolation equipment. Each picture is paired with a practical purpose. These custom illustrations are not photographs of a named site; never use them as permission to approach or test energized equipment.",
      "In the upper view, follow water from reservoir and trash rack through the intake gate and penstock to the Francis runner; follow the shaft to the generator. The separate lower one-line shows the electrical path through the generator, step-up transformer, three-pole breaker, CT, busbar and transmission conductors.",
      "Read the phase labels and colors as schematic conductor identifiers. At the source, the example brings out generator star point N and grounds it through an impedance; generator-frame PE is separately bonded to station earth. The overhead shield wire also has its own path to tower footing. The illustrated high-voltage line has three phases and no neutral conductor.",
      "The cutaway shows an illustrative generator wye and delta/grounded-star transformer arrangement, not an as-built station. Real terminal boards, transformer vector groups, neutral grounding, ratings and bay layouts vary; inspect the actual machine and project drawings before applying this example.",
      "Continue to Receiving substation → distribution → customers. Select the line bay, disconnectors, breaker, CT/VT, arrester, receiving transformer, MV feeder, recloser, local distribution transformer, feeder pillar, house meter/board, MCC, motor, neutral or PE. The inspection card describes purpose and terminals. The displayed voltage labels follow the editable raised, distribution and consumer voltage inputs above; this teaching diagram does not calculate protection, transformer losses or customer load flow.",
      "Edit transmitted real power, power factor, per-phase line resistance and the two transmission voltages. The generator, distribution and consumer voltages label the schematic scenario.",
      "Read the calculated three-phase line current and resistive loss at both transmission voltages. Save stores this lab experiment separately in this browser; JSON and CSV exports contain the displayed inputs and calculated readings.",
      "In Radial feeder, edit source line-to-line voltage and each consumer group's active/reactive load and minimum voltage. Read solved bus voltages, branch currents, sending/receiving P and Q, and voltage constraints.",
      "Edit branch resistance, reactance and thermal limit. Turn off In service to open a feeder; downstream consumer groups are reported as unserved. Set a comparison reference before editing to compare served voltage, real losses and unserved demand.",
      "Save the radial scenario locally or export its actual solved values as JSON or CSV. The saved radial scenario uses a separate browser key from the step-up experiment and the active customer project.",
      "The model assumes balanced three-phase operation, constant transmitted power and power factor, equal resistance per phase, and ideal transformer voltage changes. It does not solve distribution losses, receiving-end voltage, transformer efficiency or a network load flow.",
      "The radial model uses one fixed-voltage source, balanced constant-P/Q consumer loads and per-phase series impedance. It reports convergence and disconnected islands; shunt capacitance, transformer taps, generator limits, meshed flow, protection and dynamics are outside this model.",
      "In PV source performance, enter DC nameplate, plane-of-array irradiance, module temperature, cell temperature rise, power coefficient and inverter limits. Read the calculated DC/AC output, conversion loss and clipping, save a comparison reference, then export the case or readings.",
      "This is an instantaneous calculation from entered values; it does not retrieve weather or calculate annual energy, shading, module IV curves, mismatch, wiring losses or transient response. Open the assumptions panel for the Sandia and NREL model references.",
      "Use the same interval winds to compare the NREL 4 MW onshore and 6 MW offshore reference curves. In microgrid dispatch, choose a curve with Wind reference turbine. Historical generation uses recorded output. Save the selected turbine or export the case to retain its source.",
      "In Microgrid dispatch laboratory, enter equal-length interval lists for wind speed, PV irradiance, total demand and the critical share of demand. Set PV and wind capacity, interval duration, battery energy/rating/efficiency/reserve, and a generic dispatchable backup ceiling with a ramp-up limit. Review per-interval renewable output, battery charge/discharge and state of charge, backup output, curtailment, served load, critical and non-critical unmet demand, and the AC-bus balance residual.",
      "Dispatch serves critical demand first. Inspect the interval results to see when generation, storage, grid imports or backup supplied the load. Review the AC-bus balance residual and any unserved demand, then save the scenario or export JSON and CSV.",
      "Use Shift flexible demand to move part of an entered noncritical load to another interval. Compare backup output before and after. The transfer preserves total energy and critical demand.",
      "Save or export dispatch to keep the most recent demand shift, including the interval loads before and after the transfer.",
      "The regional panel offers Nigeria-inspired and Germany-inspired (50Hertz grid-area) teaching scenarios. Nigeria displays sourced 330/132/33/11 kV stages; Germany displays 380/220/110 kV, a clearly illustrative 20 kV within the documented 15–30 kV medium-voltage range, and 0.4 kV consumer service. Each shows its frequency, currency and time-zone context separately. Select a region and Apply its supported voltage fields; unrelated inputs remain unchanged.",
      "The regional scenarios are teaching contexts, not operational replicas. Their source links and dates appear in the panel. No regional generation, weather or demand profile is loaded, and the balanced steady-state worksheets do not simulate frequency response. Germany's transmission example is scoped to the 50Hertz area.",
    ],
    example:
      "At 100 MW, PF 1, 5 Ω/phase, 132 kV gives about 437.4 A and 2.87 MW line loss. At 330 kV the same simplified assumptions give about 175 A and 0.459 MW loss.",
    route: "powergrid",
    keywords: [
      "powergrid",
      "power grid",
      "transmission",
      "step up voltage",
      "line losses",
      "three phase",
      "experiment",
      "export",
      "why",
      "radial feeder",
      "feeder outage",
      "consumer group",
      "bus voltage",
      "thermal limit",
      "unserved load",
      "photovoltaic",
      "solar irradiance",
      "module temperature",
      "PVWatts",
      "inverter clipping",
      "regional scenario",
      "microgrid dispatch",
      "battery state of charge",
      "critical demand",
      "Nigeria",
      "50 Hz",
      "330 kV",
      "NERC",
      "Germany",
      "50Hertz",
      "380 kV",
    ],
  },
];

export const toolGuideSteps = [
  "Read the purpose, input units and conditions below. Open the tool and enter your own supported values.",
  "To learn the controls, choose Load worked example, then Calculate. These catalogue examples are training data, not your project inputs.",
  "Review the formula, assumptions, warnings and sources before copying or exporting a result. Reset clears the worksheet; applying to a project requires a separate review where supported.",
] as const;

export const helpTopics: HelpTopic[] = [
  ...workflows.map((topic) => ({
    ...topic,
    kind: "workflow" as const,
    category: "Workflow guides",
  })),
  ...tools.map((tool) => ({
    id: `tool-${tool.id}`,
    kind: "tool" as const,
    title: tool.title,
    summary: tool.description,
    steps: toolGuideSteps,
    route: "tools",
    toolId: tool.id,
    category: tool.category,
    keywords: [
      tool.id,
      ...tool.inputs.flatMap((input) => [
        input.label,
        input.unit ?? "",
        input.hint ?? "",
        ...(input.options?.map((option) => option.label) ?? []),
      ]),
    ],
  })),
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[’'`]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

const indexes = new Map<
  Locale,
  { topic: HelpTopic; title: string; text: string; aliases: string[] }[]
>();

/** Search the actual guide/catalogue in both the selected language and English. */
export function searchHelp(
  query: string,
  locale: Locale,
  limit = 6,
): HelpTopic[] {
  let index = indexes.get(locale);
  if (!index) {
    index = helpTopics.map((topic) => {
      const strings = [
        topic.title,
        topic.summary,
        topic.category,
        ...topic.steps,
        topic.example ?? "",
        ...topic.keywords,
      ];
      return {
        topic,
        title: normalize(
          `${topic.title} ${translate(topic.title, locale)} ${topic.toolId ?? ""}`,
        ),
        text: normalize(
          strings.flatMap((text) => [text, translate(text, locale)]).join(" "),
        ),
        aliases: [topic.title, topic.toolId ?? "", ...topic.keywords]
          .flatMap((text) => [
            normalize(text),
            normalize(translate(text, locale)),
          ])
          .filter(Boolean),
      };
    });
    indexes.set(locale, index);
  }
  const phrase = normalize(query);
  const terms = phrase.split(" ").filter(Boolean);
  const count = Number.isFinite(limit)
    ? Math.max(0, Math.floor(limit))
    : helpTopics.length;
  const score = (entry: (typeof index)[number]) =>
    (phrase && entry.aliases.includes(phrase) ? 100 : 0) +
    terms.filter((term) => entry.title.includes(term)).length;
  return index
    .filter((entry) => terms.every((term) => entry.text.includes(term)))
    .sort((a, b) => score(b) - score(a))
    .slice(0, count)
    .map((entry) => entry.topic);
}
