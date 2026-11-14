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

## Milestone 2 — radial feeder workflow in candidate validation

| Requirement                                            | Candidate evidence                                                                   | Status                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Balanced radial AC power flow with multiple load buses | Backward/forward sweep; six focused numerical tests                                  | Solver merged; workflow validation pending             |
| Bus voltage, branch current, P/Q transfer and losses   | Editable multi-feeder training scenario with solved bus and branch instruments       | Implemented in candidate UI; hosted validation pending |
| Voltage/thermal constraints and feeder outages         | Editable limits and in-service switches; unserved consumer groups reported           | Implemented in candidate UI; hosted validation pending |
| Saved comparison and actual JSON/CSV exports           | Separate local save key, captured reference case and file-content browser assertions | Implemented in candidate UI; hosted validation pending |
| Expanded lesson and Help in four locales               | Radial feeder lesson, model assumptions and translated Help                          | Implemented; hosted browser validation pending         |

The UI uses an explicitly balanced, fixed-voltage training source and constant P/Q loads; it is not a meshed, dynamic, forecasting or protection study. M2 remains open until candidate, exact-main, production-browser and deployment evidence passes.
