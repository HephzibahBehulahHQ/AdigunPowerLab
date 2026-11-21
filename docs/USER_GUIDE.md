# AdigunPowerLab user guide

## POWERGRID LAB — Milestone 1

Select **POWERGRID LAB →** at the right side of the top bar or open the exact address `#POWERGRID`. Refresh keeps the lab open; browser Back and Forward follow route changes. This workspace uses a separate versioned local save and does not edit the active customer project. Its schematic follows generation → step-up transformer → transmission → step-down transformer → distribution → consumer.

In **Why step up voltage?**, edit transmitted real power, power factor, per-phase line resistance, and the two transmission voltages. The instrument cards recalculate three-phase line current, resistive line loss, loss share and power remaining after the modeled line loss. Save stores the experiment in this browser; JSON and CSV downloads contain the actual entered values and computed readings. Re-entering the lab restores the last saved experiment.

The exercise assumes a balanced three-phase system, constant transmitted real power and power factor, the same per-phase resistance in both cases, and ideal transformer voltage changes. Generator, distribution and consumer voltages are schematic scenario inputs. It does not calculate transformer efficiency, distribution losses, receiving-end voltage or a network load flow. These are educational component calculations, not a validated grid study.

### Overview field references

Open **Overview** and scroll to **PowerGrid learning**. The section pairs credited photographs of a Bonneville hydro generator, the Al Ameen substation and a distribution transformer with links to the transmission-loss and radial-feeder calculations. Select **Play documentary video** to load the source-linked Garrison Dam time lapse; video playback starts only after selection. Captions and credits identify the material. Photos and footage are visual references, not this project's readings, live telemetry, connection evidence or proof of present site conditions.

### Hydro station inspection

The station opens with a custom, wide hydro overview showing the dam and flowing water, turbine-generator, transformer, switchyard, transmission, receiving substation and residential and industrial loads. This visual is an illustrative teaching scene; use the labeled interactive schematic below it to inspect the represented electrical connections and terminals.

The hydro station scene separates a physical powerhouse cutaway from the electrical single-line path. Select the reservoir, trash rack, intake gate, penstock, draft tube, Francis turbine, generator, generator step-up transformer, breaker, disconnector, earthing switch, CT/VT, surge arrester, busbar, control house, SCADA panel, overhead conductors, tower or station earth. The information panel explains each selected item and identifies its shown terminals or connections. Keyboard users can focus an item and press Enter or Space. On a narrow screen, scroll the drawing horizontally inside its own frame.

Below the electrical drawings, the **Navigable power station and grid model** provides a separate perspective. Adjust **Azimuth**, **Elevation** and **Zoom**, then choose an equipment name to inspect its function and represented connections. The 3D view is simplified teaching geometry, not a surveyed site, installation design or measurement. If WebGL is unavailable, use the labeled station schematic.

The gallery below the schematic pairs each station stage with an image and a practical equipment checklist. The generated images are training illustrations, not photographs of an identified plant. Use them to recognize typical equipment; use the interactive electrical schematic for connection details, and never approach or test energized equipment based on an illustration.

### Combined-cycle, solar and wind plant studies

Below the hydro cutaway, choose **Combined-cycle gas plant**, **Utility-scale solar PV** or **Utility wind plant**. The image updates to the selected plant. Select the equipment controls to inspect its purpose and representative process or electrical interfaces: gas turbine → heat-recovery steam generator → steam turbine; PV strings → DC combiner → inverter → AC collection and transformer; or wind rotor → drivetrain → generator/converter → collector. The selector supports keyboard operation and the picture is lazy-loaded only when its plant is selected. All three are custom training illustrations, not photos of identified sites.

Read interface labels as representative connection points, not universal terminal markings. Actual conductor IDs, ratings, grounding, protection and arrangement depend on the manufacturer and site. Confirm them from approved equipment data and project drawings. These plant views are instructional and do not simulate plant power output, dynamics, protection or interconnection compliance. Source references and illustration provenance are in [`POWERGRID_DATA_SOURCES.md`](POWERGRID_DATA_SOURCES.md).

### Receiving substation, distribution and customers

Below the hydro scene, scroll the second interactive drawing to follow the transmission entry through the receiving line bay, disconnectors, breaker, CT/VT and arrester to the receiving step-down transformer. Continue along the medium-voltage bus and feeder recloser to a local pole-mounted distribution transformer, low-voltage feeder pillar, residential meter and main board, and industrial MCC and three-phase motor. Select any labeled device or conductor; its inspection card describes its purpose and represented terminals. Tab to an item and press Enter or Space. The shown receiving, medium-voltage and consumer voltage labels follow the editable raised-voltage, distribution-voltage and consumer-voltage inputs in the experiment above.

The drawing is an illustrative teaching topology, not an as-built network or installation plan. Its neutral (N) and protective earth (PE) are drawn separately; their system bonding and the winding/vector group depend on the actual installation. It does not calculate downstream transformer losses, protection operation or customer load flow. Use approved site drawings and qualified supervision for real equipment.

| Stage and matching gallery image      | Components in the checklist                                                                                                                                                                                                | What they do in the process                                                                                                                                                                            |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hydro powerhouse                      | Dam intake, trash rack, gate, penstock, guide vanes, turbine runner, draft tube, governor, shaft, generator stator/rotor/terminals, exciter/AVR, bearings and cooling                                                      | Screen and control water; convert hydraulic energy to shaft torque; generate and regulate three-phase electrical output while managing heat and rotating machinery.                                    |
| Step-up transformer and switchyard    | Generator step-up transformer, windings and bushings, tap changer, conservator/radiators, Buchholz relay, pressure relief, arresters, CTs/VTs, circuit breakers, disconnectors, earth switches and busbars                 | Raise generator voltage; remove heat and provide protection/measurement; switch, isolate and bond bays under approved operating procedures.                                                            |
| Transmission and receiving substation | Phase conductors, clamps, bundle spacers, insulator strings, tower crossarms, lattice tower, shield wire/OPGW, tower earth, line protection relays and communications                                                      | Carry bulk three-phase power while maintaining electrical clearances; intercept lightning; detect faults and command the appropriate breakers.                                                         |
| Distribution and customers            | Receiving transformer and MV bus, feeder breakers, reclosers, sectionalizers, fuses, distribution transformer, feeder pillar, regulator, capacitor bank, meters, house service/main board, MCC, motors and VFDs            | Reduce voltage in stages, protect and sectionalize feeders, meter delivered energy, distribute service to buildings and control industrial motor loads.                                                |
| Safety and test bench                 | Rated multimeter, clamp meter, insulation-resistance tester, earth-resistance tester, phase-sequence tester, relay secondary-injection set, voltage detector/proving unit, PPE, lockout/tagout and portable earthing leads | Check isolated equipment and protection circuits with the correct test method. Follow the approved site safety plan, isolation and prove-dead procedure; training pictures do not authorize live work. |

For every pictured station, compare the checklist with the selectable SVG above: the information card explains the selected equipment and its represented function or terminals. Equipment models, terminal markings, protection settings, ratings and layouts vary by actual plant and must come from its approved drawings and procedures.

This is an explicitly illustrative station configuration, not an as-built plant: it shows a generator star point brought out and grounded through an impedance, a delta generator-side / grounded-star grid-side step-up transformer, a simple bus bay and an overhead three-phase line. The site-specific vector group, neutral grounding, breaker arrangement, ratings, clearances and protection coordination must come from actual project documents. The generator neutral N, protective earth PE and the separate overhead shield wire are drawn as different connections. The brown/black/grey phase colors identify schematic conductors; bare high-voltage line conductors do not have those insulation colors. The scene does not add physical plant measurements to the numerical worksheet.

## POWERGRID LAB — radial feeder experiment

Scroll to **Radial feeder: voltage drop and outages** to explore the second working experiment. Its clearly labelled illustrative training case contains two feeder branches and three consumer groups. Edit source line-to-line voltage, each group's active/reactive load and minimum voltage, and each branch's resistance, reactance and thermal limit. The balanced AC solver recalculates bus voltage, branch current, sending/receiving P and Q, real/reactive losses, constraint flags and convergence diagnostics as inputs change.

Switch a branch's **In service** control off to model an open feeder. Downstream consumer groups are listed as unserved and excluded from served load and source balance; the app does not invent an alternate path. Before editing a case, select **Set comparison reference**. The comparison reports the change in minimum served voltage, real losses and unserved demand. Save stores this radial case separately in this browser. JSON contains the model inputs and full solver result; CSV contains bus and branch readings.

This is a balanced radial teaching model with one fixed-voltage source, constant-P/Q loads and per-phase series impedance. It rejects closed loops and invalid inputs, reports islands and numerical convergence, and does not model shunt capacitance, transformer taps, generator limits, protection, meshed power flow or dynamics. Constraint flags are not equipment ratings or certification.

## Help inside the application

Select **Help & Support** beside the detail-level control on any workspace. The same guide is available from the sidebar help icon and **Ctrl/Cmd+K** search. Search in the selected language or English, or enter an exact tool number such as **T01**. Filters separate workflow guides from tool guides. Every tool guide displays its actual input names, units, conditions and catalogue example values.

Select a guide to read its steps and practical example. **Open workspace** and **Open tool** lead to the existing application controls. Reading help does not change a project. If a form has unfinished edits, finish or cancel those edits before using a guide to navigate away. Escape closes help and restores keyboard focus to its opening control.

Help is available offline after the production app has been cached. **Open a GitHub issue** opens the repository's issue form in a separate tab and needs an internet connection; it never sends project data automatically. Include only the minimum non-private example needed to explain a problem. The four-language guide has catalogue and browser coverage; professional technical-language review remains separate.

## Start with your installation

Open the project switcher in the header and create a named project. A new project starts without customer equipment. Open **Settings** to enter the supply, voltage, frequency, timezone, currency, jurisdiction and design assumptions. Language is independent of currency and engineering criteria.

Choose **Add load**. Enter a name, rating, quantity, electrical connection and voltage basis. Select the correct input mode: electrical kW, apparent kVA, nameplate current, motor shaft output or explicit real/reactive power. Shaft-output mode uses efficiency to find electrical input; do not choose it for a rating that is already electrical input.

Set operating hours, starting hour, energy duty, utilization and standby power. Energy duty affects the average energy used while scheduled; on-state current remains a separate result. Record whether values come from a nameplate, measurement, datasheet or an assumption. Saving the load recalculates the active project and makes the edit undoable.

## Find the right workspace

| Destination              | Available workflow                                                                                                                                                                                                                                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview                 | Inspect installed power, demand, daily estimates, phase loading and current issues; open the calculation trace                                                                                                                                                                                                                   |
| Load Schedule            | Add, edit, duplicate, delete, select and filter loads; inspect their calculated input, current and energy                                                                                                                                                                                                                        |
| Boards & Circuits        | Create boards/circuits, organize load assignments and review phase-balancing suggestions                                                                                                                                                                                                                                         |
| Single-Line Studio       | Inspect a data-bound diagram, select loads, zoom, fit, toggle flow animation and export SVG; edit topology through boards/circuit assignments                                                                                                                                                                                    |
| Schedules & Simulation   | Run a calendar-range calculation using the project timezone, cancel the worker, inspect interval results and export the series                                                                                                                                                                                                   |
| Cables & Protection      | Use the relevant validated toolbox worksheets with your supplied cable/device evidence                                                                                                                                                                                                                                           |
| Motors & Supply          | Calculate motor, transformer, generator, inverter and UPS planning quantities within each worksheet's stated model                                                                                                                                                                                                               |
| Power Quality            | Inspect power-factor correction, capacitor sizing and supplied harmonic data                                                                                                                                                                                                                                                     |
| Engineering Toolbox      | Search all 51 worksheets by ID, displayed name, category or description in your selected language or English; accents and case are optional. Clear an empty search to recover the list without losing worksheet inputs/results. Enter inputs, calculate, open a labelled worked example, reset, copy or export the actual result |
| Renewables & Storage     | Enter PV/storage assumptions and an explicit hourly generation profile; simulate dispatch and an optional outage                                                                                                                                                                                                                 |
| EV & Flexible Loads      | Enter charging sessions, requirements and limits; inspect delivered/unmet energy and deadline feasibility                                                                                                                                                                                                                        |
| Scenarios & Optimization | Create a separate scenario project and compare its metrics with the baseline                                                                                                                                                                                                                                                     |
| Costs & Carbon           | Enter prices, tariff bands, charges, taxes and emissions assumptions; inspect the planning estimates                                                                                                                                                                                                                             |
| Equipment Library        | Open generic analytical equipment starting points or explicitly labelled worked reference projects                                                                                                                                                                                                                               |
| Reports & Estimates      | Generate an engineering PDF or prepare a separate customer estimate/invoice                                                                                                                                                                                                                                                      |
| Engineering Reference    | Read supported equations, model assumptions, source links and keyboard shortcuts                                                                                                                                                                                                                                                 |
| History & Issues         | Inspect project issues and saved local revisions; restore a selected revision through the project workflow                                                                                                                                                                                                                       |
| Settings                 | Change project defaults, theme, language and motion; access backups and recoverable trash                                                                                                                                                                                                                                        |

Library records are starting assumptions, not verified manufacturer specifications. Reference cases are opt-in instructional projects with expected results. They do not represent your surveyed installation.

## Interpret results

Use **Calculation trace** to inspect the formula, model, revision, origin and assumptions. Check the issue register before using a report. `Calculated` means the supported arithmetic was evaluated. `Incomplete` means required inputs/evidence are absent. `Unsupported` means the selected condition is outside the declared model. A passed numerical check does not establish installation certification or manufacturer approval.

Quick daily and 30-day figures are planning estimates. Use the calendar simulation for actual elapsed dates and timezone transitions. Enter physical chronological generation when studying import/export or storage; peak-sun-hours alone does not provide an hourly PV curve.

## Save, back up and recover

Engineering edits autosave locally. The header shows the actual save state. **Ctrl/Cmd+S** requests an explicit save. Wait until **Saved locally** before refreshing or closing the browser tab. While edits are unsaved, the browser shows its leave-page confirmation; choose to stay and wait for the save, or choose to leave knowing only edits not yet saved will be discarded. The next load opens the last successfully saved project. Browser security rules control the wording of this confirmation. If a save fails, the app keeps the current work open so you can export a backup or save a copy before reloading. If another tab has a newer revision, preserve your changes through export or a copy, then reopen the saved project.

**Export project** creates native PowerLab engineering JSON. **Export loads** creates a spreadsheet-friendly CSV schedule. Import opens a preview with validation errors before applying changes; invalid input preserves the current project. Unsupported schemas are rejected unless an explicitly implemented adapter recognizes them. See `LEGACY_MIGRATION.md` for the current legacy support boundary.

Customer bills have their own **Save draft locally**, **Export draft JSON** and **Import draft JSON** controls. A native engineering JSON export and a billing draft are distinct unless the current export explicitly includes the billing document. Use **Settings → Workspace backup** for a single validated archive containing projects, histories, bills, saved measurements, library versions and embedded diagram/scenario metadata. Separate exports remain useful for individual documents. Browser storage can be removed by browser/device cleanup and does not synchronize between devices.

Use **Move to trash** and **Restore** in the project switcher to recover deleted projects. A separate device needs the exported file; local history is not remote backup.

## Import measured intervals

Open **Schedules & Simulation → Measured intervals**. Upload a CSV, choose the timestamp and power columns, select W or kW, and enter the actual elapsed interval in minutes. Timestamps mark the start of each interval and require `Z` or an explicit UTC offset. Preview validates the inputs. Gaps remain missing; the energy totals cover observed intervals only. Negative power represents export.

**Save measured data** stores the validated dataset separately for the current project and browser. **Reopen saved measurements** restores and revalidates it. Use **Workspace backup** after saving measurements for combined recovery on another device; **measurement backup** remains an independent portable export. The cleaned CSV normalizes power and interval energy to kW and kWh. An invalid replacement leaves the previous validated display and saved dataset intact.

## Print a bill for a customer

1. Open **Reports & Estimates → Customer bill**.
2. Choose **Customer estimate** or **Invoice**. Enter your document number and dates.
3. Enter the actual supplier and customer details. Add tax/registration reference, customer reference and payment details where applicable.
4. Add material, labour or other lines. Enter the description, quantity and unit price. Quantities support three decimal places; prices use the currency's minor-unit precision.
5. Enter any discount and tax percentage. The preview shows the exact subtotal, discount, net, tax and final total.
6. Save the draft. Choose **Download PDF** for a paginated Unicode PDF, **Print / Save PDF** for the browser's print dialog, or **Export CSV** for the priced schedule.

Exports remain disabled until required fields and amounts are valid. The reason is shown beside the form. Bill quantities come from the values you enter; decorative diagram lines do not measure cable length. The app does not invent company information, signatures or legal/tax certification.

Billing rounds each line to currency precision, applies discount to subtotal, then applies tax to the discounted net amount. This order is documented in the exported PDF. Importing a billing JSON draft requires confirmation and does not discard your current document on a validation failure.

## Use Adigun BOT

Open the single assistant launcher. Local mode can explain current results, identify missing inputs, propose phase balancing and prepare report context. It operates on actual project state and remains usable without an online model provider.

A narrow structured equipment command is supported:

```text
load: Workshop heater; 2.3 kW; 230 V; PF 1; 8 h
```

Other supported commands use the exact current load, board and circuit names:

```text
edit load: Workshop heater; rating_kw; 3.1
phase load: Workshop heater; L2
assign load: Workshop heater; board: Main board
assign load: Workshop heater; circuit: Lighting circuit
delete load: Workshop heater
remove circuit: Lighting circuit
```

Load edits support `name`, `rating_kw`, `voltage_v`, `power_factor`, `hours_per_day` and `quantity`; `rating_kw` requires kW entry mode. A board-only assignment removes the load from its current circuit. Circuit assignment also updates the served board and may align an unlocked single-phase load to the circuit phase. Phase changes can move other unlocked single-phase loads on the same circuit. The assistant previews changes and demand impact; review each proposal and explicitly apply it through the undoable project workflow. Names must be unique, and editing the project invalidates stale proposals. Unsupported or incompatible commands do not mutate the project. This deterministic local command set is not a generative AI backend, OCR, telemetry or account service.

Load removal requires the exact current load name. Review the preview for linked start events and flexible-load plans that will also be removed; choosing Apply performs the change, and Undo restores the full prior project. Missing or ambiguous names are rejected.

Circuit removal requires the exact current circuit name. Review the circuit and all connected loads; Apply removes the circuit while keeping those loads in the project unassigned. Undo restores the complete prior project. Missing or ambiguous circuit names are rejected.

The assistant window supports close, minimize, maximize and restore, with retained context for each project during the session. Chat text is local session content; it is not included in the engineering project backup.

## Keyboard, language and display

- **Ctrl/Cmd+K:** command/search palette.
- **Ctrl/Cmd+S:** save the engineering project.
- **Ctrl/Cmd+Z:** undo a project command outside text fields.
- **Ctrl/Cmd+Shift+Z:** redo outside text fields.
- **Escape:** close the current dialog where supported.

Choose English, Deutsch, Yorùbá or Nigerian Pidgin in the header. Theme and motion controls are in Settings. Reduced motion keeps calculations functional without continuous effects. Some detailed technical explanations/source content may remain English; a translated selector does not mean every external document has been translated or every message reviewed by a native specialist.

For supported numerical boundaries and source rights, read `CALCULATION_METHODS.md`, `TOOL_METHODS.md` and `DATA_SOURCES.md`. For what has actually passed verification, read `TEST_EVIDENCE.md` and `ACCEPTANCE_MATRIX.md`.

## Project actions and reviewed changes

Choose **Project** in the header to manage the current workspace. **New project** creates a named blank workspace; **Open project** lists saved projects; **Rename** changes the active name; **Duplicate** opens an independent copy; **Save** stores locally; **Export project** downloads engineering JSON; and **Import project** previews and validates a file before you select New, Merge or Replace. **Revision history** opens History & Issues. **Move to trash** asks for confirmation; use **Open project → Restore from trash** to recover it. **Close project** saves and opens a blank workspace. A failed save retains the working project. **History & Issues → Compare revisions** shows field-level differences from the current inputs to a saved revision. Select fields to restore; include dependent boards/circuits when restoring a removed load. The validator rejects dangling references. Whole-revision restore and Undo/Redo remain available.

**Load Schedule → Bulk operations** supports selected rows, source/issue/category/phase/board filters, reviewed changes and clipboard rows. Invalid pasted records are rejected together. Right-click a load, or focus its name and press **Shift+F10**, for Inspect, Edit, Duplicate and Delete. Circuit phase changes move the associated single-phase loads together. Unlock a load before changing its phase/connection; automatic and reviewed proposals respect locks.

## Equipment, sources and organization

Save an existing load as a reusable template or create a sourced equipment record in **Equipment Library**. Search/filter the library and mark favorites. Adding a template creates an independent load and retains the template/version reference. Editing a template opens a replacement preview: choose which linked loads receive the new electrical nameplate fields and evidence. Quantities, schedules, names and circuit assignments remain as entered. Other projects keep their saved copies. Historical template versions are retained; workspace and equipment JSON exports preserve the saved history.

**Boards & Circuits → Site, buildings and zones** organizes boards without creating electrical connections. Groups can be created, renamed, reparented and removed. Removing a group moves its child groups to its parent and detaches assigned boards from that group.

**Motors & Supply → Source register** records actual grid, transformer, generator, inverter or UPS ratings, derating, evidence, served boundary and optional overload envelope. Continuous kW, kVA, phase current and explicit starting envelope checks are independent. Island, transfer, restart and black-start declarations are entered evidence, not instructions to switch hardware or proof of safe paralleling.

## Diagram and spatial inspection

**Single-Line Studio** supports actual Connect/Disconnect operations, dependency-aware board/circuit changes, notes, manual coordinates, auto-layout, labels, keyboard pan and SVG/PDF exports. Planning source records have no active additional-feed edge. The **Analytical spatial view** projects this same graph into a perspective view with orbit/elevation/zoom, board isolation, keyboard selection and an hourly cursor. Coordinates express hierarchy rather than surveyed distances. Hourly flow labels are model energy averages; they are not measured telemetry or start currents. Exported spatial SVG contains the displayed graph.

## Calendar, feeders and dispatch

**Schedules & Simulation** separates the representative daily profile from a completed real-time calendar range. A completed range supports Play/Pause, speed, stepping, keyboard scrubbing and full CSV export. Changing the proposed dates preserves the previous completed range with its actual dates; Cancel stops the new worker. Advanced planning includes overlapping operating windows, weekday/season/effective-date rules, holiday exceptions, explicit timed cycles/start events and constrained flexible-process windows. Review a feasible schedule before applying it; Undo restores the prior project.

**Cables & Protection → Feeder assessment** evaluates an actual source-to-load route with shared downstream currents, conductor/neutral drops, losses and independent capacity checks. Enter impedance and ampacity evidence. Running and starting assumptions remain explicit. Missing data produces an incomplete result, not a default pass.

**Renewables & Storage** accepts entered PV/wind profiles, inverter/grid power limits, battery reserves, dispatch strategies and optional actual-time outage ranges. Supply, transfer/island/black-start evidence and entered priorities constrain backup service. Per-step physical conservation separates import, export, curtailment, storage losses and unmet demand. **EV & Flexible Loads** supports explicit charging energy or SOC-derived requirements, charger/vehicle/minimum power, one/three-phase constraints, deadlines and generation-following or price priorities. Previewed application creates actual dated load schedules.

## Comparisons, imports and reports

Scenario creation freezes its source baseline. Field-level comparisons can apply selected differences through validation and Undo. Sensitivity studies calculate independent copies. **Dated engineering comparison** evaluates both input sets over the same explicit period (up to 31 elapsed days), with an optional common outage. It separately labels design current, interval demand, starting capacity, physical energy, storage losses, feeder loss at the start instant, costs and entered-factor emissions. Missing evidence is unavailable; different currencies are not subtracted. Export the actual comparison as CSV/JSON.

Native/CSV imports expose **New project**, **Merge into current project**, and **Replace current project contents**. Merge assigns fresh object IDs and remaps dependencies while retaining the destination supply/tariff/energy settings. Replacement keeps the destination project identity and remains undoable. CSV column mapping and explicit W/kW/VA/kVA/A rating units are available before Apply. Canonical CSV numbers use decimal points; interactive German numeric entries use decimal commas. List inputs use semicolons to avoid confusing decimal commas with separators.

**Reports & Estimates** exposes 16 report sections and editable report metadata. Save metadata, choose sections and **Freeze report preview**. PDF, print, snapshot JSON and report CSV exports use that immutable reviewed revision. Calendar, renewable dispatch and EV sections use actual completed runs; absent evidence is labelled unavailable. A project edit invalidates older analysis evidence. The model-derived BOM leaves unknown prices blank; enter prices, labour, waste and contingency, review the resulting bill changes and apply them explicitly. Manual bill lines are preserved.

## Display and recovery controls

Navigation groups collapse. Desktop split handles resize navigation and inspector; keyboard arrows/Home/End or the Settings sliders provide alternatives. Settings remembers widths, detail mode and motion choices; **Reset layout** restores accessible defaults. Simple mode explains core quantities and collapses advanced assumptions while keeping failed/incomplete checks visible. **Paused** stops ongoing decorative animation and timeline playback. Each chart has a data-table alternative.

Workspace restore validates the complete archive and integrity digest before applying one transaction. Restore as copies remaps project relationships and embedded references; preserve-if-absent never overwrites an existing project or silently bypasses a trash record. Save measurements before backing them up. Invalid raw import text is not represented as saved engineering evidence. Keep downloaded backups outside browser storage.

## POWERGRID LAB — PV source performance

At [POWERGRID LAB](https://adigunpowerlab.hephzibahbehulah.com/#POWERGRID), scroll past **Why step up voltage?** and **Radial feeder** to **PV source performance experiment**. Enter array DC nameplate, plane-of-array irradiance, module temperature, cell-to-module temperature rise, power temperature coefficient, inverter efficiency and inverter AC rating. The live readings show cell temperature, temperature correction, DC output, AC power before and after the inverter limit, conversion loss and clipping.

Use **Save current case as reference** before editing to compare AC output. **Save inputs locally** stores only this worksheet's inputs in a separate browser key. JSON includes input values, results and the two model references; CSV contains the calculated instruments. Invalid values suppress save/export. Open **Model assumptions and limits** for the Sandia and NREL references and the explicit limits: this is an instantaneous, entered-value estimate without weather, annual energy, shading, IV curves, mismatch, wiring losses, transient behavior or degradation.

## POWERGRID LAB — regional teaching scenarios

At the top of the lab, choose **Nigeria-inspired** or **Germany-inspired · 50Hertz grid-area example**, review the panel's source links, dates and scope, then apply the preset. Nigeria displays NERC-cited 50 Hz, `NGN`, `Africa/Lagos`, and nominal 330/132/33/11 kV stages; **Apply 132 / 330 / 33 kV stages** updates only those existing fields, preserving the generator and consumer voltages. Germany displays 50 Hz, `EUR`, `Europe/Berlin`, documented 380/220/110 kV levels, 0.4 kV service, and 20 kV as an illustrative value within the cited 15–30 kV medium-voltage range; its Apply button updates 220/380/110/0.4 kV while preserving the generator voltage. Neither scenario adds a complete transformer chain or local generation, weather, demand or household profile. Frequency is context only. These are regional teaching contexts, not operational grid replicas.

## POWERGRID LAB — wind resource and generation

Below the PV worksheet, open **Wind resource and generation experiment**. The editable lesson starts with six equal-duration wind-speed intervals. Enter comma-separated speeds from 0 to 30 m/s, an interval duration up to 24 hours and an integer count of identical reference turbines. The NREL 6 MW (2015) reference curve is linearly interpolated for each interval. Read per-turbine and farm output, interval energy, total energy, mean power and profile capacity factor. Save stores these lab inputs in this browser. JSON includes source-labelled inputs/results; CSV contains the calculated interval readings. Refresh reloads saved inputs; Reset returns to the lesson sequence.

The curve is from Appendix D of [NREL/TP-6A20-67414](https://www.nrel.gov/docs/fy17osti/67414.pdf). It describes a research reference turbine, not commercial equipment or a site-specific forecast. The entered wind sequence is an analytical teaching profile, not measured local weather. Air-density and hub-height correction, wakes, availability, electrical losses, curtailment, storage and dispatch are not included.

## POWERGRID LAB classroom dispatch

Open the isolated lab from **POWERGRID LAB** in the top bar or by entering `#POWERGRID`. The **Microgrid dispatch laboratory** accepts aligned comma-separated wind-speed, solar-irradiance, total-demand and critical-demand values for equal-duration intervals. Enter PV array/inverter ratings, wind turbine count, duration, battery capacity, starting/reserve SOC, charge/discharge power and efficiencies, plus generic dispatchable backup capacity and its per-interval ramp-up ceiling. The table reports modelled PV/wind supply, battery action and SOC, backup, curtailment, served load and unmet critical/non-critical demand.

Use **Save scenario locally** to keep this independent lab case in the current browser, **Export dispatch JSON** for inputs and full results, or **Export intervals CSV** for the actual row values. **Reset inputs** restores the classroom example. The lists must have matching lengths; fix all validation messages before saving/exporting. The example is illustrative, not measured site data. Backup is not a source-specific generator model. The calculation is an AC-bus balance; it does not solve network losses, export, fuel, cost, emissions or frequency response. See `POWERGRID_MODELS.md` for the exact equations and limitations.

### Hydropower head and flow

In POWERGRID LAB, enter net head after waterway losses, turbine flow, combined turbine-generator efficiency and installed electrical rating. Read the hydraulic power, conversion output and available generator power after the rating limit. Save the inputs in this browser or export the inputs and results as JSON.

To include hydro in Microgrid dispatch, type one comma-separated turbine-flow value per demand interval, then enter net head, efficiency and rating. The interval table and both exports include available hydro power. Clear the flow profile to omit hydro.

For reservoir hydro, also enter one inflow value per interval and set reservoir capacity, initial volume and environmental bypass. The model uses the entered turbine schedule. In reservoir mode, Hydro net head is the head at empty storage. Enter the extra head at full storage to interpolate linearly from the starting volume of each interval, or keep the rise at zero for fixed head. Inspect reservoir storage, spill and bypass shortage in the interval table. Exports also include actual turbine and bypass volumes.

Set a positive pumped storage capacity in Microgrid dispatch. Enter initial hydraulic energy, pump and generator limits, and their efficiencies. The interval table and exports report pump input, recovered power, stored energy, and losses. This energy-equivalent model is separate from the natural-inflow reservoir water balance.

[U.S. Department of Energy — Pumped storage hydropower](https://www.energy.gov/cmei/water/pumped-storage-hydropower)

Set grid import and export limits and enter optional comma-separated outage intervals starting at 1. During these intervals the shared bus uses local resources and both grid flows are zero. The connection state and grid exchange appear in the interval table and exports; totals report imported and exported energy.

Enter backup outage interval numbers independently of grid outages. The backup unit produces zero during an outage and resumes under the ramp-up limit from zero. Backup headroom is the unused output within the current interval limit, a planning metric that carries no spinning-reserve or response-time claim.

Enable thermal backup to enter net heat rate in MJ of fuel per kWh of net electricity. Optionally enter a direct CO₂ factor in kg/GJ on the same heating-value basis. Fuel equals generated electrical energy times heat rate. Direct CO₂ equals fuel energy in GJ times the factor. See [EIA on heat rate](https://www.eia.gov/tools/faqs/faq.php?id=107).

Enter startup fuel per start and optionally set initial fuel inventory in MJ. The model counts startup when generation rises from zero, includes it in total fuel and direct CO2, and consumes fuel only when the unit delivers power. An empty inventory field assumes unlimited fuel. A specified zero inventory supplies no power.

Use **Minimum stable backup output** to keep the unit off when remaining load, ramp capability or available fuel cannot support that output. Skipped starts use no fuel.

For a linear fuel curve, enter the fixed **Running fuel intercept** in MJ/h and use the heat rate field for the incremental fuel rate in MJ/kWh. The intercept is charged during intervals in which the generator produces power.

Select **Use diesel curve in dispatch** to transfer the diesel worksheet's rating, minimum output, fuel curve and initial inventory. Review the dispatch ramp and startup fuel settings before running the scenario.

In Microgrid dispatch, choose Load rural microgrid teaching scenario to replace the current form with six four-hour intervals for a fictional clinic and rural community. Edit the assumptions before saving or exporting. Loading the scenario leaves the previously saved dispatch inputs available until you save again.

Open Germany: historical load and generation beside the regional presets. Compare one-hour MWh values for 18 June 2025 in CEST. The final column subtracts PV and both wind categories from reported load. Use Export historical JSON to retain the observations, time zone, source URLs and CC BY 4.0 attribution. The comparison uses national data and leaves dispatch inputs unchanged.

Choose Load scaled German historical day inside Microgrid dispatch. The preset uses 24 one-hour intervals. Each 1,000 MWh reported during an hour becomes 1 kW of teaching power, and wind combines the two reported categories. Critical demand starts at 20% of scaled load as an editable assumption. Compare storage and backup behavior or export JSON with provenance.

Select 22 January 2025 (CET) or 18 June 2025 (CEST) in the historical table. In dispatch, choose Load scaled German winter day for January or Load scaled German historical day for June. The two daily examples share the same scale and one-hour intervals.

Select the reservoir, turbine, generator, step-up transformer or tower in the 3D scene to highlight shared equipment in the hydro drawings. Selecting it in a hydro drawing also updates the 3D inspector. The receiving transformer links the 3D and downstream views.

On narrow screens, scroll down from the camera controls to the equipment buttons and inspector. Both remain available through the keyboard, including when the schematic substitutes for the WebGL view.

In Meshed AC power flow, edit the load, generator or A–B transformer tap and phase shift. Open one branch to see a connected contingency. Isolating a bus stops the solve and disables export. The tables show voltages, net bus injections, and power entering each line end. The solver converts a PV bus to PQ at the first violated reactive limit and holds it there for the remainder of that solve.

Choose Compare single branch outages in the meshed AC experiment. The comparison opens one currently active branch per case, using 0.95–1.05 pu for voltage screening and the greater line-end MVA against your entered rating. Export AC results includes the comparison while it is displayed.

In Primary frequency response, start with the 50 Hz example and change aggregate inertia, generation loss, droop or reserve. Read the initial rate of change, the lowest modeled frequency and the final plotted sample. Export frequency trace includes the input assumptions and numeric samples. The chart ends early if the deviation crosses the 5% teaching model boundary.

For the step-up transmission worksheet, add an optional experiment name and student notes before saving. Export lab report PDF captures the current worksheet, including the selected regional preset if available. The report contains the objective, voltage stages, entered power and resistance, calculated readings, loss comparison, equation, assumptions and notes.

Use Import scenario JSON to preview an earlier transmission worksheet. Apply imported scenario replaces the editable inputs. Save experiment locally updates the saved browser copy. Version-1 exports restore electrical inputs, and version-2 exports also carry the name, notes and preset. Readings are recalculated from the validated inputs.

For workspace recovery, save the transmission experiment and choose All local projects in Settings → Workspace backup & restore. The backup preview lists included transmission experiments. After restoring, open PowerGrid Lab and choose Show recovered experiments. Select a copy, review its inputs, and apply it when ready. Save experiment locally to make it the saved worksheet.

Use Undo transmission edit and Redo transmission edit while the worksheet is open. The history includes ordinary inputs, notes, presets, applied imports and reset. It keeps up to 40 edits per open session. Editing after an undo clears the redo path. Closing the worksheet clears its edit history, and saving is a separate action.

Open Saved transmission revisions to preview one of the last 20 saved versions. Apply a revision to the worksheet, then save it explicitly if you want it to become the new saved version. Saving unchanged inputs and metadata adds no revision. All-project backups include earlier revision contents as recoverable experiment copies.

Choose Set comparison baseline before changing the transmission scenario. Duplicate transmission experiment appends a copy label to the working name and retains the inputs and notes. The comparison shows current minus baseline for power, both voltages, both currents, and both line losses. Export scenario JSON includes the baseline and differences while pinned. The open comparison lasts for the session. Save explicitly to retain the named variation as the current saved worksheet.

In Radial feeder, choose Review active project demand. Inspect the project name, revision and the calculated active and reactive design power, then select the downstream group to replace. This uses a balanced constant-PQ equivalent of the project’s design load. Positive demand, valid AC loads and known reactive power are required. Save the lab if you want to keep the transfer. Solved scenario JSON retains the project ID, revision, engine version and capture time. Manually editing the group's active or reactive power clears its source attribution.

In Microgrid dispatch, choose Review active project demand day and inspect the recurring hourly active demand. Apply recurring demand loads a 24-hour scenario with zero wind, solar irradiance and critical demand to start. Edit the remaining assumptions as needed. JSON includes the original hourly values and source project ID, revision, engine version and capture time. The profile represents a recurring day and excludes calendar exceptions and start events.

In the installed production app, let the offline cache finish preparing while connected. You can then open **POWERGRID LAB** for the first time while offline and download the transmission comparison PDF.

In **Practical lesson: Poor power factor**, predict how correcting power factor will affect line current and conductor loss. Reveal the worked reference, choose **Load or reset lesson inputs**, and pin the resulting case as the baseline. Set **Power factor** to 1, compare the readings, enter your interpretation in the transmission notes, and export the PDF. Loading or resetting the lesson updates the open transmission worksheet. Use Undo to recover your previous inputs.

Open **Practical lesson: Transmission distance** beneath the radial feeder. Make a prediction and reveal the 5 km and 25 km reference results. Change the line length between 1 and 40 km to find where the receiving voltage falls below 10.45 kV. Add your interpretation and download the JSON report. The report includes both solved cases. Reset clears the interpretation and returns the length to 25 km.

Under **Practical lesson: Feeder trip**, reset the radial training case and set a comparison reference. Open the main north feeder, then open the north lateral and reclose the main feeder. Compare the disconnected groups and unserved load after each switch change. Export the solved JSON to capture partial restoration and its reference, then reclose the lateral.

In **Practical lesson: Transformer loading**, predict what happens to loss and efficiency when you double the apparent load. Reveal the 500 kVA reference and try 1,000 kVA, then a value above the nameplate rating. Compare two power factors at the same kVA. Download the JSON report to keep the current readings and the reference, or reset to 500 kVA at power factor 0.8.

In **Microgrid dispatch laboratory**, load the midday solar lesson and raise the grid export limit from 0 to 10 kW. Compare grid export and curtailment in the first interval. Then load the evening peak lesson and vary the starting battery charge and power limit. Check battery discharge and unmet critical and noncritical load in the second interval. Use the lesson load button again to reset its inputs, or export the interval CSV or dispatch JSON to compare runs.

In **Microgrid dispatch laboratory**, load **Generator outage**. Compare headroom before the trip, unmet demand in interval 2, and generator output on restart in interval 3. Export the run, clear **Backup outage intervals**, and export the uninterrupted case for comparison. Use the lesson load button again to restore the worked inputs.

In **Practical lesson: Regional comparison**, reveal the reference and then double **Line resistance per phase** in the transmission worksheet. Compare each region's base and raised-voltage readings. Download the JSON to keep both cases and their source references. The lesson reset restores shared power, power factor and resistance.

In **Capstone: Community supply design**, load the rural case and pin the reference. Try the 30 kW backup design, then simulate losing backup in interval 5. Compare critical energy unserved, explain which resource covers demand and which risk remains, and export **Dispatch JSON**. Export before leaving the worksheet to keep your justification and pinned reference with the solved data.

In **Practical lesson: Microgrid operation**, load the rural operating case and reveal the worked result. Reduce the battery power limit and look for intervals with more backup generation or unmet demand. Download the microgrid operation report to compare the edited and reference runs. The lesson load button restores the reference inputs.

At the top of POWERGRID LAB, use **Source to socket** to predict where voltage changes. Edit a worksheet voltage and trace it through the route and equipment diagrams. In **Why step up voltage?**, change the higher transmission voltage and compare current and loss. Enter your explanation in **Student notes** before exporting the lab report PDF. **Restore worked transmission inputs** resets the worksheet values while keeping your notes.

Select a piece of equipment to inspect its field photo or play the powerhouse footage. The **Test voltage** slider compares current and conductor loss against the 132 kV reference without editing the saved worksheet.

With a transformer selected, edit a worksheet voltage to see the selected equipment’s terminal voltages and output-to-input ratio update beside its photo.

Watch the step-up transformer installation in **Why step up voltage?**. Move the test slider and compare the current and loss bars against the 132 kV reference.

In **Transmission distance**, load the 5 km or 25 km case, then sweep the length slider while comparing sending and receiving voltage. Use the numeric field for a precise distance and export the solved case with your notes.

In **Poor power factor**, try a value between 0.80 and 1.00 and observe the current and loss readouts. To report the comparison, first load and pin the worked baseline, then apply the trial setting to the worksheet and export.

In **Transformer loading**, use the load presets or slider to compare core and winding losses. Watch the rating meter and compare the calculated overload case with the ideal transformer.

In **Solar at midday**, **Evening peak**, and **Generator outage**, select an interval to inspect the worked dispatch. Compare served demand, charging or discharging, generation, curtailment and unmet loads. Load the case into the dispatch worksheet to edit inputs or export the run.

In **Feeder trip**, use the switch map to open and reclose a branch. The solver marks each downstream group as supplied or disconnected. The map and feeder worksheet controls operate the same switches.

In **Microgrid operation**, select a four-hour interval to see the battery state of charge, charge and discharge power, generator output and unmet critical demand. Load the worked day to try a different battery power limit.

In **Regional comparison**, switch the shared phase resistance from 5 Ω to 10 Ω. Compare both raised-stage loss meters and use the table to inspect the underlying current and voltage values.

In **Community supply design**, load the worked 30 kW backup case and pin it. Test a backup outage in interval 5 and compare evening supply and unmet critical demand against the pinned design before exporting your justification.

On Overview, **Explore the workspace** groups illustrated links by menu section. In **Cables & Protection** and **Motors & Supply**, play the credited field footage and select **Go to the calculator** to try the exercise with editable inputs.

In **Renewables & Storage**, watch the solar and battery microgrid footage, then compare two battery capacities using the same solar and load profiles.

In **EV & Flexible Loads**, watch a fleet charging demonstration. In the planner, move departure earlier with the same charger limit and compare unmet energy.

In **Power Quality**, watch the capacitor bank demonstration, open **Power-factor correction**, and compare kvar requirements at displacement power factor targets of 0.95 and 0.98.

In **Single-Line Studio**, watch a transformer installation and trace a supply node through the project diagram. In **Schedules & Simulation**, watch a winter demand response and find the peak on a simulated demand curve.

In **Load Schedule**, watch a backup generator installation and compare load quantity with installed power and daily energy. In **Boards & Circuits**, watch a breaker inspection and compare design current with the entered breaker rating in a reference circuit.

In **Scenarios & Optimization**, watch a hybrid microgrid case study and compare a changed load schedule with a saved baseline. In **Equipment Library**, watch a generator inspection and compare an equipment record's ratings with the resulting project load.

In **Costs & Carbon**, watch the utility explanation and compare estimates at two demand charges using the same energy price and schedule.

In **Reports & Estimates**, the Engineering report includes a short recording of the report workflow. Choose report sections, freeze the preview, then review the frozen revision before exporting.

In **Settings**, watch the workspace backup recording, select the project scope and revision history, and export a file to keep outside browser storage.

In **History & Issues**, watch the revision comparison recording. Choose an earlier revision to inspect changed inputs and select individual fields if you want to restore them.

In **Help and Guide**, the search recording shows how to find a matching guide and jump to its workspace.

In **Engineering Toolbox**, watch a clamp meter demonstration and compare simulated current at two power factors. In **Engineering Reference**, watch the three-phase explanation and use the balanced power equation to predict line current.

In **Adigun BOT · Transmission worksheet**, preview a 10% increase and inspect the before/after values. Confirm to apply it, or cancel to keep editing. A worksheet edit or undo invalidates the open preview. Use **Undo transmission edit** to revert an applied proposal. **Export current lab report** downloads the current worksheet results.

Select equipment in the station model and open **Explain selected station equipment** in the lab BOT. The explanation follows the station selection and describes the component's role and interfaces.

In **Adigun BOT · Dispatch explanation**, select an interval and compare the deficit after renewables with the battery power limit and energy available above reserve. Check the supplied battery power and both unmet load readings. Edit the worksheet to see the explanation update for the selected interval.

With **Compare single branch outages** enabled, changing the meshed case recomputes the comparison. Wait for the updated table before exporting. Turn comparison off to cancel it and export the base case alone.

To include baseline readings and signed differences in the transmission PDF, pin the original worksheet before editing and then export the report. The PDF captures the comparison as it stood when you clicked Export.

Open **POWERGRID LAB** at the far right of the top bar. With the launcher focused, press Enter to open the lab.

If PowerLab shows **Save failed**, opening POWERGRID LAB and returning with browser Back keeps the customer draft available in the same tab. Use **Export project** in the save-failure alert to keep a recovery copy.

Valid transmission edits are autosaved as a browser draft. When reopening the lab, choose **Restore transmission draft** or **Discard transmission draft** to resume autosave. Restore applies the draft to the worksheet and can be undone. Use **Save experiment locally** to update the named saved copy before creating a workspace backup.

Scroll to the navigable station model to start its 3D renderer. You can use Tab and the arrow keys to move the camera controls. If WebGL is unavailable, use the equipment list and station schematic.

Open **Compare with an ideal transformer** in the transformer loading lesson to compare the same load and rating with zero core and winding losses. Both cases are in the JSON report. At zero load the ideal efficiency is undefined.

In **Solar thermal power tower**, change direct irradiance, aperture or efficiencies and compare incident power, collected heat and available output. Compare the 800 W/m² reference with 100 W/m² to see the minimum stable load cutoff. Use the JSON export for the current inputs and outputs.

In **Tidal stream turbine**, change current speed from 2 m/s to 1 m/s and compare flow power. Try the cut-out speed to see why electrical potential can remain positive while available output falls to zero. Export the current tidal stream results as JSON.

In **Binary-cycle geothermal generation**, vary brine flow or the production and reinjection temperatures. Compare recovered heat, gross potential, rating-limited output and net output. A negative net value means the entered plant auxiliaries require power from outside the plant. Reset or export the case as JSON.

In **Deep-water wave energy**, vary significant wave height and energy period. Compare wave power per metre with the electrical output after capture and conversion. Raise wave height to the entered shutdown limit to see available output fall to zero.

In **Gas and steam combined cycle**, change heat recovery or the gross generation request. Compare gas turbine output, recovered heat and steam generation. Enter a request below the minimum stable load to see that standby auxiliaries still require power. Export the current case as JSON.

Use **Use combined cycle in dispatch** to transfer the fuel-flow-limited net rating, net minimum load and running auxiliary fuel equivalent. The dispatch model accounts for these auxiliaries while generating. Add any standby electrical demand to the dispatch load profile if you want it included during offline intervals.

In **Hydrogen fuel cell generation**, change starting inventory or interval duration and compare fuel-limited DC potential with available AC. Change the inverter rating and inspect how much hydrogen remains. Export the current case as JSON.

In **Biogas engine and heat recovery**, vary methane fraction, available dry biogas flow and useful heat demand. Compare recoverable heat with heat supplied to demand, and gross electricity with net output after plant load. Export the case as JSON.

In **Solid biomass steam generation**, hold wet feed and dry fuel heating value constant, then increase wet-basis moisture. Compare used fuel, steam heat and net electricity. Reset or download the JSON report.

In **Diesel generator fuel curve**, adjust the requested power or initial inventory. Compare available power with actual output, running fuel rate and remaining diesel. A fuel-limited case below minimum stable load shuts down for the modelled interval.

In **Coal steam generation**, adjust coal inventory, plant capacity, or net heat rate. Use the same heating-value basis for net heat rate and coal heat content. Compare net generation and coal remaining, then export the inputs and results as JSON.

Choose **Use coal inventory in dispatch** to transfer plant capacity, heat rate and initial fuel energy to the chronological worksheet. The calculation converts coal tonnes to MJ using the entered heating value.

In **Nuclear steam generation**, adjust the heat supplied to the steam cycle and compare gross generation with net grid power. A negative net reading indicates electricity imported to cover on-site use in the teaching case.
