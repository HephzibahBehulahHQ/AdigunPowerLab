import { describe, expect, it } from "vitest";
import {
  calculateMicrogridDispatch,
  DEFAULT_MICROGRID_DISPATCH_INPUTS,
  validateMicrogridDispatchInputs,
} from "../src/engine/microgridDispatch";

describe("chronological microgrid dispatch", () => {
  it("conserves reservoir water across depletion, bypass shortage and spill", () => {
    const base = DEFAULT_MICROGRID_DISPATCH_INPUTS;
    const result = calculateMicrogridDispatch({
      ...base,
      hydro: {
        netHeadM: 10,
        efficiencyPercent: 100,
        ratedKW: 100,
        flowsM3s: [1, 1, 0, 0, 0, 0],
        reservoir: {
          capacityM3: 300,
          initialM3: 200,
          environmentalReleaseM3s: 0.01,
          inflowsM3s: [0, 0, 1, 0, 0, 0],
        },
      },
    });
    expect(result.intervals[0].hydroWater).toEqual({
      turbineM3: 164,
      environmentalReleaseM3: 36,
      unmetEnvironmentalReleaseM3: 0,
      spillM3: 0,
      storageM3: 0,
    });
    expect(result.intervals[0].hydroAvailableKW).toBeCloseTo(4.46747);
    expect(result.intervals[1].hydroWater?.unmetEnvironmentalReleaseM3).toBe(
      36,
    );
    expect(result.intervals[2].hydroWater?.spillM3).toBe(3264);
    expect(result.intervals[2].hydroWater?.storageM3).toBe(300);
    for (const row of result.intervals)
      expect(row.balanceResidualKW).toBeCloseTo(0, 8);
  });
  it("uses rated hydro output in the interval balance and validates its profile", () => {
    const base = DEFAULT_MICROGRID_DISPATCH_INPUTS;
    const hydro = {
      netHeadM: 30,
      efficiencyPercent: 85,
      ratedKW: 50,
      flowsM3s: [1, 0, 0, 0, 0, 0],
    };
    const result = calculateMicrogridDispatch({ ...base, hydro });
    expect(result.intervals.map((row) => row.hydroAvailableKW)).toEqual([
      50, 0, 0, 0, 0, 0,
    ]);
    expect(result.intervals[0].batteryChargeKW).toBe(18);
    for (const row of result.intervals)
      expect(row.balanceResidualKW).toBeCloseTo(0, 8);
    expect(
      validateMicrogridDispatchInputs({
        ...base,
        hydro: { ...hydro, flowsM3s: [1] },
      }),
    ).toContain("Hydro flow must have one value per demand interval.");
  });
  it("balances each interval, stores renewable surplus, and serves critical load first", () => {
    const inputs = {
      ...DEFAULT_MICROGRID_DISPATCH_INPUTS,
      intervalHours: 1,
      wind: { windSpeedsMps: [12, 3], intervalHours: 1, turbineCount: 1 },
      pvByInterval: DEFAULT_MICROGRID_DISPATCH_INPUTS.pvByInterval
        .slice(0, 2)
        .map((pv) => ({
          ...pv,
          dcNameplateKW: 0.01,
          inverterAcRatingKW: 0.01,
          planeOfArrayIrradianceWm2: 0,
        })),
      demandKW: [10, 50],
      criticalDemandKW: [8, 10],
      battery: {
        capacityKWh: 20,
        initialSocPercent: 50,
        minimumSocPercent: 20,
        maxChargeKW: 10,
        maxDischargeKW: 5,
        chargeEfficiency: 0.9,
        dischargeEfficiency: 0.8,
      },
      backupGenerator: { ratedKW: 10, rampUpKWPerInterval: 10 },
    };
    const result = calculateMicrogridDispatch(inputs);
    expect(result.intervals[0].windAvailableKW).toBe(6000);
    expect(result.intervals[0].batteryChargeKW).toBe(10);
    expect(result.intervals[0].renewableCurtailmentKW).toBe(5980);
    expect(result.intervals[1].batteryDischargeKW).toBe(5);
    expect(result.intervals[1].backupGenerationKW).toBe(10);
    expect(result.intervals[1].criticalUnservedKW).toBe(0);
    expect(result.intervals[1].nonCriticalUnservedKW).toBe(35);
    for (const row of result.intervals)
      expect(row.balanceResidualKW).toBeCloseTo(0, 9);
    expect(result.intervals[1].batterySocKWh).toBeCloseTo(12.75, 9);
  });

  it("respects battery reserve, zero backup, and exact energy balance", () => {
    const inputs = {
      ...DEFAULT_MICROGRID_DISPATCH_INPUTS,
      intervalHours: 1,
      wind: { windSpeedsMps: [3, 3], intervalHours: 1, turbineCount: 1 },
      pvByInterval: DEFAULT_MICROGRID_DISPATCH_INPUTS.pvByInterval
        .slice(0, 2)
        .map((pv) => ({ ...pv, planeOfArrayIrradianceWm2: 0 })),
      demandKW: [12, 12],
      criticalDemandKW: [10, 10],
      battery: {
        capacityKWh: 10,
        initialSocPercent: 30,
        minimumSocPercent: 20,
        maxChargeKW: 0,
        maxDischargeKW: 20,
        chargeEfficiency: 1,
        dischargeEfficiency: 1,
      },
      backupGenerator: { ratedKW: 0, rampUpKWPerInterval: 0 },
    };
    const result = calculateMicrogridDispatch(inputs);
    expect(result.intervals[0].batteryDischargeKW).toBe(1);
    expect(result.intervals[0].batterySocKWh).toBe(2);
    expect(result.intervals[0].criticalUnservedKW).toBe(9);
    expect(result.intervals[0].nonCriticalUnservedKW).toBe(2);
    expect(result.intervals[1].batteryDischargeKW).toBe(0);
    expect(result.intervals[1].criticalUnservedKW).toBe(10);
    expect(result.intervals.every((row) => row.balanceResidualKW === 0)).toBe(
      true,
    );
  });

  it("rejects mismatched profile lengths and critical demand above total demand", () => {
    const mismatch = { ...DEFAULT_MICROGRID_DISPATCH_INPUTS, demandKW: [10] };
    expect(validateMicrogridDispatchInputs(mismatch).join(" ")).toMatch(
      /same number/,
    );
    const overCritical = {
      ...DEFAULT_MICROGRID_DISPATCH_INPUTS,
      demandKW: [10, 10, 10, 10, 10, 10],
      criticalDemandKW: [11, 0, 0, 0, 0, 0],
    };
    expect(validateMicrogridDispatchInputs(overCritical).join(" ")).toMatch(
      /critical demand interval 1/i,
    );
  });
});
