import { describe, expect, it } from "vitest";
import {
  calculatePvPerformance,
  DEFAULT_PV_PERFORMANCE_INPUTS,
  validatePvPerformanceInputs,
} from "../src/engine/pvPerformance";

describe("source-specific PV performance model", () => {
  it("calculates cell temperature, DC power, conversion and clipping", () => {
    const result = calculatePvPerformance(DEFAULT_PV_PERFORMANCE_INPUTS);
    expect(result.cellTemperatureC).toBeCloseTo(52.4, 4);
    expect(result.temperatureFactor).toBeCloseTo(0.8904, 4);
    expect(result.dcPowerKW).toBeCloseTo(71.232, 3);
    expect(result.inverterAcBeforeLimitKW).toBeCloseTo(69.095, 3);
    expect(result.acPowerKW).toBe(60);
    expect(result.conversionLossKW).toBeCloseTo(2.137, 3);
    expect(result.clippingKW).toBeCloseTo(9.095, 3);
    expect(result.totalDcToAcDifferenceKW).toBeCloseTo(11.232, 3);
  });

  it("returns zero DC and AC power at zero irradiance", () => {
    const result = calculatePvPerformance({
      ...DEFAULT_PV_PERFORMANCE_INPUTS,
      planeOfArrayIrradianceWm2: 0,
    });
    expect(result.cellTemperatureC).toBe(50);
    expect(result.dcPowerKW).toBe(0);
    expect(result.acPowerKW).toBe(0);
    expect(result.clippingKW).toBe(0);
  });

  it("reduces DC output as cell temperature rises", () => {
    const cool = calculatePvPerformance({
      ...DEFAULT_PV_PERFORMANCE_INPUTS,
      moduleTemperatureC: 25,
      inverterAcRatingKW: 200,
    });
    const hot = calculatePvPerformance({
      ...DEFAULT_PV_PERFORMANCE_INPUTS,
      moduleTemperatureC: 65,
      inverterAcRatingKW: 200,
    });
    expect(hot.cellTemperatureC).toBeGreaterThan(cool.cellTemperatureC);
    expect(hot.dcPowerKW).toBeLessThan(cool.dcPowerKW);
  });

  it("rejects invalid source, ambient and inverter values", () => {
    expect(
      validatePvPerformanceInputs({
        ...DEFAULT_PV_PERFORMANCE_INPUTS,
        dcNameplateKW: 0,
        planeOfArrayIrradianceWm2: 1600,
        powerTemperatureCoefficientPerC: 0.002,
        inverterEfficiency: 1.1,
      }),
    ).toHaveLength(4);
    expect(() =>
      calculatePvPerformance({
        ...DEFAULT_PV_PERFORMANCE_INPUTS,
        inverterAcRatingKW: Number.NaN,
      }),
    ).toThrow("Inverter AC rating");
  });
});
