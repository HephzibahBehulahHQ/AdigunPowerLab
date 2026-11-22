export const BIOMASS_FIELDS = {
  wetFeedKgH: { initial: 3600, min: 0, max: 1_000_000 },
  moisturePercent: { initial: 30, min: 0, max: 80 },
  dryLhvMJKg: { initial: 18, min: 1, max: 35 },
  boilerPercent: { initial: 85, min: 0, max: 100 },
  steamPercent: { initial: 30, min: 0, max: 60 },
  grossRatingMW: { initial: 3, min: 0.001, max: 1000 },
  auxiliariesMW: { initial: 0.15, min: 0, max: 1000 },
};

export type BiomassInputs = Record<keyof typeof BIOMASS_FIELDS, number>;
export const MOISTURE_EVAPORATION_MJ_KG = 2.44;

export function getBiomassDispatchFuelSettings(
  inputs: BiomassInputs,
  inventoryKg?: number,
) {
  const result = calculateSolidBiomass(inputs);
  if (!result || result.netOutputMW <= 0) return null;
  const grossEfficiency = (inputs.boilerPercent * inputs.steamPercent) / 10_000;
  const incrementalMJPerKWh = 3.6 / grossEfficiency;
  const inventoryMJ =
    inventoryKg === undefined ? undefined : inventoryKg * result.wetLhvMJKg;
  if (
    incrementalMJPerKWh > 1e7 ||
    (inventoryMJ !== undefined &&
      (!Number.isFinite(inventoryMJ) || inventoryMJ < 0 || inventoryMJ > 1e12))
  )
    return null;
  return {
    ratingKW: result.netOutputMW * 1_000,
    minimumStableKW: 0,
    incrementalMJPerKWh,
    runningInterceptMJPerHour:
      inputs.auxiliariesMW * 1_000 * incrementalMJPerKWh,
    inventoryMJ,
  };
}
export function calculateSolidBiomass(inputs: BiomassInputs) {
  if (
    Object.entries(BIOMASS_FIELDS).some(([key, { min, max }]) => {
      const value = inputs[key as keyof BiomassInputs];
      return !Number.isFinite(value) || value < min || value > max;
    })
  )
    return null;

  const moisture = inputs.moisturePercent / 100;
  const wetLhvMJKg = Math.max(
    0,
    (1 - moisture) * inputs.dryLhvMJKg - moisture * MOISTURE_EVAPORATION_MJ_KG,
  );
  const availableFuelMW = (inputs.wetFeedKgH * wetLhvMJKg) / 3600;
  const boilerEfficiency = inputs.boilerPercent / 100;
  const steamEfficiency = inputs.steamPercent / 100;
  const grossPotentialMW = availableFuelMW * boilerEfficiency * steamEfficiency;
  const grossOutputMW = Math.min(grossPotentialMW, inputs.grossRatingMW);
  const usedWetFeedKgH =
    grossPotentialMW > 0
      ? inputs.wetFeedKgH * (grossOutputMW / grossPotentialMW)
      : 0;
  const steamHeatMW = ((usedWetFeedKgH * wetLhvMJKg) / 3600) * boilerEfficiency;
  const netOutputMW = grossOutputMW - inputs.auxiliariesMW;
  return {
    wetLhvMJKg,
    availableFuelMW,
    grossPotentialMW,
    usedWetFeedKgH,
    steamHeatMW,
    grossOutputMW,
    netOutputMW,
  };
}
