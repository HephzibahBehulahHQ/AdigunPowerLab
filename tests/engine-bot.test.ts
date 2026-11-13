import { describe, expect, it } from "vitest";
import {
  createCircuit,
  createLoad,
  createProject,
} from "../src/domain/project";
import {
  applyProposal,
  parseLoadEditProposal,
  parseLoadPhaseProposal,
  parseLoadProposal,
  proposePhaseBalance,
  runLocalCommand,
} from "../src/bot/adapter";
import { calculateProject } from "../src/engine/electrical";
import { conservativeDemandProfile, scheduleEV } from "../src/engine/planning";
import {
  BOT_WINDOW_STATE_KEY,
  clampBotGeometry,
  readBotWindowState,
  writeBotWindowState,
} from "../src/bot/windowState";

describe("typed local assistant boundary", () => {
  it("a typed load proposal is preview-only until accepted", () => {
    const project = createProject();
    const proposal = parseLoadProposal(
      project,
      "load: Heater; 2.3 kW; 230 V; PF 1; 8 h",
    )!;
    expect(project.loads).toHaveLength(0);
    expect(proposal.afterKW).toBeCloseTo(2.3, 10);
    applyProposal(project, proposal);
    expect(project.loads).toHaveLength(1);
    expect(calculateProject(project).phaseCurrents.L1).toBeCloseTo(10, 10);
  });
  it("stale previews and duplicate application are rejected without mutation", () => {
    const project = createProject();
    const proposal = parseLoadProposal(
      project,
      "load: Heater; 2.3 kW; 230 V; PF 1; 8 h",
    )!;
    project.revision++;
    expect(() => applyProposal(project, proposal)).toThrow(/changed/);
    expect(project.loads).toHaveLength(0);
    project.revision--;
    applyProposal(project, proposal);
    expect(() => applyProposal(project, proposal)).toThrow(/already/);
    expect(project.loads).toHaveLength(1);
  });
  it("a unique load edit is previewed, validated, and applied only after confirmation", () => {
    const project = createProject();
    const load = createLoad({ name: "Heater", rating: 2.3 });
    project.loads = [load];
    const before = structuredClone(project);
    const proposal = parseLoadEditProposal(
      project,
      "edit load: Heater; rating_kw; 3.1",
    )!;
    expect(project).toEqual(before);
    expect(proposal.beforeKW).toBeCloseTo(2.3, 10);
    expect(proposal.afterKW).toBeCloseTo(3.1, 10);
    applyProposal(project, proposal);
    expect(project.loads[0].rating).toBe(3.1);
    expect(() => applyProposal(project, proposal)).toThrow(/changed/);
  });
  it("rejects ambiguous names, unsupported units, and invalid edits", () => {
    const project = createProject();
    project.loads = [
      createLoad({ name: "Heater" }),
      createLoad({ name: "Heater" }),
    ];
    expect(() =>
      parseLoadEditProposal(project, "edit load: Heater; quantity; 2"),
    ).toThrow(/ambiguous/);
    project.loads = [createLoad({ name: "Heater", entryMode: "amps" })];
    expect(() =>
      parseLoadEditProposal(project, "edit load: Heater; rating_kw; 2"),
    ).toThrow(/kW mode/);
    expect(() =>
      parseLoadEditProposal(project, "edit load: Heater; power_factor; 2"),
    ).toThrow();
  });
  it("phase proposals preview all affected circuit loads and apply only after confirmation", () => {
    const project = createProject();
    const circuit = createCircuit(project.boards[0].id, {
      name: "Pump circuit",
    });
    project.circuits = [circuit];
    project.loads = [
      createLoad({
        name: "Pump",
        boardId: project.boards[0].id,
        circuitId: circuit.id,
        phase: "L1",
      }),
      createLoad({
        name: "Fan",
        boardId: project.boards[0].id,
        circuitId: circuit.id,
        phase: "L1",
      }),
    ];
    const before = structuredClone(project);
    const proposal = parseLoadPhaseProposal(project, "phase load: Pump; L2")!;
    expect(project).toEqual(before);
    expect(proposal.preview.changes.map((change) => change.name)).toContain(
      "Fan",
    );
    applyProposal(project, proposal);
    expect(project.loads.map((load) => load.phase)).toEqual(["L2", "L2"]);
    expect(project.circuits[0].phase).toBe("L2");
    expect(() => applyProposal(project, proposal)).toThrow();
  });
  it("rejects locked, ambiguous and already-satisfied phase changes", () => {
    const project = createProject();
    project.loads = [createLoad({ name: "Pump", locked: true, phase: "L1" })];
    expect(() =>
      parseLoadPhaseProposal(project, "phase load: Pump; L2"),
    ).toThrow(/locked/);
    project.loads.push(createLoad({ name: "Pump" }));
    expect(() =>
      parseLoadPhaseProposal(project, "phase load: Pump; L2"),
    ).toThrow(/ambiguous/);
    project.loads = [createLoad({ name: "Pump", phase: "L2" })];
    expect(() =>
      parseLoadPhaseProposal(project, "phase load: Pump; L2"),
    ).toThrow(/already assigned/);
  });
  it("unknown natural language gets honest local help, not fabricated answers", () => {
    const response = runLocalCommand(createProject(), "What is the weather?");
    expect(response.kind).toBe("help");
    expect(response.proposal).toBeUndefined();
  });
  it("phase preview respects the typed snapshot and mutates only after acceptance", () => {
    const project = createProject();
    project.loads = [
      createLoad({ rating: 2.3, locked: true }),
      createLoad({ rating: 2.3 }),
      createLoad({ rating: 2.3 }),
    ];
    const before = structuredClone(project);
    const proposal = proposePhaseBalance(project);
    expect(project).toEqual(before);
    applyProposal(project, proposal);
    expect(project.loads[0].phase).toBe("L1");
    expect(calculateProject(project).imbalancePercent).toBeCloseTo(0, 8);
  });
});

describe("BOT harmless window-state recovery", () => {
  it("preserves minimized/maximized state and normal restore geometry without a transcript", () => {
    const records = new Map<string, string>();
    const storage = {
      getItem: (key: string) => records.get(key) ?? null,
      setItem: (key: string, value: string) => {
        records.set(key, value);
      },
    };
    const state = {
      geometry: { x: 20, y: 40, width: 420, height: 600 },
      minimized: true,
      maximized: true,
    };
    writeBotWindowState(state, storage);
    expect(readBotWindowState(storage, { width: 1600, height: 1000 })).toEqual(
      state,
    );
    expect(
      Object.keys(JSON.parse(records.get(BOT_WINDOW_STATE_KEY)!)).sort(),
    ).toEqual(["geometry", "maximized", "minimized"]);
  });
  it("clamps recovered windows when the viewport shrinks", () => {
    const geometry = clampBotGeometry(
      { x: 1500, y: 1200, width: 900, height: 800 },
      { width: 375, height: 667 },
    );
    expect(geometry.x).toBeGreaterThanOrEqual(8);
    expect(geometry.y).toBeGreaterThanOrEqual(8);
    expect(geometry.x + geometry.width).toBeLessThanOrEqual(367);
    expect(geometry.y + geometry.height).toBeLessThanOrEqual(659);
  });
  it("malformed/blocked storage falls back to a usable window", () => {
    const result = readBotWindowState(
      {
        getItem: () => {
          throw new Error("Storage unavailable");
        },
      },
      { width: 1000, height: 800 },
    );
    expect(result.minimized).toBe(false);
    expect(result.maximized).toBe(false);
    expect(result.geometry.width).toBe(420);
    expect(result.geometry.height).toBe(600);
    expect(() =>
      writeBotWindowState(result, {
        setItem: () => {
          throw new Error("Storage unavailable");
        },
      }),
    ).not.toThrow();
  });
});

describe("EV current envelope and application semantics", () => {
  it("low power factor and low energy duty do not hide phase current", () => {
    const project = createProject();
    project.supply.limitA = 10;
    project.loads = [
      createLoad({
        rating: 1.15,
        pf: 0.5,
        duty: 0.1,
        hoursPerDay: 24,
        startHour: 0,
      }),
    ];
    const envelope = conservativeDemandProfile(project);
    expect(envelope.phaseHeadroomKW.L1[0]).toBeCloseTo(0, 10);
    expect(envelope.kw[0]).toBeCloseTo(1.15, 10);
    expect(calculateProject(project).profile[0].kw).toBeCloseTo(0.115, 10);
  });
  it("fractional-hour EV plan applies with its true on-state power and exact energy", () => {
    const plan = scheduleEV({
      id: "partial",
      name: "Partial hour",
      arrivalHour: 18.5,
      departureHour: 19,
      requiredKWh: 3.6,
      chargerKW: 8,
      vehicleKW: 8,
      efficiency: 0.9,
      siteLimitKW: 10,
    });
    const point = plan.points[18];
    expect(point.acKW).toBe(8);
    expect(point.startHour).toBe(18.5);
    expect(point.durationHours).toBe(0.5);
    expect(point.acKWh).toBe(4);
    const project = createProject();
    project.loads = [
      createLoad({
        rating: point.acKW,
        startHour: point.startHour,
        hoursPerDay: point.durationHours,
      }),
    ];
    const result = calculateProject(project);
    expect(result.dailyKWh).toBe(4);
    expect(result.phaseCurrents.L1).toBeCloseTo(8000 / 230, 10);
  });
});
