const families = [
  {
    prefix: "CS6.2-48TM",
    revision: "V1.0C25_F23_D1_NA",
    maxSystemV: 1500,
    maxSeriesFuseA: 30,
    connector: "MC4",
    missingFields: ["separate-order-code"],
    url: "https://www.canadiansolar.com/wp-content/uploads/sites/3/2026/01/CS-Datasheet-TOPHiKu6_All-Black_CS6.2-48TM-H_v1.0C25_F23_D1_NA-1.pdf",
    // Page 2, STC table in model order.
    variants: [
      [440, 30.2, 14.58, 35.4, 15.88, 22.0],
      [445, 30.4, 14.64, 35.6, 15.95, 22.3],
      [450, 30.6, 14.71, 35.8, 16.02, 22.5],
      [455, 30.8, 14.78, 36.0, 16.09, 22.8],
      [460, 31.0, 14.84, 36.2, 16.16, 23.0],
      [465, 31.2, 14.91, 36.4, 16.23, 23.3],
      [470, 31.4, 14.98, 36.6, 16.3, 23.5],
    ],
  },
  {
    prefix: "CS6.1-54TM",
    revision: "V1.4C25_F23_D2_TX",
    maxSystemV: 1000,
    maxSeriesFuseA: 25,
    connector: "T6, MC4, MC4-EVO2, or MC4-EVO2A",
    missingFields: [
      "separate-order-code",
      "specific-connector-on-delivered-module",
    ],
    url: "https://www.canadiansolar.com/wp-content/uploads/sites/3/2026/01/CS-Datasheet-TOPHiKu6_All-Black_CS6.1-54TM-H_v1.4C25_F23_D2_TX.pdf",
    variants: [
      [435, 32.4, 13.45, 38.3, 14.33, 21.3],
      [440, 32.6, 13.52, 38.5, 14.41, 21.6],
      [445, 32.8, 13.59, 38.7, 14.48, 21.8],
      [450, 33, 13.66, 38.9, 14.55, 22],
      [455, 33.2, 13.72, 39.1, 14.61, 22.3],
      [460, 33.4, 13.78, 39.3, 14.69, 22.5],
      [465, 33.6, 13.85, 39.5, 14.77, 22.8],
    ],
  },
] as const;

export const pvModules = families.flatMap((family) =>
  family.variants.map(
    ([powerW, vmpV, impA, vocV, iscA, efficiencyPercent]) => ({
      id: `canadian-solar:${family.prefix.toLowerCase()}-${powerW}h`,
      manufacturer: "Canadian Solar",
      model: `${family.prefix}-${powerW}H`,
      orderCode: null,
      category: "solar-and-wind-equipment",
      function: "photovoltaic-module",
      connection: "dc",
      terminals: [
        {
          id: "positive",
          group: "dc-positive",
          interface: "dc-positive",
          connector: family.connector,
        },
        {
          id: "negative",
          group: "dc-negative",
          interface: "dc-negative",
          connector: family.connector,
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
        maxSystemV: family.maxSystemV,
        maxSeriesFuseA: family.maxSeriesFuseA,
      },
      conditions: { irradianceWm2: 1000, cellTemperatureC: 25, airMass: 1.5 },
      modelMapping: {
        dcNameplateKW: powerW / 1000,
        powerTemperatureCoefficientPerC: -0.0029,
      },
      source: { url: family.url, revision: family.revision, page: 2 },
      missingFields: family.missingFields,
      readiness: "pv-worksheet-inputs-only",
    }),
  ),
);
