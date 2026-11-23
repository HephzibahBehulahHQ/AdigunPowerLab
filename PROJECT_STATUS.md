# AdigunPowerLab — current status

## Backup restore acceptance correction

Combined-cycle main validation run 44941752932 stopped before publication when the backup browser test raced the automatic transition from Settings to Overview. A focused test correction now waits for the restored project to open, then inspects the recovered transmission case.


Date: 15 November 2026. Owner: Hephzibah Behulah.

## POWERGRID real facility photographs — deployed (15 November 2026)

PR [#106](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/106) merged as `a8065b686b2f4d509fcd9565fea1e217383e0f04`. Candidate [run 43701757144](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43701757144) and exact-main [run 43702250434](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43702250434) passed lint, unit tests, build, full browser and production-browser suites, update smoke, and root/base-path offline checks. Pages [run 43702809027](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43702809027) deployed that exact SHA (artifact 14157337347). Read-only live checks on 15 November returned HTTP 200 for the site root and all eight local photo assets. The documentary images remain distinct from custom training illustrations; the damaged tower is labeled as a failure case, and photo context, credits, use limits, and source links are documented.

## POWERGRID documentary field video studies — deployed (15 November 2026)

PR [#108](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/108) merged as `423d2f6bc8476c2c0c114d159087bc0cf1360a2a`. Candidate [run 43707815449](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43707815449) passed lint, unit tests, build, full browser and production-browser suites, update smoke and online/base-path offline checks. Exact-main [run 43708386457](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43708386457) passed the same gates. Pages [run 43708866207](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43708866207) deployed that exact SHA (artifact 14158854979). Four official DVIDS hydropower videos now appear as click-to-play studies with producer credits, source links, four-locale guidance and explicit limits: the footage is documentary context, not live telemetry, measured generation, connection evidence or proof of current conditions. Local live-host verification could not be completed in this session because DNS resolution for the custom host failed; the successful Pages deployment artifact is verified, while external availability remains unconfirmed here.

## POWERGRID spatial selection synchronization — candidate (15 November 2026)

The candidate connects the shared project-object selection to the existing perspective spatial graph. Selecting an object in either the single-line diagram or spatial view should highlight the same object in the other view and keep the common inspector aligned. Browser acceptance covers both directions, and Help now explains the shared selection in all supported locales. M4 remains partial: this change synchronizes object selection in the existing project graph; it does not claim a physically accurate station-scale 3D scene. Candidate verification is pending.

## POWERGRID Milestone 3 — chronological dispatch slice deployed (15 November 2026)

PR [#104](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/104) merged as `6ef06254a990309834d64c278ccc9af643c3e779`. Candidate [run 43688387269](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43688387269) passed all repository gates, including 425 unit tests, full browser and production-browser suites, build, lint, update smoke and online/base-path offline checks. Exact-main [run 43695664239](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43695664239) passed the same gates. Pages [run 43696180077](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43696180077) deployed that exact SHA; artifact 14154640941. The isolated Microgrid dispatch laboratory combines the existing PV/NREL wind models with editable demand, battery limits, critical-load priority, generic backup capacity, local save/reload and JSON/CSV exports. The model boundaries and remaining M3 scope are documented below; regional profiles, source-specific backup generation, network losses, outages, exports, costs, emissions and frequency response remain open.

## PowerGrid practical equipment gallery — deployed

PR [#97](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/97) merged as `739e4164ce83387e7aedc9682400c23fff9fbade`. Candidate run [43661330707](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43661330707) and exact-main run [43661833854](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43661833854) passed lint, unit tests, build, full browser and production-browser suites, update smoke and online/base-path offline checks. Pages run [43662397691](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43662397691) deployed that exact SHA (artifact 14141065553). The public `#POWERGRID` route returned HTTP 200, and the overview plus all six stage images returned HTTP 200. The deployed gallery pairs images and component-purpose checklists for hydro, steam/gas, transformer/switchyard, transmission/substation, distribution/customers and safety/test equipment. All are custom training illustrations, not photographs of a named site.

## POWERGRID LAB Milestone 1 — deployed; focused acceptance passed

GitHub issue [#86](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/issues/86) acknowledged. [PR #88](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/88) merged as `c50ff66ca1865e866410f00b832c35fd4effe8a2`. The public lab is live at [https://adigunpowerlab.hephzibahbehulah.com/#POWERGRID](https://adigunpowerlab.hephzibahbehulah.com/#POWERGRID). Browser inspection on 14 November confirmed the exact hash renders the branded lab, schematic, editable inputs and 132/330 kV results.

Candidate [run 43628170719](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43628170719), artifact 14127183215, and exact-main [run 43628826181](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43628826181), artifact 14126429450, passed lint, all unit tests, production build, full browser suite, production-browser suite, update smoke and offline/base-path checks. Pages [run 43629332412](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43629332412) deployed that exact main SHA; output artifact 14126688875. Earlier failed browser runs and their fixes are recorded in `docs/TEST_EVIDENCE.md`. PR #91 merged as `36ac8fb1d98e46311b87a2b85f17d933b5f14a7c`; candidate run 43633459567 and exact-main run 43634068700 passed, and Pages run 43634569359 deployed it (artifact 14129153822). JSON-content and 390 × 844 mobile acceptance now pass. Later owner-prompt milestones remain open.

## POWERGRID LAB Milestone 2 — radial feeder workflow deployed; scoped acceptance passed

The radial solver and user workflow are deployed. PR #92 candidate run 43635520709 and exact-main run 43636068361 passed; Pages run 43636663764 deployed `4e7d96e5e9186f5bf983fae288eec017a2a64dcc`, artifact 14130169246. The full browser suite covers feeder edits, outage/unserved loads, comparison, local save and actual JSON/CSV. Live browser inspection confirmed the public radial feeder section and editable controls. Scoped M2 acceptance is passed; regional generation, full source catalogue and later prompt milestones remain open. The model boundary is documented in [`docs/POWERGRID_MODELS.md`](docs/POWERGRID_MODELS.md).

## POWERGRID LAB Milestone 3 — PV foundation deployed; regional scenarios in progress

PR #93 added the instantaneous, user-input PV performance worksheet and merged as `5f880dd8b55ccd24f50f33e6d9d642afe4a2d536`. Candidate run 43639137814, exact-main run 43639652323 and Pages run 43640116019 all passed; the deployed route is [POWERGRID LAB](https://adigunpowerlab.hephzibahbehulah.com/#POWERGRID). The worksheet uses the Sandia steady-state cell-temperature relation and NREL PVWatts linear irradiance/temperature equation with explicit inverter conversion and AC clipping. It supports comparison, local save and actual JSON/CSV exports; full sources and model limits are documented.

PR #94's Nigeria-inspired regional context merged as `1d4d5574284ca67ada7c287fefce95f5640e19c2`. Candidate run 43641715412 (artifact 14132353578), exact-main run 43642322293 (artifact 14132742971), and Pages run 43642875461 (artifact 14133250374) passed. Live browser refresh confirmed the regional panel and NERC source link on the deployed `#POWERGRID` route. PR #95's selectable Germany-inspired scenario is scoped to the 50Hertz area and clearly identifies its illustrative 20 kV value. It merged as `396b44d9e518f4e53d43691fed95a63483f7bf77`; candidate run 43644341524 passed, exact-main run 43644856739 passed all gates (artifact 14134415093), and Pages run 43645394698 deployed the exact SHA (artifact 14133544859).

Owner steering on 14 November identified the generic horizontal power-path graphic as inadequate and directed work toward recognizable station equipment, explicit terminals and connections, colored phases, neutral/PE separation, and hydro → step-up → switchyard → overhead transmission, followed by receiving station, distribution, house and industry scenes. PR #96 merged and deployed the first hydro cutaway on 14 November. It includes a custom interactive SVG cutaway plus a distinct electrical one-line: reservoir and hydraulic path, Francis turbine, synchronous generator windings, delta/wye GSU example, breaker/disconnector/earth-switch bay, CT/VT, surge arrester, phase busbars, control house and SCADA/protection panel, lattice tower, three phase conductors, separate shield wire, generator neutral and PE earth grid. PR #97's stage imagery and component-purpose checklist are now deployed. Further physical station details and visual milestones remain open; these diagrams are not an as-built representation.

M3 remains in progress. Other national/regional examples, rural microgrid/custom scenarios, complete source catalogue, chronological dispatch and critical-load requirements remain open for separate slices.

## PR #85 reviewed BOT circuit removal — 14 November 2026

[PR #85](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/85) adds `remove circuit: Lighting circuit` as an exact-name BOT proposal. Its preview names the circuit and connected loads; Apply removes the circuit while retaining the loads unassigned, and Undo restores the prior project and assignments. Missing and ambiguous circuit names are rejected. Help and Guide, all four locales, browser coverage and the user manual are updated. Candidate `8899824efdb87f4ea2eaa8a842e424dd7a549f84` passed the full gate in [run 43621266571](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43621266571), artifact 14124377035. Main `a492ece59ba238e2aa7c4d7ac5e22dd47928b247` passed exact-main CI in [run 43621865533](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43621865533), artifact 14125010983; Pages deployed that exact SHA in [run 43622340824](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43622340824), output artifact 14124358028.

## PR #83 reviewed BOT load deletion — 14 November 2026

[PR #83](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/83) adds an exact-name `delete load: Heater` proposal. The preview identifies the load and warns when linked start events or flexible-load plans will also be removed; Apply is explicit, Undo restores the complete previous project, and missing or ambiguous names are rejected without mutation. The workflow and translations are in Help and Guide and the user manual. Candidate `d03d088e56abc8ecfd464ebc851383dd6b607324` passed the full gate in [run 43615716912](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43615716912), artifact 14122267292. Main `28cacbdf1fad5c92871ccbb38f2261a85227699a` passed exact-main CI in [run 43616319272](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43616319272), artifact 14122387659; Pages deployed that SHA in [run 43616757924](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43616757924), output artifact 14122316989. The public custom-domain app loaded after publication.

## PR #81 Project menu Help guide — 14 November 2026

[PR #81](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/81) adds a searchable, four-language walkthrough of create/open, rename/duplicate, save/export/import, history, trash recovery and close. The tour keeps onboarding first. Coverage verifies all 18 non-Help sidebar destinations have a workflow guide; the existing 51 worksheet guides, journey illustration and BOT tour remain. Candidate `e6716a2d782958405bc44cd57ddeb323ee7de6a0` passed [run 43610941434](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43610941434). Merged main `48a6aedaec397709749dd3b50f5888636b517e6d` passed [run 43611545819](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43611545819); Pages published that exact SHA in [run 43612079405](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43612079405). The live custom-domain Help search displayed the guide and its four action steps.

## PR #80 Adigun BOT command guidance — 14 November 2026

[PR #80](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/80) aligns Help and the manual with verified BOT commands for load edits, phase changes, board/circuit assignment, previews and confirmation safeguards. Candidate `7470e1d56ffc1e5c400ff5ed9eecb67c5f578478` passed [run 43607280097](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43607280097); merged main `c950a9561a794aa48bad040f7200e31fc00f6cca` passed [run 43607828871](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43607828871); Pages deployed it in [run 43608405600](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43608405600).

## PR #79 PR 78 release receipts — 14 November 2026

[PR #79](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/79) recorded candidate, exact-main and Pages evidence for PR #78. Candidate `e3cc54f0357f4362335746f1421c3987485870b8` passed [run 43606238930](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43606238930); merged main `9c3f3f7c3aa53c2dbc18d746233d6802e0c5bc8a` passed [run 43606773298](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43606773298); Pages deployed it in [run 43607211932](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43607211932). Documentation only.

## PR #78 unsaved-project safety and Help updates — 14 November 2026

[PR #78](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/78) warns before leaving unsaved edits, reopens the last committed project on refresh, keeps clean loads from being marked dirty, and documents these behaviors in Help and Support in all four locales. The Help guide now also covers the BOT tour and duplicate load-name rejection; repository instructions require relevant help, translations, tests and user-guide updates when features change. Initial candidates exposed clean-load metadata and recovery-copy selection regressions; both were corrected before the final candidate passed.

Candidate `1cc3112e062cfd5bc81813039dc5a6b9a95d3950` passed the complete gate in [run 43604816765](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43604816765), artifact 14117752333. Merged main `2917b0858a708668585a586cbf595781a9a8e88c` passed [run 43605406593](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43605406593), artifact 14118108213; Pages deployed the exact SHA in [run 43605816807](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43605816807), output artifact 14118038347. The public page and compiled bundle returned HTTP 200; the bundle contains the unsaved-warning and clean-load logic.

## PR #77 BOT duplicate-load proposal guard — 14 November 2026

Candidate `aecf4759e773ac6ccb760e650892b69339e1e7a3` passed in [run 43600464867](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43600464867), artifact 14116456475. Main `9160d7072a73ab8c6a78b1b661b91e7c527ade92` passed [run 43600926807](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43600926807), artifact 14116412540; Pages [run 43601437856](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43601437856) deployed it, artifact 14116129842.

## PR #76 deployment-receipt update — 14 November 2026

Candidate [run 43598835538](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43598835538), main validation [run 43599397505](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43599397505), and Pages [run 43599902573](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43599902573) passed. Main `27cab8c1084f5ddbe1938cee97df636f93e395bd` is deployed; candidate artifact 14114749719, validated main artifact 14116465690 and Pages output artifact 14116300873. Documentation only.

## PR #75 documentation deployment receipts — 14 November 2026

[PR #75](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/75) records PR #73 and #74 release evidence. Candidate [run 43597753191](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43597753191), exact-main [run 43598231509](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43598231509), and Pages [run 43598693643](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43598693643) passed. Main `6796ef4ed2bf5ae93ce6cf64d1d8b373ff328d00` is deployed; candidate artifact 14114849492, validated main artifact 14114249813, Pages output artifact 14114763737. Documentation only.

## PR #74 Adigun BOT kW rating guard for amps-entered loads — 14 November 2026

[PR #74](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/74) verifies an attempted kW rating edit on an amps-entered load is rejected without a proposal or mutation and translates the guard in all four locales. Initial candidate [run 43596330967](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43596330967) caught a browser assertion that omitted the unit-qualified Rating label; corrected candidate [run 43596817884](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43596817884), exact-main [run 43597191329](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43597191329), and Pages [run 43597548115](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43597548115) passed. Main `767fdfc89845064ce0c0432ea55b6005bd3db7b7` is deployed; candidate artifact 14114538581, validated main artifact 14114413057, Pages output artifact 14114893256. The fixture is synthetic.

## PR #73 documentation deployment receipts — 14 November 2026

[PR #73](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/73) records PR #71 and #72 receipts and refreshes the project status. Candidate [run 43595044387](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43595044387), exact-main [run 43595474128](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43595474128), and Pages [run 43595879055](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43595879055) passed. Main `f14d86c4ecadfd4cf3c63d4c27f420fe3a8efae4` is deployed; candidate artifact 14113799154, validated main artifact 14114565917, Pages output artifact 14114730595. Documentation only.

## PR #72 Adigun BOT empty load-name rejection — 14 November 2026

[PR #72](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/72) makes an empty-name edit return a clear validation error without a proposal or mutation, and translates it in all four locales. Candidate [run 43593949538](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43593949538), exact-main [run 43594406795](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43594406795), and Pages [run 43594831964](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43594831964) passed. Main `43896c8e4c6780da2d566d626ee735db8009e2ec` is deployed; candidate artifact 14113577858, validated main artifact 14114037141, Pages output artifact 14113803042. Test data is synthetic and isolated.

## PR #71 documentation deployment receipts — 14 November 2026

[PR #71](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/71) records PR #69 and #70 release evidence and refreshes the latest deployment record. Candidate [run 43592360700](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43592360700), exact-main [run 43592734619](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43592734619), and Pages [run 43593121674](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43593121674) passed. Main `e17fd88d7bd4f89b1c6476d8003925fa8ff85507` is deployed; candidate artifact 14112624062, validated main artifact 14113017515, Pages output artifact 14112744468. Documentation only.

## PR #70 Adigun BOT duplicate-name rename rejection — 14 November 2026

[PR #70](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/70) verifies that renaming a load to an existing exact name is rejected without a proposal or apply action and preserves both loads. The validation message is translated in all four locales. Initial candidate runs [43590624060](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43590624060) and [43590885196](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43590885196) stopped at lint for formatting; corrected candidate [run 43591257915](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43591257915), exact-main [run 43591679610](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43591679610), and Pages [run 43592075725](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43592075725) passed. Main `6b90f0663e116a6d52c9af0f18c46f4899898555` is deployed; Pages published source artifact 14112727768 (output artifact 14112917165). Candidate artifact 14112372571. Test loads are synthetic and isolated.

## PR #69 documentation deployment receipts — 14 November 2026

[PR #69](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/69) records PR #67 and #68 release evidence. Candidate [run 43589512290](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43589512290), exact-main [run 43589973832](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43589973832), and Pages [run 43590375885](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43590375885) passed. Main `c7faf38fc3cd07538bc61e1a53b9ae5068e5abab` is deployed; Pages used validated source artifact 14111123851 (output artifact 14111859672). Candidate artifact 14112141190. Documentation only.

## PR #68 Adigun BOT zero-quantity edit rejection — 14 November 2026

[PR #68](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/68) verifies that a numeric zero quantity is rejected with a validation error, produces no proposal or apply action, and leaves the synthetic load quantity at 1. Candidate [run 43412558377](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43412558377), exact-main [run 43588909128](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43588909128), and Pages [run 43589261888](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43589261888) passed. Main `f2cb9698f0d8469d41acfad028c7075b357b182c` is deployed; Pages validated source artifact 14111312228 (Pages output artifact 14111498060). Candidate artifact 14031000720. The validation error is translated in all four locales. Synthetic fixture only.

## PR #67 documentation deployment receipts — 14 November 2026

[PR #67](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/67) records PR #65 and #66 release receipts. Candidate [run 43410664316](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43410664316), exact-main [run 43411388409](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43411388409), and Pages [run 43412132909](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43412132909) passed. Main `f39be13183f94b66c94009bbdaccb4fa97d1ed75` is deployed; Pages used source artifact 14030515152 (Pages output artifact 14030440430). Documentation only.

## PR #66 Adigun BOT validation-message localization — 13 November 2026

[PR #66](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/66) adds German, Yorùbá and Nigerian Pidgin translations for the three covered load-edit rejection errors (ambiguous target, invalid numeric entry, and missing exact-name target), with exact translation tests for all four locales. Initial candidate [run 43408661877](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43408661877) stopped at lint on test formatting; corrected candidate [run 43408751207](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43408751207), exact-main [run 43409514890](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43409514890), and Pages [run 43410192205](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43410192205) passed. Main `7ae0dce814a20ddd581341b7936d631995789943` is deployed; Pages used validated source artifact 14029725629 (Pages output artifact 14029660706). Candidate artifact 14029290832. Broader technical language review remains open.

## PR #65 documentation deployment receipts — 13 November 2026

[PR #65](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/65) records PR #63 and #64 release receipts. Candidate [run 43406796206](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43406796206), exact-main [run 43407547594](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43407547594), and Pages [run 43408249009](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43408249009) passed. Main `fd4b8f9286c1411a15a6e7017033b8e1642d8bff` is deployed; Pages verified source artifact 14028311943 (Pages output artifact 14027144850). Documentation only.

## PR #64 Adigun BOT missing-target rejection coverage — 13 November 2026

[PR #64](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/64) adds browser acceptance for an edit naming no existing load. It checks the exact validation error, absence of a change proposal or apply action, and that the existing synthetic load quantity remains 1. Candidate [run 43405037858](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43405037858), exact-main [run 43405812091](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43405812091), and Pages [run 43406413405](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43406413405) passed. Main `eca076187c9d1efc0d0ada12f73389351048947c` is deployed; Pages selected validation run 43405812091 and source artifact 14026419689 (Pages output artifact 14027088565). Candidate artifact 14027810345. Synthetic isolated data only.

## PR #63 documentation deployment receipts — 13 November 2026

[PR #63](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/63) records PR #61 and #62 release receipts. Candidate [run 43386533381](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43386533381), exact-main [run 43387181107](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43387181107), and Pages [run 43387757736](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43387757736) passed. Main `def2872fbb535c1e9de6c1a49b6d9254cf3ac843` is deployed; Pages used source artifact 14018744305 (Pages output artifact 14019019231). No product behavior changed.

## PR #62 Adigun BOT invalid numeric edit rejection — 13 November 2026

[PR #62](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/62) verifies a nonnumeric quantity edit returns a validation error, offers no change proposal, and leaves the saved quantity at 1. Candidate [run 43384735224](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43384735224), exact-main [run 43385494386](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43385494386), and Pages [run 43386104306](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43386104306) passed. Main `0e7a42aad932aabc3e1b6e6a0af99c4890227ed0` is deployed; Pages verified validation run 43385494386 and source artifact 14018457563 (Pages artifact 14018128993). The fixture is synthetic and isolated.

## PR #61 documentation deployment receipts — 13 November 2026

[PR #61](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/61) records PR #59 and #60 release receipts. Candidate [run 43382996724](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43382996724), exact-main [run 43383782916](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43383782916), and Pages [run 43384403523](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43384403523) passed. Main `2b1091f0a164bdd44b59736a40abfc546cf54be9` is deployed; Pages verified validation run 43383782916 and source artifact 14018155456 (Pages artifact 14018225324). No application behavior changed in this documentation PR.

## PR #60 Adigun BOT ambiguous-target rejection — 13 November 2026

[PR #60](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/60) verifies that editing a duplicated exact load name returns an ambiguity error, creates no proposal, and leaves both loads unchanged. Candidate [run 43381259544](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43381259544), exact-main [run 43382006964](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43382006964), and Pages [run 43382706488](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43382706488) passed. Main `dea20cd2708758cdfbaa172ef5663abb7c2f1ad9` is deployed; Pages verified validation run 43382006964 and source artifact 14017501602 (Pages artifact 14017740914). Test data is synthetic and isolated; no client project data was used.

## PR #59 documentation deployment receipts — 13 November 2026

[PR #59](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/59) records PR #57 and #58 releases. Candidate [run 43379723844](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43379723844), exact-main [run 43380437451](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43380437451), and Pages [run 43381059156](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43381059156) passed. Main `a5a5134dbeaa664d17e8df79736f835db6bdf8ae` is deployed; Pages verified validation run 43380437451 and source artifact 14016358931 (Pages artifact 14016408467). No application behavior changed in this documentation PR.

## PR #58 Load Schedule context-menu actions — 13 November 2026

[PR #58](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/58) verifies Inspect selection, Duplicate, and Delete review cancellation/confirmation from the Load Schedule context menu. Its first candidate [run 43377155127](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43377155127) exposed an ambiguous test locator; the selector was narrowed, and corrected candidate [run 43377948197](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43377948197), exact-main [run 43378669557](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43378669557), and Pages [run 43379271903](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43379271903) passed. Main `cc392fac1933fe595dbadec47b185231cb92436f` is deployed; Pages verified validation run 43378669557 and source artifact 14015941593 (Pages artifact 14015777416). The analytical heater is an isolated fixture; no client data or product behavior changed.

## PR #57 documentation deployment receipts — 13 November 2026

[PR #57](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/57) records PR #55 and #56 release receipts. Candidate [run 43375668435](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43375668435), exact-main [run 43376375253](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43376375253), and Pages [run 43376891970](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43376891970) passed. Main `8f783be117fc3b461789d1e1367f3f7944a21656` is deployed; Pages verified validation run 43376375253 and source artifact 14014742472 (Pages artifact 14014837606). No application behavior changed in this documentation PR.

## PR #56 Load Schedule context-menu acceptance — 13 November 2026

[PR #56](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/56) verifies the existing context menu opens by pointer and Shift+F10, supports arrow/Home/End action navigation, restores focus on Escape, and invokes Edit. Candidate [run 43374323130](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43374323130), exact-main [run 43374887506](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43374887506), and Pages [run 43375409749](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43375409749) passed. Main `acafc46e0285434abba82984657fc553fdbc60d4` is deployed; Pages verified validation run 43374887506 and source artifact 14013394007 (Pages artifact 14014108069). The analytical heater is an isolated fixture; no client data or app behavior changed.

## PR #55 documentation deployment receipt — 13 November 2026

[PR #55](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/55) records PR #54 release evidence. Candidate [run 43373318062](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43373318062), exact-main [run 43373893178](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43373893178), and Pages [run 43374451469](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43374451469) passed. Main `177e38623e46b13f3ab1f464f736ffe6953fdeeb` is deployed; Pages verified validation run 43373893178 and source artifact 14013578423 (Pages artifact 14013912704). No application behavior changed in this documentation PR.

## PR #54 documentation deployment receipt — 13 November 2026

[PR #54](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/54) records PR #53 release evidence. Candidate [run 43371837583](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43371837583), exact-main [run 43372375564](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43372375564), and Pages [run 43373115498](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43373115498) passed. Main `ab05396b8bf0d7f43cd2c9c1bf4821e0597b2e89` is the publication source; Pages verified the exact SHA, validation run 43372375564, and artifact 14013685966. No application behavior changed in this documentation PR.

## PR #53 documentation integration release — 13 November 2026

[PR #53](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/53) records the PR #52 keyboard acceptance. Its candidate [run 43370449230](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43370449230), exact-main [run 43371025702](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43371025702), and Pages [run 43371665019](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43371665019) passed. Main `ea0e9dd95789e2f107d4392fc215e5eacd04bc38` is the publication source; Pages verified the exact SHA, validation run 43371025702, and artifact 14012542375. No application behavior changed in this documentation PR.

## Command search keyboard shortcut acceptance: 13 November 2026

[PR #52](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/52), merged as `7253f4831d54b524a0d33477b609a963397dd8ea`, adds browser acceptance for Ctrl+K and Meta+K opening command search, focus moving to the search field, and Escape restoring focus to the original control. Candidate [run 43369067105](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43369067105) and exact-main [run 43369622020](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43369622020) passed. Pages [run 43370107595](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43370107595) published that exact main SHA; its summary identifies validation run 43369622020 and artifact 14012281414. The live custom-domain workspace loaded during release monitoring with an empty local project; the shortcut behavior was verified in candidate and exact-main browser CI, not manually on the live page. No client project data was changed.

## Confirmed BOT load-to-board assignment: 13 November 2026

[PR #50](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/50), merged as `f90c3346a0c713fbfcb35e991233ac508f4861b6`, adds exact-name `assign load: Heater; board: Main board`. The preview identifies the destination board and any existing circuit that will be removed; applying uses the existing project history/undo path. Candidate [run 43365964376](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43365964376), exact-main [run 43366668790](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43366668790), and Pages [run 43367266954](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43367266954) passed. Browser coverage uses isolated project data.

## BOT window lifecycle acceptance: 13 November 2026

[PR #48](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/48), merged as `52a3165d8d0856196602258469aba5307c128db3`, verifies keyboard repositioning, minimize/restore, maximize/restore, close/reopen, persisted window geometry, and session conversation retention in the browser. Candidate [run 43361011720](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43361011720), exact-main [run 43361669486](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43361669486), and Pages [run 43362136134](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43362136134) passed.

## Confirmed BOT load-to-circuit assignment: 13 November 2026

[PR #46](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/46), merged as `b2ff3a38045020a3489f8c9cc6652adbd0973ee5`, adds exact-name `assign load: Heater; circuit: Lighting circuit` to Adigun BOT. The operation uses the existing preview, confirmation, history, and undo path. The preview identifies the target circuit, served board, and phase; incompatible DC assignments and locked phase mismatches are rejected. Candidate [run 43357419432](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43357419432), exact-main [run 43358065181](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43358065181), and Pages [run 43358633684](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43358633684) passed. Browser coverage uses isolated fixture data.

## Spatial object inspection detail-mode continuation: 13 November 2026

[PR #44](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/44), merged as `4d5fd78d2efc4aabeb5ef9a8078e864e41d50ed1`, connects the analytical spatial view’s selected-object description to the global detail preference. Simple mode collapses the description while retaining object name and representative kW; Engineering opens the description. Candidate [run 43353163135](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43353163135), exact-main [run 43353747498](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43353747498), and Pages [run 43354410218](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43354410218) passed. Browser coverage uses the existing test-only analytical fixture, not client data.

## Source equipment assessment detail-mode continuation: 13 November 2026

[PR #42](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/42), merged as `5452c70113bce43eb6183aa52d5ed489f80f4075`, makes the source-equipment assessment method follow the shared detail preference: collapsed in Simple mode and open in Engineering mode. Assessment check results remain visible in both modes. Candidate [run 43349206656](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43349206656), exact-main [run 43349934690](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43349934690), and Pages [run 43350626746](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43350626746) passed. The browser fixture used an entered test-only source record; no client project data was used.

## BOT phase assignment continuation: 13 November 2026

[PR #40](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/40), merged as `fe2fc976a053eb9b16476a3191a3e0bafc29056e`, adds a deterministic `phase load: Name; L2` task. It targets one exact unique load name, previews validated affected circuit changes (including locked-phase behavior), shows the before/after fields and applies only after confirmation through project history. Candidate validation passed in [run 43341542625](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43341542625); exact-main validation passed in [run 43344985411](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43344985411); Pages publication passed in [run 43345697205](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43345697205). [PR #39](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/39) records prior feeder detail-mode release receipts. Candidate data used no client project.

## Detail-mode release continuation

- [PR #16](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/16), main `1b538295b43d8eda1ce2ca46f9240c964aaaa34d`: Costs & Carbon keeps the essential rate, demand-price, tax and carbon inputs visible in Simple mode; time-of-use and billing-period rules collapse into a disclosure, while Engineering opens those rules. Candidate `af9c5b804c5d77575b94d7601c4fc8fa6128f1c0` passed the full gate in [run 43244230000](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43244230000), main validation passed in [run 43245232196](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43245232196), and Pages publication passed in [run 43245983581](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43245983581). Live custom-domain verification confirmed Simple collapse, visible core rates and Save, rule expansion, and Engineering expansion. The local empty project identified its source reference as an editable assumption, not a retrieved tariff; no customer tariff data was used.

- [PR #18](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/18), main `bbc7712f0e97a1fb11bc12d1dd511e0ee6a3102b`: the scenario workspace receives the global detail mode; baseline input differences remain expandable in Simple and open in Engineering. Corrected exact candidate `865368920c80e9d095f4ed33e27bb7d0a66124cc` passed the full gate in [run 43249735796](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43249735796); main validation passed in [run 43250741903](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43250741903), and Pages publication passed in [run 43251513566](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43251513566). Live verification after activating the published update confirmed “Changes from baseline (0)” collapsed in Simple and expanded in Engineering; no browser console errors occurred. The workspace remained empty; no client scenario data was used.
- [PR #20](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/20), main `e1e9b8bb2490c3ad194e1b8432349f9d19181592`: the dated engineering comparison receives the global detail mode. Its calculated output table and exports remain available in both modes; methods, assumptions and unresolved checks collapse in Simple and open in Engineering. Corrected exact candidate `ebeff8a4cc189d02395e02e05c37b8f875e233d1` passed the full gate in [run 43254725006](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43254725006), main validation passed in [run 43257414900](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43257414900), and Pages publication passed in [run 43258262229](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43258262229). The live custom-domain workspace remained empty, so the dated comparison stayed disabled; interactive behavior was verified in CI with a test-only load. No customer project data was added.

- [PR #22](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/22), main `17524b2d86b07b53a8072a3a198065eceb97f4ed`: measurement assumptions open with Engineering detail and collapse in Simple mode; missing-coverage warnings remain open in both modes. Candidate `23546074122c73489ff5fb6fcc8a867947aa57b9` passed the full gate in [run 43263530787](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43263530787); exact-main validation passed in [run 43264630710](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43264630710), and Pages publication passed for the same SHA in [run 43265546630](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43265546630). Browser CI used test-only CSV intervals; no client measurements were imported. Manual post-deploy interaction was not verified because desktop browser control timed out; automated production-browser validation passed.

- [PR #24](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/24), main `ae30f2880613ff1179424b413bb304670e138068`: circuit diagnostics follow detail mode; candidate [run 43268930764](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43268930764), main validation [run 43269817818](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43269817818), Pages [run 43270753247](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43270753247), all passed.
- [PR #25](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/25), main `3186e835d89a5423d5aa481f2117f730c0524d87`: single-line diagram settings follow detail mode; candidate [run 43271086243](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43271086243), main validation [run 43272100628](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43272100628), Pages [run 43272893105](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43272893105), all passed.
- [PR #26](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/26), main `01107780ca87182b56e358d9a1b0674e1489a49a`: simulation profile data follows detail mode; candidate [run 43272489704](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43272489704), main validation [run 43274172525](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43274172525), Pages [run 43274939156](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43274939156), all passed.
- [PR #27](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/27), application revision `892b3bee8f7267201cdf6910edb271e124774815`: bulk load actions and clipboard disclosure follow detail mode. Candidate [run 43276924442](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43276924442), main validation [run 43277711152](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43277711152), Pages [run 43278519926](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43278519926), all passed. The public custom-domain page and its built JavaScript asset both returned HTTP 200; no customer data was used.
- [PR #30](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/30), application revision `364c23446bc25a26a62052df66f83e8a2c920453`: Equipment Library version-history details are open in Engineering and collapsed in Simple. Candidate `13916fd5d06ce808ef1d7921326ec8f5e8d23c80` passed [run 43284982098](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43284982098); main validation passed in [run 43285875565](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43285875565), and Pages publication in [run 43286622309](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43286622309). Public HTML and compiled bundle both returned HTTP 200. Test fixture only; no customer data used.
- [PR #33](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/33), main `b939c83688b131262063cd431438fc45cf264219`: added Help and Guide below Settings, reusing the workflow/tool catalogue, with a project-path SVG and a BOT tour that opens each workspace. Candidate [run 43296777011](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43296777011), main [run 43297891385](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43297891385), and Pages [run 43298669168](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43298669168) passed.
- [PR #34](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/34), application revision `00c450976f65adb1a5d348fffb9ada0e4d60074e`: Adigun BOT searches the guide catalogue for how-to questions and can open the matching workspace. Candidate [run 43301019671](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43301019671), main [run 43301885696](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43301885696), and Pages [run 43302802464](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43302802464) passed. Local typecheck and all 386 unit tests passed.
- [PR #36](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/36), current application revision `4604b3f460c05a6e7b182dd83a5f2b1b8960c06d`: Adigun BOT can propose a validated single-field edit to one uniquely named load, show the before/after inputs and demand, and apply it only after confirmation through project history. Candidate [run 43314525218](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43314525218), exact-main [run 43315394007](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43315394007), and Pages [run 43316149834](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43316149834) passed.
- [PR #38](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/38), application commit `177163d0227083009cbfe05576eaa3ee36cfcc80`: the cumulative feeder method disclosure follows Simple/Engineering mode while route outputs remain visible. Candidate [run 43338929618](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43338929618), exact-main [run 43339729808](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43339729808), and Pages [run 43340449448](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43340449448) passed.
- [PR #28](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/28), documentation-only main `e01fbfa6784ab6c2be2e253f4486a30eb24361c7`: candidate CI [run 43280043253](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43280043253), main validation [run 43280814410](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43280814410), and Pages [run 43281661723](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43281661723) passed. It updates evidence only; application files remain at the PR #27 release.

## Client reference workspaces

The client supplied dashboard, cable/protection worksheet and single-line studio references in main commit [cf271d7](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/commit/cf271d73f26eec6b913a2ebd02b86dea4d9ed8b4). Their project names, equipment identities, measurements, dates, statuses, telemetry and calculation values are illustrative, not product data. None are seeded into projects.

Three client visual milestones are merged and published:

- [PR #7](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/7), main `c6eb8223596cc64ec391ca43aab1e11e7805b9c1`: compact Single-Line Studio with visible object/board selectors, editable diagram, and selected-object inspector. Corrected candidate checks passed in [run 43218259418](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43218259418); Pages deployment passed in [run 43219911880](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43219911880).
- [PR #8](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/8), main `f6543d634112f8b30ae57596bd12ff03a6ee5095`: blank T16 cable worksheet first, searchable 11-tool cable/protection catalog on the right, and cumulative feeder assessment below. Candidate checks passed in [run 43220484336](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43220484336), main checks in [run 43221337273](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43221337273), and Pages deployment in [run 43222118888](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43222118888).
- [PR #9](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/9), main `8d1fb60ccba760534bf4091be77147d088dfcae2`: compact, real empty-project overview so source assumptions, calculated zero-load metrics and first-study actions appear in the first viewport. Candidate checks passed in [run 43222958314](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43222958314), exact-main checks in [run 43223694766](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43223694766), and Pages deployment in [run 43224476885](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43224476885). The live overview was reloaded and checked at 1280 × 720.
- [PR #10](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/10) records the then-current release receipts and preserves prior test evidence; candidate run [43225997336](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43225997336), main `2ea575e5f976a89d0b208ea791f3ffbb59d84f0c`, validation [43226827482](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43226827482), Pages [43227425806](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43227425806).
- [PR #11](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/11), main `d1c46c8e8b6b2e56891620b3654a657f780e15d0`: passes the global detail mode into the toolbox, disclosing calculation formulas in Simple mode and showing them in Engineering mode. Candidate run [43227487970](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43227487970), main validation [43228398421](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43228398421), Pages [43229179697](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43229179697). Production T01 calculation was checked at 230 V / 23 Ω = 10 A in both modes.
- [PR #13](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/13), main `2f865242cf10808b3f08b5a2ed1385344c478146`: PV daily-energy estimate stays visible while the calculation method is collapsed in Simple mode and displayed in Engineering mode. Candidate run [43232433695](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43232433695), main validation [43233246035](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43233246035), Pages [43233917943](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43233917943). Production behavior was checked on the custom domain.
- [PR #14](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/14), main `cc7b83370e1ee57a032c79151edc8ddd0907e360`: EV scheduling method is disclosed in Simple mode while entered-assumption notice remains visible; Engineering mode keeps the method visible. Corrected candidate run [43235233184](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43235233184), main validation [43236165699](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43236165699), Pages [43237057255](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43237057255). Production behavior was checked on the custom domain.

All three references were compared with the actual empty project. The visual matches are partial. No sample customer, equipment, manufacturer or telemetry values were copied or presented as real.

## Verification for latest release

PR #22's corrected exact candidate, main and Pages runs all passed. CI includes lint/typecheck, unit, build, browser, production-browser, update and offline checks. Exact receipts for PRs #7–#22 are in [TEST_EVIDENCE.md](docs/TEST_EVIDENCE.md); current publication mechanics and receipts are in [DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Product acceptance boundary

These are bounded visual milestones, not full original-spec acceptance. The current app is a local-first engineering planning tool; browser calculations do not certify installation or validate physical equipment. Professional language and independent accessibility review, licensed/current standards and manufacturer datasets, connected AI/cloud/OCR and physical telemetry/control are absent or unverified. See [KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md) and [ACCEPTANCE_MATRIX.md](docs/ACCEPTANCE_MATRIX.md). PRs #11, #13 and #14 add mode-aware method display to the toolbox, Renewables and EV workflows; PR #16 adds tariff-rule disclosure, PR #18 makes scenario baseline differences follow the global detail mode, PR #20 connects dated-comparison methods to that mode, and PR #22 connects measurement assumptions to it while keeping coverage gaps visible. PRs #24–#27 also connect detail mode to circuit diagnostics, diagram settings, simulation profile data and bulk load actions. Remaining workflows, all four languages and action/failure states are still open.

## Next action

The Help and Guide sidebar now contains 21 workflow topics, a Project menu walkthrough, all 51 worksheet guides, the BOT tour and the journey illustration. Tests verify all 18 non-Help sidebar destinations map to a workflow guide. This menu audit found no additional screenshot/video gap. Next, audit the remaining task-specific actions against their actual controls and expand reviewed BOT proposals with explicit confirmation. Independent accessibility, professional language and engineering review, licensed/current datasets, exhaustive storage/update-interruption scenarios and full original-spec acceptance remain open.

## PowerGrid downstream equipment scene — deployed

PR #99 merged as `01c6ea20c437ce983fa5a261819f2a014d7998d4`. Candidate run [43667440603](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43667440603) and exact-main run [43667924456](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43667924456) passed lint, all 419 unit tests, build, full browser and production-browser suites, update smoke and online/base-path offline checks. Pages run [43668393758](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43668393758) deployed that SHA; artifact 14143043216. Both the branded domain and GitHub Pages route returned HTTP 200; the served main bundle contains the downstream scene and localized equipment labels. Receiving, MV and consumer voltage labels follow editable lab inputs. Selectable equipment details show function and terminals in four locales, with N and PE separate. The scene is an illustrative teaching topology; protection, transformer loss and downstream load flow are not simulated. Next: add the next sourced visual scene and retain M4 as partial until all its requirements are verified.

## Combined-cycle, solar PV and wind plant studies — deployed 15 November 2026

PR [#101](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/101) merged as `c563b83aed43d6c314ebcb8c6187cfdd320a590a`. Candidate run [43671901034](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43671901034) and exact-main run [43672370263](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43672370263) passed lint, unit tests, build, both browser suites, update smoke and online/base-path offline checks. Pages run [43672795456](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43672795456) deployed the exact SHA with artifact 14145151948. The branded `#POWERGRID` route loaded with the generation-study selector in the browser; automated browser coverage selected gas, solar and wind, confirmed their images loaded, exercised equipment details and keyboard selection, and checked translated labels/captions in four locales.

The selector uses the existing combined-cycle render and owner-supplied solar/wind illustrations, web-sized as local JPEG assets. Each plant has five inspectable component cards, representative process/electrical interfaces, provenance captions, and model/site-specific limits. These are custom teaching images, not photographs or as-built site evidence. No plant output or dynamics are simulated. Milestone 4 remains partial: synchronized 3D scenes and remaining performance/accessibility requirements are still open.

## NREL reference-wind generation worksheet — deployed 15 November 2026

PR #103 merged as `5270b8f413eaab814b942aac07bd41253ac08da5`; candidate [run 43678810899](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43678810899), exact-main [run 43679336987](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43679336987), and Pages [run 43679767633](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43679767633) passed. The source-backed NREL 6 MW (2015) worksheet interpolates user-entered wind speeds and reports interval power/energy and profile metrics; it saves locally and exports source-labelled JSON/CSV. It is not weather or annual-yield data. The chronological dispatch slice is now separately deployed; regional resource and demand profiles and source-specific dispatch remain incomplete.

## Spatial and single-line selection synchronization — deployed 15 November 2026

PR [#110](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/110) merged as `e29207671c11ed1e1ce7b587d86c2be5a77cec9f`. Candidate validation [run 43713873103](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43713873103) and exact-main validation [run 43714392561](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43714392561) passed. Pages publication [run 43714986294](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43714986294) succeeded for the merged SHA; artifact 14162156390. Browser coverage verifies selection carries between the single-line diagram and the perspective project graph, with the shared inspector following the selected object. It also verifies project export from the current view. This is synchronization for the existing perspective SVG graph; it is not a physical station-scale 3D scene or synchronized physical cutaway. Milestone 4 remains partial, with physical 3D scenes and performance/accessibility verification open. The custom domain could not be independently loaded from this environment after deployment; GitHub Pages workflow and artifact are the deployment evidence.


## Navigable PowerGrid station model — candidate (16 November 2026)

A separate WebGL view now assembles original three-dimensional educational geometry for the dam/reservoir, penstock, turbine, synchronous generator, step-up transformer, switchyard, lattice tower, receiving transformer, house and industry. Learners can change camera azimuth/elevation/zoom and select localized equipment descriptions with terminal and phase-boundary notes. A schematic fallback remains available when WebGL cannot initialize. This is not site-survey geometry or electrical simulation. The existing hydro SVG remains the detailed terminal/wiring view; cross-view selection and performance measurements still need work. Candidate verification is pending.

## POWERGRID Milestone 3 — head-and-flow worksheet candidate (21 November 2026)

The spatial selection work shipped in PR #110 and the navigable teaching station scene followed in PR #112. Added a steady-state hydropower worksheet with four-locale guidance, local save and source-labelled JSON export. Reservoir scheduling and further source-specific dispatch models remain open.

The candidate also integrates optional entered hydro flow into chronological microgrid dispatch. It calculates hydro availability at fixed net head, applies the installed rating limit and includes the result in the shared energy balance and interval exports.

Reservoir hydro now adds a bounded water balance to this candidate. Bypass is allocated first, then requested turbine flow is limited by water and rated output. The model reports spill, remaining water and unmet bypass.

Reservoir hydro also supports a linear head rise with interval-start volume. Zero rise preserves fixed head. JSON and CSV retain the net head used for each reservoir interval.

The candidate now includes optional pumped storage with separate pump and generation ratings, hydraulic energy capacity, and conversion efficiencies. It pumps from surplus after the battery and supplies residual load before backup.

The candidate now models capped grid import/export and interval-indexed outages. Storage acts first, grid imports precede backup, and grid exchange resumes on the next connected interval.

The candidate also supports backup-generator outage intervals and restart from zero output. Dispatch reports in-service state and unused capacity within the current ramp limit.

Thermal backup can now account for fuel energy at an entered net heat rate and optional direct combustion CO₂. The model uses actual interval generation and does not change the dispatch priority.

Thermal backup now supports startup fuel and optional finite fuel inventory. Fuel availability caps generation and backup headroom, and the interval exports report startup consumption and remaining fuel.

The candidate now includes an editable rural clinic and community dispatch day. Six four-hour intervals illustrate solar variation, evening demand, storage and critical loads.

Added a historical Germany comparison day with hourly SMARD grid load, solar, onshore and offshore wind, and derived residual load. The reference is available locally and exported with attribution.

SMARD observations now drive a scaled dispatch scenario with fixed hourly solar and wind and editable demand and equipment. JSON preserves the source day, attribution, license, scaling and illustrative critical-demand assumption.

The German historical comparison now includes 22 January 2025 as a winter example alongside the June day. Both can drive dispatch at the same scale, with original local offsets and provenance retained.

Milestone 4 now shares selection between the 3D scene, hydro cutaway, hydro single-line and downstream diagram for equipment represented in both views. Equipment with no shared representation keeps its own inspector.

Milestone 4 camera changes now reuse WebGL shaders and geometry. The model handles context loss and restoration, and equipment inspection remains accessible if rendering is unavailable.

On phone-width screens the 3D camera and equipment inspector now stack vertically. Camera sliders have localized accessible names.

Milestone 5 has a separate balanced meshed AC solver and editable three-bus experiment. It supports slack/PV/PQ buses, series impedance, charging, transformer ratios and phase shifts, and bounded convergence with island checks.

Milestone 5 now runs one outage per in-service branch and compares each result with the AC base case. The comparison reports voltage and apparent-power limit violations separately from islanding and solver failures.

The meshed solver reproduced MATPOWER 8.1’s independently published nine-bus AC solution. All bus voltages and angles and both-end branch P/Q flows were checked. Inputs, solution hashes and maximum deviations are recorded in the test evidence.

Milestone 5 now also includes an aggregate primary-frequency lesson for a generation-loss step. Learners can edit inertia, damping, reserve, and droop response and export the integrated trace.

Milestone 6 now includes a downloadable PDF for the transmission-voltage comparison. It snapshots current inputs and observations at export time, renders the schematic and loss comparison, and includes optional student notes.

The transmission experiment now saves its name, notes and selected preset. Versioned JSON import validates and previews inputs, then applies only after confirmation. Older version-1 JSON and existing browser saves remain readable.

All-project workspace backups now include saved transmission experiments and recovered copies. Restoring stores the experiments separately in the workspace transaction. PowerGrid Lab can preview and apply a recovered copy without automatically replacing the saved worksheet.

The transmission worksheet now supports undo and redo for up to 40 edit states while open, including whole-scenario imports and resets. The explicit saved snapshot remains separate.

Explicit transmission saves now retain up to 20 earlier distinct save states. Users can preview these revisions after reload, and an all-project workspace backup includes their scenario contents for recovery as separate lab copies.

Transmission now supports duplicating the open experiment as a named working copy and pinning a baseline before editing. The comparison updates with valid inputs and includes signed changes in scenario JSON.

The radial feeder can now consume a reviewed snapshot of the active project's balanced design P and Q. The selected lab group records the source project ID, revision, calculation engine, and capture time. The source project stays unchanged.

Microgrid dispatch also accepts a reviewed 24-hour recurring-day active demand snapshot. The JSON retains the original hourly demand and provenance alongside the editable dispatch inputs.

PowerGrid Lab now loads on entry to #POWERGRID. Local production checks at the root and repository base path confirmed the first lab visit after going offline, a valid transmission PDF download, and a decoded hydro image. The service worker now emits portable precache paths. The production bootstrap is 814 kB (246 kB gzip), with a separate 318 kB lab module (93 kB gzip). Hosted validation and the structured practical curriculum remain open.

The first structured practical lesson covers poor power factor. It adds a prediction, balanced-model assumptions, a worked comparison, and a resettable case in the existing transmission worksheet. The workbook supports baseline comparison, student notes and report export. The rest of the structured curriculum remains open.

The transmission-distance lesson now uses the balanced radial AC solver with an adjustable 1–40 km two-bus line. It compares the receiving voltage and real loss with a 5 km reference, and exports both solved cases and the student's interpretation.

The feeder-trip lesson now walks learners through a full north feeder outage and staged restoration in the existing radial worksheet. Solved JSON includes the pinned pre-trip reference when one is available.

The transformer-loading lesson compares apparent loading, loss and efficiency against a worked half-load case. Students can vary apparent load and power factor, observe the nameplate warning and export the reference plus current calculation.

The midday solar and evening peak lessons now load separate two-hour teaching cases into microgrid dispatch. They cover charging, curtailment, grid export, critical-load priority and battery support during the evening deficit.

The generator-outage lesson now provides a three-interval dispatch case with battery support, a backup trip, and a ramp-limited restart. Students can compare the outage with uninterrupted operation and export either run.

The regional comparison lesson solves both sourced voltage presets against the same editable transmission inputs. It displays both cases side by side and exports the worked reference and current results with preset provenance.

The community capstone now lets students load the rural teaching day, pin a dispatch reference, stress-test an editable supply design, and export the current run, pinned inputs and results, and design justification together.

The microgrid operation lesson now shows a solved rural reference, prompts learners to change the battery power limit and interpret backup and unserved demand, and downloads the edited run alongside the reference.

Source to socket and Why step up voltage now have guided practical lessons with worked references and interpretation prompts tied to the live transmission worksheet and PDF. The full lab still needs release qualification against the owner specification.

The practical redesign adds selectable foundation equipment images, original facility footage, a live voltage comparison, and an illustrated Overview menu covering the existing workspace routes. Fourteen destinations have localized field exercises, and Reports, Settings, History and Help have bundled application recordings. The field guide and recording releases still require their respective Pages verification.

The lab now has a deterministic Adigun BOT panel for transmission. It explains line loss, summarizes current readings, offers PDF export and previews a 10% voltage increase until confirmed. The worksheet reducer rejects stale revisions and records confirmed changes in undo history. Broader BOT lesson and asset contexts remain open.

The lab BOT now explains the selected station asset using the same localized function and interface descriptions as the station inspector. Synchronized selection changes from the cutaway or distribution view also update this explanation.

The dispatch BOT now explains the selected solved interval. It shows the renewable deficit, the battery power and reserve-adjusted energy limits, actual discharge and remaining unmet critical and noncritical load. The JSON includes the solver's interval battery energy limit.

Meshed AC branch-outage comparisons now run in a dedicated worker. Editing the case, disabling comparison or leaving the lab cancels obsolete work. Results and comparison exports stay tied to the active solved case.

The transmission PDF snapshot now includes the pinned worksheet name, baseline readings, current readings and signed differences. The comparison is frozen before the PDF module loads.

The POWERGRID LAB launcher is the final top-bar control. The qualification checks now cover right-edge placement and keyboard entry at desktop, tablet and phone widths, plus header geometry while Search is open.

The draft now has direct browser coverage for entering and leaving POWERGRID LAB after an engineering-project save failure. The curriculum guide indexes all 12 requested lesson workflows and their reports.

Valid transmission edits now autosave to a separate browser draft. On reopening, students can restore or discard it. Invalid input keeps the last valid draft, and restoration uses the existing worksheet undo history.

The station WebGL renderer now starts near the viewport. The lab can present earlier lesson content without allocating station buffers. Once initialized, camera updates reuse those buffers, and the equipment inspector remains available on fallback.

Independent numerical verification now includes a closed-form two-bus AC case and a time-step refinement check for the frequency lesson.

The transformer lesson now compares the ideal and lossy cases at the same apparent load, with both results in the JSON export. An independent fixture covers real-power balance, no-load core loss and the nameplate threshold.

The production update smoke fixture now checks file containment using native path semantics. Windows root and repository-base update and offline checks passed against the transformer-comparison build. The source catalogue implementation matrix records supported models and remaining entries.

The next catalogue increment adds a sourced solar thermal power tower worksheet with editable irradiance, aperture, efficiencies and operating limits. It has independent reset and JSON export.

PR #116 merged and deployed as 0abafe1. Both public paths served the production entry and the lab launcher. The release and artifact receipts are recorded in docs/DEPLOYMENT.md.

PR #117 merged and deployed as 93fff33. The solar thermal lesson is served by both public Pages paths. The next generation catalogue entries remain open.

The tidal stream increment adds a source-linked turbine worksheet with a swept-area flow calculation, separate shaft and electrical potential, rating, cut-in and cut-out, and a JSON export. Wave generation remains open.

The geothermal increment adds a source-linked binary-cycle worksheet with brine temperatures and flow, gross output and signed net output after auxiliary load. The learner can reset the worked case and export JSON.

The wave-energy increment adds an independent deep-water sea-state worksheet with wave flux, capture width, conversion efficiency, rating and shutdown height. It reports resource and available output separately and provides JSON export.

The combined-cycle increment adds a worksheet for fuel-limited potential, available and dispatched gross generation, gas and steam output, recovered heat and net output after plant use.

The fuel cell increment adds an inventory-limited hydrogen worksheet with adjustable DC and AC ratings, gross and net output, fuel used and fuel remaining. It includes JSON export, reset and Help in all four languages.

The fuel-cell dispatch handoff transfers the net equipment limit and the finite hydrogen inventory. The worksheet and dispatch each use their own duration.

The biogas increment adds a methane-fraction and flow-based engine CHP worksheet, with separate electrical output, recoverable heat, useful heat demand and JSON export. Solid biomass remains open.

The solid biomass increment adds a wet-basis moisture and steam generation worksheet with gross and net output, used fuel and JSON export. It complements the separate biogas engine model.

The diesel increment adds a steady-interval worksheet using entered no-load and rated fuel rates, minimum load, fuel inventory and output limits. The existing chronological thermal backup remains separate.

The coal steam increment adds a one-interval worksheet for net heat rate, net generation, coal consumption and remaining inventory.

Biomass, diesel and coal passed their main and Pages workflows and were checked in public Chromium. The exact revisions, workflow receipts and live checks are recorded in docs/DEPLOYMENT.md.

Thermal minimum stable output also passed exact-main validation and Pages publication. Public dispatch exports confirmed startup and fuel depletion at the feasible minimum, and zero startup fuel when the minimum exceeded available output.

The wind worksheet candidate adds the NREL 2020 ATB 4 MW onshore reference curve alongside the existing 6 MW offshore default. It saves the selected turbine and identifies the curve and its source in JSON exports.

Biogas and hydrogen dispatch transfers are deployed and verified on public Pages. The biogas handoff disables at zero methane and supplies a running fuel curve. The hydrogen handoff preserves the initial fuel stock and instantaneous electrical limit as distinct dispatch inputs. See docs/DEPLOYMENT.md for the exact revisions and checks.

The next dispatch candidate adds onshore and offshore reference selection for entered wind speeds. Older saves default to offshore, while historical profiles continue to use recorded generation.

The onshore wind worksheet, Pacific Northwest preset with split-phase experiment, and South Africa preset are live. Public browser results and exact workflow receipts are recorded in docs/DEPLOYMENT.md.

The gas turbine comparison candidate adds an open-cycle case alongside the combined-cycle result, with separate dispatch handoffs and both calculations in the worksheet JSON.

The gas turbine comparison is now published and verified. The equal-fuel exercise and the open-cycle dispatch export are recorded in docs/DEPLOYMENT.md.

The demand-response candidate adds an interval transfer for entered flexible load. It preserves critical demand and total energy and recalculates dispatch from the revised demand profile.

A follow-up candidate preserves the latest applied shift in saved dispatch scenarios and JSON exports, including original and revised load at both intervals.

Demand shifting and saved intervention records are now live. Public Chromium verified conservation, the receiving interval limit, and save/reload with the before/after readings in the JSON export.

The meshed demand-profile candidate compares independent low, base and peak AC solves. The lab exposes voltage, real losses, convergence and the actual per-interval inputs and results in JSON.

A follow-up candidate stores both demand sliders with the saved meshed case, with safe defaults for earlier saves.

The meshed demand profile is live. Public Chromium verified the peak voltage change, three islanded exports after disconnecting the slack bus, and convergence after reconnection.

Meshed profile saving is also live. Public Chromium restored both edited demand sliders and verified the resulting profile in the JSON export.

A phone-width Chromium accessibility-tree sample found that hidden toolbar text left Save and Export project unnamed. The accessibility candidate explicitly names both controls using the existing four-language text.

Public Pages sampling verified the reduced-motion station layout at desktop, tablet and phone widths. Chromium rendered WebGL at all three widths and recorded two-frame azimuth input timing in docs/TEST_EVIDENCE.md.

## Component-bank priority

The baseline exports in docs identify 51 tools and six equipment/model families separately from manufacturer records. The first candidate adds seven sourced Canadian Solar PV modules and maps only their DC nameplate rating and power temperature coefficient to the PV worksheet after review. The case saves the reference and exports the applied record. TypeScript, 24 focused PV and Help checks, and Chromium save/reload/export passed. Equipment placement, connection editing and BOM integration remain open.

The catalogue follow-up makes the seven sourced records searchable in the Equipment Library and supports individual JSON export. TypeScript, 20 Help tests and the focused Chromium catalogue test passed.

The second PV batch adds seven CS6.1-54TM-H variants, taking the candidate total to 14 sourced entries. The records retain the family-specific system voltage, fuse rating and documented connector alternatives. The worksheet links to the selected model family's datasheet. Regenerate the batch exports with node scripts/export-component-bank.mjs.

Project equipment candidate adds editable names and installed quantities to saved projects and the report bill of materials. Local Chromium verified save, reload and report inclusion. Phase-aware connections and diagram placement are still open.

The diagram candidate displays saved equipment as disconnected symbols with source-backed terminal groups in the inspector. Connections remain open. Local Chromium verified the positive, negative and frame-bond groups on a saved PV instance.

Native project validation now supports indexed equipment terminal connections and rejects missing endpoints, direct self-connections, mixed DC and bonding endpoints, and duplicate pairs. Local TypeScript and three component-bank tests passed. Interactive wiring, AC phase support and network analysis remain open.

The PV wiring candidate adds and removes indexed terminal links from the single-line inspector and renders saved wires. Local Chromium verified creating, saving, reopening and disconnecting a PV series link. AC equipment and calculation integration remain open.

The iC60N batch adds 180 order codes from Schneider Electric Acti9 Catalogue Version 2.0, May 2017, printed pages 8–10. The candidate contains 194 sourced records. Breakers support CSV/JSON, installation inventory, and diagram inspection. Regional availability, AC phase wiring, and protection calculation mapping remain open.

The phase-aware wiring candidate supports L1/L2/L3 links between documented breaker line terminals. Native validation rejects mixed electrical domains and phase conflicts on a pole. Local Chromium verified an L2 link and its diagram label. Neutral, protective earth for AC, and protection simulation remain open.

PR #160 merged as 6ab0d29 after candidate validation. The catalogue navigation candidate filters by category and keeps the model selector to 50 results per page.

The iID batch adds 47 type-AC RCCB order codes from Acti9 Catalogue Version 2.0, May 2017, p. 52. The candidate catalogue contains 241 records. It preserves selective variants and supports neutral links, with fault and protection analyses still open.

Type A expansion adds 34 iID codes from the printed page 53 tables and brings the candidate to 275 sourced records. The exports distinguish residual-current type and both voltage tables.

The generated component-bank coverage manifest measures all 20 owner allocations and checks duplicate identities, source metadata, and terminal IDs. The current candidate contains 275 records in two categories, with 14 PV worksheet mappings and 261 inventory/diagram entries.

Second PV batch published via Pages run 45277253989 for 6ab0d29. The public site returned HTTP 200. The iSW candidate adds 12 sourced control switches and disconnectors and takes the candidate to 287 models across three categories.

Saved equipment merged as 761a601; main validation is run 45277538772. The readiness candidate exposes the source revision, page, terminal groups, applicable worksheet mapping and unverified fields before export.

PV terminal validation now rejects a closed conductor path joining the positive and negative terminals of the same installed module. This is a topology check; system voltage and fault-current calculations remain separate.

Metering starts with four Schneider iEM order codes from S1B45381-03/1, bringing the candidate to 291 sourced records across four categories. S0 terminals are recorded for inspection; pulse circuit editing remains open.

The report candidate includes a terminal wiring schedule with the model-derived BOM. It uses frozen instance names, indexed units, terminal IDs and stored phases.

Saved equipment 761a601 published in Pages run 45278922033; the public site responded HTTP 200. The provenance candidate saves the source page and documented order code alongside model and revision.

Diagram export candidate distinguishes saved terminal links with dashed strokes and renders same-instance wire loops outside the equipment symbol in PDF. Chromium verified the dashed wire and endpoint text in the downloaded SVG.

Workspace backup copy restore was verified with saved catalogue provenance, two indexed PV units and a series link. Both endpoint IDs remain valid in the restored project.

The catalogue generator can export a CSV and JSON file for every model plus an ID index. All 291 candidate records were verified against runtime data in both formats.

The iCT tranche adds eight exact 50 Hz catalogue contactor entries from CA909006E page 74, including manual-selector variants. The candidate contains 299 models. Coil terminals are documented for inspection; control circuit editing remains open.

PV string candidate calculates Voc, Vmp and Imp from the actual terminal links of an isolated identical-module series string at STC. It excludes branches and cycles. This tranche does not calculate cold-weather voltage or inverter compatibility.

Frozen equipment reports now include STC PV series values and module order for supported strings derived from the saved topology.

Terminal storage merged as f7a647d; main validation is run 45281111317. The PV string candidate now calculates published STC nameplate power and Isc in the inspector and frozen report.

The iC60H tranche adds 180 exact order codes from Acti9 2017 pp. 11–13, bringing the candidate to 479 records across four categories. It documents 10 kA Icn at the published voltage and numbered terminals.

The iC60L tranche adds 232 exact order codes from Acti9 2017 pp. 14–15. Candidate total is 711 models. The catalogue distinguishes K/Z-only 1.6 A variants and the published Icn range through 40 A.

Monitoring starts with six Harmony RM17 references covering terminal markings and variant-specific voltage and contact ratings. Candidate total is 717 models across five categories. Sensing and relay terminals are documented for inspection.

Distribution starts with three Linergy DS single-pole blocks with 10, 13 and 14 common-node openings. The candidate contains 720 records across six categories. Phase validation covers the full conductor group.

Earthing starts with three Linergy TB bars from PrismaSeT G D-22, raising the candidate to 723 records across seven categories. The wiring editor supports shared protective bonding terminals between a PV frame and an earth bar.

Transformer coverage starts with 39 Phaseo ABL6TS single-secondary order codes. The candidate contains 762 models across eight categories. Winding terminal inspection is available; model-specific bonding review and simulation mapping remain open.

The Phaseo ABT7PDU batch adds 23 dual-secondary order codes from catalogue p. 11. The candidate now contains 785 records. Nominal winding data, four secondary connection points and jumper-placement distinctions are exported.

Interactive wiring fbcb46a published in Pages run 45283935804; the live root returned HTTP 200. iC60N merged as 2b49aee. The candidate catalogue adds eight Victron AGM batteries, reaching 793 records across nine categories.

iC60N main validation is run 45284128940. The battery wiring candidate supports catalogue AGM terminal links while rejecting indirect shorts and links to PV power terminals. Battery bank analysis remains open.

Battery series candidate shows nominal voltage, C20 capacity and nominal energy for identical batteries linked in an isolated chain. The calculation shares the PV series topology traversal, and battery dispatch remains open.

Frozen reports now include battery series sequence and nominal ratings derived from the saved terminal network.

UPS coverage starts with five APC Easy UPS SMV CAI models. The candidate contains 798 models in ten categories. AC inlet and outlet connectors are documented; battery and dry-contact pinouts remain open.

Inverter coverage starts with 72 Victron VE.Direct 230 V article variants from the manufacturer's voltage and outlet code table. Candidate total is 870 records across 11 categories. Regional availability and calculation mapping remain open.

iC60N 2b49aee published in Pages run 45285905960 and the public root returned HTTP 200. Phase-aware AC wiring merged as 52e1145. The candidate adds 36 VE.Direct 120 V catalogue codes, bringing the total to 906.

- EVlink candidate: 12 Schneider EVlink Home and Home Smart records add EV charging as the twelfth represented category. Candidate total is 918. Catalog and diagram readiness only. Release verification is pending.
- Altivar candidate: 20 compact ATV320 drive order codes bring the stacked catalogue to 938 records across 13 categories. Published ratings and power terminals are included. Auxiliary terminals and calculation mapping are pending.
- LAPP candidate: 37 listed cable articles bring the stacked catalogue to 975 records across 14 categories. Paired core ends, protective earth variants and physical dimensions are included. Article electrical ratings and model mappings remain pending.
- LAPP follow-up: manufacturer family datasheet supplies 300/500 V nominal and 4 kV core-to-core test voltage. Ampacity, impedance and calculation mapping remain pending.
