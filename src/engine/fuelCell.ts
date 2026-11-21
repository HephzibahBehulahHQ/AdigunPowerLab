export const HYDROGEN_LHV_KWH_PER_KG = 33.3;

export const FUEL_CELL_FIELDS = {
  inventoryKg: { initial: 30, min: 0, max: 1_000_000 },
  feedLimitKgH: { initial: 20, min: 0, max: 100_000 },
  durationHours: { initial: 2, min: 0.01, max: 168 },
  stackEfficiencyPercent: { initial: 50, min: 1, max: 100 },
  dcRatingKW: { initial: 250, min: 1, max: 100_000 },
  inverterEfficiencyPercent: { initial: 96, min: 1, max: 100 },
  acRatingKW: { initial: 200, min: 1, max: 100_000 },
  auxiliariesKW: { initial: 10, min: 0, max: 100_000 },
};

export type FuelCellInputs = Record<keyof typeof FUEL_CELL_FIELDS, number>;

export function calculateFuelCell(inputs: FuelCellInputs) {
  if (
    Object.entries(FUEL_CELL_FIELDS).some(([key, { min, max }]) => {
      const value = inputs[key as keyof FuelCellInputs];
      return !Number.isFinite(value) || value < min || value > max;
    })
  )
    return null;

  const feedKgH = Math.min(
    inputs.feedLimitKgH,
    inputs.inventoryKg / inputs.durationHours,
  );
  const dcPerKg =
    (HYDROGEN_LHV_KWH_PER_KG * inputs.stackEfficiencyPercent) / 100;
  const inverterEfficiency = inputs.inverterEfficiencyPercent / 100;
  const potentialDcKW = feedKgH * dcPerKg;
  const grossAcKW = Math.min(
    potentialDcKW * inverterEfficiency,
    inputs.dcRatingKW * inverterEfficiency,
    inputs.acRatingKW,
  );
  const stackDcKW = grossAcKW / inverterEfficiency;
  const fuelUsedKg = (stackDcKW / dcPerKg) * inputs.durationHours;
  const remainingKg = Math.max(0, inputs.inventoryKg - fuelUsedKg);
  const netAcKW = grossAcKW - inputs.auxiliariesKW;
  return {
    potentialDcKW,
    stackDcKW,
    grossAcKW,
    netAcKW,
    fuelUsedKg,
    remainingKg,
  };
}
