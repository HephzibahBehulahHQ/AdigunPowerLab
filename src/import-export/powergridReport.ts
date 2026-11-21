import { jsPDF } from "jspdf";
import { calculatePowerGrid, type PowerGridInputs } from "../engine/powergrid";
import { embeddedFont } from "./reports";

export interface PowerGridReportSnapshot {
  inputs: PowerGridInputs;
  name: string;
  notes: string;
  preset?: string;
  locale: string;
  labels: Record<string, string>;
}

export async function createPowerGridReport(source: PowerGridReportSnapshot) {
  const { inputs, name, notes, preset, locale, labels } =
    structuredClone(source);
  const result = calculatePowerGrid(inputs);
  const font = await embeddedFont();
  const doc = new jsPDF({ unit: "mm", format: "a4", putOnlyUsedFonts: true });
  doc.addFileToVFS("DejaVuSans.ttf", font);
  doc.addFont("DejaVuSans.ttf", "PowerLab", "normal");
  doc.setFont("PowerLab");
  doc.setProperties({
    title: labels.reportTitle,
    subject: "Balanced three-phase line-loss comparison",
  });
  const left = 16;
  const right = 194;
  let y = 21;
  const ink = "#13243a";
  const blue = "#1d5265";
  const fmt = new Intl.NumberFormat(locale, { maximumFractionDigits: 4 });
  function room(height: number) {
    if (y + height <= 276) return;
    doc.addPage();
    y = 21;
  }
  function paragraph(value: string, size = 9) {
    doc.setFontSize(size);
    doc.setTextColor(ink);
    const lines: string[] = doc.splitTextToSize(value, right - left);
    for (const line of lines) {
      room(5);
      doc.text(line, left, y);
      y += 4.6;
    }
  }
  function heading(value: string) {
    room(18);
    y += 4;
    doc.setFontSize(12);
    doc.setTextColor(blue);
    doc.text(value, left, y);
    y += 7;
  }
  paragraph("ADIGUNPOWERLAB · POWERGRID LAB", 10);
  y += 3;
  paragraph(labels.reportTitle, 19);
  if (name.trim()) paragraph(name.trim(), 11);
  paragraph("Model ID: balanced-three-phase-constant-power-line-loss / v1", 8);
  if (preset) paragraph(preset);
  heading(labels.reportObjective);
  paragraph(labels.reportObjectiveText);

  heading(labels.reportNetwork);
  const stages = [
    [labels.generator, `${fmt.format(inputs.generationVoltageKV)} kV`],
    [
      labels.line,
      `${fmt.format(inputs.baseVoltageKV)} / ${fmt.format(inputs.raisedVoltageKV)} kV`,
    ],
    [labels.network, `${fmt.format(inputs.distributionVoltageKV)} kV`],
    [labels.load, `${fmt.format(inputs.consumerVoltageKV)} kV`],
  ];
  for (const [index, [caption, voltage]] of stages.entries()) {
    const x = left + index * 46;
    doc.setFillColor("#e6f2f4");
    doc.roundedRect(x, y - 4, 40, 17, 1, 1, "F");
    doc.setTextColor(ink);
    doc.setFontSize(7);
    const lines: string[] = doc.splitTextToSize(caption, 37);
    doc.text(lines, x + 20, y, { align: "center" });
    doc.setFontSize(9);
    doc.text(voltage, x + 20, y + 10, { align: "center" });
    if (index < stages.length - 1) {
      doc.setDrawColor(blue);
      doc.line(x + 40, y + 5, x + 46, y + 5);
    }
  }
  y += 20;
  paragraph(
    `${labels.power} ${fmt.format(inputs.powerMW)} MW · ${labels.pf} ${fmt.format(inputs.powerFactor)} · ${labels.resistance} ${fmt.format(inputs.lineResistanceOhm)} Ω`,
  );

  heading(labels.comparison);
  const columns = [left + 81, left + 129];
  doc.setFillColor("#e6f2f4");
  doc.rect(left, y - 5, right - left, 7, "F");
  doc.setTextColor(ink);
  doc.setFontSize(9);
  doc.text(`${fmt.format(result.base.voltageKV)} kV`, columns[0], y);
  doc.text(`${fmt.format(result.raised.voltageKV)} kV`, columns[1], y);
  y += 8;
  const rows = [
    [labels.current, result.base.currentA, result.raised.currentA, "A"],
    [labels.losses, result.base.lineLossMW, result.raised.lineLossMW, "MW"],
    [labels.lossShare, result.base.lossPercent, result.raised.lossPercent, "%"],
    [
      labels.delivered,
      result.base.deliveredMW,
      result.raised.deliveredMW,
      "MW",
    ],
  ] as const;
  for (const [name, base, raised, unit] of rows) {
    const lines: string[] = doc.splitTextToSize(name, 76);
    doc.text(lines, left, y);
    doc.text(`${fmt.format(base)} ${unit}`, columns[0], y);
    doc.text(`${fmt.format(raised)} ${unit}`, columns[1], y);
    y += lines.length * 4.5 + 2;
  }
  paragraph(
    `${labels.reducedCurrent} ${fmt.format(result.currentReductionPercent)}% · ${labels.reducedLoss} ${fmt.format(result.lossReductionPercent)}%`,
  );
  room(23);
  doc.setTextColor(ink);
  doc.setFontSize(8);
  const peakLoss = Math.max(result.base.lineLossMW, result.raised.lineLossMW);
  for (const [reading, color] of [
    [result.base, blue],
    [result.raised, "#247d70"],
  ] as const) {
    doc.text(`${fmt.format(reading.voltageKV)} kV`, left, y);
    doc.setFillColor(color);
    doc.rect(left + 31, y - 3, (reading.lineLossMW / peakLoss) * 105, 4, "F");
    doc.text(`${fmt.format(reading.lineLossMW)} MW`, right, y, {
      align: "right",
    });
    y += 7;
  }
  paragraph(labels.formula);

  heading(labels.assumptions);
  paragraph(labels.assumptionText);
  if (notes.trim()) {
    heading(labels.reportNotes);
    paragraph(notes.trim());
  }
  for (let page = 1; page <= doc.getNumberOfPages(); page++) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setTextColor(blue);
    doc.text("AdigunPowerLab", left, 286);
    doc.text(`${page} / ${doc.getNumberOfPages()}`, right, 286, {
      align: "right",
    });
  }
  return doc.output("blob");
}
