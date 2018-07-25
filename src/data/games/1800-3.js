const game = {
  // Generic Game Info
  info: {
    title: "1800",
    subtitle: "3 Players",
    designer: "Antonio Leal",
    background: "green",
    width: 150,
    orientation: "horizontal",
    color_10: "orange",
    titleY: 750,
    titleX: 170,
    extraTotalWidth: 200,
    titleSize: 150,
    extraTokens: 2
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
    },
    {
      number: 3,
      capital: "$520",
      certLimit: 7
    }
  ],

  // Railway Companies
  companies: [
    {
      name: "Denver & Rio Grande Western",
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
        },
        {
          quantity: 1,
          label: "Bond",
          cost: "$300",
          revenue: "$50"
        }
      ]
    },
    {
      name: "Colorado & Southern",
      abbrev: "C&S",
      tokens: ["Free", "$40", "$100"],
      color: "purple",
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
        },
        {
          quantity: 1,
          label: "Bond",
          cost: "$300",
          revenue: "$50"
        }
      ]
    },
    {
      name: "Colorado & Western",
      abbrev: "C&W",
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
        },
        {
          quantity: 1,
          label: "Bond",
          cost: "$300",
          revenue: "$50"
        }
      ]
    }
  ],

  trains: [
    {
      name: "2",
      quantity: 3,
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
      quantity: 2,
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
      name: "2E",
      quantity: 3,
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
      quantity: 2,
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
      price: "$25",
      players: "3+",
      revenue: "$5",
      description: "May be sold to a corporation for $10 to $50."
    },
    {
      name: "Denver and Salt Lake",
      price: "$70",
      revenue: "$10",
      players: "3+",
      description: "Trade for any share in the bank pool at any time, this action closes the company. Closes when the first 5 Train is purchased."
    },
    {
      name: "Rio Grande Southern",
      price: "$150",
      revenue: "$20",
      description: "Obtain a 10% share of D&RGW. The bank will compensate D&RGW for this share when it's par value has been established."
    }
  ],

  phases: [
    {
      name: "1",
      tiles: "yellow"
    },
    {
      name: "2",
      limit: "2",
      number: "3",
      tiles: "yellow"
    },
    {
      name: "3",
      limit: "2",
      number: "2",
      tiles: "green",
      notes: "Private companies may be purchased"
    },
    {
      name: "4",
      rust: "2",
      limit: "2",
      number: "1",
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
      limit: "3",
      number: "6",
      rust: "3",
      tiles: "gray",
      notes: "All E Trains may be purchased"
    }
  ],

  pools: [
    {
      name: "Market",
      notes: [
        {
          color: "orange",
          note: "Shares in the market pay dividends to the bank"
        },
        {
          color: "brown",
          icon: "exclamation",
          note: "No more than 50% of a corporation's shares may be in the market at any time"
        },
        {
          color: "red",
          icon: "times",
          note: "Shares cannot be sold during the first stock round"
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
        "Buy one share or if president buy company bond"
      ],
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
      ordered: true,
      optional: [
        "Issue or redeem shares",
        "Collect bond dividends",
        "Purchase private companies"
      ]
    }
  ],

  stock: {
    type: "2D",
    movement: {
      up: ["Sold out"],
      down: ["Once per sale"],
      left: ["Paid no dividends"],
      right: ["Paid dividends ≥ current share price"]
    },
    market: [
      [
        { label: 80, arrow: "down" },
        90,
        100,
        110,
        120,
        140,
        160,
        180,
        200,
        225
      ],
      [
        { label: 70, arrow: "down" },
        80,
        90,
        { label: 100, par: true },
        110,
        120,
        140,
        160,
        { label: 180, arrow: "up" }
      ],
      [
        { label: 60, arrow: "down" },
        70,
        80,
        { label: 90, par: true },
        100,
        110,
        { label: 120, arrow: "up" }
      ],
      [
        { label: 50, legend: 0, arrow: "down" },
        { label: 60, legend: 0 },
        70,
        { label: 80, par: true },
        90,
        100,
        { label: 110, arrow: "up" }
      ],
      [
        { label: 40, legend: 1, arrow: "down" },
        { label: 50, legend: 0 },
        60,
        { label: 70, par: true },
        80,
        { label: 90, arrow: "up" }
      ],
      [
        { label: 30, legend: 1, arrow: "down" },
        { label: 40, legend: 0 },
        { label: 50, legend: 0 },
        { label: 60, par: true },
        { label: 70, arrow: "up" }
      ],
      [
        { label: 20, legend: 1, arrow: "down" },
        { label: 30, legend: 1 },
        { label: 40, legend: 0 },
        50,
        { label: 60, arrow: "up" }
      ],
      [
        { label: 10, legend: 1 },
        { label: 20, legend: 1 },
        { label: 30, legend: 0 },
        { label: 40, arrow: "up" }
      ]
    ],
    legend: [
      {
        color: "yellow",
        description: "Shares of this corporation do not count toward the certificate limit",
        icon: "certificate"
      },
      {
        color: "orange",
        description: "Players may own more than 70% of this corporation",
        icon: "percentage"
      }
    ]
  },

  tiles: {
    // Yellow
    "3": 1,
    "4": 2,
    "5": 3,
    "6": 3,
    "7": 1,
    "8": 2,
    "9": 2,
    "58": 2,
    // Green
    "12": 3,
    "15": 1,
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
    "800": 1,
    "802": 1,
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
    "803": 1,
    "804": 3,
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
        cities: [{
          percent: 0.3333,
          name: {
            name: "Cheyenne"
          }
        }],
        offBoardRevenue: {
          angle: 180,
          percent: 0.475,
          phaseReversed: true,
          revenues: [
            {
              color: "white",
              cost: "10",
              phase: 2
            },
            {
              color: "black",
              textColor: "white",
              cost: "40",
              phase: 4
            },
            {
              color: "white",
              cost: "70",
              phase: 5
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
        hexes: ["B4"]
      },
      {
        color: "plain",
        centerTowns: [{}],
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
                color: "purple"
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
        labels: [{
          label: "D",
          angle: 210,
          percent: 0.6
        }],
        cities: [
          {
            percent: 0.4,
            name: {
              name: "Denver"
            }
          }
        ],
        water: {
          angle: 150,
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
          angle: 180,
          percent: 0.12,
          revenues: [
            {
              color: "white",
              cost: "10",
              phase: 2
            },
            {
              color: "black",
              textColor: "white",
              cost: "20",
              phase: 4
            },
            {
              color: "white",
              cost: "30",
              phase: 5
            }
          ]
        },
        hexes: ["A7", "E7"]
      },
      {
        color: "offboard",
        offBoardTrack: [
          {
            side: 6
          }
        ],
        offBoardRevenue: {
          phaseReversed: true,
          revenues: [
            {
              color: "white",
              cost: "10",
              phase: 2
            },
            {
              color: "black",
              textColor: "white",
              cost: "20",
              phase: 4
            },
            {
              color: "white",
              cost: "30",
              phase: 5
            }
          ]
        },
        hexes: ["B8"]
      },
      {
        color: "offboard",
        offBoardTrack: [
          {
            side: 2
          }
        ],
        offBoardRevenue: {
          phaseReversed: true,
          revenues: [
            {
              color: "white",
              cost: "10",
              phase: 2
            },
            {
              color: "black",
              textColor: "white",
              cost: "20",
              phase: 4
            },
            {
              color: "white",
              cost: "30",
              phase: 5
            }
          ]
        },
        hexes: ["D8"]
      },
      {
        color: "plain",
        cities: [{
          name: {
            name: "Colorado Springs"
          },
          companies: [{
            label: "C&W",
            color: "blue"
          }]
        }],
        hexes: ["C9"]
      }
    ]
  }
};

export default game;
