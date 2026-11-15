# POWERGRID LAB acceptance record

## Milestone 1 — deployed; focused acceptance passed

Acceptance is limited to the checks reported for the reviewed revision. A passing component test or build does not mark the complete lab or later milestones accepted.

## Practical equipment gallery — PR #97 deployed

| Requirement                                                                                                       | Evidence target                                                      | Status                                                                                        |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Stage-matched views for hydro, steam/gas, transformer/switchyard, transmission, distribution and test equipment   | Browser image-load checks and review of the rendered #POWERGRID page | Candidate and exact-main gates passed; deployed; route and all seven images returned HTTP 200 |
| Checklist names typical equipment and explains its purpose at each stage                                          | Help search/translation tests, user guide review and rendered page   | Candidate and exact-main gates passed; Help and manual deployed                               |
| Training renders are distinguished from photographs; operating limits and energized-work cautions remain explicit | Alt/caption review, Help, manual and accessibility checks            | Deployed; illustrations are labeled as training images and safety limits are stated           |

| Requirement                                                          | Evidence target                          | Status                                                                            |
| -------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------- |
| Exact `#POWERGRID`, refresh, Back/Forward                            | Candidate and exact-main browser suites  | Passed                                                                            |
| Right-side header link, isolated state and branded schematic         | Full browser suite and live public route | Passed; lab uses its own storage key                                              |
| Formula, default reference values, bounds and invalid-state behavior | Numerical tests and full browser suites  | Passed                                                                            |
| Local save/reload and real JSON/CSV exports                          | Browser acceptance                       | Save/reload plus parsed JSON and CSV content assertions passed in PR #91          |
| Help, four locales and manual                                        | Search/translation coverage; user guide  | Passed in candidate and exact-main gates                                          |
| Template, accessibility, responsive and regression checks            | Review and repository release gates      | General regression gates and the explicit 390 × 844 PowerGrid layout check passed |

Candidate [run 43628170719](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43628170719), exact-main [run 43628826181](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43628826181), and Pages [run 43629332412](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43629332412) all passed. The public `#POWERGRID` route rendered during browser inspection. PR #91 candidate [run 43633459567](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43633459567), exact-main [run 43634068700](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43634068700), and Pages [run 43634569359](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43634569359), artifact 14129153822, passed. This acceptance record covers Milestone 1 only; remaining milestones stay open.

## Not part of Milestone 1

General network load flow, meshed topology, dynamic simulation, generation/resource forecasting, regulatory compliance, hardware validation and the remaining owner-prompt milestones are not claimed complete.

## Owner-directed hydro station visual slice — pending hosted validation

| Requirement                                                                                                                              | Evidence target                                                                | Status                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------- |
| Recognizable hydro process cutaway with waterway, turbine, shaft and generator                                                           | Source-linked custom SVG; manual and curriculum                                | Implemented in candidate; browser gate pending |
| Explicit 3-phase path, generator/transformer example windings and terminals, switchyard protection devices, bus, tower and overhead line | Equipment selection panel plus distinct one-line                               | Implemented in candidate; browser gate pending |
| Control house, SCADA/protection panel, breaker, disconnector, earth switch and surge arrester inspection                                 | Selectable equipment drawings, terminal descriptions and no-telemetry boundary | Implemented in candidate; browser gate pending |
| Separate generator neutral, protective earth and overhead shield wire; phase colors identified as schematic only                         | SVG labels, terminal descriptions and browser interaction assertions           | Implemented in candidate; browser gate pending |
| Four-locale equipment descriptions, keyboard interaction and narrow-screen local scrolling                                               | Browser tests, Help and user guide                                             | Implemented in candidate; browser gate pending |

The cutaway and delta/wye grounding topology are illustrative, explicitly not an as-built station. They do not add simulated plant ratings or fabricate site-specific values. The receiver substation, distribution, house and industrial machinery scene is still open work.

## Milestone 2 — radial feeder workflow deployed; scoped acceptance passed

| Requirement                                            | Candidate evidence                                                                   | Status                                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Balanced radial AC power flow with multiple load buses | Backward/forward sweep; six focused numerical tests                                  | Solver and workflow deployed; six numerical tests and hosted acceptance passed |
| Bus voltage, branch current, P/Q transfer and losses   | Editable multi-feeder training scenario with solved bus and branch instruments       | Hosted candidate and exact-main browser acceptance passed; deployed            |
| Voltage/thermal constraints and feeder outages         | Editable limits and in-service switches; unserved consumer groups reported           | Hosted candidate and exact-main browser acceptance passed; deployed            |
| Saved comparison and actual JSON/CSV exports           | Separate local save key, captured reference case and file-content browser assertions | Hosted candidate and exact-main browser acceptance passed; deployed            |
| Expanded lesson and Help in four locales               | Radial feeder lesson, model assumptions and translated Help                          | Hosted four-locale browser acceptance passed; deployed                         |

The UI uses an explicitly balanced, fixed-voltage training source and constant P/Q loads; it is not a meshed, dynamic, forecasting or protection study. PR #92 candidate [run 43635520709](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43635520709), exact-main [run 43636068361](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43636068361) and Pages [run 43636663764](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43636663764), artifact 14130169246, passed. The live public feeder section was browser-checked. This acceptance covers the stated M2 requirements only; M3–M6 remain open.

## Milestone 3 — source-specific PV model foundation (partial)

| Requirement                                       | Candidate evidence                                                                                                                | Status                                                                                                                                                                                                                      |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PV irradiance and temperature response            | NREL PVWatts-style DC relation and Sandia steady-state cell-temperature relation                                                  | Engine and interactive worksheet implemented; hosted validation pending                                                                                                                                                     |
| Inverter conversion and AC clipping               | Explicit efficiency and AC nameplate inputs with separate loss readings                                                           | Implemented; hosted validation pending                                                                                                                                                                                      |
| Renewable resource profile and regional scenarios | Entered-value PV remains site-neutral; Nigeria preset is deployed; the Germany 50Hertz-area scenario has a candidate browser case | Nigeria passed candidate and exact-main acceptance; Germany selector/application/source checks await this candidate's hosted run. No regional profiles or frequency simulation; other regional/custom scenarios remain open |

The PV worksheet is an instantaneous user-entered model only. The Nigeria-inspired scenario has one focused unit test and browser coverage for displayed provenance, field application/preservation and its source link. Its source and simplifications are recorded in [`POWERGRID_DATA_SOURCES.md`](POWERGRID_DATA_SOURCES.md). This does not complete Milestone 3's source catalogue, remaining regional presets, chronological dispatch changes, renewable variability or critical-load requirements.

## Downstream receiving-substation scene — deployed

| Requirement                                                                                                                       | Evidence target                                                     | Status                                                       |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------ |
| Receiving bay, switching, CT/VT, arrester, step-down transformers, MV feeder/recloser, LV pillar, home meter/board, MCC and motor | Interactive browser scene and selectable inspection card            | Deployed; candidate and exact-main full browser gates passed |
| Editable worksheet voltage labels and separate L1/L2/L3, N and PE                                                                 | Browser test edits raised voltage and inspects neutral/PE terminals | Hosted browser acceptance passed                             |
| Four-locale Help and usage documentation                                                                                          | Help search/translation tests and user guide                        | Deployed; full candidate and exact-main gates passed         |

## Milestone 4 — additional generation plant studies (partial)

| Requirement                                                                                                   | Evidence target                               | Status                                                     |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------- |
| Select combined-cycle, utility PV and wind scenes with stage-specific equipment images                        | Image-load and plant-selector browser test    | Deployed; candidate and exact-main repository gates passed |
| Inspect representative equipment purpose and process/electrical interfaces using keyboard-accessible controls | Component detail browser coverage             | Deployed; candidate and exact-main repository gates passed |
| Source references and distinguishable custom illustration provenance                                          | DOE source links, captions, alt text and Help | Deployed; candidate and exact-main repository gates passed |
| Four-locale navigation and Help; lazy-load inactive large plant images                                        | Locale browser test and asset inspection      | Deployed; candidate and exact-main repository gates passed |

The plant images are custom teaching illustrations, not photos of operating facilities. Interface descriptions are representative; no site-specific ratings, terminals or plant-performance calculation are asserted. PR #101 candidate [run 43671901034](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43671901034), exact-main [run 43672370263](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43672370263), and Pages [run 43672795456](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43672795456) passed; artifact 14145151948 deployed merge SHA c563b83aed43d6c314ebcb8c6187cfdd320a590a. Browser checks confirmed all three plant images load, component inspection/keyboard access and four-locale captions. The deployed route loaded with the generation selector. M4 remains partial: synchronized 3D scenes and remaining visual performance/accessibility acceptance and prompt requirements remain open.
| Model boundary and topology caveats | Scene labels, Help and manual | Deployed; states illustrative topology and excludes protection/downstream load-flow simulation |

PR #99 merged as `01c6ea20c437ce983fa5a261819f2a014d7998d4`. Candidate run [43667440603](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43667440603), exact-main [43667924456](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43667924456) and Pages [43668393758](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43668393758) passed. Artifact 14143043216 deployed that exact main SHA. Both public routes and the served bundle returned HTTP 200; the bundle contains the scene and four-locale labels.

## Milestone 3 — NREL reference-wind model slice

| Requirement                                                                   | Evidence target                                                                            | Status                                              |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Source-backed wind turbine curve with explicit model identity and boundaries  | Attributed NREL reference curve; independent table-point/interpolation tests               | Implemented in candidate; hosted validation pending |
| Editable chronological resource input and interval generation/energy readings | Browser input, recalculation, validation, save/reload and content-checked JSON/CSV exports | Implemented in candidate; hosted validation pending |
| Four-language user workflow and documented limits                             | UI translations, Help coverage, curriculum and user guide                                  | Implemented in candidate; hosted validation pending |

This slice uses user-entered equal-duration wind speeds and an analytical teaching sequence. It is not local weather, a commercial turbine guarantee, annual yield, battery dispatch or a complete regional scenario. The remaining Milestone 3 requirements stay open.

## Milestone 3 slice — chronological microgrid dispatch (PR #104)

| Requirement                                                                  | Evidence target                                                            | Status                                           |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------ |
| Combine source-modelled PV/wind with equal-length demand profiles            | Existing PV/NREL wind calculators, validation and interval results         | Implemented locally; PR candidate checks pending |
| Battery SOC, charge/discharge power, efficiency and reserve limits           | Independent numerical tests for limits, stored energy and SOC              | Implemented locally; tests pass                  |
| Critical-load priority, curtailment, generic backup ramp-up and unmet demand | Explicit dispatch sequence and per-interval result model                   | Implemented locally; tests pass                  |
| Interval energy accounting                                                   | Per-row residual and served/unserved identities                            | Implemented locally; targeted checks pass        |
| Student workflow, isolated local saving and real JSON/CSV exports            | Browser acceptance for editing, validation, save/reload and export content | Implemented locally; browser acceptance pending  |
| Help/Guide, four supported locales and release records                       | Help strings, workflow coverage, user guide and exact-main/Pages receipts  | In progress                                      |

The backup is only an explicitly generic dispatchable capacity ceiling with a ramp-up constraint; it is not a diesel or other source-specific generator model. The AC-bus schedule excludes feeder/transformer losses, imports/exports, fuel, costs, emissions and frequency response. This slice does not finish Milestone 3.

