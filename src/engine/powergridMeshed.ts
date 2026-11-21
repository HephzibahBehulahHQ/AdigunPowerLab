type BusSpec =
  | { kind: "slack"; voltagePU: number }
  | {
      kind: "pv";
      netMW: number;
      voltagePU: number;
      minNetMvar: number;
      maxNetMvar: number;
    }
  | { kind: "pq"; netMW: number; netMvar: number };

export type MeshedBus = BusSpec & { id: string };
export interface MeshedBranch {
  id: string;
  from: string;
  to: string;
  resistancePU: number;
  reactancePU: number;
  chargingPU?: number;
  tap?: number;
  shiftDeg?: number;
  ratingMVA?: number;
  inService: boolean;
}

export interface MeshedInputs {
  baseMVA: number;
  buses: MeshedBus[];
  branches: MeshedBranch[];
  tolerancePU?: number;
  maxIterations?: number;
}

type Complex = readonly [number, number];
const add = ([a, b]: Complex, [c, d]: Complex): Complex => [a + c, b + d];
const multiply = ([a, b]: Complex, [c, d]: Complex): Complex => [
  a * c - b * d,
  a * d + b * c,
];
const scale = ([a, b]: Complex, value: number): Complex => [
  a * value,
  b * value,
];
const conjugate = ([a, b]: Complex): Complex => [a, -b];
const polar = (magnitude: number, angle: number): Complex => [
  magnitude * Math.cos(angle),
  magnitude * Math.sin(angle),
];

function solveLinear(matrix: number[][], rhs: number[]) {
  const augmented = matrix.map((row, i) => [...row, rhs[i]]);
  const size = rhs.length;
  for (let col = 0; col < size; col++) {
    let pivot = col;
    for (let i = col + 1; i < size; i++) {
      if (Math.abs(augmented[i][col]) > Math.abs(augmented[pivot][col]))
        pivot = i;
    }
    [augmented[col], augmented[pivot]] = [augmented[pivot], augmented[col]];
    const divisor = augmented[col][col];
    if (!Number.isFinite(divisor) || Math.abs(divisor) < 1e-12) return null;
    for (let i = col + 1; i < size; i++) {
      const multiplier = augmented[i][col] / divisor;
      for (let j = col; j <= size; j++)
        augmented[i][j] -= multiplier * augmented[col][j];
    }
  }
  const solution = new Array<number>(size).fill(0);
  for (let i = size - 1; i >= 0; i--) {
    let remainder = augmented[i][size];
    for (let j = i + 1; j < size; j++)
      remainder -= augmented[i][j] * solution[j];
    solution[i] = remainder / augmented[i][i];
  }
  return solution;
}

const norm = (values: number[]) => Math.max(0, ...values.map(Math.abs));

export function solveMeshedPowerFlow(inputs: MeshedInputs) {
  const { baseMVA, buses, branches } = inputs;
  const tolerance = inputs.tolerancePU ?? 1e-8;
  const cap = inputs.maxIterations ?? 35;
  let iterations = 0;
  let residualPU: number | null = null;
  const failure = (reason: "invalid" | "islanded" | "not-converged") =>
    ({ converged: false, reason, iterations, residualPU }) as const;
  const references = buses.filter((bus) => bus.kind === "slack");
  const byId = new Map(buses.map((bus, index) => [bus.id, index]));
  if (
    !Number.isFinite(baseMVA) ||
    baseMVA <= 0 ||
    buses.length < 2 ||
    buses.length > 24 ||
    branches.length > 100 ||
    byId.size !== buses.length ||
    references.length !== 1 ||
    new Set(branches.map((branch) => branch.id)).size !== branches.length ||
    !Number.isFinite(tolerance) ||
    tolerance < 1e-12 ||
    tolerance > 0.01 ||
    !Number.isInteger(cap) ||
    cap < 1 ||
    cap > 100 ||
    buses.some(
      (bus) =>
        !bus.id ||
        (bus.kind !== "pq" &&
          (!Number.isFinite(bus.voltagePU) ||
            bus.voltagePU < 0.5 ||
            bus.voltagePU > 1.5)) ||
        (bus.kind !== "slack" && !Number.isFinite(bus.netMW / baseMVA)) ||
        (bus.kind === "pq" && !Number.isFinite(bus.netMvar / baseMVA)) ||
        (bus.kind === "pv" &&
          (!Number.isFinite(bus.minNetMvar / baseMVA) ||
            !Number.isFinite(bus.maxNetMvar / baseMVA) ||
            bus.minNetMvar > bus.maxNetMvar)),
    ) ||
    branches.some((branch) => {
      const {
        resistancePU: r,
        reactancePU: x,
        chargingPU: b = 0,
        tap = 1,
        shiftDeg = 0,
      } = branch;
      const impedance = Math.hypot(r, x);
      return (
        !branch.id ||
        !byId.has(branch.from) ||
        !byId.has(branch.to) ||
        branch.from === branch.to ||
        !Number.isFinite(impedance) ||
        impedance < 1e-6 ||
        impedance > 100 ||
        r < 0 ||
        !Number.isFinite(b) ||
        Math.abs(b) > 10 ||
        !Number.isFinite(tap) ||
        tap < 0.5 ||
        tap > 2 ||
        (branch.ratingMVA !== undefined &&
          (!Number.isFinite(branch.ratingMVA) || branch.ratingMVA <= 0)) ||
        !Number.isFinite(shiftDeg) ||
        Math.abs(shiftDeg) > 180
      );
    })
  )
    return failure("invalid");

  const slack = byId.get(references[0].id)!;
  const active = branches
    .filter((branch) => branch.inService)
    .map((branch) => {
      const {
        resistancePU: r,
        reactancePU: x,
        chargingPU = 0,
        tap = 1,
        shiftDeg = 0,
      } = branch;
      const y = scale([r, -x], 1 / (r * r + x * x));
      const self = add(y, [0, chargingPU / 2]);
      const angle = (shiftDeg * Math.PI) / 180;
      return {
        branch,
        from: byId.get(branch.from)!,
        to: byId.get(branch.to)!,
        fromSelf: scale(self, 1 / (tap * tap)),
        toSelf: self,
        fromMutual: multiply(y, polar(-1 / tap, angle)),
        toMutual: multiply(y, polar(-1 / tap, -angle)),
      };
    });
  const connected = new Set([slack]);
  for (let pass = 0; pass < buses.length; pass++) {
    for (const { from, to } of active) {
      if (connected.has(from)) connected.add(to);
      if (connected.has(to)) connected.add(from);
    }
  }
  if (connected.size !== buses.length) return failure("islanded");

  const terminals = (voltages: Complex[]) =>
    active.map((line) => {
      const from = voltages[line.from];
      const to = voltages[line.to];
      const fromCurrent = add(
        multiply(line.fromSelf, from),
        multiply(line.fromMutual, to),
      );
      const toCurrent = add(
        multiply(line.toSelf, to),
        multiply(line.toMutual, from),
      );
      return {
        fromPower: multiply(from, conjugate(fromCurrent)),
        toPower: multiply(to, conjugate(toCurrent)),
      };
    });
  const power = (voltages: Complex[]) => {
    const totals: Complex[] = buses.map(() => [0, 0]);
    terminals(voltages).forEach(({ fromPower, toPower }, i) => {
      const { from, to } = active[i];
      totals[from] = add(totals[from], fromPower);
      totals[to] = add(totals[to], toPower);
    });
    return totals;
  };
  const angles = buses.map(() => 0);
  const magnitudes = buses.map((bus) =>
    bus.kind === "pq" ? 1 : bus.voltagePU,
  );
  const reactiveLimits = new Map<number, number>();
  const nonSlack = buses.map((_, i) => i).filter((i) => i !== slack);

  for (let pass = 0; pass < buses.length; pass++) {
    const pq = nonSlack.filter(
      (i) => buses[i].kind === "pq" || reactiveLimits.has(i),
    );
    const vars = [
      ...nonSlack.map((i) => ({ i, values: angles })),
      ...pq.map((i) => ({ i, values: magnitudes })),
    ];
    const mismatch = () => {
      const calculated = power(
        magnitudes.map((value, i) => polar(value, angles[i])),
      );
      return [
        ...nonSlack.map((i) => {
          const bus = buses[i];
          return (
            (bus.kind === "slack" ? 0 : bus.netMW / baseMVA) - calculated[i][0]
          );
        }),
        ...pq.map((i) => {
          const bus = buses[i];
          return (
            (bus.kind === "pq" ? bus.netMvar : reactiveLimits.get(i)!) /
              baseMVA -
            calculated[i][1]
          );
        }),
      ];
    };

    let errors = mismatch();
    while (norm(errors) > tolerance && iterations < cap) {
      iterations++;
      const h = 1e-6;
      const columns = vars.map(({ i, values }) => {
        const start = values[i];
        values[i] = start + h;
        const moved = mismatch();
        values[i] = start;
        return moved.map((value, j) => (errors[j] - value) / h);
      });
      const delta = solveLinear(
        errors.map((_, i) => columns.map((column) => column[i])),
        errors,
      );
      if (!delta || !delta.every(Number.isFinite)) break;
      const start = vars.map(({ i, values }) => values[i]);
      let accepted = false;
      for (let step = 1; step >= 1 / 128; step /= 2) {
        vars.forEach(({ i, values }, j) => {
          values[i] = start[j] + step * delta[j];
        });
        const next = mismatch();
        if (
          magnitudes.every((value) => value > 0.05 && value < 3) &&
          norm(next) < norm(errors)
        ) {
          errors = next;
          accepted = true;
          break;
        }
      }
      if (!accepted) {
        vars.forEach(({ i, values }, j) => {
          values[i] = start[j];
        });
        break;
      }
    }
    const residual = norm(errors);
    residualPU = Number.isFinite(residual) ? residual : null;
    if (residualPU === null || residualPU > tolerance)
      return failure("not-converged");

    const voltage = magnitudes.map((value, i) => polar(value, angles[i]));
    const calculated = power(voltage);
    const previousLimits = reactiveLimits.size;
    buses.forEach((bus, i) => {
      if (bus.kind !== "pv" || reactiveLimits.has(i)) return;
      const reactive = calculated[i][1];
      if (reactive < bus.minNetMvar / baseMVA - tolerance)
        reactiveLimits.set(i, bus.minNetMvar);
      if (reactive > bus.maxNetMvar / baseMVA + tolerance)
        reactiveLimits.set(i, bus.maxNetMvar);
    });
    if (reactiveLimits.size !== previousLimits) continue;
    return {
      converged: true,
      iterations,
      residualPU,
      buses: buses.map((bus, i) => ({
        id: bus.id,
        voltagePU: magnitudes[i],
        angleDeg: (angles[i] * 180) / Math.PI,
        netMW: calculated[i][0] * baseMVA,
        netMvar: calculated[i][1] * baseMVA,
        limitedMvar: reactiveLimits.get(i),
      })),
      branches: terminals(voltage).map(({ fromPower, toPower }, i) => ({
        id: active[i].branch.id,
        fromMW: fromPower[0] * baseMVA,
        toMW: toPower[0] * baseMVA,
        fromMvar: fromPower[1] * baseMVA,
        toMvar: toPower[1] * baseMVA,
        lossMW: (fromPower[0] + toPower[0]) * baseMVA,
      })),
    } as const;
  }
  return failure("not-converged");
}

function summarizeCase(
  input: MeshedInputs,
  result: ReturnType<typeof solveMeshedPowerFlow>,
) {
  if (!result.converged) return { status: result.reason } as const;
  const ratings = new Map(
    input.branches.map((branch) => [branch.id, branch.ratingMVA]),
  );
  const loaded = result.branches.flatMap((branch) => {
    const rating = ratings.get(branch.id);
    if (rating === undefined) return [];
    const fromMVA = Math.hypot(branch.fromMW, branch.fromMvar);
    const toMVA = Math.hypot(branch.toMW, branch.toMvar);
    return [
      {
        id: branch.id,
        loadingPercent: (100 * Math.max(fromMVA, toMVA)) / rating,
      },
    ];
  });
  const minVoltagePU = Math.min(...result.buses.map((bus) => bus.voltagePU));
  const maxVoltagePU = Math.max(...result.buses.map((bus) => bus.voltagePU));
  const voltageViolations = result.buses
    .filter((bus) => bus.voltagePU < 0.95 || bus.voltagePU > 1.05)
    .map((bus) => bus.id);
  const overloaded = loaded
    .filter((branch) => branch.loadingPercent > 100)
    .map((branch) => branch.id);
  return {
    status:
      voltageViolations.length || overloaded.length ? "violations" : "clear",
    minVoltagePU,
    maxVoltagePU,
    voltageViolations,
    overloaded,
    loaded,
    residualPU: result.residualPU,
  } as const;
}

export function compareSingleBranchOutages(
  input: MeshedInputs,
  base: ReturnType<typeof solveMeshedPowerFlow>,
) {
  const baseline = summarizeCase(input, base);
  if (!base.converged) return { baseline, outages: [] };
  return {
    baseline,
    outages: input.branches
      .filter((branch) => branch.inService)
      .map(({ id }) => {
        const scenario = {
          ...input,
          branches: input.branches.map((branch) =>
            branch.id === id ? { ...branch, inService: false } : branch,
          ),
        };
        return {
          openedBranch: id,
          ...summarizeCase(scenario, solveMeshedPowerFlow(scenario)),
        };
      }),
  };
}
