export const DEFAULT_HYDRO_INPUTS = {
  netHeadM: 30,
  flowM3s: 5,
  efficiencyPercent: 85,
  ratedKW: 1500,
};

export function calculateHydroPerformance(inputs: typeof DEFAULT_HYDRO_INPUTS) {
  const { netHeadM, flowM3s, efficiencyPercent, ratedKW } = inputs;
  if (
    ![netHeadM, flowM3s, efficiencyPercent, ratedKW].every(Number.isFinite) ||
    netHeadM < 0 ||
    flowM3s < 0 ||
    efficiencyPercent < 0 ||
    efficiencyPercent > 100 ||
    ratedKW <= 0
  ) {
    return null;
  }
  // Freshwater density 1000 kg/m³ cancels the W-to-kW conversion.
  const hydraulicKW = 9.80665 * netHeadM * flowM3s;
  if (!Number.isFinite(hydraulicKW)) return null;
  const uncappedElectricalKW = hydraulicKW * (efficiencyPercent / 100);
  return {
    hydraulicKW,
    uncappedElectricalKW,
    availableKW: Math.min(uncappedElectricalKW, ratedKW),
  };
}
