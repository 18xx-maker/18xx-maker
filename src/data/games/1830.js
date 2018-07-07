const game = {
  // Generic Game Info
  info: {
    title: "1830",
    subtitle: "Railways & Robber Barons",
    designer: "Francis Tresham",
    background: "gray",
    width: 150,
    rotation: 90
  },

  // Extra Tokens
  tokens: ["Round"],

  // Railway Companies
  companies: [
    {
      name: "Pennsylvania",
      abbrev: "PRR",
      tokens: ["Free", "$40", "$100", "$100", "$100"],
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
      tokens: ["Free", "$40", "$100", "$100", "$100"],
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
      tokens: ["Free", "$40", "$100", "$100", "$100"],
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
      tokens: ["Free", "$40", "$100", "$100"],
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
      tokens: ["Free", "$40", "$100", "$100"],
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
      abbrev: "Erie",
      tokens: ["Free", "$40", "$100", "$100"],
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
      tokens: ["Free", "$40", "$100"],
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
      tokens: ["Free", "$40", "$100"],
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
      description: "Cost $800 when exchanging a 4, 5, or 6 train",
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
      notes: "Private companies can be bought"
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
      notes: "Private companies close"
    },
    {
      name: "6",
      limit: "2",
      number: "2",
      rust: "3",
      tiles: "brown",
      notes: "D Trains available for purchase"
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
          note: "No more than 50% of a company may be in the market"
        },
        {
          color: "orange",
          note: "No stock sales during first stock round"
        }
      ]
    },
    {
      name: "IPO",
      notes: [
        {
          color: "green",
          note: "Companies float once 60% sold"
        }
      ]
    },
    {
      name: "Trains",
      notes: [
        {
          color: "yellow",
          note: "D trains available after first 6 is bought"
        },
        {
          color: "yellow",
          note: "4, 5, and 6 can be exchanged for a D train"
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
      steps: ["Buy one certificate", "Sell any number of certificates"],
      ordered: false
    },
    {
      name: "Operating Round",
      steps: [
        "Lay track",
        "Purchase token",
        "Run trains",
        "Collect revenue",
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
    hexWidth: 150,
    hexes: [
      {
        color: "offboard",
        labels: [{
          label: "Gulf",
          x: -20,
          rotate: 0
        }],
        offBoardRevenue: {
          x: -20,
          y: 30,
          revenues: [
            {
              color: "yellow",
              cost: "30"
            },
            {
              color: "brown",
              cost: "60"
            }
          ]
        },
        offBoardTrack: [
          {
            side: 4
          }
        ],
        hexes: ["I1"]
      },
      {
        color: "gray",
        cities: [
          {
            rotate: 0,
            name: {
              name: "Lansing"
            }
          }
        ],
        values: [
          {
            x: -50,
            y: 0,
            value: 20,
            rotate: 0
          }
        ],
        track: [
          {
            start: 4
          },
          {
            start: 5
          }
        ],
        hexes: ["D2"]
      },
      {
        color: "offboard",
        labels: [{
          label: "Chicago",
          x: -25,
          rotate: 0
        }],
        offBoardRevenue: {
          x: -25,
          y: 30,
          revenues: [
            {
              color: "yellow",
              cost: "40"
            },
            {
              color: "brown",
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
          },
          {
            side: 5
          }
        ],
        hexes: ["F2"]
      },
      {
        copy: "I1",
        offBoardTrack: [
          {
            side: 3
          }
        ],
        hexes: ["J2"]
      },
      {
        color: "plain",
        cities: [
          {
            x: -15,
            y: -25,
            rotate: 0,
            name: {
              name: "Toledo",
              rotation: 30
            }
          }
        ],
        water: {
          x: 15,
          y: 25,
          cost: "$80",
          size: "small"
        },
        hexes: ["F4"]
      },
      {
        copy: "F4",
        cities: [
          {
            name: {
              name: "Washington"
            }
          }
        ],
        hexes: ["J14"]
      },
      {
        copy: "F4",
        cities: [
          {
            name: {
              name: "Providence"
            }
          }
        ],
        hexes: ["F22"]
      },
      {
        color: "yellow",
        water: {
          y: -50,
          cost: "$80",
          size: "small"
        },
        labels: [{
          label: "OO",
          y: 50,
          rotate: 0
        }],
        cities: [
          {
            x: -45,
            y: 20,
            rotate: 0,
            name: {
              name: "Detroit"
            }
          },
          {
            x: 45,
            y: 20,
            rotate: 0,
            name: {
              name: "Windsor"
            }
          }
        ],
        hexes: ["E5"]
      },
      {
        copy: "E5",
        cities: [
          {
            name: {
              name: "Hamilton"
            }
          },
          {
            name: {
              name: "Toronto"
            }
          }
        ],
        hexes: ["D10"]
      },
      {
        copy: "A17",
        values: [
          {
            value: 30,
            y: -30,
            rotate: 0
          }
        ],
        cities: [
          {
            y: 40,
            rotate: 0,
            name: {
              name: "Cleveland"
            },
            companies: [
              {
                label: "C&O",
                color: "cyan"
              }
            ]
          }
        ],
        hexes: ["F6"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            rotate: 0,
            name: {
              name: "London"
            }
          }
        ],
        borders: [
          {
            side: 5,
            color: "water"
          }
        ],
        hexes: ["E7"]
      },
      {
        color: "plain",
        borders: [
          {
            side: 2,
            color: "water"
          }
        ],
        hexes: ["F8"]
      },
      {
        color: "offboard",
        labels: [{
          label: "Canadian West",
          rotate: 0
        }],
        offBoardRevenue: {
          y: -30,
          revenues: [
            {
              color: "yellow",
              cost: "30"
            },
            {
              color: "brown",
              cost: "50"
            }
          ]
        },
        offBoardTrack: [
          {
            side: 5
          }
        ],
        hexes: ["A9"]
      },
      {
        color: "gray",
        track: [
          {
            start: 2,
            end: 3
          }
        ],
        hexes: ["E9"]
      },
      {
        copy: "A9",
        offBoardTrack: [
          {
            side: 6
          }
        ],
        hexes: ["A11"]
      },
      {
        color: "plain",
        borders: [
          {
            side: 5,
            color: "water"
          }
        ],
        hexes: ["C11"]
      },
      {
        color: "plain",
        borders: [
          {
            side: 6,
            color: "water"
          }
        ],
        hexes: ["C13"]
      },
      {
        color: "offboard",
        labels: [{
          label: "Deep South",
          y: 30,
          rotate: 0
        }],
        offBoardRevenue: {
          revenues: [
            {
              color: "yellow",
              cost: "30"
            },
            {
              color: "brown",
              cost: "40"
            }
          ]
        },
        offBoardTrack: [
          {
            side: 2
          },
          {
            side: 3
          }
        ],
        hexes: ["K13"]
      },
      {
        color: "yellow",
        labels: [
          {
            label: "OO",
            y: 50,
            rotate: 0
          }
        ],
        cities: [
          {
            x: -40,
            y: 10,
            rotate: 0,
            name: {
              name: "Dunkirk",
              rotation: 30
            },
            companies: [
              {
                label: "Erie",
                color: "yellow"
              }
            ]
          },
          {
            x: 40,
            y: 10,
            rotate: 0,
            name: {
              name: "Buffalo",
              rotation: -30
            },
            companies: [
              {
                label: "Erie",
                color: "yellow"
              }
            ]
          }
        ],
        hexes: ["E11"]
      },
      {
        color: "plain",
        borders: [
          {
            color: "water",
            side: 2
          },
          {
            color: "water",
            side: 3
          }
        ],
        hexes: ["D12"]
      },
      {
        color: "gray",
        values: [
          {
            value: 10,
            rotate: 0,
            y: -60
          }
        ],
        cities: [
          {
            rotate: 0,
            name: {
              name: "Altoona"
            },
            companies: [
              {
                label: "PRR",
                color: "darkGreen"
              }
            ]
          }
        ],
        track: [
          {
            type: "straight",
            side: 1
          },
          {
            type: "bent",
            side: 1
          }
        ],
        hexes: ["H12"]
      },
      {
        color: "plain",
        labels: [
          {
            label: "B&O",
            rotate: 0
          }
        ],
        hexes: ["I13"]
      },
      {
        color: "gray",
        cities: [
          {
            rotate: 0,
            name: {
              name: "Rochester"
            }
          }
        ],
        values: [
          {
            value: 20,
            y: -60,
            rotate: 0
          }
        ],
        track: [
          {
            type: "city",
            side: 1
          },
          {
            type: "city",
            side: 4
          },
          {
            type: "city",
            side: 6
          }
        ],
        hexes: ["D14"]
      },
      {
        color: "gray",
        values: [
          {
            value: 10,
            x: -20,
            y: -40,
            rotate: 0
          }
        ],
        centerTowns: [
          {
            rotate: 0,
            name: {
              name: "Kingston",
              reverse: true
            }
          }
        ],
        track: [
          {
            type: "city",
            side: 1
          },
          {
            type: "city",
            side: 3
          }
        ],
        hexes: ["C15"]
      },
      {
        color: "plain",
        mountain: {
          size: "medium",
          cost: "$120",
          y: 30
        },
        labels: [{
          label: "SVR",
          rotate: 0,
          y: -30
        }],
        hexes: ["G15"]
      },
      {
        color: "yellow",
        labels: [
          {
            label: "B",
            rotate: 0,
            y: -45,
            x: -25
          },
          {
            label: "B&O",
            rotate: 0,
            y: -45,
            x: 25
          }
        ],
        values: [
          {
            value: 30,
            rotate: 0,
            x: -50
          }
        ],
        cities: [
          {
            rotate: 0,
            name: {
              name: "Baltimore",
              reverse: true,
              rotation: -30
            },
            companies: [
              {
                label: "B&O",
                color: "blue"
              }
            ]
          }
        ],
        track: [
          {
            type: "city",
            side: 4
          },
          {
            type: "city",
            side: 6
          }
        ],
        hexes: ["I15"]
      },
      {
        color: "gray",
        cities: [
          {
            rotate: 0,
            name: {
              name: "Richmond",
              reverse: true
            }
          }
        ],
        values: [
          {
            value: 20,
            rotate: 0,
            x: 50
          }
        ],
        track: [
          {
            type: "city",
            side: 2
          }
        ],
        hexes: ["K15"]
      },
      {
        color: "plain",
        cities: [
          {
            rotate: 0,
            name: {
              name: "Ottowa"
            }
          }
        ],
        borders: [
          {
            side: 5,
            color: "water"
          }
        ],
        hexes: ["B16"]
      },
      {
        color: "plain",
        mountain: {
          cost: "$120",
          size: "medium",
          y: -25
        },
        cities: [
          {
            y: 25,
            x: 30,
            rotate: 0,
            name: {
              name: "Scranton",
              rotation: 45
            }
          }
        ],
        labels: [{
          label: "D&H",
          rotate: 0,
          y: 30,
          x: -30
        }],
        hexes: ["F16"]
      },
      {
        color: "gray",
        track: [
          {
            type: "sharp",
            side: 5
          }
        ],
        hexes: ["A17"]
      },
      {
        color: "plain",
        mountain: {
          cost: "$120",
          size: "medium"
        },
        borders: [
          {
            side: 2,
            color: "water"
          }
        ],
        hexes: ["C17"]
      },
      {
        color: "plain",
        labels: [{
          rotate: 0,
          label: "M&H"
        }],
        hexes: ["D18"]
      },
      {
        color: "yellow",
        labels: [
          {
            label: "C&A",
            rotate: 0,
            y: -30
          },
          {
            label: "OO",
            y: 57,
            rotate: 0
          }
        ],
        cities: [
          {
            x: -40,
            y: 10,
            rotate: 0,
            name: {
              name: "Philidelphia",
              reverse: true
            }
          },
          {
            x: 40,
            y: 10,
            rotate: 0,
            name: {
              name: "Trenton",
              reverse: true
            }
          }
        ],
        hexes: ["H18"]
      },
      {
        copy: "F6",
        values: [
          {
            value: 40,
          }
        ],
        cities: [
          {
            name: {
              name: "Montreal"
            },
            companies: [
              {
                label: "CPR",
                color: "red"
              }
            ]
          }
        ],
        hexes: ["A19"]
      },
      {
        color: "plain",
        cities: [
          {
            rotate: 0,
            name: {
              name: "Albany"
            },
            companies: [
              {
                label: "NYC",
                color: "black"
              }
            ]
          }
        ],
        hexes: ["E19"]
      },
      {
        color: "yellow",
        values: [
          {
            y: -63,
            rotate: 0,
            value: 40
          },
          {
            y: 63,
            rotate: 0,
            value: 40
          }
        ],
        cities: [
          {
            x: 30,
            y: -30,
            rotate: 0,
            name: {
              name: "New York",
              reverse: true
            },
            companies: [
              {
                label: "NYNH",
                color: "orange"
              }
            ]
          },
          {
            x: -30,
            y: 30,
            rotate: 0,
            name: {
              name: "Newark"
            }
          }
        ],
        labels: [
          {
            label: "NY",
            rotate: 0,
            y: -28,
            x: -25
          }
        ],
        water: {
          x: 35,
          y: 25,
          cost: "$80",
          size: "small"
        },
        track: [
          {
            type: "stop",
            side: 3
          },
          {
            type: "stop",
            side: 6
          }
        ],
        hexes: ["G19"]
      },
      {
        color: "gray",
        centerTowns: [
          {
            rotate: 0,
            name: {
              name: "Atlantic City",
              reverse: true
            }
          }
        ],
        track: [
          {
            type: "city",
            side: 1
          },
          {
            type: "city",
            side: 2
          }
        ],
        values: [
          {
            x: 50,
            value: 10,
            rotate: 0
          }
        ],
        hexes: ["I19"]
      },
      {
        copy: "I19",
        centerTowns: [
          {
            name: {
              name: "Fall River"
            }
          }
        ],
        hexes: ["F24"]
      },
      {
        color: "plain",
        labels: [{
          label: "C&St L",
          y: 30,
          rotate: 0
        }],
        centerTowns: [
          {
            rotate: 0,
            name: {
              name: "Burlington"
            }
          }
        ],
        hexes: ["B20"]
      },
      {
        color: "yellow",
        labels: [
          {
            label: "B",
            rotate: 0,
            y: -45,
            x: -25
          }
        ],
        cities: [
          {
            rotate: 0,
            name: {
              name: "Boston",
              reverse: true,
              rotation: -90
            },
            companies: [
              {
                label: "B&M",
                color: "maroon"
              }
            ]
          }
        ],
        values: [
          {
            value: 30,
            rotate: 0,
            x: -50
          }
        ],
        track: [
          {
            type: "city",
            side: 3
          },
          {
            type: "city",
            side: 5
          }
        ],
        hexes: ["E23"]
      },
      {
        color: "offboard",
        labels: [{
          label: "Maritime Provinces",
          rotate: 0,
          y: -25,
          x: 5
        }],
        offBoardRevenue: {
          y: 0,
          revenues: [
            {
              cost: "20",
              color: "yellow"
            },
            {
              cost: "30",
              color: "brown"
            }
          ]
        },
        offBoardTrack: [
          {
            side: 1
          },
          {
            side: 6
          }
        ],
        hexes: ["B24"]
      },
      {
        color: "gray",
        track: [
          {
            type: "sharp",
            side: 6
          }
        ],
        hexes: ["D24"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            rotate: 0,
            name: {
              name: "Flint"
            }
          }
        ],
        hexes: ["D4"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            rotate: 0,
            name: {
              name: "Erie"
            }
          }
        ],
        hexes: ["F10"]
      },
      {
        color: "plain",
        centerTowns: [
          { x: -30, rotate: 0, name: { name: "Akron", reverse: true } },
          { x: 30, rotate: 0, name: { name: "Canton" } }
        ],
        hexes: ["G7"]
      },
      {
        copy: "G7",
        centerTowns: [
          { name: { name: "Reading" } },
          { name: { name: "Allentown" } }
        ],
        hexes: ["G17"]
      },
      {
        copy: "G7",
        centerTowns: [
          { name: { name: "New Haven" } },
          { name: { name: "Hartford" } }
        ],
        hexes: ["F20"]
      },
      {
        color: "plain",
        cities: [
          {
            rotate: 0,
            name: {
              name: "Columbus"
            }
          }
        ],
        hexes: ["H4"]
      },
      {
        copy: "H4",
        cities: [
          {
            name: {
              name: "Barrie"
            }
          }
        ],
        hexes: ["B10"]
      },
      {
        copy: "H4",
        cities: [
          {
            name: {
              name: "Pittsburgh"
            }
          }
        ],
        hexes: ["H10"]
      },
      {
        copy: "H4",
        cities: [
          {
            name: {
              name: "Lancaster"
            }
          }
        ],
        hexes: ["H16"]
      },
      {
        color: "plain",
        water: {
          cost: "$80",
          size: "small"
        },
        hexes: ["D6", "I17", "B18", "C19"]
      },
      {
        color: "plain",
        mountain: {
          cost: "$120",
          size: "medium"
        },
        hexes: ["C21", "D22", "E17", "E21", "G13", "I11", "J10", "J12"]
      },
      {
        color: "plain",
        hexes: [
          "B12",
          "B14",
          "B22",
          "C7",
          "C9",
          "C23",
          "D8",
          "D16",
          "D20",
          "E3",
          "E13",
          "E15",
          "F12",
          "F14",
          "F18",
          "G3",
          "G5",
          "G9",
          "G11",
          "H2",
          "H6",
          "H8",
          "H14",
          "I3",
          "I5",
          "I7",
          "I9",
          "J4",
          "J6",
          "J8"
        ]
      }
    ]
  }
};

export default game;
