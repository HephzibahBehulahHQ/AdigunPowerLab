export const GEOTHERMAL_FIELDS = {
  flowKgS: { initial: 50, min: 0, max: 1000 },
  productionC: { initial: 150, min: 0, max: 180 },
  reinjectionC: { initial: 80, min: 0, max: 180 },
  heatSinkC: { initial: 25, min: 0, max: 100 },
  cyclePercent: { initial: 12, min: 0, max: 100 },
  grossRatingKW: { initial: 1500, min: 1, max: 200_000 },
  auxiliariesKW: { initial: 150, min: 0, max: 200_000 },
};

export type GeothermalInputs = Record<keyof typeof GEOTHERMAL_FIELDS, number>;
export const BRINE_HEAT_CAPACITY_KJ_KG_K = 4.18;

export function calculateGeothermal(inputs: GeothermalInputs) {
  if (
    inputs.reinjectionC > inputs.productionC ||
    inputs.heatSinkC > inputs.reinjectionC ||
    inputs.cyclePercent >
      100 * (1 - (inputs.heatSinkC + 273.15) / (inputs.productionC + 273.15)) ||
    Object.entries(GEOTHERMAL_FIELDS).some(([key, { min, max }]) => {
      const value = inputs[key as keyof GeothermalInputs];
      return !Number.isFinite(value) || value < min || value > max;
    })
  )
    return null;
  const temperatureDrop = inputs.productionC - inputs.reinjectionC;
  const recoveredHeatKW =
    inputs.flowKgS * BRINE_HEAT_CAPACITY_KJ_KG_K * temperatureDrop;
  const grossPotentialKW = (recoveredHeatKW * inputs.cyclePercent) / 100;
  const grossAvailableKW = Math.min(grossPotentialKW, inputs.grossRatingKW);
  const netKW = grossAvailableKW - inputs.auxiliariesKW;
  return { recoveredHeatKW, grossPotentialKW, grossAvailableKW, netKW };
}
