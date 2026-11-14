import { describe, expect, it } from "vitest";
import {
  isRadialNetworkInput,
  solveRadialNetwork,
  type RadialNetworkInput,
  validateRadialNetwork,
} from "../src/engine/powergridRadial";

const feeder: RadialNetworkInput = {
  sourceBusId: "source",
  sourceVoltageKV: 11,
  buses: [
    { id: "source", loadMW: 0, loadMvar: 0 },
    { id: "north", loadMW: 0.1, loadMvar: 0.04 },
    { id: "north-end", loadMW: 0.05, loadMvar: 0.02, minVoltagePU: 0.97 },
    { id: "south", loadMW: 0.08, loadMvar: 0.03 },
  ],
  branches: [
    {
      id: "main-north",
      fromBusId: "source",
      toBusId: "north",
      resistanceOhm: 0.2,
      reactanceOhm: 0.4,
      thermalLimitA: 30,
      inService: true,
    },
    {
      id: "north-lateral",
      fromBusId: "north",
      toBusId: "north-end",
      resistanceOhm: 0.3,
      reactanceOhm: 0.5,
      thermalLimitA: 20,
      inService: true,
    },
    {
      id: "main-south",
      fromBusId: "source",
      toBusId: "south",
      resistanceOhm: 0.25,
      reactanceOhm: 0.35,
      thermalLimitA: 25,
      inService: true,
    },
  ],
};

describe("POWERGRID balanced radial AC feeder", () => {
  it("safely recognizes persisted input shapes before validation", () => {
    expect(isRadialNetworkInput(feeder)).toBe(true);
    expect(isRadialNetworkInput({ ...feeder, buses: [null] })).toBe(false);
    expect(
      isRadialNetworkInput({
        ...feeder,
        branches: [{ ...feeder.branches[0], inService: "yes" }],
      }),
    ).toBe(false);
    expect(isRadialNetworkInput(null)).toBe(false);
  });

  it("solves separate consumer groups and accounts for line losses", () => {
    const result = solveRadialNetwork(feeder);
    expect(result.status).toBe("converged");
    expect(result.iterations).toBeGreaterThan(0);
    expect(result.buses).toHaveLength(4);
    expect(result.branches).toHaveLength(3);
    expect(result.totalLoadMW).toBeCloseTo(0.23, 10);
    expect(result.sourceMW).toBeCloseTo(
      result.totalLoadMW + result.realLossMW,
      6,
    );
    expect(result.sourceMvar).toBeCloseTo(
      result.totalLoadMvar + result.reactiveLossMvar,
      6,
    );
    expect(result.realLossMW).toBeGreaterThan(0);
    expect(result.reactiveLossMvar).toBeGreaterThan(0);
    expect(
      result.buses.find((bus) => bus.busId === "north-end")!.voltagePU,
    ).toBeLessThan(1);
  });

  it("reports voltage and thermal constraints without hiding the solved values", () => {
    const constrained = {
      ...feeder,
      buses: feeder.buses.map((bus) =>
        bus.id === "north-end" ? { ...bus, minVoltagePU: 1.001 } : bus,
      ),
      branches: feeder.branches.map((branch) =>
        branch.id === "main-north" ? { ...branch, thermalLimitA: 1 } : branch,
      ),
    };
    const result = solveRadialNetwork(constrained);
    expect(result.status).toBe("converged");
    expect(
      result.buses.find((bus) => bus.busId === "north-end")!.voltageConstraint,
    ).toBe("low");
    expect(
      result.branches.find((branch) => branch.branchId === "main-north")!
        .thermalConstraint,
    ).toBe("overload");
  });

  it("marks consumers behind an open feeder as unserved", () => {
    const outaged = {
      ...feeder,
      branches: feeder.branches.map((branch) =>
        branch.id === "main-north" ? { ...branch, inService: false } : branch,
      ),
    };
    const result = solveRadialNetwork(outaged);
    expect(result.status).toBe("islanded");
    expect(result.unservedBusIds).toEqual(["north", "north-end"]);
    expect(result.totalLoadMW).toBeCloseTo(0.08, 10);
    expect(result.branches.map((branch) => branch.branchId)).toEqual([
      "main-south",
    ]);
  });

  it("rejects loops, invalid impedances and branches directed against the source", () => {
    const loop = {
      ...feeder,
      branches: [
        ...feeder.branches,
        {
          id: "tie",
          fromBusId: "north-end",
          toBusId: "south",
          resistanceOhm: 1,
          reactanceOhm: 0.1,
          inService: true,
        },
      ],
    };
    expect(validateRadialNetwork(loop).join(" ")).toContain("loop");
    expect(
      validateRadialNetwork({
        ...feeder,
        branches: feeder.branches.map((branch, index) =>
          index === 0
            ? { ...branch, resistanceOhm: 0, reactanceOhm: 0 }
            : branch,
        ),
      }).join(" "),
    ).toContain("non-zero");
    const reversed = {
      ...feeder,
      branches: feeder.branches.map((branch, index) =>
        index === 0
          ? { ...branch, fromBusId: "north", toBusId: "source" }
          : branch,
      ),
    };
    expect(solveRadialNetwork(reversed).validationErrors.join(" ")).toContain(
      "oriented away",
    );
  });

  it("returns convergence diagnostics when the iteration budget is too small", () => {
    const result = solveRadialNetwork({
      ...feeder,
      maxIterations: 1,
      tolerancePU: 1e-12,
    });
    expect(result.status).toBe("not-converged");
    expect(result.iterations).toBe(1);
    expect(result.maxVoltageChangePU).toBeGreaterThan(1e-12);
  });
});
