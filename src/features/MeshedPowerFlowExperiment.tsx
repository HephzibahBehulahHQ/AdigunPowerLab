import { useEffect, useMemo, useState } from "react";
import {
  solveMeshedPowerFlow,
  type MeshedInputs,
} from "../engine/powergridMeshed";
import type { Locale } from "../i18n";
import { downloadFile } from "../import-export/files";
import type {
  ContingencyRequest,
  ContingencyResponse,
} from "../workers/powergridContingency";

const defaults = {
  loadMW: 55,
  loadMvar: 25,
  generationMW: 25,
  generatorVoltage: 1.02,
  limitMvar: 35,
  tap: 1,
  shiftDeg: 0,
  ratingAB: 60,
  ratingAC: 65,
  ratingBC: 50,
  ab: true,
  ac: true,
  bc: true,
};
const storageKey = "adigunpowerlab.powergrid.meshed.v1";

const messages: Record<string, [string, string, string]> = {
  "Calculating branch outages…": [
    "Abzweigausfälle werden berechnet…",
    "Ìṣírò ìdádúró ẹ̀ka ń lọ…",
    "Di branch outage calculation dey run…",
  ],
  "Could not calculate branch outages. Turn comparison off and on to retry.": [
    "Abzweigausfälle konnten nicht berechnet werden. Schalten Sie den Vergleich aus und wieder ein.",
    "Ìṣírò ìdádúró ẹ̀ka kò ṣiṣẹ́. Pa ìfiwéra kí o sì tún tan án.",
    "Di branch outage calculation fail. Turn comparison off and on to try again.",
  ],
  "A–B rating (MVA)": [
    "A–B Nennscheinleistung (MVA)",
    "Ààlà A–B (MVA)",
    "A–B rating (MVA)",
  ],
  "A–C rating (MVA)": [
    "A–C Nennscheinleistung (MVA)",
    "Ààlà A–C (MVA)",
    "A–C rating (MVA)",
  ],
  "B–C rating (MVA)": [
    "B–C Nennscheinleistung (MVA)",
    "Ààlà B–C (MVA)",
    "B–C rating (MVA)",
  ],
  "Compare single branch outages": [
    "Einzelne Zweigausfälle vergleichen",
    "Fi ìdádúró ẹ̀ka kọ̀ọ̀kan wé",
    "Compare single branch outages",
  ],
  "Single branch outage comparison": [
    "Vergleich einzelner Zweigausfälle",
    "Àfiwé ìdádúró ẹ̀ka kọ̀ọ̀kan",
    "Single branch outage comparison",
  ],
  "Each case opens one currently active branch. The screening band is 0.95–1.05 pu. Loading uses the greater apparent power at either end. The initial ratings are illustrative.":
    [
      "Jeder Fall öffnet einen aktuell aktiven Zweig. Das Prüfband beträgt 0,95–1,05 pu. Die Auslastung nutzt die größere Scheinleistung beider Enden. Die voreingestellten Leistungen sind Beispiele.",
      "Àpẹẹrẹ kọ̀ọ̀kan ṣí ẹ̀ka kan tó ń ṣiṣẹ́. Ààlà àyẹ̀wò jẹ́ 0.95–1.05 pu. A lo S tó pọ̀ jù láàárín òpin méjèèjì. Ààlà ìbẹ̀rẹ̀ jẹ́ àpẹẹrẹ.",
      "Each case open one branch wey dey in service. Screening band na 0.95–1.05 pu. Loading use the bigger apparent power for either end. The starting ratings na examples.",
    ],
  "Base case": ["Ausgangsfall", "Àpẹẹrẹ ìbẹ̀rẹ̀", "Base case"],
  "Opened branch": ["Geöffneter Zweig", "Ẹ̀ka tí a ṣí", "Opened branch"],
  Status: ["Status", "Ipò", "Status"],
  "Minimum voltage (pu)": [
    "Minimale Spannung (pu)",
    "Foliteji tó kéré jù (pu)",
    "Minimum voltage (pu)",
  ],
  "Maximum voltage (pu)": [
    "Maximale Spannung (pu)",
    "Foliteji tó pọ̀ jù (pu)",
    "Maximum voltage (pu)",
  ],
  "Voltage violations": [
    "Spannungsgrenzverletzungen",
    "Foliteji tó kọjá ààlà",
    "Voltage violations",
  ],
  "Overloaded branches": [
    "Überlastete Zweige",
    "Ẹ̀ka tó kọjá ààlà",
    "Overloaded branches",
  ],
  "Within limits": [
    "Innerhalb der Grenzen",
    "Wà láàárín ààlà",
    "Within limits",
  ],
  "Limit violations": [
    "Grenzverletzungen",
    "Àwọn ààlà tí a kọjá",
    "Limit violations",
  ],
  Islanded: ["Inselbildung", "Ó di erékùṣù", "Islanded"],
  "No convergence": ["Keine Konvergenz", "Ìṣirò kò péye", "No convergence"],
  Invalid: ["Ungültig", "Kò péye", "Invalid"],
  "Meshed AC power flow": [
    "AC-Lastfluss im vermaschten Netz",
    "Ìṣàn agbára AC nínú nẹ́tíwọ́ọ̀kì onílupu",
    "Meshed AC power flow",
  ],
  "Three-bus, 100 MVA teaching case. A is the slack bus, B is the generator, and C is the load. Open a branch and compare the remaining flows.":
    [
      "Lehrbeispiel mit drei Knoten und 100 MVA. A ist der Referenzknoten, B der Generator und C die Last. Öffnen Sie einen Zweig und vergleichen Sie die verbleibenden Flüsse.",
      "Àpẹẹrẹ ẹ̀kọ́ bus mẹ́ta, 100 MVA. A jẹ́ slack, B jẹ́ generator, C sì jẹ́ ẹrù. Ṣí ẹ̀ka kan kí o fi àwọn ìṣàn tó kù wé.",
      "Three-bus, 100 MVA teaching case. A na slack, B na generator and C na load. Open branch and compare flow wey remain.",
    ],
  "Load (MW)": ["Last (MW)", "Ẹrù (MW)", "Load (MW)"],
  "Bus power is net injection. Branch power is positive into the branch at either end. The solver fixes PV reactive injection at the violated limit and resolves as PQ.":
    [
      "Knotenleistungen sind Netzeinspeisungen. Zweigleistung ist an beiden Enden positiv in Zweigrichtung. Beim Überschreiten einer Grenze wird die PV-Blindleistung fixiert und der Knoten als PQ gelöst.",
      "Agbára bus ni agbára apapọ̀ tí ń wọlé. Agbára ẹ̀ka jẹ́ rere nígbà tó wọ ẹ̀ka láti òpin kankan. Ní ààlà reactive, ìṣirò yí PV padà sí PQ ní iye ààlà.",
      "Bus power na net injection. Branch power positive when e enter the branch from either end. Solver fix PV reactive power at the limit and solve am as PQ.",
    ],
  "Load (Mvar)": ["Last (Mvar)", "Ẹrù (Mvar)", "Load (Mvar)"],
  "Generator output (MW)": [
    "Generatorleistung (MW)",
    "Agbára generator (MW)",
    "Generator output (MW)",
  ],
  "Generator setpoint (pu)": [
    "Generatorsollspannung (pu)",
    "Foliteji generator (pu)",
    "Generator setpoint (pu)",
  ],
  "Generator reactive limit ±Mvar": [
    "Blindleistungsgrenze ±Mvar",
    "Ààlà agbára reactive ±Mvar",
    "Generator reactive limit ±Mvar",
  ],
  "A–B tap ratio": ["A–B Stufenverhältnis", "Ìpín tap A–B", "A–B tap ratio"],
  "A–B phase shift (°)": [
    "A–B Phasenverschiebung (°)",
    "Ìyípo phase A–B (°)",
    "A–B phase shift (°)",
  ],
  "Branch in service": [
    "Zweig in Betrieb",
    "Ẹ̀ka tó wà ní iṣẹ́",
    "Branch in service",
  ],
  "Bus results": ["Knotenergebnisse", "Àbájáde bus", "Bus results"],
  Bus: ["Knoten", "Bus", "Bus"],
  "Voltage (pu)": ["Spannung (pu)", "Foliteji (pu)", "Voltage (pu)"],
  "Angle (°)": ["Winkel (°)", "Igun (°)", "Angle (°)"],
  "Reactive limit (Mvar)": [
    "Blindleistungsgrenze (Mvar)",
    "Ààlà reactive (Mvar)",
    "Reactive limit (Mvar)",
  ],
  "Branch results": ["Zweigergebnisse", "Àbájáde ẹ̀ka", "Branch results"],
  Branch: ["Zweig", "Ẹ̀ka", "Branch"],
  "Loss (MW)": ["Verlust (MW)", "Àdánù (MW)", "Loss (MW)"],
  "From end (MW)": ["Anfangsende (MW)", "Ìbẹ̀rẹ̀ (MW)", "From end (MW)"],
  "To end (MW)": ["Zielende (MW)", "Òpin (MW)", "To end (MW)"],
  "Converged. Maximum mismatch (pu)": [
    "Konvergiert. Maximale Abweichung (pu)",
    "Ó péye. Àìbáramu tó pọ̀ jù (pu)",
    "Converged. Maximum mismatch (pu)",
  ],
  Iterations: ["Iterationen", "Ìṣirò àtúnṣe", "Iterations"],
  "An island has no slack bus. Close a branch to reconnect it.": [
    "Eine Insel hat keinen Referenzknoten. Schließen Sie einen Zweig, um sie wieder zu verbinden.",
    "Erékùṣù kan kò ní slack bus. Pa ẹ̀ka kan dé láti tún so pọ̀.",
    "One island get no slack bus. Close a branch to reconnect am.",
  ],
  "The solver did not converge.": [
    "Der Solver konvergierte nicht.",
    "Ìṣirò kò dé àbájáde.",
    "The solver no converge.",
  ],
  "Enter valid case inputs.": [
    "Geben Sie gültige Falldaten ein.",
    "Tẹ ìtẹ̀wọlé tó péye.",
    "Enter valid case inputs.",
  ],
  "Save case locally": [
    "Fall lokal speichern",
    "Fi àpẹẹrẹ pamọ́ sí ẹ̀rọ",
    "Save case locally",
  ],
  "Case saved": ["Fall gespeichert", "A ti fi àpẹẹrẹ pamọ́", "Case saved"],
  "Save failed": ["Speichern fehlgeschlagen", "Ìfipamọ́ kùnà", "Save fail"],
  "Export AC results": [
    "AC-Ergebnisse exportieren",
    "Gbé àbájáde AC jáde",
    "Export AC results",
  ],
};

const numericFields = [
  ["loadMW", "Load (MW)"],
  ["loadMvar", "Load (Mvar)"],
  ["generationMW", "Generator output (MW)"],
  ["generatorVoltage", "Generator setpoint (pu)"],
  ["limitMvar", "Generator reactive limit ±Mvar"],
  ["tap", "A–B tap ratio"],
  ["shiftDeg", "A–B phase shift (°)"],
  ["ratingAB", "A–B rating (MVA)"],
  ["ratingAC", "A–C rating (MVA)"],
  ["ratingBC", "B–C rating (MVA)"],
] as const;
const switches = [
  ["ab", "A–B"],
  ["ac", "A–C"],
  ["bc", "B–C"],
] as const;

function readCase(): typeof defaults {
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    const saved = { ...defaults, ...raw };
    if (
      saved &&
      numericFields.every(([key]) => Number.isFinite(saved[key])) &&
      switches.every(([key]) => typeof saved[key] === "boolean")
    )
      return saved;
  } catch {
    // Fall back to the original teaching case if its saved copy is unusable.
  }
  return defaults;
}

export function MeshedPowerFlowExperiment({ locale }: { locale: Locale }) {
  const [state, setState] = useState(readCase);
  const [saved, setSaved] = useState<boolean | null>(null);
  const [compare, setCompare] = useState(false);
  const [outcome, setOutcome] = useState<{
    input: MeshedInputs;
    response: ContingencyResponse;
  }>();
  const label = (value: string) =>
    locale === "en"
      ? value
      : (messages[value]?.[locale === "de" ? 0 : locale === "yo" ? 1 : 2] ??
        value);
  const input = useMemo<MeshedInputs>(
    () => ({
      baseMVA: 100,
      buses: [
        { id: "A", kind: "slack", voltagePU: 1 },
        {
          id: "B",
          kind: "pv",
          netMW: state.generationMW,
          voltagePU: state.generatorVoltage,
          minNetMvar: -state.limitMvar,
          maxNetMvar: state.limitMvar,
        },
        { id: "C", kind: "pq", netMW: -state.loadMW, netMvar: -state.loadMvar },
      ],
      branches: [
        {
          id: "A–B",
          from: "A",
          to: "B",
          resistancePU: 0.02,
          reactancePU: 0.15,
          tap: state.tap,
          shiftDeg: state.shiftDeg,
          ratingMVA: state.ratingAB,
          inService: state.ab,
        },
        {
          id: "A–C",
          from: "A",
          to: "C",
          resistancePU: 0.025,
          reactancePU: 0.2,
          ratingMVA: state.ratingAC,
          inService: state.ac,
        },
        {
          id: "B–C",
          from: "B",
          to: "C",
          resistancePU: 0.01,
          reactancePU: 0.1,
          ratingMVA: state.ratingBC,
          inService: state.bc,
        },
      ],
    }),
    [state],
  );
  const result = useMemo(() => solveMeshedPowerFlow(input), [input]);
  const needsComparison = compare && result.converged;
  const response =
    needsComparison && outcome?.input === input ? outcome.response : undefined;
  const comparison =
    response && "comparison" in response ? response.comparison : undefined;
  useEffect(() => {
    if (!needsComparison) return;
    let worker: Worker | undefined;
    let active = true;
    const finish = (response: ContingencyResponse) => {
      if (!active) return;
      setOutcome({ input, response });
      worker?.terminate();
    };
    try {
      worker = new Worker(
        new URL("../workers/powergridContingency.ts", import.meta.url),
        { type: "module" },
      );
      worker.onmessage = ({ data }: MessageEvent<ContingencyResponse>) =>
        finish(data);
      worker.onerror = () => finish({ error: true });
      worker.onmessageerror = () => finish({ error: true });
      const request: ContingencyRequest = { input, baseline: result };
      worker.postMessage(request);
    } catch {
      finish({ error: true });
    }
    return () => {
      active = false;
      worker?.terminate();
    };
  }, [input, needsComparison, result]);
  const statuses = {
    clear: "Within limits",
    violations: "Limit violations",
    islanded: "Islanded",
    "not-converged": "No convergence",
    invalid: "Invalid",
  } as const;
  const format = new Intl.NumberFormat(locale === "pcm" ? "en-NG" : locale, {
    maximumFractionDigits: 5,
  });
  return (
    <section
      className="panel panel-pad pg-panel"
      aria-labelledby="pg-meshed-title"
    >
      <h3 id="pg-meshed-title">{label("Meshed AC power flow")}</h3>
      <p>
        {label(
          "Three-bus, 100 MVA teaching case. A is the slack bus, B is the generator, and C is the load. Open a branch and compare the remaining flows.",
        )}
      </p>
      <p>
        {label(
          "Bus power is net injection. Branch power is positive into the branch at either end. The solver fixes PV reactive injection at the violated limit and resolves as PQ.",
        )}
      </p>
      <div className="pg-wind-controls">
        {numericFields.map(([key, name]) => (
          <label key={key} className="pg-field">
            <span>{label(name)}</span>
            <input
              type="number"
              step="any"
              value={Number.isFinite(state[key]) ? state[key] : ""}
              onChange={(event) => {
                setState({
                  ...state,
                  [key]: event.currentTarget.valueAsNumber,
                });
                setSaved(null);
              }}
            />
          </label>
        ))}
      </div>
      <fieldset>
        <legend>{label("Branch in service")}</legend>
        {switches.map(([key, name]) => (
          <label key={key} className="pg-field">
            <span>{name}</span>
            <input
              type="checkbox"
              checked={state[key]}
              onChange={(event) => {
                setState({ ...state, [key]: event.currentTarget.checked });
                setSaved(null);
              }}
            />
          </label>
        ))}
      </fieldset>
      <p role="status">
        {label(
          result.converged
            ? "Converged. Maximum mismatch (pu)"
            : result.reason === "islanded"
              ? "An island has no slack bus. Close a branch to reconnect it."
              : result.reason === "invalid"
                ? "Enter valid case inputs."
                : "The solver did not converge.",
        )}
        {result.residualPU !== null && (
          <>
            {" "}
            {result.residualPU.toExponential(2)} · {label("Iterations")}{" "}
            {result.iterations}
          </>
        )}
      </p>
      {result.converged && (
        <>
          <div className="pg-table-wrap">
            <table className="pg-wind-table">
              <caption>{label("Bus results")}</caption>
              <thead>
                <tr>
                  {[
                    "Bus",
                    "Voltage (pu)",
                    "Angle (°)",
                    "MW",
                    "Mvar",
                    "Reactive limit (Mvar)",
                  ].map((name) => (
                    <th key={name} scope="col">
                      {label(name)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.buses.map((bus) => (
                  <tr key={bus.id}>
                    <th scope="row">{bus.id}</th>
                    <td>{format.format(bus.voltagePU)}</td>
                    <td>{format.format(bus.angleDeg)}</td>
                    <td>{format.format(bus.netMW)}</td>
                    <td>{format.format(bus.netMvar)}</td>
                    <td>
                      {bus.limitedMvar === undefined
                        ? "—"
                        : format.format(bus.limitedMvar)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pg-table-wrap">
            <table className="pg-wind-table">
              <caption>{label("Branch results")}</caption>
              <thead>
                <tr>
                  {["Branch", "From end (MW)", "To end (MW)", "Loss (MW)"].map(
                    (name) => (
                      <th key={name} scope="col">
                        {label(name)}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {result.branches.map((branch) => (
                  <tr key={branch.id}>
                    <th scope="row">{branch.id}</th>
                    <td>{format.format(branch.fromMW)}</td>
                    <td>{format.format(branch.toMW)}</td>
                    <td>{format.format(branch.lossMW)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <div className="pg-actions">
        <button
          type="button"
          className="button"
          aria-pressed={compare}
          disabled={!result.converged}
          onClick={() => {
            setOutcome(undefined);
            setCompare(!compare);
          }}
        >
          {label("Compare single branch outages")}
        </button>
        <button
          type="button"
          className="button"
          disabled={!result.converged}
          onClick={() => {
            try {
              localStorage.setItem(storageKey, JSON.stringify(state));
              setSaved(true);
            } catch {
              setSaved(false);
            }
          }}
        >
          {label("Save case locally")}
        </button>
        <button
          type="button"
          className="button"
          disabled={!result.converged || (compare && !comparison)}
          onClick={() =>
            downloadFile(
              "powergrid-meshed-ac.json",
              JSON.stringify(
                { model: "balanced-ac-power-flow", input, result, comparison },
                null,
                2,
              ),
              "application/json",
            )
          }
        >
          {label("Export AC results")}
        </button>
        {saved !== null && (
          <span role="status">
            {label(saved ? "Case saved" : "Save failed")}
          </span>
        )}
      </div>
      {needsComparison && !comparison && (
        <p role="status">
          {label(
            response
              ? "Could not calculate branch outages. Turn comparison off and on to retry."
              : "Calculating branch outages…",
          )}
        </p>
      )}
      {comparison && (
        <>
          <p>
            {label(
              "Each case opens one currently active branch. The screening band is 0.95–1.05 pu. Loading uses the greater apparent power at either end. The initial ratings are illustrative.",
            )}
          </p>
          <div className="pg-table-wrap">
            <table className="pg-wind-table">
              <caption>{label("Single branch outage comparison")}</caption>
              <thead>
                <tr>
                  {[
                    "Opened branch",
                    "Status",
                    "Minimum voltage (pu)",
                    "Maximum voltage (pu)",
                    "Voltage violations",
                    "Overloaded branches",
                  ].map((name) => (
                    <th key={name} scope="col">
                      {label(name)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { openedBranch: label("Base case"), ...comparison.baseline },
                  ...comparison.outages,
                ].map((row) => (
                  <tr key={row.openedBranch}>
                    <th scope="row">{row.openedBranch}</th>
                    <td>{label(statuses[row.status])}</td>
                    <td>
                      {row.minVoltagePU !== undefined
                        ? format.format(row.minVoltagePU)
                        : "—"}
                    </td>
                    <td>
                      {row.maxVoltagePU !== undefined
                        ? format.format(row.maxVoltagePU)
                        : "—"}
                    </td>
                    <td>{row.voltageViolations?.join(", ") || "—"}</td>
                    <td>{row.overloaded?.join(", ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
