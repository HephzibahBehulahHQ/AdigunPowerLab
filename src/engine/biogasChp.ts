export const METHANE_LHV_KWH_PER_NM3 = 35.77 / 3.6;

export const BIOGAS_FIELDS = {
  biogasNm3H: { initial: 100, min: 0, max: 100_000 },
  methanePercent: { initial: 60, min: 0, max: 100 },
  electricPercent: { initial: 36, min: 1, max: 70 },
  ratingKW: { initial: 200, min: 1, max: 100_000 },
  heatRecoveryPercent: { initial: 50, min: 0, max: 100 },
  heatDemandKW: { initial: 100, min: 0, max: 100_000 },
  auxiliariesKW: { initial: 10, min: 0, max: 100_000 },
};

export type BiogasInputs = Record<keyof typeof BIOGAS_FIELDS, number>;

export function calculateBiogasChp(inputs: BiogasInputs) {
  if (
    Object.entries(BIOGAS_FIELDS).some(([key, { min, max }]) => {
      const value = inputs[key as keyof BiogasInputs];
      return !Number.isFinite(value) || value < min || value > max;
    })
  )
    return null;

  const fuelKWhPerNm3 = (inputs.methanePercent / 100) * METHANE_LHV_KWH_PER_NM3;
  const availableFuelKW = inputs.biogasNm3H * fuelKWhPerNm3;
  const electricFraction = inputs.electricPercent / 100;
  const grossElectricKW = Math.min(
    availableFuelKW * electricFraction,
    inputs.ratingKW,
  );
  const usedFuelKW = grossElectricKW / electricFraction;
  const usedBiogasNm3H = fuelKWhPerNm3 > 0 ? usedFuelKW / fuelKWhPerNm3 : 0;
  const recoverableHeatKW =
    ((usedFuelKW - grossElectricKW) * inputs.heatRecoveryPercent) / 100;
  const usefulHeatKW = Math.min(recoverableHeatKW, inputs.heatDemandKW);
  const netElectricKW = grossElectricKW - inputs.auxiliariesKW;
  return {
    availableFuelKW,
    usedBiogasNm3H,
    grossElectricKW,
    netElectricKW,
    recoverableHeatKW,
    usefulHeatKW,
  };
}
