const game = {
  // Generic Game Info
  info: {
    title: "1846",
    subtitle: "The Race for the Midwest",
    designer: "Thomas Lehmann",
    background: "brown",
    extraTokens: 4,
    width: 150,
    rotation: 90,
    color_5: "orange",
    color_10: "brown"
  },

  // Extra Tokens
  tokens: ["Round", "#port", "#port", "#meat", "#meat", "Big 4", "MS"],

  capital: "$400",

  players: [{
    number: 3,
    certLimit: 14,
    bank: "$6,500"
  },{
    number: 4,
    certLimit: 12,
    bank: "$7,500"
  },{
    number: 5,
    certLimit: 11,
    bank: "$9,000"
  }],

  // Railway Companies
  companies: [
    {
      name: "Pennsylvania",
      abbrev: "PRR",
      tokens: ["Free", "$80", "$80", "$80", "$80 / $40 / $60"],
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
      name: "New York Central",
      abbrev: "NYC",
      tokens: ["Free", "$80", "$80", "$80"],
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
      name: "Baltimore & Ohio",
      abbrev: "B&O",
      tokens: ["Free", "$80", "$80", "$80 / $60 / $100"],
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
      tokens: ["Free", "$80", "$80", "$80"],
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
      tokens: ["Free", "$80", "$80", "$80 / $40"],
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
      name: "Grand Trunk",
      abbrev: "GT",
      tokens: ["Free", "$80", "$80"],
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
      name: "Illinois Central",
      abbrev: "IC",
      tokens: ["Free", "$80", "$80", "$80"],
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
    }
  ],

  trains: [
    {
      name: "2",
      quantity: 7,
      price: "$80",
      color: "yellow",
      info: [
        {
          color: "brown",
          note: "Phased Out"
        },
        {
          color: "gray",
          note: "Removed"
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
      name: "Mail Contract",
      price: "$80",
      revenue: "$0",
      description:
        "Never closes once purchased by a corporation. Adds $10 per location visited by any one train of the owning corporation."
    },
    {
      name: "Chicago and Western Indiana",
      price: "$80",
      revenue: "$10",
      description:
        "Reserves a token slot in Chicago (D6), in which the owning corporation may place an extra token at no cost."
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
      name: "3/5, 4",
      limit: "4",
      number: "5",
      tiles: "green"
    },
    {
      name: "4/6, 5",
      phase: "2",
      limit: "3",
      number: "5",
      tiles: "brown",
      notes: "Private companies close, Phase out 2 trains"
    },
    {
      name: "6/7, 8",
      phase: "3/5, 4",
      rust: "2",
      limit: "2",
      number: "∞",
      tiles: "gray",
      notes: "Private tokens removed, Phase out 3/5 and 4 trains"
    }
  ],

  pools: [
    {
      name: "Market",
      notes: [
        {
          color: "orange",
          note: "Corporations issue/redeem stock at one value lower/higher"
        },
        {
          color: "brown",
          icon: "exclamation",
          note: "Corporations may not issue more stock than the amount held by players, less the number already in the Stock Market"
        }
      ]
    }
  ],

  rounds: [
    {
      name: "OR2",
      color: "gray"
    },
    {
      name: "OR1",
      color: "gray"
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
      ordered: true
    },
    {
      name: "Operating Round",
      steps: [
        "Issue or redeem shares",
        "Lay or upgrade track and/or purchase a station",
        "Run trains",
        "Pay dividends, half dividends or retain revenue",
        "Purchase trains"
      ],
      ordered: true
    }
  ],

  stock: {
    type: "1D",
    market: [0,10,20,30,40,50,60,70,80,90,100,112,124,137,150,165,180,195,212,230,250,270,295,320,345,375,405,440,475,510,550],
    limits: [{
      color: "orange",
      description: "Allowed par values",
      min: 40,
      max: 150
    }]
  },

  tiles: {
    // Yellow
    "5": 3,
    "6": 4,
    "7": 5,
    "8": 16,
    "9": 16,
    "57": 4,
    "291": 1,
    "292": 1,
    "293": 1,
    //Green
    "14": 4,
    "15": 5,
    "16": 2,
    "17": 1,
    "18": 1,
    "19": 2,
    "20": 2,
    "21": 1,
    "22": 1,
    "23": 4,
    "24": 4,
    "25": 2,
    "26": 1,
    "27": 1,
    "28": 1,
    "29": 1,
    "30": 1,
    "31": 1,
    "294": 2,
    "295": 2,
    "296": 1,
    "298": 1,
    "619": 3,
    // Brown
    "39": 1,
    "40": 1,
    "41": 2,
    "42": 2,
    "43": 2,
    "44": 1,
    "45": 2,
    "46": 2,
    "47": 2,
    "70": 1,
    "297": 2,
    "299": 1,
    "611": 4,
    // Gray
    "51": 2,
    "290": 1,
    "300": 1
  },

  map: {
    hexes: [
      {
        color: "plain",
        labels: [
          {
            label: "IC"
          }
        ],
        hexes: ["E5", "F6", "G5", "H6", "J4"]
      },
      {
        color: "plain",
        hexes: [
          "B14",
          "C11",
          "C13",
          "D8",
          "D10",
          "D12",
          "D18",
          "E7",
          "E9",
          "E13",
          "E15",
          "E19",
          "F4",
          "F8",
          "F10",
          "F12",
          "G11",
          "H2",
          "H4",
          "H8",
          "H10",
          "I3",
          "I7",
          "I9",
          "J8"
        ]
      },
      {
        color: "gray",
        track: [
          {
            type: "sharp",
            side: 5
          }
        ],
        hexes: ["A15"]
      },
      {
        color: "offboard",
        labels: [
          {
            label: "Holland",
            x: -20
          }
        ],
        icons: [
          {
            type: "port",
            angle: 150,
            percent: 0.5
          },
          {
            type: "port",
            angle: 210,
            percent: 0.5
          }
        ],
        offBoardRevenue: {
          percent: 0.333,
          x: -20,
          revenues: [
            {
              color: "yellow",
              cost: "40"
            },
            {
              color: "brown",
              cost: "10"
            }
          ]
        },
        offBoardTrack: [
          {
            side: 4
          }
        ],
        hexes: ["B8"]
      },
      {
        color: "plain",
        labels: [
          {
            label: "MC"
          }
        ],
        hexes: ["B10", "B12"]
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              name: "Port Huron"
            },
            companies: [
              {
                label: "GT",
                color: "orange"
              }
            ]
          }
        ],
        hexes: ["B16"]
      },
      {
        color: "offboard",
        labels: [
          {
            label: "Sarnia",
            x: 20
          },
          {
            angle: 180,
            percent: 0.667,
            label: "E"
          }
        ],
        tunnels: [
          {
            cost: "$40",
            angle: 90,
            percent: 1
          }
        ],
        offBoardTrack: [
          {
            side: 1
          }
        ],
        offBoardRevenue: {
          percent: 0.333,
          x: 20,
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
        hexes: ["B18"]
      },
      {
        color: "offboard",
        offBoardTrack: [
          {
            side: 5
          }
        ],
        icons: [{
          type: "port",
          angle: 300,
          percent: 0.75
        }],
        labels: [
          {
            label: "Chicago Connections"
          },
          {
            label: "W",
            angle: 180,
            percent: 0.667
          }
        ],
        offBoardRevenue: {
          percent: 0.333,
          x: -20,
          revenues: [
            {
              color: "yellow",
              cost: "20"
            },
            {
              color: "brown",
              cost: "40"
            }
          ]
        },
        hexes: ["C5"]
      },
      {
        copy: "A15",
        hexes: ["C7"]
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              name: "South Bend"
            }
          }
        ],
        hexes: ["C9"]
      },
      {
        color: "yellow",
        labels: [
          {
            label: "Z",
            angle: 60,
            percent: 0.85
          }
        ],
        cities: [
          {
            size: 2,
            name: {
              name: "Detroit",
              reverse: true,
              offset: 63
            },
            companies: [
              {
                label: "MS",
                color: "white"
              }
            ]
          }
        ],
        values: [
          {
            angle: 180,
            percent: 0.667,
            value: 40
          }
        ],
        track: [
          {
            side: 1
          },
          {
            side: 3
          }
        ],
        water: [
          {
            cost: "$40",
            percent: 0.6
          }
        ],
        hexes: ["C15"]
      },
      {
        color: "offboard",
        labels: [
          {
            label: "Windsor",
            x: 20
          },
          {
            angle: 180,
            percent: 0.667,
            label: "E"
          }
        ],
        tunnels: [
          {
            cost: "$60",
            angle: 90,
            percent: 1
          }
        ],
        offBoardTrack: [
          {
            side: 1
          }
        ],
        offBoardRevenue: {
          percent: 0.333,
          x: 20,
          revenues: [
            {
              color: "yellow",
              cost: "40"
            },
            {
              color: "brown",
              cost: "60"
            }
          ]
        },
        hexes: ["C17"]
      },
      {
        color: "yellow",
        cities: [
          {
            angle: 210,
            percent: 0.75
          },
          {
            angle: 270,
            percent: 0.75
          },
          {
            angle: 330,
            percent: 0.75,
            companies: [
              {
                label: "C&WI",
                color: "white"
              }
            ]
          },
          {
            angle: 30,
            percent: 0.75
          }
        ],
        labels: [
          {
            label: "Chicago",
            angle: 90,
            percent: 0.333,
            y: 10
          }
        ],
        icons: [
          {
            type: "meat",
            angle: 135,
            percent: 0.7
          }
        ],
        values: [
          {
            value: 10,
            angle: 165,
            percent: 0.25
          }
        ],
        hexes: ["D6"]
      },
      {
        copy: "C9",
        cities: [
          {
            name: {
              name: "Toledo",
              reverse: true
            }
          }
        ],
        labels: [
          {
            angle: 270,
            percent: 0.667,
            label: "LSL"
          }
        ],
        icons: [
          {
            type: "port",
            angle: 135,
            percent: 0.7
          }
        ],
        hexes: ["D14"]
      },
      {
        color: "water",
        hexes: ["C19", "D16"]
      },
      {
        color: "yellow",
        values: [
          {
            value: 10,
            angle: 165,
            percent: 0.667
          }
        ],
        cities: [
          {
            size: 2,
            companies: [
              {
                label: "NYC",
                color: "black"
              },
              {
                label: "Erie",
                color: "gray"
              }
            ],
            name: {
              name: "Erie",
              reverse: true,
              offset: 63
            }
          }
        ],
        track: [
          {
            side: 1
          },
          {
            side: 3
          },
          {
            side: 6
          }
        ],
        hexes: ["D20"]
      },
      {
        color: "offboard",
        labels: [
          {
            label: "Buffalo",
            x: 20
          },
          {
            angle: 180,
            percent: 0.667,
            label: "E"
          }
        ],
        offBoardTrack: [
          {
            side: 6
          }
        ],
        offBoardRevenue: {
          percent: 0.333,
          x: 20,
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
        hexes: ["C21"]
      },
      {
        color: "offboard",
        labels: [
          {
            label: "Buffalo",
            x: 20
          },
          {
            angle: 180,
            percent: 0.667,
            label: "E"
          }
        ],
        offBoardTrack: [
          {
            side: 1
          }
        ],
        offBoardRevenue: {
          percent: 0.333,
          x: 20,
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
        hexes: ["D22"]
      },
      {
        color: "plain",
        cities: [
          {
            companies: [
              {
                label: "PRR",
                color: "gray"
              }
            ],
            name: {
              name: "Fort Wayne"
            }
          }
        ],
        hexes: ["E11"]
      },
      {
        copy: "C9",
        cities: [
          {
            name: {
              name: "Cleveland",
              reverse: true
            }
          }
        ],
        labels: [
          {
            angle: 150,
            percent: 0.667,
            label: "LSL"
          },
          {
            label: "Z",
            angle: 270,
            percent: 0.667
          }
        ],
        hexes: ["E17"]
      },
      {
        color: "yellow",
        values: [
          {
            value: 10,
            angle: 195,
            percent: 0.667
          }
        ],
        cities: [
          {
            companies: [
              {
                label: "Erie",
                color: "yellow"
              }
            ],
            name: {
              name: "Salamanca",
              reverse: true
            }
          }
        ],
        track: [
          {
            side: 1
          },
          {
            side: 2
          },
          {
            side: 4
          }
        ],
        hexes: ["E21"]
      },
      {
        color: "offboard",
        labels: [
          {
            label: "Binghamton",
            percent: 0.333
          },
          {
            angle: 180,
            percent: 0.667,
            label: "E"
          }
        ],
        offBoardTrack: [
          {
            side: 1
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
              cost: "50"
            }
          ]
        },
        hexes: ["E23"]
      },
      {
        color: "plain",
        labels: [
          {
            label: "O&I"
          }
        ],
        hexes: ["F14", "F16"]
      },
      {
        color: "plain",
        mountain: [
          {
            cost: "$40"
          }
        ],
        hexes: ["F18", "G17", "H14", "H16"]
      },
      {
        color: "gray",
        values: [
          {
            value: 10,
            angle: 195,
            percent: 0.667
          }
        ],
        tunnels: [
          {
            angle: 150,
            cost: "$40",
            percent: 1
          }
        ],
        cities: [
          {
            name: {
              name: "Homewood",
              reverse: true,
              rotation: 30
            },
            companies: [
              {
                label: "PRR",
                color: "red"
              }
            ]
          }
        ],
        track: [
          {
            side: 1
          },
          {
            side: 2
          },
          {
            side: 4
          },
          {
            side: 5
          }
        ],
        hexes: ["F20"]
      },
      {
        color: "offboard",
        labels: [
          {
            label: "Pittsburgh",
            percent: 0.333
          },
          {
            angle: 180,
            percent: 0.667,
            label: "E"
          }
        ],
        offBoardTrack: [
          {
            side: 1
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
              cost: "70"
            }
          ]
        },
        hexes: ["F22"]
      },
      {
        copy: "C9",
        cities: [
          {
            name: {
              name: "Springfield"
            }
          }
        ],
        hexes: ["G3"]
      },
      {
        copy: "C9",
        cities: [
          {
            name: {
              name: "Terre Haute"
            }
          }
        ],
        hexes: ["G7"]
      },
      {
        copy: "C9",
        cities: [
          {
            name: {
              name: "Indianapolis"
            },
            companies: [
              {
                label: "Big 4",
                color: "white"
              }
            ]
          }
        ],
        hexes: ["G9"]
      },
      {
        copy: "C9",
        cities: [
          {
            name: {
              name: "Dayton"
            }
          }
        ],
        hexes: ["G13"]
      },
      {
        copy: "C9",
        cities: [
          {
            name: {
              name: "Columbus"
            }
          }
        ],
        hexes: ["G15"]
      },
      {
        color: "yellow",
        values: [
          {
            value: 10,
            angle: 30,
            percent: 0.75
          }
        ],
        icons: [
          {
            angle: 190,
            percent: 0.667,
            type: "port"
          },
          {
            angle: 230,
            percent: 0.667,
            type: "port"
          }
        ],
        bridges: [
          {
            cost: "$40",
            angle: 150,
            percent: 1
          },
          {
            cost: "$20",
            angle: 90,
            percent: 1
          }
        ],
        cities: [
          {
            name: {
              name: "Wheeling",
              reverse: true,
              rotation: 30
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
            side: 5
          }
        ],
        hexes: ["G19"]
      },
      {
        color: "offboard",
        labels: [
          {
            label: "Pittsburgh",
            percent: 0.333
          },
          {
            angle: 180,
            percent: 0.667,
            label: "E"
          }
        ],
        tunnels: [
          {
            cost: "$20",
            angle: 90,
            percent: 1
          }
        ],
        offBoardTrack: [
          {
            side: 1
          },
          {
            side: 2
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
              cost: "70"
            }
          ]
        },
        hexes: ["G21"]
      },
      {
        copy: "C9",
        cities: [
          {
            name: {
              name: "Cincinnati",
              reverse: true
            },
            companies: [
              {
                label: "B&O",
                color: "gray"
              }
            ]
          }
        ],
        labels: [
          {
            label: "Z",
            angle: 270,
            percent: 0.667
          }
        ],
        hexes: ["H12"]
      },
      {
        color: "offboard",
        labels: [
          {
            label: "Cumberland",
            percent: 0.333
          },
          {
            angle: 180,
            percent: 0.667,
            label: "E"
          }
        ],
        offBoardTrack: [
          {
            side: 2
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
              cost: "40"
            }
          ]
        },
        hexes: ["H20"]
      },
      {
        color: "offboard",
        icons: [{
          type: "port",
          angle: 20,
          percent: 0.75
        },{
          type: "meat",
          angle: -20,
          percent: 0.75
        }],
        labels: [
          {
            label: "St. Louis",
            percent: 0.333
          },
          {
            angle: 180,
            percent: 0.667,
            label: "W"
          }
        ],
        offBoardTrack: [{ side: 3 }, { side: 4 }],
        offBoardRevenue: {
          revenues: [
            { color: "yellow", cost: "50" },
            { color: "brown", cost: "70" }
          ]
        },
        hexes: ["I1"]
      },
      {
        color: "gray",
        values: [
          {
            value: 10,
            angle: 165,
            percent: 0.667
          }
        ],
        cities: [{
          size: 2,
          name: {
            name: "Centralia",
            reverse: true,
            offset: 63
          },
          companies: [{
            label: "IC",
            color: "gray"
          }]
        }],
        track: [{
          side: 1
        },{
          side: 3
        },{
          side: 4
        },{
          side: 6
        }],
        hexes: ["I5"]
      },{
        color: "plain",
        bridges: [{
          cost: "$40",
          angle: 210,
          percent: 1
        }],
        hexes: ["I11"]
      },
      {
        color: "gray",
        values: [{
          value: 20,
          angle: -54,
          percent: 0.7
        }],
        cities: [{
          name: {
            name: "Huntington",
            reverse: true,
            rotation: 30
          },
          companies: [{
            label: "C&O",
            color: "cyan"
          }]
        }],
        track: [{
          side: 2
        },{
          side: 3
        },{
          side: 4
        }],
        hexes: ["I15"]
      },{
        color: "offboard",
        offBoardTrack: [{
          side: 1
        }],
        labels: [
          {
            label: "Charleston",
            percent: 0.333
          },
          {
            angle: 180,
            percent: 0.667,
            label: "E"
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
              cost: "50"
            }
          ]
        },
        hexes: ["I17"]
      },
      {
        color: "plain",
        bridges: [{
          cost: "$40",
          angle: 90,
          percent: 1
        }],
        hexes: ["J6"]
      },{
        color: "offboard",
        offBoardTrack: [{
          side: 2
        },{
          side: 3
        }],
        labels: [
          {
            label: "Louisville",
            percent: 0.333
          }
        ],
        offBoardRevenue: {
          revenues: [
            {
              color: "yellow",
              cost: "50"
            },
            {
              color: "brown",
              cost: "70"
            }
          ]
        },
        hexes: ["J10"]
      },
      {
        color: "gray",
        values: [
          {
            value: 20,
            angle: 165,
            percent: 0.667
          }
        ],
        cities: [{
          name: {
            name: "Caire",
            reverse: true,
            rotation: 30
          },
          companies: [{
            label: "IC",
            color: "darkGreen"
          }]
        }],
        track: [{
          side: 3
        }],
        hexes: ["K3"]
      }
    ]
  }
};

export default game;
