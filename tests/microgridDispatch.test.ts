import { describe, expect, it } from "vitest";
import {
  calculateMicrogridDispatch,
  DEFAULT_MICROGRID_DISPATCH_INPUTS,
  validateMicrogridDispatchInputs,
} from "../src/engine/microgridDispatch";

describe("chronological microgrid dispatch", () => {
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

