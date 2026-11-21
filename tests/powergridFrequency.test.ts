import { describe, expect, it } from "vitest";
import {
  DEFAULT_FREQUENCY_INPUTS,
  simulateFrequencyResponse,
} from "../src/engine/powergridFrequency";

describe("aggregate frequency response", () => {
  it("keeps the transient nadir stable when the integration step is halved", () => {
    const input = { ...DEFAULT_FREQUENCY_INPUTS, durationSeconds: 4 };
    const standard = simulateFrequencyResponse(input)!;
    const refined = simulateFrequencyResponse(input, 0.005)!;
    expect(standard.integrationStepSeconds).toBe(0.01);
    expect(refined.integrationStepSeconds).toBe(0.005);
    expect(standard.nadir.seconds).toBeGreaterThan(0);
    expect(standard.nadir.seconds).toBeLessThan(input.durationSeconds);
    expect(
      Math.abs(standard.nadir.seconds - refined.nadir.seconds),
    ).toBeLessThanOrEqual(0.01);
    expect(
      Math.abs(standard.nadir.frequencyHz - refined.nadir.frequencyHz),
    ).toBeLessThan(0.00001);
    expect(standard.samples.at(-1)!.frequencyHz).toBeCloseTo(
      refined.samples.at(-1)!.frequencyHz,
      7,
    );
    expect(simulateFrequencyResponse(input, 0)).toBeNull();
  });

  it("matches the analytical inertial ramp with damping and reserve disabled", () => {
    const result = simulateFrequencyResponse({
      ...DEFAULT_FREQUENCY_INPUTS,
      damping: 0,
      reservePercent: 0,
      durationSeconds: 1,
    });
    expect(result?.initialRoCoFHzPerSecond).toBe(-0.1);
    expect(result?.samples.at(-1)?.frequencyHz).toBeCloseTo(49.9, 10);
    expect(result?.nadir.seconds).toBe(1);
  });

  it("approaches the analytical droop equilibrium and respects the reserve cap", () => {
    const free = simulateFrequencyResponse({
      ...DEFAULT_FREQUENCY_INPUTS,
      durationSeconds: 60,
    });
    expect(free?.samples.at(-1)?.frequencyHz).toBeCloseTo(
      50 * (1 - 0.02 / 21),
      8,
    );
    const limited = simulateFrequencyResponse({
      ...DEFAULT_FREQUENCY_INPUTS,
      durationSeconds: 60,
      damping: 5,
      reservePercent: 0.5,
    });
    expect(limited?.samples.at(-1)?.governorPercent).toBeCloseTo(0.5, 9);
    expect(limited?.samples.at(-1)?.frequencyHz).toBeCloseTo(49.85, 8);
    expect(
      limited?.samples.every((sample) => sample.governorPercent <= 0.5 + 1e-10),
    ).toBe(true);
  });

  it("stops outside its small-signal scope and rejects invalid parameters", () => {
    const result = simulateFrequencyResponse({
      ...DEFAULT_FREQUENCY_INPUTS,
      inertiaSeconds: 0.5,
      lossPercent: 5,
      damping: 0,
      reservePercent: 0,
    });
    expect(result?.stoppedAtModelLimit).toBe(true);
    expect(result?.samples.at(-1)?.seconds).toBeCloseTo(1, 1);
    expect(result?.nadir.frequencyHz).toBeGreaterThanOrEqual(47.5);
    expect(
      simulateFrequencyResponse({
        ...DEFAULT_FREQUENCY_INPUTS,
        inertiaSeconds: 0,
      }),
    ).toBeNull();
  });
});
