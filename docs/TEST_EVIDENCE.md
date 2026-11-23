# Test evidence

### Combined-cycle release browser gate correction

Exact main cd84e34 stopped in [run 44941752932](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/44941752932) with the Settings restore region already unmounted. The restore workflow opens the restored active project and routes to Overview. The corrected case waits for a saved initial project and for Overview after restore, then verifies the saved transmission case and its separate recovered copy. TypeScript and three consecutive focused Windows Chromium assertions passed. The local runner stalled during teardown.


## POWERGRID LAB Milestone 2 radial feeder workflow

- `tests/powergridRadial.test.ts`: **6/6 focused numerical tests passed** locally, covering real/reactive balance, constraints, outages and disconnected load, topology and impedance rejection, convergence diagnostics, and validation of saved input shapes. Scoped strict TypeScript, Prettier, and `git diff --check` passed.
- Solver candidate `d658b906e4fd00f76d6eff7523f39048e9ebeae8`, [run 43631680915](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43631680915), passed the full hosted gate. Merged main `5172bcf8191da0e1c98ff0bc907f4a0e745acf04` passed exact-main [run 43632250030](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43632250030); Pages deployed that SHA in [run 43632711123](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43632711123), artifact 14127789492.
- PR #92 candidate [run 43635520709](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43635520709) passed lint, all unit tests, build, full browser and production-browser suites, and update/offline/base-path smoke checks. Exact-main [run 43636068361](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43636068361) passed. Pages [run 43636663764](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43636663764) deployed `4e7d96e5e9186f5bf983fae288eec017a2a64dcc`, artifact 14130169246. Live browser inspection confirmed the radial feeder section and editable controls.

## POWERGRID LAB Milestone 3 PV model local checkpoint

- `tests/pvPerformance.test.ts`: 4/4 tests passed for the calculated default operating point, zero irradiance, temperature response, and invalid input rejection.
- Strict standalone TypeScript check passed with the repository compiler.
- Hosted candidate, browser, production-browser, build and regression checks are pending. No local browser result is claimed.
- Equation sources: [Sandia PVPMC cell-temperature relation](https://pvpmc.sandia.gov/modeling-guide/2-dc-module-iv/cell-temperature/sandia-cell-temperature-model/) and [NREL PVWatts V5 manual](https://pvwatts.nrel.gov/downloads/pvwattsv5.pdf).

## POWERGRID LAB regional preset local checkpoint

- PR #94 deployed the NERC-sourced Nigeria teaching context. Candidate run 43641715412 (artifact 14132353578), exact-main run 43642322293 (artifact 14132742971), and Pages run 43642875461 (artifact 14133250374) passed. Live `#POWERGRID` inspection confirmed the source-linked regional panel.
- The next candidate adds a Germany-inspired 50Hertz-area context. Its unit and browser cases check only the supported voltage inputs change, that the generator terminal is preserved, and that 50Hertz/Bundesnetzagentur source links are rendered. Hosted checks are pending; this worktree has no dependencies for local Vitest/browser execution.

## POWERGRID LAB Milestone 1 focused acceptance release — 14 November 2026

- PR #91 adds parsed JSON download-content and 390 × 844 mobile layout checks. Candidate [run 43633459567](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43633459567) and exact-main [run 43634068700](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43634068700) passed the complete hosted validation. Pages [run 43634569359](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43634569359) deployed `36ac8fb1d98e46311b87a2b85f17d933b5f14a7c`, artifact 14129153822.

## POWERGRID LAB Milestone 1 local checkpoint: 14 November 2026

- Candidate source is being prepared from main `c9876d2afbc8e973c5af0fcbcac6e097e2f6b731`; candidate SHA and hosted receipts will be added after push.
- `npm run typecheck` passed.
- `npm test -- --run tests/powergrid.test.ts` passed 2 tests: 132 kV / 330 kV reference values and invalid/reversed/impossible-loss input rejection.
- `npm run build` passed.
- `npx playwright test tests/browser/powergrid.spec.ts` did not start: the local Playwright web server did not initialize in this restricted environment; stopped without claiming a browser result. Hosted candidate browser and production-browser checks are pending.
- Hosted candidate `c106bcb6eedbc0a8e3edc66081d11dfdcf6af1ed`, [run 43625392065](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43625392065): lint, unit tests and build passed. Full browser suite: 89 passed, one existing test skipped, two failed. The new direct-route/history/save/reload/CSV test passed. Follow-up `ff0e44c87668e21a63e2b25fc9067180f4ee4ca5`, [run 43626174287](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43626174287), again passed lint, unit tests and build but had the same two Help/BOT assertions. Follow-up `609211b01d6b2a6dc2afff9fe161a1253550e0c4`, [run 43627519047](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43627519047), passed lint, unit tests and build, with 89 browser passes, one skip and two failures. The tour reached the first guide but the inserted PowerGrid guide shifted the existing Save/Recover lesson; it is moved after the existing workflow list. The PowerGrid guide was found, but its assertion matched both the result button and heading; the test now targets the heading. Awaiting hosted rerun.

## POWERGRID LAB successful release — PR #88

- Candidate `c64cff8a9fe736002e54765b71bdb84f65fb69fc`, [run 43628170719](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43628170719), artifact 14127183215, passed lint, unit tests, build, full browser, production-browser, update, offline and base-path smoke checks.
- Merged as `c50ff66ca1865e866410f00b832c35fd4effe8a2`; exact-main [run 43628826181](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43628826181), artifact 14126429450, passed the same gate. Pages [run 43629332412](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43629332412) deployed that SHA, output artifact 14126688875.
- Public URL `https://adigunpowerlab.hephzibahbehulah.com/#POWERGRID` rendered during attached-browser inspection. Browser automation covers direct route, refresh, Back/Forward, local save/reload, CSV download, invalid loss input and Help search. A dedicated JSON-download assertion and explicit PowerGrid mobile-layout check remain open.

## PR #85 reviewed BOT circuit removal: 14 November 2026

- Candidate `8899824efdb87f4ea2eaa8a842e424dd7a549f84` passed the complete gate in [run 43621266571](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43621266571), artifact 14124377035: lint, 405 unit tests, build, 89 browser tests, 17 production-browser tests, update smoke checks and offline smoke checks. Coverage checks exact-name lookup, missing and ambiguous-name rejection, no mutation before Apply, keeping connected loads unassigned after circuit removal, Undo restoring assignments, and the Help guidance.
- Main `a492ece59ba238e2aa7c4d7ac5e22dd47928b247` passed the same complete gate in [run 43621865533](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43621865533), artifact 14125010983. Pages deployed that exact SHA in [run 43622340824](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43622340824), output artifact 14124358028.

## PR #83 reviewed BOT load deletion: 14 November 2026

- Candidate `d03d088e56abc8ecfd464ebc851383dd6b607324` passed the complete gate in [run 43615716912](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43615716912), artifact 14122267292: lint, 402 unit tests, build, 88 browser tests, 17 production-browser tests, update smoke checks and offline smoke checks. Coverage verifies exact-name lookup, missing/ambiguous-name safety, dependent schedule cleanup through the command adapter, and preview/Apply/Undo through the live BOT UI.
- Main `28cacbdf1fad5c92871ccbb38f2261a85227699a` passed the same complete gate in [run 43616319272](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43616319272), artifact 14122387659. Pages deployed the exact SHA in [run 43616757924](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43616757924), output artifact 14122316989. The public custom-domain app loaded after publication.

## PR #81 Project menu guide and navigation coverage: 14 November 2026

- Candidate `e6716a2d782958405bc44cd57ddeb323ee7de6a0` passed the complete gate in [run 43610941434](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43610941434), artifact 14120576971. The suite checks the Project menu Help search, all 18 non-Help sidebar route mappings, preserved onboarding-first tour order, and the full browser/production-browser gates.
- Merged main `48a6aedaec397709749dd3b50f5888636b517e6d` passed exact-main validation in [run 43611545819](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43611545819), artifact 14120059224. Pages published that exact SHA in [run 43612079405](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43612079405), output artifact 14120318756. The live custom-domain Help search displayed the Project menu article and its create/open, copy, import/export, history and trash-recovery steps.
- Earlier candidates caught a case-sensitive assertion (43609442046), a tour-order regression (43610072073), and a truncated source upload detected by lint (43610622127). Each was corrected before the passing candidate. No customer data was used.

## PR #80 Adigun BOT command guide: 14 November 2026

- Candidate `7470e1d56ffc1e5c400ff5ed9eecb67c5f578478` passed in [run 43607280097](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43607280097), artifact 14118512065.
- Main `c950a9561a794aa48bad040f7200e31fc00f6cca` passed exact-main validation in [run 43607828871](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43607828871), artifact 14118599245; Pages deployed that exact SHA in [run 43608405600](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43608405600), output artifact 14119143020.

## PR #79 PR 78 release-documentation receipt: 14 November 2026

- Documentation candidate `e3cc54f0357f4362335746f1421c3987485870b8` passed in [run 43606238930](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43606238930), artifact 14118074831.
- Main `9c3f3f7c3aa53c2dbc18d746233d6802e0c5bc8a` passed exact-main validation in [run 43606773298](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43606773298), artifact 14119025956; Pages deployed the exact SHA in [run 43607211932](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43607211932), output artifact 14119445278. Documentation only.

## PR #78 unsaved-project safety: 14 November 2026

- Candidate `1cc3112e062cfd5bc81813039dc5a6b9a95d3950` passed the complete repository gate in [run 43604816765](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43604816765), artifact 14117752333. This includes the real quota-failure beforeunload prompt, discarded unsaved draft, clean saved-state reload, and recovery-copy selection checks.
- Main `2917b0858a708668585a586cbf595781a9a8e88c` passed exact-main validation in [run 43605406593](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43605406593), artifact 14118108213. Pages published that exact SHA in [run 43605816807](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43605816807), output artifact 14118038347. The public page and compiled bundle returned HTTP 200, and the bundle includes the new warning and clean-load behavior.
- Initial candidate runs 43603762965 and 43604298371 exposed saved-metadata and recovery-copy preference regressions; both were fixed before the passing candidate. No customer data was used.

## PR #77 BOT duplicate-load proposal guard: 14 November 2026

- Candidate `aecf4759e773ac6ccb760e650892b69339e1e7a3` passed in [run 43600464867](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43600464867), artifact 14116456475.
- Main `9160d7072a73ab8c6a78b1b661b91e7c527ade92` passed [run 43600926807](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43600926807), artifact 14116412540; Pages deployed the exact SHA in [run 43601437856](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43601437856), artifact 14116129842.

## PR #76 release-documentation receipt: 14 November 2026

- Documentation candidate passed in [run 43598835538](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43598835538), artifact 14114749719. Main `27cab8c1084f5ddbe1938cee97df636f93e395bd` passed in [run 43599397505](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43599397505), artifact 14116465690; Pages deployed the exact SHA in [run 43599902573](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43599902573), artifact 14116300873.

## PR #75 documentation deployment receipts: 14 November 2026

- **PR #75:** records candidate, exact-main and Pages receipts for PRs #73 and #74; documentation only.
- Candidate full CI passed in [run 43597753191](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43597753191), artifact 14114849492.
- Main `6796ef4ed2bf5ae93ce6cf64d1d8b373ff328d00` passed full CI in [run 43598231509](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43598231509), artifact 14114249813; Pages deployed the exact SHA in [run 43598693643](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43598693643), output artifact 14114763737.

## PR #74 Adigun BOT kW rating guard: 14 November 2026

- **PR #74:** browser acceptance changes a synthetic load to amps entry mode, submits a kW-only rating edit and verifies a localized mode error, no proposal/apply control, and unchanged saved entry mode and rating.
- Initial candidate [run 43596330967](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43596330967) caught a browser assertion that omitted the editor’s unit-qualified Rating label. Corrected full candidate CI passed in [run 43596817884](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43596817884), artifact 14114538581.
- Main `767fdfc89845064ce0c0432ea55b6005bd3db7b7` passed full CI in [run 43597191329](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43597191329), artifact 14114413057; Pages deployed the exact SHA in [run 43597548115](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43597548115), output artifact 14114893256.

## PR #73 documentation deployment receipts: 14 November 2026

- **PR #73:** records candidate, exact-main and Pages evidence for PRs #71 and #72; documentation only.
- Candidate full CI passed in [run 43595044387](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43595044387), artifact 14113799154.
- Main `f14d86c4ecadfd4cf3c63d4c27f420fe3a8efae4` passed full CI in [run 43595474128](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43595474128), artifact 14114565917; Pages deployed the exact SHA in [run 43595879055](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43595879055), output artifact 14114730595.

## PR #72 Adigun BOT empty load-name rejection: 14 November 2026

- **PR #72:** recognizes an edit command with an empty name value, shows a specific validation error and does not propose or apply a change. Parser immutability, exact translations and browser feedback are covered; all test records are synthetic.
- Candidate full CI passed in [run 43593949538](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43593949538), artifact 14113577858.
- Main `43896c8e4c6780da2d566d626ee735db8009e2ec` passed full CI in [run 43594406795](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43594406795), artifact 14114037141; Pages deployed the exact SHA in [run 43594831964](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43594831964), output artifact 14113803042.

## PR #71 documentation deployment receipts: 14 November 2026

- **PR #71:** records PR #69 and #70 release receipts and updates the deployment checkpoint; documentation only.
- Candidate full CI passed in [run 43592360700](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43592360700), artifact 14112624062.
- Main `e17fd88d7bd4f89b1c6476d8003925fa8ff85507` passed full CI in [run 43592734619](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43592734619), artifact 14113017515; Pages deployed the exact SHA in [run 43593121674](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43593121674), output artifact 14112744468.

## PR #70 Adigun BOT duplicate-name rename rejection: 14 November 2026

- **PR #70:** browser acceptance verifies renaming a load to an existing exact name is rejected without proposal or apply action and preserves both synthetic loads. The rejection message has exact translations in all four locales.
- Initial candidate [runs 43590624060](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43590624060) and [43590885196](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43590885196) stopped at lint for formatting. Corrected full candidate CI passed in [run 43591257915](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43591257915), artifact 14112372571.
- Main `6b90f0663e116a6d52c9af0f18c46f4899898555` passed full CI in [run 43591679610](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43591679610), artifact 14112727768; Pages deployed the exact SHA in [run 43592075725](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43592075725), output artifact 14112917165.

## PR #69 documentation deployment receipts: 14 November 2026

- **PR #69:** records PR #67 and #68 candidate, main and Pages receipts; no application behavior changed.
- Candidate full CI passed in [run 43589512290](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43589512290), artifact 14112141190.
- Main `c7faf38fc3cd07538bc61e1a53b9ae5068e5abab` passed full CI in [run 43589973832](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43589973832), artifact 14111123851; Pages deployed the exact SHA in [run 43590375885](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43590375885), output artifact 14111859672.

## PR #68 Adigun BOT zero-quantity edit rejection: 14 November 2026

- **PR #68:** browser acceptance submits a numeric zero quantity and verifies the positive-integer error, no proposal or apply action, and unchanged quantity 1. Exact translations are checked in English, German, Yorùbá and Nigerian Pidgin.
- Candidate full CI passed in [run 43412558377](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43412558377).
- Main `f2cb9698f0d8469d41acfad028c7075b357b182c` passed full CI in [run 43588909128](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43588909128); Pages deployed the exact SHA in [run 43589261888](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43589261888). Validated source artifact 14111312228; Pages output artifact 14111498060. Candidate artifact 14031000720.

## PR #67 documentation deployment receipts: 14 November 2026

- **PR #67:** records PR #65 and #66 candidate, main and Pages evidence; documentation only.
- Candidate full CI passed in [run 43410664316](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43410664316).
- Main `f39be13183f94b66c94009bbdaccb4fa97d1ed75` passed full CI in [run 43411388409](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43411388409); Pages deployed the exact SHA in [run 43412132909](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43412132909). Validated source artifact 14030515152; Pages output artifact 14030440430.

## PR #66 Adigun BOT validation-message localization: 13 November 2026

- **PR #66:** adds German, Yorùbá and Nigerian Pidgin translations for ambiguous-target, invalid-numeric and missing-target load-edit errors; exact translations are checked in all four locales.
- Initial candidate [run 43408661877](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43408661877) stopped at lint for test formatting. Corrected full candidate CI passed in [run 43408751207](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43408751207).
- Main `7ae0dce814a20ddd581341b7936d631995789943` passed full CI in [run 43409514890](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43409514890); Pages deployed the exact SHA in [run 43410192205](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43410192205). Pages used source artifact 14029725629; output artifact 14029660706. Candidate artifact 14029290832.

## PR #65 documentation deployment receipts: 13 November 2026

- **PR #65:** records PR #63 and #64 candidate, main and Pages receipts; documentation only.
- Candidate full CI passed in [run 43406796206](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43406796206).
- Main `fd4b8f9286c1411a15a6e7017033b8e1642d8bff` passed full CI in [run 43407547594](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43407547594); Pages deployed the exact SHA in [run 43408249009](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43408249009). Source artifact 14028311943; Pages output artifact 14027144850.

## PR #64 Adigun BOT missing-target rejection coverage: 13 November 2026

- **PR #64:** browser acceptance checks that editing a nonexistent exact-name load returns the validation error, creates no proposal or apply action, and leaves the existing fixture quantity unchanged.
- Candidate full CI passed in [run 43405037858](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43405037858).
- Merged main `eca076187c9d1efc0d0ada12f73389351048947c` passed full CI in [run 43405812091](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43405812091); Pages deployed the exact SHA in [run 43406413405](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43406413405). Pages selected validation artifact 14026419689; its output artifact is 14027088565. Candidate artifact 14027810345.
- All test records are synthetic and isolated.

## PR #63 documentation deployment receipts: 13 November 2026

- **PR #63:** records PR #61 and #62 release evidence; documentation only.
- Candidate full CI passed in [run 43386533381](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43386533381).
- Merged main `def2872fbb535c1e9de6c1a49b6d9254cf3ac843` passed full CI in [run 43387181107](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43387181107); Pages deployed the exact SHA in [run 43387757736](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43387757736). Pages source artifact 14018744305; Pages output artifact 14019019231.

## PR #62 Adigun BOT invalid numeric edit rejection: 13 November 2026

- **PR #62:** browser acceptance verifies invalid nonnumeric quantity input returns the actual validation error, produces no proposal or apply action, and preserves the saved quantity.
- Candidate full CI passed in [run 43384735224](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43384735224).
- Merged main `0e7a42aad932aabc3e1b6e6a0af99c4890227ed0` passed full CI in [run 43385494386](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43385494386); Pages deployed the exact SHA in [run 43386104306](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43386104306). Its summary identifies validation run 43385494386 and source artifact 14018457563; the Pages artifact is 14018128993.

## PR #61 documentation deployment receipts: 13 November 2026

- **PR #61:** records PR #59 and #60 release evidence; documentation only, with no application behavior change.
- Candidate full CI passed in [run 43382996724](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43382996724).
- Merged main `2b1091f0a164bdd44b59736a40abfc546cf54be9` passed full CI in [run 43383782916](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43383782916); Pages deployed the exact SHA in [run 43384403523](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43384403523). Its summary identifies validation run 43383782916 and source artifact 14018155456; the Pages artifact is 14018225324.

## PR #60 Adigun BOT ambiguous-target rejection: 13 November 2026

- **PR #60:** browser acceptance verifies an exact-name edit is rejected when the load name matches two records, no confirmation proposal is offered, and both fixture loads remain intact.
- Candidate full CI passed in [run 43381259544](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43381259544).
- Merged main `dea20cd2708758cdfbaa172ef5663abb7c2f1ad9` passed full CI in [run 43382006964](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43382006964); Pages deployed the exact SHA in [run 43382706488](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43382706488). Its summary identifies validation run 43382006964 and source artifact 14017501602; the Pages artifact is 14017740914.

## PR #59 documentation deployment receipts: 13 November 2026

- **PR #59:** records PR #57 and #58 release evidence; this documentation-only change did not change application behavior.
- Candidate full CI passed in [run 43379723844](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43379723844).
- Merged main `a5a5134dbeaa664d17e8df79736f835db6bdf8ae` passed full CI in [run 43380437451](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43380437451); Pages deployed the exact SHA in [run 43381059156](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43381059156). Its summary identifies validation run 43380437451 and source artifact 14016358931; the Pages artifact is 14016408467.

## PR #58 Load Schedule context-menu actions: 13 November 2026

- **PR #58:** browser acceptance covers Inspect selection, Duplicate, and Delete review cancellation/confirmation. The isolated analytical heater fixture does not use client data.
- The first candidate [run 43377155127](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43377155127) caught a test selector that matched both original and copied rows. After narrowing the selector, corrected full CI passed in [run 43377948197](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43377948197).
- Merged main `cc392fac1933fe595dbadec47b185231cb92436f` passed full CI in [run 43378669557](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43378669557); Pages deployed the same SHA in [run 43379271903](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43379271903). Its summary identifies validation run 43378669557 and source artifact 14015941593; the Pages artifact is 14015777416.

## PR #57 documentation deployment receipts: 13 November 2026

- **PR #57:** records the verified releases of PR #55 and PR #56; documentation only, with no application behavior change.
- Candidate full CI passed in [run 43375668435](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43375668435).
- Merged main `8f783be117fc3b461789d1e1367f3f7944a21656` passed full CI in [run 43376375253](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43376375253); Pages deployed the same SHA in [run 43376891970](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43376891970). Its summary identifies validation run 43376375253 and source artifact 14014742472; the Pages artifact is 14014837606.

## PR #56 Load Schedule context-menu acceptance: 13 November 2026

- **PR #56:** browser acceptance verifies pointer and Shift+F10 opening, arrow/Home/End navigation, Escape focus return and the Edit action. It uses an isolated analytical heater fixture; no client data is touched.
- Candidate full CI passed in [run 43374323130](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43374323130).
- Merged main `acafc46e0285434abba82984657fc553fdbc60d4` passed full CI in [run 43374887506](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43374887506); Pages deployed the exact SHA in [run 43375409749](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43375409749). Its summary identifies validation run 43374887506 and source artifact 14013394007; the Pages artifact is 14014108069.

## PR #55 documentation deployment receipt: 13 November 2026

- **PR #55:** records PR #54's release evidence; this documentation-only change does not alter application behavior.
- Candidate full CI passed in [run 43373318062](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43373318062).
- Merged main `177e38623e46b13f3ab1f464f736ffe6953fdeeb` passed full CI in [run 43373893178](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43373893178); Pages deployed the exact SHA in [run 43374451469](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43374451469). Its summary identifies validation run 43373893178 and source artifact 14013578423; the Pages artifact is 14013912704.

## Confirmed BOT load-to-board assignment: 13 November 2026

- **PR #50:** exact-name load-to-board assignment shows the destination and circuit detachment before confirmation; unit and browser fixtures use isolated project records.
- Candidate full CI passed in [run 43365964376](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43365964376).
- Merged main `f90c3346a0c713fbfcb35e991233ac508f4861b6` passed full CI in [run 43366668790](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43366668790); Pages deployed that SHA in [run 43367266954](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43367266954).

## BOT window lifecycle acceptance: 13 November 2026

- **PR #48:** browser coverage verifies keyboard repositioning, minimize/restore, maximize/restore, close/reopen, persisted geometry and session conversation retention.
- Candidate full CI passed in [run 43361011720](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43361011720).
- Merged main `52a3165d8d0856196602258469aba5307c128db3` passed full CI in [run 43361669486](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43361669486); Pages deployed that SHA in [run 43362136134](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43362136134).

## Confirmed BOT load-to-circuit assignment: 13 November 2026

- **PR #46:** exact-name BOT assignment uses a reviewed preview and explicit confirmation; board and phase side effects are visible before applying.
- Candidate full CI passed in [run 43357419432](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43357419432).
- Merged main `b2ff3a38045020a3489f8c9cc6652adbd0973ee5` passed full CI in [run 43358065181](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43358065181); Pages deployed that SHA in [run 43358633684](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43358633684).
- Browser coverage uses an isolated project fixture. No client project data was used.

## Spatial object inspection detail mode: 13 November 2026

- **PR #44:** the selected spatial object’s descriptive detail follows Simple/Engineering mode. Its name and representative kW value remain visible in both modes.
- Candidate full CI passed in [run 43353163135](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43353163135).
- Merged main `4d5fd78d2efc4aabeb5ef9a8078e864e41d50ed1` passed full validation in [run 43353747498](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43353747498); Pages deployed that SHA in [run 43354410218](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43354410218).
- Browser coverage uses the existing test-only analytical spatial fixture. No client graph or measured telemetry was added.

## Source equipment assessment detail mode: 13 November 2026

- **PR #42:** source-equipment assessment method collapses in Simple mode and opens in Engineering mode; check results remain visible. Browser coverage switches modes on a test-only entered source record.
- Candidate full CI passed in [run 43349206656](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43349206656).
- Merged main `5452c70113bce43eb6183aa52d5ed489f80f4075` passed full validation in [run 43349934690](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43349934690); Pages deployed that SHA in [run 43350626746](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43350626746).

## BOT phase assignment continuation: 13 November 2026

- **PR #40:** deterministic exact-name `phase load: Name; L2` proposal; previews affected circuit load changes, shows changed fields, requires confirmation, and applies via project history.
- Candidate full CI passed in [run 43341542625](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43341542625).
- Merged main `fe2fc976a053eb9b16476a3191a3e0bafc29056e` passed full validation in [run 43344985411](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43344985411); Pages deployed that SHA in [run 43345697205](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43345697205).
- Targeted local validation: TypeScript typecheck and 13 BOT unit tests passed. Full candidate and exact-main gates include browser, production-browser, update and offline checks. No client project data was used.

## Feeder method detail-mode release receipts: 13 November 2026

- **PR #38:** candidate [run 43338929618](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43338929618), exact-main [run 43339729808](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43339729808), and Pages [run 43340449448](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43340449448) passed.
- **PR #39** records those receipts; its candidate [run 43340848186](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43340848186), exact-main [run 43341616807](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43341616807), and Pages [run 43342350512](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43342350512) passed.

## Measurement detail-mode continuation: 12 November 2026

- **PR #22:** measurement assumptions follow the global detail preference; missing-coverage warnings stay open in Simple mode. Test-only complete and gapped CSV intervals exercise mode changes.
- Candidate `23546074122c73489ff5fb6fcc8a867947aa57b9` passed all gates in [run 43263530787](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43263530787).
- Merged main `17524b2d86b07b53a8072a3a198065eceb97f4ed` passed full validation in [run 43264630710](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43264630710); Pages deployed that SHA in [run 43265546630](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43265546630).
- No client measurement data was used. Manual live browser inspection was unavailable because desktop browser control timed out; production-browser CI passed.

## Client visual continuation: 12 November 2026

Three individually merged milestones use the client screenshots as layout targets without importing their example data.

- **PR #7 / Single-Line Studio:** candidate head `d9f86424f507cbb7b82be3d5feb904b4cca57fc1` passed lint/typecheck, 386 unit tests/26 files, build, browser, production-browser, update and offline checks in [run 43218259418](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43218259418). Merged as `c6eb8223596cc64ec391ca43aab1e11e7805b9c1`; Pages deployed in [run 43219911880](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43219911880). The live diagram was checked at 1280 × 720; object/board selectors and inspector were visible.
- **PR #8 / Cable worksheet:** candidate head `809082d8b72189a6674c3a39be5fd5ee4bb6361f` passed lint/typecheck, 386 unit tests/26 files, build, browser, production-browser, update and offline checks in [run 43220484336](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43220484336). Merged as `f6543d634112f8b30ae57596bd12ff03a6ee5095`; Pages deployed in [run 43222118888](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43222118888). The live route showed a blank T16 form, 11 searchable tools and cumulative feeder assessment below.
- **PR #9 / Compact overview:** candidate head `650e3601e247a6cbe3171556b267fcaa6b49baf5` passed lint/typecheck, 386 unit tests/26 files, build, 58 browser cases, 15 production-browser cases, and root/subpath update and offline checks in [run 43222958314](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43222958314). Merged as `8d1fb60ccba760534bf4091be77147d088dfcae2`; exact-main validation passed in [run 43223694766](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43223694766), then Pages deployment passed in [run 43224476885](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43224476885). The live overview was reloaded and visually checked at 1280 × 720.

- **PR #10 / release record:** candidate head `0728aba31dde8340cf32d7e5ececca78d9b56c54` passed in [run 43225997336](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43225997336); merged main `2ea575e5f976a89d0b208ea791f3ffbb59d84f0c` passed [run 43226827482](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43226827482); Pages publication passed [run 43227425806](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43227425806).
- **PR #11 / toolbox detail mode:** candidate head `b1b3cf03e96e54fad3c2800e240c84ae53ff89b8` passed in [run 43227487970](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43227487970); merged main `d1c46c8e8b6b2e56891620b3654a657f780e15d0` passed [run 43228398421](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43228398421); Pages publication passed [run 43229179697](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43229179697). The live custom-domain calculation returned 10 A for 230 V / 23 Ω and showed the formula only in Engineering mode.

The update smoke fixture reported interrupted-install preservation, waiting-update survival across reload, unsaved-bill activation guard, saved-bill update recovery, old-cache cleanup, previous-valid-cache retention, unrelated-cache preservation and current navigation shell preservation as true, with zero page errors. It ran at both `/` and `/AdigunPowerLab/`.

- **PR #13 / Renewables detail mode:** candidate head `82809ba30fb7ef6c1d07a30fe4853f2ff970358e` passed in [run 43232433695](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43232433695); merged main `2f865242cf10808b3f08b5a2ed1385344c478146` passed [run 43233246035](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43233246035); Pages publication passed [run 43233917943](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43233917943). Live Simple view retained the PV daily estimate and collapsed its method; Engineering showed `PV = kWp × h × PR`.
- **PR #14 / EV detail mode:** corrected candidate head `981a138c1112e79a00821c22307f31465d85e117` passed in [run 43235233184](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43235233184); merged main `cc7b83370e1ee57a032c79151edc8ddd0907e360` passed [run 43236165699](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43236165699); Pages publication passed [run 43237057255](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43237057255). Live Simple view showed a collapsed Method and visible assumptions note; Engineering showed the EV scheduling method.

- **PR #16 / Costs & Carbon tariff detail mode:** corrected candidate head `af9c5b804c5d77575b94d7601c4fc8fa6128f1c0` passed the full CI gate in [run 43244230000](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43244230000). The new browser case checks essential rate and carbon fields in Simple mode, collapsed billing rules, expansion and Add tariff band, and Engineering expansion. An initial exact candidate run [43243258011](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43243258011) exposed an ambiguous selector because the section contains a nested disclosure; the test now targets its direct summary. Merged main `1b538295b43d8eda1ce2ca46f9240c964aaaa34d` passed [validation run 43245232196](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43245232196), followed by Pages [run 43245983581](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43245983581). Live custom-domain checks confirmed both modes, core fields, Save, expansion and no browser console errors. The live empty project labels the default import price as an editable assumption and explicitly says it is not a retrieved tariff.

- **PR #18 / scenario baseline detail mode:** corrected candidate head `865368920c80e9d095f4ed33e27bb7d0a66124cc` passed the full CI gate in [run 43249735796](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43249735796). Browser coverage verifies baseline differences collapse in Simple and open in Engineering. The first candidate `a0ad2775b07589de172e42bf60c9013e3804487c` was superseded after source-integrity review caught a truncated App.tsx copy; its failed run [43249526433](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43249526433) is not counted as a pass. Merged main `bbc7712f0e97a1fb11bc12d1dd511e0ee6a3102b` passed [validation run 43250741903](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43250741903), then Pages [run 43251513566](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43251513566). Live verification activated the update and observed “Changes from baseline (0)” collapsed in Simple, expanded in Engineering, and no browser console errors. No client scenario data was used.

- **PR #20 / dated comparison detail mode:** corrected candidate head `ebeff8a4cc189d02395e02e05c37b8f875e233d1` passed the full CI gate in [run 43254725006](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43254725006). The browser case adds an explicitly test-only load, runs the actual dated comparison worker, verifies the methods/assumptions/unresolved-check disclosure is collapsed in Simple and open in Engineering, and confirms the result export remains visible. Merged main `e1e9b8bb2490c3ad194e1b8432349f9d19181592` passed [validation run 43257414900](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43257414900), then Pages [run 43258262229](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43258262229). The live empty client workspace did not have loads, so no dated comparison was run there; no client data was added. Engineering mode was restored, and the browser reported no console errors.

These are repository and browser checks, not customer engineering data, regulatory certification, hardware tests, professional language review or an independent accessibility audit.

## Localized toolbox continuation: 7 November 2026

Based on main `18f7a04`; first source checkpoint `b792614`. Focused checks passed 15 search unit cases, TypeScript, two real browser flows, YAML parsing and 10 Pages/provenance guard cases. Search coverage includes all four displayed languages, English fallback, German category/description matching, accented and unaccented Yoruba, whitespace/ID matching and no-result recovery. Browser evidence preserves the calculated worksheet JSON through search and language changes and restores keyboard focus after clearing an empty search.

`npm ci` passed in the separate continuation worktree. Complete lint/unit/build/browser/production/update/offline gates, fresh-checkout recovery, exact candidate/main revisions and deployed live checks are recorded in [PR #6](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/6) as they complete. No pending gate is counted as passed. Existing electrical, billing, storage and help acceptance below remains historical evidence, not a new measurement.

## Searchable-help continuation: 6 November 2026

Frozen application checkpoint: `4112b88891b0c549152fc3c70e2d797810c41ecc`. Release/integration receipts, including the final exact candidate and all workflow conclusions, are maintained in [PR #5](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/5). Subsequent release-documentation changes do not substitute for the full exact-revision repository workflow.

- Fresh-checkout recovery reproduced `npm ci`, `npm run lint`, `npm test` (**371/371 across 25 files**) and `npm run build`.
- `tests/help-search.test.ts` and `tests/i18n.test.ts`: **24/24 passed**, including all 51 tool IDs in four languages, actual localized save-error queries, accent-insensitive search, unknown queries and complete displayed-guide translation coverage.
- `tests/browser/help-support.spec.ts` covers visible desktop/mobile help, keyboard/focus lifecycle, localized search, command handoff, real 230 V / 23 Ω = 10 A calculation, repeated tool requests, unchanged project exports/reload, unfinished form protection and cached production help.
- Focused production calculation/navigation/persistence checks passed without weakening numerical assertions. An earlier development-only calculation check failed during active translation editing; concurrent HMR is a plausible but unproven cause. Final suites run against frozen files and built assets.
- Inspected desktop and 360 px mobile screenshots. The mobile page width was exactly 360 px and the help dialog scroll/client widths matched; no horizontal page overflow or page errors were observed.
- Deployment YAML parsing and 33 mocked workflow/provenance/failure/stale-main checks passed. Artifact fields were additionally checked against the actual GitHub artifact API. These checks are not the final live deployment receipt.
- Required final gates: complete development browser suite; production browser suite including offline help; `update-smoke.mjs` and `offline-smoke.mjs` at both `/` and `/AdigunPowerLab/`; successful repository CI on the final candidate and merged main; successful Pages deployment and live UI verification. See the release record for their observed results.

Professional translation review, independent accessibility certification, connected-service testing and hardware validation are not claimed.

## Historical workflow continuation: 6 November 2026

Locally verified source: `93d5e46b484ac787c0b57249e2eaea10dd179ef8`. This recovers the continuation based on remote `0905f574216a36207698454501a6b8f6147d76c9`, repairs feeder/circuit evidence and exact tariff boundaries, and updates report capacity visibility and no-op circuit controls. Published branch `51736e6f17987e113f663662919f6318f37b8a84` includes the final documentation checkpoint; merged and deployed main is `92d5c437f7b48f2f6ea65ae55c5aa3d2992aefa9`.

### Numerical and rendered-output checks

- `npm ci`: passed using the pinned lockfile.
- `npm test`: **331/331 tests across 21 files passed** (6.90 seconds in the working checkout). This includes the independent 1,000-load/35,040-interval annual fixture; Node timing is not browser interaction latency.
- Independent new regressions cover neutral-conductor overload, mixed AC/DC boundaries, real DC circuit current, missing PF evidence, separate exported capacity checks, fractional import/export tariff boundaries, coverage gaps, demand eligibility and DST transitions.
- `npm run build`: passed after TypeScript checks.
- `POWERLAB_PDF_QA_DIR=... npm test -- tests/reports.test.ts`: 5/5 passed and produced actual Yoruba engineering-report and German vector-diagram samples.
- PDF visual QA: rendered and inspected all 10 report pages and 3 diagram pages. Text/table/Unicode placement remained readable; pdfplumber found zero out-of-page glyphs. Vector diagrams intentionally use overlapping tiles with a separate complete legend. Samples in `docs/examples/` contain analytical inputs only.
- Desktop workspace and 360 px mobile settings screenshots were inspected. This is sampled layout review, not independent WCAG certification.

### Browser and offline gates

- Initial browser gate: 28 passed, 4 failed. Two failures were stale locale/ambiguous SVG selectors; one exposed an unchanged circuit selection raising a spurious error; recovery failed during concurrent source edits and required a stable rerun. These failures are not counted as passes.
- The next stable run passed 31/32: a spatial assertion still matched hidden nameplate text rather than displayed hourly power. The assertion was narrowed to the visible power value and independently passed its focused rerun.
- **Final independent-checkout browser gate: 32/32 passed in 2.1 minutes** at `93d5e46b484ac787c0b57249e2eaea10dd179ef8`, including all 51 toolbox examples and the previously failing recovery/billing/planning/spatial cases. No application source was edited during this run.
- Production offline checks passed at both `/` and `/AdigunPowerLab/`: service worker control, saved-project recovery, toolbox calculation, lazy billing and actual PDF export, with zero page errors and zero failed requests.
- Clean-checkout recovery: a new local Git clone at `77d02dc406d384d9a709ef69e2c85282fe9201c6`, with no copied source or node_modules, passed `npm ci`, lint, all 331 tests (7.77 seconds), production build and repository-subpath offline/PDF. The checkout then fast-forwarded to `93d5e46b484ac787c0b57249e2eaea10dd179ef8`, changing only one browser assertion file, and passed lint and all 32 browser cases. Application source, dependencies and build configuration are identical across these revisions. This is local recovery evidence, not proof of a new remote backup.

### Publication and limits

The initial public push was rejected for missing explicit publication authorization. The owner subsequently gave full approval to push, merge into main and deploy publicly on 6 November 2026. The approved publication then completed through [PR #2](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/2).

- Remote branch validation [42168975954](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/42168975954) and PR validation [42168980729](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/42168980729) both succeeded. Clean installation, lint, unit tests, build, browser tests, root offline and repository-subpath offline checks all passed.
- Uploaded branch and merged main match verified tree `d3c925aece07c5b56ae5011a338eb18abb93a5d0` exactly.
- Pages workflow [42169441584](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/42169441584) successfully built and deployed exact main revision `92d5c437f7b48f2f6ea65ae55c5aa3d2992aefa9`. See `DEPLOYMENT.md` for the public URL and release receipts.
- Post-merge validation [42169342041](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/42169342041) also completed successfully for that exact revision.
- Public interactive checks passed: Engine 1.1.0; 2.3 kW / 230 V → 10 A and 18.4 kWh; 50% duty → 9.2 kWh with 10 A unchanged; saved reload; frozen report/BOM with matching exported revision 4; analytical bill total €53.53 and a real one-page PDF download. PDF signature, trailer, document reference and total were independently checked. Exact values and export fingerprints are in `continuation-verification.json`.
- The first terminal-browser attempt lacked its expected executable; the next launched Chromium but received `ERR_EMPTY_RESPONSE` before any app assertions. Those environment failures are preserved as failures, and the live checks above were completed using the supported cloud browser.

No physical hardware, licensed standards/manufacturer dataset, connected AI, cloud ownership/security, professional language review, full independent accessibility audit or exhaustive original-spec acceptance is claimed. Historical browser performance below belongs to the earlier release.

## Historical initial release

Final candidate verification is being recorded here. No unrun check is counted as passed.

### Verification environment and checks

Environment: Node 24.22.1, Linux managed workspace. Dependencies are pinned by the committed lockfile.

- `npm run typecheck`: passed after integration syntax repairs.
- `npm test`: **215 tests across 8 files passed** in the final numerical/reference run (4.91 seconds). Covers independent electrical, calendar/DST, battery/conservation, EV, toolbox, billing/PDF and performance fixtures.
- `npm run build`: passed; lazy report and BOT chunks plus scoped service worker were generated.
- PDF QA: seven-page English/Yoruba customer estimates and six-page German engineering report generated from explicit analytical fixtures, rendered and inspected. Repeated headers, totals and Unicode checked. pdfplumber found no out-of-page glyphs.
- Browser QA: empty project, 2.3 kW heater → 10 A and 18.4 kWh; 50% duty → 9.2 kWh while current remains 10 A; undo, JSON export and saved reload passed. Malformed JSON preserved the current project; valid CSV preview/apply passed.

### Browser runtime

The standard Chromium binary cannot initialize its process-singleton socket in this runtime. The installed headless-shell binary is usable in a single-process configuration. The local Playwright fixture therefore creates a fresh browser per test; ordinary environments use standard Chromium. Development server and browser must share the same execution process tree in this environment.

The first full browser run exposed test-harness lifecycle/selector defects. Those failures were retained and repaired; they were not counted as application successes. The final combined browser result is recorded below after rerun.

### Additional executed checks

- Workspace: 6 browser tests passed, including every tool example, DST CSV, local BOT confirmation/undo, locale/theme and mobile flows.
- Recovery: 5 browser tests passed for conflicting tabs, save-copy recovery, trash protection, invalid stored records, calendar cancellation and unsaved input safety.
- Measurements: 1 actual browser CSV/save/reload/backup/mobile test passed.
- Billing: 1 actual browser test passed for exact €53.53, persistence, PDF signature, print lifecycle, Yoruba and 390 px layout.
- Production offline smoke passed: service worker controls the page, saved project survives offline reload, and the toolbox calculates while offline, with no page errors. Machine-readable evidence is `offline-verification.json`.
- Customer PDFs and print examples in `examples/` are analytical fixtures and contain no real customer data.

### Final candidate gate

- `npm run lint`: passed, including TypeScript and Prettier.
- `npm test`: 215/215 passed across eight test files.
- `npm run build`: passed; 2,291 modules, scoped service worker and lazy feature chunks.
- Combined browser gate: **15/15 tests passed in 1.2 minutes**, covering billing, measurements, planning, recovery and workspace flows.
- Production offline candidate checks passed at both `/` and `/AdigunPowerLab/`, including lazy billing and actual PDF export, with zero page errors and zero failed requests. The rerun exposed `Vary: Origin` differing between precache fetches and module requests; the fix matches only the dedicated static-asset cache while ignoring that header and isolates cache cleanup by scope.
- Actual development-browser benchmark: 1,000 loads, 30 real editor saves, p95 184.3 ms; annual UI worker simulation 3,910 ms, 35,040 rows, 8,760,000 kWh within floating-point tolerance. See `browser-performance.json` and `PERFORMANCE.md` for method and limits.
- Fresh-checkout verification passed for exact remote source candidate `cdff7e3591b0ab8c28cf3ed280379678834e2677`: `git clone --depth 1 --branch feat/power-studio`, asserted `git rev-parse HEAD`, `npm ci`, lint, all 215 tests (4.89 seconds), production build and repository-subpath offline smoke including actual PDF. No working-tree source files or node_modules were copied into the recovery checkout.
- `npm audit --json`: zero known advisory vulnerabilities across the pinned tree; see `security-audit.json`. This is not a penetration test.

### Not claimed

No physical hardware, connected AI provider, cloud owner-scoped authorization, licensed standards dataset, or complete WCAG audit has been tested. Node timing is not substituted for browser timing; see PERFORMANCE.md.

### Delivered source

The verified application source candidate is `cdff7e3591b0ab8c28cf3ed280379678834e2677`; subsequent delivery documentation records these observations. [PR #1](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/1) contains the exact branch/integration history. At the time of this initial source-delivery note, public deployment had not yet run; the subsequent historical deployment is recorded in DEPLOYMENT.md.

### Remote CI

[GitHub Actions run 42125403239](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/42125403239) completed successfully for exact candidate `cdff7e3591b0ab8c28cf3ed280379678834e2677`. Its fresh Ubuntu runner passed dependency installation, TypeScript/Prettier lint, all unit tests, production build, Chromium installation, the full browser suite, root offline smoke, repository-subpath offline smoke and static artifact upload. The earlier candidate failed offline module lookup; the documented cache fix resolved that failure before this successful run.

## Detail-mode continuation: 12 November 2026

- **PR #24 / circuit diagnostics:** candidate [43268930764](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43268930764), main validation [43269817818](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43269817818), and Pages publication [43270753247](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43270753247) passed for the circuit-diagnostics disclosure.
- **PR #25 / single-line settings:** candidate [43271086243](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43271086243), main validation [43272100628](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43272100628), and Pages [43272893105](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43272893105) passed.
- **PR #26 / simulation profile:** candidate [43272489704](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43272489704), main validation [43274172525](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43274172525), and Pages [43274939156](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43274939156) passed.
- **PR #27 / bulk load actions:** corrected exact candidate `c4cdb7e523f15e26869537d7ec6f892b72bdf7be` passed the complete gate in [run 43276924442](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43276924442), including browser coverage for both detail modes, the full browser suite, production-browser checks and offline/update smoke tests. The merged main revision `892b3bee8f7267201cdf6910edb271e124774815` passed [validation run 43277711152](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43277711152); exact-revision Pages publication passed in [run 43278519926](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43278519926). The live custom-domain HTML and compiled JavaScript returned HTTP 200. No client project or customer measurements were used.
- Superseded PR #27 candidates exposed a matcher type error and a pre-existing test assumption that bulk actions always began collapsed. The test now checks the observed disclosure state before opening it; the corrected exact candidate passed. The local Windows browser check was not run because Chromium is absent; the complete remote Chromium and production-browser suites passed.

These runs are software/browser checks, not physical hardware validation, licensed-standards assessment, professional language review or full original-spec acceptance.

- **PR #28 / documentation-only status refresh:** exact candidate passed all repository gates in [run 43280043253](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43280043253); main `e01fbfa6784ab6c2be2e253f4486a30eb24361c7` passed [run 43280814410](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43280814410), then Pages [run 43281661723](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43281661723). The four-file diff updated status and receipts only. The public HTML and compiled bundle remained HTTP 200.
- **PR #30 / Equipment Library version history:** exact candidate `13916fd5d06ce808ef1d7921326ec8f5e8d23c80` passed the complete browser and repository gate in [run 43284982098](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43284982098). Merged main `364c23446bc25a26a62052df66f83e8a2c920453` passed [validation run 43285875565](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43285875565); exact-revision Pages publication passed in [run 43286622309](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43286622309). The public page and compiled JavaScript returned HTTP 200. Fixture-only verification; no client data used.
- **PR #33 / Help and Guide sidebar and BOT tour:** candidate `34dd56f995c158ab3d087ebab2f465167b8fe85f` passed the full gate in [run 43296777011](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43296777011); merged main `b939c83688b131262063cd431438fc45cf264219` passed [run 43297891385](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43297891385), and Pages publication passed in [run 43298669168](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43298669168). Browser coverage verifies the sidebar entry, SVG path, guided tour, workspace navigation and step progression. New interface labels are translated into German, Yorùbá and Nigerian Pidgin.
- **PR #34 / Adigun BOT help lookup:** corrected exact candidate `370a60410a6ff25b259817dfc1210405f659afdb` passed the full gate in [run 43301019671](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43301019671); merged main `00c450976f65adb1a5d348fffb9ada0e4d60074e` passed [run 43301885696](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43301885696), and Pages passed in [run 43302802464](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43302802464). Browser coverage asks a how-to question, verifies the actual catalogue guide appears, and opens its workspace. The BOT continues to require confirmation for changes.
- [PR #36](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/36), current application revision `4604b3f460c05a6e7b182dd83a5f2b1b8960c06d`: Adigun BOT can propose a validated single-field edit to one uniquely named load, show the before/after inputs and demand, and apply it only after confirmation through project history. Candidate [run 43314525218](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43314525218), exact-main [run 43315394007](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43315394007), and Pages [run 43316149834](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43316149834) passed.

- **PR #36 / confirmed Adigun BOT load edits:** exact candidate `9b59d675d0136f2b6735b94f520d5d7cc017e218` passed the complete repository gate in [run 43314525218](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43314525218), including lint/typecheck, unit tests, production build, browser and production-browser suites, and base-path/offline update smoke checks. Merged main `4604b3f460c05a6e7b182dd83a5f2b1b8960c06d` passed all gates in [run 43315394007](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43315394007); exact-main Pages publication passed in [run 43316149834](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43316149834). Tests reject ambiguous, stale, invalid and unsupported edits and verify proposal review, confirmation and the saved quantity in Load Schedule.

- **PR #38 / feeder detail-mode methods:** exact candidate `4809afec5020f3d1b9290615d4cd0ebc6cdd561e` passed the complete repository gate in [run 43338929618](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43338929618). Merged main `177163d0227083009cbfe05576eaa3ee36cfcc80` passed all checks in [run 43339729808](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43339729808), and exact-main Pages publication passed in [run 43340449448](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43340449448). Browser coverage verifies the method disclosure follows the global detail preference while route KPIs and segment tables remain visible.

## PR #52 / command search keyboard shortcuts — 13 November 2026

Candidate commit `87373f06d1c7907c033b36076cab1aa108fc49ed` passed the complete repository validation in [run 43369067105](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43369067105). Browser acceptance verifies both Ctrl+K and Meta+K open command search, place focus in its search field, and return focus to the launcher after Escape. Merged main `7253f4831d54b524a0d33477b609a963397dd8ea` passed the exact-main validation in [run 43369622020](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43369622020). Pages publication [run 43370107595](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43370107595) succeeded for that SHA; its run summary records validation run 43369622020 and artifact 14012281414. No customer project data was used.

## PR #53 / command search release documentation — 13 November 2026

Documentation candidate `4ceb636d3a358d198068a2575e9d263cb91c553f` passed the complete repository gate in [run 43370449230](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43370449230). Merged main `ea0e9dd95789e2f107d4392fc215e5eacd04bc38` passed exact-main validation in [run 43371025702](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43371025702), with the browser, production-browser, update and offline steps all successful. Pages [run 43371665019](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43371665019) succeeded for that exact SHA; the publication summary links validation run 43371025702 and artifact 14012542375. This was a documentation-only update.

## PR #54 / command search deployment receipt — 13 November 2026

Documentation candidate `7e1c701404393020bcefe1cd33d2704fb2bd1210` passed the complete repository gate in [run 43371837583](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43371837583). Merged main `ab05396b8bf0d7f43cd2c9c1bf4821e0597b2e89` passed exact-main validation in [run 43372375564](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43372375564), including browser, production-browser, update and offline checks. Pages [run 43373115498](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43373115498) succeeded for that SHA; the publication summary links validation run 43372375564 and artifact 14013685966. This was a documentation-only update.

## POWERGRID LAB Milestone 1 focused acceptance follow-up

- PR #91 merged as `36ac8fb1d98e46311b87a2b85f17d933b5f14a7c`. Candidate [run 43633459567](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43633459567), exact-main [run 43634068700](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43634068700) and Pages [run 43634569359](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43634569359) passed. Hosted Chromium verified the downloaded JSON contents and 390 × 844 mobile layout; Pages artifact 14129153822 deployed that main SHA.

## PR #97 practical PowerGrid gallery — deployed 15 November 2026

- PR #97 merged as `739e4164ce83387e7aedc9682400c23fff9fbade`. Candidate [run 43661330707](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43661330707) and exact-main [run 43661833854](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43661833854) passed lint, all unit tests, build, full browser suite, production-browser suite, update smoke and online/base-path offline checks. Pages [run 43662397691](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43662397691) succeeded for that exact SHA; `github-pages` artifact 14141065553.
- The public `https://adigunpowerlab.hephzibahbehulah.com/#POWERGRID` route returned HTTP 200. HEAD requests returned HTTP 200 for the overview and all six gallery images: `powergrid-hydro-station-illustration.png`, `hydro-powerhouse-generator.png`, `thermal-gas-powerhouse.png`, `grid-transformer-switchyard.png`, `transmission-substation.png`, `distribution-consumers.png` and `electrical-test-tools.png`.
- Local `npm run typecheck`, `npm run build` and focused Help/i18n tests passed (29 tests). All eight local PowerGrid Playwright cases reported passing, including gallery image loads, but the local runner did not exit after reporting completion; hosted full browser and production-browser gates provide the release result.

## PR #99 downstream PowerGrid equipment scene — deployed 15 November 2026

- PR #99 merged as `01c6ea20c437ce983fa5a261819f2a014d7998d4`. Candidate run [43667440603](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43667440603) and exact-main run [43667924456](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43667924456) passed lint, 419 unit tests, build, full browser and production-browser suites, update smoke and online/base-path offline checks. The first candidate attempts exposed a translation transfer artifact and browser selector mismatches; corrected commits passed the complete gate.
- Pages [run 43668393758](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43668393758) deployed the exact main SHA with artifact 14143043216. The branded route and GitHub Pages route returned HTTP 200; the emitted main bundle returned HTTP 200 and contained the receiving-scene title, motor equipment details and German label.
- Browser acceptance changed the raised voltage input and confirmed downstream labels update; it selected a motor, inspected its terminals, keyboard-selected N and checked that N is not PE. The scene is illustrative and does not claim downstream protection, transformer losses or customer load-flow calculations.
- Local dependency setup did not complete in this checkout, so all release verification is attributed to the hosted candidate and exact-main workflows above.

# Generation plant studies are a candidate slice: `tests/browser/powergrid.spec.ts` verifies gas/solar/wind image selection, natural image loading, selected equipment interfaces, keyboard activation and translated labels/captions in English, German, Yoruba and Nigerian Pidgin. Awaiting candidate/exact-main hosted gates and deployment before acceptance.

## PR #101 generation-plant studies — deployed 15 November 2026

- Candidate [run 43671901034](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43671901034) and exact-main [run 43672370263](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43672370263) passed lint, unit tests, build, full browser and production-browser suites, update smoke and both online/base-path offline checks.
- Pages [run 43672795456](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43672795456) deployed exact main SHA `c563b83aed43d6c314ebcb8c6187cfdd320a590a`; artifact 14145151948. The production `#POWERGRID` page loaded and its generation-study selector and plant cards were present in the browser accessibility tree.
- Candidate and exact-main browser suites selected gas, solar and wind, asserted image natural width, inspected PV interfaces, keyboard-selected wind rotor equipment and checked translated plant labels/captions across English, German, Yoruba and Nigerian Pidgin.
- Custom render provenance and DOE process sources are documented in `docs/POWERGRID_DATA_SOURCES.md`. The illustrations are not site photographs; the interfaces are representative and there is no generation output or dynamics model. Milestone 4 remains partial.

## PR #103 — NREL reference-wind worksheet — deployed

PR #103 merged as `5270b8f413eaab814b942aac07bd41253ac08da5`. Candidate [run 43678810899](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43678810899), exact-main [run 43679336987](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43679336987), and Pages [run 43679767633](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43679767633) passed. The worksheet tests source points, interpolation, invalid-input rejection, save/reload, exports and Help. It is a user-entered NREL reference-curve teaching model, not measured site weather, a commercial turbine guarantee or annual yield.

## PR #104 — chronological PV/wind, storage and critical-load dispatch — deployed

PR #104 merged as `6ef06254a990309834d64c278ccc9af643c3e779`. Candidate [run 43688387269](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43688387269) passed lint, 425 unit tests, build, full browser and production-browser suites, update smoke and online/base-path offline checks. Exact-main [run 43695664239](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43695664239) passed all the same gates. Pages [run 43696180077](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43696180077) deployed that exact SHA; artifact 14154640941. Numerical coverage checks battery reserve and energy, renewable curtailment, dispatch priority and interval balance. Browser coverage edits equal-length PV/wind/demand profiles, rejects mismatched profiles, saves/reloads independently and checks actual JSON/CSV export contents. A Playwright-discovered numeric input update failure was corrected before the passing candidate. The model is an AC-bus teaching dispatch with entered profiles and a generic backup capacity ceiling; it is not a utility/network model or a source-specific generator model. Remaining M3 requirements are open.

### Hydropower head and flow — 21 November 2026

Local Chromium acceptance passed for editing the rating, saving across reload, exporting actual JSON, and blocking save/export with invalid input. Numerical tests cover unit conversion, rating clipping, zero flow, and invalid or overflowing input.

Local Chromium also passed both microgrid dispatch scenarios, including hydro profile length validation, save and reload, and exported per-interval available power. Focused unit tests verified output clipping and interval power balance. TypeScript and focused localization checks passed.

Reservoir dispatch passed TypeScript, 14 focused dispatch and localization tests, and both Chromium dispatch tests. Cases included reservoir depletion, environmental bypass priority and shortfall, spill, and exported zero output from an empty reservoir.

Variable reservoir head passed TypeScript, 15 focused unit and localization tests, and the Chromium hydro dispatch scenario. The numerical fixture verifies 20 m at full storage, 15 m at half storage, and proportional power at equal turbine flow.

Pumped storage passed TypeScript and 16 focused tests. The numerical fixture turns 18 kWh of pump input into 11.52 kWh delivered at 80% efficiency in each direction. All three focused Chromium dispatch scenarios passed, with the pumped storage CSV assertion rerun after correcting its handling of Windows line endings.

Grid exchange passed TypeScript, 17 focused unit and localization tests, and four Chromium dispatch scenarios. The numerical case verifies capped export, curtailment, loss of imports during islanding, resumed import after reconnection and the power balance. Browser acceptance verifies invalid outage rejection, save/reload and exported islanded state.

Backup outage and restart passed TypeScript, 18 focused dispatch and localization tests, and the Chromium islanding flow. The numerical fixture verifies zero outage output, ramp-limited restart and unused headroom. Chromium verifies rejection of out-of-range outages, save/reload and export.

Thermal backup passed TypeScript, 18 focused dispatch and localization tests, and the Chromium fuel accounting workflow. Chromium verified that 20 kWh of backup output at 10 MJ/kWh and 60 kg CO2/GJ exports 200 MJ and 12 kg direct CO2 after save and reload. Unit coverage verifies no fuel usage during a modeled backup outage.

Startup fuel and finite inventory passed TypeScript, 18 focused tests and Chromium save/reload and JSON export. With 150 MJ available, 30 MJ startup and 10 MJ/kWh, the one-hour interval delivered 12 kWh and exhausted the inventory. The dispatch fixture covers fuel-limited restart after an outage and zero output after depletion.

The rural teaching preset passed TypeScript, nine localization tests and Chromium load-and-export acceptance. The exported dispatch includes six four-hour intervals with 448 kWh of illustrative demand.

SMARD acquisition verified 24 consecutive timestamps with non-null observations for each of four hourly series. TypeScript, nine localization tests and Chromium table/export acceptance passed. The browser test checks all 24 rows, attribution, license, first timestamp, source load and derived residual.

Scaled SMARD dispatch passed TypeScript, 18 focused tests and both historical and rural scenario Chromium checks. The saved historical preset exported 24 one-hour dispatch results with verified first-hour demand, solar, wind, power balance, and original source attribution.

Winter SMARD acquisition verified 24 consecutive non-null values in each source series. TypeScript, nine localization tests and both historical Chromium tests passed, covering date selection, winter scenario save and reload, first-hour reported generation, and winter timestamp offset in dispatch JSON.

Shared visual equipment selection passed TypeScript, nine localization tests and the Chromium keyboard station flow. Selecting the 3D tower highlights the hydro cutaway and single-line tower; choosing the step-up transformer or downstream receiving transformer updates the 3D inspector.

Camera rendering passed TypeScript, nine localization tests and three Chromium station checks. Actual WebGL instrumentation observed a redraw on azimuth change with no additional buffer allocations. The forced missing-WebGL case verified the fallback and keyboard selection. Automatic restoration after an actual GPU reset was not exercised.

The 390 × 844 Chromium fallback case confirmed the 3D station panel fits horizontally and keyboard selection reaches the schematic. The WebGL extension test restored the context, rebuilt buffers and retained the azimuth control value. TypeScript and nine localization tests passed.

Meshed AC verification passed TypeScript, nine localization tests, four numerical tests and Chromium acceptance. The independent rectangular-phasor fixture checks voltage, angle, slack injections and branch-loss balance. Other fixtures cover PV limit conversion, transformer ratio and phase offset, island detection and iteration exhaustion. Chromium verifies three closed branches, a connected outage, JSON results and island export gating.

N−1 comparison passed TypeScript, 14 focused numerical and localization tests, and Chromium. Coverage verifies complete enumeration of in-service branches, MVA overload screening, islanded outage outcomes, live comparison after opening a base-case branch, and exported contingency statuses.

### Independent MATPOWER 8.1 nine-bus solution

Run `node scripts/verify-matpower-case9.mjs <input-file> <solution-file>` using the upstream [t_case9_pf.m](https://raw.githubusercontent.com/MATPOWER/matpower/8.1/lib/t/t_case9_pf.m) and [soln9_pf.mat](https://raw.githubusercontent.com/MATPOWER/matpower/8.1/lib/t/soln9_pf.mat). The script imports the project solver and reads the published MATLAB v5 solution matrices without requiring MATLAB, Octave, or packages.

| Upstream fixture | SHA-256 |
| --- | --- |
| `t_case9_pf.m` | `5ac7438cfc9ef249e85639efbd824121210aab7956730e2b37b7a37b416f7d94` |
| `soln9_pf.mat` | `ffa8e28cb1fc0e2b60ea52f21de40c8b15353ff37b7aaa97f93501ca514d126d` |

On 21 November 2026 the case converged in four iterations with a maximum mismatch of 1.59 × 10⁻¹² pu. Across all nine buses and both ends of all nine branches, maximum absolute errors were 2.65 × 10⁻¹³ pu, 5.91 × 10⁻¹² degrees, 8.33 × 10⁻¹¹ MW and 3.08 × 10⁻¹⁰ Mvar. This reference exercises line charging and multiple PV buses under base-case conditions. Separate analytical tests exercise transformer phase shift and binding reactive limits.

Primary frequency response passed TypeScript, nine localization tests, three analytical-model tests, and Chromium. The numerical fixtures cover inertial ramp slope, droop/damping equilibrium, reserve saturation, and the 5% boundary. Chromium verified an inertia edit, chart visibility, exported samples and invalid-input export gating.

Transmission report PDF passed TypeScript, nine localization tests, four transmission-model tests and Chromium download acceptance. Poppler confirmed a one-page A4 export. Visual review checked the diagram, reading columns, loss bars, model text, page numbering and embedded-font rendering of Yorùbá and German notes.

Transmission scenario restore passed TypeScript, 13 focused tests and Chromium. The browser checks version-1 preview and apply without overwriting the browser copy, version-2 named save/reload and re-export, and rejection of an unsupported schema without changing inputs. The named PDF was downloaded and visually reviewed after Poppler rendering.

Transmission workspace recovery passed TypeScript, 15 archive and localization tests, and Chromium backup/restore and direct import workflows. Coverage confirms integrity validation, rejection of invalid experiment inputs, archive preview, transactional recovery, and preservation of the existing browser worksheet after applying an unsaved recovered copy.

Transmission edit history passed TypeScript, 13 focused tests and the Chromium import workflow. The browser verifies undo/redo of an entire imported scenario, redo invalidation after a fresh edit, and a fresh history after reloading the separately saved worksheet.

Saved transmission revisions passed TypeScript, 15 focused archive and localization tests, and two Chromium workflows. Browser coverage verifies a prior saved revision in a new page session, a non-destructive revision preview, prior and current snapshots in the workspace JSON, and recovery as independent copies.

Transmission baseline comparison passed TypeScript, 13 focused tests, and Chromium. The browser pins a 100 MW baseline, duplicates the scenario, changes the working copy to 120 MW, verifies the live and exported +20 MW difference, clears the baseline, and reloads the original saved experiment.

Reviewed project-demand transfer passed TypeScript, 15 focused radial and localization tests, and Chromium. Browser coverage checks the preview leaves the feeder unchanged, applies the exact aggregate design load, exports the active project ID and revision, and confirms the workspace project ID, revision and loads are unchanged.

Recurring project demand transfer passed TypeScript, 18 focused tests and Chromium. The browser reviewed a 48 kWh day from a 2 kW fixture, applied 24 hourly loads, verified the original profile and source revision in dispatch JSON, and confirmed the source workspace was unchanged.

### POWERGRID LAB deferred route and cold offline entry

The Windows production build emitted a separate PowerGrid Lab chunk. The production offline smoke passed in Chromium at / and /AdigunPowerLab/, including offline reload, prior project recovery, initial PowerGrid entry offline, the PDF signature, and hydro image decoding. Both runs recorded zero page errors and zero unexpected network failures. The smoke checks page resource timing for deferred lab entry. Service-worker precaching can still download the lab chunk during cache installation.

### POWERGRID LAB practical lesson on power factor

TypeScript and all 20 Help catalogue checks passed locally. The targeted Chromium case passed the worked-loss checks (4.484 MW at 0.80 and 2.870 MW at 1.00), applied the lesson inputs, exported a signed loss reduction against the pinned baseline, and reset the edited power factor. Hosted validation remains pending.

### POWERGRID LAB transmission-distance lesson

Local TypeScript and 26 Help and radial solver tests passed. The focused Chromium case verified export is disabled out of range, a 40 km line yields 8 Ω resistance and 16 Ω reactance per phase, the reference meets the receiving-voltage floor while the 40 km case falls below it, real losses increase, interpretation survives in the report, and reset restores 25 km. The local runner stalled during teardown.

### POWERGRID LAB feeder-trip lesson

TypeScript and 26 Help and radial solver tests passed. The focused Chromium case verified a 0.22 MW outage, staged restoration with 0.08 MW still disconnected, JSON export of the partial case and pinned pre-trip reference, and full reconnection. The local browser runner stalled during teardown.

### POWERGRID LAB transformer-loading lesson

Local TypeScript and 20 Help checks passed. Focused Chromium assertions verified 4.5 kW of loss at 500 kVA, 12 kW at the 1,000 kVA rating, a warning and 16.4 kW loss above rating at 1,200 kVA, exported efficiency, and reset.

### POWERGRID LAB midday solar and evening peak lessons

TypeScript and 29 Help and microgrid solver tests passed. Focused Chromium assertions verified 20 kW midday charging and 10 kW curtailment, zero curtailment with 10 kW export, restoration of zero export when switching lessons, and the worked evening discharge and unmet-load values in the JSON download.

### POWERGRID LAB generator-outage lesson

TypeScript, 20 Help checks and both focused dispatch browser cases passed their assertions. The generated report showed 5 kW pre-trip headroom, 5 kW critical and 20 kW other unmet load during the trip, and 7 kW of restart output. Clearing the outage restored all critical supply. Reset restored the trip input.

### POWERGRID LAB regional comparison lesson

TypeScript and 20 Help checks passed. Two focused Chromium cases verified that the existing regional selector still applies its sourced voltage fields and that doubling shared resistance doubles calculated loss in both comparison cases. The calculation report retains source references, and reset restores the default resistance.

### POWERGRID LAB community capstone

TypeScript and 20 Help checks passed. The focused Chromium case verified the worked design serves all 448 kWh, pinned inputs/results survive in the JSON alongside the outage case and student justification, and reset clears notes and reference.

### POWERGRID LAB microgrid operation lesson

TypeScript and 29 Help and dispatch solver tests passed. Focused Chromium assertions confirmed the worked operating reference matches the existing rural export, a zero battery power limit eliminates battery throughput in the modified run, reset restores the reference power limit, and the capstone comparison still exports.

### POWERGRID LAB foundations lessons

TypeScript and 24 Help and transmission solver tests passed. The Chromium foundations case verified that an edited generator voltage changes the live route, PDF export produces a valid file signature, and restoring the worked inputs preserves student notes.

### POWERGRID LAB deterministic transmission BOT

TypeScript and 20 Help catalogue checks passed. Focused Chromium assertions verified a 330-to-363 kV preview without mutation, stale preview rejection after edit and undo, explicit confirmation of a fresh preview and undo of the resulting edit.

### POWERGRID LAB BOT station context

TypeScript and 20 Help checks passed. Focused Chromium assertions verified the BOT explanation follows keyboard selection of the 3D tower and the receiving transformer selected through the downstream diagram. The voltage proposal check passed after scoping its selector to the named preview group.

### POWERGRID LAB BOT dispatch context

TypeScript and 29 Help and solver tests passed. The focused Chromium case verified the solver-derived 20 kW battery energy limit in the JSON and the selected evening interval's explanation. Cutting the battery power limit to 10 kW updated the displayed discharge and increased unmet noncritical demand from 25 kW to 35 kW.

### POWERGRID LAB cancellable contingency comparison

The Windows production build emitted a 5.15 kB contingency worker. Root and repository-base Chromium offline smoke both executed the worker and displayed the outage table, with zero page errors and unexpected network failures. The targeted browser case verified that editing an active branch replaces the comparison and exports the current branch cases. TypeScript and 28 targeted Help, meshed solver and PDF checks passed. The earlier full local run reported 442 passes and one billing PDF timeout; the timed-out test passed on the targeted rerun. The local Chromium runner stalled during teardown.

### POWERGRID LAB PDF baseline and pagination

TypeScript and 20 Help checks passed. The focused Chromium test downloaded a multipage transmission PDF with a pinned baseline and 26 lines of notes. The generated PDF's embedded character map and text streams confirmed the baseline caption, the named Transmission review reference, 100 MW baseline versus 120 MW current with +20 MW change, and the final Yorùbá note.

### POWERGRID LAB header placement and navigation

TypeScript, formatting and 20 Help checks passed. Focused Chromium verified rightmost placement, full visibility and keyboard entry at 1,440, 768 and 390 px, unchanged desktop launcher geometry while Search is open, exact hash, refresh and history, and narrow-screen controls. The phone test exposed header clipping on Overview; removing the phone project control's inherited minimum width corrected it. The local runner stalled during teardown.

### POWERGRID LAB unsaved customer-work isolation

TypeScript and the focused Chromium assertions passed. The test rejected IndexedDB writes to the projects store, confirmed the save failure, entered #POWERGRID and edited transmitted power, then returned to Loads and downloaded the original in-memory customer draft with its unsaved 2.3 kW entry. The local runner stalled during teardown.

### POWERGRID LAB transmission draft autosave

TypeScript and 26 Help and archive checks passed. Chromium verified that a valid 120 MW working draft survives a subsequent invalid edit and reload, the named 100 MW save opens independently, and discard removes the draft. Baseline comparison passed. Workspace backup recovery timed out in the grouped run and passed when rerun alone.

### POWERGRID LAB deferred station rendering

TypeScript and 20 Help checks passed. Three Chromium cases verified no draw before the station canvas approached the viewport, reuse of scene buffers after camera input, no idle redraw across frames with reduced motion requested, and keyboard inspection with WebGL disabled. The synchronized station/BOT group selection passed.

Public Pages Chromium sampling after the diesel deployment used reduced motion and headless software WebGL. At 1440 × 900, 768 × 1024 and 390 × 844, the scene canvas rendered and both the document and scene had matching client and scroll widths. Across 20 azimuth input events per viewport, the 95th-percentile elapsed time through two animation frames was 83, 183 and 83 ms respectively. The sample measures this browser and rendering configuration. It does not measure physical mobile-device latency or isolate the GPU draw time.

At 390 × 844 with reduced motion, live Chromium selected the step-up transformer with Enter and adjusted the voltage slider from 330 kV to 329 kV with Arrow Left. The conductor-loss meter updated to 0.461932 MW. The existing foundations browser case now exercises those keyboard actions.

The focused Chromium header test passed at 1440, 768 and 390 px. The POWERGRID launcher stayed at the same coordinates when command search opened and closed, and Enter navigated to the exact #POWERGRID route at every width.

Public Chromium with a 390 × 844 viewport, reduced motion and WebGL disabled displayed the station fallback. Enter on the station tower control selected the upstream schematic tower. Enter on the downstream HV-to-MV transformer selected the matching receiving-substation station control.

Onshore wind candidate: TypeScript, 20 Help tests, four wind engine tests and the focused Chromium save and export case passed. At 4, 5, 12 and 26 m/s in one-hour intervals, switching from offshore to onshore changed energy from 6,808 to 4,719 kWh. Save/reload restored the onshore choice and JSON carried the pinned source blob.

The focused Chromium case also verified that the onshore interval at 12 m/s shows a 4,000 kW output meter at its 4,000 kW nameplate limit.

Compared the onshore solver against every row of the pinned NREL source blob. All 90 wind-speed and electrical-power pairs matched within 1e-9 kW, including the compressed nameplate plateau and cut-out rows.

Dispatch wind selection passed TypeScript, 29 Help and microgrid engine tests, and two focused Chromium cases. The saved onshore reference exported 494 kW available wind at 5 m/s and the pinned curve source. The historical case continued to export its recorded and scaled wind generation.

The gas-cycle comparison passed TypeScript, 20 Help cases and the focused Chromium workflow. At the same available fuel, the open and combined cases showed 117 MW and 147 MW net. The open-cycle handoff exported 117,000 kW and 9 MJ/kWh. The first Windows run stalled on the existing export button with single-process Chrome. The same case passed with Chrome's default multiprocess launch.

The flexible-demand exercise passed TypeScript, 20 Help tests and Chromium. The browser rejected an excessive move, transferred 5 kWh from the first interval to the second, and verified equal exported total energy and unchanged critical demand.

The shift record follow-up passed the same targeted checks. Chromium saved and reloaded the event and verified the exported interval numbers, power, energy and before/after loads.

The meshed demand profile passed TypeScript, 25 meshed solver and Help tests, and the focused Chromium export check. Editing the peak to 150% exported 60%, 100% and 150% solves. The 150% row used 82.5 MW and 37.5 Mvar of demand and the solved load-bus voltage fell relative to the base row.

The meshed save follow-up passed TypeScript, 20 Help tests and the focused Chromium case. Reload restored a saved 150% peak and the export retained the corresponding load and voltage results.

A public phone-width Chromium accessibility-tree sample found two unnamed buttons among 384 sampled buttons, form controls and sliders on POWERGRID LAB. The workspace toolbar Save and Export project names were lost when the visible labels were hidden. The focused local mobile accessibility test passed with explicit localized names, along with TypeScript.

### POWERGRID LAB analytical AC and time-step sensitivity

TypeScript and the full Windows unit suite passed: 445 tests in 34 files, using Vitest with four workers. The two-bus case verified receiving voltage, line current and sending P/Q with a closed-form high-voltage root. The frequency case verified that halving the step from 0.01 to 0.005 s changes the nadir by less than 0.00001 Hz, with nadir time within 0.01 s and ending frequency agreeing to seven decimal places.

### POWERGRID LAB ideal and lossy transformer comparison

TypeScript and 22 transformer and Help checks passed. The analytical fixture verified conservation at 500 kVA with power factor 0.8, including 400 kW ideal input and 404.5 kW lossy input. It also verified no-load behavior, the overload threshold and invalid input rejection. Chromium verified ideal and lossy report content and the rating warning.

### POWERGRID LAB Windows qualification at 6fe55e44ecfc384bf88dbacd99d812a7e445c821

TypeScript and the Windows production build passed. The full PowerGrid Chromium file reported all 44 cases passing; the local runner stalled during teardown. An earlier attempt to split the dev server and browser across tool invocations could not reach the server and was stopped. The build emitted a 378.74 kB lab module (111.47 kB gzip) and an 817.71 kB bootstrap (247.35 kB gzip). The Windows update fixture initially returned HTTP 403 for paths in dist. With the native-path containment correction, update and offline smoke both passed at / and /AdigunPowerLab/, including offline worker execution and PDF export. The earlier 63c464e hosted gate is recorded in POWERGRID_ACCEPTANCE.md.

### POWERGRID LAB solar thermal tower

TypeScript and 20 Help checks passed. Chromium verified 48 MW of collected heat and 15 MW of rating-limited electrical output for the worked example. The exported low-irradiance case reported 2.1 MW electrical potential and zero available output below minimum stable load. Invalid inputs disabled export and reset restored the reference. The local runner stalled during teardown.

PR #116 exact candidate ca491a7 passed hosted run [44935000849](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/44935000849). Exact main 0abafe1 passed [44935645968](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/44935645968), including both browser suites and root/base-path update and offline checks. The immutable artifact publication and public HTTP checks are recorded in [DEPLOYMENT.md](DEPLOYMENT.md).

PR #117 passed [candidate 44935354512](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/44935354512) and [exact-main run 44936559720](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/44936559720). [Pages run 44937358513](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/44937358513) published exact main 93fff33. Public module checks confirmed the new solar thermal lesson at both URLs.

### POWERGRID LAB tidal stream turbine

TypeScript and 20 Help checks passed. Chromium verified 410 kW flow power at 2 m/s and 51.25 kW at 1 m/s, a 120 kW cap at the worked point, zero available output at cut-out despite positive potential, JSON content and reset. The local runner stalled during teardown.

Three analytical tidal stream tests also passed. They verify the 410 → 164 → 147.6 kW power chain, the 120 kW nameplate limit, inclusive cut-in, exclusive cut-out and invalid-input rejection.

### POWERGRID LAB binary-cycle geothermal

TypeScript and 20 Help checks passed. Chromium verified 14,630 kW recovered heat, 1,350 kW net at the rated worked point, rejection of efficiency above the Carnot ceiling, signed −150 kW net demand at zero flow, JSON content and reset. The local runner stalled during teardown.

### POWERGRID LAB deep-water wave energy

TypeScript and 20 Help checks passed. Chromium verified the 100 kW nameplate cap, about 98.12 kW/m crest flux at 5 m significant height and 8 s energy period, zero available output at shutdown, JSON content, invalid-input handling and reset. The local runner stalled during teardown.

### POWERGRID LAB gas and steam combined cycle

TypeScript and 20 Help checks passed. Chromium verified 170.4 MW fuel-limited potential, 160 MW available gross, 150 MW summed gas and steam generation, 147 MW net, and a 3 MW auxiliary import with zero fuel use below minimum load. JSON export and reset passed. The local runner stalled during teardown.

### POWERGRID LAB hydrogen fuel cell

Focused Chromium test passed with 4 kg of hydrogen. The steady two-hour case became inventory-limited at 31.968 kW gross AC. The dispatch export retained the 190 kW net equipment limit, 479.52 MJ starting inventory, 7.5 MJ/kWh running slope and 75 MJ/h auxiliary intercept. TypeScript and 20 Help tests passed.

TypeScript and 20 Help checks passed. Chromium confirmed the inverter caps gross output at 200 kW and the auxiliary demand reduces it to 190 kW net. At 4 kg over two hours, gross output was 31.968 kW, all 4 kg were consumed and remaining fuel was zero. Reset and JSON export passed. The local runner stalled during teardown.

### POWERGRID LAB biogas engine and heat recovery

TypeScript and 20 Help checks passed. Chromium verified the 200 kW nameplate cap, 190 kW net electricity, 177.778 kW recoverable heat, 100 kW useful heat demand, and reduced gas use at the rating cap. Zero methane produced no power or heat and retained the entered auxiliary demand. JSON export and reset passed. The local runner stalled during teardown.

### POWERGRID LAB solid biomass steam generation

TypeScript and 20 Help checks passed. Chromium verified 2.85 MW net at the reference rating limit and, at 50% wet-basis moisture, 7.78 MJ/kg as-fired LHV, 6.613 MW heat to steam and 1.8339 MW net. JSON export and reset passed. The local runner stalled during teardown.

### POWERGRID LAB diesel generator fuel curve

TypeScript and 20 Help checks passed. Chromium verified 17.4 L/h and 25.2 L remaining in the reference, a 50 kW cap with 30 L available, and shutdown with 12 L below the modelled minimum load. JSON export and reset passed. The local runner stalled during teardown.

### POWERGRID LAB coal steam generation

TypeScript and 20 Help checks passed. The focused Chromium test verified the 640 t reference fuel use, the 200 MW and 800 MWh export with 320 t available, rejection of blank inventory, and reset. The local runner reported the test passed and stalled during teardown.

### Illustrated workspace and field guides

Chromium verified the Overview menu opens to Workspace, shows one POWERGRID LAB tile under Engineering, and opens Cables & Protection. The cable and motor guides mounted their credited video players on request and focused the calculator without leaving the route. Local Chromium reported those tests passed before the runner stalled during teardown.

The expanded browser check verified the solar and battery guide and the EV charging guide mount the intended players and focus each planner while preserving the route.

Chromium also verified that the Power Quality guide mounts its manufacturer video player and opens the Power-factor correction tool. The motor guide opens Motor start sequence directly.

The expanded Chromium regression verified player activation and focus for Single-Line Studio, Schedules & Simulation, Load Schedule, Boards & Circuits, Scenarios & Optimization, and Equipment Library. The HTTP media playback itself remains unverified.

Chromium verified the Engineering Toolbox exercise opens Single-phase AC current directly and the Engineering Reference exercise focuses the equations. Bundled report, backup, revision and Help recordings were independently verified by advancing playback time.

The complete Overview navigation regression checked all four menu groups, the 19 real route links, the Help dialog tile, and successful decoding of all 20 tile images. All 20 Help search checks passed.

Production Chromium verified playback of the report, workspace backup, revision comparison, and Help recordings on GitHub Pages after the recordings release. Each media element advanced its playback time and decoded a video frame.

### POWERGRID LAB nuclear steam generation

The nuclear steam browser case decoded the credited NRC illustration, verified 950 MW net at the reference generator rating, and exported 34 MW gross and −16 MW net at 100 MW of steam-cycle heat.

### Visual POWERGRID experiments

Focused Chromium cases checked terminal ratios, voltage and distance controls, the power-factor worksheet handoff, transformer overload, dispatch interval readings, the feeder switch map, rural battery charge, and regional loss comparison. In the community capstone, loading produces the documented 30 kW backup case, pinning captures zero unmet critical energy, and the interval 5 outage control produces zero backup generation in that interval.

The combined curriculum run reported all ten selected Chromium tests passing in one run, covering all twelve practical lessons. The local Playwright runner stalled during teardown after reporting the ten results.

The Pacific Northwest browser case verified the 60 Hz and 120/240 V context, applied the 230 kV transmission and 12.47 kV distribution values, and preserved a previously edited balanced consumer voltage. The Nigeria/Germany comparison still passed in the same Chromium run.

The split-phase browser case verified 5 A neutral current with unequal 120 V loads. Balancing the loads reduced the neutral current to zero. Increasing 240 V demand raised both line currents to 30 A while the neutral remained at zero.

The South African regional browser case verified the dated coal and renewable energy meters and applied 275 kV, 400 kV and 132 kV to the intended worksheet fields.

The custom system browser case rejected an invalid time zone, saved and restored 55 Hz, CAD and America/Toronto, and exported the context while preserving the transmission readings and input voltages.

The first component-bank batch passed two Vitest checks covering exact CSV/JSON parity, distinct record and terminal identities, source references, and reproduction of all seven DC nameplate values at documented standard test conditions.

## Project equipment candidate

Local TypeScript and two component-bank tests passed. The focused Chromium case edited a sourced module name and quantity, saved and reloaded the project, and verified inclusion in the frozen model-derived BOM.

Diagram candidate: TypeScript and 20 Help checks passed. Local Chromium opened a saved PV instance in the single-line diagram and verified its three documented terminal groups.

Terminal connection import: accepted an indexed PV series link, rejected missing terminals and units, same-unit links, DC-to-bond links and reversed duplicates.

PV wiring candidate: TypeScript and 23 focused unit checks passed. Chromium verified adding, saving, reloading and removing an indexed PV terminal link.

The iC60N batch passed TypeScript and 24 focused tests. Chromium found A9F74106 in the manufacturer catalogue and displayed 6 A and 6 kA at 230 V AC. Export checks cover 180 unique breaker IDs and terminal counts.

Phase-aware wiring passed TypeScript, 25 focused unit checks, and two Chromium cases covering L2 diagram wiring and the existing PV save/reload and report workflow.

Catalogue navigation passed TypeScript, 25 focused unit checks and Chromium category, pagination, multi-term search, exports and AC wiring assertions.

The iID batch passed TypeScript and 26 focused tests. Chromium verified the A9R17440 selective 500 mA record. Unit tests covered neutral links and line-to-neutral rejection.

Type A expansion: TypeScript and six component-bank tests passed. Chromium showed 110 V AC for A9R08263 and preserved the existing iC60N wiring case.

Coverage generation, TypeScript, and seven component-bank tests passed. The coverage test reconciles all 20 category rows and readiness counts to runtime records.

The iSW tranche passed TypeScript and eight component-bank checks, including rated current and voltage, terminal numbering, export parity and all-category coverage.

Readiness inspection passed TypeScript, 28 focused tests and Chromium verification of visible worksheet readiness and the missing order-code field.
- Readiness promotion: GitHub browser validation exposed a positional details selector after the new source panel. The version-history test now selects its own summary. Both affected Chromium scenarios passed locally.

PV topology passed TypeScript, 29 focused tests and Chromium rejection of an indirect short after saving and reopening the project.

The iEM catalogue tranche passed TypeScript, ten focused tests and Chromium verification of the 100 imp/kWh and China-only entries.

Wiring report: TypeScript, 30 focused tests and Chromium verified both terminal endpoints in the frozen preview and the saved link in downloaded snapshot JSON.

Provenance persistence passed TypeScript, ten component-bank tests and Chromium verification of the source page in the frozen BOM and downloaded JSON.

Wire export passed TypeScript, existing report/PDF checks, Help checks and Chromium SVG download inspection. Physical plotting and PDF loop visuals were not independently inspected.

Archive verification: TypeScript, six archive unit tests and Chromium copy restore passed. The restored project retained the catalogue snapshot and indexed wire exactly and passed native project validation.

Generated and compared all 291 per-model CSV/JSON pairs and the ID index against the complete runtime catalogue. Diff check passed.
- Export promotion ead01df: generated and compared all 291 per-model CSV/JSON pairs and their index against the catalogue. All matched.

The iCT tranche passed TypeScript and 11 component-bank checks. Coverage includes exact AC-7a/AC-7b values, contact and coil markings, and JSON parity.

PV series analysis passed TypeScript, 32 focused tests and Chromium verification of 72 V Voc, 61.6 V Vmp and 14.78 A Imp after native project reload.
