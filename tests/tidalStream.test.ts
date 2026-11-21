import { expect, it } from "vitest";
import { calculateTidalStream } from "../src/engine/tidalStream";

const reference = {
  speedMps: 2,
  areaM2: 100,
  capturePercent: 40,
  efficiencyPercent: 90,
  ratingKW: 120,
  cutInMps: 0.5,
  cutOutMps: 4,
};

it("preserves the power chain and caps output by electrical nameplate", () => {
  const reading = calculateTidalStream(reference)!;
  expect(reading.flowKW).toBe(410);
  expect(reading.shaftPotentialKW).toBe(164);
  expect(reading.electricalPotentialKW).toBeCloseTo(147.6, 12);
  expect(reading.availableKW).toBe(120);
});

it("includes cut-in and excludes cut-out while preserving the resource estimate", () => {
  expect(
    calculateTidalStream({ ...reference, speedMps: 0.499 })?.availableKW,
  ).toBe(0);
  expect(
    calculateTidalStream({ ...reference, speedMps: 0.5 })?.availableKW,
  ).toBeCloseTo(2.30625, 10);
  const cutOut = calculateTidalStream({ ...reference, speedMps: 4 })!;
  expect(cutOut.flowKW).toBe(3280);
  expect(cutOut.availableKW).toBe(0);
});

it("rejects non-finite inputs, excessive rotor capture and inverted thresholds", () => {
  expect(calculateTidalStream({ ...reference, speedMps: Infinity })).toBeNull();
  expect(
    calculateTidalStream({ ...reference, capturePercent: 100 }),
  ).toBeNull();
  expect(calculateTidalStream({ ...reference, cutOutMps: 0.5 })).toBeNull();
});
