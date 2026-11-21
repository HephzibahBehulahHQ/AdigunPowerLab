import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { solveMeshedPowerFlow } from "../src/engine/powergridMeshed.ts";

// Verify the two upstream MATPOWER 8.1 fixtures without bundling them.
const [inputPath, solutionPath] = process.argv.slice(2);
assert(
  inputPath && solutionPath,
  "Pass t_case9_pf.m and soln9_pf.mat from MATPOWER 8.1.",
);
const caseFile = readFileSync(inputPath);
const source = caseFile.toString("utf8");
const solution = readFileSync(solutionPath);
const sha256 = (data) => createHash("sha256").update(data).digest("hex");
assert.equal(
  sha256(caseFile),
  "5ac7438cfc9ef249e85639efbd824121210aab7956730e2b37b7a37b416f7d94",
  "Use the original MATPOWER 8.1 source fixture",
);
assert.equal(
  sha256(solution),
  "ffa8e28cb1fc0e2b60ea52f21de40c8b15353ff37b7aaa97f93501ca514d126d",
  "Use the original MATPOWER 8.1 solution fixture",
);

function readCaseTable(name) {
  const table = source.match(
    new RegExp(`^\\s*${name}\\s*=\\s*\\[([^\\]]+)\\]`, "m"),
  );
  assert(table, `Missing ${name} table`);
  return table[1]
    .trim()
    .split(";")
    .filter((row) => row.trim())
    .map((row) => {
      const values = row.trim().split(/\s+/).map(Number);
      assert(values.every(Number.isFinite), `Invalid ${name} value`);
      return values;
    });
}

function readElement(buffer, offset) {
  const first = buffer.readUInt32LE(offset);
  const compactLength = first >>> 16;
  if (compactLength) {
    return {
      type: first & 0xffff,
      data: buffer.subarray(offset + 4, offset + 4 + compactLength),
      end: offset + 8,
    };
  }
  const length = buffer.readUInt32LE(offset + 4);
  return {
    type: first,
    data: buffer.subarray(offset + 8, offset + 8 + length),
    end: offset + 8 + (first === 15 ? length : Math.ceil(length / 8) * 8),
  };
}

function readSolutionMatrices() {
  assert.equal(
    solution.subarray(126, 128).toString(),
    "IM",
    "Expected a little-endian MAT v5 fixture",
  );
  const tables = new Map();
  for (let offset = 128; offset < solution.length;) {
    const compressed = readElement(solution, offset);
    offset = compressed.end;
    assert.equal(compressed.type, 15, "Expected compressed MATLAB elements");
    const matrix = readElement(inflateSync(compressed.data), 0);
    assert.equal(matrix.type, 14);
    const flags = readElement(matrix.data, 0);
    const dimensions = readElement(matrix.data, flags.end);
    const name = readElement(matrix.data, dimensions.end);
    const values = readElement(matrix.data, name.end);
    assert.equal(values.type, 9, "Expected double-precision solutions");
    const rows = dimensions.data.readInt32LE(0);
    const columns = dimensions.data.readInt32LE(4);
    tables.set(
      name.data.toString(),
      Array.from({ length: rows }, (_, row) =>
        Array.from({ length: columns }, (_, col) =>
          values.data.readDoubleLE(8 * (col * rows + row)),
        ),
      ),
    );
  }
  return tables;
}

const base = source.match(/^\s*baseMVA\s*=\s*(\d+);/m);
assert(base);
const generators = new Map(readCaseTable("gen").map((row) => [row[0], row]));
const buses = readCaseTable("bus").map(
  ([number, type, loadMW, loadMvar, shuntG, shuntB, , voltagePU, angle]) => {
    assert(
      shuntG === 0 && shuntB === 0 && angle === 0,
      "Unsupported change to benchmark bus inputs",
    );
    const id = String(number);
    if (type === 3) return { id, kind: "slack", voltagePU };
    if (type === 2) {
      const [, netMW, , maxMvar, minMvar] = generators.get(number);
      return {
        id,
        kind: "pv",
        netMW: netMW - loadMW,
        voltagePU,
        maxNetMvar: maxMvar - loadMvar,
        minNetMvar: minMvar - loadMvar,
      };
    }
    assert.equal(type, 1);
    return { id, kind: "pq", netMW: -loadMW, netMvar: -loadMvar };
  },
);
const branches = readCaseTable("branch").map(
  ([
    from,
    to,
    resistancePU,
    reactancePU,
    chargingPU,
    ratingMVA,
    ,
    ,
    tap,
    shiftDeg,
    status,
  ]) => ({
    id: `${from}-${to}`,
    from: String(from),
    to: String(to),
    resistancePU,
    reactancePU,
    chargingPU,
    ratingMVA,
    tap: tap || 1,
    shiftDeg,
    inService: status === 1,
  }),
);
assert.equal(buses.length, 9);
assert.equal(branches.length, 9);
const result = solveMeshedPowerFlow({
  baseMVA: Number(base[1]),
  buses,
  branches,
  tolerancePU: 1e-10,
});
assert(result.converged, `Solver did not converge: ${result.reason}`);
const tables = readSolutionMatrices();
const busReference = tables.get("bus_soln");
const branchReference = tables.get("branch_soln");
assert.equal(busReference?.length, 9);
assert.equal(branchReference?.length, 9);
const metrics = { voltagePU: 0, angleDeg: 0, branchMW: 0, branchMvar: 0 };
function measure(metric, actual, expected) {
  metrics[metric] = Math.max(metrics[metric], Math.abs(actual - expected));
}
for (const [id, , , , , , , voltagePU, angleDeg] of busReference) {
  const actual = result.buses.find((bus) => bus.id === String(id));
  assert(actual);
  measure("voltagePU", actual.voltagePU, voltagePU);
  measure("angleDeg", actual.angleDeg, angleDeg);
}
for (const row of branchReference) {
  const actual = result.branches.find(
    (branch) => branch.id === `${row[0]}-${row[1]}`,
  );
  assert(actual);
  measure("branchMW", actual.fromMW, row[13]);
  measure("branchMvar", actual.fromMvar, row[14]);
  measure("branchMW", actual.toMW, row[15]);
  measure("branchMvar", actual.toMvar, row[16]);
}
for (const [metric, limit] of Object.entries({
  voltagePU: 1e-7,
  angleDeg: 1e-5,
  branchMW: 1e-4,
  branchMvar: 1e-4,
})) {
  assert(
    metrics[metric] <= limit,
    `${metric} error ${metrics[metric]} exceeds ${limit}`,
  );
}
console.log(
  JSON.stringify(
    {
      iterations: result.iterations,
      residualPU: result.residualPU,
      maxAbsoluteError: metrics,
    },
    null,
    2,
  ),
);
