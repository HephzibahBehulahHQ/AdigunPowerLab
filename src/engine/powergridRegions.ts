import type { PowerGridInputs } from "./powergrid";

export interface RegionalTeachingPreset {
  id: string;
  engineeringRegion: string;
  frequencyHz: number;
  currencyCode: string;
  timeZone: string;
  nominalVoltageStagesKV: readonly number[];
  stepUpInputs: Pick<
    PowerGridInputs,
    "baseVoltageKV" | "raisedVoltageKV" | "distributionVoltageKV"
  >;
  voltageConvention: string;
  resourceProfile: string;
  demandProfile: string;
  simplifications: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceDate: string;
}

/**
 * First bounded regional teaching preset. The stated nominal stages and
 * frequency come from Nigeria's published Grid Code; this is not a grid model.
 */
export const NIGERIA_TEACHING_PRESET: RegionalTeachingPreset = {
  id: "nigeria-inspired",
  engineeringRegion: "Nigeria-inspired",
  frequencyHz: 50,
  currencyCode: "NGN",
  timeZone: "Africa/Lagos",
  nominalVoltageStagesKV: [330, 132, 33, 11],
  stepUpInputs: {
    baseVoltageKV: 132,
    raisedVoltageKV: 330,
    distributionVoltageKV: 33,
  },
  voltageConvention:
    "Nominal line-to-line kV stages: 330, 132, 33 and 11. The step-up worksheet uses 132 and 330 kV for comparison and 33 kV for distribution.",
  resourceProfile:
    "No Nigerian generation or weather profile is bundled; generation remains user-entered or illustrative.",
  demandProfile:
    "No Nigerian demand or household profile is bundled; loads remain user-entered or illustrative.",
  simplifications:
    "The 50 Hz value is context only. The present balanced steady-state worksheets do not calculate frequency response. The 11 kV and low-voltage consumer stages are not modeled as additional transformer nodes here; generator-terminal and consumer fields remain unchanged. This is not an operational replica of Nigeria's grid.",
  sourceUrl:
    "https://nerc.gov.ng/wp-content/uploads/2013/07/Grid%20Code_%28For%20Public%20Consultation%29.pdf",
  sourceTitle: "Nigerian Grid Code, Version 02, public consultation copy",
  sourceDate: "2013; accessed 14 November 2026",
};

export const REGIONAL_TEACHING_PRESETS = [NIGERIA_TEACHING_PRESET] as const;

export function applyRegionalTeachingPreset(
  inputs: PowerGridInputs,
  preset: RegionalTeachingPreset,
): PowerGridInputs {
  return { ...inputs, ...preset.stepUpInputs };
}
