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
