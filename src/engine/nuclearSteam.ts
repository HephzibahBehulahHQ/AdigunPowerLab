export const NUCLEAR_STEAM_FIELDS = {
  suppliedHeatMW: { initial: 3_000, min: 0, max: 6_000 },
  grossRatingMW: { initial: 1_000, min: 1, max: 2_500 },
  grossEfficiencyPercent: { initial: 34, min: 1, max: 100 },
  plantUseMW: { initial: 50, min: 0, max: 500 },
  intervalHours: { initial: 4, min: 0.01, max: 168 },
};

export type NuclearSteamInputs = Record<
  keyof typeof NUCLEAR_STEAM_FIELDS,
  number
>;

export function calculateNuclearSteam(inputs: NuclearSteamInputs) {
  for (const [key, { min, max }] of Object.entries(NUCLEAR_STEAM_FIELDS)) {
    const value = inputs[key as keyof NuclearSteamInputs];
    if (!Number.isFinite(value) || value < min || value > max) return null;
  }
  const grossMW = Math.min(
    inputs.grossRatingMW,
    (inputs.suppliedHeatMW * inputs.grossEfficiencyPercent) / 100,
  );
  const netMW = grossMW - inputs.plantUseMW;
  return {
    grossMW,
    netMW,
    netMWh: netMW * inputs.intervalHours,
    unconvertedHeatMW: inputs.suppliedHeatMW - grossMW,
  };
}
