import { describe, expect, it } from "vitest";
import {
  calculatePowerGrid,
  DEFAULT_POWERGRID_INPUTS,
  validatePowerGridInputs,
} from "../src/engine/powergrid";

describe("PowerGrid transmission experiment", () => {
  it("matches the declared 132 kV and 330 kV reference exercise", () => {
    const comparison = calculatePowerGrid(DEFAULT_POWERGRID_INPUTS);
    expect(comparison.base.currentA).toBeCloseTo(437.386, 2);
    expect(comparison.base.lineLossMW).toBeCloseTo(2.869, 2);
    expect(comparison.raised.currentA).toBeCloseTo(174.955, 2);
    expect(comparison.raised.lineLossMW).toBeCloseTo(0.459, 2);
    expect(comparison.raised.lineLossMW).toBeLessThan(
      comparison.base.lineLossMW,
    );
  });

  it("rejects invalid, reversed and physically impossible input cases", () => {
    expect(
      validatePowerGridInputs({ ...DEFAULT_POWERGRID_INPUTS, powerFactor: 0 }),
    ).not.toEqual([]);
    expect(
      validatePowerGridInputs({
        ...DEFAULT_POWERGRID_INPUTS,
        raisedVoltageKV: 132,
      }),
    ).not.toEqual([]);
    expect(
      validatePowerGridInputs({
        ...DEFAULT_POWERGRID_INPUTS,
        powerMW: Number.NaN,
      }),
    ).not.toEqual([]);
    expect(
      validatePowerGridInputs({
        ...DEFAULT_POWERGRID_INPUTS,
        lineResistanceOhm: 1000,
      }),
    ).not.toEqual([]);
  });
});
