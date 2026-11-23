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
      category: "solar-and-wind-equipment" as const,
      function: "photovoltaic-module" as const,
      connection: "dc" as const,
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

// Schneider Acti9 2017, printed pp. 8–10, iC60N catalogue tables.
// The 0.5 A suffix is 70; all other suffixes match the printed ampere code.
export const ic60nBreakers = [1, 2, 3, 4].flatMap((poles) =>
  (["B", "C", "D"] as const).flatMap((curve, curveIndex) =>
    [0.5, 1, 2, 3, 4, 6, 10, 13, 16, 20, 25, 32, 40, 50, 63].map((currentA) => {
      const suffix =
        currentA === 0.5 ? "70" : String(currentA).padStart(2, "0");
      const model = `A9F${73 + curveIndex}${poles}${suffix}`;
      return {
        id: `schneider-electric:${model.toLowerCase()}`,
        manufacturer: "Schneider Electric",
        model,
        orderCode: model,
        category: "protection-devices" as const,
        function: "miniature-circuit-breaker" as const,
        connection: "ac" as const,
        terminals: Array.from({ length: poles }, (_, index) =>
          ["top", "bottom"].map((side) => ({
            id: `pole-${index + 1}-${side}`,
            group: `pole-${index + 1}-${side}`,
            interface: "ac-line",
            connector: "screw terminal",
          })),
        ).flat(),
        ratings: { ratedCurrentA: currentA, poles, curve, icnKA: 6 },
        conditions: {
          frequencyHz: [50, 60],
          icnVoltageV: poles === 1 ? 230 : 400,
          icnStandard: "IEC/EN 60898-1",
        },
        modelMapping: null,
        source: {
          url: "https://download.se.com/files?p_Doc_Ref=Acti9_Catalogue_2017&p_File_Ext=.pdf",
          revision: "Version 2.0, May 2017",
          page: poles <= 2 ? 8 : 9,
        },
        missingFields: [
          "regional-availability",
          "verified-protection-model-mapping",
        ],
        readiness: "inventory-and-diagram-only",
      };
    }),
  ),
);

// Acti9 2017, printed p. 52. Null cells are unavailable in this table.
const iidAcTable = [
  [2, 16, "A9R10216", null, null, null, null, null, null],
  [2, 25, "A9R10225", "A9R71225", null, "A9R74225", "A9R16225", null, null],
  [2, 40, null, "A9R71240", "A9R12240", "A9R74240", "A9R16240", null, null],
  [
    2,
    63,
    null,
    "A9R71263",
    "A9R12263",
    "A9R74263",
    "A9R16263",
    "A9R15263",
    null,
  ],
  [2, 80, null, "A9R11280", "A9R12280", "A9R14280", null, "A9R15280", null],
  [2, 100, null, "A9R11291", "A9R12291", "A9R14291", null, "A9R15291", null],
  [4, 25, null, "A9R71425", null, "A9R74425", "A9R16425", null, null],
  [
    4,
    40,
    null,
    "A9R71440",
    "A9R12440",
    "A9R74440",
    "A9R16440",
    "A9R15440",
    "A9R17440",
  ],
  [
    4,
    63,
    null,
    "A9R71463",
    "A9R12463",
    "A9R74463",
    "A9R16463",
    "A9R15463",
    "A9R17463",
  ],
  [
    4,
    80,
    null,
    "A9R11480",
    "A9R12480",
    "A9R14480",
    "A9R16480",
    "A9R15480",
    "A9R17480",
  ],
  [4, 100, null, "A9R11491", "A9R12491", "A9R14491", null, "A9R15491", null],
] as const;

export const iidRccbs = iidAcTable.flatMap(([poles, ratedCurrentA, ...codes]) =>
  codes.flatMap((model, column) => {
    if (!model) return [];
    return [
      {
        id: `schneider-electric:${model.toLowerCase()}`,
        manufacturer: "Schneider Electric",
        model,
        orderCode: model,
        category: "protection-devices" as const,
        function: "residual-current-circuit-breaker" as const,
        connection: "ac" as const,
        terminals: [
          ...Array.from({ length: poles - 1 }, (_, pole) =>
            ["top", "bottom"].map((side, index) => ({
              id: `pole-${pole + 1}-${side}`,
              group: String(pole * 2 + index + 1),
              interface: "ac-line",
              connector: "screw terminal",
            })),
          ).flat(),
          ...["top", "bottom"].map((side) => ({
            id: `neutral-${side}`,
            group: `N (${side})`,
            interface: "ac-neutral",
            connector: "screw terminal",
          })),
        ],
        ratings: {
          ratedCurrentA,
          poles,
          tripSensitivityMA: [10, 30, 100, 300, 500, 300, 500][column],
          selective: column >= 5,
        },
        conditions: {
          frequencyHz: [50, 60],
          ratedVoltageMinV: poles === 2 ? 230 : 400,
          ratedVoltageMaxV: poles === 2 ? 240 : 415,
          standard: "IEC/EN 61008-1",
          residualCurrentType: "AC",
        },
        modelMapping: null,
        source: {
          url: "https://download.se.com/files?p_Doc_Ref=Acti9_Catalogue_2017&p_File_Ext=.pdf",
          revision: "Version 2.0, May 2017",
          page: 52,
        },
        missingFields: [
          "regional-availability",
          "verified-protection-model-mapping",
        ],
        readiness: "inventory-and-diagram-only",
      },
    ];
  }),
);

export const componentBank = [...pvModules, ...ic60nBreakers, ...iidRccbs];

export function componentBankCsv(
  records: readonly (typeof componentBank)[number][],
) {
  const columns = Object.keys(
    pvModules[0],
  ) as (keyof (typeof componentBank)[number])[];
  const field = (value: unknown) => {
    const serialized =
      value !== null && typeof value === "object"
        ? JSON.stringify(value)
        : String(value ?? "");
    return `"${serialized.replaceAll('"', '""')}"`;
  };
  return (
    [
      columns.join(","),
      ...records.map((record) =>
        columns.map((column) => field(record[column])).join(","),
      ),
    ].join("\r\n") + "\r\n"
  );
}
