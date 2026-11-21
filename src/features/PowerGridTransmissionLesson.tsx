import { useState } from "react";
import {
  calculatePowerGrid,
  DEFAULT_POWERGRID_INPUTS,
} from "../engine/powergrid";
import type { PowerGridInputs } from "../engine/powergrid";
import type { Locale } from "../i18n";

const reference = { ...DEFAULT_POWERGRID_INPUTS, powerFactor: 0.8 };
const compensated = { ...reference, powerFactor: 1 };
const readings = [reference, compensated].map((inputs) => ({
  powerFactor: inputs.powerFactor,
  ...calculatePowerGrid(inputs).base,
}));

const controls = {
  en: [
    "Try a power factor",
    "Use this setting in the worksheet",
    "Watch a capacitor bank demonstration",
  ],
  de: [
    "Leistungsfaktor ausprobieren",
    "Wert ins Arbeitsblatt übernehmen",
    "Vorführung einer Kondensatoranlage ansehen",
  ],
  yo: [
    "Dán ìpín agbára wò",
    "Lo iye yìí nínú worksheet",
    "Wo àfihàn àkójọpọ̀ capacitor",
  ],
  pcm: [
    "Try one power factor",
    "Use dis setting for worksheet",
    "Watch di capacitor bank demo",
  ],
} satisfies Record<Locale, readonly string[]>;

const copy = {
  en: [
    "Practical lesson: Poor power factor",
    "Predict how current and conductor loss will change if power factor rises from 0.80 to 1.00.",
    "Hold real power at 100 MW, line voltage at 132 kV and conductor resistance at 5 Ω per phase. The balanced model represents compensation as an ideal power-factor change.",
    "Worked reference",
    "Power factor",
    "Line current (A)",
    "Conductor loss (MW)",
    "Load or reset lesson inputs",
    "Pin the loaded case as the baseline. Change Power factor to 1 and check both readings. Why does loss fall faster than current? Enter your interpretation in Student notes and export the PDF.",
  ],
  de: [
    "Praxisversuch: Niedriger Leistungsfaktor",
    "Sagen Sie voraus, wie sich Strom und Leiterverlust ändern, wenn der Leistungsfaktor von 0,80 auf 1,00 steigt.",
    "Wirkleistung (100 MW), Leiterspannung (132 kV) und Leiterwiderstand je Phase (5 Ω) bleiben konstant. Das symmetrische Modell bildet die Kompensation als ideale Änderung des Leistungsfaktors ab.",
    "Berechnetes Referenzbeispiel",
    "Leistungsfaktor",
    "Leiterstrom (A)",
    "Leiterverlust (MW)",
    "Versuchswerte laden oder zurücksetzen",
    "Fixieren Sie den geladenen Fall als Referenz. Setzen Sie den Leistungsfaktor auf 1 und prüfen Sie beide Werte. Warum sinkt der Verlust stärker als der Strom? Halten Sie Ihre Erklärung in den Notizen fest und exportieren Sie das PDF.",
  ],
  yo: [
    "Ìdánwò: Ìpín agbára kékeré",
    "Sọ àsọtẹ́lẹ̀ bí ìṣàn iná àti àdánù inú okùn yóò ṣe yí padà bí ìpín agbára bá gòkè láti 0.80 sí 1.00.",
    "Jẹ́ kí agbára gidi dúró ní 100 MW, fólítéèjì ìlà ní 132 kV àti ìdènà okùn ní 5 Ω fún ìpele kọ̀ọ̀kan. Àwòṣe ìpele mẹ́ta tó dọ́gba fi ìyípadà ìpín agbára hàn gẹ́gẹ́ bí àtúnṣe pípé.",
    "Àpẹẹrẹ ìṣírò",
    "Ìpín agbára",
    "Ìṣàn iná ìlà (A)",
    "Àdánù inú okùn (MW)",
    "Gbé iye ìdánwò wọlé tàbí dá wọn padà",
    "Fi àpẹẹrẹ tí o gbé wọlé ṣe ìpìlẹ̀. Yí ìpín agbára sí 1 kí o sì wo iye méjèèjì. Kí ló mú kí àdánù dín kù ju ìṣàn iná lọ? Kọ ìtumọ̀ rẹ sínú àkọsílẹ̀ akẹ́kọ̀ọ́ kí o sì ṣe PDF.",
  ],
  pcm: [
    "Practical lesson: Low power factor",
    "Predict how current and wire loss go change if power factor climb from 0.80 to 1.00.",
    "Keep real power for 100 MW, line voltage for 132 kV and wire resistance for 5 Ω each phase. The balanced model show compensation as ideal change for power factor.",
    "Reference wey dem calculate",
    "Power factor",
    "Line current (A)",
    "Wire loss (MW)",
    "Load or reset lesson values",
    "Pin the case wey you load as baseline. Change Power factor to 1 and check the two readings. Why loss drop pass current? Write wetin you find for student notes and export the PDF.",
  ],
} satisfies Record<Locale, readonly string[]>;

export function PowerGridTransmissionLesson({
  locale,
  onLoad,
}: {
  locale: Locale;
  onLoad: (inputs: PowerGridInputs) => void;
}) {
  const [trialFactor, setTrialFactor] = useState(1);
  const [video, setVideo] = useState(false);
  const trialInputs = { ...reference, powerFactor: trialFactor };
  const trial = calculatePowerGrid(trialInputs).base;
  const [trialLabel, applyLabel, videoLabel] = controls[locale];
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  const [
    title,
    prediction,
    assumptions,
    worked,
    factor,
    current,
    loss,
    load,
    interpretation,
  ] = copy[locale];

  return (
    <section
      className="panel panel-pad pg-panel"
      aria-labelledby="pg-lesson-pf"
    >
      <h3 id="pg-lesson-pf">{title}</h3>
      <p>{prediction}</p>
      <div className="pg-home-video">
        <div className="pg-home-video-frame pg-transformer-video">
          {video ? (
            <iframe
              src="https://www.youtube-nocookie.com/embed/-Cp9guj0B_M"
              title={videoLabel}
              allowFullScreen
            />
          ) : (
            <button
              className="pg-field-video-play"
              type="button"
              onClick={() => setVideo(true)}
            >
              <img
                src="./assets/electrical-test-tools.png"
                alt=""
                loading="lazy"
              />
              <span>{videoLabel}</span>
            </button>
          )}
        </div>
        <div>
          <label className="pg-field">
            <span>{trialLabel}</span>
            <input
              type="range"
              min={0.8}
              max={1}
              step={0.01}
              value={trialFactor}
              onChange={(event) =>
                setTrialFactor(event.currentTarget.valueAsNumber)
              }
            />
          </label>
          <dl className="pg-foundation-readings" aria-live="polite">
            <div>
              <dt>{factor}</dt>
              <dd>{format.format(trialFactor)}</dd>
            </div>
            <div>
              <dt>{current}</dt>
              <dd>{format.format(trial.currentA)}</dd>
            </div>
            <div>
              <dt>{loss}</dt>
              <dd>{format.format(trial.lineLossMW)}</dd>
            </div>
          </dl>
          <button
            className="button"
            type="button"
            onClick={() => onLoad(trialInputs)}
          >
            {applyLabel}
          </button>
        </div>
      </div>
      <details>
        <summary>{worked}</summary>
        <p>{assumptions}</p>
        <table aria-label={worked}>
          <thead>
            <tr>
              <th scope="col">{factor}</th>
              <th scope="col">{current}</th>
              <th scope="col">{loss}</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((reading) => (
              <tr key={reading.powerFactor}>
                <th scope="row">{reading.powerFactor.toFixed(2)}</th>
                <td>{reading.currentA.toFixed(1)}</td>
                <td>{reading.lineLossMW.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
      <p>{interpretation}</p>
      <button
        className="button"
        type="button"
        onClick={() => {
          setTrialFactor(1);
          onLoad(reference);
        }}
      >
        {load}
      </button>
    </section>
  );
}
