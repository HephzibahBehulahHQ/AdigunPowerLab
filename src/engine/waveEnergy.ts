export const WAVE_ENERGY_FIELDS = {
  heightM: { initial: 2, min: 0, max: 25 },
  energyPeriodS: { initial: 8, min: 1, max: 35 },
  captureWidthM: { initial: 8, min: 0, max: 250 },
  conversionPercent: { initial: 85, min: 0, max: 100 },
  ratingKW: { initial: 100, min: 1, max: 100_000 },
  shutdownHeightM: { initial: 5, min: 0.1, max: 25 },
};

export type WaveEnergyInputs = Record<keyof typeof WAVE_ENERGY_FIELDS, number>;
const seawaterDensity = 1025;
const gravity = 9.81;

export function calculateWaveEnergy(inputs: WaveEnergyInputs) {
  if (
    Object.entries(WAVE_ENERGY_FIELDS).some(([key, { min, max }]) => {
      const value = inputs[key as keyof WaveEnergyInputs];
      return !Number.isFinite(value) || value < min || value > max;
    })
  )
    return null;

  const crestPowerKWPerM =
    (seawaterDensity *
      gravity ** 2 *
      inputs.heightM ** 2 *
      inputs.energyPeriodS) /
    (64 * Math.PI * 1000);
  const absorbedPotentialKW = crestPowerKWPerM * inputs.captureWidthM;
  const electricalPotentialKW =
    (absorbedPotentialKW * inputs.conversionPercent) / 100;
  const shutdown = inputs.heightM >= inputs.shutdownHeightM;
  const availableKW = shutdown
    ? 0
    : Math.min(inputs.ratingKW, electricalPotentialKW);
  return {
    crestPowerKWPerM,
    absorbedPotentialKW,
    electricalPotentialKW,
    shutdown,
    availableKW,
  };
}
