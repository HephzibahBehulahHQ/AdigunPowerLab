import {
  calculatePvPerformance,
  validatePvPerformanceInputs as validatePV,
  type PvPerformanceInputs,
} from "./pvPerformance";
import {
  calculateWindPerformance,
  validateWindPerformanceInputs as validateWind,
  type WindPerformanceInputs,
} from "./windPerformance";
import {
  calculateHydroPerformance,
  type DEFAULT_HYDRO_INPUTS,
} from "./hydroPerformance";

export interface MicrogridDispatchInputs {
  intervalHours: number;
  wind: WindPerformanceInputs;
  pvByInterval: PvPerformanceInputs[];
  reportedRenewables?: { solarKW: number; windKW: number }[];
  hydro?: Omit<typeof DEFAULT_HYDRO_INPUTS, "flowM3s"> & {
    flowsM3s: number[];
    reservoir?: {
      inflowsM3s: number[];
      capacityM3: number;
      initialM3: number;
      environmentalReleaseM3s: number;
      fullStorageHeadRiseM?: number;
    };
  };
  demandKW: number[];
  criticalDemandKW: number[];
  battery: {
    capacityKWh: number;
    initialSocPercent: number;
    minimumSocPercent: number;
    maxChargeKW: number;
    maxDischargeKW: number;
    chargeEfficiency: number;
    dischargeEfficiency: number;
  };
  backupGenerator: {
    ratedKW: number;
    rampUpKWPerInterval: number;
    outageIntervals?: number[];
    thermal?: {
      heatRateMJPerKWh: number;
      directCO2KgPerGJ?: number;
      startupFuelMJ?: number;
      initialFuelMJ?: number;
      minimumStableKW?: number;
      runningInterceptMJPerHour?: number;
    };
  };
  grid?: {
    importLimitKW: number;
    exportLimitKW: number;
    outageIntervals: number[];
  };
  pumpedStorage?: {
    capacityKWh: number;
    initialKWh: number;
    maxPumpKW: number;
    maxGenerationKW: number;
    pumpEfficiency: number;
    generationEfficiency: number;
  };
}

export interface MicrogridDispatchInterval {
  interval: number;
  pvAvailableKW: number;
  windAvailableKW: number;
  hydroAvailableKW: number;
  gridImportKW: number;
  gridExportKW: number;
  gridConnected: boolean;
  pumpedStorage?: {
    pumpKW: number;
    generationKW: number;
    storedKWh: number;
    conversionLossKWh: number;
  };
  hydroWater?: {
    netHeadM: number;
    turbineM3: number;
    environmentalReleaseM3: number;
    unmetEnvironmentalReleaseM3: number;
    spillM3: number;
    storageM3: number;
  };
  renewableAvailableKW: number;
  demandKW: number;
  criticalDemandKW: number;
  batteryChargeKW: number;
  batteryDischargeKW: number;
  batteryEnergyLimitKW: number;
  batterySocKWh: number;
  batterySocPercent: number;
  backupGenerationKW: number;
  backupInService: boolean;
  backupHeadroomKW: number;
  backupFuelEnergyMJ?: number;
  backupStartupFuelMJ?: number;
  backupRemainingFuelMJ?: number;
  backupDirectCO2Kg?: number;
  renewableCurtailmentKW: number;
  criticalUnservedKW: number;
  nonCriticalUnservedKW: number;
  servedDemandKW: number;
  balanceResidualKW: number;
}

export interface MicrogridDispatchResult {
  intervalHours: number;
  totalDemandKWh: number;
  criticalDemandKWh: number;
  servedEnergyKWh: number;
  criticalUnservedEnergyKWh: number;
  nonCriticalUnservedEnergyKWh: number;
  renewableEnergyAvailableKWh: number;
  renewableEnergyCurtailedKWh: number;
  backupEnergyKWh: number;
  backupFuelEnergyMJ?: number;
  backupDirectCO2Kg?: number;
  gridImportEnergyKWh: number;
  gridExportEnergyKWh: number;
  batteryThroughputKWh: number;
  intervals: MicrogridDispatchInterval[];
}

export const DEFAULT_MICROGRID_DISPATCH_INPUTS: MicrogridDispatchInputs = {
  intervalHours: 1,
  wind: {
    windSpeedsMps: [3, 5, 8, 12, 18, 26],
    intervalHours: 1,
    turbineCount: 1,
  },
  pvByInterval: Array.from({ length: 6 }, (_, index) => ({
    dcNameplateKW: 100,
    inverterAcRatingKW: 80,
    planeOfArrayIrradianceWm2: [0, 250, 650, 900, 500, 0][index],
    moduleTemperatureC: 35,
    cellToModuleDeltaTC: 3,
    powerTemperatureCoefficientPerC: -0.004,
    inverterEfficiency: 0.97,
  })),
  demandKW: [32, 28, 26, 30, 44, 40],
  criticalDemandKW: [12, 12, 12, 12, 16, 16],
  battery: {
    capacityKWh: 120,
    initialSocPercent: 60,
    minimumSocPercent: 20,
    maxChargeKW: 35,
    maxDischargeKW: 35,
    chargeEfficiency: 0.95,
    dischargeEfficiency: 0.95,
  },
  backupGenerator: { ratedKW: 35, rampUpKWPerInterval: 20 },
};

export function validateMicrogridDispatchInputs(
  inputs: MicrogridDispatchInputs,
): string[] {
  const errors: string[] = [];
  const count = inputs.demandKW.length;
  if (
    !Number.isFinite(inputs.intervalHours) ||
    inputs.intervalHours <= 0 ||
    inputs.intervalHours > 24
  ) {
    errors.push(
      "Interval duration must be greater than 0 and at most 24 hours.",
    );
  }
  if (count < 1 || count > 96)
    errors.push("Enter between 1 and 96 demand intervals.");
  if (
    inputs.criticalDemandKW.length !== count ||
    (!inputs.reportedRenewables &&
      (inputs.pvByInterval.length !== count ||
        inputs.wind.windSpeedsMps.length !== count))
  ) {
    errors.push(
      "PV, wind, critical-demand and total-demand profiles must have the same number of intervals.",
    );
  }
  if (
    !inputs.reportedRenewables &&
    inputs.wind.intervalHours !== inputs.intervalHours
  )
    errors.push("Wind and dispatch interval durations must match.");
  inputs.demandKW.forEach((demand, i) => {
    if (!Number.isFinite(demand) || demand < 0 || demand > 1_000_000)
      errors.push(`Demand interval ${i + 1} must be from 0 to 1,000,000 kW.`);
    const critical = inputs.criticalDemandKW[i];
    if (!Number.isFinite(critical) || critical < 0 || critical > demand)
      errors.push(
        `Critical demand interval ${i + 1} must be from 0 to its total demand.`,
      );
  });
  if (inputs.reportedRenewables) {
    if (
      inputs.reportedRenewables.length !== count ||
      inputs.reportedRenewables.some(
        ({ solarKW, windKW }) =>
          ![solarKW, windKW].every(
            (value) =>
              Number.isFinite(value) && value >= 0 && value <= 1_000_000,
          ),
      )
    )
      errors.push(
        "Reported solar and wind must provide valid power for every demand interval.",
      );
  } else {
    inputs.pvByInterval.forEach((pv, i) => {
      for (const error of validatePV(pv))
        errors.push(`PV interval ${i + 1}: ${error}`);
      if (pv.dcNameplateKW > 1_000_000 || pv.inverterAcRatingKW > 1_000_000)
        errors.push(
          `PV interval ${i + 1}: capacities must not exceed 1,000,000 kW.`,
        );
    });
    for (const error of validateWind(inputs.wind)) errors.push(error);
  }
  const hydro = inputs.hydro;
  if (hydro) {
    if (hydro.flowsM3s.length !== count) {
      errors.push("Hydro flow must have one value per demand interval.");
    }
    if (
      hydro.ratedKW > 1_000_000 ||
      !calculateHydroPerformance({ ...hydro, flowM3s: 0 }) ||
      hydro.flowsM3s.some(
        (flowM3s) => !calculateHydroPerformance({ ...hydro, flowM3s }),
      )
    ) {
      errors.push("Enter valid hydro inputs with a rating up to 1,000,000 kW.");
    }
    const reservoir = hydro.reservoir;
    const headRiseM = reservoir?.fullStorageHeadRiseM ?? 0;
    if (
      !Number.isFinite(headRiseM) ||
      headRiseM < 0 ||
      (reservoir &&
        hydro.flowsM3s.some(
          (flowM3s) =>
            !calculateHydroPerformance({
              ...hydro,
              netHeadM: hydro.netHeadM + headRiseM,
              flowM3s: Math.max(1, flowM3s),
            }),
        ))
    ) {
      errors.push("Enter a valid non-negative reservoir head rise.");
    }
    if (
      reservoir &&
      (reservoir.inflowsM3s.length !== count ||
        !reservoir.inflowsM3s.every(
          (value) => Number.isFinite(value) && value >= 0 && value <= 1_000_000,
        ) ||
        !Number.isFinite(reservoir.capacityM3) ||
        reservoir.capacityM3 <= 0 ||
        reservoir.capacityM3 > 1e12 ||
        !Number.isFinite(reservoir.initialM3) ||
        reservoir.initialM3 < 0 ||
        reservoir.initialM3 > reservoir.capacityM3 ||
        !Number.isFinite(reservoir.environmentalReleaseM3s) ||
        reservoir.environmentalReleaseM3s < 0 ||
        reservoir.environmentalReleaseM3s > 1_000_000)
    ) {
      errors.push(
        "Enter one valid reservoir inflow per interval and valid storage and release limits.",
      );
    }
  }
  const b = inputs.battery;
  if (!Number.isFinite(b.capacityKWh) || b.capacityKWh <= 0)
    errors.push("Battery capacity must be positive.");
  if (
    !Number.isFinite(b.initialSocPercent) ||
    b.initialSocPercent < 0 ||
    b.initialSocPercent > 100
  )
    errors.push("Initial battery state of charge must be from 0 to 100%.");
  if (
    !Number.isFinite(b.minimumSocPercent) ||
    b.minimumSocPercent < 0 ||
    b.minimumSocPercent > b.initialSocPercent
  )
    errors.push(
      "Minimum battery reserve must be from 0 to the initial state of charge.",
    );
  for (const [value, label] of [
    [b.maxChargeKW, "Maximum charge power"],
    [b.maxDischargeKW, "Maximum discharge power"],
  ] as const) {
    if (!Number.isFinite(value) || value < 0)
      errors.push(`${label} must be a finite non-negative value.`);
  }
  for (const [value, label] of [
    [b.chargeEfficiency, "Charge efficiency"],
    [b.dischargeEfficiency, "Discharge efficiency"],
  ] as const) {
    if (!Number.isFinite(value) || value <= 0 || value > 1)
      errors.push(`${label} must be greater than 0 and at most 1.`);
  }
  const g = inputs.backupGenerator;
  const runningIntercept = g.thermal?.runningInterceptMJPerHour ?? 0;
  if (
    g.thermal &&
    (!Number.isFinite(g.thermal.heatRateMJPerKWh) ||
      g.thermal.heatRateMJPerKWh <= 0 ||
      (g.ratedKW > 0 &&
        g.thermal.heatRateMJPerKWh + runningIntercept / g.ratedKW <
          3.6 - 1e-12) ||
      g.thermal.heatRateMJPerKWh > 1e7)
  ) {
    errors.push(
      "Enter a positive fuel slope and at least 3.6 MJ/kWh total fuel at rated output.",
    );
  }
  const emissionsFactor = g.thermal?.directCO2KgPerGJ;
  if (
    emissionsFactor !== undefined &&
    (!Number.isFinite(emissionsFactor) ||
      emissionsFactor < 0 ||
      emissionsFactor > 1_000)
  ) {
    errors.push("Enter a direct CO₂ factor from zero to 1,000 kg/GJ.");
  }
  for (const amount of [g.thermal?.startupFuelMJ, g.thermal?.initialFuelMJ]) {
    if (
      amount !== undefined &&
      (!Number.isFinite(amount) || amount < 0 || amount > 1e12)
    ) {
      errors.push(
        "Enter nonnegative startup fuel and inventory values up to 1,000,000,000,000 MJ.",
      );
      break;
    }
  }
  const minimumStableKW = g.thermal?.minimumStableKW ?? 0;
  if (
    !Number.isFinite(minimumStableKW) ||
    minimumStableKW < 0 ||
    minimumStableKW > g.ratedKW
  ) {
    errors.push(
      "Minimum stable backup output must be between zero and the generator rating.",
    );
  }
  if (
    !Number.isFinite(runningIntercept) ||
    runningIntercept < 0 ||
    runningIntercept > 1e9
  ) {
    errors.push(
      "Enter a running fuel intercept from zero to 1,000,000,000 MJ/h.",
    );
  }
  if (
    g.outageIntervals?.some(
      (interval) =>
        !Number.isInteger(interval) || interval < 1 || interval > count,
    )
  ) {
    errors.push(
      "Enter backup outage interval numbers within the demand profile.",
    );
  }
  const grid = inputs.grid;
  if (
    grid &&
    (![grid.importLimitKW, grid.exportLimitKW].every(
      (limit) => Number.isFinite(limit) && limit >= 0 && limit <= 1_000_000,
    ) ||
      !grid.outageIntervals.every(
        (interval) =>
          Number.isInteger(interval) && interval >= 1 && interval <= count,
      ))
  ) {
    errors.push(
      "Enter valid grid limits and outage interval numbers within the demand profile.",
    );
  }
  const pumped = inputs.pumpedStorage;
  if (
    pumped &&
    (![
      pumped.capacityKWh,
      pumped.initialKWh,
      pumped.maxPumpKW,
      pumped.maxGenerationKW,
      pumped.pumpEfficiency,
      pumped.generationEfficiency,
    ].every(Number.isFinite) ||
      pumped.capacityKWh <= 0 ||
      pumped.capacityKWh > 1e9 ||
      pumped.initialKWh < 0 ||
      pumped.initialKWh > pumped.capacityKWh ||
      pumped.maxPumpKW < 0 ||
      pumped.maxPumpKW > 1e6 ||
      pumped.maxGenerationKW < 0 ||
      pumped.maxGenerationKW > 1e6 ||
      pumped.pumpEfficiency < 0.01 ||
      pumped.pumpEfficiency > 1 ||
      pumped.generationEfficiency < 0.01 ||
      pumped.generationEfficiency > 1)
  ) {
    errors.push(
      "Enter valid pumped storage capacity, energy, ratings and efficiencies (1–100%).",
    );
  }
  if (
    !Number.isFinite(g.ratedKW) ||
    g.ratedKW < 0 ||
    !Number.isFinite(g.rampUpKWPerInterval) ||
    g.rampUpKWPerInterval < 0
  )
    errors.push(
      "Backup generator rating and ramp-up limit must be finite and non-negative.",
    );
  return errors;
}

/**
 * Chronological teaching dispatch: available PV, wind and hydro serve load first, then
 * surplus charges the battery; deficits use battery discharge then a bounded
 * backup unit. Remaining supply serves critical demand before non-critical
 * demand. Grid exchange is bounded at the shared AC bus, without feeder losses.
 */
export function calculateMicrogridDispatch(
  inputs: MicrogridDispatchInputs,
): MicrogridDispatchResult {
  const errors = validateMicrogridDispatchInputs(inputs);
  if (errors.length) throw new Error(errors.join(" "));
  const { battery, backupGenerator: generator, intervalHours } = inputs;
  const capacityKWh = battery.capacityKWh;
  const minimumKWh = (capacityKWh * battery.minimumSocPercent) / 100;
  let socKWh = (capacityKWh * battery.initialSocPercent) / 100;
  let previousGeneratorKW = 0;
  const thermal = generator.thermal;
  let remainingFuelMJ = thermal?.initialFuelMJ;
  const pumped = inputs.pumpedStorage;
  const grid = inputs.grid;
  const outages = new Set(grid?.outageIntervals);
  const backupOutages = new Set(generator.outageIntervals);
  let pumpedEnergyKWh = pumped?.initialKWh ?? 0;
  const wind = inputs.reportedRenewables
    ? undefined
    : calculateWindPerformance(inputs.wind);
  const hydro = inputs.hydro;
  const reservoir = hydro?.reservoir;
  let waterM3 = reservoir?.initialM3 ?? 0;
  const seconds = intervalHours * 3600;
  const intervals = inputs.demandKW.map((demandKW, index) => {
    const reported = inputs.reportedRenewables?.[index];
    const pvAvailableKW =
      reported?.solarKW ??
      calculatePvPerformance(inputs.pvByInterval[index]).acPowerKW;
    const windAvailableKW =
      reported?.windKW ?? wind!.intervals[index].farmPowerKW;
    let turbineFlowM3s = hydro?.flowsM3s[index] ?? 0;
    let netHeadM = hydro?.netHeadM ?? 0;
    let hydroWater: MicrogridDispatchInterval["hydroWater"];
    if (reservoir && hydro) {
      netHeadM +=
        (reservoir.fullStorageHeadRiseM ?? 0) *
        (waterM3 / reservoir.capacityM3);
      const hydroKWPerM3s = calculateHydroPerformance({
        ...hydro,
        netHeadM,
        flowM3s: 1,
      })!.uncappedElectricalKW;
      const availableM3 = waterM3 + reservoir.inflowsM3s[index] * seconds;
      const releaseTargetM3 = reservoir.environmentalReleaseM3s * seconds;
      const environmentalReleaseM3 = Math.min(availableM3, releaseTargetM3);
      const remainingM3 = availableM3 - environmentalReleaseM3;
      const ratedFlowM3s =
        hydroKWPerM3s > 0 ? hydro.ratedKW / hydroKWPerM3s : 0;
      turbineFlowM3s = Math.min(
        turbineFlowM3s,
        ratedFlowM3s,
        remainingM3 / seconds,
      );
      const turbineM3 = Math.min(remainingM3, turbineFlowM3s * seconds);
      const afterReleaseM3 = remainingM3 - turbineM3;
      waterM3 = Math.min(afterReleaseM3, reservoir.capacityM3);
      hydroWater = {
        netHeadM,
        turbineM3,
        environmentalReleaseM3,
        unmetEnvironmentalReleaseM3: releaseTargetM3 - environmentalReleaseM3,
        spillM3: afterReleaseM3 - waterM3,
        storageM3: waterM3,
      };
    }
    const hydroAvailableKW = hydro
      ? calculateHydroPerformance({
          ...hydro,
          netHeadM,
          flowM3s: turbineFlowM3s,
        })!.availableKW
      : 0;
    const renewableAvailableKW =
      pvAvailableKW + windAvailableKW + hydroAvailableKW;
    const criticalDemandKW = inputs.criticalDemandKW[index];
    const surplusKW = Math.max(0, renewableAvailableKW - demandKW);
    const batteryHeadroomKW = Math.max(
      0,
      (capacityKWh - socKWh) / (intervalHours * battery.chargeEfficiency),
    );
    const batteryChargeKW = Math.min(
      surplusKW,
      battery.maxChargeKW,
      batteryHeadroomKW,
    );
    socKWh = Math.min(
      capacityKWh,
      socKWh + batteryChargeKW * intervalHours * battery.chargeEfficiency,
    );
    const deficitKW = Math.max(0, demandKW - renewableAvailableKW);
    const dischargeEnergyLimitKW = Math.max(
      0,
      ((socKWh - minimumKWh) * battery.dischargeEfficiency) / intervalHours,
    );
    const batteryDischargeKW = Math.min(
      deficitKW,
      battery.maxDischargeKW,
      dischargeEnergyLimitKW,
    );
    socKWh = Math.max(
      minimumKWh,
      socKWh -
        (batteryDischargeKW * intervalHours) / battery.dischargeEfficiency,
    );
    let pumpKW = 0;
    let pumpedGenerationKW = 0;
    let pumpedStorage: MicrogridDispatchInterval["pumpedStorage"];
    if (pumped) {
      pumpKW = Math.min(
        surplusKW - batteryChargeKW,
        pumped.maxPumpKW,
        (pumped.capacityKWh - pumpedEnergyKWh) /
          pumped.pumpEfficiency /
          intervalHours,
      );
      pumpedGenerationKW = Math.min(
        deficitKW - batteryDischargeKW,
        pumped.maxGenerationKW,
        (pumpedEnergyKWh * pumped.generationEfficiency) / intervalHours,
      );
      const chargingKWh = pumpKW * intervalHours;
      const deliveredKWh = pumpedGenerationKW * intervalHours;
      const addedKWh = chargingKWh * pumped.pumpEfficiency;
      const withdrawnKWh = deliveredKWh / pumped.generationEfficiency;
      pumpedEnergyKWh = Math.max(
        0,
        Math.min(pumped.capacityKWh, pumpedEnergyKWh + addedKWh - withdrawnKWh),
      );
      pumpedStorage = {
        pumpKW,
        generationKW: pumpedGenerationKW,
        storedKWh: pumpedEnergyKWh,
        conversionLossKWh: chargingKWh - addedKWh + withdrawnKWh - deliveredKWh,
      };
    }
    const gridConnected = Boolean(grid && !outages.has(index + 1));
    const residualDeficitKW = Math.max(
      0,
      deficitKW - batteryDischargeKW - pumpedGenerationKW,
    );
    const residualSurplusKW = Math.max(0, surplusKW - batteryChargeKW - pumpKW);
    const gridImportKW = gridConnected
      ? Math.min(grid!.importLimitKW, residualDeficitKW)
      : 0;
    const gridExportKW = gridConnected
      ? Math.min(grid!.exportLimitKW, residualSurplusKW)
      : 0;
    const backupInService =
      generator.ratedKW > 0 && !backupOutages.has(index + 1);
    const generatorLimitKW = backupInService
      ? Math.min(
          generator.ratedKW,
          previousGeneratorKW + generator.rampUpKWPerInterval,
        )
      : 0;
    const potentialStartupFuelMJ =
      previousGeneratorKW === 0 ? (thermal?.startupFuelMJ ?? 0) : 0;
    const potentialRunningInterceptMJ =
      intervalHours * (thermal?.runningInterceptMJPerHour ?? 0);
    const runningFuelMJPerKW = intervalHours * (thermal?.heatRateMJPerKWh ?? 0);
    const fueledGeneratorLimitKW =
      remainingFuelMJ === undefined
        ? generatorLimitKW
        : Math.min(
            generatorLimitKW,
            Math.max(
              0,
              remainingFuelMJ -
                potentialStartupFuelMJ -
                potentialRunningInterceptMJ,
            ) / runningFuelMJPerKW,
          );
    const minimumStableKW = thermal?.minimumStableKW ?? 0;
    const stableGeneratorLimitKW =
      fueledGeneratorLimitKW >= minimumStableKW ? fueledGeneratorLimitKW : 0;
    const requestedBackupKW = Math.min(
      residualDeficitKW - gridImportKW,
      stableGeneratorLimitKW,
    );
    const backupGenerationKW =
      requestedBackupKW >= minimumStableKW ? requestedBackupKW : 0;
    const backupStartupFuelMJ = thermal
      ? backupGenerationKW > 0
        ? potentialStartupFuelMJ
        : 0
      : undefined;
    previousGeneratorKW = backupGenerationKW;
    const backupFuelEnergyMJ = thermal
      ? backupGenerationKW > 0
        ? backupGenerationKW * runningFuelMJPerKW +
          potentialRunningInterceptMJ +
          potentialStartupFuelMJ
        : 0
      : undefined;
    if (remainingFuelMJ !== undefined && backupFuelEnergyMJ !== undefined) {
      remainingFuelMJ = Math.max(0, remainingFuelMJ - backupFuelEnergyMJ);
    }
    const directCO2Factor = generator.thermal?.directCO2KgPerGJ;
    const backupDirectCO2Kg =
      backupFuelEnergyMJ !== undefined && directCO2Factor !== undefined
        ? (backupFuelEnergyMJ / 1_000) * directCO2Factor
        : undefined;
    const renewableToLoadKW = Math.min(renewableAvailableKW, demandKW);
    const availableToLoadKW =
      renewableToLoadKW +
      batteryDischargeKW +
      pumpedGenerationKW +
      gridImportKW +
      backupGenerationKW;
    const servedDemandKW = Math.min(demandKW, availableToLoadKW);
    const criticalServedKW = Math.min(criticalDemandKW, servedDemandKW);
    const nonCriticalDemandKW = demandKW - criticalDemandKW;
    const nonCriticalServedKW = Math.min(
      nonCriticalDemandKW,
      Math.max(0, servedDemandKW - criticalServedKW),
    );
    const renewableCurtailmentKW = residualSurplusKW - gridExportKW;
    const balanceResidualKW =
      renewableAvailableKW +
      batteryDischargeKW +
      pumpedGenerationKW +
      gridImportKW +
      backupGenerationKW -
      batteryChargeKW -
      pumpKW -
      gridExportKW -
      renewableCurtailmentKW -
      servedDemandKW;
    return {
      interval: index + 1,
      pvAvailableKW,
      windAvailableKW,
      hydroAvailableKW,
      gridImportKW,
      gridExportKW,
      gridConnected,
      pumpedStorage,
      hydroWater,
      renewableAvailableKW,
      demandKW,
      criticalDemandKW,
      batteryChargeKW,
      batteryDischargeKW,
      batteryEnergyLimitKW: dischargeEnergyLimitKW,
      batterySocKWh: socKWh,
      batterySocPercent: (socKWh / capacityKWh) * 100,
      backupGenerationKW,
      backupInService,
      backupHeadroomKW: stableGeneratorLimitKW - backupGenerationKW,
      backupFuelEnergyMJ,
      backupStartupFuelMJ,
      backupRemainingFuelMJ: remainingFuelMJ,
      backupDirectCO2Kg,
      renewableCurtailmentKW,
      criticalUnservedKW: criticalDemandKW - criticalServedKW,
      nonCriticalUnservedKW: nonCriticalDemandKW - nonCriticalServedKW,
      servedDemandKW,
      balanceResidualKW,
    };
  });
  const sum = (pick: (row: MicrogridDispatchInterval) => number) =>
    intervals.reduce((total, row) => total + pick(row) * intervalHours, 0);
  return {
    intervalHours,
    totalDemandKWh: sum((row) => row.demandKW),
    criticalDemandKWh: sum((row) => row.criticalDemandKW),
    servedEnergyKWh: sum((row) => row.servedDemandKW),
    criticalUnservedEnergyKWh: sum((row) => row.criticalUnservedKW),
    nonCriticalUnservedEnergyKWh: sum((row) => row.nonCriticalUnservedKW),
    renewableEnergyAvailableKWh: sum((row) => row.renewableAvailableKW),
    renewableEnergyCurtailedKWh: sum((row) => row.renewableCurtailmentKW),
    backupEnergyKWh: sum((row) => row.backupGenerationKW),
    backupFuelEnergyMJ: generator.thermal
      ? intervals.reduce(
          (total, row) => total + (row.backupFuelEnergyMJ ?? 0),
          0,
        )
      : undefined,
    backupDirectCO2Kg:
      generator.thermal?.directCO2KgPerGJ !== undefined
        ? intervals.reduce(
            (total, row) => total + (row.backupDirectCO2Kg ?? 0),
            0,
          )
        : undefined,
    gridImportEnergyKWh: sum((row) => row.gridImportKW),
    gridExportEnergyKWh: sum((row) => row.gridExportKW),
    batteryThroughputKWh: sum(
      (row) => row.batteryChargeKW + row.batteryDischargeKW,
    ),
    intervals,
  };
}
