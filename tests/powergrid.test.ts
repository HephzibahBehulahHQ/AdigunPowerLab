import { describe, expect, it } from "vitest";
import {
  calculatePowerGrid,
  DEFAULT_POWERGRID_INPUTS,
  validatePowerGridInputs,
} from "../src/engine/powergrid";
import {
  applyRegionalTeachingPreset,
  NIGERIA_TEACHING_PRESET,
} from "../src/engine/powergridRegions";

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

  it("applies the sourced Nigerian comparison stages and preserves other inputs", () => {
    const inputs = applyRegionalTeachingPreset(
      { ...DEFAULT_POWERGRID_INPUTS, powerMW: 80, consumerVoltageKV: 0.23 },
      NIGERIA_TEACHING_PRESET,
    );

    expect(NIGERIA_TEACHING_PRESET.frequencyHz).toBe(50);
    expect(NIGERIA_TEACHING_PRESET.nominalVoltageStagesKV).toEqual([
      330, 132, 33, 11,
    ]);
    expect(inputs).toMatchObject({
      powerMW: 80,
      consumerVoltageKV: 0.23,
      baseVoltageKV: 132,
      raisedVoltageKV: 330,
      distributionVoltageKV: 33,
    });
    expect(validatePowerGridInputs(inputs)).toEqual([]);
  });
});
