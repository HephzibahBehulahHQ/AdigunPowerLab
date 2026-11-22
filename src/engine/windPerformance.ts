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

export const WIND_TURBINE_REFERENCES = {
  offshore: {
    ratingKW: 6000,
    model:
      "nrel-6mw-reference-turbine-tabulated-power-curve-linear-interpolation",
    source: "https://www.nrel.gov/docs/fy17osti/67414.pdf",
    points: NREL_6MW_POWER_CURVE_KW,
  },
  onshore: {
    ratingKW: 4000,
    model:
      "nrel-2020-atb-4mw-onshore-tabulated-power-curve-linear-interpolation",
    source:
      "https://api.github.com/repos/NatLabRockies/turbine-models/git/blobs/662d920de487f61e3806c044a893e334c07701fe",
    // Collinear points on the rated and zero-output plateaus are omitted.
    points: [
      [3, 0],
      [3.25, 94],
      [3.5, 132],
      [3.75, 175],
      [4, 225],
      [4.25, 281],
      [4.5, 344],
      [4.75, 415],
      [5, 494],
      [5.25, 581],
      [5.5, 676],
      [5.75, 781],
      [6, 895],
      [6.25, 1019],
      [6.5, 1153],
      [6.75, 1298],
      [7, 1455],
      [7.25, 1623],
      [7.5, 1802],
      [7.75, 1995],
      [8, 2200],
      [8.25, 2418],
      [8.5, 2650],
      [8.75, 2896],
      [9, 3156],
      [9.25, 3431],
      [9.5, 3722],
      [9.75, 4000],
      [24.75, 4000],
      [25, 0],
      [30, 0],
    ],
  },
} as const;

export interface WindPerformanceInputs {
  windSpeedsMps: number[];
  intervalHours: number;
  turbineCount: number;
  reference?: keyof typeof WIND_TURBINE_REFERENCES;
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
    inputs.reference !== undefined &&
    inputs.reference !== "onshore" &&
    inputs.reference !== "offshore"
  ) {
    errors.push("Select a supported reference turbine.");
  }
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
  return powerAtWindSpeedKW(windSpeedMps, NREL_6MW_POWER_CURVE_KW);
}

function powerAtWindSpeedKW(
  windSpeedMps: number,
  points: ReadonlyArray<readonly [number, number]>,
): number {
  if (!Number.isFinite(windSpeedMps) || windSpeedMps < 0 || windSpeedMps > 30) {
    throw new Error("Wind speed must be finite and from 0 to 30 m/s.");
  }
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
  const reference = WIND_TURBINE_REFERENCES[inputs.reference ?? "offshore"];
  const ratedFarmPowerKW = reference.ratingKW * inputs.turbineCount;
  const intervals = inputs.windSpeedsMps.map((windSpeedMps, index) => {
    const powerPerTurbineKW = powerAtWindSpeedKW(
      windSpeedMps,
      reference.points,
    );
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
