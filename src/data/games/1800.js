const game = {
  // Generic Game Info
  info: {
    title: "1800",
    subtitle: "2 Players",
    designer: "Antonio Leal",
    background: "green",
    width: 150,
    orientation: "horizontal",
    titleY: 750,
    titleX: 170,
    extraTotalWidth: 200,
    titleSize: 150
  },

  // Extra Tokens
  tokens: ["Round"],

  // Need an IPO sheet
  ipo: false,

  bank: "$3,720",

  players: [
    {
      number: 2,
      capital: "$520",
      certLimit: 7
    }
  ],

  // Railway Companies
  companies: [
    {
      name: "Denver & Rio Grande Western Railroad",
      abbrev: "D&RGW",
      tokens: ["Free", "$40", "$100"],
      color: "orange",
      shares: [
        {
          quantity: 1,
          label: "President Share",
          percent: 40,
          shares: 4
        },
        {
          quantity: 6,
          percent: 10,
          shares: 1
        }
      ]
    },
    {
      name: "Colorado & Southern Railroad",
      abbrev: "C&S",
      tokens: ["Free", "$40", "$100"],
      color: "blue",
      shares: [
        {
          quantity: 1,
          label: "President Share",
          percent: 40,
          shares: 4
        },
        {
          quantity: 6,
          percent: 10,
          shares: 1
        }
      ]
    }
  ],

  trains: [
    {
      name: "2",
      quantity: 2,
      price: "$180",
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
      quantity: 1,
      price: "$300",
      color: "green",
      info: [
        {
          color: "brown",
          note: "Rusted by E"
        }
      ]
    },
    {
      name: "4",
      quantity: 1,
      price: "$430",
      color: "green",
      info: [
        {
          color: "yellow",
          note: "Permanent"
        }
      ]
    },
    {
      name: "5",
      quantity: 1,
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
      name: "2E",
      quantity: 2,
      price: "$250",
      color: "black",
      info: [
        {
          color: "yellow",
          note: "Permanent"
        }
      ]
    },
    {
      name: "3E",
      quantity: 1,
      price: "$350",
      color: "black",
      info: [
        {
          color: "yellow",
          note: "Permanent"
        }
      ]
    },
    {
      name: "2x2E",
      quantity: 1,
      price: "$500",
      color: "black",
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
      name: "Midland Terminal",
      price: "$20",
      revenue: "$5"
    },
    {
      name: "Denver and Salt Lake",
      price: "$70",
      revenue: "$10"
    },
    {
      name: "Rio Grande Southern",
      price: "$150",
      revenue: "$20"
    },
    {
      name: "Denver & Rio Grande Western Railroad Bond",
      price: "$300",
      revenue: "$50"
    },
    {
      name: "Colorado & Southern Railroad Bond",
      price: "$300",
      revenue: "$50"
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
      values: [100, 90, 80, 70, 60],
      cells: [[1, 3], [2, 3], [3, 3], [4, 3], [5, 3]]
    },
    market: [
      [80, 90, 100, 110, 120, 140, 160, 180, 200, 225],
      [70, 80, 90, 100, 110, 120, 140, 160, 180],
      [60, 70, 80, 90, 100, 110, 120],
      [
        { label: 50, color: "yellow" },
        { label: 60, color: "yellow" },
        70,
        80,
        90,
        100,
        110
      ],
      [
        { label: 40, color: "orange" },
        { label: 50, color: "yellow" },
        60,
        70,
        80,
        90
      ],
      [
        { label: 30, color: "orange" },
        { label: 40, color: "yellow" },
        { label: 50, color: "yellow" },
        60,
        70
      ],
      [
        { label: 20, color: "orange" },
        { label: 30, color: "orange" },
        { label: 40, color: "yellow" },
        50,
        60
      ],
      [
        { label: 10, color: "orange" },
        { label: 20, color: "orange" },
        { label: 30, color: "yellow" },
        40
      ]
    ],
    limits: [
      {
        color: "yellow",
        description: "Certificates no longer count towards the share limit"
      },
      {
        color: "orange",
        description: "Players may own more than 70% of the company"
      }
    ]
  },

  tiles: {
    // Yellow
    "3": 1,
    "4": 2,
    "5": 2,
    "6": 2,
    "7": 1,
    "8": 2,
    "9": 2,
    "58": 2,
    // Green
    "12": 2,
    "16": 1,
    "18": 1,
    "19": 1,
    "23": 1,
    "24": 1,
    "25": 1,
    "26": 1,
    "27": 1,
    "28": 1,
    "29": 1,
    "59": 1,
    // Brown
    "39": 1,
    "40": 1,
    "41": 1,
    "42": 1,
    "43": 1,
    "45": 1,
    "46": 1,
    "64": 1,
    "65": 1,
    "67": 1,
    "68": 1,
    "70": 1,
    "800": 1,
    "802": 1,
    "803": 1,
    "804": 2,
    // Gray
    "805": 1,
    "806": 1,
    "807": 1,
    "808": 1
  },

  map: {
    hexes: [
      {
        color: "offboard",
        cities: [{}],
        offBoardRevenue: {
          angle: 180,
          percent: 0.667,
          revenues: [
            {
              color: "yellow",
              cost: "10"
            },
            {
              color: "green",
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
            side: 1
          }
        ],
        hexes: ["C1"]
      },
      {
        color: "plain",
        mountain: {
          size: "medium",
          cost: "$50"
        },
        hexes: ["C3"]
      },
      {
        color: "plain",
        centerTowns: [{}],
        labels: [
          {
            angle: 180,
            percent: 0.5,
            label: "D&RGW"
          }
        ],
        hexes: ["B4"]
      },
      {
        color: "plain",
        centerTowns: [{}],
        labels: [
          {
            angle: 180,
            percent: 0.5,
            label: "C&S"
          }
        ],
        hexes: ["D4"]
      },
      {
        color: "plain",
        cities: [
          {
            companies: [
              {
                label: "D&RGW",
                color: "orange"
              }
            ]
          }
        ],
        hexes: ["A5"]
      },
      {
        color: "yellow",
        cities: [
          {
            angle: 90,
            percent: 0.5,
            name: {
              name: "Fort",
              rotation: 60
            }
          },
          {
            angle: 270,
            percent: 0.5,
            name: {
              name: "Collins",
              reverse: true,
              rotation: 60
            }
          }
        ],
        hexes: ["C5"]
      },
      {
        color: "plain",
        cities: [
          {
            companies: [
              {
                label: "C&S",
                color: "blue"
              }
            ]
          }
        ],
        hexes: ["E5"]
      },
      {
        color: "plain",
        water: {
          cost: "$40",
          size: "small"
        },
        hexes: ["B6", "D6"]
      },
      {
        color: "plain",
        cities: [
          {
            percent: 0.4,
            name: {
              name: "Denver"
            }
          }
        ],
        water: {
          angle: 180,
          percent: 0.6,
          cost: "$40",
          size: "small"
        },
        hexes: ["C7"]
      },
      {
        color: "offboard",
        offBoardTrack: [
          {
            side: 4
          }
        ],
        offBoardRevenue: {
          revenues: [
            {
              color: "yellow",
              cost: "10"
            },
            {
              color: "green",
              cost: "20"
            },
            {
              color: "brown",
              cost: "30"
            }
          ]
        },
        hexes: ["A7", "E7"]
      },
      {
        color: "offboard",
        offBoardTrack: [
          {
            side: 4
          }
        ],
        offBoardRevenue: {
          revenues: [
            {
              color: "yellow",
              cost: "20"
            },
            {
              color: "green",
              cost: "30"
            },
            {
              color: "brown",
              cost: "40"
            }
          ]
        },
        hexes: ["C9"]
      }
    ]
  }
};

export default game;
