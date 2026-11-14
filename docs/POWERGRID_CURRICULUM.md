# POWERGRID LAB learning path

## Station visit — hydro source to transmission line

1. Trace the separate water path: reservoir and trash rack → intake gate → penstock → Francis runner → draft tube and tailrace.
2. Follow the mechanical shaft from the turbine into the generator cutaway; identify rotor, stator and the U1/V1/W1 phase leads.
3. Inspect the shown generator star point N, its impedance grounding, and the generator-frame PE bond. Explain why N and PE are not interchangeable.
4. Trace the generator-side delta and grid-side grounded-star windings through the step-up transformer. The configuration is illustrative; compare with the transformer vector group and connection drawing from a real station before applying it elsewhere.
5. Follow each phase through the three-pole breaker, disconnector and CT/VT bay to the A/B/C bus and lattice tower. Inspect the surge arrester's separate earth lead, the control house and its SCADA/protection panel. Identify the overhead shield/earth wire and station earth grid.
6. Select equipment and read its function and terminals in the inspection panel. Compare the physical cutaway with the one-line circuit; neither view adds data to the transmission-loss or feeder calculations.

The diagram uses a sourced, representative hydro process sequence and an explicit example wiring topology. It is not an as-built station, switching procedure, protection design, or site-specific construction drawing. The complete receiving-substation, distribution, residential and industrial visual route is still a separate milestone.

## Lesson 1 — Why step up voltage?

1. Start with the prefilled, clearly identified analytical exercise or change its inputs.
2. Compare line current and three-phase resistive loss at the two transmission voltages.
3. Relate the inverse voltage/current relationship at fixed power and PF to the squared-current loss relationship.
4. Change PF or conductor resistance and observe the revised comparison.
5. Save the experiment locally or export the displayed inputs and calculated values as JSON or CSV.

Discuss the assumptions before interpreting the comparison: balanced three-phase, fixed transmitted active power/PF and equal per-phase resistance, ideal transformers, no downstream losses or network load-flow solution. Later lessons listed in `POWER GRID PROMPT.md` are not represented as available features until delivered.

## Lesson 2 — Radial feeder voltage and outages

1. Open the **Radial feeder** section and inspect the illustrative source, two feeders and three consumer groups.
2. Change a consumer group's active or reactive load and observe its solved bus voltage and the currents/powers on its upstream branches.
3. Set a comparison reference, then increase load or branch impedance and compare minimum served voltage and real feeder losses.
4. Open the main north feeder. Confirm that its downstream groups become unserved while the independent south feeder remains supplied.
5. Change a bus minimum voltage or branch thermal limit to observe a constraint flag without hiding the solved result. Save or export the actual scenario when useful.

The exercise uses balanced three-phase RMS quantities, a fixed source voltage, constant-P/Q consumer loads and per-phase series R/X. It uses a radial backward/forward sweep and exposes convergence status. It excludes shunt capacitance, transformer taps, generator limits, protection, dynamics and meshed power flow; an outage does not trigger automatic switching or an invented alternate route.

## Lesson 3 — PV irradiance, cell temperature and inverter clipping

1. Open **PV source performance experiment** below the radial feeder section.
2. Read the input provenance and model limits in the assumptions panel. The values are worksheet inputs; no weather service or site profile is used.
3. Set DC nameplate, plane-of-array irradiance, module temperature, cell-to-module temperature rise and a module power temperature coefficient.
4. Compare the estimated cell temperature, PV array DC power, inverter AC before its limit, delivered AC power, conversion loss and clipping.
5. Capture the current case as a reference, change irradiance or temperature, and compare the new AC output. Save the inputs locally or export actual JSON/CSV readings.

The cell-temperature and DC equations reference Sandia PVPMC and the NREL PVWatts V5 manual, linked in the experiment. The entered coefficient, environment and inverter efficiency must match the intended equipment before using the values in any engineering study; the worksheet is not an annual-yield or installation design tool.

## Regional context exercise — sourced voltage conventions

1. In **Regional teaching scenario**, review each region's sources, access dates, frequency, currency, time zone, voltage convention and exclusions before applying it.
2. Apply the Nigeria-inspired context and observe 132/330/33 kV update the existing comparison/distribution inputs. Confirm generator and consumer voltage are preserved.
3. Select the Germany-inspired 50Hertz-area example and review its 380/220/110 kV levels, cited 0.4 kV consumer service, and illustrative 20 kV within the 15–30 kV range. Apply it and observe the supported fields update while preserving generator voltage.
4. Explain why frequency is shown as context only and why no country-specific resource, weather or demand profile is implied.

These are sourced educational contexts, not complete national operational grids. Other regions, rural microgrid profiles and user-defined custom systems remain future work.
