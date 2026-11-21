export const TIDAL_STREAM_FIELDS = {
  speedMps: { initial: 2, min: 0, max: 12 },
  areaM2: { initial: 100, min: 1, max: 10_000 },
  capturePercent: { initial: 40, min: 0, max: 59 },
  efficiencyPercent: { initial: 90, min: 0, max: 100 },
  ratingKW: { initial: 120, min: 1, max: 100_000 },
  cutInMps: { initial: 0.5, min: 0, max: 12 },
  cutOutMps: { initial: 4, min: 0, max: 12 },
};

export type TidalStreamInputs = Record<
  keyof typeof TIDAL_STREAM_FIELDS,
  number
>;
export const TIDAL_SEAWATER_DENSITY_KG_M3 = 1025;

export function calculateTidalStream(inputs: TidalStreamInputs) {
  if (
    inputs.cutInMps >= inputs.cutOutMps ||
    Object.entries(TIDAL_STREAM_FIELDS).some(([key, { min, max }]) => {
      const value = inputs[key as keyof TidalStreamInputs];
      return !Number.isFinite(value) || value < min || value > max;
    })
  )
    return null;

  const flowKW =
    (0.5 *
      TIDAL_SEAWATER_DENSITY_KG_M3 *
      inputs.areaM2 *
      inputs.speedMps ** 3) /
    1000;
  const shaftPotentialKW = (flowKW * inputs.capturePercent) / 100;
  const electricalPotentialKW =
    (shaftPotentialKW * inputs.efficiencyPercent) / 100;
  const inOperatingRange =
    inputs.speedMps >= inputs.cutInMps && inputs.speedMps < inputs.cutOutMps;
  const availableKW = inOperatingRange
    ? Math.min(inputs.ratingKW, electricalPotentialKW)
    : 0;
  return {
    flowKW,
    shaftPotentialKW,
    electricalPotentialKW,
    inOperatingRange,
    availableKW,
  };
}
