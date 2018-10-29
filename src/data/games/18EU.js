const game = {
  // Generic Game Info
  info: {
    title: "18EU",
    subtitle: "Railraoding in Europe from the 1830's to the 1930's",
    designer: "David G. D. Hecht",
    background: "gray",
    width: 150,
    orientation: "horizontal",
    color_10: "orange",
    titleX: 50,
    hexCoords: true
  },

  // Extra Tokens
  tokens: ["Round", "60", "60"],

  // Need an IPO sheet
  ipo: false,

  bank: "$12,000",

  players: [
    {
      number: 2,
      certLimit: 28,
      capital: "$750"
    },
    {
      number: 3,
      certLimit: 20,
      capital: "$450"
    },
    {
      number: 4,
      certLimit: 16,
      capital: "$350"
    },
    {
      number: 5,
      certLimit: 13,
      capital: "$300"
    },
    {
      number: 6,
      certLimit: 11,
      capital: "$250"
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
      quantity: 15,
      price: "$0",
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
      price: "£200",
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
          note: "Rusted by 8"
        }
      ]
    },
    {
      name: "5",
      quantity: 3,
      price: "$500",
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
      price: "$600",
      color: "brown",
      info: [
        {
          color: "yellow",
          note: "Permanent"
        }
      ]
    },
    {
      name: "8",
      quantity: 8,
      price: "$800",
      color: "brown",
      info: [
        {
          color: "yellow",
          note: "Permanent"
        }
      ]
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
      notes: "Final Exchange Round after ORs finish"
    },
    {
      name: "6",
      limit: "2",
      number: "2",
      rust: "3",
      tiles: "brown",
    },
    {
      name: "8",
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
          note: "Shares in the market pay dividends to the bank"
        },
        {
          color: "brown",
          icon: "exclamation",
          note:
            "No more than 50% of a corporation's shares may be in the market at any time"
        },
        {
          color: "red",
          icon: "times",
          note: "Shares in a company cannot be sold until that company has operated"
        }
      ]
    }
  ],

  rounds: [
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
      ],
      ordered: true
    },
    {
      name: "Operating Round",
      steps: [
        "Lay or upgrade track",
        "Place a station",
        "Run trains",
        "Pay dividends or withhold revenue",
        "Purchase trains",
        "Issue/Redeem shares",
      ],
      ordered: true,
    }
  ],

  stock: {
    type: "2D",
    par: {
      values: [100, 90, 82, 76, 71, 67]
    },
    movement: {
      up: ["Sold out"],
      down: ["Every share sold"],
      left: ["Withheld revenue"],
      right: ["Paid dividends"]
    },
    market: [
      [
        { value: 60, label: 60, legend: 0, arrow: "down" },
        67,
        71,
        76,
        82,
        90,
        { value: 100, label: 100, par: true },
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
        { value: 53, label: 53, legend: 0, arrow: "down" },
        { value: 60, label: 60, legend: 0 },
        66,
        70,
        76,
        82,
        { value: 90, label: 90, par: true },
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
        { value: 300, label: 300, arrow: "up" }
      ],
      [
        { value: 46, label: 46, legend: 0, arrow: "down" },
        { value: 55, label: 55, legend: 0 },
        { value: 60, label: 60, legend: 0 },
        65,
        70,
        76,
        { value: 82, label: 82, par: true },
        90,
        100,
        111,
        125,
        140,
        155,
        170,
        185,
        { value: 200, label: 200, arrow: "up" }
      ],
      [
        { value: 39, label: 39, legend: 1, arrow: "down" },
        { value: 48, label: 48, legend: 0 },
        { value: 54, label: 54, legend: 0 },
        { value: 60, label: 60, legend: 0 },
        66,
        71,
        { value: 76, label: 76, par: true },
        82,
        90,
        100,
        110,
        120,
        { value: 130, label: 130, arrow: "up" }
      ],
      [
        { value: 32, label: 32, legend: 1, arrow: "down" },
        { value: 41, label: 41, legend: 1 },
        { value: 48, label: 48, legend: 0 },
        { value: 55, label: 55, legend: 0 },
        62,
        67,
        { value: 71, label: 71, par: true },
        76,
        82,
        90,
        { value: 100, label: 100, arrow: "up" }
      ],
      [
        { value: 25, label: 25, legend: 2, arrow: "down" },
        { value: 34, label: 34, legend: 1 },
        { value: 42, label: 42, legend: 1 },
        { value: 50, label: 50, legend: 0 },
        { value: 58, label: 58, legend: 0 },
        65,
        { value: 67, label: 67, par: true },
        71,
        75,
        { value: 80, label: 80, arrow: "up" }
      ],
      [
        { value: 18, label: 18, legend: 2, arrow: "down" },
        { value: 27, label: 27, legend: 2 },
        { value: 36, label: 36, legend: 1 },
        { value: 45, label: 45, legend: 1 },
        { value: 54, label: 54, legend: 0 },
        63,
        67,
        69,
        { value: 70, label: 70, arrow: "up" }
      ],
      [
        { value: 10, label: 10, legend: 2 },
        { value: 12, label: 12, legend: 2 },
        { value: 30, label: 30, legend: 2 },
        { value: 40, label: 40, legend: 1 },
        { value: 50, label: 50, legend: 0 },
        { value: 60, label: 60, legend: 0 },
        67,
        { value: 68, label: 68, arrow: "up" }
      ],
      [
        null,
        { value: 10, label: 10, legend: 2 },
        { value: 20, label: 20, legend: 2 },
        { value: 30, label: 30, legend: 2 },
        { value: 40, label: 40, legend: 1 },
        { value: 50, label: 50, legend: 0 },
        { value: 60, label: 60, legend: 0, arrow: "up" }
      ],
      [
        null,
        null,
        { value: 10, label: 10, legend: 2 },
        { value: 20, label: 20, legend: 2 },
        { value: 30, label: 30, legend: 2 },
        { value: 40, label: 40, legend: 1 },
        { value: 50, label: 50, legend: 0, arrow: "up" }
      ],
      [
        null,
        null,
        null,
        { value: 10, label: 10, legend: 2 },
        { value: 20, label: 20, legend: 2 },
        { value: 30, label: 30, legend: 2 },
        { value: 40, label: 40, legend: 1, arrow: "up" }
      ]
    ],
    legend: [
      {
        color: "yellow",
        description:
          "Shares of this corporation do not count toward the certificate limit",
        icon: "certificate"
      },
      {
        color: "orange",
        description: "Players may own more than 60% of this corporation",
        icon: "percentage"
      },
      {
        color: "brown",
        description:
          "Players may purchase any number of shares of this corporation in one stock action",
        icon: "money-bill-wave"
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
        color: "offboard",
        labels: [ { label: "Bucharest" } ],
        offBoardRevenue: { percent: 0.333, revenues: [ { color: "yellow", cost: "30" }, { color: "brown", cost: "50" } ] },
        offBoardTrack: [ { side: 3 } ],
        hexes: ["N17"]
      },
      {
        color: "offboard",
        labels: [ { label: "Warsaw" } ],
        offBoardRevenue: { percent: 0.333, revenues: [ { color: "yellow", cost: "20" }, { color: "brown", cost: "30" } ] },
        offBoardTrack: [ { side: 2 } ],
        hexes: ["N5"]
      },
      {
        color: "offboard",
        labels: [ { label: "London" } ],
        offBoardRevenue: { percent: 0.333, revenues: [ { color: "yellow", cost: "40" }, { color: "brown", cost: "70" } ] },
        offBoardTrack: [ { side: 1 }, { side: 6 } ],
        hexes: ["A6"]
      },
      {
        color: "offboard",
        labels: [ { label: "Hamburg", y: -35} ],
        offBoardRevenue: { percent: 0.333, y: -35, revenues: [ { color: "yellow", cost: "30" }, { color: "brown", cost: "50" } ] },
        track: [{ type: "gentle", side: 6 }, {type: "sharp", side: 6}, {type: "sharp", side: 1}],
        hexes: ["G2"]
      },
      {
        color: "offboard",
        labels: [ { label: "Rome", y: -35} ],
        offBoardRevenue: { percent: 0.333, y: -35, revenues: [ { color: "yellow", cost: "30" }, { color: "brown", cost: "50" } ] },
        offBoardTrack: [ { side: 3 }, { side: 4 }, { side: 5 } ],
        hexes: ["G22"]
      },
      {
        color: "water",
        icons: [{ type: "port", y: -15 }],
        offBoardRevenue: { percent: 0.333, y: -10, revenues: [ { color: "yellow", cost: "10" } ] },
        offBoardTrack: [ { side: 1 } ],
        hexes: ["D1"]
      },
      {
        color: "water",
        icons: [{ type: "port", y: 15 }],
        offBoardRevenue: { percent: 0.333, y: -42, revenues: [ { color: "yellow", cost: "10" } ] },
        offBoardTrack: [ { side: 4 } ],
        hexes: ["B21", "E22", "I20"]
      },
      {
        color: "yellow",
        labels: [ { label: "P", angle: 270, percent: 0.667, x: 10 }, { label: "Paris", angle: 140, y: 25, x: 5, percent: 0.5 } ],
        values: [ { angle: 90, percent: 0.84, value: 40 } ],
        cities: [
          { angle: 230, percent: 0.6, x: -10, companies: [ { label: "1", color: "white"} ] },
          { angle: 40, percent: 0.6, x: 50, companies: [ { label: "3", color: "white"} ] },
        ],
        track: [ { type: "sharpStopRev", side: 5 }, { type: "sharpStop", side: 6 } ],
        hexes: ["A10"]
      },
      {
        color: "yellow",
        labels: [ { label: "B", angle: 270 }, { label: "Berlin", angle: 0, y: 25, percent: 0.5 } ],
        values: [ { angle: 180, percent: 0.7, value: 30 } ],
        cities: [
          { angle: 280, percent: 0.7, x: -10, companies: [ { label: "9", color: "white"} ] },
          { angle: 110, percent: 0.55, companies: [ { label: "7", color: "white"} ] },
        ],
        track: [ { type: "sharpStop", side: 5 }, { type: "sharpStop", side: 2 } ],
        hexes: ["J5"]
      },
      {
        color: "yellow",
        labels: [ { label: "V", angle: 270 }, { label: "Vienna", angle: 300, size: "medium", percent: 0.60 } ],
        values: [ { angle: 150, percent: 0.7, value: 30 } ],
        cities: [
          { angle: 230, percent: 0.7, x: -10, companies: [ { label: "6", color: "white"} ] },
          { angle: 45, percent: 0.55, companies: [ { label: "11", color: "white"} ] },
        ],
        track: [ { type: "sharpStop", side: 4 }, { type: "sharpStop", side: 1 } ],
        hexes: ["K14"]
      },
      {
        color: "plain",
        labels: [ { label: "Y", angle: 270, percent: .75 } ],
        cities: [ { name: { name: "Lyon" }, companies: [ { label: "15", color: "white"} ]} ],
        hexes: ["B17"]
      },
      {
        color: "plain",
        cities: [ { name: { name: "Marseille" }} ],
        hexes: ["B19"]
      },
      {
        color: "plain",
        labels: [ { label: "Y", angle: 270, percent: .75 } ],
        cities: [ { name: { name: "Brussels" }, companies: [ { label: "2", color: "white"} ]} ],
        borders: [ { side: 1, dashed: "true", color: "gray" },
					{ side: 2, dashed: "true", color: "gray" },
					{ side: 3, dashed: "true", color: "gray" },
					{ side: 4, dashed: "true", color: "gray" },
					{ side: 5, dashed: "true", color: "gray" },
					{ side: 6, dashed: "true", color: "gray" } ],
        hexes: ["C8"]
      },
      {
        color: "plain",
        labels: [ { label: "Y", angle: 270, percent: .75 } ],
        cities: [ { name: { name: "Amsterdam" }, companies: [ { label: "12", color: "white"} ]} ],
        hexes: ["D3"]
      },
      {
        color: "plain",
        cities: [ { name: { name: "Cologne" }} ],
        hexes: ["D7"]
      },
      {
        color: "plain",
        labels: [ { label: "Y", angle: 270, percent: .75 } ],
        cities: [ { name: { name: "Strausburg" }, companies: [ { label: "14", color: "white"} ]} ],
        hexes: ["D13"]
      },
      {
        color: "plain",
        cities: [ { name: { name: "Turin" }} ],
        hexes: ["D19"]
      },
      {
        color: "plain",
        cities: [ { name: { name: "Dortmund" }} ],
        hexes: ["E6"]
      },
      {
        color: "plain",
        labels: [ { label: "Y", angle: 270, percent: .75 } ],
        cities: [ { name: { name: "Milan" }, companies: [ { label: "10", color: "white"} ]} ],
        hexes: ["E18"]
      },
      {
        color: "plain",
        cities: [ { name: { name: "Genoa" }} ],
        hexes: ["E20"]
      },
      {
        color: "plain",
        cities: [ { name: { name: "Frankfurt" }} ],
        hexes: ["F9"]
      },
      {
        color: "plain",
        labels: [ { label: "Y", angle: 270, percent: .75 } ],
        cities: [ { name: { name: "Munich" }, companies: [ { label: "13", color: "white"} ]} ],
        hexes: ["G12"]
      },
      {
        color: "plain",
        labels: [ { label: "Y", angle: 270, percent: .75 } ],
        cities: [ { name: { name: "Venice" }, companies: [ { label: "5", color: "white"} ]} ],
        hexes: ["H19"]
      },
      {
        color: "plain",
        cities: [ { name: { name: "Trieste" }} ],
        hexes: ["I18"]
      },
      {
        color: "plain",
        labels: [ { label: "Y", angle: 270, percent: .75 } ],
        cities: [ { name: { name: "Dresden" }, companies: [ { label: "4", color: "white"} ]} ],
        hexes: ["J7"]
      },
      {
        color: "plain",
        cities: [ { name: { name: "Prague" }} ],
        hexes: ["J11"]
      },
      {
        color: "plain",
        labels: [ { label: "Y", angle: 270, percent: .75 } ],
        cities: [ { name: { name: "Budapest" }, companies: [ { label: "8", color: "white"} ]} ],
        hexes: ["M16"]
      },
      {
        color: "yellow",
        track: [{ side: 2, type: "gentle" }],
        mountain: { size: "medium", cost: "$60", angle: 300, percent: 0.5 },
        labels: [ { label: "Semmering", percent: .7, size: "medium" } ],
        hexes: ["K16"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Lille" } } ],
        hexes: ["B7"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Dijon" } } ],
        hexes: ["B13"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Rotterdam" } } ],
        hexes: ["C4"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Antwerp" } } ],
        hexes: ["C6"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Geneva" } } ],
        hexes: ["C16"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Utrecht" } } ],
        hexes: ["D5"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Basil" } } ],
        hexes: ["D15"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Stuttgart" } } ],
        hexes: ["E12"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Bremen" } } ],
        hexes: ["F3"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Augsburg" } } ],
        hexes: ["F11"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Florence" } } ],
        borders: [ { side: 1, dashed: "true", color: "gray" },
					{ side: 2, dashed: "true", color: "gray" },
					{ side: 3, dashed: "true", color: "gray" },
					{ side: 4, dashed: "true", color: "gray" },
					{ side: 5, dashed: "true", color: "gray" },
					{ side: 6, dashed: "true", color: "gray" } ],
        hexes: ["F21"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Hannover" } } ],
        hexes: ["G6"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Nuremberg" } } ],
        hexes: ["G10"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Bologne" } } ],
        hexes: ["G20"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Magdeburg" } } ],
        hexes: ["H7"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Leipzig" } } ],
        hexes: ["I8"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Stettin" } } ],
        hexes: ["K4"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Brunn" } } ],
        hexes: ["K12"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Thorn" } } ],
        hexes: ["L5"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Nice" }, y: -10 } ],
        mountain: { cost: "$60", size: "medium", y: 40 },
        hexes: ["C20"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Zurich" }, y: -10 } ],
        mountain: { cost: "$60", size: "medium", y: 40 },
        hexes: ["E14"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Innsbruck" }, y: -10 } ],
        mountain: { cost: "$60", size: "medium", y: 40 },
        hexes: ["H15"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Salzburg" }, y: -10 } ],
        mountain: { cost: "$60", size: "medium", y: 40 },
        hexes: ["I14"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Pressburg" }, y: -10 } ],
        mountain: { cost: "$60", size: "medium", y: 40 },
        hexes: ["L15"]
      },
      {
        color: "plain",
        centerTowns: [ { name: { name: "Krakau" }, y: -10 } ],
        mountain: { cost: "$60", size: "medium", y: 40 },
        hexes: ["M10"]
      },
      {
        color: "plain",
        mountain: { cost: "$60", size: "medium" },
        hexes: ["A14", "A16", "C10", "D9", "D11", "F15", "G16", "I10", "I12", "J9", "J13", "K8", "L9"]
      },
      {
        color: "plain",
        mountain: { cost: "$120", size: "large" },
        hexes: ["C18", "D17", "E16", "F17", "G18", "H17", "I16", "J15"]
      },
      {
        color: "plain",
        hexes: [
          "A8",
          "A12",
          "A18",
          "A20",
          "B9",
          "B15",
          "C12",
          "C14",
          "D21",
          "E4",
          "E8",
          "E10",
          "F5",
          "F7",
          "F13",
          "G4",
          "G8",
          "G14",
          "H3",
          "H5",
          "H9",
          "H11",
          "H13",
          "H21",
          "I4",
          "J3",
          "J17",
          "J19",
          "K6",
          "K10",
          "K18",
          "L7",
          "L11",
          "L13",
          "L17",
          "M6",
          "M8",
          "M12",
          "M14",
        ]
      },
      {
        color: "plain",
        hexes: [
          "B11",
					"F19",
					"I6",
        ],
        borders: [ { side: 1, dashed: "true", color: "gray" },
					{ side: 2, dashed: "true", color: "gray" },
					{ side: 3, dashed: "true", color: "gray" },
					{ side: 4, dashed: "true", color: "gray" },
					{ side: 5, dashed: "true", color: "gray" },
					{ side: 6, dashed: "true", color: "gray" } ],
      },
      {
        color: "green",
        hexes: [
          "M18",
          "L19",
          "K20",
          "H23",
          "N7",
          "N9",
          "N11",
          "N13",
          "N15",
          "M4",
          "L3",
        ]
      },
      {
        color: "cyan",
        hexes: [
          "J21",
          "I22",
          "K2",
          "J1",
          "I2",
          "H1",
          "F1",
          "E2",
          "C2",
          "B3",
          "B5",
          "C22",
          "D23",
          "F23",
        ]
      }
    ]
  }
};

export default game;
