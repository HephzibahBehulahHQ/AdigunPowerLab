import { expect, it } from "vitest";
import { calculateTransformerLoading } from "../src/engine/powergridTransformer";

const model = { ratingKva: 1000, coreLossKw: 2, ratedWindingLossKw: 10 };

it("conserves real power for ideal and lossy transformers at the same load", () => {
  const ideal = calculateTransformerLoading(500, 0.8, {
    ...model,
    coreLossKw: 0,
    ratedWindingLossKw: 0,
  });
  const half = calculateTransformerLoading(500, 0.8, model);
  const rated = calculateTransformerLoading(1000, 0.8, model);
  expect(ideal.inputKw).toBe(400);
  expect(ideal.efficiency).toBe(1);
  expect(half.outputKw).toBe(400);
  expect(half.inputKw).toBe(404.5);
  expect(half.efficiency).toBeCloseTo(400 / 404.5, 12);
  expect(rated.windingLossKw).toBe(4 * half.windingLossKw);
  expect(rated.overloaded).toBe(false);
  expect(calculateTransformerLoading(1001, 0.8, model).overloaded).toBe(true);
});

it("accounts for energization loss at no load and rejects invalid settings", () => {
  expect(calculateTransformerLoading(0, 1, model).inputKw).toBe(2);
  expect(calculateTransformerLoading(0, 1, model).efficiency).toBe(0);
  expect(
    calculateTransformerLoading(0, 1, {
      ...model,
      coreLossKw: 0,
      ratedWindingLossKw: 0,
    }).efficiency,
  ).toBeNull();
  expect(() => calculateTransformerLoading(500, 1.2, model)).toThrow(
    RangeError,
  );
  expect(() =>
    calculateTransformerLoading(500, 1, { ...model, ratingKva: 0 }),
  ).toThrow(RangeError);
});
