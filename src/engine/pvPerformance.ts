/**
 * Transparent instantaneous PVWatts-style DC model for a teaching experiment.
 * No irradiance or weather data is fetched; every environmental value is input.
 */
export interface PvPerformanceInputs {
  dcNameplateKW: number;
  inverterAcRatingKW: number;
  planeOfArrayIrradianceWm2: number;
  moduleTemperatureC: number;
  cellToModuleDeltaTC: number;
  powerTemperatureCoefficientPerC: number;
  inverterEfficiency: number;
}

export interface PvPerformanceResult {
  cellTemperatureC: number;
  temperatureFactor: number;
  dcPowerKW: number;
  inverterAcBeforeLimitKW: number;
  acPowerKW: number;
  conversionLossKW: number;
  clippingKW: number;
  totalDcToAcDifferenceKW: number;
}

export const DEFAULT_PV_PERFORMANCE_INPUTS: PvPerformanceInputs = {
  dcNameplateKW: 100,
  inverterAcRatingKW: 60,
  planeOfArrayIrradianceWm2: 800,
  moduleTemperatureC: 50,
  cellToModuleDeltaTC: 3,
  powerTemperatureCoefficientPerC: -0.004,
  inverterEfficiency: 0.97,
};

export function validatePvPerformanceInputs(
  inputs: PvPerformanceInputs,
): string[] {
  const errors: string[] = [];
  const positive = [
    [inputs.dcNameplateKW, "DC nameplate capacity"],
    [inputs.inverterAcRatingKW, "Inverter AC rating"],
  ] as const;
  for (const [value, label] of positive) {
    if (!Number.isFinite(value) || value <= 0) {
      errors.push(`${label} must be a finite positive value.`);
    }
  }
  if (
    !Number.isFinite(inputs.planeOfArrayIrradianceWm2) ||
    inputs.planeOfArrayIrradianceWm2 < 0 ||
    inputs.planeOfArrayIrradianceWm2 > 1500
  ) {
    errors.push("Plane-of-array irradiance must be from 0 to 1500 W/m².");
  }
  if (
    !Number.isFinite(inputs.moduleTemperatureC) ||
    inputs.moduleTemperatureC < -40 ||
    inputs.moduleTemperatureC > 100
  ) {
    errors.push("Module temperature must be from -40 to 100 °C.");
  }
  if (
    !Number.isFinite(inputs.cellToModuleDeltaTC) ||
    inputs.cellToModuleDeltaTC < -15 ||
    inputs.cellToModuleDeltaTC > 15
  ) {
    errors.push("Cell-to-module temperature rise must be from -15 to 15 °C.");
  }
  if (
    !Number.isFinite(inputs.powerTemperatureCoefficientPerC) ||
    inputs.powerTemperatureCoefficientPerC < -0.01 ||
    inputs.powerTemperatureCoefficientPerC > 0
  ) {
    errors.push(
      "Power temperature coefficient must be from -0.01 to 0 per °C.",
    );
  }
  if (
    !Number.isFinite(inputs.inverterEfficiency) ||
    inputs.inverterEfficiency <= 0 ||
    inputs.inverterEfficiency > 1
  ) {
    errors.push("Inverter efficiency must be greater than 0 and at most 1.");
  }
  return errors;
}

/**
 * Computes an instantaneous balanced PV array estimate. Temperature follows
 * the Sandia steady-state cell-to-module relation, then DC power follows the
 * NREL PVWatts linear irradiance/temperature relation. AC efficiency and
 * inverter nameplate clipping are explicit worksheet inputs.
 */
export function calculatePvPerformance(
  inputs: PvPerformanceInputs,
): PvPerformanceResult {
  const errors = validatePvPerformanceInputs(inputs);
  if (errors.length > 0) throw new Error(errors.join(" "));

  const cellTemperatureC =
    inputs.moduleTemperatureC +
    (inputs.planeOfArrayIrradianceWm2 / 1000) * inputs.cellToModuleDeltaTC;
  const temperatureFactor = Math.max(
    0,
    1 + inputs.powerTemperatureCoefficientPerC * (cellTemperatureC - 25),
  );
  const dcPowerKW =
    (inputs.planeOfArrayIrradianceWm2 / 1000) *
    inputs.dcNameplateKW *
    temperatureFactor;
  const inverterAcBeforeLimitKW = dcPowerKW * inputs.inverterEfficiency;
  const acPowerKW = Math.min(
    inverterAcBeforeLimitKW,
    inputs.inverterAcRatingKW,
  );
  const conversionLossKW = dcPowerKW - inverterAcBeforeLimitKW;
  const clippingKW = inverterAcBeforeLimitKW - acPowerKW;

  return {
    cellTemperatureC,
    temperatureFactor,
    dcPowerKW,
    inverterAcBeforeLimitKW,
    acPowerKW,
    conversionLossKW,
    clippingKW,
    totalDcToAcDifferenceKW: dcPowerKW - acPowerKW,
  };
}
