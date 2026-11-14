# POWERGRID LAB acceptance record

## Milestone 1 — deployed; two focused checks remain

Acceptance is limited to the checks reported for the reviewed revision. A passing component test or build does not mark the complete lab or later milestones accepted.

| Requirement                                                          | Evidence target                          | Status                                                                                              |
| -------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Exact `#POWERGRID`, refresh, Back/Forward                            | Candidate and exact-main browser suites  | Passed                                                                                              |
| Right-side header link, isolated state and branded schematic         | Full browser suite and live public route | Passed; lab uses its own storage key                                                                |
| Formula, default reference values, bounds and invalid-state behavior | Numerical tests and full browser suites  | Passed                                                                                              |
| Local save/reload and real JSON/CSV exports                          | Browser acceptance                       | Save/reload and CSV passed; PR #91 adds a JSON content assertion, hosted result pending             |
| Help, four locales and manual                                        | Search/translation coverage; user guide  | Passed in candidate and exact-main gates                                                            |
| Template, accessibility, responsive and regression checks            | Review and repository release gates      | General regression gates passed; PR #91 adds an explicit mobile layout check, hosted result pending |

Candidate [run 43628170719](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43628170719), exact-main [run 43628826181](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43628826181), and Pages [run 43629332412](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43629332412) all passed. The public `#POWERGRID` route rendered during browser inspection. This acceptance record covers Milestone 1 only; remaining milestones stay open.

## Not part of Milestone 1

General network load flow, meshed topology, dynamic simulation, generation/resource forecasting, regulatory compliance, hardware validation and the remaining owner-prompt milestones are not claimed complete.

## Milestone 2 — radial-network workflow in progress

| Requirement                                            | Current evidence                                                   | Status                                                              |
| ------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Balanced radial AC power flow with multiple load buses | `src/engine/powergridRadial.ts`; five focused numerical cases      | Engine foundation implemented; hosted validation pending            |
| Bus voltage, branch current and complex branch power   | Backward/forward sweep with explicit tolerance and iteration limit | Implemented in the calculation engine; UI instruments pending       |
| Voltage and thermal constraints                        | Per-bus voltage limits and optional branch ampacity                | Implemented in the calculation engine; interactive controls pending |
| Outage and disconnected consumers                      | Open-branch island detection and served-load accounting            | Implemented in the calculation engine; UI outage workflow pending   |
| Scenario comparison and expanded lessons               | End-to-end browser workflow                                        | Not implemented                                                     |

This is a partial Milestone 2 slice, not milestone acceptance. The model boundary, constant-P/Q load assumption, radial topology requirement and exclusions are documented in [`POWERGRID_MODELS.md`](POWERGRID_MODELS.md).
