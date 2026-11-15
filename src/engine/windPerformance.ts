/**
 * NREL reference-turbine wind power curve teaching model. The curve is the
 * tabulated NREL 6 MW reference turbine in Appendix D of NREL/TP-6A20-67414.
 * Wind speeds and interval duration are user-entered; this is not a weather
 * feed, commercial turbine guarantee, or site-yield assessment.
 */
export const NREL_6MW_POWER_CURVE_KW: ReadonlyArray<readonly [number, number]> =
  [
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 246],
    [4.5, 386],
    [5, 562],
    [5.5, 776],
    [6, 1033],
    [6.5, 1337],
    [7, 1691],
    [7.5, 2100],
    [8, 2567],
    [8.5, 3096],
    [9, 3691],
    [9.5, 4356],
    [10, 5092],
    [10.5, 5620],
    [11, 5860],
    [12, 6000],
    [13, 6000],
    [14, 6000],
    [15, 6000],
    [16, 6000],
    [17, 6000],
    [18, 6000],
    [19, 6000],
    [20, 6000],
    [21, 6000],
    [22, 6000],
    [23, 6000],
    [24, 6000],
    [25, 6000],
    [26, 0],
    [27, 0],
    [28, 0],
    [29, 0],
    [30, 0],
  ];

export interface WindPerformanceInputs {
  windSpeedsMps: number[];
  intervalHours: number;
  turbineCount: number;
}

export interface WindIntervalResult {
  interval: number;
  elapsedHours: number;
  windSpeedMps: number;
  powerPerTurbineKW: number;
  farmPowerKW: number;
  farmEnergyKWh: number;
}

export interface WindPerformanceResult {
  ratedFarmPowerKW: number;
  totalEnergyKWh: number;
  meanPowerKW: number;
  capacityFactorPercent: number;
  intervals: WindIntervalResult[];
}

export const DEFAULT_WIND_PERFORMANCE_INPUTS: WindPerformanceInputs = {
  // A transparent teaching sequence at cut-in, partial-load, rated and cut-out.
  // It is not a measured location profile.
  windSpeedsMps: [3, 5, 8, 12, 18, 26],
  intervalHours: 1,
  turbineCount: 1,
};

export function validateWindPerformanceInputs(
  inputs: WindPerformanceInputs,
): string[] {
  const errors: string[] = [];
  if (
    !Array.isArray(inputs.windSpeedsMps) ||
    inputs.windSpeedsMps.length < 1 ||
    inputs.windSpeedsMps.length > 96
  ) {
    errors.push("Enter between 1 and 96 interval wind speeds.");
  } else if (
    inputs.windSpeedsMps.some(
      (speed) => !Number.isFinite(speed) || speed < 0 || speed > 30,
    )
  ) {
    errors.push("Each wind speed must be finite and from 0 to 30 m/s.");
  }
  if (
    !Number.isFinite(inputs.intervalHours) ||
    inputs.intervalHours <= 0 ||
    inputs.intervalHours > 24
  ) {
    errors.push(
      "Interval duration must be greater than 0 and at most 24 hours.",
    );
  }
  if (
    !Number.isInteger(inputs.turbineCount) ||
    inputs.turbineCount < 1 ||
    inputs.turbineCount > 10000
  ) {
    errors.push("Turbine count must be an integer from 1 to 10,000.");
  }
  return errors;
}

/** Linear interpolation between adjacent published NREL reference-curve points. */
export function nrel6MwPowerAtWindSpeedKW(windSpeedMps: number): number {
  if (!Number.isFinite(windSpeedMps) || windSpeedMps < 0 || windSpeedMps > 30) {
    throw new Error("Wind speed must be finite and from 0 to 30 m/s.");
  }
  const points = NREL_6MW_POWER_CURVE_KW;
  if (windSpeedMps <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [rightSpeed, rightPower] = points[i];
    if (windSpeedMps === rightSpeed) return rightPower;
    if (windSpeedMps < rightSpeed) {
      const [leftSpeed, leftPower] = points[i - 1];
      const fraction = (windSpeedMps - leftSpeed) / (rightSpeed - leftSpeed);
      return leftPower + fraction * (rightPower - leftPower);
    }
  }
  return points.at(-1)![1];
}

export function calculateWindPerformance(
  inputs: WindPerformanceInputs,
): WindPerformanceResult {
  const errors = validateWindPerformanceInputs(inputs);
  if (errors.length) throw new Error(errors.join(" "));
  const ratedFarmPowerKW = 6000 * inputs.turbineCount;
  const intervals = inputs.windSpeedsMps.map((windSpeedMps, index) => {
    const powerPerTurbineKW = nrel6MwPowerAtWindSpeedKW(windSpeedMps);
    const farmPowerKW = powerPerTurbineKW * inputs.turbineCount;
    return {
      interval: index + 1,
      elapsedHours: (index + 1) * inputs.intervalHours,
      windSpeedMps,
      powerPerTurbineKW,
      farmPowerKW,
      farmEnergyKWh: farmPowerKW * inputs.intervalHours,
    };
  });
  const totalEnergyKWh = intervals.reduce(
    (total, row) => total + row.farmEnergyKWh,
    0,
  );
  const elapsedHours = inputs.windSpeedsMps.length * inputs.intervalHours;
  const meanPowerKW = totalEnergyKWh / elapsedHours;
  return {
    ratedFarmPowerKW,
    totalEnergyKWh,
    meanPowerKW,
    capacityFactorPercent: (meanPowerKW / ratedFarmPowerKW) * 100,
    intervals,
  };
}
