import {
  calculatePowerGrid,
  DEFAULT_POWERGRID_INPUTS,
  validatePowerGridInputs,
} from "../engine/powergrid";
import type { PowerGridInputs } from "../engine/powergrid";
import {
  applyRegionalTeachingPreset,
  GERMANY_TEACHING_PRESET,
  NIGERIA_TEACHING_PRESET,
} from "../engine/powergridRegions";
import type { Locale } from "../i18n";
import { downloadFile } from "../import-export/files";

function solveCases(shared: PowerGridInputs) {
  return [NIGERIA_TEACHING_PRESET, GERMANY_TEACHING_PRESET].map((preset) => {
    const inputs = applyRegionalTeachingPreset(shared, preset);
    const result = validatePowerGridInputs(inputs).length
      ? undefined
      : calculatePowerGrid(inputs);
    return { preset, inputs, result };
  });
}

const reference = solveCases(DEFAULT_POWERGRID_INPUTS);
const phaseLabels = {
  en: ["Phase resistance", "Raised-stage loss"],
  de: ["Phasenwiderstand", "Verlust bei höherer Spannung"],
  yo: ["Ìdènà ìpele", "Àdánù ní fólítéèjì gíga"],
  pcm: ["Wire resistance each phase", "Loss for higher voltage"],
} satisfies Record<Locale, readonly string[]>;
const copy = {
  en: [
    "Practical lesson: Regional comparison",
    "At equal real power and line resistance, which transmission stage do you expect to have the lowest loss?",
    "Only voltage stages vary between cases. The shared worksheet supplies real power, power factor and phase resistance. Frequency and downstream voltages describe the teaching contexts and do not enter the line-loss equation.",
    "Worked reference at 100 MW, unity power factor and 5 Ω per phase",
    "Region and nominal stages",
    "Base current and loss",
    "Raised current and loss",
    "Live regional comparison",
    "Double the phase resistance in the transmission worksheet. How do both results change? Why does the difference between these calculations tell you little about national grid efficiency?",
    "Correct the shared transmission inputs to download both cases.",
    "Reset shared regional lesson inputs",
    "Download regional comparison (JSON)",
  ],
  de: [
    "Praxisversuch: Regionalvergleich",
    "Welche Übertragungsspannung hat bei gleicher Wirkleistung und gleichem Leitungswiderstand voraussichtlich die geringsten Verluste?",
    "Nur die Spannungsstufen unterscheiden sich. Wirkleistung, Leistungsfaktor und Phasenwiderstand stammen aus dem gemeinsamen Arbeitsblatt. Frequenz und nachgelagerte Spannungen beschreiben den Kontext und gehen nicht in die Verlustgleichung ein.",
    "Referenz bei 100 MW, Leistungsfaktor 1 und 5 Ω je Phase",
    "Region und Nennspannungen",
    "Strom und Verluste bei Grundspannung",
    "Strom und Verluste bei höherer Spannung",
    "Aktueller Regionalvergleich",
    "Verdoppeln Sie den Phasenwiderstand im Übertragungsblatt. Wie ändern sich beide Ergebnisse? Warum sagt dieser Unterschied wenig über die Effizienz nationaler Netze aus?",
    "Korrigieren Sie die gemeinsamen Eingaben, um beide Fälle herunterzuladen.",
    "Gemeinsame Versuchswerte zurücksetzen",
    "Regionalvergleich herunterladen (JSON)",
  ],
  yo: [
    "Ìdánwò: Àfiwé agbègbè",
    "Ní agbára gidi àti ìdènà okùn kan náà, fólítéèjì gbigbe wo ni yóò ní àdánù tó kéré jù?",
    "Ìpele fólítéèjì nìkan yàtọ̀. Worksheet pèsè agbára gidi, power factor àti ìdènà ìpele. Frequency àti fólítéèjì ní ìsàlẹ̀ ṣàlàyé àpẹẹrẹ, wọn kò wọ ìṣírò àdánù okùn.",
    "Àpẹẹrẹ 100 MW, power factor 1 àti 5 Ω fún ìpele kọ̀ọ̀kan",
    "Agbègbè àti fólítéèjì",
    "Ìṣàn àti àdánù ní fólítéèjì ìpìlẹ̀",
    "Ìṣàn àti àdánù ní fólítéèjì gíga",
    "Àfiwé agbègbè lọwọlọwọ",
    "Sọ ìdènà ìpele di ìlọ́po méjì. Báwo ni èsì méjèèjì ṣe yí padà? Kí ló dé tí ìyàtọ̀ yìí kò fi sọ púpọ̀ nípa ìmúṣẹ grid orílẹ̀-èdè?",
    "Ṣàtúnṣe àwọn iye gbigbe kí o tó gba àpẹẹrẹ méjèèjì.",
    "Dá àwọn iye ìdánwò padà",
    "Gba àfiwé agbègbè (JSON)",
  ],
  pcm: [
    "Practical lesson: Regional comparison",
    "If real power and wire resistance stay di same, which transmission stage you expect to get di smallest loss?",
    "Na only voltage stages change between cases. Di worksheet provide real power, power factor and wire resistance per phase. Frequency and downstream voltages describe di examples and no enter di line-loss calculation.",
    "Worked reference for 100 MW, power factor 1 and 5 Ω each phase",
    "Region and nominal voltage stages",
    "Base current and loss",
    "Raised current and loss",
    "Live regional comparison",
    "Double wire resistance for di transmission worksheet. How both results change? Why di difference no tell us much about national grid efficiency?",
    "Fix di shared transmission values to download both cases.",
    "Reset shared regional lesson values",
    "Download regional comparison (JSON)",
  ],
} satisfies Record<Locale, readonly string[]>;

export function PowerGridRegionalLesson({
  locale,
  inputs,
  onResistance,
  onReset,
}: {
  locale: Locale;
  inputs: PowerGridInputs;
  onResistance: (ohms: number) => void;
  onReset: () => void;
}) {
  const [
    title,
    prediction,
    assumptions,
    worked,
    region,
    base,
    raised,
    live,
    question,
    invalid,
    reset,
    report,
  ] = copy[locale];
  const cases = solveCases(inputs);
  const valid = cases.every(({ result }) => result);
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  const [phaseLabel, lossLabel] = phaseLabels[locale];
  const maxLoss = Math.max(
    0,
    ...cases.map(({ result }) => result?.raised.lineLossMW ?? 0),
  );
  const table = (label: string, rows: typeof cases) => (
    <table aria-label={label}>
      <thead>
        <tr>
          <th scope="col">{region}</th>
          <th scope="col">{base}</th>
          <th scope="col">{raised}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ preset, result }) => (
          <tr key={preset.id}>
            <th scope="row">
              {preset.engineeringRegion}
              <br />
              {preset.nominalVoltageStagesKV
                .map((stage) => format.format(stage))
                .join(" / ")}{" "}
              kV · {preset.frequencyHz} Hz
            </th>
            {[result?.base, result?.raised].map((reading, index) => (
              <td key={index}>
                {reading
                  ? `${reading.voltageKV} kV · ${format.format(reading.currentA)} A · ${format.format(reading.lineLossMW)} MW`
                  : "—"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
  return (
    <section
      className="panel panel-pad pg-panel"
      aria-labelledby="pg-regional-lesson"
    >
      <h3 id="pg-regional-lesson">{title}</h3>
      <p>{prediction}</p>
      <div className="pg-actions" role="group" aria-label={phaseLabel}>
        {[5, 10].map((ohms) => (
          <button
            className="button"
            type="button"
            key={ohms}
            aria-pressed={inputs.lineResistanceOhm === ohms}
            onClick={() => onResistance(ohms)}
          >
            {ohms} Ω
          </button>
        ))}
      </div>
      {valid && (
        <dl className="pg-foundation-readings" aria-live="polite">
          {cases.map(
            ({ preset, result }) =>
              result && (
                <div key={preset.id}>
                  <dt>{preset.engineeringRegion}</dt>
                  <dd>{format.format(result.raised.lineLossMW)} MW</dd>
                  <dd>
                    <meter
                      className="pg-voltage-meter"
                      aria-label={`${lossLabel} · ${preset.engineeringRegion}`}
                      value={result.raised.lineLossMW}
                      max={maxLoss || 1}
                    />
                  </dd>
                </div>
              ),
          )}
        </dl>
      )}
      <details>
        <summary>{worked}</summary>
        <p>{assumptions}</p>
        <div className="pg-table-wrap">{table(worked, reference)}</div>
      </details>
      <div className="pg-table-wrap">{table(live, cases)}</div>
      <p>{question}</p>
      {!valid && <p role="status">{invalid}</p>}
      <div className="pg-actions">
        <button className="button" type="button" onClick={onReset}>
          {reset}
        </button>
        <button
          className="button"
          type="button"
          disabled={!valid}
          onClick={() =>
            downloadFile(
              "powergrid-regional-comparison.json",
              JSON.stringify(
                {
                  schemaVersion: 1,
                  model: "balanced-three-phase-fixed-power-resistive-line-loss",
                  assumptions,
                  reference,
                  cases,
                },
                null,
                2,
              ),
              "application/json",
            )
          }
        >
          {report}
        </button>
      </div>
    </section>
  );
}
