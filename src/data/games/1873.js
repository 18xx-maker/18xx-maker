const game = {
  // Generic Game Info
  info: {
    title: "Harzbahn 1873",
    abbrev: "1873",
    subtitle: "Mining and Railways in the Harz Mountains",
    designer: "Klaus Kiermeier",
    background: "brown",
    width: 150
  },

  // Extra Tokens
  tokens: ["Round"],

  // Need an IPO sheet
  ipo: false,

  players: [
    {
      number: 2,
      capital: "2100M"
    },
    {
      number: 3,
      capital: "1400M"
    },
    {
      number: 4,
      capital: "1050M"
    },
    {
      number: 5,
      capital: "840M"
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
    type: "1D",
    market: [
      50,
      70,
      85,
      100,
      110,
      120,
      130,
      140,
      150,
      160,
      170,
      180,
      190,
      200,
      220,
      240,
      260,
      280,
      300,
      330,
      360,
      390,
      420,
      450,
      490,
      530,
      570,
      610,
      650,
      700,
      750,
      800,
      850,
      900,
      950,
      1000
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
    "70": 67
  },

  map: {
    hexes: [
      {
        color: "plain",
        hexes: ["C18"]
      },
      {
        color: "gray",
        cities: [
          {
            size: 2,
            companies: [
              {
                label: "NWE",
                color: "darkGreen"
              },
              {
                label: "WBE",
                color: "gray"
              }
            ],
            name: {
              name: "Wernigerode"
            }
          }
        ],
        track: [
          {
            side: 1
          },
          {
            side: 4
          },
          {
            side: 5,
            gauge: "narrow"
          },
          {
            side: 6,
            gauge: "narrow"
          }
        ],
        offBoardRevenue: {
          percent: 0.5,
          revenues: [
            {
              color: "yellow",
              cost: "60"
            },
            {
              color: "green",
              cost: "80"
            },
            {
              color: "brown",
              cost: "120"
            },
            {
              color: "gray",
              cost: "150"
            }
          ]
        },
        hexes: ["B9"]
      },
      {
        color: "gray",
        cities: [
          {
            size: 2,
            name: {
              name: "Derenburg"
            }
          }
        ],
        track: [
          {
            side: 4,
            gauge: "narrow"
          },
          {
            side: 5,
            gauge: "narrow"
          }
        ],
        offBoardRevenue: {
          percent: 0.5,
          revenues: [
            {
              color: "yellow",
              cost: "30"
            },
            {
              color: "green",
              cost: "70"
            },
            {
              color: "brown",
              cost: "60"
            },
            {
              color: "gray",
              cost: "60"
            }
          ]
        },
        hexes: ["B13"]
      },
      {
        color: "plain",
        mountain: {
          size: "small",
          cost: "50M"
        },
        hexes: ["B15"]
      },
      {
        color: "plain",
        track: [
          {
            type: "gentle",
            side: 4,
            gauge: "line"
          }
        ],
        hexes: ["B17"]
      },
      {
        color: "green",
        track: [
          {
            side: 1,
            gauge: "narrow"
          },
          {
            side: 2
          },
          {
            side: 5
          }
        ],
        cities: [
          {
            companies: [
              {
                label: "HBE",
                color: "red"
              }
            ],
            name: {
              name: "Halberstadt",
              offset: 66.67
            }
          }
        ],
        values: [
          {
            value: 60,
            angle: 240,
            percent: 0.8
          }
        ],
        labels: [
          {
            label: "HQG",
            angle: 30,
            percent: 0.667
          }
        ],
        hexes: ["B19"]
      },
      {
        color: "gray",
        cities: [
          {
            name: {
              name: "Brocken",
              reverse: true,
              offset: 33.33
            }
          }
        ],
        track: [
          {
            side: 5,
            gauge: "narrow"
          }
        ],
        offBoardRevenue: {
          angle: 180,
          percent: 0.5,
          revenues: [
            {
              color: "yellow",
              cost: "50"
            },
            {
              color: "green",
              cost: "80"
            },
            {
              color: "brown",
              cost: "120"
            },
            {
              color: "gray",
              cost: "150"
            }
          ]
        },
        hexes: ["C4"]
      },
      {
        color: "gray",
        values: [
          {
            value: 0,
            angle: 90,
            percent: 0.667
          }
        ],
        centerTowns: [
          {
            name: {
              name: "Knaupsholz"
            }
          }
        ],
        track: [
          {
            side: 6,
            gauge: "narrow"
          }
        ],
        hexes: ["C6"]
      },
      {
        color: "plain",
        mountain: {
          size: "medium",
          cost: "150M",
          angle: 300,
          percent: 0.5
        },
        track: [
          {
            type: "straight",
            side: 3,
            gauge: "line"
          }
        ],
        borders: [
          {
            side: 5,
            color: "red"
          }
        ],
        hexes: ["C8"]
      },
      {
        color: "brown",
        track: [
          {
            type: "gentle",
            side: 2,
            gauge: "line"
          }
        ],
        borders: [
          {
            side: 6,
            color: "red"
          },
          {
            side: 5,
            color: "mountain"
          }
        ],
        hexes: ["C10"]
      },
      {
        color: "brown",
        centerTowns: [
          {
            name: {
              name: "Benzingerode"
            }
          }
        ],
        track: [
          {
            type: "straight",
            gauge: "line"
          }
        ],
        borders: [
          {
            side: 5,
            color: "mountain"
          },
          {
            side: 6,
            color: "mountain"
          }
        ],
        hexes: ["C12"]
      },
      {
        color: "brown",
        centerTowns: [
          {
            angle: 30,
            percent: 0.28,
            name: {
              name: "Heimburg",
              rotation: 30
            }
          }
        ],
        track: [
          {
            side: 5,
            type: "gentle",
            gauge: "line"
          }
        ],
        borders: [
          {
            side: 5,
            color: "red"
          },
          {
            side: 6,
            color: "mountain"
          }
        ],
        hexes: ["C14"]
      },
      {
        color: "green",
        values: [
          {
            value: 30,
            angle: 90,
            percent: 0.667
          }
        ],
        cities: [
          {
            name: {
              name: "Langenstein",
              reverse: true,
              offset: 66.67
            }
          }
        ],
        borders: [{
          side: 6,
          color: "red"
        }],
        track: [
          {
            gauge: "narrow",
            side: 2
          },
          {
            gauge: "narrow",
            side: 3
          },
          {
            gauge: "narrow",
            side: 6
          }
        ],
        hexes: ["C16"]
      },
      {
        color: "gray",
        track: [
          {
            type: "straight",
            side: 2
          }
        ],
        hexes: ["C20"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            name: {
              name: "Schierke",
              reverse: true
            },
            angle: 150,
            percent: 0.5
          }
        ],
        borders: [{
          side: 6,
          color: "mountain"
        }],
        mountain: {
          size: "medium",
          cost: "150M",
          angle: 300,
          percent: 0.5
        },
        hexes: ["D5"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            name: {
              name: "Drei Annen Hohne",
              rotation: -60
            }
          }
        ],
        track: [
          {
            side: 3,
            type: "straight",
            gauge: "line"
          }
        ],
        mountain: {
          size: "medium",
          cost: "150M",
          angle: 300,
          percent: 0.5
        },
        borders: [
          {
            side: 4,
            color: "red"
          }
        ],
        hexes: ["D7"]
      },
      {
        color: "yellow",
        mountain: {
          cost: "50M",
          angle: 180,
          percent: 0.75
        },
        cities: [
          {
            name: {
              name: "Elbingerode",
              reverse: true,
              offset: 33.33
            }
          }
        ],
        values: [
          {
            angle: 270,
            percent: 0.6,
            value: 30
          }
        ],
        track: [
          {
            side: 5,
            gauge: "narrow"
          }
        ],
        borders: [
          {
            side: 1,
            color: "red"
          },
          {
            side: 2,
            color: "red"
          },
          {
            side: 3,
            color: "red"
          },
          {
            side: 5,
            color: "red"
          },
          {
            side: 6,
            color: "red"
          },
          {
            side: 4,
            color: "mountain"
          }
        ],
        hexes: ["D9"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            name: {
              name: "Hüttenrode",
              reverse: true
            },
            angle: 150,
            percent: 0.5
          }
        ],
        mountain: {
          size: "medium",
          cost: "100M",
          angle: 300,
          percent: 0.5
        },
        borders: [
          {
            side: 1,
            color: "mountain"
          },
          {
            side: 2,
            color: "mountain"
          },
          {
            side: 3,
            color: "mountain"
          }
        ],
        hexes: ["D11"]
      },
      {
        copy: "D11",
        centerTowns: [
          {
            name: {
              name: "Braunesurnpf"
            }
          }
        ],
        mountain: {
          cost: "150M"
        },
        borders: [
          {
            side: 4,
            color: "red"
          },
          {
            side: 2,
            color: "mountain"
          },
          {
            side: 3,
            color: "mountain"
          }
        ],
        hexes: ["D13"]
      },
      {
        color: "yellow",
        values: [{
          value: 40,
          percent: 0.75
        }],
        labels: [{
          label: "B",
          angle: 180,
          percent: 0.667
        }],
        track: [{
          side: 1,
          gauge: "narrow"
        },{
          side: 2,
          gauge: "line"
        },{
          side: 3,
          gauge: "narrow"
        },{
          side: 5,
          gauge: "narrow"
        }],
        cities: [{
          size: 2,
          companies: [{
            color: "gray",
            label: "WBE"
          },{
            color: "red",
            label: "HBE"
          }],
          name: {
            name: "Blankenburg",
            reverse: true,
            offset: 40
          }
        }],
        borders: [{
          side: 1,
          color: "red"
        },{
          side: 2,
          color: "red"
        },{
          side: 3,
          color: "red"
        },{
          side: 4,
          color: "red"
        },{
          side: 5,
          color: "red"
        },{
          side: 6,
          color: "red"
        }],
        hexes: ["D15"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            name: {
              name: "Westerhausen"
            }
          }
        ],
        borders: [{
          side: 1,
          color: "red"
        }],
        hexes: ["D17"]
      },
      {
        color: "plain",
        borders: [{
          side: 5,
          color: "red"
        }],
        hexes: ["D19"]
      },
      {
        color: "gray",
        track: [
          {
            type: "gentle",
            side: 6
          }
        ],
        borders: [{
          side: 6,
          color: "red"
        }],
        hexes: ["D21"]
      },
      {
        color: "yellow",
        borders: [{
          side: 3,
          color: "mountain"
        },{
          side: 1,
          color: "red"
        },{
          side: 2,
          color: "red"
        },{
          side: 4,
          color: "red"
        },{
          side: 5,
          color: "red"
        },{
          side: 6,
          color: "red"
        }],
        values: [{
          value: 30,
          angle: 60,
          percent: 0.667
        }],
        mountain: {
          cost: "50M",
          size: "small",
          angle: 300,
          percent: 0.6
        },
        cities: [{
          name: {
            name: "Braunlage / Wurmberg"
          },
          companies: [{
            label: "SHE",
            color: "yellow"
          }]
        }],
        track: [{
          side: 6,
          gauge: "narrow"
        }],
        hexes: ["E4"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            name: {
              name: "Elend",
              rotation: -60
            }
          }
        ],
        track: [
          {
            side: 3,
            type: "straight",
            gauge: "line"
          }
        ],
        mountain: {
          size: "small",
          cost: "50M",
          angle: 300,
          percent: 0.5
        },
        borders: [
          {
            side: 1,
            color: "red"
          }
        ],
        hexes: ["E6"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            name: {
              name: "Kõnigshütte",
              reverse: true
            },
            angle: 150,
            percent: 0.5
          }
        ],
        borders: [{
          side: 3,
          color: "red"
        },{
          side: 4,
          color: "mountain"
        }],
        mountain: {
          size: "medium",
          cost: "100M",
          angle: 300,
          percent: 0.5
        },
        hexes: ["E8"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            name: {
              name: "Rübeland",
              reverse: true
            },
            angle: 150,
            percent: 0.5
          }
        ],
        borders: [{
          side: 2,
          color: "red"
        },{
          side: 5,
          color: "red"
        },{
          side: 1,
          color: "mountain"
        },{
          side: 4,
          color: "mountain"
        }],
        mountain: {
          size: "medium",
          cost: "100M",
          angle: 300,
          percent: 0.5
        },
        hexes: ["E10"]
      },
      {
        color: "plain",
        borders: [{
          side: 6,
          color: "red"
        },{
          side: 1,
          color: "mountain"
        }],
        mountain: {
          size: "medium",
          cost: "100M"
        },
        hexes: ["E12"]
      },
      {
        color: "plain",
        borders: [{
          side: 3,
          color: "red"
        },{
          side: 5,
          color: "red"
        }],
        mountain: {
          size: "medium",
          cost: "150M"
        },
        hexes: ["E14"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            name: {
              name: "Timmenrode",
              reverse: true
            },
            angle: 150,
            percent: 0.5
          }
        ],
        borders: [{
          side: 2,
          color: "red"
        },{
          side: 6,
          color: "red"
        }],
        mountain: {
          size: "small",
          cost: "50M",
          angle: 300,
          percent: 0.5
        },
        hexes: ["E16"]
      },
      {
        color: "gray",
        cities: [{
          size: 2,
          name: {
            name: "Weddersleben",
            reverse: true
          }
        }],
        values: [{
          value: 30,
          angle: 210,
          percent: 0.725
        }],
        borders: [{
          side: 4,
          color: "red"
        }],
        track: [{
          side: 1,
          gauge: "narrow"
        },{
          side: 2,
          gauge: "narrow"
        },{
          side: 4,
          gauge: "narrow"
        }],
        hexes: ["E18"]
      },
      {
        color: "green",
        values: [{
          value: 60,
          angle: 300,
          percent: 0.75
        }],
        borders: [{
          side: 1,
          color: "red"
        },{
          side: 2,
          color: "red"
        },{
          side: 3,
          color: "red"
        },{
          side: 4,
          color: "red"
        },{
          side: 5,
          color: "red"
        },{
          side: 6,
          color: "red"
        }],
        labels: [{
          label: "HQG",
          angle: 150,
          percent: 0.65
        }],
        cities: [{
          companies: [{
            label: "QLB",
            color: "orange"
          }],
          name: {
            name: "Quedlinburg",
            reverse: true,
            offset: 66.67
          }
        }],
        track: [{
          side: 3
        },{
          side: 6
        },{
          side: 1,
          gauge: "narrow"
        }],
        hexes: ["E20"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            name: {
              name: "Brunnenbachsmühle",
              rotation: -60
            }
          }
        ],
        track: [
          {
            side: 3,
            type: "straight",
            gauge: "line"
          }
        ],
        mountain: {
          size: "medium",
          cost: "150M",
          angle: 300,
          percent: 0.5
        },
        borders: [
          {
            side: 3,
            color: "red"
          },
          {
            side: 5,
            color: "red"
          }
        ],
        hexes: ["F3"]
      },
      {
        color: "green",
        values: [{
          value: 20,
          angle: 150,
          percent: 0.667
        }],
        mountain: {
          angle: 5,
          percent: 0.5,
          size: "small",
          cost: "50M"
        },
        cities: [{
          angle: 90,
          percent: 0.5,
          name: {
            name: "Sorge",
            reverse: true
          }
        },{
          angle: 210,
          percent: 0.6
        }],
        borders: [{
          side: 2,
          color: "red"
        },{
          side: 5,
          color: "red"
        },{
          side: 6,
          color: "mountain"
        }],
        track: [{
          side: 1,
          type: "straight",
          gauge: "narrow",
          cross: "over"
        },{
          side: 3,
          type: "gentle",
          gauge: "narrow",
          cross: "under"
        }],
        hexes: ["F5"]
      },
      {
        color: "green",
        values: [{
          value: 20,
          angle: -30,
          percent: 0.1
        }],
        mountain: {
          angle: -30,
          percent: 0.5,
          size: "small",
          cost: "50M"
        },
        borders: [{
          side: 6,
          color: "red"
        }],
        cities: [{
          angle: 90,
          percent: 0.6
        },{
          angle: 210,
          percent: 0.6,
          name: {
            name: "Tanne",
            reverse: true,
            offset: 60
          }
        }],
        track: [{
          type: "stop",
          gauge: "narrow",
          side: 1
        },{
          type: "stop",
          gauge: "narrow",
          side: 3
        }],
        hexes: ["F7"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            name: {
              name: "Trautenstein",
              reverse: true
            },
            angle: 150,
            percent: 0.5
          }
        ],
        borders: [{
          side: 4,
          color: "red"
        }],
        mountain: {
          size: "medium",
          cost: "100M",
          angle: 300,
          percent: 0.5
        },
        hexes: ["F9"]
      },
      {
        color: "yellow",
        cities: [{
          name: {
            name: "Hasselfeld",
            reverse: true,
            offset: 33.33
          }
        }],
        track: [{
          side: 5,
          gauge: "narrow"
        }],
        borders: [{
          side: 1,
          color: "red"
        },{
          side: 2,
          color: "red"
        },{
          side: 3,
          color: "red"
        },{
          side: 4,
          color: "red"
        },{
          side: 5,
          color: "red"
        },{
          side: 6,
          color: "red"
        }],
        values: [{
          value: 30,
          angle: 270,
          percent: 0.625
        }],
        mountain: {
          angle: 180,
          percent: 0.75,
          cost: "50M",
          size: "small"
        },
        hexes: ["F11"]
      },
      {
        color: "gray",
        borders: [{
          side: 1,
          color: "red"
        },{
          side: 4,
          color: "red"
        }],
        hexes: ["F13"]
      },
      {
        color: "gray",
        cities: [{
          name: {
            name: "Thale",
            offset: 40
          }
        }],
        track: [{
          side: 3,
          gauge: "narrow"
        },{
          side: 4
        }],
        borders: [{
          side: 1,
          color: "red"
        },{
          side: 2,
          color: "red"
        },{
          side: 3,
          color: "red"
        },{
          side: 4,
          color: "red"
        },{
          side: 5,
          color: "red"
        },{
          side: 6,
          color: "red"
        }],
        offBoardRevenue: {
          percent: 0.5,
          revenues: [{
            color: "yellow",
            cost: "30"
          },{
            color: "green",
            cost: "40"
          },{
            color: "brown",
            cost: "60"
          },{
            color: "gray",
            cost: "70"
          }]
        },
        hexes: ["F15"]
      },
      {
        color: "gray",
        borders: [{
          side: 1,
          color: "red"
        }],
        track: [{
          side: 1,
          type: "straight"
        }],
        hexes: ["F17"]
      },
      {
        color: "gray",
        borders: [{
          side: 3,
          color: "red"
        }],
        track: [{
          side: 1,
          type: "gentle"
        },{
          side: 3,
          type: "gentle"
        }],
        hexes: ["F19"]
      }
    ]
  }
};

export default game;
