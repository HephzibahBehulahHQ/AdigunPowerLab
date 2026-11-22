export const COMBINED_CYCLE_FIELDS = {
  fuelAvailableMW: { initial: 300, min: 0, max: 10_000 },
  gasEfficiencyPercent: { initial: 40, min: 0, max: 60 },
  heatRecoveryPercent: { initial: 80, min: 0, max: 100 },
  steamEfficiencyPercent: { initial: 35, min: 0, max: 60 },
  grossRatingMW: { initial: 160, min: 0.001, max: 5_000 },
  minimumGrossPercent: { initial: 20, min: 0, max: 100 },
  requestGrossMW: { initial: 150, min: 0, max: 5_000 },
  auxiliariesMW: { initial: 3, min: 0, max: 5_000 },
};

export type CombinedCycleInputs = Record<
  keyof typeof COMBINED_CYCLE_FIELDS,
  number
>;

export function getCombinedCycleDispatchFuelSettings(
  inputs: CombinedCycleInputs,
) {
  const result = calculateCombinedCycle(inputs);
  if (!result || result.availableGrossMW <= inputs.auxiliariesMW) return null;
  const grossEfficiency = result.grossPotentialMW / inputs.fuelAvailableMW;
  const incrementalMJPerKWh = 3.6 / grossEfficiency;
  if (!Number.isFinite(incrementalMJPerKWh) || incrementalMJPerKWh > 1e7)
    return null;
  const minimumGrossMW =
    (inputs.grossRatingMW * inputs.minimumGrossPercent) / 100;
  return {
    ratingKW: (result.availableGrossMW - inputs.auxiliariesMW) * 1_000,
    minimumStableKW: Math.max(0, minimumGrossMW - inputs.auxiliariesMW) * 1_000,
    incrementalMJPerKWh,
    runningInterceptMJPerHour:
      inputs.auxiliariesMW * 1_000 * incrementalMJPerKWh,
  };
}

export function calculateCombinedCycle(inputs: CombinedCycleInputs) {
  if (
    Object.entries(COMBINED_CYCLE_FIELDS).some(([key, { min, max }]) => {
      const value = inputs[key as keyof CombinedCycleInputs];
      return !Number.isFinite(value) || value < min || value > max;
    })
  )
    return null;

  const gasFraction = inputs.gasEfficiencyPercent / 100;
  const recoverableFraction =
    ((1 - gasFraction) * inputs.heatRecoveryPercent) / 100;
  const steamFraction =
    (recoverableFraction * inputs.steamEfficiencyPercent) / 100;
  const grossFraction = gasFraction + steamFraction;
  const grossPotentialMW = inputs.fuelAvailableMW * grossFraction;
  const ratingLimitedMW = Math.min(inputs.grossRatingMW, grossPotentialMW);
  const minimumGrossMW =
    (inputs.grossRatingMW * inputs.minimumGrossPercent) / 100;
  const availableGrossMW =
    ratingLimitedMW >= minimumGrossMW ? ratingLimitedMW : 0;
  const feasibleRequestMW = Math.min(inputs.requestGrossMW, availableGrossMW);
  const dispatchedGrossMW =
    feasibleRequestMW >= minimumGrossMW ? feasibleRequestMW : 0;
  const fuelUsedMW = grossFraction > 0 ? dispatchedGrossMW / grossFraction : 0;
  const gasOutputMW = fuelUsedMW * gasFraction;
  const recoveredHeatMW = fuelUsedMW * recoverableFraction;
  const steamOutputMW = fuelUsedMW * steamFraction;
  const netOutputMW = dispatchedGrossMW - inputs.auxiliariesMW;
  return {
    grossPotentialMW,
    availableGrossMW,
    dispatchedGrossMW,
    fuelUsedMW,
    gasOutputMW,
    recoveredHeatMW,
    steamOutputMW,
    netOutputMW,
  };
}
