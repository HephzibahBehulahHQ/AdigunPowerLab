export const FREQUENCY_FIELDS = {
  nominalHz: { initial: 50, min: 45, max: 65 },
  inertiaSeconds: { initial: 5, min: 0.5, max: 20 },
  lossPercent: { initial: 2, min: 0, max: 5 },
  damping: { initial: 1, min: 0, max: 5 },
  droopPercent: { initial: 5, min: 1, max: 20 },
  governorSeconds: { initial: 0.5, min: 0.1, max: 10 },
  reservePercent: { initial: 4, min: 0, max: 20 },
  durationSeconds: { initial: 30, min: 1, max: 120 },
};

export type FrequencyInputs = Record<keyof typeof FREQUENCY_FIELDS, number>;
export const DEFAULT_FREQUENCY_INPUTS: FrequencyInputs = {
  nominalHz: FREQUENCY_FIELDS.nominalHz.initial,
  inertiaSeconds: FREQUENCY_FIELDS.inertiaSeconds.initial,
  lossPercent: FREQUENCY_FIELDS.lossPercent.initial,
  damping: FREQUENCY_FIELDS.damping.initial,
  droopPercent: FREQUENCY_FIELDS.droopPercent.initial,
  governorSeconds: FREQUENCY_FIELDS.governorSeconds.initial,
  reservePercent: FREQUENCY_FIELDS.reservePercent.initial,
  durationSeconds: FREQUENCY_FIELDS.durationSeconds.initial,
};

const FIELD_KEYS = Object.keys(FREQUENCY_FIELDS) as (keyof FrequencyInputs)[];
const MAX_STEP_SECONDS = 0.01;
const DEVIATION_LIMIT_PU = 0.05;
type State = readonly [frequencyPU: number, governorPU: number];
const advanced = (
  [frequency, governor]: State,
  [df, dg]: State,
  step: number,
): State => [frequency + step * df, governor + step * dg];

export function simulateFrequencyResponse(input: FrequencyInputs) {
  if (
    FIELD_KEYS.some((key) => {
      const { min, max } = FREQUENCY_FIELDS[key];
      return (
        !Number.isFinite(input[key]) || input[key] < min || input[key] > max
      );
    })
  )
    return null;
  const loss = input.lossPercent / 100;
  const reserve = input.reservePercent / 100;
  const droop = input.droopPercent / 100;
  // Δf/f₀ and ΔP on one system base. First-order upward primary response only.
  const derivative = ([frequency, governor]: State): State => {
    const requested = Math.max(0, Math.min(reserve, -frequency / droop));
    return [
      (governor - loss - input.damping * frequency) /
        (2 * input.inertiaSeconds),
      (requested - governor) / input.governorSeconds,
    ];
  };
  const steps = Math.ceil(input.durationSeconds / MAX_STEP_SECONDS);
  const step = input.durationSeconds / steps;
  let state: State = [0, 0];
  const samples = [
    { seconds: 0, frequencyHz: input.nominalHz, governorPercent: 0 },
  ];
  let nadir = samples[0];
  let lastValidSample = samples[0];
  let stoppedAtModelLimit = false;
  for (let i = 1; i <= steps; i++) {
    const k1 = derivative(state);
    const k2 = derivative(advanced(state, k1, step / 2));
    const k3 = derivative(advanced(state, k2, step / 2));
    const k4 = derivative(advanced(state, k3, step));
    state = advanced(
      state,
      [
        (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) / 6,
        (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) / 6,
      ],
      step,
    );
    if (Math.abs(state[0]) > DEVIATION_LIMIT_PU) {
      stoppedAtModelLimit = true;
      break;
    }
    const sample = {
      seconds: i * step,
      frequencyHz: input.nominalHz * (1 + state[0]),
      governorPercent: 100 * state[1],
    };
    const isNadir = sample.frequencyHz < nadir.frequencyHz;
    if (isNadir) nadir = sample;
    lastValidSample = sample;
    if (i % 10 === 0 || i === steps) samples.push(sample);
  }
  if (!samples.includes(lastValidSample)) samples.push(lastValidSample);
  if (!samples.includes(nadir)) samples.push(nadir);
  samples.sort((a, b) => a.seconds - b.seconds);
  return {
    initialRoCoFHzPerSecond:
      (-input.nominalHz * loss) / (2 * input.inertiaSeconds),
    nadir,
    stoppedAtModelLimit,
    modelDeviationLimitPU: DEVIATION_LIMIT_PU,
    integrationStepSeconds: step,
    samples,
  };
}
