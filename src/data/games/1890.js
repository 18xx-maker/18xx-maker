const game = {
  // Generic Game Info
  info: {
    title: "1890",
    designer: "Shin-ichi Takasaki",
    background: "water",
    width: 150,
    rotation: 90,
    color_10: "orange"
  },

  // Extra Tokens
  tokens: ["Round"],

  // Need an IPO sheet
  ipo: true,

  bank: "$12,000",

  players: [
    {
      number: 2,
      certLimit: 26,
      capital: "$1260"
    },
    {
      number: 3,
      certLimit: 18,
      capital: "$840"
    },
    {
      number: 4,
      certLimit: 15,
      capital: "$630"
    },
    {
      number: 5,
      certLimit: 13,
      capital: "$504"
    },
    {
      number: 6,
      certLimit: 11,
      capital: "$420"
    },
    {
      number: 7,
      certLimit: 7,
      capital: "$360"
    }
  ],

  // Railway Companies
  companies: [
    {
      name: "Pennsylvania",
      abbrev: "PRR",
      tokens: ["Free", "$40", "$100", "$100"],
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
      name: "New York Central",
      abbrev: "NYC",
      tokens: ["Free", "$40", "$100", "$100"],
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
      name: "Canadian Pacific",
      abbrev: "CPR",
      tokens: ["Free", "$40", "$100", "$100"],
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
      name: "Baltimore & Ohio",
      abbrev: "B&O",
      tokens: ["Free", "$40", "$100"],
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
    },
    {
      name: "Chesapeake & Ohio",
      abbrev: "C&O",
      tokens: ["Free", "$40", "$100"],
      color: "cyan",
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
      name: "Erie",
      abbrev: "ERIE",
      tokens: ["Free", "$40", "$100"],
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
      name: "New York, New Haven & Hartford",
      abbrev: "NYNH",
      tokens: ["Free", "$40"],
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
      name: "Boston & Maine",
      abbrev: "B&M",
      tokens: ["Free", "$40"],
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
    }
  ],

  trains: [
    {
      name: "2",
      quantity: 6,
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
      quantity: 5,
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
      quantity: 4,
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
      quantity: 3,
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
      quantity: 6,
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
      name: "Schuylkill Valley",
      price: "$20",
      revenue: "$5",
      description: ""
    },
    {
      name: "Champlain & St.Lawrence",
      price: "$40",
      revenue: "$10",
      description:
        "A corporation owning the C&StL may lay a tile on the C&StL's hex even if this hex is not connected to the corporations's railhead. This free tile placement is in addition to the corporation's normal tile placement - for this turn only the corporation may play two tiles. The tile played on the C&StL hex does not have to connect to any existing adjacent track."
    },
    {
      name: "Delaware & Hudson",
      price: "$70",
      revenue: "$15",
      description:
        "A corporation owning the Delaware & Hudson may establish a railhead on the D&H hex by laying a station tile and a token. The station does not have to be connected to the remainder of the corporation's route. The tile laid is the owning corporation's one tile placement for the turn. Removal of the mountain costs $120 as usual but there is no charge for laying the token. Placing the token is not required, but if placed in a future turn, it must be paid for. Other corporations may place a tile here subject to the ordinary rules."
    },
    {
      name: "Mohawk & Hudson",
      price: "$110",
      revenue: "$20",
      description:
        "A player owning the M&H may exhange it for a 10% share of the NYC provided he does not already hold 60% of the NYC stock and there is NYC stock available in the Bank or the Pool. The exchange may be made during the player's turn of a stock round or between the turns of other players or corporations in either stock or operating rounds. This action closes the M&H."
    },
    {
      name: "Camden & Amboy",
      price: "$160",
      revenue: "$25",
      description:
        "The initial purchaser of the C&A immediately receives a 10% share of PRR stock without further payment. This action does not close the C&A. The PRR corporation will not be running at this point, but the stock may be retained or sold subject to the ordinary rules of the game."
    },
    {
      name: "Baltimore & Ohio",
      price: "$220",
      revenue: "$30",
      description:
        "The owner of the B&O private company immediately receives the President's certificate of the B&O corporation without further payment. The B&O private company may not be sold to any corporation, and does not exchange hands if the owning player loses the Presidency of the B&O corporation. When the B&O corporation purchases its first train the private company is closed down."
    }
  ],

  phases: [
    {
      name: "2",
      limit: "4",
      number: "6",
      tiles: "yellow"
    },
    {
      name: "3",
      limit: "4",
      number: "5",
      tiles: "green",
      notes: "Private companies may be purchased"
    },
    {
      name: "4",
      rust: "2",
      limit: "3",
      number: "4",
      tiles: "green"
    },
    {
      name: "5",
      limit: "2",
      number: "3",
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
      number: "6",
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
      steps: [
        "Sell any number of shares",
        "Buy one share",
        "Sell any number of shares"
      ],
      ordered: true
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
      cells: [[0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6]]
    },
    market: [
      [
        60,
        67,
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
        53,
        60,
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
      [46, 55, 60, 65, 70, 76, 82, 90, 100, 111, 125, 140, 155, 170, 185, 200],
      [39, 48, 54, 60, 66, 71, 76, 82, 90, 100, 110, 120, 130],
      [32, 41, 48, 55, 62, 67, 71, 76, 82, 90, 100],
      [25, 34, 42, 50, 58, 65, 67, 71, 75, 80],
      [18, 27, 36, 45, 54, 63, 67, 69, 70],
      [10, 12, 30, 40, 50, 60, 67, 68],
      [null, 10, 20, 30, 40, 50, 60],
      [null, null, 10, 20, 30, 40, 50],
      [null, null, null, 10, 20, 30, 40]
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
        hexes: ["E2", "D11", "D13"]
      },
      {
        color: "plain",
        mountain: {
          size: "medium",
          cost: "¥120"
        },
        hexes: ["B9", "B11", "B13", "C4", "C6", "C10", "C12", "C14"]
      },
      {
        color: "plain",
        water: {
          size: "small",
          cost: "¥80"
        },
        hexes: ["C8", "A16", "B15"]
      },
      {
        color: "offboard",
        offBoardRevenue: {
          revenues: [
            {
              color: "yellow",
              cost: "30"
            },
            {
              color: "brown",
              textColor: "white",
              cost: "30"
            },
            {
              color: "black",
              textColor: "white",
              cost: "40"
            }
          ]
        },
        offBoardTrack: [{ side: 6 }],
        hexes: ["A20"]
      },
      {
        color: "yellow",
        values: [
          {
            value: 40,
            angle: 140,
            percent: 0.7
          }
        ],
        water: {
          cost: "80",
          size: "tiny",
          border: true,
          angle: 180,
          percent: 0.8
        },
        cities: [
          {
            angle: 240,
            percent: 0.5
          },
          {
            angle: 330,
            percent: 0.55
          },
          {
            angle: 60,
            percent: 0.5,
            name: {
              name: "Kyoto"
            }
          }
        ],
        track: [
          {
            side: 4,
            type: "sharpStopRev"
          },
          {
            side: 5,
            type: "stop"
          },
          {
            side: 6,
            type: "sharpStop"
          }
        ],
        hexes: ["B17"]
      },
      {
        color: "yellow",
        companies: [
          {
            angle: 60,
            percent: 0.9,
            x: -17,
            label: "K R"
          }
        ],
        track: [{ side: 6, type: "sharp" }],
        hexes: ["B19"]
      },
      {
        color: "offboard",
        offBoardRevenue: {
          revenues: [
            {
              color: "yellow",
              cost: "30"
            },
            {
              color: "brown",
              textColor: "white",
              cost: "30"
            },
            {
              color: "black",
              textColor: "white",
              cost: "40"
            }
          ]
        },
        offBoardTrack: [{ side: 1 }],
        hexes: ["B21"]
      },
      {
        color: "offboard",
        offBoardRevenue: {
          revenues: [
            {
              color: "yellow",
              cost: "10"
            },
            {
              color: "brown",
              textColor: "white",
              cost: "20"
            },
            {
              color: "black",
              textColor: "white",
              cost: "30"
            }
          ]
        },
        offBoardTrack: [{ side: 4 }, { side: 5 }],
        hexes: ["A14"]
      },
      {
        color: "offboard",
        offBoardRevenue: {
          revenues: [
            {
              color: "yellow",
              cost: "10"
            },
            {
              color: "brown",
              textColor: "white",
              cost: "20"
            },
            {
              color: "black",
              textColor: "white",
              cost: "30"
            }
          ]
        },
        offBoardTrack: [{ side: 4 }, { side: 5 }, { side: 6 }],
        hexes: ["B7"]
      },
      {
        color: "plain",
        water: {
          cost: "¥80",
          size: "small"
        },
        borders: [
          {
            color: "water",
            side: 4
          },
          {
            color: "water",
            side: 5
          }
        ],
        hexes: ["C16"]
      },
      {
        color: "plain",
        water: {
          cost: "¥80",
          size: "small",
          percent: 0.5
        },
        cities: [
          {
            angle: 180,
            percent: 0.3,
            name: {
              name: "Fishimi"
            }
          }
        ],
        borders: [
          {
            color: "water",
            side: 1
          }
        ],
        hexes: ["C18"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            name: {
              name: "Miki"
            }
          }
        ],
        hexes: ["D3"]
      },
      {
        color: "gray",
        cities: [
          {
            name: {
              name: "Tanigami"
            }
          }
        ],
        track: [{ side: 1 }, { side: 4 }, { side: 6 }],
        values: [{ value: 20, angle: 330, percent: 0.667 }],
        hexes: ["D5"]
      },
      {
        color: "plain",
        companies: [
          {
            label: "AR",
            angle: 180,
            percent: 0.35
          }
        ],
        centerTowns: [
          {
            percent: 0.4,
            name: {
              name: "Arima"
            }
          }
        ],
        hexes: ["D7"]
      },
      {
        color: "plain",
        cities: [
          {
            angle: 180,
            percent: 0.3,
            name: { name: "Takarazuka" }
          }
        ],
        water: {
          percent: 0.5,
          cost: "¥80",
          size: "small"
        },
        hexes: ["D9"]
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              name: "Takatsuki"
            }
          }
        ],
        borders: [{ side: 4, color: "water" }, { side: 5, color: "water" }],
        hexes: ["D15"]
      },
      {
        color: "plain",
        borders: [
          { side: 1, color: "water" },
          { side: 2, color: "water" },
          { side: 4, color: "water" }
        ],
        hexes: ["D17"]
      },
      {
        color: "offboard",
        offBoardRevenue: {
          revenues: [
            {
              color: "yellow",
              cost: "40"
            },
            {
              color: "brown",
              textColor: "white",
              cost: "50"
            },
            {
              color: "black",
              textColor: "white",
              cost: "70"
            }
          ]
        },
        offBoardTrack: [
          {
            side: 3
          },
          {
            side: 4
          }
        ],
        hexes: ["F1"]
      }
    ]
  }
};

export default game;
