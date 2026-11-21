import type { PowerGridInputs } from "./powergrid";

// Authored teaching inputs, with six equal four-hour intervals covering one day.
export const RURAL_MICROGRID_TEACHING_PROFILE = {
  intervalHours: 4,
  windSpeeds: [0, 0, 0, 0, 0, 0],
  irradiance: [0, 0, 450, 750, 140, 0],
  demand: [9, 8, 22, 25, 30, 18],
  critical: [5, 5, 8, 8, 12, 9],
} as const;

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
  > &
    Partial<Pick<PowerGridInputs, "consumerVoltageKV">>;
  voltageConvention: string;
  resourceProfile: string;
  demandProfile: string;
  simplifications: string;
  sourceReferences: readonly { url: string; title: string; date: string }[];
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
  sourceReferences: [
    {
      url: "https://nerc.gov.ng/wp-content/uploads/2013/07/Grid%20Code_%28For%20Public%20Consultation%29.pdf",
      title: "Nigerian Grid Code, Version 02, public consultation copy",
      date: "2013; accessed 14 November 2026",
    },
  ],
};

export const GERMANY_TEACHING_PRESET: RegionalTeachingPreset = {
  id: "germany-inspired",
  engineeringRegion: "Germany-inspired · 50Hertz grid-area example",
  frequencyHz: 50,
  currencyCode: "EUR",
  timeZone: "Europe/Berlin",
  nominalVoltageStagesKV: [380, 220, 110, 20, 0.4],
  stepUpInputs: {
    baseVoltageKV: 220,
    raisedVoltageKV: 380,
    distributionVoltageKV: 110,
    consumerVoltageKV: 0.4,
  },
  voltageConvention:
    "Documented line-to-line stages include 380, 220 and 110 kV. 20 kV is an illustrative choice within the published 15–30 kV medium-voltage range; 0.4 kV represents 400 V line-to-line service.",
  resourceProfile:
    "No Germany or 50Hertz-area generation or weather time series is loaded; resource values remain user-entered.",
  demandProfile:
    "No Germany or 50Hertz-area demand profile is loaded; loads remain user-entered or illustrative.",
  simplifications:
    "This uses the 50Hertz transmission-area example and is not a complete national grid. The 50 Hz value is context only; steady-state worksheets do not calculate frequency response. Applying sets 220/380/110 kV and 0.4 kV only; generator-terminal voltage is unchanged. No regional resource or demand data is simulated.",
  sourceReferences: [
    {
      url: "https://www.50hertz.com/en/Grid",
      title: "50Hertz transmission grid and network levels",
      date: "Current information; accessed 14 November 2026",
    },
    {
      url: "https://data.bundesnetzagentur.de/Bundesnetzagentur/SharedDocs/Mediathek/Monitoringberichte/MonitoringberichtEnergie2024.pdf",
      title: "Bundesnetzagentur Monitoringbericht Energie 2024",
      date: "2024; accessed 14 November 2026",
    },
    {
      url: "https://www.50hertz.com/portals/1/dokumente/vertragspartner/netzanschluss/netzanschlussregeln-stand-05-2008.pdf",
      title:
        "50Hertz grid connection rules (frequency and nominal transmission levels)",
      date: "May 2008; accessed 14 November 2026",
    },
  ],
};

export const US_PACIFIC_NORTHWEST_PRESET: RegionalTeachingPreset = {
  id: "us-pacific-northwest-inspired",
  engineeringRegion: "United States-inspired · Pacific Northwest",
  frequencyHz: 60,
  currencyCode: "USD",
  timeZone: "America/Los_Angeles",
  nominalVoltageStagesKV: [230, 115, 12.47],
  stepUpInputs: {
    baseVoltageKV: 115,
    raisedVoltageKV: 230,
    distributionVoltageKV: 12.47,
  },
  voltageConvention:
    "The transmission example uses documented BPA 115 and 230 kV stages. The 12.47 kV distribution stage is illustrative. Residential 120/240 V split-phase service is a separate single-phase context.",
  resourceProfile: "No Pacific Northwest resource profile is loaded.",
  demandProfile: "No Pacific Northwest demand profile is loaded.",
  simplifications:
    "Applying updates 115/230/12.47 kV. Generator terminals and balanced consumer voltage stay as entered. The balanced comparison does not model residential split-phase service or frequency response.",
  sourceReferences: [
    {
      url: "https://www.bpa.gov/-/media/Aep/transmission/attachment-k/2025-BPA-Transmission-Plan_Final.pdf",
      title: "Bonneville Power Administration · 2025 Transmission Plan",
      date: "2025; accessed 21 November 2026",
    },
    {
      url: "https://www.energy.gov/oe/learn-more-about-interconnections",
      title: "U.S. Department of Energy · Western Interconnection",
      date: "Accessed 21 November 2026",
    },
    {
      url: "https://web8.seattle.gov/city-light-engineering-standards/Home/GetPDF?libId=StandardsforElectricService&searchForfileName=Standards+for+Electric+Service+2020+Edition.pdf",
      title: "Seattle City Light · Standards for Electric Service",
      date: "2020; accessed 21 November 2026",
    },
  ],
};

export const REGIONAL_TEACHING_PRESETS = [
  NIGERIA_TEACHING_PRESET,
  GERMANY_TEACHING_PRESET,
  US_PACIFIC_NORTHWEST_PRESET,
] as const;

export function applyRegionalTeachingPreset(
  inputs: PowerGridInputs,
  preset: RegionalTeachingPreset,
): PowerGridInputs {
  return { ...inputs, ...preset.stepUpInputs };
}
