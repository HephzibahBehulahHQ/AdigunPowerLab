import { describe, expect, it } from "vitest";
import {
  calculateWindPerformance,
  DEFAULT_WIND_PERFORMANCE_INPUTS,
  nrel6MwPowerAtWindSpeedKW,
  validateWindPerformanceInputs,
} from "../src/engine/windPerformance";

describe("NREL 6 MW reference-turbine wind curve", () => {
  it("matches source table points and linearly interpolates between them", () => {
    expect(nrel6MwPowerAtWindSpeedKW(4)).toBe(246);
    expect(nrel6MwPowerAtWindSpeedKW(5)).toBe(562);
    expect(nrel6MwPowerAtWindSpeedKW(4.5)).toBe(386);
    expect(nrel6MwPowerAtWindSpeedKW(4.25)).toBe(316);
    expect(nrel6MwPowerAtWindSpeedKW(12)).toBe(6000);
    expect(nrel6MwPowerAtWindSpeedKW(26)).toBe(0);
    expect(nrel6MwPowerAtWindSpeedKW(0)).toBe(0);
  });

  it("integrates entered speeds and duration into an auditable farm energy series", () => {
    const result = calculateWindPerformance({
      windSpeedsMps: [4, 5, 12, 26],
      intervalHours: 0.5,
      turbineCount: 2,
    });
    expect(result.ratedFarmPowerKW).toBe(12000);
    expect(result.intervals.map((row) => row.farmPowerKW)).toEqual([
      492, 1124, 12000, 0,
    ]);
    expect(result.totalEnergyKWh).toBe(6808);
    expect(result.meanPowerKW).toBe(3404);
    expect(result.capacityFactorPercent).toBeCloseTo(28.3666667);
    expect(result.intervals.at(-1)?.elapsedHours).toBe(2);
  });

  it("rejects invalid speeds, empty/oversized series, duration and count", () => {
    expect(
      validateWindPerformanceInputs(DEFAULT_WIND_PERFORMANCE_INPUTS),
    ).toEqual([]);
    expect(
      validateWindPerformanceInputs({
        windSpeedsMps: [31],
        intervalHours: 1,
        turbineCount: 1,
      }),
    ).not.toEqual([]);
    expect(
      validateWindPerformanceInputs({
        windSpeedsMps: [],
        intervalHours: 1,
        turbineCount: 1,
      }),
    ).not.toEqual([]);
    expect(
      validateWindPerformanceInputs({
        windSpeedsMps: [5],
        intervalHours: 0,
        turbineCount: 1,
      }),
    ).not.toEqual([]);
    expect(
      validateWindPerformanceInputs({
        windSpeedsMps: [5],
        intervalHours: 1,
        turbineCount: 1.5,
      }),
    ).not.toEqual([]);
    expect(() => nrel6MwPowerAtWindSpeedKW(Number.NaN)).toThrow(/finite/);
  });
});
