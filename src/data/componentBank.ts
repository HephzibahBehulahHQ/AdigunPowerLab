export const pvDatasheet =
  "https://www.canadiansolar.com/wp-content/uploads/sites/3/2026/01/CS-Datasheet-TOPHiKu6_All-Black_CS6.2-48TM-H_v1.0C25_F23_D1_NA-1.pdf";

// Canadian Solar datasheet V1.0C25_F23_D1_NA, page 2, STC table.
const variants = [
  [440, 30.2, 14.58, 35.4, 15.88, 22.0],
  [445, 30.4, 14.64, 35.6, 15.95, 22.3],
  [450, 30.6, 14.71, 35.8, 16.02, 22.5],
  [455, 30.8, 14.78, 36.0, 16.09, 22.8],
  [460, 31.0, 14.84, 36.2, 16.16, 23.0],
  [465, 31.2, 14.91, 36.4, 16.23, 23.3],
  [470, 31.4, 14.98, 36.6, 16.3, 23.5],
] as const;

export const pvModules = variants.map(
  ([powerW, vmpV, impA, vocV, iscA, efficiencyPercent]) => ({
    id: `canadian-solar:cs6.2-48tm-${powerW}h`,
    manufacturer: "Canadian Solar",
    model: `CS6.2-48TM-${powerW}H`,
    orderCode: null,
    category: "solar-and-wind-equipment",
    function: "photovoltaic-module",
    connection: "dc",
    terminals: [
      {
        id: "positive",
        group: "dc-positive",
        interface: "dc-positive",
        connector: "MC4",
      },
      {
        id: "negative",
        group: "dc-negative",
        interface: "dc-negative",
        connector: "MC4",
      },
      {
        id: "frame",
        group: "frame-bond",
        interface: "protective-bond",
        connector: "grounding-holes",
      },
    ],
    ratings: {
      powerW,
      vmpV,
      impA,
      vocV,
      iscA,
      efficiencyPercent,
      maxSystemV: 1500,
      maxSeriesFuseA: 30,
    },
    conditions: { irradianceWm2: 1000, cellTemperatureC: 25, airMass: 1.5 },
    modelMapping: {
      dcNameplateKW: powerW / 1000,
      powerTemperatureCoefficientPerC: -0.0029,
    },
    source: { url: pvDatasheet, revision: "V1.0C25_F23_D1_NA", page: 2 },
    missingFields: ["separate-order-code"],
    readiness: "pv-worksheet-inputs-only",
  }),
);
