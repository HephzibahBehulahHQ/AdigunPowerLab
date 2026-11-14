export interface RadialBus {
  id: string;
  loadMW: number;
  loadMvar: number;
  minVoltagePU?: number;
  maxVoltagePU?: number;
}

export interface RadialBranch {
  id: string;
  fromBusId: string;
  toBusId: string;
  resistanceOhm: number;
  reactanceOhm: number;
  thermalLimitA?: number;
  inService: boolean;
}

export interface RadialNetworkInput {
  sourceBusId: string;
  sourceVoltageKV: number;
  buses: RadialBus[];
  branches: RadialBranch[];
  tolerancePU?: number;
  maxIterations?: number;
}

export interface RadialBusReading {
  busId: string;
  voltageLLKV: number;
  voltagePU: number;
  loadMW: number;
  loadMvar: number;
  voltageConstraint: "ok" | "low" | "high";
}

export interface RadialBranchReading {
  branchId: string;
  currentA: number;
  sendingMW: number;
  sendingMvar: number;
  receivingMW: number;
  receivingMvar: number;
  realLossMW: number;
  reactiveLossMvar: number;
  thermalConstraint: "ok" | "overload";
}

export interface RadialNetworkResult {
  status: "converged" | "not-converged" | "islanded";
  iterations: number;
  maxVoltageChangePU: number;
  sourceVoltageKV: number;
  sourceMW: number;
  sourceMvar: number;
  totalLoadMW: number;
  totalLoadMvar: number;
  realLossMW: number;
  reactiveLossMvar: number;
  buses: RadialBusReading[];
  branches: RadialBranchReading[];
  unservedBusIds: string[];
  validationErrors: string[];
}

export function isRadialNetworkInput(
  value: unknown,
): value is RadialNetworkInput {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<RadialNetworkInput>;
  if (
    typeof candidate.sourceBusId !== "string" ||
    typeof candidate.sourceVoltageKV !== "number" ||
    !Array.isArray(candidate.buses) ||
    !Array.isArray(candidate.branches)
  )
    return false;
  const validBus = (bus: unknown) => {
    if (!bus || typeof bus !== "object") return false;
    const item = bus as Partial<RadialBus>;
    return (
      typeof item.id === "string" &&
      typeof item.loadMW === "number" &&
      typeof item.loadMvar === "number" &&
      (item.minVoltagePU === undefined ||
        typeof item.minVoltagePU === "number") &&
      (item.maxVoltagePU === undefined || typeof item.maxVoltagePU === "number")
    );
  };
  const validBranch = (branch: unknown) => {
    if (!branch || typeof branch !== "object") return false;
    const item = branch as Partial<RadialBranch>;
    return (
      typeof item.id === "string" &&
      typeof item.fromBusId === "string" &&
      typeof item.toBusId === "string" &&
      typeof item.resistanceOhm === "number" &&
      typeof item.reactanceOhm === "number" &&
      typeof item.inService === "boolean" &&
      (item.thermalLimitA === undefined ||
        typeof item.thermalLimitA === "number")
    );
  };
  return (
    candidate.buses.every(validBus) &&
    candidate.branches.every(validBranch) &&
    (candidate.tolerancePU === undefined ||
      typeof candidate.tolerancePU === "number") &&
    (candidate.maxIterations === undefined ||
      typeof candidate.maxIterations === "number")
  );
}

interface Complex {
  re: number;
  im: number;
}

const add = (a: Complex, b: Complex): Complex => ({
  re: a.re + b.re,
  im: a.im + b.im,
});
const sub = (a: Complex, b: Complex): Complex => ({
  re: a.re - b.re,
  im: a.im - b.im,
});
const mul = (a: Complex, b: Complex): Complex => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});
const div = (a: Complex, b: Complex): Complex => {
  const denominator = b.re * b.re + b.im * b.im;
  return {
    re: (a.re * b.re + a.im * b.im) / denominator,
    im: (a.im * b.re - a.re * b.im) / denominator,
  };
};
const conjugate = (a: Complex): Complex => ({ re: a.re, im: -a.im });
const magnitude = (a: Complex): number => Math.hypot(a.re, a.im);

export function validateRadialNetwork(input: RadialNetworkInput): string[] {
  const errors: string[] = [];
  const finitePositive = (value: number) => Number.isFinite(value) && value > 0;
  if (!finitePositive(input.sourceVoltageKV))
    errors.push("Source voltage must be a finite positive kV value.");
  if (input.buses.length === 0) errors.push("Add at least one bus.");
  if (new Set(input.buses.map((bus) => bus.id)).size !== input.buses.length)
    errors.push("Bus identifiers must be unique.");
  if (
    new Set(input.branches.map((branch) => branch.id)).size !==
    input.branches.length
  )
    errors.push("Branch identifiers must be unique.");
  const buses = new Map(input.buses.map((bus) => [bus.id, bus]));
  if (!buses.has(input.sourceBusId))
    errors.push("The declared source bus is missing.");

  for (const bus of input.buses) {
    if (!Number.isFinite(bus.loadMW) || bus.loadMW < 0)
      errors.push(`Bus ${bus.id} active load must be finite and non-negative.`);
    if (!Number.isFinite(bus.loadMvar))
      errors.push(`Bus ${bus.id} reactive load must be finite.`);
    const minimum = bus.minVoltagePU ?? 0.95;
    const maximum = bus.maxVoltagePU ?? 1.05;
    if (
      !finitePositive(minimum) ||
      !finitePositive(maximum) ||
      minimum >= maximum
    )
      errors.push(`Bus ${bus.id} voltage limits must be positive and ordered.`);
  }

  for (const branch of input.branches) {
    if (!buses.has(branch.fromBusId) || !buses.has(branch.toBusId))
      errors.push(`Branch ${branch.id} references a missing bus.`);
    if (branch.fromBusId === branch.toBusId)
      errors.push(`Branch ${branch.id} cannot connect a bus to itself.`);
    if (
      !Number.isFinite(branch.resistanceOhm) ||
      branch.resistanceOhm < 0 ||
      !Number.isFinite(branch.reactanceOhm) ||
      branch.reactanceOhm < 0 ||
      branch.resistanceOhm + branch.reactanceOhm === 0
    )
      errors.push(`Branch ${branch.id} impedance must be finite and non-zero.`);
    if (
      branch.thermalLimitA !== undefined &&
      !finitePositive(branch.thermalLimitA)
    )
      errors.push(
        `Branch ${branch.id} thermal limit must be a positive ampere value.`,
      );
  }

  if (input.tolerancePU !== undefined && !finitePositive(input.tolerancePU))
    errors.push("Solver tolerance must be finite and positive.");
  if (
    input.maxIterations !== undefined &&
    (!Number.isInteger(input.maxIterations) || input.maxIterations < 1)
  )
    errors.push("Iteration limit must be a positive integer.");

  // A forest is allowed: open switches can leave disconnected radial islands.
  // A closed-loop connection is rejected instead of silently treating it as radial.
  const parent = new Map(input.buses.map((bus) => [bus.id, bus.id]));
  const find = (id: string): string => {
    const current = parent.get(id);
    if (current === undefined || current === id) return id;
    const root = find(current);
    parent.set(id, root);
    return root;
  };
  for (const branch of input.branches.filter((item) => item.inService)) {
    if (!parent.has(branch.fromBusId) || !parent.has(branch.toBusId)) continue;
    const fromRoot = find(branch.fromBusId);
    const toRoot = find(branch.toBusId);
    if (fromRoot === toRoot)
      errors.push(
        "The active network contains a loop; this solver requires radial feeders.",
      );
    else parent.set(fromRoot, toRoot);
  }
  return [...new Set(errors)];
}

export function solveRadialNetwork(
  input: RadialNetworkInput,
): RadialNetworkResult {
  const validationErrors = validateRadialNetwork(input);
  const empty: RadialNetworkResult = {
    status: "not-converged",
    iterations: 0,
    maxVoltageChangePU: Number.POSITIVE_INFINITY,
    sourceVoltageKV: input.sourceVoltageKV,
    sourceMW: 0,
    sourceMvar: 0,
    totalLoadMW: 0,
    totalLoadMvar: 0,
    realLossMW: 0,
    reactiveLossMvar: 0,
    buses: [],
    branches: [],
    unservedBusIds: [],
    validationErrors,
  };
  if (validationErrors.length) return empty;

  const busById = new Map(input.buses.map((bus) => [bus.id, bus]));
  const outgoing = new Map(
    input.buses.map((bus) => [bus.id, [] as RadialBranch[]]),
  );
  const incoming = new Map<string, RadialBranch>();
  for (const branch of input.branches.filter((item) => item.inService)) {
    outgoing.get(branch.fromBusId)?.push(branch);
    incoming.set(branch.toBusId, branch);
  }

  const order: string[] = [];
  const reached = new Set<string>();
  const queue = [input.sourceBusId];
  while (queue.length) {
    const id = queue.shift()!;
    if (reached.has(id)) continue;
    reached.add(id);
    order.push(id);
    for (const branch of outgoing.get(id) ?? []) queue.push(branch.toBusId);
  }
  if (
    input.branches.some(
      (branch) =>
        branch.inService &&
        !reached.has(branch.fromBusId) &&
        reached.has(branch.toBusId),
    )
  )
    return {
      ...empty,
      validationErrors: [
        "Active branches must be oriented away from the declared source bus.",
      ],
    };
  const unservedBusIds = input.buses
    .filter((bus) => !reached.has(bus.id))
    .map((bus) => bus.id);
  const connectedBranches = input.branches.filter(
    (branch) =>
      branch.inService &&
      reached.has(branch.fromBusId) &&
      reached.has(branch.toBusId),
  );

  const sourcePhaseV: Complex = {
    re: (input.sourceVoltageKV * 1000) / Math.sqrt(3),
    im: 0,
  };
  let voltages = new Map(order.map((id) => [id, sourcePhaseV]));
  let branchCurrents = new Map<string, Complex>();
  const tolerance = input.tolerancePU ?? 1e-6;
  const maxIterations = input.maxIterations ?? 100;
  let maxVoltageChangePU = Number.POSITIVE_INFINITY;
  let iterations = 0;

  for (; iterations < maxIterations; iterations++) {
    const busCurrents = new Map<string, Complex>();
    for (const id of order) {
      const bus = busById.get(id)!;
      const voltage = voltages.get(id)!;
      const apparentVA: Complex = {
        re: (bus.loadMW * 1e6) / 3,
        im: (bus.loadMvar * 1e6) / 3,
      };
      busCurrents.set(id, conjugate(div(apparentVA, voltage)));
    }

    branchCurrents = new Map();
    for (const id of [...order].reverse()) {
      const branch = incoming.get(id);
      if (!branch) continue;
      let total = busCurrents.get(id)!;
      for (const child of outgoing.get(id) ?? []) {
        const childCurrent = branchCurrents.get(child.id);
        if (childCurrent) total = add(total, childCurrent);
      }
      branchCurrents.set(branch.id, total);
    }

    const nextVoltages = new Map<string, Complex>([
      [input.sourceBusId, sourcePhaseV],
    ]);
    for (const id of order) {
      const fromVoltage = nextVoltages.get(id);
      if (!fromVoltage) continue;
      for (const branch of outgoing.get(id) ?? []) {
        const current = branchCurrents.get(branch.id) ?? { re: 0, im: 0 };
        const impedance: Complex = {
          re: branch.resistanceOhm,
          im: branch.reactanceOhm,
        };
        nextVoltages.set(
          branch.toBusId,
          sub(fromVoltage, mul(impedance, current)),
        );
      }
    }

    if (
      [...nextVoltages.values()].some(
        (voltage) =>
          !Number.isFinite(voltage.re) ||
          !Number.isFinite(voltage.im) ||
          magnitude(voltage) < magnitude(sourcePhaseV) * 1e-6,
      )
    ) {
      return {
        ...empty,
        status: unservedBusIds.length ? "islanded" : "not-converged",
        iterations: iterations + 1,
        sourceVoltageKV: input.sourceVoltageKV,
        unservedBusIds,
      };
    }

    maxVoltageChangePU = 0;
    for (const id of order) {
      const before = voltages.get(id)!;
      const after = nextVoltages.get(id)!;
      maxVoltageChangePU = Math.max(
        maxVoltageChangePU,
        magnitude(sub(after, before)) / magnitude(sourcePhaseV),
      );
    }
    voltages = nextVoltages;
    if (maxVoltageChangePU <= tolerance) {
      iterations++;
      break;
    }
  }

  const busReadings: RadialBusReading[] = order.map((id) => {
    const bus = busById.get(id)!;
    const voltage = magnitude(voltages.get(id)!);
    const voltagePU = voltage / magnitude(sourcePhaseV);
    const minimum = bus.minVoltagePU ?? 0.95;
    const maximum = bus.maxVoltagePU ?? 1.05;
    return {
      busId: id,
      voltageLLKV: (voltage * Math.sqrt(3)) / 1000,
      voltagePU,
      loadMW: bus.loadMW,
      loadMvar: bus.loadMvar,
      voltageConstraint:
        voltagePU < minimum ? "low" : voltagePU > maximum ? "high" : "ok",
    };
  });

  const branchReadings: RadialBranchReading[] = connectedBranches.map(
    (branch) => {
      const current = branchCurrents.get(branch.id) ?? { re: 0, im: 0 };
      const fromVoltage = voltages.get(branch.fromBusId)!;
      const toVoltage = voltages.get(branch.toBusId)!;
      const sending = mul(
        { re: 3, im: 0 },
        mul(fromVoltage, conjugate(current)),
      );
      const receiving = mul(
        { re: 3, im: 0 },
        mul(toVoltage, conjugate(current)),
      );
      const currentA = magnitude(current);
      return {
        branchId: branch.id,
        currentA,
        sendingMW: sending.re / 1e6,
        sendingMvar: sending.im / 1e6,
        receivingMW: receiving.re / 1e6,
        receivingMvar: receiving.im / 1e6,
        realLossMW: (3 * currentA ** 2 * branch.resistanceOhm) / 1e6,
        reactiveLossMvar: (3 * currentA ** 2 * branch.reactanceOhm) / 1e6,
        thermalConstraint:
          branch.thermalLimitA !== undefined && currentA > branch.thermalLimitA
            ? "overload"
            : "ok",
      };
    },
  );

  const sourceMW = branchReadings
    .filter(
      (branch) =>
        connectedBranches.find((item) => item.id === branch.branchId)
          ?.fromBusId === input.sourceBusId,
    )
    .reduce(
      (sum, branch) => sum + branch.sendingMW,
      busById.get(input.sourceBusId)!.loadMW,
    );
  const sourceMvar = branchReadings
    .filter(
      (branch) =>
        connectedBranches.find((item) => item.id === branch.branchId)
          ?.fromBusId === input.sourceBusId,
    )
    .reduce(
      (sum, branch) => sum + branch.sendingMvar,
      busById.get(input.sourceBusId)!.loadMvar,
    );
  const totalLoadMW = input.buses
    .filter((bus) => reached.has(bus.id))
    .reduce((sum, bus) => sum + bus.loadMW, 0);
  const totalLoadMvar = input.buses
    .filter((bus) => reached.has(bus.id))
    .reduce((sum, bus) => sum + bus.loadMvar, 0);

  return {
    status: unservedBusIds.length
      ? "islanded"
      : maxVoltageChangePU <= tolerance
        ? "converged"
        : "not-converged",
    iterations,
    maxVoltageChangePU,
    sourceVoltageKV: input.sourceVoltageKV,
    sourceMW,
    sourceMvar,
    totalLoadMW,
    totalLoadMvar,
    realLossMW: branchReadings.reduce(
      (sum, branch) => sum + branch.realLossMW,
      0,
    ),
    reactiveLossMvar: branchReadings.reduce(
      (sum, branch) => sum + branch.reactiveLossMvar,
      0,
    ),
    buses: busReadings,
    branches: branchReadings,
    unservedBusIds,
    validationErrors,
  };
}
