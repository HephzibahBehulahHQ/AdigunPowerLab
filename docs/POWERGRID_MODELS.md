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

## Milestone 3 visual station scene

`src/features/HydroStationScene.tsx` presents a selectable hydro station cutaway and a separate one-line electrical path. It names the reservoir, trash rack, intake gate, penstock, Francis runner and guide vanes, draft tube, turbine shaft, generator stator/rotor, generator step-up transformer, breaker/disconnector/earth switch, CT/VT, surge arrester, phase busbars, lattice tower, phase conductors, shield wire, control house, SCADA/protection panel and station earth grid. The equipment inspection panel supplies a plain-language function and the terminals or connections depicted for the selected item.

The drawing is an explicitly illustrative teaching configuration: a synchronous generator with a brought-out, impedance-grounded star point; delta generator-side and grounded-star grid-side GSU windings; one simple switchyard bus bay; and three overhead phases with a separate top shield wire. These are not universal plant arrangements and are not represented as a real site's as-built documentation. Actual machines, winding leads, transformer vector group, grounding, switchyard layout, ratings and protection must be taken from project-specific nameplates and drawings. N, PE and the overhead shield wire have different roles and remain distinct in the scene. Brown/black/grey are phase-identification colors in the diagram only; bare HV conductors are not insulated with those colors.

The scene is explanatory, not a new solver. Existing power and feeder values still come only from the calculation inputs documented above and in the radial model section; no plant rating, weather, water flow, fault duty or protection action is fabricated by the illustration. The generation-site process sequence is referenced to the [U.S. DOE hydropower overview](https://www.energy.gov/cmei/water/how-hydropower-works) and its [Hydropower Supply Chain report](https://www.energy.gov/sites/default/files/2024-12/Hydropower%20Supply%20Chain%20Report%20-%20Final%5B1%5D.pdf). Source reference diagrams show representative equipment; this custom drawing is not a copy of an as-built facility. Downstream receiving, distribution, house and industrial consumer station equipment remains a subsequent visual slice.

## Regional teaching scenarios

Nigeria-inspired uses NERC Grid Code Version 02 nominal stages 330/132/33/11 kV and 50 Hz; Apply updates only 132/330/33 kV. Germany-inspired is a 50Hertz transmission-area example: it applies 220/380/110 kV and 0.4 kV consumer service, with 20 kV shown as an illustrative point within the sourced 15–30 kV medium-voltage range. The generator-terminal voltage remains unchanged in both.

The United States-inspired Pacific Northwest preset compares BPA 115/230 kV transmission stages and uses an illustrative 12.47 kV distribution stage. Applying it leaves the balanced consumer and generator terminal voltage unchanged. Its separate 120/240 V worksheet assumes fixed source voltages and resistive loads. It adds the line-to-line load current to each line and takes the absolute difference of the two 120 V load currents for the neutral. The calculation excludes voltage drop, harmonic current, open-neutral faults and conductor sizing.

Currency codes and IANA time-zone identifiers are displayed separately as region metadata. Frequency is informational and the steady-state solvers do not calculate frequency response. No regional weather, renewable availability, generation dispatch or demand profiles are loaded. These are source-backed teaching contexts, not operational replicas; source dates and simplifications are recorded in [`POWERGRID_DATA_SOURCES.md`](POWERGRID_DATA_SOURCES.md). Other regional, rural-microgrid and custom presets remain unimplemented.

## Milestone 3 slice: NREL reference-wind curve and entered intervals

src/engine/windPerformance.ts uses the Appendix D NREL 6 MW (2015) reference-turbine power curve in NREL/TP-6A20-67414. It linearly interpolates tabulated wind-speed and turbine-output points; speeds under the first point use zero output, and high-wind cut-out follows the report's zero-output points. Farm power is per-turbine curve output multiplied by a validated integer turbine count. For each entered equal-duration wind interval, energy is Pfarm times interval duration. Profile capacity factor is mean profile power divided by aggregate reference rated power; it is not an annual capacity factor.

The editable default sequence 3, 5, 8, 12, 18, 26 m/s is an analytical lesson profile, not measured weather, a regional resource or a real dispatch schedule. This worksheet does not model air density, hub height, shear, turbulence, wakes, availability, electrical losses, curtailment, storage, demand or dispatch. Source provenance and boundaries are in POWERGRID_DATA_SOURCES.md.

## Milestone 3 slice: chronological PV/wind, storage and critical-load dispatch

`src/engine/microgridDispatch.ts` connects the existing per-interval PV and NREL wind models to editable total-demand and critical-demand profiles. Profile arrays must have the same length (1–96 intervals); interval duration is shared. The PV inputs use the Sandia/NREL equations above. Wind uses the cited NREL 6 MW curve. This combines available generation at an illustrative AC bus; it does not convert source data into a regional forecast.

Dispatch order is explicit: available PV/wind serve demand first; renewable surplus charges a battery within its power and SOC limits; deficit uses battery discharge above the entered reserve, then a generic dispatchable backup ceiling limited by its entered ramp-up increment. Ramp-down is immediate and there is no unit commitment, minimum output or physical generator type. Supply serves the entered critical-demand portion before non-critical demand. The model reports curtailment and critical/non-critical unmet demand separately.

For each interval, the solver checks `PV + wind + battery discharge + backup − battery charge − curtailment − served demand = 0 kW` (numerical residual); it separately reports `total demand = served + unmet`. Battery stored energy increases by `charge kW × duration × charge efficiency` and decreases by `discharge kW × duration ÷ discharge efficiency`. Aggregate kWh metrics use the entered interval duration. Input defaults are classroom assumptions, not measured load or renewable profiles.

This is not a feeder/network solution. Feeder and transformer losses, imports/exports, source-specific backup fuel/heat-rate/emissions/cost, frequency response, generator outage logic and location-specific renewable/demand data are not modeled. Do not interpret the generic backup ceiling as a diesel/thermal unit performance model or the AC-bus balance as utility operation.


## Visual station model boundary

The navigable WebGL station model uses original simplified meshes to teach relative equipment placement from reservoir through a hydro unit, step-up transformer, switchyard, transmission tower, receiving transformer, home and industry. It has no geographic scale, asset survey, equipment nameplate values or solved electrical state. Phase conductor colours are illustrative; transmission neutrals vary by network and are not implied by every line. Use the detailed hydro cutaway for connection and terminal explanations. WebGL availability is feature-detected and the station schematic remains available when it cannot render.

## Independent two-bus check and frequency step refinement

For a balanced two-bus line with fixed receiving load P + jQ, the sending and receiving magnitudes satisfy |Vs|² = |Vr|² + 2(RP + XQ) + (R² + X²)(P² + Q²)/|Vr|². With line-to-line kV, total three-phase MW/Mvar and per-phase ohms, the higher-voltage root gives the reference receiving voltage. The fixture also checks line current and sending-end P/Q against conductor losses.

The aggregate frequency lesson uses fourth-order Runge–Kutta with a default maximum step of 0.01 s. The numerical verification compares the same four-second disturbance at 0.01 and 0.005 s, including nadir magnitude, time and ending frequency. The refinement setting is an engine verification input; the classroom control defaults are unchanged.

## Transformer loading comparison

The fixed-voltage lesson compares a lossless transformer with a 1,000 kVA teaching unit at the same output load and power factor. The lossy case adds 2 kW of core loss and 10 kW times the square of the loading ratio. Input real power equals output plus losses. Ideal no-load efficiency is undefined because both powers are zero. The nameplate check uses the apparent load and remains independent of efficiency.

## Generation catalogue implementation matrix

| Owner specification entry | Current PowerGrid candidate |
| --- | --- |
| Reservoir hydro and run-of-river hydro | Head/flow/rating calculation, optional reservoir water balance and chronological dispatch. |
| Pumped storage | Chronological pumping and generation with capacity, power limits and directional efficiencies. |
| Solar PV | Irradiance, cell temperature, DC/AC conversion and clipping. |
| Concentrated solar thermal | Steady-state direct solar power tower with receiver and cycle efficiencies, nameplate and minimum output. Storage and dispatch remain open. |
| Onshore and offshore wind | One attributed NREL offshore reference turbine curve. Separate onshore and offshore resource or turbine selection remains open. |
| Coal steam | Source catalogue entry remains open. |
| Gas turbines and combined cycle | Equipment study and steady-state gas/steam worksheet with fuel, nameplate and minimum load. Chronological dispatch and plant-specific curves remain open. |
| Nuclear steam | Source catalogue entry remains open. |
| Diesel and other liquid fuel | Generic thermal backup supports entered heat rate, startup fuel and fuel inventory. A liquid-fuel asset-specific curve remains open. |
| Biomass and biogas | Biogas engine CHP worksheet with methane fraction and heat demand. Solid biomass and dispatch remain open. |
| Geothermal | Binary-cycle brine heat, gross rating and auxiliary load worksheet. Reservoir and dispatch models remain open. |
| Tidal and wave | Separate tidal stream turbine and deep-water wave conversion point calculations. Device performance matrices and chronological dispatch remain open. |
| Battery storage | Chronological SOC, reserve, charge/discharge limits and directional efficiencies. |
| Hydrogen and fuel cell | Finite-inventory hydrogen fuel cell conversion worksheet. Hydrogen production, storage design and dispatch integration remain open. |

The thermal backup model exposes user-entered heat rate and optional direct emissions. Fuel costs and source-specific minimum stable generation are outside the current calculation.

## Concentrating solar thermal power tower

The teaching model converts direct normal irradiance times mirror aperture to incident MW, multiplies by combined field and receiver efficiency to estimate collected heat, then applies the entered net heat-to-power efficiency. The available output is capped at the electrical nameplate and drops to zero below the entered minimum load. All presets are illustrative and storage, startup, ramps and dispatch are outside the model.

## Tidal stream turbine

The worksheet estimates flow power through the swept area as 0.5 × water density × area × speed³. It uses an illustrative fixed seawater density of 1,025 kg/m³. An entered rotor capture fraction gives shaft power, and drivetrain efficiency gives electrical potential. The model bounds available output by the rating at or above cut-in and below cut-out. It excludes wake interaction, blockage, transient loads, tidal chronology and dispatch.

## Binary-cycle geothermal

Recovered heat is brine mass flow × 4.18 kJ/(kg·K) × the production-to-reinjection temperature drop. The gross electrical estimate uses the entered conversion efficiency, subject to the Carnot upper bound at the production and heat sink temperatures. Actual gross output is capped by nameplate. Net output subtracts the entered auxiliary demand, so a negative reading represents required external supply. The solver assumes single-phase brine and steady operating conditions.

## Deep-water wave conversion

Wave flux per metre of crest is seawater density × gravity² × significant wave height² × energy period / (64π). The model uses 1,025 kg/m³ and 9.81 m/s². Multiplying flux by effective capture width estimates absorbed power, then conversion efficiency gives electrical potential. Available output is capped by nameplate and falls to zero at the configured shutdown height. The worksheet assumes deep water and a single sea state.

## Gas and steam combined cycle

The gross conversion fraction is gas turbine efficiency plus (1 − gas turbine efficiency) × heat recovery fraction × steam cycle efficiency. The model caps available output by fuel and gross rating. It selects the lower of requested and available gross output and produces no power below minimum stable load. Fuel used is gross output divided by the combined conversion fraction, and the two turbine outputs are based on that actual fuel input. Entered auxiliary demand is deducted even in standby.

## Hydrogen fuel cell

Effective available feed is the minimum of the feed limit and starting mass divided by the interval duration. The DC potential is available feed × hydrogen lower heating value × stack efficiency. AC output is bounded by fuel, DC stack rating and inverter AC rating. Actual hydrogen use follows the constrained DC output and modelled interval, leaving unused fuel in inventory. Entered auxiliaries are deducted from gross AC, including when the entered inventory is zero.

## Biogas engine and heat recovery

The biogas worksheet uses dry gas flow at 0 °C and one atmosphere. Methane lower heating value is 35.77 MJ per normal cubic metre, and the entered methane fraction sets the biogas heating value. The engine uses only the fuel needed for rating-limited gross output. A fraction of the remaining fuel energy is recoverable heat, and useful heat is limited by entered demand. The worksheet subtracts entered auxiliary electrical load from gross generation.
