# POWERGRID LAB acceptance record

## Milestone 1 — deployed; focused acceptance passed

Acceptance is limited to the checks reported for the reviewed revision. A passing component test or build does not mark the complete lab or later milestones accepted.

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

| Requirement                                       | Candidate evidence                                                                                                        | Status                                                                                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| PV irradiance and temperature response            | NREL PVWatts-style DC relation and Sandia steady-state cell-temperature relation                                          | Engine and interactive worksheet implemented; hosted validation pending                                                                                      |
| Inverter conversion and AC clipping               | Explicit efficiency and AC nameplate inputs with separate loss readings                                                   | Implemented; hosted validation pending                                                                                                                       |
| Renewable resource profile and regional scenarios | Entered-value PV remains site-neutral; one sourced Nigeria-inspired voltage context applies only matched worksheet fields | One regional teaching context implemented; no weather, generation or demand profile and no frequency simulation; other regional/custom scenarios remain open |

The PV worksheet is an instantaneous user-entered model only. The Nigeria-inspired scenario has one focused unit test and browser coverage for displayed provenance, field application/preservation and its source link. Its source and simplifications are recorded in [`POWERGRID_DATA_SOURCES.md`](POWERGRID_DATA_SOURCES.md). This does not complete Milestone 3's source catalogue, remaining regional presets, chronological dispatch changes, renewable variability or critical-load requirements.
