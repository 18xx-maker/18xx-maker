const game = {
  // Generic Game Info
  info: {
    title: "1830",
    subtitle: "Railways & Robber Barons",
    designer: "Francis Tresham",
    background: "green",
    width: 150,
    rotatation: 90
  },
  title: {
    title: "1830",
    x: 0,
    y: 0
  },
  designer: {
    designer: "Francis Tresham",
    x: 5,
    y: 190
  },
  background: {
    color: "green"
  },

  // Extra Tokens
  tokens: ["Round"],

  // Railway Companies
  companies: [
    {
      name: "Pennsylvania",
      abbrev: "PRR",
      tokens: ["Free", "$40", "$100", "$100", "$100"],
      color: "green",
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
        "Lay Track",
        "Purchase Token",
        "Run Trains",
        "Collect Revenue",
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
        offBoardTrack: [
          {
            side: 4
          }
        ],
        hexes: [[1, 9]]
      },
      {
        color: "gray",
        cities: [{}],
        values: [
          {
            x: -30,
            y: -40,
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
        hexes: [[2, 4]]
      },
      {
        color: "offboard",
        label: {
          label: "Chicago",
          x: -25,
          rotate: 0
        },
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
        hexes: [[2, 6]]
      },
      {
        color: "offboard",
        label: {
          label: "Gulf",
          x: -25,
          rotate: 0
        },
        offBoardRevenue: {
          x: -25,
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
            side: 3
          },
          {
            side: 4
          }
        ],
        hexes: [[2, 10]]
      },
      {
        color: "plain",
        cities: [
          {
            x: -15,
            y: -25
          }
        ],
        water: {
          x: 15,
          y: 25,
          cost: "$80",
          size: "small"
        },
        hexes: [[4, 6], [14, 10], [22, 6]]
      },
      {
        color: "yellow",
        water: {
          y: -30,
          cost: "$80",
          size: "small"
        },
        label: {
          label: "OO",
          y: 50,
          rotate: 0
        },
        cities: [
          {
            x: -45,
            y: 20
          },
          {
            x: 45,
            y: 20
          }
        ],
        hexes: [[5, 5], [10, 4]]
      },
      {
        color: "gray",
        track: [
          {
            start: 5,
            end: 6
          }
        ],
        values: [
          {
            value: 30,
            y: -20,
            rotate: 0
          }
        ],
        cities: [
          {
            y: 40,
            rotate: 0,
            companies: [
              {
                label: "C&O",
                color: "cyan"
              }
            ]
          }
        ],
        hexes: [[6, 6]]
      },
      {
        color: "plain",
        centerTowns: [{}],
        borders: [
          {
            side: 5,
            color: "water"
          }
        ],
        hexes: [[7, 5]]
      },
      {
        color: "plain",
        borders: [
          {
            side: 2,
            color: "water"
          }
        ],
        hexes: [[8, 6]]
      },
      {
        color: "offboard",
        offBoardTrack: [
          {
            side: 5
          }
        ],
        offBoardRevenue: {
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
        hexes: [[9, 1]]
      },
      {
        color: "gray",
        track: [
          {
            start: 2,
            end: 3
          }
        ],
        hexes: [[9, 5]]
      },
      {
        color: "offboard",
        label: {
          label: "Canadian West",
          rotate: 0
        },
        offBoardTrack: [
          {
            side: 5
          },
          {
            side: 6
          }
        ],
        hexes: [[11, 1]]
      },
      {
        color: "plain",
        borders: [
          {
            side: 5,
            color: "water"
          }
        ],
        hexes: [[11, 3]]
      },
      {
        color: "plain",
        borders: [
          {
            side: 6,
            color: "water"
          }
        ],
        hexes: [[13, 3]]
      },
      {
        color: "offboard",
        label: {
          label: "Deep South",
          y: 30,
          rotate: 0
        },
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
        hexes: [[13, 11]]
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
            companies: [
              {
                label: "Erie",
                color: "yellow"
              }
            ]
          }
        ],
        hexes: [[11, 5]]
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
        hexes: [[12, 4]]
      },
      {
        color: "gray",
        values: [
          {
            value: 10,
            rotate: 0,
            y: -50
          }
        ],
        cities: [
          {
            rotate: 0,
            companies: [
              {
                label: "PRR",
                color: "green"
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
        hexes: [[12, 8]]
      },
      {
        color: "plain",
        labels: [
          {
            label: "B&O",
            rotate: 0
          }
        ],
        hexes: [[13, 9]]
      },
      {
        color: "gray",
        cities: [{}],
        values: [
          {
            value: 20,
            y: -50,
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
        hexes: [[14, 4]]
      },
      {
        color: "gray",
        values: [
          {
            value: 10,
            x: 20,
            rotate: 0
          }
        ],
        towns: [
          {
            x: -8,
            y: -19,
            rotate: 60
          }
        ],
        track: [
          {
            type: "gentle",
            side: 1
          }
        ],
        hexes: [[15, 3]]
      },
      {
        color: "plain",
        mountain: {
          size: "medium",
          cost: "$120",
          y: 30
        },
        label: {
          label: "SVR",
          rotate: 0,
          y: -30
        },
        hexes: [[15, 7]]
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
        hexes: [[15, 9]]
      },
      {
        color: "gray",
        cities: [{}],
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
        hexes: [[15, 11]]
      },
      {
        color: "plain",
        cities: [{}],
        borders: [
          {
            side: 5,
            color: "water"
          }
        ],
        hexes: [[16, 2]]
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
            x: 30
          }
        ],
        label: {
          label: "D&H",
          rotate: 0,
          y: 30,
          x: -30
        },
        hexes: [[16, 6]]
      },
      {
        color: "gray",
        track: [
          {
            type: "sharp",
            side: 5
          }
        ],
        hexes: [[17, 1]]
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
        hexes: [[17, 3]]
      },
      {
        color: "plain",
        label: {
          rotate: 0,
          label: "M&H"
        },
        hexes: [[18, 4]]
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
            y: 50,
            rotate: 0
          }
        ],
        cities: [
          {
            x: -40,
            y: 10
          },
          {
            x: 40,
            y: 10
          }
        ],
        hexes: [[18, 8]]
      },
      {
        color: "gray",
        track: [
          {
            start: 5,
            end: 6
          }
        ],
        values: [
          {
            value: 40,
            y: -20,
            rotate: 0
          }
        ],
        cities: [
          {
            y: 40,
            rotate: 0,
            companies: [
              {
                label: "CPR",
                color: "red"
              }
            ]
          }
        ],
        hexes: [[19, 1]]
      },
      {
        color: "plain",
        cities: [
          {
            rotate: 0,
            companies: [
              {
                label: "NYC",
                color: "black"
              }
            ]
          }
        ],
        hexes: [[19, 5]]
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
            companies: [
              {
                label: "NYNH",
                color: "orange"
              }
            ]
          },
          {
            x: -30,
            y: 30
          }
        ],
        labels: [
          {
            label: "NY",
            rotate: 0,
            y: -20,
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
        hexes: [[19, 7]]
      },
      {
        color: "gray",
        track: [
          {
            type: "sharp",
            side: 1
          }
        ],
        values: [
          {
            value: 10,
            rotate: 0
          }
        ],
        towns: [
          {
            x: -38,
            y: -20,
            rotate: 33
          }
        ],
        hexes: [[19, 9], [24, 6]]
      },
      {
        color: "plain",
        label: {
          label: "C&St L",
          y: 30,
          rotate: 0
        },
        centerTowns: [{}],
        hexes: [[20, 2]]
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
        hexes: [[23, 5]]
      },
      {
        color: "offboard",
        label: {
          label: "Maritime Provines",
          rotate: 0,
          y: -15,
          x: 5
        },
        offBoardRevenue: {
          y: 10,
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
        hexes: [[24, 2]]
      },
      {
        color: "gray",
        track: [
          {
            type: "sharp",
            side: 6
          }
        ],
        hexes: [[24, 4]]
      },
      {
        color: "plain",
        water: {
          cost: "$80",
          size: "small"
        },
        hexes: [[6, 4], [17, 9], [18, 2], [19, 3]]
      },
      {
        color: "plain",
        mountain: {
          cost: "$120",
          size: "medium"
        },
        hexes: [
          [10, 10],
          [11, 9],
          [12, 10],
          [13, 7],
          [17, 5],
          [21, 3],
          [21, 5],
          [22, 4]
        ]
      },
      {
        color: "plain",
        centerTowns: [{}],
        hexes: [[4, 4], [10, 6]]
      },
      {
        color: "plain",
        centerTowns: [{ x: -30 }, { x: 30 }],
        hexes: [[7, 7], [17, 7], [20, 6]]
      },
      {
        color: "plain",
        cities: [{}],
        hexes: [[4, 8], [10, 2], [10, 8], [16, 8]]
      },
      {
        color: "plain",
        hexes: [
          [2, 8],
          [3, 5],
          [3, 7],
          [3, 9],
          [4, 10],
          [5, 7],
          [5, 9],
          [6, 8],
          [6, 10],
          [7, 3],
          [7, 9],
          [8, 4],
          [8, 8],
          [8, 10],
          [9, 3],
          [9, 7],
          [9, 9],
          [11, 7],
          [12, 2],
          [12, 6],
          [13, 5],
          [14, 2],
          [14, 6],
          [14, 8],
          [15, 5],
          [16, 4],
          [18, 6],
          [20, 4],
          [22, 2],
          [23, 3]
        ]
      }
    ]
  }
};

export default game;
