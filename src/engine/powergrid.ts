export interface PowerGridInputs {
  powerMW: number;
  powerFactor: number;
  lineResistanceOhm: number;
  baseVoltageKV: number;
  raisedVoltageKV: number;
  generationVoltageKV: number;
  distributionVoltageKV: number;
  consumerVoltageKV: number;
}

export interface PowerGridReading {
  voltageKV: number;
  currentA: number;
  lineLossMW: number;
  lossPercent: number;
  deliveredMW: number;
}

export interface PowerGridComparison {
  base: PowerGridReading;
  raised: PowerGridReading;
  currentReductionPercent: number;
  lossReductionPercent: number;
}

export const DEFAULT_POWERGRID_INPUTS: PowerGridInputs = {
  powerMW: 100,
  powerFactor: 1,
  lineResistanceOhm: 5,
  baseVoltageKV: 132,
  raisedVoltageKV: 330,
  generationVoltageKV: 11,
  distributionVoltageKV: 33,
  consumerVoltageKV: 0.4,
};

export function validatePowerGridInputs(inputs: PowerGridInputs): string[] {
  const errors: string[] = [];
  for (const [name, value] of Object.entries(inputs))
    if (!Number.isFinite(value) || value <= 0)
      errors.push(`${name} must be a finite value greater than zero.`);
  if (inputs.powerFactor > 1)
    errors.push("powerFactor must be between 0 and 1.");
  if (inputs.raisedVoltageKV <= inputs.baseVoltageKV)
    errors.push("raisedVoltageKV must be greater than baseVoltageKV.");
  for (const voltageKV of [inputs.baseVoltageKV, inputs.raisedVoltageKV]) {
    const currentA =
      (inputs.powerMW * 1000) / (Math.sqrt(3) * voltageKV * inputs.powerFactor);
    const lossMW = (3 * currentA ** 2 * inputs.lineResistanceOhm) / 1_000_000;
    if (Number.isFinite(lossMW) && lossMW >= inputs.powerMW) {
      errors.push("Calculated line loss must be below transmitted real power.");
      break;
    }
  }
  return errors;
}

function reading(
  powerMW: number,
  powerFactor: number,
  lineResistanceOhm: number,
  voltageKV: number,
): PowerGridReading {
  // Balanced three-phase: P(kW) = sqrt(3) VLL(kV) I(A) PF.
  const currentA = (powerMW * 1000) / (Math.sqrt(3) * voltageKV * powerFactor);
  // R is the entered resistance of one phase conductor for the modeled segment.
  const lineLossMW = (3 * currentA ** 2 * lineResistanceOhm) / 1_000_000;
  return {
    voltageKV,
    currentA,
    lineLossMW,
    lossPercent: (lineLossMW / powerMW) * 100,
    deliveredMW: powerMW - lineLossMW,
  };
}

export function calculatePowerGrid(
  inputs: PowerGridInputs,
): PowerGridComparison {
  const errors = validatePowerGridInputs(inputs);
  if (errors.length) throw new Error(errors.join(" "));
  const base = reading(
    inputs.powerMW,
    inputs.powerFactor,
    inputs.lineResistanceOhm,
    inputs.baseVoltageKV,
  );
  const raised = reading(
    inputs.powerMW,
    inputs.powerFactor,
    inputs.lineResistanceOhm,
    inputs.raisedVoltageKV,
  );
  return {
    base,
    raised,
    currentReductionPercent: (1 - raised.currentA / base.currentA) * 100,
    lossReductionPercent: (1 - raised.lineLossMW / base.lineLossMW) * 100,
  };
}

export function isPowerGridInputs(value: unknown): value is PowerGridInputs {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PowerGridInputs>;
  return (
    Object.keys(DEFAULT_POWERGRID_INPUTS).every(
      (key) => typeof candidate[key as keyof PowerGridInputs] === "number",
    ) && validatePowerGridInputs(candidate as PowerGridInputs).length === 0
  );
}
