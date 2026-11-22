export const DIESEL_LHV_KWH_PER_L = 9.95;

export const DIESEL_FIELDS = {
  ratingKW: { initial: 100, min: 1, max: 100_000 },
  requestKW: { initial: 60, min: 0, max: 100_000 },
  minimumLoadPercent: { initial: 30, min: 0, max: 100 },
  noLoadFuelLH: { initial: 3, min: 0, max: 100_000 },
  ratedFuelLH: { initial: 27, min: 0.01, max: 100_000 },
  inventoryL: { initial: 60, min: 0, max: 1_000_000 },
  intervalHours: { initial: 2, min: 0.01, max: 168 },
};

export type DieselInputs = Record<keyof typeof DIESEL_FIELDS, number>;

export function getDieselDispatchFuelSettings(inputs: DieselInputs) {
  const mjPerLitre = DIESEL_LHV_KWH_PER_L * 3.6;
  return {
    ratingKW: inputs.ratingKW,
    minimumStableKW: (inputs.ratingKW * inputs.minimumLoadPercent) / 100,
    incrementalMJPerKWh:
      ((inputs.ratedFuelLH - inputs.noLoadFuelLH) * mjPerLitre) /
      inputs.ratingKW,
    runningInterceptMJPerHour: inputs.noLoadFuelLH * mjPerLitre,
    inventoryMJ: inputs.inventoryL * mjPerLitre,
  };
}
export function calculateDieselGenerator(inputs: DieselInputs) {
  if (
    inputs.noLoadFuelLH >= inputs.ratedFuelLH ||
    inputs.ratedFuelLH * DIESEL_LHV_KWH_PER_L < inputs.ratingKW ||
    Object.entries(DIESEL_FIELDS).some(([key, { min, max }]) => {
      const value = inputs[key as keyof DieselInputs];
      return !Number.isFinite(value) || value < min || value > max;
    })
  )
    return null;

  const slope = (inputs.ratedFuelLH - inputs.noLoadFuelLH) / inputs.ratingKW;
  const minimumKW = (inputs.ratingKW * inputs.minimumLoadPercent) / 100;
  const fuelLimitedKW =
    (inputs.inventoryL / inputs.intervalHours - inputs.noLoadFuelLH) / slope;
  const feasibleKW = Math.max(0, Math.min(inputs.ratingKW, fuelLimitedKW));
  const availableKW = feasibleKW >= minimumKW ? feasibleKW : 0;
  const requestedWithinLimitsKW = Math.min(inputs.requestKW, availableKW);
  const outputKW =
    requestedWithinLimitsKW >= minimumKW ? requestedWithinLimitsKW : 0;
  const fuelRateLH = outputKW > 0 ? inputs.noLoadFuelLH + outputKW * slope : 0;
  const fuelUsedL = Math.min(
    inputs.inventoryL,
    fuelRateLH * inputs.intervalHours,
  );
  const remainingL = inputs.inventoryL - fuelUsedL;
  return { availableKW, outputKW, fuelRateLH, fuelUsedL, remainingL };
}
