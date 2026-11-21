import { describe, expect, it } from "vitest";
import {
  calculateHydroPerformance,
  DEFAULT_HYDRO_INPUTS,
} from "../src/engine/hydroPerformance";

describe("steady-state hydropower", () => {
  it("converts head and flow into hydraulic and electrical power", () => {
    const result = calculateHydroPerformance(DEFAULT_HYDRO_INPUTS);
    expect(result?.hydraulicKW).toBeCloseTo(1470.9975);
    expect(result?.availableKW).toBeCloseTo(1250.347875);
  });

  it("caps output at nameplate and reports zero output without flow", () => {
    expect(
      calculateHydroPerformance({ ...DEFAULT_HYDRO_INPUTS, ratedKW: 500 })
        ?.availableKW,
    ).toBe(500);
    expect(
      calculateHydroPerformance({ ...DEFAULT_HYDRO_INPUTS, flowM3s: 0 })
        ?.availableKW,
    ).toBe(0);
  });

  it("rejects invalid or overflowing inputs", () => {
    for (const invalid of [
      { efficiencyPercent: 101 },
      { netHeadM: -1 },
      { flowM3s: NaN },
      { ratedKW: 0 },
      { netHeadM: Number.MAX_VALUE },
    ]) {
      expect(
        calculateHydroPerformance({ ...DEFAULT_HYDRO_INPUTS, ...invalid }),
      ).toBeNull();
    }
  });
});
