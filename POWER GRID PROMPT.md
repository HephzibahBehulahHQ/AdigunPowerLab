# POWER GRID PROMPT
## AdigunPowerLab POWERGRID LAB — From Source to Socket

Owner: Hephzibah Behulah  
Priority: URGENT — owner requested implementation to start now on 14 November 2026 (Europe/Berlin).  
Product repository: https://github.com/HephzibahBehulahHQ/AdigunPowerLab  
Target URL: https://adigunpowerlab.hephzibahbehulah.com/#POWERGRID

## Owner execution instruction

This specification was reviewed with the owner, who has now explicitly requested that it be added to the repository, linked from AGENTS.md, and treated as new urgent work for the Codex engineer currently working on AdigunPowerLab. Begin implementation now from the actual current project state, starting with Milestone 1. Preserve ongoing work and complete any necessary safe checkpoint before changing focus. This is an additive extension of the original product specification, not permission to discard the existing project or its safeguards. A committed instruction or notification is not evidence that an agent has started; record actual acknowledgement and implementation evidence separately. Publication remains subject to the existing applicable deployment authorization.

## 1. Assignment and product purpose

Extend the existing AdigunPowerLab application with POWERGRID LAB — From Source to Socket, accessible at:

https://adigunpowerlab.hephzibahbehulah.com/#POWERGRID

Build an educational laboratory in which electrical students can investigate how electricity is generated, transformed, transmitted, distributed, stored, and consumed.

The laboratory must support this learning cycle:

Observe → Predict → Change inputs → Simulate → Inspect results → Explain → Compare → Export evidence.

A student should be able to answer questions such as:

- Why do power systems raise voltage before long-distance transmission?
- How do power factor, conductor impedance, distance, and demand affect current, losses, and receiving-end voltage?
- What happens when a generator reaches its capacity?
- How do solar, wind, hydro, thermal generation, batteries, and consumer demand interact over a day?
- What changes when a feeder is disconnected or a community operates as an island?
- How do different regional grid architectures affect the same experiment?

Deliver working engineering behaviour, clear explanations, and meaningful visualization. Every displayed engineering value must come from the selected model and current inputs.

This brief describes the intended complete product. Deliver it in verified milestones and distinguish released features from planned extensions.

The original project's principle remains central: Make the spectacle explain the engineering.

## 2. Review the ongoing project before changing it

Read the current versions of:

- AGENTS.md
- AdigunPowerLab  Pursuing Goal prompt.txt
- PROJECT_STATUS.md
- product.config.json
- docs/ARCHITECTURE.md
- docs/CALCULATION_METHODS.md
- docs/KNOWN_LIMITATIONS.md
- docs/REFERENCE_MANIFEST.md
- docs/ACCEPTANCE_MATRIX.md
- docs/TEST_EVIDENCE.md

Inspect the actual branch, working tree, recent changes, and relevant tests. Preserve existing work.

The reviewed project is a React/TypeScript/Vite static application with browser-local storage. Its existing capabilities include:

- Load, phase, circuit, and board modelling.
- Radial feeder voltage-drop and loss assessments.
- Single-line and spatial views.
- Worker-based chronological simulation.
- Entered renewable profiles and battery dispatch.
- Scenario comparison and engineering reports.
- English, German, Yorùbá, and Nigerian Pidgin interfaces.
- A deterministic local Adigun BOT.

Reuse applicable infrastructure after verifying its assumptions. Do not stretch the current radial planning solver into a general transmission-network solver.

All new application code, assets, tests, documentation, and deployment configuration belong in AdigunPowerLab.

## 3. Apply the Hephzibah Behulah template accurately

Use these read-only references:

- Corporate repository: https://github.com/HephzibahBehulahHQ/HephzibahBehulahHQ.github.io
- Universal product template: https://github.com/HephzibahBehulahHQ/hb-design-system/tree/main/templates/universal-product
- Shared design system: https://github.com/HephzibahBehulahHQ/hb-design-system
- Electrical division: https://github.com/HephzibahBehulahHQ/hb-elektroniker

Preserve the hierarchy:

Hephzibah Behulah → HB Elektroniker → AdigunPowerLab → POWERGRID LAB

POWERGRID LAB is a module of AdigunPowerLab.

Preserve:

- brandKey: elektroniker.
- The exact approved corporate image, unchanged.
- One corporate logo in the main header.
- AdigunPowerLab's text wordmark and division label.
- Existing themes, accessibility preferences, and four-language support.
- Accurate capability flags in product.config.json.

Use the established palette:

| Token | Colour | Application |
|---|---|---|
| Midnight navy | #0B1220 | Dark surfaces |
| Corporate gold | #D4AF37 | Restrained identity accents |
| Royal blue | #2563EB | Supporting interactions |
| Ivory | #F8FAFC | Light surfaces and text |
| Electric cyan | #22D3EE | Electrical paths and selected objects |
| Violet | #A78BFA | BOT context |

Provide separate semantic colours and symbols for warning, fault, disconnected, and unavailable states. Colour alone must never communicate status.

Follow the shared UNIVERSAL MENU, ICON, DROPDOWN AND FLOATING PANEL BEHAVIOR standard. Temporary panels float above the workspace, remain within the viewport, support keyboard/touch dismissal, and cause no underlying layout movement. Persistent inspectors and active editing workflows must remain usable.

Record the exact reference revisions used. The template is a configuration and behaviour contract; it does not provide a solver, finished UI, backend, or operational AI service.

## 4. Header placement and URL behaviour

Add a prominent POWERGRID LAB → navigation control at the extreme right of the desktop top bar, in the same header area as Search.

Preserve access to Search, language selection, and Settings. On smaller screens, use a compact accessible control or suitable responsive navigation without clipping.

The arrow should clearly indicate entry into the laboratory. Avoid persistent flashing.

The reviewed application initializes routes with location.hash.slice(2) and writes #/route addresses. Therefore:

1. Explicitly support the owner's exact #POWERGRID URL.
2. Make the header control navigate to that address.
3. Support direct opening, refresh, browser Back/Forward, and hash changes.
4. Preserve existing #/... routes.
5. Optionally accept #/powergrid as an alias.
6. Preserve unsaved work and existing save-failure safeguards.
7. Make POWERGRID discoverable through application Search and Help.

Do not implement #POWERGRID as an anchor that silently leaves the user on Overview.

## 5. The laboratory experience

Provide three connected modes.

### Explore

A guided journey through a labelled educational network:

Energy resource → conversion equipment → generator or inverter → plant bus → step-up transformer → transmission network → receiving substation → distribution feeder → local transformer → service connection → meter → consumer circuits.

Selecting a stage explains:

- Its purpose.
- Its operating principle.
- Important equipment.
- Inputs and outputs.
- Typical engineering constraints.
- What this simulation models and simplifies.

Include branches for storage, rooftop solar, embedded generation, and direct connections at different voltage levels. Explain that real networks do not all follow one identical chain.

### Experiment

An editable laboratory with:

- Model and regional preset selection.
- Generation and demand controls.
- Equipment and line parameters.
- Run, Pause, Step, Reset, and time-speed controls.
- Instrument placement.
- Scenario duplication and comparison.
- Calculation traces and exports.

### Challenges

Structured practical exercises with:

- Objective and prerequisites.
- Initial scenario.
- Student prediction.
- Allowed interventions.
- Measured or calculated observations.
- Interpretation questions.
- Completion criteria.
- Exportable lab record.

Assess understanding and engineering outcomes. Where multiple valid solutions exist, accept them.

## 6. Workspace and visualization

Use a desktop layout with:

| Area | Purpose |
|---|---|
| Top toolbar | Mode, preset, model, simulation controls |
| Left panel | Equipment, resources, lessons, scenarios |
| Centre | Synchronized network visualization |
| Right inspector | Selected asset, parameters, measurements, explanations |
| Bottom panel | Timeline, trends, events, experiment results |

Provide these views:

Single-line schematic: the primary engineering view, with buses, transformers, lines, switches, loads, sources, and clear topology.

Geographic-style overview: an educational landscape showing distances, communities, and infrastructure. Label illustrative geography.

3D scene: a navigable representation of plants, substations, towers, transformers, and consumers.

Generation cutaways: selected equipment views explaining conversion processes.

All views must share asset IDs, selection, topology, simulation time, and result revision.

Use computed power-flow direction for animated paths. Document any visual scaling of speed or brightness. Explain that the animation represents energy transfer; it is not a depiction of electrons travelling from a plant to a house at that speed.

Provide:

- Clear legends and units.
- Flow-direction arrows.
- Distinct open, energized, overloaded, and disconnected states.
- A usable schematic fallback when WebGL is unavailable.
- Reduced-motion behaviour.
- Keyboard-accessible alternatives to essential canvas actions.
- Licensed or original photographs, illustrations, and 3D assets with provenance.

Use imagery to explain equipment and processes. A coal boiler, hydro turbine, and solar inverter must have distinct educational treatment.

## 7. Generation and storage catalogue

Design an extensible catalogue covering:

- Reservoir hydro and run-of-river hydro.
- Pumped storage.
- Solar PV.
- Concentrated solar thermal.
- Onshore and offshore wind.
- Coal steam generation.
- Gas turbines and combined cycle.
- Nuclear steam generation.
- Diesel and other liquid-fuel generation.
- Biomass and biogas.
- Geothermal.
- Tidal and wave generation.
- Battery storage.
- Hydrogen/fuel-cell generation.

Each implemented asset must specify:

- Energy-conversion chain.
- Rated capacity and minimum output where applicable.
- Availability and resource inputs.
- Efficiency or performance model.
- Ramp limits and operating constraints.
- Reactive-power capability where supported.
- Cost and emissions assumptions where used.
- Model scope and source references.

Use source-specific models. Examples include hydro head/flow, PV irradiance/temperature, wind power curves, and thermal heat-rate assumptions.

Separate installed capacity, available capacity, dispatched output, and delivered power.

Treat batteries and pumped storage as storage. Include charging consumption and round-trip losses.

Do not publish selectable asset types with generic fake behaviour. Maintain a visible implementation matrix and release supported models progressively.

## 8. Regional educational presets

Implement configurable teaching scenarios for:

| Preset | Educational emphasis |
|---|---|
| Germany-inspired | 50 Hz operation, renewable variability, transmission/distribution interaction |
| United States-inspired | 60 Hz operation, representative utility distribution, split-phase consumer service |
| Nigeria-inspired | 50 Hz operation, representative 330/132/33/11 kV stages, constrained supply and distributed backup |
| Southern Africa-inspired | Coal-heavy generation, long transmission paths, renewable additions |
| Rural community microgrid | Solar, battery, diesel backup, critical-load priorities |
| Custom system | User-defined frequency, voltages, resources, loads, topology |

Africa must contain distinct regional or country examples; it is not one uniform grid.

Separate:

- UI language.
- Engineering region.
- Frequency.
- Currency.
- Timezone.
- Voltage conventions.
- Resource and demand profiles.

Every preset must identify its sources, date, simplifications, and whether values are illustrative or sourced. Describe these as regional teaching scenarios, not operational replicas of national grids.

Do not infer household split-phase or unbalanced feeder behaviour from a balanced three-phase solver. Provide the appropriate model or a separate explicitly scoped worksheet.

## 9. Numerical engine and model levels

Separate numerical computation from rendering, persistence, and UI state.

### Level A: explainable component experiments

Implement transparent calculations for:

- Single-phase and balanced three-phase power.
- Active, reactive, and apparent power.
- Power factor.
- Transformer ratios, efficiency, and losses.
- Conductor resistance and supported temperature corrections.
- Supported voltage-drop approximations.
- Resistive line losses.
- Power and energy accounting.

Display equations, substituted inputs, units, and assumptions.

### Level B: balanced radial AC network

Implement or integrate a validated radial AC power-flow method.

Support:

- Declared slack/source bus.
- Complex line impedance.
- Transformer ratios and supported impedance/tap models.
- Load P/Q.
- Generator operating limits.
- Bus voltages.
- Branch currents and complex powers.
- Real and reactive losses.
- Thermal and voltage constraints.
- Disconnected islands.
- Convergence diagnostics.

Document load behaviour: constant power, current, impedance, or another explicitly supported model.

Do not reuse nominal-voltage arithmetic as solved receiving-end voltage.

### Level C: meshed transmission networks

Add a separately validated AC load-flow solver with:

- Slack, PV, and PQ buses.
- Per-unit conversion.
- Transformer taps and phase shifts where supported.
- Reactive limits and documented limit handling.
- Topology and island checks.
- Residuals, tolerance, iteration limit, and convergence status.

A DC load-flow teaching model may be offered separately. Label its assumptions and inability to establish voltage magnitudes, reactive flows, or physical losses in its conventional form.

### Level D: time-domain teaching models

Run chronological generation, demand, storage, dispatch, and repeated steady-state solutions.

Keep this distinct from dynamic frequency or transient simulation.

Frequency-response lessons require an explicit dynamic model, such as documented aggregate inertia, governor/droop, damping, and integration assumptions. Do not create a frequency trace by mapping supply deficit to an arbitrary animation.

Short-circuit, protection coordination, electromagnetic transients, and black-start sequencing require their own supported models.

## 10. Physics and numerical integrity

Apply consistent units and sign conventions.

Required fundamentals include:

- Balanced three-phase: P = √3 × VLL × I × cosφ.
- Apparent power: |S| = √(P² + Q²).
- Resistive losses: Ploss = 3 × I² × Rphase.
- Ideal transformer ratio: V1/V2 = N1/N2.
- Time integration: E = Σ(P × Δt).
- A declared energy balance across generation, imports, storage, loads, exports, and losses.

Explain line-to-line versus line-to-neutral voltage, RMS quantities, per-phase quantities, and balanced-system assumptions.

For fixed delivered active power and power factor, raising transmission voltage should lower current and resistive losses. State which other parameters are held fixed.

Grid flows must obey the network equations. Do not assign physical electron routes to customers according to contractual allocation. Distinguish scheduling, dispatch, accounting, and network power flow.

Handle:

- Missing inputs.
- Invalid units and ranges.
- Zero impedance.
- Invalid transformer ratios.
- Unserved islands.
- Capacity limits.
- Non-convergence.
- Unsupported configurations.
- Stale results.

A failed solution must not leave old green results presented as current.

## 11. Student controls and instruments

Allow appropriate models to expose:

- Generator output and availability.
- Demand magnitude and profile.
- Power factor and compensation.
- Line length, impedance, and conductor parameters.
- Transformer ratio, taps, rating, and losses.
- Resource/weather profiles.
- Storage size, power limit, efficiency, and state of charge.
- Switch and breaker states.
- Critical-load priorities.

Allow students to inspect or place:

- Voltmeter.
- Ammeter.
- Wattmeter.
- Varmeter.
- Power-factor meter.
- Frequency meter where supported.
- Energy meter.

Display instrument location, phase basis, units, origin, and model.

Provide both sending-end and receiving-end results. Distinguish voltage drop, power loss, energy loss, and loading percentage.

## 12. Demand, dispatch, and system events

Represent residential, commercial, industrial, agricultural, hospital, school, EV, and other appropriate consumer groups.

Separate connected load, coincident demand, energy use, and critical demand.

For chronological operation:

- Dispatch generation within declared limits.
- Apply renewable availability.
- Respect storage charging/discharging limits.
- Include losses in the selected system model.
- Report imports, exports, curtailment, unmet demand, and reserve.
- Make dispatch priorities explicit.
- Disclose heuristic scheduling where used.

Provide supported events such as:

- Cloud cover reducing PV.
- Wind changes.
- Evening demand peak.
- Generator outage.
- Feeder disconnection.
- Transformer overload.
- Battery depletion.
- Demand response.
- Islanding and restoration under a supported simplified model.

If no fault-current model exists, represent a line trip as a topology event. Do not invent a short-circuit waveform or breaker clearing time.

## 13. Initial practical curriculum

Deliver at least these distinct experiments:

| Experiment | Learning outcome |
|---|---|
| Source to socket | Identify each conversion and voltage stage |
| Why step up voltage? | Compare current and losses at fixed power |
| Transmission distance | Observe impedance and receiving-voltage effects |
| Poor power factor | Compare current, loading, and compensation |
| Transformer loading | Investigate rating, efficiency, and losses |
| Solar at midday | Observe dispatch, charging, curtailment, or export |
| Evening peak | Investigate supply limits and storage support |
| Generator outage | Observe reserve, unmet demand, and priorities |
| Feeder trip | Identify disconnected consumers and restoration paths |
| Microgrid operation | Balance resources, storage, and critical loads |
| Regional comparison | Compare stated architectures and conventions |
| Capstone community | Design and justify a supply system |

Each experiment needs a worked reference result, assumptions, prediction question, editable parameters, interpretation questions, reset behaviour, and report output.

Use a dedicated lab workspace. Opening a reference case must not overwrite a customer project.

## 14. Reports, comparison, and saved work

Support:

- Named experiments.
- Autosave and explicit backups.
- Undo/redo.
- Scenario duplication.
- Baseline-versus-modified comparison.
- JSON export/import with preview.
- CSV time-series export.
- PDF lab reports.

A lab report should contain:

- Objective and student notes.
- Scenario and regional preset.
- Network diagram.
- Input parameters.
- Solver/model version and assumptions.
- Result tables and charts.
- Calculation traces.
- Events and interventions.
- Constraint violations and unmet demand.
- Comparison results.
- Interpretation and limitations.

Freeze a coherent input/result snapshot for export.

Integrate lab persistence with existing backup/recovery infrastructure using versioned schemas and safe migration. Keep engineering projects and lab experiments distinct.

Allow a reviewed customer-project snapshot to become a downstream lab demand model. Record provenance and revision; never silently write laboratory changes back into the source project.

## 15. Adigun BOT

Extend the existing deterministic BOT with truthful lab capabilities:

- Explain a selected asset.
- Explain voltage drop or increased current.
- Summarize experiment results.
- Identify missing inputs.
- Suggest the next lesson.
- Prepare a supported parameter-change proposal.
- Export a lab report.

Examples:

- "Why did this feeder current increase?"
- "Compare this run with the baseline."
- "Explain why the battery could not serve the evening peak."
- "Preview changing this line to the higher voltage."

Changes must use typed, revision-bound proposals with preview, confirmation, and undo.

Do not imply connected generative AI or live grid telemetry.

## 16. Technical integration

Use the current architecture as the starting point.

Suggested responsibilities:

| Location | Responsibility |
|---|---|
| src/features/powergrid/ | Lab screens and shared controls |
| src/domain/powergrid/ | Validated assets, networks, scenarios, results |
| src/engine/powergrid/ | Pure equations and solvers |
| src/workers/powergrid.ts | Cancellable simulation |
| src/data/powergrid/ | Labelled presets and lessons |
| src/import-export/ | Lab snapshots and exports |
| tests/ | Independent numerical fixtures |
| tests/browser/ | Student workflows and regression checks |

Adapt these paths to actual repository conventions.

Requirements:

- One authoritative scenario state.
- Derived results shared across views.
- Revision-aware asynchronous work.
- Cancellation of obsolete runs.
- Rejection of stale worker responses.
- Validation at import, persistence, and calculation boundaries.
- Lazy-loaded 3D and heavy numerical features.
- Cleanup of workers, animation loops, and WebGL resources.
- Offline availability for bundled lessons after verified caching.
- Existing customer-workspace performance preserved.

Evaluate numerical dependencies for correctness, licensing, maintenance, browser compatibility, and bundle size.

## 17. Verification and acceptance

Use independent analytical cases and published benchmark cases with appropriate attribution.

Numerical verification must cover:

- Ideal and lossy transformers.
- Balanced current calculations.
- Resistive losses.
- A two-bus AC case.
- Radial power flow.
- A meshed benchmark when that solver is introduced.
- Power balance within documented tolerance.
- Reactive limits.
- Disconnected islands.
- Invalid data and non-convergence.
- Storage efficiency and energy conservation.
- Time-step sensitivity for dynamic models.

Include this explicit reference check:

For a balanced unity-power-factor system carrying 100 MW at 132 kV line-to-line, current is approximately 437.4 A. With 5 Ω per-phase resistance, 3I²R loss is approximately 2.87 MW under the stated fixed-current assumptions.

At 330 kV, the corresponding current is approximately 175.0 A and resistive loss approximately 0.459 MW, keeping power, power factor, and resistance fixed.

Label this as a comparative analytical exercise. A solved receiving-end AC case must additionally account for voltage and power-flow consistency.

Browser acceptance must verify:

- Exact #POWERGRID deep link and refresh.
- Back/Forward navigation.
- Header placement at desktop, tablet, and mobile sizes.
- Existing route compatibility.
- Preservation of unsaved customer work.
- Functional inputs, instruments, controls, and comparison.
- Synchronized schematic and 3D selection.
- Reduced motion and keyboard operation.
- WebGL fallback.
- Four-language Help coverage.
- Save/reload, import/export, and backup recovery.
- Actual PDF contents and pagination.
- Offline behaviour.
- No layout shift from transient menus.
- No stale results after edits.

Run applicable existing scripts for type checking, linting, unit tests, builds, browser tests, and offline/update checks. Record actual commands, revision, results, and remaining limitations.

## 18. Delivery milestones

### Milestone 1 — Integration and complete first experiment

Deliver the exact route, header control, lab state, schematic, instruments, step-up/line/step-down/load chain, calculated results, save/export, and "Why step up voltage?" lesson.

### Milestone 2 — Radial network laboratory

Deliver validated radial AC analysis, multiple feeders and consumer groups, constraints, outages, comparison, and expanded lessons.

### Milestone 3 — Generation and regional scenarios

Deliver source-specific generation models, regional presets, chronological dispatch, renewable variation, storage, and critical loads.

### Milestone 4 — Visual laboratory

Deliver synchronized 3D scenes, selected generation cutaways, educational imagery, asset provenance, and performance/accessibility verification.

### Milestone 5 — Advanced systems

Deliver validated meshed AC analysis, supported contingency studies, and explicitly scoped dynamic lessons.

### Milestone 6 — Curriculum and release qualification

Complete reports, translations, Help, recovery, numerical evidence, browser checks, performance measurements, and authorized publication verification.

Each milestone must provide an end-to-end working student workflow. Do not mark the complete specification delivered when only the first visual scene works.

## 19. Required documentation and handoff

Create or update:

- docs/POWERGRID_LAB_SPEC.md
- docs/POWERGRID_MODELS.md
- docs/POWERGRID_CURRICULUM.md
- docs/POWERGRID_DATA_SOURCES.md
- docs/POWERGRID_ACCEPTANCE.md

Also update the existing architecture, user guide, Help topics, translations, reference manifest, acceptance matrix, test evidence, limitations, and current project status.

The handoff must state:

- What students can actually do.
- Which numerical models passed verification.
- Which source types and regional presets are supported.
- Which features remain incomplete.
- How to reproduce the reference experiments.
- Which revision was tested.
- Whether publication was authorized and verified.

Completion criterion: a student can open POWERGRID LAB, trace electricity from a source to consumers, predict an outcome, change a meaningful parameter, run a supported simulation, inspect trustworthy results, compare alternatives, and export an understandable lab report.
