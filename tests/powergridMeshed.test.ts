import { describe, expect, it } from "vitest";
import {
  solveMeshedPowerFlow,
  type MeshedInputs,
} from "../src/engine/powergridMeshed";

// Independent rectangular-phasor fixture: V = [1, 0.96−j0.04, 0.95−j0.06].
// Net injections were derived by summing S = V × conj((V−Vneighbor)/Z).
const triangle: MeshedInputs = {
  baseMVA: 100,
  tolerancePU: 1e-10,
  buses: [
    { id: "A", kind: "slack", voltagePU: 1 },
    {
      id: "B",
      kind: "pq",
      netMW: -9.137619438799781,
      netMvar: -13.839076484067633,
    },
    {
      id: "C",
      kind: "pq",
      netMW: -52.46772277227722,
      netMvar: -24.197227722772304,
    },
  ],
  branches: [
    {
      id: "AB",
      from: "A",
      to: "B",
      resistancePU: 0.02,
      reactancePU: 0.15,
      inService: true,
    },
    {
      id: "AC",
      from: "A",
      to: "C",
      resistancePU: 0.025,
      reactancePU: 0.2,
      inService: true,
    },
    {
      id: "BC",
      from: "B",
      to: "C",
      resistancePU: 0.01,
      reactancePU: 0.1,
      inService: true,
    },
  ],
};

describe("meshed AC power flow", () => {
  it("recovers known phasors and conserves branch losses on a closed triangle", () => {
    const result = solveMeshedPowerFlow(triangle);
    expect(result.converged).toBe(true);
    if (!result.converged) throw new Error(result.reason);
    expect(result.buses[1].voltagePU).toBeCloseTo(Math.hypot(0.96, 0.04), 7);
    expect(result.buses[2].angleDeg).toBeCloseTo(
      (Math.atan2(-0.06, 0.95) * 180) / Math.PI,
      6,
    );
    expect(result.buses[0].netMW).toBeCloseTo(62.30970775948942, 6);
    expect(result.buses[0].netMvar).toBeCloseTo(43.63050050386299, 6);
    expect(result.branches[2].fromMW).toBeGreaterThan(0);
    expect(
      result.branches.reduce((sum, branch) => sum + branch.lossMW, 0),
    ).toBeCloseTo(
      result.buses.reduce((sum, bus) => sum + bus.netMW, 0),
      8,
    );
  });

  it("respects PV voltage until its reactive limit binds", () => {
    const pv = {
      id: "B",
      kind: "pv",
      netMW: 10,
      voltagePU: 1.04,
      minNetMvar: -50,
      maxNetMvar: 100,
    } as const;
    const solve = (maxNetMvar: number) =>
      solveMeshedPowerFlow({
        ...triangle,
        buses: [triangle.buses[0], { ...pv, maxNetMvar }, triangle.buses[2]],
      });
    const unrestricted = solve(100);
    const limited = solve(0);
    expect(unrestricted.converged && unrestricted.buses[1].voltagePU).toBe(
      1.04,
    );
    expect(limited.converged).toBe(true);
    if (!limited.converged) throw new Error(limited.reason);
    expect(limited.buses[1].limitedMvar).toBe(0);
    expect(limited.buses[1].netMvar).toBeCloseTo(0, 6);
    expect(limited.buses[1].voltagePU).toBeLessThan(1.04);
  });

  it("uses the from-side tap and shift under no-load conditions", () => {
    const result = solveMeshedPowerFlow({
      ...triangle,
      buses: [triangle.buses[0], { id: "B", kind: "pq", netMW: 0, netMvar: 0 }],
      branches: [{ ...triangle.branches[0], tap: 1.1, shiftDeg: 7 }],
    });
    expect(result.converged).toBe(true);
    if (!result.converged) throw new Error(result.reason);
    expect(result.buses[1].voltagePU).toBeCloseTo(1 / 1.1, 7);
    expect(result.buses[1].angleDeg).toBeCloseTo(-7, 6);
    expect(result.branches[0].lossMW).toBeCloseTo(0, 7);
  });

  it("distinguishes islands from iteration exhaustion and invalid inputs", () => {
    expect(
      solveMeshedPowerFlow({ ...triangle, branches: [triangle.branches[0]] }),
    ).toMatchObject({ reason: "islanded", residualPU: null });
    expect(
      solveMeshedPowerFlow({ ...triangle, maxIterations: 1 }),
    ).toMatchObject({ reason: "not-converged", iterations: 1 });
    expect(solveMeshedPowerFlow({ ...triangle, baseMVA: 0 })).toMatchObject({
      reason: "invalid",
    });
  });
});
