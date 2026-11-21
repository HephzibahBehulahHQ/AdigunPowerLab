export const SOLAR_THERMAL_FIELDS = {
  dniWm2: { initial: 800, min: 0, max: 1500 },
  apertureM2: { initial: 100_000, min: 1, max: 10_000_000 },
  collectionPercent: { initial: 60, min: 0, max: 100 },
  cyclePercent: { initial: 35, min: 0, max: 100 },
  ratingMW: { initial: 15, min: 0.001, max: 10_000 },
  minimumLoadPercent: { initial: 20, min: 0, max: 100 },
};

export type SolarThermalInputs = Record<
  keyof typeof SOLAR_THERMAL_FIELDS,
  number
>;

export function calculateSolarThermal(inputs: SolarThermalInputs) {
  if (
    Object.entries(SOLAR_THERMAL_FIELDS).some(([key, { min, max }]) => {
      const value = inputs[key as keyof SolarThermalInputs];
      return !Number.isFinite(value) || value < min || value > max;
    })
  )
    return null;

  const incidentMW = (inputs.dniWm2 * inputs.apertureM2) / 1e6;
  const collectedHeatMW = (incidentMW * inputs.collectionPercent) / 100;
  const potentialMW = (collectedHeatMW * inputs.cyclePercent) / 100;
  const minimumMW = (inputs.ratingMW * inputs.minimumLoadPercent) / 100;
  const availableMW =
    potentialMW >= minimumMW ? Math.min(potentialMW, inputs.ratingMW) : 0;
  return { incidentMW, collectedHeatMW, potentialMW, minimumMW, availableMW };
}
