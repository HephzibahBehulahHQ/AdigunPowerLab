# POWERGRID LAB calculation model

## Milestone 1: constant-power three-phase conductor comparison

Inputs are transmitted active power `P` in MW, line-to-line voltage `VLL` in kV, power factor `PF`, and resistance `Rphase` in ohms for one phase of the modeled conductor. The same `P`, `PF`, and `Rphase` apply to both comparison cases.

```text
Iline [A] = P [MW] × 1000 / (√3 × VLL [kV] × PF)
Ploss [MW] = 3 × Iline² × Rphase / 1,000,000
loss share [%] = 100 × Ploss / P
power after modeled line loss [MW] = P − Ploss
```

Inputs must be finite and positive; PF must not exceed one; the raised voltage must exceed the base voltage; and line loss must remain below transmitted active power for both cases. Invalid inputs suppress the current result and exports.

The reference defaults (100 MW, PF 1, 5 Ω/phase, 132 kV and 330 kV) yield about 437.4 A / 2.87 MW and 175.0 A / 0.459 MW respectively. This is a transparent comparative exercise. It is not a solved receiving-end voltage or a complete network power balance. Transformer ratios are displayed as ideal voltage labels; transformer losses and downstream feeder losses are outside this model.

## Milestone 2 foundation: balanced radial AC feeder

`src/engine/powergridRadial.ts` adds a separate steady-state balanced radial solver. It represents a declared source bus, source line-to-line RMS voltage, multiple consumer buses with three-phase constant-P/Q demand, and oriented feeder branches with per-phase complex series impedance. The backward/forward sweep iterates constant-power load currents and bus phasors until the largest bus-voltage change is within the configured per-unit tolerance or the iteration budget is reached.

The reported bus voltage is the magnitude of the balanced line-to-line RMS voltage. Per-branch current is the balanced phase conductor RMS current; sending and receiving P/Q and three-phase I²R/I²X losses are calculated from solved phasors. Voltage limits default to 0.95–1.05 pu and can be specified per bus. Branch ampacity is optional; exceeded voltage and thermal limits remain visible as constraint results and do not erase solved readings. Numerical convergence, iteration count and residual voltage change are returned explicitly.

Open branches may leave radial islands. The solver reports unreachable buses as unserved and omits those loads from the served demand and source balance. Closed loops, invalid impedances, invalid equipment limits and branches oriented against the declared source are rejected. The active graph must be a forest and branch direction must point away from the source.

The radial workflow exposes the solver through editable consumer-group and feeder controls, explicit in-service switches, bus/branch instruments, a captured comparison reference, isolated local save and JSON/CSV downloads. Its lesson and Help entry describe the workflow and model limits in English, German, Yoruba and Nigerian Pidgin. It remains an educational analysis, not equipment certification or a utility-grade planning package.

The radial model assumes one balanced source with fixed voltage, positive-sequence balanced loads modeled as constant P and Q, no shunt capacitance, no transformer tap or impedance model, no generation limits, no protection action and no time variation. Regional presets and a validated meshed-network solver remain later milestone work.

## Milestone 3 foundation: instantaneous PV source model

`src/engine/pvPerformance.ts` adds an explicit source-specific PV estimate using only the entered array, irradiance, temperature and inverter values. It does not fetch weather or infer a regional resource profile.

The steady-state cell temperature relation is `Tcell = Tmodule + (EPOA / 1000) × ΔT`. DC output is `Pdc = (EPOA / 1000) × Pdc0 × max(0, 1 + γ × (Tcell − 25 °C))`. AC before the inverter limit is `Pdc × ηinv`; delivered AC is the lower of that value and the entered inverter AC rating. Conversion loss and AC clipping are reported separately.

The cell-temperature form follows the [Sandia PV Performance Modeling Collaborative model](https://pvpmc.sandia.gov/modeling-guide/2-dc-module-iv/cell-temperature/sandia-cell-temperature-model/); the irradiance/linear-temperature DC equation follows the [NREL PVWatts V5 manual](https://pvwatts.nrel.gov/downloads/pvwattsv5.pdf). The user supplies the irradiance, module temperature, cell-to-module temperature difference, temperature coefficient, inverter efficiency and AC rating; illustrative defaults are not local weather or a product datasheet.

This single-point teaching estimate excludes weather retrieval, annual energy, orientation/transposition, shading, module I–V curves, mismatch, wiring loss, dynamic response and degradation. It does not imply a selected module or compliance with an installation design.
Source documents were consulted on 14 November 2026. This worksheet uses the cited simplified equations, not the complete PVWatts thermal, inverter-curve, system-loss or annual-energy model.

## Regional teaching scenario — Nigeria-inspired

The first regional scenario is implemented in `src/engine/powergridRegions.ts`. It records the NERC Grid Code Version 02 public-consultation nominal stages 330, 132, 33 and 11 kV and 50 Hz, with source and access date in the scenario data. Applying the preset writes 132 kV, 330 kV and 33 kV into the existing step-up worksheet; the other voltage fields are preserved. This describes which voltage conventions the teaching worksheet is using and does not extend its solver topology.

The current steady-state solvers do not model frequency response. `NGN` and `Africa/Lagos` are metadata only. No regional weather, renewable availability, generation dispatch or demand profile is loaded. The scenario is an educational context, not an operational replica; see [`POWERGRID_DATA_SOURCES.md`](POWERGRID_DATA_SOURCES.md) for source, date and simplifications. Other regional, rural-microgrid and custom presets remain unimplemented.
