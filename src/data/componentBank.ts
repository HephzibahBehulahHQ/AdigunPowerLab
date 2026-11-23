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
function acti9Breakers(family: "iC60N" | "iC60H") {
  const highCapacity = family === "iC60H";
  return [1, 2, 3, 4].flatMap((poles) =>
    (["B", "C", "D"] as const).flatMap((curve, curveIndex) =>
      [0.5, 1, 2, 3, 4, 6, 10, 13, 16, 20, 25, 32, 40, 50, 63].map(
        (currentA) => {
          const suffix =
            currentA === 0.5 ? "70" : String(currentA).padStart(2, "0");
          const model = `A9F${(highCapacity ? 83 : 73) + curveIndex}${poles}${suffix}`;
          return {
            id: `schneider-electric:${model.toLowerCase()}`,
            manufacturer: "Schneider Electric",
            model,
            orderCode: model,
            category: "protection-devices" as const,
            function: "miniature-circuit-breaker" as const,
            connection: "ac" as const,
            terminals: Array.from({ length: poles }, (_, index) =>
              ["top", "bottom"].map((side, terminal) => ({
                id: `pole-${index + 1}-${side}`,
                group: highCapacity
                  ? String(index * 2 + terminal + 1)
                  : `pole-${index + 1}-${side}`,
                interface: "ac-line",
                connector: "screw terminal",
              })),
            ).flat(),
            ratings: {
              ratedCurrentA: currentA,
              poles,
              curve,
              icnKA: highCapacity ? 10 : 6,
              ...(highCapacity ? { family } : {}),
            },
            conditions: {
              frequencyHz: [50, 60],
              icnVoltageV: poles === 1 ? 230 : 400,
              icnStandard: "IEC/EN 60898-1",
              ...(highCapacity ? { icnSourcePage: 11 } : {}),
            },
            modelMapping: null,
            source: {
              url: "https://download.se.com/files?p_Doc_Ref=Acti9_Catalogue_2017&p_File_Ext=.pdf",
              revision: "Version 2.0, May 2017",
              page: highCapacity ? 12 : poles <= 2 ? 8 : 9,
            },
            missingFields: [
              "regional-availability",
              "verified-protection-model-mapping",
            ],
            readiness: "inventory-and-diagram-only",
          };
        },
      ),
    ),
  );
}

export const ic60nBreakers = acti9Breakers("iC60N");
// The iC60H order and terminal table is on p. 12; Icn is on p. 11.
export const ic60hBreakers = acti9Breakers("iC60H");

// Acti9 2017 p. 14: code 72 is present only in the K/Z columns.
export const ic60lBreakers = [1, 2, 3, 4].flatMap((poles) =>
  (
    [
      ["B", 93],
      ["C", 94],
      ["K", 95],
      ["Z", 92],
    ] as const
  ).flatMap(([curve, code]) =>
    [
      0.5,
      1,
      ...(curve === "K" || curve === "Z" ? [1.6] : []),
      2,
      3,
      4,
      6,
      10,
      16,
      20,
      25,
      32,
      40,
      50,
      63,
    ].map((ratedCurrentA) => {
      const suffix =
        ratedCurrentA === 0.5
          ? "70"
          : ratedCurrentA === 1.6
            ? "72"
            : String(ratedCurrentA).padStart(2, "0");
      const model = `A9F${code}${poles}${suffix}`;
      const icnApplies = ratedCurrentA <= 40;
      return {
        id: `schneider-electric:${model.toLowerCase()}`,
        manufacturer: "Schneider Electric",
        model,
        orderCode: model,
        category: "protection-devices" as const,
        function: "miniature-circuit-breaker" as const,
        connection: "ac" as const,
        terminals: Array.from({ length: poles }, (_, pole) =>
          ["top", "bottom"].map((side, terminal) => ({
            id: `pole-${pole + 1}-${side}`,
            group: String(pole * 2 + terminal + 1),
            interface: "ac-line",
            connector: "screw terminal",
          })),
        ).flat(),
        ratings: {
          ratedCurrentA,
          poles,
          curve,
          family: "iC60L",
          icnKA: icnApplies ? 15 : null,
        },
        conditions: {
          frequencyHz: [50, 60],
          icnVoltageV: icnApplies ? (poles === 1 ? 230 : 400) : null,
          icnStandard: icnApplies ? "IEC/EN 60898-1" : null,
          ...(poles === 1 && curve === "K" && ratedCurrentA >= 50
            ? {
                catalogueApprovalNote: "Catalogue footnote 3: without approval",
              }
            : {}),
        },
        modelMapping: null,
        source: {
          url: "https://download.se.com/files?p_Doc_Ref=Acti9_Catalogue_2017&p_File_Ext=.pdf",
          revision: "Version 2.0, May 2017",
          page: 14,
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

// Printed p. 53: separate 230/400 V and 110/230 V tables.
const iidTypeATable = [
  [2, 16, "A9R20216"],
  [2, 25, "A9R20225", "A9R51225", null, "A9R54225"],
  [2, 40, null, "A9R51240", null, "A9R54240", null, "A9R25240"],
  [2, 63, null, "A9R51263", null, "A9R54263", null, "A9R25263"],
  [2, 100, null, "A9R21291", null, "A9R24291", null, "A9R25291"],
  [4, 25, null, "A9R51425", null, "A9R54425"],
  [4, 40, null, "A9R51440", "A9R22440", "A9R54440", "A9R26440", "A9R25440"],
  [4, 63, null, "A9R51463", "A9R22463", "A9R54463", "A9R26463", "A9R25463"],
  [4, 80, null, "A9R21480", null, "A9R24480", null, "A9R25480"],
  [4, 100, null, "A9R21491", null, "A9R24491", "A9R26491", "A9R25491"],
] as const;

const iidLowerVoltageTypeATable = [
  [2, 63, null, "A9R08263"],
  [4, 63, null, "A9R08463"],
] as const;

export const iidRccbs = [
  {
    table: iidAcTable,
    type: "AC",
    page: 52,
    voltage2P: [230, 240],
    voltage4P: [400, 415],
  },
  {
    table: iidTypeATable,
    type: "A",
    page: 53,
    voltage2P: [230, 240],
    voltage4P: [400, 415],
  },
  {
    table: iidLowerVoltageTypeATable,
    type: "A",
    page: 53,
    voltage2P: [110, 110],
    voltage4P: [230, 230],
  },
].flatMap(({ table, type, page, voltage2P, voltage4P }) =>
  table.flatMap(([poles, ratedCurrentA, ...codes]) =>
    codes.flatMap((model, column) => {
      if (!model) return [];
      const [ratedVoltageMinV, ratedVoltageMaxV] =
        poles === 2 ? voltage2P : voltage4P;
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
            ratedVoltageMinV,
            ratedVoltageMaxV,
            standard: "IEC/EN 61008-1",
            residualCurrentType: type,
          },
          modelMapping: null,
          source: {
            url: "https://download.se.com/files?p_Doc_Ref=Acti9_Catalogue_2017&p_File_Ext=.pdf",
            revision: "Version 2.0, May 2017",
            page,
          },
          missingFields: [
            "regional-availability",
            "verified-protection-model-mapping",
          ],
          readiness: "inventory-and-diagram-only",
        },
      ];
    }),
  ),
);

const iswTable = [
  ["A9S60120", 1, 20, 250],
  ["A9S60132", 1, 32, 250],
  ["A9S60220", 2, 20, 415],
  ["A9S60232", 2, 32, 415],
  ["A9S60320", 3, 20, 415],
  ["A9S60332", 3, 32, 415],
  ["A9S60420", 4, 20, 415],
  ["A9S60432", 4, 32, 415],
  ["A9S65140", 1, 40, 240],
  ["A9S65340", 3, 40, 415],
  ["A9S65363", 3, 63, 415],
  ["A9S65440", 4, 40, 415],
] as const;

export const iswSwitches = iswTable.map(
  ([model, poles, ratedCurrentA, voltageV]) => {
    const disconnector = ratedCurrentA >= 40;
    return {
      id: `schneider-electric:${model.toLowerCase()}`,
      manufacturer: "Schneider Electric",
      model,
      orderCode: model,
      category: "switching-and-transfer-equipment" as const,
      function: disconnector
        ? ("switch-disconnector" as const)
        : ("control-switch" as const),
      connection: "ac" as const,
      terminals: Array.from({ length: poles }, (_, pole) =>
        ["top", "bottom"].map((side, index) => ({
          id: `pole-${pole + 1}-${side}`,
          group: String(pole * 2 + index + 1),
          interface: "ac-line",
          connector: "screw terminal",
        })),
      ).flat(),
      ratings: { ratedCurrentA, poles, voltageV },
      conditions: { frequencyHz: [50, 60] },
      modelMapping: null,
      source: disconnector
        ? {
            url: "https://download.se.com/files?p_Doc_Ref=CA909006NL&p_File_Ext=.PDF",
            revision: "CA909006E, Version 1.0, 02/08/2017",
            page: 59,
          }
        : {
            url: "https://download.se.com/files?p_Doc_Ref=SE8863_Acti9_RTI&p_File_Ext=.PDF",
            revision: "SE8863 Acti9 Ready to Install",
            page: 7,
          },
      missingFields: [
        "regional-availability",
        "verified-switching-model-mapping",
      ],
      readiness: "inventory-and-diagram-only",
    };
  },
);

export const iemMeters = [
  "A9MEM2000",
  "A9MEM2000C",
  "A9MEM2010",
  "A9MEM2010C",
].map((model) => {
  const pulseOutput = model.startsWith("A9MEM2010");
  return {
    id: `schneider-electric:${model.toLowerCase()}`,
    manufacturer: "Schneider Electric",
    model,
    orderCode: model,
    category: "metering-and-power-quality" as const,
    function: "direct-energy-meter" as const,
    connection: "ac" as const,
    terminals: [
      {
        id: "pole-1-top",
        group: "L",
        interface: "ac-line",
        connector: "screw terminal",
      },
      {
        id: "pole-1-bottom",
        group: "L′",
        interface: "ac-line",
        connector: "screw terminal",
      },
      {
        id: "neutral-top",
        group: "N",
        interface: "ac-neutral",
        connector: "screw terminal",
      },
      {
        id: "neutral-bottom",
        group: "N′",
        interface: "ac-neutral",
        connector: "screw terminal",
      },
      ...(pulseOutput
        ? ["+", "−"].map((sign) => ({
            id: sign === "+" ? "pulse-positive" : "pulse-negative",
            group: `S0${sign}`,
            interface: "pulse-output",
            connector: "screw terminal",
          }))
        : []),
    ],
    ratings: {
      maxCurrentA: 40,
      voltageV: 230,
      voltageTolerancePercent: 20,
      accuracyClass: 1,
      pulsesPerKWh: pulseOutput ? 100 : null,
    },
    conditions: {
      frequencyHz: { min: 45, max: 65 },
      marketRestriction: model.endsWith("C") ? "China only" : null,
    },
    modelMapping: null,
    source: {
      url: "https://download.se.com/files?p_Doc_Ref=S1B45381&p_File_Name=S1B45381-03.pdf&p_enDocType=Instruction+sheet",
      revision: "S1B45381-03/1, September 2022",
      page: 2,
    },
    missingFields: ["verified-metering-model-mapping"],
    readiness: "inventory-and-diagram-only",
  };
});

// CA909006E p. 74: normally open contactors with documented terminal diagrams.
export const ictContactors = (
  [
    ["A9C20731", 1, 25, 8.5, 230, false],
    ["A9C22712", 2, 16, 6, 230, false],
    ["A9C20732", 2, 25, 8.5, 230, false],
    ["A9C20842", 2, 40, 15, 220, false],
    ["A9C20834", 4, 25, 8.5, 220, false],
    ["A9C21732", 2, 25, 8.5, 230, true],
    ["A9C21833", 3, 25, 8.5, 220, true],
    ["A9C21834", 4, 25, 8.5, 220, true],
  ] as const
).map(([model, poles, ac7aA, ac7bA, coilMinV, manualSelector]) => ({
  id: `schneider-electric:${model.toLowerCase()}`,
  manufacturer: "Schneider Electric",
  model,
  orderCode: model,
  category: "switching-and-transfer-equipment" as const,
  function: "modular-contactor" as const,
  connection: "ac" as const,
  terminals: [
    ...Array.from({ length: poles }, (_, pole) =>
      ["top", "bottom"].map((side, index) => ({
        id: `pole-${pole + 1}-${side}`,
        group: String(pole * 2 + index + 1),
        interface: "ac-line",
        connector: "screw terminal",
      })),
    ).flat(),
    ...["A1", "A2"].map((group) => ({
      id: group.toLowerCase(),
      group,
      interface: "ac-coil",
      connector: "screw terminal",
    })),
  ],
  ratings: { poles, ac7aA, ac7bA, coilMinV, coilMaxV: 240, manualSelector },
  conditions: {
    contactState: "normally open",
    coilFrequencyHz: manualSelector ? [50, 60] : [50],
  },
  modelMapping: null,
  source: {
    url: "https://download.se.com/files?p_Doc_Ref=CA909006NL&p_File_Ext=.PDF",
    revision: "CA909006E, Version 1.0, 02/08/2017",
    page: 74,
  },
  missingFields: ["regional-availability", "verified-switching-model-mapping"],
  readiness: "inventory-and-diagram-only",
}));

export const rm17Relays = (
  [
    ["RM17TG00", 480, 1, 13, []],
    ["RM17TG20", 440, 2, 13, []],
    ["RM17TT00", 480, 1, 23, ["phase loss with voltage regeneration"]],
    ["RM17TA00", 480, 1, 23, ["asymmetry"]],
    ["RM17TU00", 480, 1, 23, ["undervoltage"]],
    ["RM17TE00", 480, 1, 23, ["asymmetry", "under/overvoltage window"]],
  ] as const
).map(
  ([model, voltageMaxV, changeoverContacts, page, additionalFunctions]) => ({
    id: `schneider-electric:${model.toLowerCase()}`,
    manufacturer: "Schneider Electric",
    model,
    orderCode: model,
    category: "monitoring-and-sensors" as const,
    function: "phase-monitoring-relay" as const,
    connection: "ac" as const,
    terminals: [
      ...["L1", "L2", "L3"].map((group) => ({
        id: group.toLowerCase(),
        group,
        interface: "ac-sense",
        connector: "screw terminal",
      })),
      ...Array.from({ length: changeoverContacts }, (_, contact) =>
        [
          [1, "common"],
          [2, "normally-closed"],
          [4, "normally-open"],
        ].map(([offset, kind]) => {
          const group = `${contact + 1}${offset}`;
          return {
            id: group,
            group,
            interface: `relay-${kind}`,
            connector: "screw terminal",
          };
        }),
      ).flat(),
    ],
    ratings: {
      voltageMinV: 208,
      voltageMaxV,
      changeoverContacts,
      catalogueContactCurrentA: 5,
    },
    conditions: {
      measurement: "three-phase AC",
      functions: ["phase sequence", "phase loss", ...additionalFunctions],
      terminalSourcePage: page === 23 ? 20 : 13,
    },
    modelMapping: null,
    source: {
      url: "https://download.se.com/files?p_Doc_Ref=DIA5ED2160501EN&p_File_name=DIA5ED2160501EN.pdf",
      revision: "DIA5ED2160501EN",
      page,
    },
    missingFields: [
      "verified-monitoring-model-mapping",
      "contact-current-by-load-category",
    ],
    readiness: "inventory-and-diagram-only",
  }),
);

// LIN2100, section B, p. B-2. Each single-pole block has one common node.
export const linergyDsBlocks = (
  [
    [
      "LGY112510",
      125,
      25,
      4.2,
      [
        [2, 9.5],
        [2, 7.5],
        [6, 5.8],
      ],
    ],
    [
      "LGY116013",
      160,
      36,
      8.4,
      [
        [2, 12],
        [3, 7.5],
        [8, 5.8],
      ],
    ],
    [
      "LGY125014",
      250,
      60,
      14.4,
      [
        [1, 15.3],
        [1, 10],
        [4, 6],
        [8, 7.5],
      ],
    ],
  ] as const
).map(([model, ratedCurrentA, ipkKA, icwKA, holes]) => ({
  id: `schneider-electric:${model.toLowerCase()}`,
  manufacturer: "Schneider Electric",
  model,
  orderCode: model,
  category: "busbars-and-distribution-systems" as const,
  function: "single-pole-distribution-block" as const,
  connection: "ac" as const,
  terminals: holes.flatMap(([count, diameterMm], row) =>
    Array.from({ length: count }, (_, index) => ({
      id: `hole-${row + 1}-${index + 1}`,
      group: "pole-1",
      interface: "ac-line",
      connector: `Ø ${diameterMm} mm screw terminal`,
    })),
  ),
  ratings: { ratedCurrentA, poles: 1, ipkKA, icwKA },
  conditions: { icwDurationSeconds: 1, icwStandard: "IEC/EN 60947-7-1" },
  modelMapping: null,
  source: {
    url: "https://download.se.com/files?p_Doc_Ref=LVYED213001EN&p_File_name=LVYED213001EN_V7.0_Linergy_Catalog.pdf",
    revision: "LIN2100, Version 9.0, 25/09/2026",
    page: 2,
    pageLabel: "B-2",
  },
  missingFields: ["verified-distribution-model-mapping"],
  readiness: "inventory-and-diagram-only",
}));

export const linergyEarthBars = (
  [
    ["LVS04200", 450, 40],
    ["LVS04201", 450, 0],
    ["LVS04202", 200, 20],
  ] as const
).map(([model, lengthMm, jumpers]) => ({
  id: `schneider-electric:${model.toLowerCase()}`,
  manufacturer: "Schneider Electric",
  model,
  orderCode: model,
  category: "earthing-and-bonding-equipment" as const,
  function: "protective-earth-bar" as const,
  connection: "bond" as const,
  terminals: [
    {
      id: "main",
      group: "pe",
      interface: "protective-bond",
      connector: "16–35 mm² terminal",
    },
    ...Array.from({ length: jumpers }, (_, index) => ({
      id: `jumper-${index + 1}`,
      group: "pe",
      interface: "protective-bond",
      connector: "2.5–16 mm² jumper",
    })),
  ],
  ratings: { lengthMm, jumpers, icwKA: 9 },
  conditions: { icwDurationSeconds: 0.5, icwBasis: "rms" },
  modelMapping: null,
  source: {
    url: "https://download.se.com/files?p_Doc_Ref=DESW025EN&p_File_name=DESW025EN_V19_PrismaSeT+G_Catalog.pdf",
    revision: "150E5300, Version 21.0, 29/09/2026",
    page: 22,
    pageLabel: "D-22",
  },
  missingFields: ["verified-bonding-model-mapping"],
  readiness: "inventory-and-diagram-only",
}));

// Phaseo selection table, single-secondary ABL6TS columns B–E.
const abl6Ratings = [
  [25, "02"],
  [40, "04"],
  [63, "06"],
  [100, "10"],
  [160, "16"],
  [250, "25"],
  [400, "40"],
  [630, "63"],
  [1000, "100"],
  [1600, "160"],
  [2500, "250"],
] as const;
const phaseoCatalogue = {
  url: "https://iportal.se.com/Contents/docs/TRANSFORMERS%20PHASEO%20ABT7%2C%20ABL6%20-%20230%20V%20TO%20400%20V%20-%2025%20VA%20TO%202500%20VA.PDF",
  revision: "Phaseo ABT7/ABL6 transformer catalogue",
};
const phaseoPrimary = ["400", "230", "-15", "0", "+15"].map(
  (marking, index) => ({
    id: `primary-${index + 1}`,
    group: `primary ${marking} V`,
    interface: "transformer-primary",
    connector: "screw terminal",
  }),
);

export const abl6Transformers = (
  [
    ["J", 12],
    ["B", 24],
    ["G", 115],
    ["U", 230],
  ] as const
).flatMap(([suffix, secondaryV]) =>
  abl6Ratings
    .slice(0, suffix === "J" ? 6 : abl6Ratings.length)
    .map(([apparentVA, code]) => {
      const model = `ABL6TS${code}${suffix}`;
      return {
        id: `schneider-electric:${model.toLowerCase()}`,
        manufacturer: "Schneider Electric",
        model,
        orderCode: model,
        category: "transformers" as const,
        function: "single-phase-control-transformer" as const,
        connection: "ac" as const,
        terminals: [
          ...phaseoPrimary,
          ...[String(secondaryV), "0"].map((marking, index) => ({
            id: `secondary-${index + 1}`,
            group: `secondary ${marking} V`,
            interface: "transformer-secondary",
            connector: "screw terminal",
          })),
        ],
        ratings: { apparentVA, primaryV: [230, 400], secondaryV },
        conditions: {
          frequencyHz: [50, 60],
          ambientRatingC: 50,
          primaryTapAdjustmentV: 15,
        },
        modelMapping: null,
        source: {
          ...phaseoCatalogue,
          page: 10,
        },
        missingFields: [
          "regional-availability",
          "verified-transformer-model-mapping",
          "model-specific-bonding-terminal-review",
        ],
        readiness: "inventory-and-diagram-only",
      };
    }),
);

export const abt7pduTransformers = (
  [
    ["B", 24],
    ["G", 115],
  ] as const
).flatMap(([suffix, secondaryV]) =>
  [
    ...abl6Ratings.slice(suffix === "B" ? 1 : 0, 6),
    [320, "32"] as const,
    ...abl6Ratings.slice(6),
  ].map(([apparentVA, code]) => {
    const model = `ABT7PDU${code.padStart(3, "0")}${suffix}`;
    return {
      id: `schneider-electric:${model.toLowerCase()}`,
      manufacturer: "Schneider Electric",
      model,
      orderCode: model,
      category: "transformers" as const,
      function: "single-phase-control-transformer" as const,
      connection: "ac" as const,
      terminals: [
        ...phaseoPrimary,
        ...[1, 2].flatMap((winding) =>
          ["start", "end"].map((end) => ({
            id: `secondary-${winding}-${end}`,
            group: `secondary ${winding} ${end}`,
            interface: "transformer-secondary",
            connector: "secondary winding connection",
          })),
        ),
      ],
      ratings: {
        apparentVA,
        primaryV: [230, 400],
        secondaryV,
        secondaryWindings: 2,
      },
      conditions: {
        frequencyHz: [50, 60],
        primaryTapAdjustmentV: 15,
        jumperPlacement: apparentVA <= 320 ? "internal" : "external",
      },
      modelMapping: null,
      source: { ...phaseoCatalogue, page: 11 },
      missingFields: [
        "regional-availability",
        "verified-transformer-model-mapping",
        "model-specific-bonding-terminal-review",
      ],
      readiness: "inventory-and-diagram-only",
    };
  }),
);

export const victronAgmSuperCycle = (
  [
    ["BAT412015081", 13, 14, 15, "M5"],
    ["BAT412025081", 22, 24, 25, "M5"],
    ["BAT412038081", 34, 36, 38, "M5"],
    ["BAT412060082", 52, 56, 60, "M6"],
    ["BAT412110081", 82, 90, 100, "M6"],
    ["BAT412112081", 105, 114, 125, "M8"],
    ["BAT412117081", 145, 153, 170, "M8"],
    ["BAT412123081", 200, 210, 230, "M8"],
  ] as const
).map(([model, c5Ah, c10Ah, c20Ah, insert]) => ({
  id: `victron-energy:${model.toLowerCase()}`,
  manufacturer: "Victron Energy",
  model,
  orderCode: model,
  category: "batteries-and-storage-systems" as const,
  function: "agm-storage-battery" as const,
  connection: "dc-storage" as const,
  terminals: ["positive", "negative"].map((polarity) => ({
    id: polarity,
    group: `dc-${polarity}`,
    interface: `battery-${polarity}`,
    connector: `${insert} insert`,
  })),
  ratings: { nominalV: 12, c5Ah, c10Ah, c20Ah },
  conditions: { dischargeCutoffV: 10.8, chemistry: "AGM lead-acid" },
  modelMapping: null,
  source: {
    url: "https://www.victronenergy.com/upload/documents/Datasheet-AGM-Super-Cycle-battery-EN.pdf",
    revision: "AGM Super Cycle specifications, BAT412060082 table variant",
    page: 1,
  },
  missingFields: ["verified-storage-model-mapping"],
  readiness: "inventory-and-diagram-only",
}));

export const apcSmvUps = (
  [
    ["SMV750CAI", 750, 525, "IEC C14", 3],
    ["SMV1000CAI", 1000, 700, "IEC C14", 3],
    ["SMV1500CAI", 1500, 1050, "IEC C14", 3],
    ["SMV2000CAI", 2000, 1400, "IEC C14", 4],
    ["SMV3000CAI", 3000, 2100, "IEC C20", 4],
  ] as const
).map(([model, outputVA, outputW, inlet, page]) => ({
  id: `apc:${model.toLowerCase()}`,
  manufacturer: "APC by Schneider Electric",
  model,
  orderCode: model,
  category: "ups-and-backup-systems" as const,
  function: "line-interactive-ups" as const,
  connection: "ac" as const,
  terminals: [
    {
      id: "ac-input",
      group: "mains input",
      interface: "ups-ac-input",
      connector: inlet,
    },
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `outlet-${i + 1}`,
      group: "battery-backed AC output",
      interface: "ups-ac-output",
      connector: "IEC C13",
    })),
  ],
  ratings: { outputVA, outputW, inputNominalV: 230, outputNominalV: 230 },
  conditions: {
    inputFrequencyHz: [50, 60],
    typicalTransferTimeMs: [2, 6],
    batteryModeWaveform: "sine wave",
  },
  modelMapping: null,
  source: {
    url: "https://download.se.com/files?p_Doc_Ref=SPD_JVAN-BCEQ6P_EN",
    revision: "SPD_JVAN-BCEQ6P_EN, August 2024",
    page,
  },
  missingFields: [
    "verified-ups-model-mapping",
    "battery-and-dry-contact-pinouts",
  ],
  readiness: "inventory-and-diagram-only",
}));

// The manufacturer's article-number key defines the DC voltage and outlet suffix.
const veDirect230Rows = (
  [
    [250, "1251", 250, 200, "10"],
    [375, "1371", 375, 300, "10"],
    [500, "1501", 450, 380, "10"],
    [800, "1801", 800, 650, "10"],
    [1200, "2121", 1150, 1000, "10"],
    [1600, "2161", 1450, 1300, "00"],
  ] as const
).map(([size, code, continuousW25C, continuousW40C, revisionCode]) => ({
  size,
  continuousW25C,
  continuousW40C,
  variants: [
    "IEC-320",
    "Schuko (CEE 7/4)",
    "AU/NZ (AS/NZS 3112)",
    "UK (BS 1363)",
  ].map((outlet, index) => ({
    outlet,
    code: `${code}${index + 1}${revisionCode}`,
  })),
}));

const veDirect120Rows = (
  [
    [250, 250, 200, "1250500", "1250510"],
    [375, 375, 300, "1370500", "1370510"],
    [500, 460, 380, "1500500", "1500510"],
    [800, 800, 650, "1800520", "1800530"],
    [1200, 1200, 1100, "2122520", "2122530"],
    [1600, 1500, 1350, "2161500", "2161510"],
  ] as const
).map(([size, continuousW25C, continuousW40C, nema, gfci]) => ({
  size,
  continuousW25C,
  continuousW40C,
  variants: [
    { outlet: "NEMA 5-15R", code: nema },
    { outlet: "GFCI", code: gfci },
  ],
}));

function veDirectRecords(
  rows: typeof veDirect230Rows | typeof veDirect120Rows,
  outputNominalV: 120 | 230,
) {
  return rows.flatMap(({ size, continuousW25C, continuousW40C, variants }) =>
    variants.flatMap(({ outlet, code }) =>
      ([12, 24, 48] as const).map((inputNominalV) => {
        const model = `PIN${inputNominalV}${code}`;
        return {
          id: `victron-energy:${model.toLowerCase()}`,
          manufacturer: "Victron Energy",
          model,
          orderCode: model,
          category: "inverters-and-conversion-equipment" as const,
          function: "standalone-dc-ac-inverter" as const,
          connection: "dc-ac" as const,
          terminals: [
            {
              id: "dc-positive",
              group: "DC +",
              interface: "inverter-dc-input",
              connector: "screw terminal",
            },
            {
              id: "dc-negative",
              group: "DC −",
              interface: "inverter-dc-input",
              connector: "screw terminal",
            },
            {
              id: "ac-outlet",
              group: "AC output",
              interface: "inverter-ac-output",
              connector: outlet,
            },
          ],
          ratings: {
            size,
            inputNominalV,
            outputNominalV,
            continuousW25C,
            continuousW40C,
          },
          conditions: {
            outputFrequencyHz: outputNominalV === 120 ? [60] : [50, 60],
            inputRangeV: { 12: [9.2, 17], 24: [18.4, 34], 48: [36.8, 62] }[
              inputNominalV
            ],
          },
          modelMapping: null,
          source:
            outputNominalV === 120
              ? {
                  url: "https://www.victronenergy.com/upload/documents/Datasheet-Inverter-VE.Direct-250W-1600W-120V-EN-.pdf",
                  revision:
                    "VE.Direct 120 V datasheet, PINxx1250500 article generation",
                  page: 2,
                }
              : {
                  url: "https://www.victronenergy.com/upload/documents/Datasheet-Inverter-VE.Direct-250W-1600W-230V-EN.pdf",
                  revision:
                    "VE.Direct 230 V datasheet, PINxx1251X10 article generation",
                  page: 2,
                },
          missingFields: [
            "regional-availability",
            "verified-inverter-model-mapping",
          ],
          readiness: "inventory-and-diagram-only",
        };
      }),
    ),
  );
}

export const victronVeDirect230 = veDirectRecords(veDirect230Rows, 230);
export const victronVeDirect120 = veDirectRecords(veDirect120Rows, 120);

export const evlinkHomeStations = ["S", "A"].flatMap((series) =>
  (
    [
      ["03", 3.7, 16, 1],
      ["07", 7.4, 32, 1],
      ["11", 11, 16, 3],
    ] as const
  ).flatMap(([code, powerKW, ratedCurrentA, phases]) =>
    ["N2", "NC"].map((outlet) => {
      const model = `EVH4${series}${code}${outlet}`;
      const supply = phases === 3 ? ["L1", "L2", "L3", "N"] : ["L1", "N"];
      return {
        id: `schneider-electric:${model.toLowerCase()}`,
        manufacturer: "Schneider Electric",
        model,
        orderCode: model,
        category: "ev-charging-equipment" as const,
        function: "ac-ev-charging-station" as const,
        connection: "ac" as const,
        terminals: [
          ...supply.map((group) => ({
            id: group.toLowerCase(),
            group,
            interface: "evse-ac-input",
            connector: "ring terminal",
          })),
          {
            id: "pe",
            group: "PE",
            interface: "evse-protective-earth",
            connector: "ring terminal",
          },
          {
            id: "vehicle",
            group: "Vehicle",
            interface: "evse-type-2",
            connector: outlet === "N2" ? "Type 2 socket" : "Type 2 cable (5 m)",
          },
        ],
        ratings: { powerKW, ratedCurrentA, phases, rdcDdMilliamp: 6 },
        conditions: {
          series: series === "S" ? "EVlink Home" : "EVlink Home Smart",
        },
        modelMapping: null,
        source: {
          url: "https://download.se.com/files?p_Doc_Ref=GEX4292700_EN&p_File_Name=FBC_GEX4292700-01_EN_V9_HD.pdf&p_enDocType=Instruction+sheet",
          revision: "GEX4292700-03_EN (08/2023)",
          page: 5,
          pageLabel: "4–5, 8–9",
        },
        missingFields: ["verified-evse-model-mapping"],
        readiness: "inventory-and-diagram-only",
      };
    }),
  ),
);

export const componentBank = [
  ...pvModules,
  ...ic60nBreakers,
  ...iidRccbs,
  ...iswSwitches,
  ...iemMeters,
  ...ictContactors,
  ...ic60hBreakers,
  ...ic60lBreakers,
  ...rm17Relays,
  ...linergyDsBlocks,
  ...linergyEarthBars,
  ...abl6Transformers,
  ...abt7pduTransformers,
  ...victronAgmSuperCycle,
  ...apcSmvUps,
  ...victronVeDirect230,
  ...victronVeDirect120,
  ...evlinkHomeStations,
];

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
