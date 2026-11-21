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

const winterLoad = [
  52824.5, 50956, 50275.75, 50527.75, 51299, 54505.75, 61508, 66900.75, 69385.5,
  69585.5, 69225.25, 69535.25, 69538.5, 67885.5, 66803.5, 66384, 67409.25,
  70517.75, 71098.25, 69011.5, 65808.5, 62468.75, 59505.25, 55956,
];
const winterSolar = [
  6, 6, 6, 6, 6, 6, 10.5, 20.25, 897.25, 4775.5, 9646, 13201, 13655.25, 11581.5,
  7637, 3541.75, 520.75, 21.75, 15.25, 11, 9.5, 8, 7, 7.75,
];
const winterOnshore = [
  4775.25, 5058, 5302.75, 5679.5, 6285.75, 6997, 7945.25, 8653.75, 9684.75,
  10753.75, 10748, 10238, 9836, 9714.25, 10660.75, 12940.75, 15827, 18445,
  19931.5, 20097.75, 20020, 20015.75, 19219.75, 19027.5,
];
const winterOffshore = [
  1675.75, 1130, 873.25, 757.75, 655.25, 605.75, 792, 869.75, 1137.5, 1414.25,
  1367.25, 1493.25, 1606, 1768, 1844.25, 1529.75, 1438.5, 1492.25, 1830.25,
  1903.75, 1897.25, 2030.25, 2054.75, 2108.5,
];

function buildDay(
  date: string,
  offset: string,
  chunk: number,
  columns: {
    gridLoad: number[];
    photovoltaics: number[];
    windOnshore: number[];
    windOffshore: number[];
  },
) {
  const source = (seriesId: number) =>
    `https://www.smard.de/app/chart_data/${seriesId}/DE/${seriesId}_DE_hour_${chunk}.json`;
  return {
    date,
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
    intervals: columns.gridLoad.map((gridLoadMWh, hour) => {
      const solarMWh = columns.photovoltaics[hour];
      const onshoreMWh = columns.windOnshore[hour];
      const offshoreMWh = columns.windOffshore[hour];
      return {
        start: `${date}T${String(hour).padStart(2, "0")}:00:00${offset}`,
        gridLoadMWh,
        solarMWh,
        onshoreMWh,
        offshoreMWh,
        residualMWh:
          Math.round(
            (gridLoadMWh - solarMWh - onshoreMWh - offshoreMWh) * 100,
          ) / 100,
      };
    }),
  };
}

export const SMARD_GERMANY_DAY = buildDay(
  "2025-06-18",
  "+02:00",
  1750024800000,
  {
    gridLoad,
    photovoltaics,
    windOnshore,
    windOffshore,
  },
);
export const SMARD_GERMANY_WINTER_DAY = buildDay(
  "2025-01-22",
  "+01:00",
  1737327600000,
  {
    gridLoad: winterLoad,
    photovoltaics: winterSolar,
    windOnshore: winterOnshore,
    windOffshore: winterOffshore,
  },
);
