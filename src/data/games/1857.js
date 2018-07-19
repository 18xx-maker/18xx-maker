const game = {
  // Generic Game Info
  info: {
    title: "1857",
    designer: "Eddie Robbins",
    background: "purple",
    width: 150,
    orientation: "horizontal",
    titleY: 675,
    titleRotate: -90,
    extraTokens: 4,
    color_10: "orange"
  },

  // Extra Tokens
  tokens: ["Round", "+$10", "+$10", "x2", "x2"],

  // Need an IPO sheet
  ipo: true,

  bank: "$9,000",

  players: [
    {
      number: 3,
      certLimit: 20,
      capital: "$800"
    },
    {
      number: 4,
      certLimit: 16,
      capital: "$600"
    },
    {
      number: 5,
      certLimit: 13,
      capital: "$480"
    },
    {
      number: 6,
      certLimit: 11,
      capital: "$400"
    }
  ],

  // Railway Companies
  companies: [
    {
      name: "Argentine Great Western Railway",
      abbrev: "AGW",
      tokens: ["$40", "$100", "$100"],
      color: "yellow",
      shares: [
        {
          quantity: 1,
          label: "President Share",
          percent: 20,
          shares: 2
        },
        {
          quantity: 8,
          percent: 10,
          shares: 1
        }
      ]
    },
    {
      name: "Central Argentine Railway",
      abbrev: "CA",
      tokens: ["$40", "$100"],
      color: "purple",
      shares: [
        {
          quantity: 1,
          label: "President Share",
          percent: 20,
          shares: 2
        },
        {
          quantity: 8,
          percent: 10,
          shares: 1
        }
      ]
    },
    {
      name: "Central Cordoba Railway",
      abbrev: "CC",
      tokens: ["$40", "$100", "$100"],
      color: "maroon",
      shares: [
        {
          quantity: 1,
          label: "President Share",
          percent: 20,
          shares: 2
        },
        {
          quantity: 8,
          percent: 10,
          shares: 1
        }
      ]
    },
    {
      name: "Bahia Blanca & Northwest Railway",
      abbrev: "BBN",
      tokens: ["$40"],
      color: "orange",
      shares: [
        {
          quantity: 1,
          label: "President Share",
          percent: 20,
          shares: 2
        },
        {
          quantity: 8,
          percent: 10,
          shares: 1
        }
      ]
    },
    {
      name: "North Central Argentine Railway",
      abbrev: "NCA",
      tokens: ["$40", "$100"],
      color: "black",
      shares: [
        {
          quantity: 1,
          label: "President Share",
          percent: 20,
          shares: 2
        },
        {
          quantity: 8,
          percent: 10,
          shares: 1
        }
      ]
    },
    {
      name: "Santa Fe Railway",
      abbrev: "SF",
      tokens: ["$40"],
      color: "red",
      shares: [
        {
          quantity: 1,
          label: "President Share",
          percent: 20,
          shares: 2
        },
        {
          quantity: 8,
          percent: 10,
          shares: 1
        }
      ]
    },
    {
      name: "Buenos Aires Great Southern Railway",
      abbrev: "BAS",
      tokens: ["$40", "$100", "$100"],
      color: "darkGreen",
      shares: [
        {
          quantity: 1,
          label: "President Share",
          percent: 20,
          shares: 2
        },
        {
          quantity: 8,
          percent: 10,
          shares: 1
        }
      ]
    },
    {
      name: "Buenos Aires Central Railway",
      abbrev: "BAC",
      tokens: ["$40", "$100"],
      color: "blue",
      shares: [
        {
          quantity: 1,
          label: "President Share",
          percent: 20,
          shares: 2
        },
        {
          quantity: 8,
          percent: 10,
          shares: 1
        }
      ]
    }
  ],

  trains: [
    {
      name: "2",
      quantity: 5,
      price: "$80",
      color: "yellow",
      info: [
        {
          color: "green",
          note: "Rusted by 4"
        }
      ]
    },
    {
      name: "3",
      quantity: 4,
      price: "$180",
      color: "green",
      info: [
        {
          color: "brown",
          note: "Rusted by 6"
        }
      ]
    },
    {
      name: "4",
      quantity: 3,
      price: "$300",
      color: "green",
      info: [
        {
          color: "brown",
          note: "Rusted by D"
        }
      ]
    },
    {
      name: "5",
      quantity: 2,
      price: "$450",
      color: "brown",
      info: [
        {
          color: "yellow",
          note: "Permanent"
        }
      ]
    },
    {
      name: "6",
      quantity: 2,
      price: "$630",
      color: "brown",
      info: [
        {
          color: "yellow",
          note: "Permanent"
        }
      ]
    },
    {
      name: "D",
      quantity: 12,
      price: "$1100",
      color: "brown",
      description: "Cost $800 when trading in a 4T, 5T or 6T",
      info: [
        {
          color: "yellow",
          note: "Permanent"
        }
      ]
    }
  ],

  privates: [
    {
      name: "Camino de Hierro de Buenos Aires al Oeste",
      price: "$40",
      revenue: "$10",
      description:
        "Reserves the Camino de Hierro de Buenos Aires al Oeste hex (G16). Only the owning corporation is permitted to lay this track. This can be purchased by a corporation during the yellow phase. Closes when the first 5 Train is purchased."
    },
    {
      name: "Saint Sebastian Trading Company",
      price: "$40",
      revenue: "$10",
      description:
        "Trade for one share at any time, this action closes the company. This trade cannot allow you to own more than 60% of a corporation. Stops paying dividends when the first 5 Train is purchased. Closes when the first 5 Train is purchased if owned by a corporation."
    },
    {
      name: "Saint Pedro Shipping Company",
      price: "$40",
      revenue: "$10",
      description:
        "The owning corporation increases their revenue at Bahia Blanco (E20) by $10 for all runs. Stops paying dividends when the first 5 Train is purchased. Closes when the first 5 Train is purchased if player owned."
    },
    {
      name: "Saint Barbara Mining Company",
      price: "$40",
      revenue: "$10",
      description:
        "The owning corporation doubles their revenue at Cordoba (D11) once per run. Stops paying dividends when the first 5 Train is purchased. Closes when the first 5 Train is purchased if player owned."
    },
    {
      name: "Saint Zolius Land Company",
      price: "$40",
      revenue: "$10",
      description:
        "The owning corporation may place one token at no cost, this action closes the company. This must follow normal placement rules. Stops paying dividends when the first 5 Train is purchased. Closes when the first 5 Train is purchased if player owned."
    },
    {
      name: "Saint Dominic Road Company",
      price: "$40",
      revenue: "$10",
      description:
        "The owning corporation may lay or upgrade one track in addition to their normal track action, this action closes the company. Closes when the first 5 Train is purchased."
    }
  ],

  phases: [
    {
      name: "2",
      limit: "4",
      number: "5",
      tiles: "yellow"
    },
    {
      name: "3",
      limit: "4",
      number: "4",
      tiles: "green",
      notes: "Private companies may be purchased"
    },
    {
      name: "4",
      rust: "2",
      limit: "3",
      number: "3",
      tiles: "green"
    },
    {
      name: "5",
      limit: "2",
      number: "2",
      tiles: "brown",
      notes: "Private companies are closed"
    },
    {
      name: "6",
      limit: "2",
      number: "2",
      rust: "3",
      tiles: "brown",
      notes: "D Trains may be purchased"
    },
    {
      name: "D",
      limit: "2",
      number: "∞",
      rust: "4",
      tiles: "brown"
    }
  ],

  pools: [
    {
      name: "Market",
      notes: [
        {
          color: "orange",
          note: "Shares in the market pay dividends to the company"
        },
        {
          color: "brown",
          icon: "exclamation",
          note: "No more than 50% of a company may be in the market"
        },
        {
          color: "red",
          icon: "times",
          note: "No stock sales during first stock round"
        }
      ]
    }
  ],

  rounds: [
    {
      name: "OR3",
      color: "brown"
    },
    {
      name: "OR2",
      color: "green"
    },
    {
      name: "OR1",
      color: "yellow"
    },
    {
      name: "SR",
      color: "gray"
    }
  ],

  turns: [
    {
      name: "Stock Round",
      steps: ["Sell any number of shares", "Buy one share"],
      ordered: false
    },
    {
      name: "Operating Round",
      steps: [
        "Lay or upgrade track",
        "Purchase a station",
        "Run trains",
        "Pay dividends or withhold revenue",
        "Purchase trains"
      ],
      ordered: true
    }
  ],

  stock: {
    type: "2D",
    par: {
      values: [100, 90, 82, 76, 71, 67],
      cells: [[0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4]]
    },
    market: [
      [
        71,
        76,
        82,
        90,
        100,
        112,
        126,
        142,
        160,
        180,
        200,
        225,
        250,
        275,
        300,
        325,
        350
      ],
      [
        66,
        70,
        76,
        82,
        90,
        100,
        112,
        126,
        142,
        160,
        180,
        200,
        220,
        240,
        260,
        280,
        300
      ],
      [60, 65, 70, 76, 82, 90, 100, 111, 125, 140, 155, 170, 185, 200],
      [54, 60, 66, 71, 76, 82, 90, 100, 110, 120, 130],
      [48, 55, 62, 67, 71, 76, 82, 90, 100],
      [42, 50, 58, 65, 67, 71, 75, 80],
      [36, 45, 54, 63, 67, 69, 70],
      [30, 40, 50, 60, 67, 68],
      [20, 30, 40, 50, 60],
      [10, 20, 30, 40, 50]
    ],
    limits: [
      {
        color: "yellow",
        description: "Certificates no longer count towards the share limit",
        value: 60
      },
      {
        color: "orange",
        description: "Players may own more than 60% of the company",
        value: 45
      },
      {
        color: "brown",
        description: "Multiple certificates may be bought in the same turn",
        value: 30
      }
    ]
  },

  tiles: {
    "1": 1,
    "2": 1,
    "3": 2,
    "4": 2,
    "7": 4,
    "8": 8,
    "9": 7,
    "55": 1,
    "56": 1,
    "57": 4,
    "58": 2,
    "69": 1,
    "14": 3,
    "15": 2,
    "16": 1,
    "18": 1,
    "19": 1,
    "20": 1,
    "23": 3,
    "24": 3,
    "25": 1,
    "26": 1,
    "27": 1,
    "28": 1,
    "29": 1,
    "53": 2,
    "54": 1,
    "59": 2,
    "39": 1,
    "40": 1,
    "41": 2,
    "42": 2,
    "43": 2,
    "44": 1,
    "45": 2,
    "46": 2,
    "47": 1,
    "61": 2,
    "62": 1,
    "63": 3,
    "64": 1,
    "65": 1,
    "66": 1,
    "67": 1,
    "68": 1,
    "70": 1
  },

  map: {
    hexes: [
      {
        color: "plain",
        hexes: [
          "C2",
          "C4",
          "C6",
          "C14",
          "D5",
          "D9",
          "D15",
          "D17",
          "D19",
          "E2",
          "E4",
          "E6",
          "E8",
          "E12",
          "E14",
          "E18",
          "F3",
          "F5",
          "F7",
          "F9",
          "F11",
          "F13",
          "F15",
          "F19",
          "G2",
          "G10",
          "G14",
          "G18",
          "H3",
          "H5",
          "H7",
          "H15",
          "H19"
        ]
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              name: "Tucuman"
            }
          }
        ],
        hexes: ["D3"]
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              name: "Resistencia & Carrientes"
            }
          }
        ],
        hexes: ["G4"]
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              name: "Oliviarria"
            }
          }
        ],
        hexes: ["E16"]
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              name: "Tandil"
            }
          }
        ],
        hexes: ["F17"]
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              name: "Bahia Blanca"
            },
            companies: [
              {
                label: "BBN",
                color: "orange"
              }
            ]
          }
        ],
        hexes: ["E20"]
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              name: "Santiago del Estero"
            },
            companies: [
              {
                label: "NCA",
                color: "black"
              }
            ]
          }
        ],
        hexes: ["D7"]
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              name: "Cordoba"
            },
            companies: [
              {
                label: "CC",
                color: "maroon"
              }
            ]
          }
        ],
        hexes: ["D11"]
      },
      {
        color: "plain",
        centerTowns: [{}],
        hexes: ["E10", "G6", "H13"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            angle: 90,
            percent: 0.4
          },
          {
            angle: 270,
            percent: 0.4
          }
        ],
        hexes: ["D13"]
      },
      {
        color: "plain",
        labels: [
          {
            label: "CdH",
            angle: 180,
            percent: 0.5
          }
        ],
        centerTowns: [
          {
            angle: 90,
            percent: 0.4
          },
          {
            angle: 270,
            percent: 0.4
          }
        ],
        hexes: ["G16"]
      },
      {
        color: "offboard",
        offBoardTrack: [{ side: 6 }],
        labels: [
          {
            label: "Salta",
            angle: 180,
            percent: 0.333
          }
        ],
        offBoardRevenue: {
          revenues: [
            {
              color: "yellow",
              cost: "20"
            },
            {
              color: "brown",
              cost: "60"
            }
          ]
        },
        hexes: ["B1"]
      },
      {
        color: "gray",
        track: [
          {
            type: "sharp",
            side: 1
          }
        ],
        hexes: ["D1"]
      },
      {
        color: "plain",
        mountain: {
          cost: "$120"
        },
        hexes: ["B11"]
      },
      {
        color: "plain",
        mountain: {
          cost: "$80"
        },
        hexes: ["C12"]
      },
      {
        color: "plain",
        mountain: {
          cost: "$40"
        },
        hexes: ["B15", "C8", "C10"]
      },
      {
        color: "offboard",
        offBoardTrack: [{ side: 6 }],
        labels: [
          {
            label: "Chile",
            angle: 180,
            percent: 0.333
          }
        ],
        offBoardRevenue: {
          revenues: [
            {
              color: "yellow",
              cost: "0"
            },
            {
              color: "brown",
              cost: "70"
            }
          ]
        },
        hexes: ["A12"]
      },
      {
        color: "offboard",
        offBoardTrack: [{ side: 5 }],
        labels: [
          {
            label: "Chile",
            percent: 0.333
          }
        ],
        offBoardRevenue: {
          revenues: [
            {
              color: "yellow",
              cost: "0"
            },
            {
              color: "brown",
              cost: "70"
            }
          ]
        },
        hexes: ["A14"]
      },
      {
        color: "gray",
        track: [
          {
            type: "sharp",
            side: 4
          }
        ],
        hexes: ["B17", "C18"]
      },
      {
        color: "offboard",
        offBoardTrack: [{ side: 4 }, { side: 5 }],
        labels: [
          {
            label: "Patagonia",
            percent: 0.333
          }
        ],
        offBoardRevenue: {
          revenues: [
            {
              color: "yellow",
              cost: "10"
            },
            {
              color: "brown",
              cost: "40"
            }
          ]
        },
        hexes: ["D21"]
      },
      {
        color: "water",
        offBoardTrack: [{ side: 4 }],
        icons: [
          {
            type: "port",
            percent: 0.5
          }
        ],
        offBoardRevenue: {
          revenues: [
            {
              color: "yellow",
              cost: "20"
            },
            {
              color: "brown",
              cost: "30"
            }
          ]
        },
        hexes: ["E22"]
      },
      {
        color: "gray",
        track: [
          {
            type: "sharp",
            side: 3
          }
        ],
        hexes: ["F21"]
      },
      {
        color: "gray",
        cities: [
          {
            angle: 180,
            percent: 0.1,
            name: {
              name: "Mar del Plata",
              reverse: true
            }
          }
        ],
        values: [
          {
            value: 20,
            percent: 0.667
          }
        ],
        track: [
          {
            type: "gentle",
            side: 3
          },
          {
            type: "sharp",
            side: 3
          },
          {
            type: "sharp",
            side: 4
          }
        ],
        hexes: ["G20"]
      },
      {
        color: "yellow",
        labels: [
          {
            label: "B",
            angle: 150,
            percent: 0.75
          }
        ],
        values: [
          {
            value: 30,
            angle: 210,
            percent: 0.75
          }
        ],
        cities: [
          {
            name: {
              name: "Rosario",
              reverse: true
            },
            companies: [
              {
                label: "CA",
                color: "purple"
              }
            ]
          }
        ],
        track: [{ side: 2 }, { side: 4 }, { side: 6 }],
        hexes: ["G12"]
      },
      {
        color: "yellow",
        labels: [
          {
            label: "NY",
            angle: 270,
            percent: 0.667
          }
        ],
        values: [
          {
            value: 40,
            angle: 115,
            percent: 0.667
          }
        ],
        cities: [
          {
            angle: 180,
            percent: 0.5,
            companies: [{ label: "BAC", color: "blue" }]
          },
          {
            angle: 30,
            percent: 0.5,
            name: {
              name: "Buenos Aires",
              rotation: 30
            },
            companies: [{ label: "BAS", color: "darkGreen" }]
          }
        ],
        track: [
          {
            type: "stop",
            side: 4
          },
          {
            type: "sharp",
            side: 1
          }
        ],
        hexes: ["H17"]
      },
      {
        color: "yellow",
        labels: [
          {
            label: "OO",
            angle: 210,
            percent: 0.667
          }
        ],
        cities: [
          {
            angle: 120,
            percent: 0.5,
            name: {
              name: "San Juan",
              reverse: true
            }
          },
          {
            angle: -60,
            percent: 0.5
          }
        ],
        hexes: ["C16"]
      },
      {
        color: "yellow",
        labels: [
          {
            label: "OO",
            angle: 210,
            percent: 0.667
          }
        ],
        cities: [
          {
            angle: 120,
            percent: 0.5,
            name: {
              name: "Parana",
              reverse: true
            }
          },
          {
            angle: -60,
            percent: 0.5,
            name: {
              name: "Santa Fe"
            },
            companies: [
              {
                label: "SF",
                color: "red"
              }
            ]
          }
        ],
        hexes: ["G8"]
      },
      {
        color: "yellow",
        labels: [
          {
            label: "OO",
            angle: 210,
            percent: 0.667
          }
        ],
        values: [
          {
            value: 20,
            angle: 30,
            percent: 0.5
          }
        ],
        cities: [
          {
            angle: 120,
            percent: 0.5
          },
          {
            angle: -60,
            percent: 0.5,
            name: {
              name: "Mendoza"
            },
            companies: [
              {
                label: "AGW",
                color: "yellow"
              }
            ]
          }
        ],
        track: [{ type: "stop", side: 6 }],
        hexes: ["B13"]
      }
    ]
  }
};

export default game;
