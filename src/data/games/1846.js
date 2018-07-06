const game = {
  // Generic Game Info
  info: {
    title: "1846",
    subtitle: "The Race for the Midwest",
    designer: "Thomas Lehmann",
    background: "brown",
    width: 150,
    rotatation: 90
  },

  // Extra Tokens
  tokens: ["Round", "Steam", "Steam", "Meat", "Meat", "Big 4", "MS"],

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

  privates: [],

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
      number: "8",
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
          note: "No more than 50% of a company may be in the market"
        },
        {
          color: "orange",
          note: "No stock sales during first stock round"
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
      steps: ["Buy one certificate", "Sell any number of certificates"],
      ordered: false
    },
    {
      name: "Operating Round",
      steps: [
        "Issue or redeem shares",
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
    type: "1D",
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
    limits: []
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

  map: { hexes: [] }
};

export default game;
