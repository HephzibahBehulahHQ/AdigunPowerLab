# Public deployment

The owner explicitly authorized pushing, merging and public deployment on 6 and 7 November 2026. The configured custom domain is `adigunpowerlab.hephzibahbehulah.com`; its final HTTPS and release verification is recorded in [PR #6](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/6). The previous GitHub Pages URL is [AdigunPowerLab](https://hephzibahbehulahhq.github.io/AdigunPowerLab/). Current implementation and acceptance status remain in `PROJECT_STATUS.md`; this document records publication mechanics and receipts.

## Latest verified release — 12 November 2026

- Latest application change: `177163d0227083009cbfe05576eaa3ee36cfcc80` ([PR #38](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/38)).
- PR #33 added the Help and Guide entry, workflow illustration, and step-by-step Adigun BOT tour. Its exact candidate [run 43296777011](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43296777011), main validation [run 43297891385](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43297891385), and Pages [run 43298669168](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43298669168) passed.
- PR #34 enables the deterministic BOT to answer how-to prompts from the real guide catalogue and open the selected workspace. Corrected exact candidate [run 43301019671](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43301019671), main validation [run 43301885696](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43301885696), and Pages [run 43302802464](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43302802464) passed.
- [PR #36](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/36), current application revision `4604b3f460c05a6e7b182dd83a5f2b1b8960c06d`: Adigun BOT can propose a validated single-field edit to one uniquely named load, show the before/after inputs and demand, and apply it only after confirmation through project history. Candidate [run 43314525218](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43314525218), exact-main [run 43315394007](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43315394007), and Pages [run 43316149834](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43316149834) passed.
- [PR #38](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/38), application commit `177163d0227083009cbfe05576eaa3ee36cfcc80`: the cumulative feeder method disclosure follows Simple/Engineering mode while route outputs remain visible. Candidate [run 43338929618](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43338929618), exact-main [run 43339729808](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43339729808), and Pages [run 43340449448](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/43340449448) passed.
- Direct post-deployment HTTP verification could not be completed because this environment could not resolve the site hostname. Pages publication passed for the exact main revision. This does not verify every live user interaction.
- Earlier PR #24–#30 candidate/main/Pages receipts remain in [TEST_EVIDENCE.md](TEST_EVIDENCE.md).

## Verified publication workflow

`.github/workflows/deploy.yml` publishes automatically after a successful **Validate PowerLab** push run on `main`. Pull-request runs, feature branches, failed validation and foreign repository artifacts cannot publish. The workflow checks the actual `ci.yml` workflow ID, successful completed run, source repository, current main SHA and the artifact's originating run/SHA before preparing Pages.

Publication downloads the immutable `AdigunPowerLab` artifact produced by that exact successful CI run. It does not rebuild or execute downloaded application content in the privileged workflow. The full lint, numerical, browser, update and offline gates therefore apply to the published bundle. Relative asset URLs support both the custom-domain root and `/AdigunPowerLab/` hosting path.

The existing `github-pages` environment and Pages concurrency group remain unchanged. Preparation also reads the Pages configuration and requires `build_type: workflow`; select **Settings → Pages → Build and deployment → Source → GitHub Actions** if this check fails, preserving the configured custom domain. Branch publication must not build this application source through Jekyll. The root CNAME is retained as owner configuration; Actions deployment does not use that file to configure DNS or TLS. Write permissions and the OIDC token are limited to the deployment job. Main and the validation result are checked again immediately before `actions/deploy-pages`; a superseded revision must wait for the newer main validation. This is a stale-head guard, not an atomic lock against unrelated main pushes during GitHub's publication operation.

**Manual retry:** run **Publish PowerLab to GitHub Pages** on `main`. It resolves a successful main-push validation for that exact current revision and uses the same artifact checks. Missing, expired or ambiguous artifacts stop publication; rerun the main validation to produce a new verified artifact, then retry. A manual run cannot waive CI or publish an old revision.

The workflow writes the selected source SHA, validation URL and artifact ID to its run summary. Record the successful Pages run and verify the public application before calling a new release deployed. Local workflow inspection alone does not establish successful GitHub execution.

References: [GitHub workflow-run events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_run), [artifact download inputs](https://github.com/actions/download-artifact/blob/v4/action.yml), [Pages deployment action](https://github.com/actions/deploy-pages/tree/v4).

## Custom-domain continuation: 7 November 2026

Main `18f7a04` added the owner-selected custom domain. Validation [42286471020](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/42286471020) and tested-artifact publication [42287072522](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/42287072522) succeeded. A competing dynamic [Jekyll run](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/42286470908) exposed the branch-publishing configuration.

The authenticated Pages settings confirmed **Deploy from a branch**. The source was restored to **GitHub Actions**, with the custom domain preserved; GitHub confirmed the saved setting. The certificate subsequently became available, the application loaded at `https://adigunpowerlab.hephzibahbehulah.com/`, and Enforce HTTPS was enabled. Final candidate checks, merge, deployment and live functional verification belong in [PR #6](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/6). Do not infer public reachability from a successful Actions run alone.

## Historical verified deployment receipt before PR #5

- Deployed source: `main` revision `f45d7369a7f4955e6c3d43b3ea5c03ded0c41821` (field usability, recovery and local BOT lifecycle work).
- Complete main validation: [42176699140](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/42176699140), completed successfully.
- Pages workflow: [42176946887](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/42176946887), completed successfully for the same main revision.
- These are observed historical receipts. The new automatic-publication continuation is tracked in [PR #5](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/5), whose release record contains its final candidate/main validation, deployment and live verification receipts. Source integration alone does not prove publication.

## Engine 1.1.0 continuation release history

- Published branch: `feat/verified-workflows`, commit `51736e6f17987e113f663662919f6318f37b8a84`.
- Integrated through [PR #2](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/pull/2).
- Deployed source: `main` commit `92d5c437f7b48f2f6ea65ae55c5aa3d2992aefa9`.
- Verified source tree: `d3c925aece07c5b56ae5011a338eb18abb93a5d0`, identical in the tested upload and merged main.
- Successful complete branch/PR validation: [42168975954](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/42168975954) and [42168980729](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/42168980729).
- Successful Pages workflow: [42169441584](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/42169441584), built and deployed the exact main revision above.
- Successful post-merge validation: [42169342041](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/42169342041).
- Pages source remains GitHub Actions on the existing public HTTPS domain. No new service, spending or custom domain was introduced.

The earlier approval-review block was resolved by the owner's explicit publication instruction before upload, merge or workflow dispatch. The release preserved remote history and used no force push. This documentation receipt follows deployment and does not change the application source or assets.

### Public verification

The live application displayed Engine 1.1.0. An analytical 2.3 kW load at 230 V and unity power factor produced 10 A and 18.4 kWh for eight hours. Setting duty to 50% changed energy to 9.2 kWh while current remained 10 A. The saved load survived the application's save/reload update flow.

A frozen report included the project reference, load and model-derived quantities. Its downloaded JSON had matching project/result revision 4 and the expected numerical values. An analytical bill using quantity 2.5, unit price €19.99, discount 10% and tax 19% returned €53.53. The downloaded one-page PDF was 62,653 bytes with a valid PDF signature/trailer; its reference and total were independently extracted and checked.

These checks ran through the supported cloud browser. A terminal-browser attempt could not reach the public URL (`ERR_EMPTY_RESPONSE`) and is not counted as a pass. No real customer information was used. File fingerprints and observed values are in `continuation-verification.json`; visual evidence is [the live billing screen](screenshots/public-continuation-release.jpg).

## Historical initial release

- Source: `main` commit `a33b1ed8f7479db6f1031dfef0addf806ede316f`.
- Successful Pages workflow: [42140197134](https://github.com/HephzibahBehulahHQ/AdigunPowerLab/actions/runs/42140197134).
- Pages source: GitHub Actions; default public HTTPS domain, no new paid service or custom domain.
- Live verification: the application opened publicly and T01 calculated 230 V / 23 Ω = 10 A and 2,300 W. The live browser showed the actual result and saved local workspace.
- Screenshot: `screenshots/public-launch-1793926727604.jpg`.
