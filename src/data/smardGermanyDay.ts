const gridLoad = [
  45137.8, 43059.3, 41999.73, 41872.66, 42783.86, 45049.05, 51240.18, 55943.89,
  58651.93, 57841.17, 56943.33, 56826.27, 56477.76, 56076.22, 55928.88,
  55255.62, 55575.42, 56424.23, 56844.69, 56763.09, 55549.78, 53411.35,
  51157.99, 47847.02,
];
const photovoltaics = [
  54.75, 55.5, 54, 54, 66, 823.5, 4535.75, 12130.25, 22666.5, 32967.5, 40444.5,
  44507, 45868.25, 45294.75, 42742, 39388, 34928, 26501.5, 17070.75, 8141.5,
  2699.25, 335.75, 78.75, 56.75,
];
const windOnshore = [
  3195, 3487.75, 3797, 4058.5, 4287.5, 4447, 4336.5, 3263.75, 2429.25, 2849.5,
  3364, 4116.25, 4953, 5867.25, 6623.5, 8142.5, 9319.75, 9421.75, 8669, 7780.25,
  6498, 6372.75, 6137.75, 6766.75,
];
const windOffshore = [
  1586.25, 1851, 1745.25, 1816.25, 1761.5, 1534.5, 1211.5, 1027, 889.75, 360.75,
  388.25, 615.5, 660, 776.25, 1283.25, 1484.5, 1724, 2295.5, 2335.25, 2357.25,
  2377.75, 2246.5, 2186.25, 2217.25,
];

const source = (seriesId: number) =>
  `https://www.smard.de/app/chart_data/${seriesId}/DE/${seriesId}_DE_hour_1750024800000.json`;

export const SMARD_GERMANY_DAY = {
  date: "2025-06-18",
  timeZone: "Europe/Berlin",
  unit: "MWh per one-hour interval",
  attribution: "Bundesnetzagentur | SMARD.de",
  license: "CC BY 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  dataUseUrl: "https://www.smard.de/en/datennutzung",
  sources: {
    gridLoad: source(410),
    photovoltaics: source(4068),
    windOnshore: source(4067),
    windOffshore: source(1225),
  },
  intervals: gridLoad.map((gridLoadMWh, hour) => {
    const solarMWh = photovoltaics[hour];
    const onshoreMWh = windOnshore[hour];
    const offshoreMWh = windOffshore[hour];
    return {
      start: `2025-06-18T${String(hour).padStart(2, "0")}:00:00+02:00`,
      gridLoadMWh,
      solarMWh,
      onshoreMWh,
      offshoreMWh,
      residualMWh:
        Math.round((gridLoadMWh - solarMWh - onshoreMWh - offshoreMWh) * 100) /
        100,
    };
  }),
};
