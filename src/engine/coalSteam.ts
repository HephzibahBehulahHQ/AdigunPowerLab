export const COAL_STEAM_FIELDS = {
  capacityMW: { initial: 500, min: 1, max: 2_000 },
  requestMW: { initial: 400, min: 0, max: 2_000 },
  heatRateMJKWh: { initial: 10, min: 3.6, max: 30 },
  coalHeatContentMJKg: { initial: 25, min: 1, max: 40 },
  inventoryTonnes: { initial: 1_000, min: 0, max: 1_000_000 },
  intervalHours: { initial: 4, min: 0.01, max: 168 },
};

export type CoalSteamInputs = Record<keyof typeof COAL_STEAM_FIELDS, number>;

export function calculateCoalSteam(inputs: CoalSteamInputs) {
  for (const [key, { min, max }] of Object.entries(COAL_STEAM_FIELDS)) {
    const value = inputs[key as keyof CoalSteamInputs];
    if (!Number.isFinite(value) || value < min || value > max) return null;
  }

  // kg/kWh and tonnes/MWh have the same numeric value.
  const tonnesPerMWh = inputs.heatRateMJKWh / inputs.coalHeatContentMJKg;
  const inventoryLimitMW =
    inputs.inventoryTonnes / (tonnesPerMWh * inputs.intervalHours);
  const availableMW = Math.min(inputs.capacityMW, inventoryLimitMW);
  const outputMW = Math.min(inputs.requestMW, availableMW);
  const electricityMWh = outputMW * inputs.intervalHours;
  const coalUsedTonnes = Math.min(
    inputs.inventoryTonnes,
    electricityMWh * tonnesPerMWh,
  );
  return {
    availableMW,
    outputMW,
    electricityMWh,
    coalUsedTonnes,
    coalRemainingTonnes: inputs.inventoryTonnes - coalUsedTonnes,
    netEfficiencyPercent: (3.6 / inputs.heatRateMJKWh) * 100,
  };
}
