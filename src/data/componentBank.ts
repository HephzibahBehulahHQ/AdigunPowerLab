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

export const phoenixPtPeTerminals = (
  [
    [
      "PT 1,5/S-PE",
      "3208139",
      1.5,
      6,
      "2026-11-09",
      "en-de/products/ground-terminal-pt-15-s-pe-3208139",
    ],
    [
      "PT 2,5-PE",
      "3209536",
      2.5,
      6,
      "2026-06-04",
      "en-us/products/ground-terminal-block-pt-25-pe-3209536",
    ],
    [
      "PT 4-PE",
      "3211766",
      4,
      8,
      "2026-11-10",
      "en-de/products/ground-terminal-pt-4-pe-3211766",
    ],
    [
      "PT 6-PE",
      "3211822",
      6,
      8,
      "2026-11-06",
      "en-gb/products/ground-terminal-block-pt-6-pe-3211822",
    ],
    [
      "PT 10-PE",
      "3212131",
      10,
      8,
      "2026-11-05",
      "en-pc/products/ground-modular-terminal-block-pt-10-pe-3212131",
    ],
    [
      "PT 2,5/S-QUATTRO-PE",
      "3211025",
      2.5,
      6,
      "2026-05-23",
      "en-us/products/ground-terminal-block-pt-25s-quattro-pe-3211025",
      4,
    ],
    [
      "PT 2,5-QUATTRO-PE",
      "3209594",
      2.5,
      8,
      "2026-10-13",
      "en-de/products/ground-terminal-pt-25-quattro-pe-3209594",
      4,
    ],
  ] as const
).map(
  ([
    model,
    orderCode,
    crossSectionMm2,
    ratedSurgeKV,
    date,
    path,
    clampCount = 2,
  ]) => ({
    id: `phoenix-contact:${orderCode}`,
    manufacturer: "Phoenix Contact",
    model,
    orderCode,
    category: "earthing-and-bonding-equipment" as const,
    function: "protective-earth-terminal-block" as const,
    connection: "bond" as const,
    terminals: [
      ...Array.from({ length: clampCount }, (_, index) => ({
        id: `clamp-${index + 1}`,
        group: "pe",
        interface: "protective-bond",
        connector: "push-in clamp",
      })),
      {
        id: "rail-foot",
        group: "pe",
        interface: "protective-bond",
        connector: "conductive DIN-rail foot",
      },
    ],
    ratings: { crossSectionMm2, ratedSurgeKV },
    conditions: { connectionStandard: "IEC 60947-7-2" },
    modelMapping: null,
    source: {
      url: `https://www.phoenixcontact.com/${path}?type=pdf`,
      revision: `Phoenix Contact article data sheet (${date})`,
      page: 2,
    },
    missingFields: ["verified-bonding-model-mapping"],
    readiness: "inventory-and-diagram-only",
  }),
);

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

// Schneider DIA2ED2160311EN compact drive selection table, 200–240 V.
const altivar320Rows = [
  ["U02M2C", 0.18, 1.5],
  ["U04M2C", 0.37, 3.3],
  ["U06M2C", 0.55, 3.7],
  ["U07M2C", 0.75, 4.8],
  ["U11M2C", 1.1, 6.9],
  ["U15M2C", 1.5, 8],
  ["U22M2C", 2.2, 11],
  ["U02M3C", 0.18, 1.5],
  ["U04M3C", 0.37, 3.3],
  ["U06M3C", 0.55, 3.7],
  ["U07M3C", 0.75, 4.8],
  ["U11M3C", 1.1, 6.9],
  ["U15M3C", 1.5, 8],
  ["U22M3C", 2.2, 11],
  ["U30M3C", 3, 13.7],
  ["U40M3C", 4, 17.5],
  ["U55M3C", 5.5, 27.5],
  ["U75M3C", 7.5, 33],
  ["D11M3C", 11, 54],
  ["D15M3C", 15, 66],
] as const;

export const altivar320CompactDrives = altivar320Rows.map(
  ([suffix, motorKW, continuousOutputA]) => {
    const model = `ATV320${suffix}`;
    const singlePhase = suffix.endsWith("M2C");
    const supply = singlePhase ? ["R/L1", "S/L2/N"] : ["R/L1", "S/L2", "T/L3"];
    const terminals = [
      ...supply.map((group) => ({ group, interface: "drive-ac-input" })),
      ...["U/T1", "V/T2", "W/T3"].map((group) => ({
        group,
        interface: "drive-motor-output",
      })),
      { group: "PE", interface: "drive-protective-earth" },
    ].map(({ group, interface: terminalInterface }) => ({
      id: group.toLowerCase().replaceAll("/", "-"),
      group,
      interface: terminalInterface,
      connector: "power terminal",
    }));
    return {
      id: `schneider-electric:${model.toLowerCase()}`,
      manufacturer: "Schneider Electric",
      model,
      orderCode: model,
      category: "drives-and-starting-equipment" as const,
      function: "variable-speed-drive" as const,
      connection: "ac-ac" as const,
      terminals,
      ratings: {
        motorKW,
        continuousOutputA,
        supplyMinV: 200,
        supplyMaxV: 240,
        supplyPhases: singlePhase ? 1 : 3,
      },
      conditions: {
        supplyFrequencyHz: [50, 60],
        nominalSwitchingFrequencyKHz: 4,
        integratedEmcFilter: singlePhase,
      },
      modelMapping: null,
      source: {
        url: "https://download.se.com/files?filename=Catalog&p_Doc_Ref=DIA2ED2160311EN",
        revision: "DIA2ED2160311EN",
        page: 16,
        supplemental: [
          {
            url: "https://download.se.com/files?p_Doc_Ref=NVE41289&p_File_Name=ATV320_Installation_manual_EN_NVE41289_09.pdf&p_enDocType=User+guide",
            revision: "NVE41289.09 (04/2025)",
            page: 144,
          },
        ],
      },
      missingFields: [
        "drive-auxiliary-terminals",
        "verified-drive-model-mapping",
      ],
      readiness: "inventory-and-diagram-only",
    };
  },
);

// LAPP's listed article codes, from the manufacturer variant table.
const olflexClassic110Rows = [
  ["1119003", "3G0,5", 3, true, 0.5, 0.201, 6],
  ["1119004", "4G0,5", 4, true, 0.5, 0.224, 6],
  ["1119005", "5G0,5", 5, true, 0.5, 0.244, 6],
  ["1119007", "7G0,5", 7, true, 0.5, 0.264, 6],
  ["1119010", "10G0,5", 10, true, 0.5, 0.339, 6],
  ["1119012", "12G0,5", 12, true, 0.5, 0.35, 6],
  ["1119014", "14G0,5", 14, true, 0.5, 0.374, 6],
  ["1119018", "18G0,5", 18, true, 0.5, 0.413, 6],
  ["1119021", "21G0,5", 21, true, 0.5, 0.461, 6],
  ["1119025", "25G0,5", 25, true, 0.5, 0.488, 6],
  ["1119030", "30G0,5", 30, true, 0.5, 0.524, 6],
  ["1119035", "35G0,5", 35, true, 0.5, 0.571, 6],
  ["1119040", "40G0,5", 40, true, 0.5, 0.606, 6],
  ["1119052", "52G0,5", 52, true, 0.5, 0.681, 6],
  ["1119061", "61G0,5", 61, true, 0.5, 0.728, 6],
  ["1119065", "65G0,5", 65, true, 0.5, 0.772, 6],
  ["1119080", "80G0,5", 80, true, 0.5, 0.831, 6],
  ["1119100", "100G0,5", 100, true, 0.5, 0.929, 6],
  ["1119103", "3G0,75", 3, true, 0.75, 0.224, 6],
  ["1119104", "4G0,75", 4, true, 0.75, 0.244, 6],
  ["1119105", "5G0,75", 5, true, 0.75, 0.264, 6],
  ["1119107", "7G0,75", 7, true, 0.75, 0.287, 6],
  ["1119109", "9G0,75", 9, true, 0.75, 0.37, 6],
  ["1119110", "10G0,75", 10, true, 0.75, 0.378, 6],
  ["1119112", "12G0,75", 12, true, 0.75, 0.39, 6],
  ["1119115", "15G0,75", 15, true, 0.75, 0.429, 6],
  ["1119116", "16G0,75", 16, true, 0.75, 0.437, 6],
  ["1119117", "15X0,75", 15, false, 0.75, 0.429, 6],
  ["1119118", "18G0,75", 18, true, 0.75, 0.461, 6],
  ["1119121", "21G0,75", 21, true, 0.75, 0.512, 6],
  ["1119125", "25G0,75", 25, true, 0.75, 0.543, 7],
  ["1119126", "26G0,75", 26, true, 0.75, 0.559, 7],
  ["1119134", "34G0,75", 34, true, 0.75, 0.626, 7],
  ["1119141", "41G0,75", 41, true, 0.75, 0.685, 7],
  ["1119150", "50G0,75", 50, true, 0.75, 0.756, 7],
  ["1119151", "51G0,75", 51, true, 0.75, 0.756, 7],
  ["1119161", "61G0,75", 61, true, 0.75, 0.807, 7],
  ["1119165", "65G0,75", 65, true, 0.75, 0.858, 7],
  ["1119180", "80G0,75", 80, true, 0.75, 0.929, 7],
  ["1119200", "100G0,75", 100, true, 0.75, 1.039, 7],
  ["1119203", "3G1", 3, true, 1, 0.236, 7],
  ["1119204", "4G1", 4, true, 1, 0.256, 7],
  ["1119205", "5G1", 5, true, 1, 0.28, 7],
  ["1119206", "6G1", 6, true, 1, 0.315, 7],
  ["1119207", "7G1", 7, true, 1, 0.315, 7],
  ["1119208", "8G1", 8, true, 1, 0.374, 7],
  ["1119209", "9G1", 9, true, 1, 0.394, 7],
  ["1119210", "10G1", 10, true, 1, 0.402, 7],
  ["1119212", "12G1", 12, true, 1, 0.413, 7],
  ["1119214", "14G1", 14, true, 1, 0.441, 7],
  ["1119216", "16G1", 16, true, 1, 0.465, 7],
  ["1119218", "18G1", 18, true, 1, 0.5, 7],
  ["1119220", "20G1", 20, true, 1, 0.528, 7],
  ["1119225", "25G1", 25, true, 1, 0.579, 7],
  ["1119226", "26G1", 26, true, 1, 0.594, 7],
  ["1119234", "34G1", 34, true, 1, 0.673, 7],
  ["1119236", "36G1", 36, true, 1, 0.685, 7],
  ["1119241", "41G1", 41, true, 1, 0.74, 7],
  ["1119250", "50G1", 50, true, 1, 0.811, 7],
  ["1119256", "56G1", 56, true, 1, 0.843, 7],
  ["1119261", "61G1", 61, true, 1, 0.87, 8],
  ["1119265", "65G1", 65, true, 1, 0.929, 8],
  ["1119280", "80G1", 80, true, 1, 0.996, 8],
  ["1119300", "100G1", 100, true, 1, 1.114, 8],
  ["1119303", "3G1,5", 3, true, 1.5, 0.264, 8],
  ["1119304", "4G1,5", 4, true, 1.5, 0.283, 8],
  ["1119305", "5G1,5", 5, true, 1.5, 0.319, 8],
  ["1119306", "6G1,5", 6, true, 1.5, 0.35, 8],
  ["1119307", "7G1,5", 7, true, 1.5, 0.35, 8],
  ["1119308", "8G1,5", 8, true, 1.5, 0.417, 8],
  ["1119309", "9G1,5", 9, true, 1.5, 0.449, 8],
  ["1119310", "10G1,5", 10, true, 1.5, 0.457, 8],
  ["1119311", "11G1,5", 11, true, 1.5, 0.457, 8],
  ["1119312", "12G1,5", 12, true, 1.5, 0.472, 8],
  ["1119313", "8X1,5", 8, false, 1.5, 0.417, 8],
  ["1119314", "14G1,5", 14, true, 1.5, 0.5, 8],
  ["1119316", "16G1,5", 16, true, 1.5, 0.528, 8],
  ["1119318", "18G1,5", 18, true, 1.5, 0.567, 8],
  ["1119321", "21G1,5", 21, true, 1.5, 0.618, 8],
  ["1119325", "25G1,5", 25, true, 1.5, 0.665, 8],
  ["1119326", "26G1,5", 26, true, 1.5, 0.681, 8],
  ["1119332", "32G1,5", 32, true, 1.5, 0.736, 8],
  ["1119334", "34G1,5", 34, true, 1.5, 0.764, 8],
  ["1119341", "41G1,5", 41, true, 1.5, 0.839, 8],
  ["1119350", "50G1,5", 50, true, 1.5, 0.925, 8],
  ["1119361", "61G1,5", 61, true, 1.5, 0.992, 8],
  ["1119365", "65G1,5", 65, true, 1.5, 1.051, 8],
  ["1119403", "3G2,5", 3, true, 2.5, 0.319, 8],
  ["1119404", "4G2,5", 4, true, 2.5, 0.35, 8],
  ["1119405", "5G2,5", 5, true, 2.5, 0.394, 8],
  ["1119407", "7G2,5", 7, true, 2.5, 0.437, 9],
  ["1119412", "12G2,5", 12, true, 2.5, 0.583, 9],
  ["1119414", "14G2,5", 14, true, 2.5, 0.622, 9],
  ["1119418", "18G2,5", 18, true, 2.5, 0.701, 9],
  ["1119425", "25G2,5", 25, true, 2.5, 0.819, 9],
  ["1119434", "34G2,5", 34, true, 2.5, 0.961, 9],
  ["1119450", "50G2,5", 50, true, 2.5, 1.157, 9],
  ["1119503", "3G4", 3, true, 4, 0.39, 9],
  ["1119504", "4G4", 4, true, 4, 0.425, 9],
  ["1119505", "5G4", 5, true, 4, 0.476, 9],
  ["1119507", "7G4", 7, true, 4, 0.528, 9],
  ["1119511", "11G4", 11, true, 4, 0.693, 9],
  ["1119512", "12G4", 12, true, 4, 0.713, 9],
  ["1119603", "3G6", 3, true, 6, 0.461, 9],
  ["1119604", "4G6", 4, true, 6, 0.512, 9],
  ["1119605", "5G6", 5, true, 6, 0.571, 9],
  ["1119607", "7G6", 7, true, 6, 0.63, 9],
  ["1119613", "3G10", 3, true, 10, 0.575, 9],
  ["1119614", "4G10", 4, true, 10, 0.638, 9],
  ["1119615", "5G10", 5, true, 10, 0.713, 9],
  ["1119617", "7G10", 7, true, 10, 0.787, 9],
  ["1119624", "4G16", 4, true, 16, 0.74, 9],
  ["1119625", "5G16", 5, true, 16, 0.835, 9],
  ["1119627", "7G16", 7, true, 16, 0.921, 9],
  ["1119634", "4G25", 4, true, 25, 0.925, 9],
  ["1119635", "5G25", 5, true, 25, 1.039, 9],
  ["1119636", "7G25", 7, true, 25, 1.146, 9],
  ["1119644", "4G35", 4, true, 35, 1.039, 9],
  ["1119645", "5G35", 5, true, 35, 1.165, 9],
  ["1119752", "2X0,5", 2, false, 0.5, 0.189, 9],
  ["1119753", "3X0,5", 3, false, 0.5, 0.201, 10],
  ["1119754", "4X0,5", 4, false, 0.5, 0.224, 10],
  ["1119755", "5X0,5", 5, false, 0.5, 0.244, 10],
  ["1119757", "7X0,5", 7, false, 0.5, 0.264, 10],
  ["1119802", "2X0,75", 2, false, 0.75, 0.213, 10],
  ["1119803", "3X0,75", 3, false, 0.75, 0.224, 10],
  ["1119804", "4X0,75", 4, false, 0.75, 0.244, 10],
  ["1119805", "5X0,75", 5, false, 0.75, 0.264, 10],
  ["1119807", "7X0,75", 7, false, 0.75, 0.287, 10],
  ["1119812", "12X0,75", 12, false, 0.75, 0.39, 10],
  ["1119852", "2X1", 2, false, 1, 0.224, 10],
  ["1119853", "3X1", 3, false, 1, 0.236, 10],
  ["1119854", "4X1", 4, false, 1, 0.256, 10],
  ["1119855", "5X1", 5, false, 1, 0.28, 10],
  ["1119857", "7X1", 7, false, 1, 0.315, 10],
  ["1119862", "12X1", 12, false, 1, 0.413, 10],
  ["1119870", "20X1", 20, false, 1, 0.528, 10],
  ["1119902", "2X1,5", 2, false, 1.5, 0.248, 10],
  ["1119903", "3X1,5", 3, false, 1.5, 0.264, 10],
  ["1119904", "4X1,5", 4, false, 1.5, 0.283, 10],
  ["1119905", "5X1,5", 5, false, 1.5, 0.319, 10],
  ["1119907", "7X1,5", 7, false, 1.5, 0.35, 10],
  ["1119952", "2X2,5", 2, false, 2.5, 0.295, 10],
] as const;

export const olflexClassic110Cables = olflexClassic110Rows.map(
  ([
    orderCode,
    designation,
    coreCount,
    hasPe,
    crossSectionMm2,
    outerDiameterIn,
    page,
  ]) => {
    // Each physical core has two ends in the same conductive node group.
    const conductors = [
      ...Array.from({ length: coreCount - Number(hasPe) }, (_, index) =>
        String(index + 1),
      ),
      ...(hasPe ? ["PE"] : []),
    ];
    return {
      id: `lapp:${orderCode}`,
      manufacturer: "LAPP",
      model: `ÖLFLEX CLASSIC 110 ${designation}`,
      orderCode,
      category: "cables-and-conductors" as const,
      function: "multicore-control-cable" as const,
      connection: "passive" as const,
      terminals: conductors.flatMap((group) =>
        ["a", "b"].map((end) => ({
          id: `${end}-${group.toLowerCase()}`,
          group,
          interface: group === "PE" ? "cable-pe-core" : "cable-numbered-core",
          connector: "conductor end",
        })),
      ),
      ratings: {
        coreCount,
        crossSectionMm2,
        outerDiameterIn,
        hasPe,
        nominalU0V: 300,
        nominalUV: 500,
        coreToCoreTestVAc: 4000,
      },
      conditions: { electricalReferenceTemperatureC: 20 },
      modelMapping: null,
      source: {
        url: "https://api-shop.lapp.com/occ/v2/us/products/export/specification-sheet-file/1119110?curr=USD&lang=en_US",
        revision: "LAPP article information (2026-11-23)",
        page,
        supplemental: [
          {
            url: "https://dam-media.lapp.com/8/890/89092/e1ef96b290e041bbaf3de1e47b051875.pdf",
            revision: "DB1119752EN v12 (2023-03-03)",
            page: 1,
          },
        ],
      },
      missingFields: [
        "cable-ampacity-and-impedance",
        "verified-cable-model-mapping",
      ],
      readiness: "inventory-and-diagram-only",
    };
  },
);

const olflexClassic110CySource =
  "https://products.lappgroup.com/online-catalogue/power-and-control-cables/various-applications/pvc-outer-sheath-and-numbered-cores/oelflex-classic-110-cy.html?format=pdf";

// Article table columns include the physical PDF page for each row.
const olflexClassic110CyRows = [
  ["1135628", 5, "G", 35, 33.2, 1901, 2710, 3],
  ["1135752", 2, "X", 0.5, 7, 41, 75, 3],
  ["1135003", 3, "G", 0.5, 7.3, 45.5, 83, 3],
  ["1135753", 3, "X", 0.5, 7.3, 45.5, 83, 3],
  ["1135004", 4, "G", 0.5, 7.9, 55, 99, 3],
  ["1135754", 4, "X", 0.5, 7.9, 55, 99, 3],
  ["1135005", 5, "G", 0.5, 8.4, 66, 112, 3],
  ["1135755", 5, "X", 0.5, 8.4, 66, 112, 3],
  ["1135007", 7, "G", 0.5, 8.9, 80.5, 132, 3],
  ["1135757", 7, "X", 0.5, 8.9, 80.5, 132, 3],
  ["1135012", 12, "G", 0.5, 11.3, 138.5, 202, 3],
  ["1135762", 12, "X", 0.5, 11.3, 138.5, 202, 3],
  ["1135018", 18, "G", 0.5, 13.3, 156.4, 289, 3],
  ["1135025", 25, "G", 0.5, 15.2, 250, 378, 3],
  ["1135030", 30, "G", 0.5, 16.1, 297, 429, 3],
  ["1135040", 40, "G", 0.5, 18.2, 343, 542, 3],
  ["1135802", 2, "X", 0.75, 7.4, 46, 86, 3],
  ["1135103", 3, "G", 0.75, 7.9, 57.9, 100, 3],
  ["1135803", 3, "X", 0.75, 7.9, 57.9, 100, 3],
  ["1135104", 4, "G", 0.75, 8.4, 64, 115, 3],
  ["1135804", 4, "X", 0.75, 8.4, 64, 115, 3],
  ["1135105", 5, "G", 0.75, 8.9, 77.4, 130, 3],
  ["1135805", 5, "X", 0.75, 8.9, 77.4, 130, 3],
  ["1135107", 7, "G", 0.75, 9.7, 102, 161, 3],
  ["1135807", 7, "X", 0.75, 9.7, 102, 161, 3],
  ["1135112", 12, "G", 0.75, 12.3, 177, 247, 3],
  ["1135812", 12, "X", 0.75, 12.3, 177, 247, 3],
  ["1135118", 18, "G", 0.75, 14.5, 243, 356, 3],
  ["1135818", 18, "X", 0.75, 14.5, 243, 356, 3],
  ["1135125", 25, "G", 0.75, 16.6, 307.3, 465, 3],
  ["1135134", 34, "G", 0.75, 18.9, 323.2, 601, 3],
  ["1135840", 40, "X", 0.75, 20.5, 369.4, 734, 3],
  ["1135141", 41, "G", 0.75, 20.6, 488, 728, 3],
  ["1135852", 2, "X", 1, 7.9, 56, 98, 4],
  ["1135203", 3, "G", 1, 8.2, 65.3, 111, 4],
  ["1135853", 3, "X", 1, 8.2, 65.3, 111, 4],
  ["1135204", 4, "G", 1, 8.7, 78.1, 130, 4],
  ["1135854", 4, "X", 1, 8.7, 78.1, 130, 4],
  ["1135205", 5, "G", 1, 9.5, 89.4, 153, 4],
  ["1135207", 7, "G", 1, 10.2, 113.3, 185, 4],
  ["1135212", 12, "G", 1, 13.3, 188.1, 307, 4],
  ["1135216", 16, "G", 1, 14.6, 216, 390, 4],
  ["1135218", 18, "G", 1, 15.5, 286, 418, 4],
  ["1135225", 25, "G", 1, 17.5, 388.5, 544, 4],
  ["1135234", 34, "G", 1, 20.3, 505, 738, 4],
  ["1135241", 41, "G", 1, 22, 578, 864, 4],
  ["1135250", 50, "G", 1, 23.8, 688, 1011, 4],
  ["1135902", 2, "X", 1.5, 8.5, 65, 117, 4],
  ["1135303", 3, "G", 1.5, 8.9, 83, 136, 4],
  ["1135903", 3, "X", 1.5, 8.9, 83, 136, 4],
  ["1135304", 4, "G", 1.5, 9.6, 100, 163, 4],
  ["1135904", 4, "X", 1.5, 9.6, 100, 163, 4],
  ["1135305", 5, "G", 1.5, 10.3, 125, 188, 4],
  ["1135905", 5, "X", 1.5, 10.3, 125, 188, 4],
  ["1135307", 7, "G", 1.5, 11.3, 149, 237, 4],
  ["1135907", 7, "X", 1.5, 11.3, 149, 237, 4],
  ["1135312", 12, "G", 1.5, 14.8, 280, 393, 4],
  ["1135318", 18, "G", 1.5, 17.2, 389, 538, 4],
  ["1135325", 25, "G", 1.5, 20.1, 535, 745, 4],
  ["1135334", 34, "G", 1.5, 22.8, 702, 964, 4],
  ["1135341", 41, "G", 1.5, 24.7, 844.6, 1123, 4],
  ["1135350", 50, "G", 1.5, 27.1, 1006, 1372, 4],
  ["1135402", 2, "X", 2.5, 9.9, 112, 165, 4],
  ["1135403", 3, "G", 2.5, 10.3, 146, 192, 4],
  ["1135404", 4, "G", 2.5, 11.3, 167, 233, 4],
  ["1135405", 5, "G", 2.5, 12.6, 200, 283, 4],
  ["1135407", 7, "G", 2.5, 13.9, 288, 371, 4],
  ["1135412", 12, "G", 2.5, 17.6, 477.3, 585, 5],
  ["1135502", 2, "X", 4, 11.4, 120, 247, 5],
  ["1135504", 4, "G", 4, 13.4, 237, 347, 5],
  ["1135505", 5, "G", 4, 14.7, 280, 413, 5],
  ["1135602", 2, "X", 6, 13.6, 180, 353, 5],
  ["1135604", 4, "G", 6, 15.8, 318, 485, 5],
  ["1135605", 5, "G", 6, 17.3, 441, 702, 5],
  ["1135607", 7, "G", 6, 18.8, 530, 950, 5],
  ["1135702", 2, "X", 10, 16.4, 256, 492, 5],
  ["1135615", 3, "G", 10, 17.4, 362.4, 507, 5],
  ["1135614", 4, "G", 10, 19, 518, 735, 5],
  ["1135616", 5, "G", 10, 21.3, 595, 847, 5],
  ["1135617", 7, "G", 10, 23.2, 796, 1039, 5],
  ["1135622", 2, "X", 16, 18.6, 390, 698, 5],
  ["1135624", 4, "G", 16, 22.2, 804, 1395, 5],
  ["1135623", 5, "G", 16, 24.4, 935, 1440, 5],
  ["1135626", 4, "G", 25, 26.9, 1161, 1730, 5],
  ["1135627", 5, "G", 25, 30, 1400, 2090, 5],
  ["1135625", 4, "G", 35, 30.2, 1543, 2210, 5],
] as const;

type MetricLappRow =
  | (typeof olflexClassic110CyRows)[number]
  | (typeof olflexClassic100750Rows)[number]
  | (typeof olflexClassic100500Rows)[number]
  | (typeof olflexClassic110BlackRows)[number];

function metricLappCables(
  rows: readonly MetricLappRow[],
  family: {
    family: string;
    url: string;
    revision?: string;
    nominalU0V: number;
    nominalUV: number;
    shielded: boolean;
    numberedCores?: boolean;
  },
) {
  const revision = family.revision ?? "LAPP PN 0456 / 02_03.16 (2025-07-14)";
  const numberedCores = family.numberedCores ?? family.shielded;
  return rows.map(
    ([
      orderCode,
      coreCount,
      designation,
      crossSectionMm2,
      outerDiameterMm,
      copperKgPerKm,
      weightKgPerKm,
      page,
    ]) => {
      const hasPe = designation === "G";
      const conductors = [
        ...Array.from({ length: coreCount - Number(hasPe) }, (_, index) =>
          String(index + 1),
        ),
        ...(hasPe ? ["PE"] : []),
        ...(family.shielded ? ["Shield"] : []),
      ];
      return {
        id: `lapp:${orderCode}`,
        manufacturer: "LAPP",
        model: `${family.family} ${coreCount}${designation}${crossSectionMm2}`,
        orderCode,
        category: "cables-and-conductors" as const,
        function: "multicore-control-cable" as const,
        connection: "passive" as const,
        terminals: conductors.flatMap((group) =>
          ["a", "b"].map((end) => ({
            id: `${end}-${group.toLowerCase()}`,
            group,
            interface:
              group === "Shield"
                ? "cable-shield"
                : group === "PE"
                  ? "cable-pe-core"
                  : numberedCores
                    ? "cable-numbered-core"
                    : "cable-core",
            connector: group === "Shield" ? "braid end" : "conductor end",
          })),
        ),
        ratings: {
          coreCount,
          hasPe,
          crossSectionMm2,
          outerDiameterMm,
          copperKgPerKm,
          weightKgPerKm,
          nominalU0V: family.nominalU0V,
          nominalUV: family.nominalUV,
          testVoltageV: 4000,
        },
        conditions: family.shielded
          ? { shield: "tinned-copper braid" }
          : { coreIdentification: numberedCores ? "numbered" : "colour-coded" },
        modelMapping: null,
        source: {
          url: family.url,
          revision,
          page,
          supplemental: [
            {
              url: family.url,
              revision,
              page: 2,
            },
          ],
        },
        missingFields: [
          "cable-ampacity-and-impedance",
          "verified-cable-model-mapping",
          ...(numberedCores ? [] : ["article-core-colours"]),
        ],
        readiness: "inventory-and-diagram-only",
      };
    },
  );
}

export const olflexClassic110CyCables = metricLappCables(
  olflexClassic110CyRows,
  {
    family: "ÖLFLEX CLASSIC 110 CY",
    url: olflexClassic110CySource,
    nominalU0V: 300,
    nominalUV: 500,
    shielded: true,
  },
);

const olflexClassic100750Rows = [
  ["0010086", 2, "X", 2.5, 8.9, 48, 128, 3],
  ["0010087", 3, "G", 2.5, 9.6, 72, 162, 3],
  ["00100933", 3, "X", 2.5, 9.6, 72, 162, 3],
  ["00100883", 4, "G", 2.5, 10.7, 96, 203, 3],
  ["00100893", 5, "G", 2.5, 11.8, 120, 242, 3],
  ["0010091", 7, "G", 2.5, 13.1, 168, 321, 3],
  ["0010092", 8, "G", 2.5, 15.8, 192, 385, 3],
  ["0010100", 2, "X", 4, 10.4, 76.8, 187, 3],
  ["0010210", 3, "G", 4, 11.2, 115.2, 244, 3],
  ["00101013", 4, "G", 4, 12.5, 154, 297, 3],
  ["00101023", 5, "G", 4, 13.7, 192, 355, 3],
  ["0010103", 7, "G", 4, 15.2, 269, 471, 3],
  ["0010105", 3, "G", 6, 12.6, 173, 318, 3],
  ["00101063", 4, "G", 6, 13.8, 230, 394, 3],
  ["00101073", 5, "G", 6, 15.6, 288, 489, 3],
  ["0010108", 7, "G", 6, 17.3, 403, 651, 3],
  ["0010301", 3, "G", 10, 15.9, 288, 516, 3],
  ["00101093", 4, "G", 10, 17.6, 384, 650, 3],
  ["00101103", 5, "G", 10, 19.7, 480, 792, 3],
  ["0010111", 7, "G", 10, 21.7, 672, 1058, 3],
  ["0010302", 3, "G", 16, 18.3, 461, 728, 3],
  ["00101123", 4, "G", 16, 20.4, 614, 1087, 3],
  ["00101133", 5, "G", 16, 22.8, 768, 1118, 3],
  ["0010303", 3, "G", 25, 23, 720, 1388, 3],
  ["00101153", 4, "G", 25, 25.4, 960, 1582, 3],
  ["00101163", 5, "G", 25, 28.5, 1200, 1771, 3],
  ["0010304", 3, "G", 35, 25.6, 1008, 1766, 3],
  ["00101173", 4, "G", 35, 28.5, 1344, 2106, 3],
  ["00101183", 5, "G", 35, 31.9, 1680, 2635, 3],
  ["0010305", 3, "G", 50, 31, 1440, 2556, 3],
  ["00101193", 4, "G", 50, 34.5, 1920, 2943, 3],
  ["00103133", 5, "G", 50, 38.6, 2400, 3936, 3],
  ["0010306", 3, "G", 70, 35.3, 2016, 3182, 3],
  ["00101203", 4, "G", 70, 39.4, 2688, 4092, 4],
  ["00103143", 5, "G", 70, 44.1, 3360, 4800, 4],
  ["0010307", 3, "G", 95, 41.3, 2736, 4675, 4],
  ["00101213", 4, "G", 95, 45.8, 3648, 5290, 4],
  ["00103153", 5, "G", 95, 51.6, 4560, 5600, 4],
  ["0010308", 3, "G", 120, 47.6, 3456, 5626, 4],
  ["00103093", 4, "G", 120, 53.1, 4608, 6994, 4],
  ["00103113", 4, "G", 150, 57.4, 5760, 7500, 4],
  ["00103123", 4, "G", 185, 62.8, 7104, 8300, 4],
] as const;

export const olflexClassic100750Cables = metricLappCables(
  olflexClassic100750Rows,
  {
    family: "ÖLFLEX CLASSIC 100 450/750 V",
    url: "https://products.lappgroup.com/online-catalogue/power-and-control-cables/various-applications/pvc-outer-sheath-and-coloured-cores/oelflex-classic-100-450750-v.html?format=pdf",
    nominalU0V: 450,
    nominalUV: 750,
    shielded: false,
  },
);

const olflexClassic100500Rows = [
  ["00100004", 2, "X", 0.5, 4.8, 9.6, 35, 3],
  ["00100014", 3, "G", 0.5, 5.1, 14.4, 42, 3],
  ["00101224", 3, "X", 0.5, 5.1, 14.4, 42, 3],
  ["00100024", 4, "G", 0.5, 5.7, 19.2, 54, 3],
  ["00101234", 4, "X", 0.5, 5.7, 19.2, 54, 3],
  ["00100034", 5, "G", 0.5, 6.2, 24, 63, 3],
  ["00101244", 5, "X", 0.5, 6.2, 24, 63, 3],
  ["0010004", 6, "G", 0.5, 6.7, 28.8, 73, 3],
  ["0010005", 7, "G", 0.5, 6.7, 33.6, 81, 3],
  ["0010006", 8, "G", 0.5, 8, 38.4, 97, 3],
  ["0010007", 10, "G", 0.5, 8.6, 48, 116, 3],
  ["0010008", 12, "G", 0.5, 8.9, 58, 133, 3],
  ["0010009", 14, "G", 0.5, 9.5, 67, 151, 3],
  ["0010010", 16, "G", 0.5, 10, 76, 169, 3],
  ["0010011", 21, "G", 0.5, 11.7, 99, 223, 3],
  ["0010012", 24, "G", 0.5, 12.4, 114, 254, 3],
  ["0010016", 40, "G", 0.5, 15.4, 192, 404, 3],
  ["00100214", 2, "X", 0.75, 5.4, 14.4, 45, 3],
  ["00100224", 3, "G", 0.75, 5.7, 21.6, 55, 3],
  ["00101254", 3, "X", 0.75, 5.7, 21.6, 55, 3],
  ["00100234", 4, "G", 0.75, 6.2, 28.8, 66, 3],
  ["00101264", 4, "X", 0.75, 6.2, 28.8, 66, 3],
  ["00100244", 5, "G", 0.75, 6.7, 36, 79, 3],
  ["00101274", 5, "X", 0.75, 6.7, 36, 79, 3],
  ["0010025", 6, "G", 0.75, 7.3, 43.3, 104, 3],
  ["0010026", 7, "G", 0.75, 7.3, 50.4, 109, 3],
  ["0010027", 8, "G", 0.75, 8.8, 56, 123, 3],
  ["0010028", 9, "G", 0.75, 9.4, 63, 144, 3],
  ["0010029", 10, "G", 0.75, 9.6, 72, 153, 3],
  ["0010030", 12, "G", 0.75, 9.9, 86.4, 176, 3],
  ["0010031", 15, "G", 0.75, 10.9, 108, 211, 3],
  ["0010032", 18, "G", 0.75, 11.7, 129.6, 268, 3],
  ["0010033", 21, "G", 0.75, 13, 151, 293, 3],
  ["0010034", 25, "G", 0.75, 13.8, 180, 374, 4],
  ["0010036", 40, "G", 0.75, 17.3, 288, 571, 4],
  ["0010037", 50, "G", 0.75, 19.2, 360, 698, 4],
  ["00100414", 2, "X", 1, 5.7, 19.2, 53, 4],
  ["00100424", 3, "G", 1, 6, 28.8, 65, 4],
  ["00102034", 3, "X", 1, 6, 28.8, 65, 4],
  ["00100434", 4, "G", 1, 6.5, 38.4, 79, 4],
  ["00102044", 4, "X", 1, 6.5, 38.4, 79, 4],
  ["00100444", 5, "G", 1, 7.1, 48, 94, 4],
  ["00102054", 5, "X", 1, 7.1, 48, 94, 4],
  ["0010045", 6, "G", 1, 8, 58, 124, 4],
  ["0010046", 7, "G", 1, 8, 67, 131, 4],
  ["0010047", 8, "G", 1, 9.5, 77, 146, 4],
  ["0010049", 10, "G", 1, 10.2, 96, 183, 4],
  ["0010050", 12, "G", 1, 10.5, 115, 215, 4],
  ["0010052", 16, "G", 1, 11.8, 154, 282, 4],
  ["0010053", 18, "G", 1, 12.7, 173, 315, 4],
  ["0010054", 20, "G", 1, 13.4, 192, 350, 4],
  ["0010056", 25, "G", 1, 14.7, 240, 449, 4],
  ["00100634", 2, "X", 1.5, 6.3, 28.8, 68, 4],
  ["00100644", 3, "G", 1.5, 6.7, 43.2, 84, 4],
  ["00101284", 3, "X", 1.5, 6.7, 43.2, 84, 4],
  ["00100654", 4, "G", 1.5, 7.2, 57.6, 104, 4],
  ["00101294", 4, "X", 1.5, 7.2, 57.6, 104, 4],
  ["00100664", 5, "G", 1.5, 8.1, 72, 128, 4],
  ["00101304", 5, "X", 1.5, 8.1, 72, 128, 4],
  ["0010068", 7, "G", 1.5, 8.9, 101, 166, 4],
  ["0010069", 8, "G", 1.5, 10.6, 115, 205, 4],
  ["0010071", 12, "G", 1.5, 12, 173, 307, 4],
  ["0010072", 14, "G", 1.5, 12.7, 202, 349, 4],
  ["0010074", 18, "G", 1.5, 14.4, 259, 465, 4],
  ["0010076", 25, "G", 1.5, 16.9, 360, 655, 4],
  ["1120800", 2, "X", 2.5, 7.5, 48, 100, 4],
  ["1120801", 3, "G", 2.5, 8.1, 72, 132, 4],
  ["1120802", 4, "G", 2.5, 8.9, 96, 163, 5],
  ["1120803", 5, "G", 2.5, 10, 120, 200, 5],
  ["1120804", 7, "G", 2.5, 11.1, 168, 267, 5],
  ["1120805", 2, "X", 4, 9.2, 77, 160, 5],
  ["1120806", 3, "G", 4, 9.9, 115.2, 201, 5],
  ["1120807", 4, "G", 4, 10.8, 153.6, 263, 5],
  ["1120808", 5, "G", 4, 12.1, 192, 315, 5],
  ["1120809", 7, "G", 4, 13.4, 269, 407, 5],
  ["1120810", 3, "G", 6, 11.7, 174, 289, 5],
  ["1120811", 4, "G", 6, 13, 230, 352, 5],
  ["1120812", 5, "G", 6, 14.5, 288, 470, 5],
  ["1120813", 7, "G", 6, 16, 403, 600, 5],
  ["1120814", 3, "G", 10, 14.6, 288, 466, 5],
  ["1120815", 4, "G", 10, 16.2, 384, 590, 5],
  ["1120816", 5, "G", 10, 18.1, 480, 722, 5],
  ["1120817", 3, "G", 16, 17, 460.8, 720, 5],
  ["1120818", 4, "G", 16, 18.8, 614.4, 1067, 5],
  ["1120819", 5, "G", 16, 21.2, 768, 1370, 5],
  ["1120820", 3, "G", 25, 21, 720, 1250, 5],
  ["1120821", 4, "G", 25, 23.5, 960, 1582, 5],
  ["1120822", 5, "G", 25, 26.4, 1200, 1998, 5],
  ["1120823", 3, "G", 35, 23.7, 1008, 1700, 5],
  ["1120824", 4, "G", 35, 26.4, 1344, 2106, 5],
  ["1120825", 5, "G", 35, 29.6, 1680, 2635, 5],
  ["1120826", 3, "G", 50, 29.1, 1440, 2200, 5],
  ["1120827", 4, "G", 50, 32.4, 1920, 2800, 5],
  ["1120828", 5, "G", 50, 36.5, 2400, 3600, 5],
] as const;

export const olflexClassic100500Cables = metricLappCables(
  olflexClassic100500Rows,
  {
    family: "ÖLFLEX CLASSIC 100 300/500 V",
    url: "https://products.lappgroup.com/online-catalogue/power-and-control-cables/various-applications/pvc-outer-sheath-and-coloured-cores/oelflex-classic-100-300500-v.html?format=pdf",
    revision: "LAPP PN 0456 / 02_03.16 (2026-01-25)",
    nominalU0V: 300,
    nominalUV: 500,
    shielded: false,
  },
);

const olflexClassic110BlackRows = [
  ["1120232", 2, "X", 0.75, 8.3, 14.4, 81, 3],
  ["1120233", 3, "G", 0.75, 8.7, 21.6, 93, 3],
  ["1120234", 3, "X", 0.75, 8.7, 21.6, 93, 3],
  ["1120235", 4, "G", 0.75, 9.2, 29, 108, 3],
  ["1120237", 5, "G", 0.75, 9.9, 36, 126, 3],
  ["1120241", 7, "G", 0.75, 10.7, 51, 162, 3],
  ["1120248", 12, "G", 0.75, 13.4, 86, 236, 3],
  ["1120251", 18, "G", 0.75, 15.4, 130, 334, 3],
  ["1120259", 41, "G", 0.75, 21.6, 296, 713, 3],
  ["1120266", 2, "X", 1, 8.6, 19.2, 98, 3],
  ["1120267", 3, "G", 1, 9, 29, 112, 3],
  ["1120268", 3, "X", 1, 9, 29, 112, 3],
  ["1120269", 4, "G", 1, 9.6, 38.4, 131, 3],
  ["1120270", 4, "X", 1, 9.6, 38.4, 131, 3],
  ["1120271", 5, "G", 1, 10.4, 48, 152, 3],
  ["1120274", 7, "G", 1, 11.1, 67, 196, 3],
  ["1120280", 12, "G", 1, 14, 116, 286, 3],
  ["1120284", 18, "G", 1, 16.1, 173, 419, 3],
  ["1120290", 25, "G", 1, 18.6, 240, 572, 3],
  ["1120294", 34, "G", 1, 21.3, 326, 764, 3],
  ["1120298", 41, "G", 1, 23.2, 394, 891, 3],
  ["1120306", 2, "X", 1.5, 9.6, 29, 123, 3],
  ["1120307", 3, "G", 1.5, 10.1, 43, 165, 3],
  ["1120308", 3, "X", 1.5, 10.1, 43, 144, 3],
  ["1120309", 4, "G", 1.5, 10.8, 58, 170, 3],
  ["1120311", 5, "G", 1.5, 11.7, 72, 199, 3],
  ["1120314", 7, "G", 1.5, 12.6, 101, 261, 3],
  ["1120320", 12, "G", 1.5, 16.1, 173, 399, 3],
  ["1120322", 14, "G", 1.5, 17, 202, 448, 3],
  ["1120324", 18, "G", 1.5, 18.8, 259, 547, 3],
  ["1120328", 25, "G", 1.5, 21.7, 360, 770, 3],
  ["1120330", 34, "G", 1.5, 24.9, 490, 996, 3],
  ["1120333", 50, "G", 1.5, 29.8, 720, 1427, 3],
  ["1120339", 2, "X", 2.5, 10.8, 48, 147, 4],
  ["1120340", 3, "G", 2.5, 11.3, 72, 182, 4],
  ["1120342", 4, "G", 2.5, 12.2, 96, 225, 4],
  ["1120343", 4, "X", 2.5, 12.2, 96, 225, 4],
  ["1120344", 5, "G", 2.5, 13.3, 120, 266, 4],
  ["1120346", 7, "G", 2.5, 14.4, 168, 354, 4],
  ["1120349", 12, "G", 2.5, 18.7, 288, 540, 4],
  ["1120350", 14, "G", 2.5, 19.8, 336, 613, 4],
  ["1120351", 18, "G", 2.5, 22, 432, 788, 4],
  ["1120353", 25, "G", 2.5, 25.8, 600, 1094, 4],
  ["1120360", 4, "G", 4, 13.8, 154, 324, 4],
  ["1120361", 5, "G", 4, 15.1, 192, 385, 4],
  ["1120362", 7, "G", 4, 16.4, 269, 513, 4],
  ["1120366", 4, "G", 6, 15.1, 230, 442, 4],
  ["1120367", 5, "G", 6, 16.8, 288, 526, 4],
  ["1120368", 7, "G", 6, 18.2, 403, 705, 4],
  ["1120370", 4, "G", 10, 18.7, 384, 707, 4],
  ["1120371", 5, "G", 10, 20.7, 480, 881, 4],
  ["1120374", 4, "G", 16, 21.3, 614, 1100, 4],
  ["1120375", 5, "G", 16, 23.6, 768, 1350, 4],
  ["1120376", 7, "G", 16, 26.2, 1075, 1800, 4],
  ["1120378", 4, "G", 25, 26.2, 960, 1600, 4],
  ["1120379", 5, "G", 25, 29, 1200, 2050, 4],
  ["1120382", 4, "G", 35, 29.1, 1344, 2400, 4],
  ["1120383", 5, "G", 35, 32.5, 1680, 2900, 4],
  ["1120385", 4, "G", 50, 35.6, 1920, 3400, 4],
  ["1120387", 4, "G", 70, 40.7, 2688, 5050, 4],
  ["1120389", 4, "G", 95, 46.8, 3648, 6010, 4],
  ["1120390", 4, "G", 120, 53.5, 4608, 7500, 4],
] as const;

export const olflexClassic110BlackCables = metricLappCables(
  olflexClassic110BlackRows,
  {
    family: "ÖLFLEX CLASSIC 110 BLACK 0.6/1 kV",
    url: "https://products.lappgroup.com/online-catalogue/power-and-control-cables/various-applications/pvc-outer-sheath-and-numbered-cores/oelflex-classic-110-black-061-kv.html?format=pdf",
    revision: "LAPP PN 0456 / 02_03.16 (2026-01-25)",
    nominalU0V: 600,
    nominalUV: 1000,
    shielded: false,
    numberedCores: true,
  },
);

const stamfordWinding311Rows = [
  ["S0L1-D1", 7.5, 6.8],
  ["S0L1-H1", 10, 9.1],
  ["S0L1-L1", 12.5, 11.4],
  ["S0L1-P1", 15, 13.7],
  ["S0L2-F1", 17.5, 15.9],
  ["S0L2-G1", 20, 18.2],
  ["S0L2-M1", 25, 22.8],
  ["S0L2-P1", 30, 27.3],
  ["S1L2-J1", 35, 31.9],
  ["S1L2-K1", 40, 36.4],
  ["S1L2-N1", 45, 41],
  ["S1L2-R1", 50, 45.5],
  ["S1L2-Y1", 62.5, 56.9],
] as const;

export const stamfordWinding311Alternators = stamfordWinding311Rows.map(
  ([model, continuousKva125Over40, continuousKva105Over40]) => ({
    id: `stamford:${model.toLowerCase()}-311`,
    manufacturer: "STAMFORD",
    model,
    orderCode: null,
    category: "generators" as const,
    function: "synchronous-alternator" as const,
    connection: "ac" as const,
    terminals: ["U", "V", "W"].flatMap((phase) =>
      [1, 2, 5, 6].map((lead) => ({
        id: `${phase.toLowerCase()}${lead}`,
        group: `${phase}${lead}`,
        interface: "alternator-stator-lead",
        connector: "winding lead",
      })),
    ),
    ratings: {
      continuousKva125Over40,
      continuousKva105Over40,
      ratedLineV: [400, 415],
      ratedPowerFactor: 0.8,
      ratedSpeedRpm: 1500,
      poles: 4,
    },
    conditions: {
      winding: "311",
      frequencyHz: 50,
      phases: 3,
      outputConnection: "series star",
    },
    modelMapping: null,
    source: {
      url: "https://www.stamford-avk.com/sites/stamfordavk/files/Brochures/S-Range/STAMFORD-S0-S1-Brochure.pdf",
      revision: "STAMFORD S0 & S1 brochure, winding 311 ratings table",
      page: 6,
      supplemental: [
        {
          url: "https://www.stamford-avk.com/sites/stamfordavk/files/2025-07/STAMFORD-AvK-Marine-Ratings-Book.pdf",
          revision:
            "STAMFORD and AvK Marine Ratings Book (2025-07), winding 311",
          page: 4,
        },
      ],
    },
    missingFields: ["separate-order-code", "verified-alternator-model-mapping"],
    readiness: "inventory-and-diagram-only",
  }),
);

const spacialS3hdRows = [
  ["NSYS3HD3215", 343, 200, 180],
  ["NSYS3HD4320", 448, 300, 230],
  ["NSYS3HD5420", 548, 400, 230],
  ["NSYS3HD6425", 653, 400, 280],
  ["NSYS3HD6630", 658, 600, 330],
  ["NSYS3HD7525", 753, 500, 280],
  ["NSYS3HD8630", 858, 600, 330],
  ["NSYS3HD8840", 862, 800, 430],
  ["NSYS3HD10640", 1062, 600, 430],
  ["NSYS3HD10840", 1062, 800, 430],
] as const;

export const spacialS3hdEnclosures = spacialS3hdRows.map(
  ([model, heightMm, widthMm, depthMm]) => ({
    id: `schneider-electric:${model.toLowerCase()}`,
    manufacturer: "Schneider Electric",
    model,
    orderCode: model,
    category: "enclosures-and-installation-hardware" as const,
    function: "wall-mounted-enclosure" as const,
    connection: "mechanical" as const,
    terminals: [],
    ratings: {
      heightMm,
      widthMm,
      depthMm,
      ingressProtection: "IP66",
      impactProtection: "IK10",
    },
    conditions: {
      family: "Spacial S3HD",
      material: "anti-corrosion coated steel",
      mounting: "wall",
    },
    modelMapping: null,
    source: {
      url: "https://download.se.com/files?p_Doc_Ref=UE14MK01EN&p_File_Name=UE14MK01EN+%28web%29.pdf&p_enDocType=Catalog",
      revision: "UE14MK01EN",
      page: 16,
      pageLabel: "4, 16",
    },
    missingFields: ["enclosure-bonding-points", "enclosure-thermal-model"],
    readiness: "inventory-and-diagram-only",
  }),
);

const philipsDn145bRows = [
  ["910500465901", "LED10S/830", 13, 1000, 3000, "2026-10-30"],
  ["910500465902", "LED10S/840", 13, 1000, 4000, "2026-10-30"],
  ["910500465903", "LED20S/830", 22.5, 2000, 3000, "2026-10-30"],
  ["910500465904", "LED20S/840", 22.5, 2000, 4000, "2026-11-20"],
] as const;

export const philipsDn145bDownlights = philipsDn145bRows.map(
  ([
    orderCode,
    designation,
    powerW,
    luminousFluxLm,
    colorTemperatureK,
    revision,
  ]) => ({
    id: `philips:${orderCode}`,
    manufacturer: "Philips",
    model: `DN145B ${designation} PSD-E II WH`,
    orderCode,
    category: "lighting-equipment" as const,
    function: "recessed-led-downlight" as const,
    connection: "ac" as const,
    terminals: [
      {
        id: "l",
        group: "L",
        interface: "luminaire-ac-input",
        connector: "driver terminal",
      },
      {
        id: "n",
        group: "N",
        interface: "luminaire-ac-input",
        connector: "driver terminal",
      },
      {
        id: "da-n",
        group: "DA/N",
        interface: "luminaire-control",
        connector: "driver terminal",
      },
      {
        id: "da-ls",
        group: "DA/Ls",
        interface: "luminaire-control",
        connector: "driver terminal",
      },
    ],
    ratings: {
      inputMinV: 220,
      inputMaxV: 240,
      powerW,
      luminousFluxLm,
      colorTemperatureK,
      powerFactor: 0.9,
    },
    conditions: {
      frequencyHz: [50, 60],
      control: "DALI-2",
      protectionClass: "II",
    },
    modelMapping: null,
    source: {
      url: `https://www.docs.signify.com/assets/Leaflet/Philips_PROF/FP/en_AA/${orderCode}_EU.en_AA.PROF.FP.pdf`,
      revision: `Philips fact sheet (${revision})`,
      page: 2,
      supplemental: [
        {
          url: "https://www.signify.com/api/assets/v1/file/Signify/content/444316022141%20MI%20DN145B%20IA1%20PSD-E/DN145B_IA1_PSD_E_installation_instruction.pdf",
          revision: "444316022141 (2019)",
          page: 2,
        },
      ],
    },
    missingFields: ["verified-lighting-model-mapping"],
    readiness: "inventory-and-diagram-only",
  }),
);

export const wegW22Motors = [
  {
    id: "weg:15833976",
    manufacturer: "WEG",
    model: "W22 IE3 0.75 kW 4P 80 B3T",
    orderCode: "15833976",
    category: "motors-and-motor-driven-equipment" as const,
    function: "three-phase-induction-motor" as const,
    connection: "ac" as const,
    terminals: [],
    ratings: {
      shaftOutputKW: 0.75,
      poles: 4,
      ingressProtection: "IP55",
      operatingPoints: [
        {
          frequencyHz: 50,
          lineVoltageV: [220, 380],
          lineCurrentA: [2.9, 1.68],
          speedRpm: 1430,
          powerFactor: 0.82,
          efficiencyPercent: 82.5,
        },
        {
          frequencyHz: 50,
          lineVoltageV: [230, 400],
          lineCurrentA: [2.92, 1.68],
          speedRpm: 1435,
          powerFactor: 0.78,
          efficiencyPercent: 82.5,
        },
        {
          frequencyHz: 50,
          lineVoltageV: [240, 415],
          lineCurrentA: [2.87, 1.66],
          speedRpm: 1440,
          powerFactor: 0.76,
          efficiencyPercent: 82.5,
        },
        {
          frequencyHz: 60,
          lineVoltageV: [460],
          lineCurrentA: [1.47],
          speedRpm: 1745,
          powerFactor: 0.76,
          efficiencyPercent: 84,
        },
      ],
    },
    conditions: {
      duty: "S1",
      phases: 3,
      loadingPercent: 100,
      supplyWaveform: "sinusoidal",
    },
    modelMapping: null,
    source: {
      url: "https://www.quantum-controls.co.uk/wp-content/uploads/2025/09/DS15833976.pdf",
      revision: "WEG DS15833976 (2025-09-17)",
      page: 1,
    },
    missingFields: ["motor-terminal-diagram", "verified-motor-model-mapping"],
    readiness: "inventory-and-diagram-only",
  },
];

// PCNs in NS/NSL order for each catalog voltage. Null marks an unlisted variant.
const chromaloxStripHeaterRows = [
  ["1205", 500, 32, ["129250", "165462"], ["42199", "165470"], [null, null]],
  ["1405", 500, 28, ["142201", "165489"], ["29269", "165497"], [null, null]],
  ["1505", 500, 24, ["142210", "165550"], ["42228", "165518"], [null, null]],
  ["1807", 750, 30, ["142236", "165526"], ["42244", "144928"], [null, null]],
  [
    "1801",
    1000,
    38,
    ["142252", "165534"],
    ["42260", "165542"],
    [null, "165876"],
  ],
  [
    "1901",
    1000,
    36,
    ["142287", "165569"],
    ["29277", "165577"],
    ["42295", "165585"],
  ],
  [
    "2001",
    1100,
    35,
    ["142308", "165593"],
    ["42316", "165606"],
    [null, "165614"],
  ],
  [
    "2401",
    1200,
    34,
    ["142332", "165622"],
    ["42340", "144936"],
    ["42359", "165630"],
  ],
  [
    "2501",
    1300,
    34,
    ["142367", "165649"],
    ["42375", "165657"],
    ["42383", "165665"],
  ],
  [
    "2601",
    1400,
    34,
    ["142391", "165673"],
    ["29285", "144944"],
    ["42404", "165681"],
  ],
  [
    "3015",
    1500,
    32,
    ["142412", "165690"],
    ["42420", "165702"],
    ["42439", "165710"],
  ],
  [
    "3301",
    1500,
    28,
    ["142447", "165729"],
    ["42455", "144952"],
    ["42463", "165737"],
  ],
  [
    "3601",
    1850,
    32,
    ["142471", "165745"],
    ["42480", "144960"],
    ["42498", "165753"],
  ],
  [
    "3802",
    2000,
    32,
    ["142500", "165761"],
    ["42519", "165770"],
    ["42527", "165788"],
  ],
  [
    "4302",
    2100,
    32,
    ["142535", "165796"],
    ["42543", "165809"],
    ["42551", "165817"],
  ],
  [
    "4827",
    2700,
    32,
    ["142560", "165825"],
    ["42578", "165833"],
    ["42586", "165841"],
  ],
  ["5403", 3000, 34, [null, null], ["42594", "165850"], ["42607", "165868"]],
] as const;

export const chromaloxStripHeaters = chromaloxStripHeaterRows.flatMap(
  ([suffix, powerW, wattsPerSquareInch, at120V, at240V, at480V]) =>
    (
      [
        [120, at120V],
        [240, at240V],
        [480, at480V],
      ] as const
    ).flatMap(([ratedVoltageV, [blockCode, leadCode]]) =>
      (
        [
          ["NS", blockCode, "terminal block"],
          ["NSL", leadCode, "wire lead"],
        ] as const
      ).flatMap(([series, orderCode, connector]) =>
        orderCode === null
          ? []
          : [
              {
                id: `chromalox:${orderCode}`,
                manufacturer: "Chromalox",
                model: `${series}-${suffix}`,
                orderCode,
                category: "commercial-and-industrial-loads" as const,
                function: "resistive-strip-heater" as const,
                connection: "ac" as const,
                terminals: ["1", "2"].map((group) => ({
                  id: `terminal-${group}`,
                  group,
                  interface: "heater-element-end",
                  connector,
                })),
                ratings: {
                  powerW,
                  ratedVoltageV,
                  wattsPerSquareInch,
                  maxSheathTemperatureF: 1500,
                },
                conditions: { sheath: "INCOLOY", connectorPosition: "one end" },
                modelMapping: null,
                source: {
                  url: "https://content.chromalox.com/-/media/chromalox/documents/product-pdfs/mod/mod-ns-nsl.ashx?hash=1AA75C97D1725328187A941FFA2EF3BE&rev=42411d2bccb147af8d04529c3a494434",
                  revision:
                    "Chromalox NS & NSL catalog (42411d2bccb147af8d04529c3a494434)",
                  page: 1,
                },
                missingFields: ["verified-heater-model-mapping"],
                readiness: "inventory-and-diagram-only",
              },
            ],
      ),
    ),
);

export const stamfordAs480Regulators = [
  {
    id: "stamford:as480",
    manufacturer: "STAMFORD",
    model: "AS480",
    orderCode: null,
    category: "prime-movers-and-generation-auxiliaries" as const,
    function: "alternator-voltage-regulator" as const,
    connection: "ac-dc" as const,
    terminals: [
      ...["7", "8"].map((group) => ({
        id: group,
        group,
        interface: "avr-ac-sensing-and-power",
        connector: "board terminal",
      })),
      ...["F1", "F2"].map((group) => ({
        id: group.toLowerCase(),
        group,
        interface: "avr-exciter-field-output",
        connector: "board terminal",
      })),
    ],
    ratings: {
      inputMinVAc: 100,
      inputMaxVAc: 264,
      continuousOutputA: 5,
      transientOutputA: 7.5,
      transientDurationS: 10,
      minimumFieldResistanceOhm: 15,
      outputVoltagePoints: [
        { inputVAc: 110, outputVDc: 45 },
        { inputVAc: 200, outputVDc: 82 },
      ],
    },
    conditions: {
      supplyFrequencyHz: [50, 60],
      phases: 1,
      externalMountingCurrentDeratePercent: 20,
      currentDeratePercentPerCAbove60C: 5,
    },
    modelMapping: null,
    source: {
      url: "https://www.stamford-avk.com/sites/stamfordavk/files/AS480datasheet.pdf",
      revision: "TD_AS480 AVR_04.08_02_GB",
      page: 1,
      pageLabel: "1–2",
    },
    missingFields: [
      "separate-order-code",
      "avr-auxiliary-terminals",
      "verified-avr-model-mapping",
    ],
    readiness: "inventory-and-diagram-only",
  },
];

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
  ...phoenixPtPeTerminals,
  ...abl6Transformers,
  ...abt7pduTransformers,
  ...victronAgmSuperCycle,
  ...apcSmvUps,
  ...victronVeDirect230,
  ...victronVeDirect120,
  ...evlinkHomeStations,
  ...altivar320CompactDrives,
  ...olflexClassic110Cables,
  ...olflexClassic110CyCables,
  ...olflexClassic100750Cables,
  ...olflexClassic100500Cables,
  ...olflexClassic110BlackCables,
  ...stamfordWinding311Alternators,
  ...spacialS3hdEnclosures,
  ...philipsDn145bDownlights,
  ...wegW22Motors,
  ...chromaloxStripHeaters,
  ...stamfordAs480Regulators,
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
