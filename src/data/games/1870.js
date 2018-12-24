const game = {
  // Generic Game Info
  info: {
    title: "1870",
    subtitle: "Railroading across the Trans Mississippi from 1870",
    designer: "Bill Dixon",
    background: "green",
    width: 150,
    color_10: "orange",
    titleX: 75,
    titleY: 2000,
    extraTotalHeight: 300,
    hexCoords: true
  },

  // Extra Tokens
  tokens: ["Round", "#port", "#port", "#meat", "#meat"],

  // Need an IPO sheet
  ipo: true,

  bank: "$12,000",

  players: [
    {
      number: 2,
      certLimit: 28,
      capital: "$1050"
    },
    {
      number: 3,
      certLimit: 20,
      capital: "$700"
    },
    {
      number: 4,
      certLimit: 16,
      capital: "$525"
    },
    {
      number: 5,
      certLimit: 13,
      capital: "$420"
    },
    {
      number: 6,
      certLimit: 11,
      capital: "$350"
    }
  ],

  // Railway Companies
  companies: [
    {
      name: "Atchison, Topeka & Santa Fe",
      abbrev: "ATSF",
      tokens: ["Free", "$40", "$100", "Southwest"],
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
      name: "Fort Worth & Denver City Railway",
      abbrev: "FW",
      tokens: ["Free", "$40", "Denver"],
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
      name: "Gulf, Mobile & Ohio Railroad",
      abbrev: "GMO",
      tokens: ["Free", "$40", "St. Louis"],
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
      name: "Illinois Central Railroad",
      abbrev: "IC",
      tokens: ["Free", "$40", "Chicago"],
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
      name: "Missouri Pacific Railroad",
      abbrev: "MP",
      tokens: ["Free", "$40", "$100", "Dallas"],
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
      name: "Missouri Kansas Texas Railroad",
      abbrev: "MKT",
      tokens: ["Free", "$40", "$100", "Southwest"],
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
      name: "Southern Pacific Railroad",
      abbrev: "SP",
      tokens: ["Free", "$40", "$100", "New Orleans"],
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
      name: "St. Louis Southwestern Railway",
      abbrev: "SSW",
      tokens: ["Free", "$40", "Fort Worth"],
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
      name: "St. Louis-San Francisco Railway",
      abbrev: "SLSF",
      tokens: ["Free", "$40", "$100", "Southeast"],
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
      name: "Texas & Pacific Railway",
      abbrev: "TP",
      tokens: ["Free", "$40", "New Orleans"],
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
          color: "green",
          note: "Rusted by 4"
        }
      ]
    },
    {
      name: "3",
      quantity: 6,
      price: "$180",
      color: "green",
      info: [
        {
          color: "gray",
          note: "Rusted by 6"
        }
      ]
    },
    {
      name: "4",
      quantity: 5,
      price: "$300",
      color: "green",
      info: [
        {
          color: "gray",
          note: "Rusted by 8"
        }
      ]
    },
    {
      name: "5",
      quantity: 4,
      price: "$450",
      color: "brown",
      info: [
        {
          color: "gray",
          note: "Rusted by 12"
        }
      ]
    },
    {
      name: "6",
      quantity: 3,
      price: "$630",
      color: "gray",
      info: [
        {
          color: "yellow",
          note: "Permanent"
        }
      ]
    },
    {
      name: "8",
      quantity: 3,
      price: "$800",
      color: "gray",
      info: [
        {
          color: "yellow",
          note: "Permanent"
        }
      ]
    },
    {
      name: "10",
      quantity: 2,
      price: "$950",
      color: "gray",
      info: [
        {
          color: "yellow",
          note: "Permanent"
        }
      ]
    },
    {
      name: "12",
      quantity: 6,
      price: "$1100",
      color: "gray",
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
      name: "Great River Shipping Company",
      price: "$20",
      revenue: "$5",
      description: ""
    },
    {
      name: "Mississippi River Bridge Company",
      price: "$40",
      revenue: "$10",
      description:
        ""
    },
    {
      name: "The Southern Cattle Company",
      price: "$50",
      revenue: "$10",
      description:
        "This company has a token that may be placed on any city west of the Mississippi River. Cities located in the same hex as any portion of the Mississippi are not eligible for this placement. This increases the value of that city by $10 for that company only. Placing the token does not close the company."
    },
    {
      name: "The Gulf Shipping Company",
      price: "$80",
      revenue: "$15",
      description:
        ""
    },
    {
      name: "St. Louis-San Francisco Railway",
      price: "$140",
      description:
        "This is the President's certificate of the St.Louis-San Francisco Railway. The purchaser sets the par value of the railway. Unlike other companies, this company may operate with just 20% sold. It may not be purchased by another public company."
    },
    {
      name: "Missouri-Kansas-Texas Railroad",
      price: "$160",
      revenue: "$20",
      description:
        "Comes with a 10% share of the Missouri-Kansas-Texas Railroad."
    }
  ],

  phases: [
    {
      name: "2",
      limit: "4",
      number: "7",
      tiles: "yellow"
    },
    {
      name: "3",
      limit: "4",
      number: "6",
      tiles: "green",
      notes: "Private companies may be purchased"
    },
    {
      name: "4",
      rust: "2",
      limit: "3",
      number: "5",
      tiles: "green"
    },
    {
      name: "5",
      limit: "2",
      number: "4",
      tiles: "brown",
      notes: "Private companies are closed"
    },
    {
      name: "6",
      limit: "2",
      number: "3",
      rust: "3",
      tiles: "gray",
      notes: "Remove port & cattle tokens"
    },
    {
      name: "8",
      limit: "2",
      number: "3",
      rust: "4",
      tiles: "gray"
    },
    {
      name: "10",
      limit: "2",
      number: "2",
      tiles: "gray"
    },
    {
      name: "12",
      limit: "2",
      number: "∞",
      rust: "5",
      tiles: "gray"
    }
  ],

  pools: [
    {
      name: "Market",
      notes: [
        {
          color: "orange",
          note: "Shares in the market pay dividends to the corporation"
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
        "Buy one share",
        "Sell any number of shares"
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
      optional: ["Purchase private companies"]
    }
  ],

  stock: {
    type: "2D",
    par: {
      values: [
        {
          label: 100,
          width: "2.75in"
        },
        {
          label: 90,
          width: "2.75in"
        },
        {
          label: 82,
          width: "2.5in"
        },
        {
          label: 76,
          width: "2.5in"
        },
        {
          label: 72,
          width: "2.25in"
        },
        {
          label: 68,
          width: "2.25in"
        }
      ]
    },
    movement: {
      up: ["Sold out"],
      down: ["Every unprotected share sold"],
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
    "3": 3,
    "4": 6,
    "5": 2,
    "6": 2,
    "7": 9,
    "8": 22,
    "9": 23,
    "55": 1,
    "56": 1,
    "57": 5,
    "58": 4,
    "69": 1,
    "14": 4,
    "15": 4,
    "16": 2,
    "17": 2,
    "18": 2,
    "19": 2,
    "20": 2,
    "23": 4,
    "24": 4,
    "25": 3,
    "26": 2,
    "27": 2,
    "28": 2,
    "29": 2,
    "141": 2,
    "142": 2,
    "143": 1,
    "144": 1,
    "39": 1,
    "40": 2,
    "41": 3,
    "42": 3,
    "43": 2,
    "44": 1,
    "45": 2,
    "46": 2,
    "47": 2,
    "63": 5,
    "70": 2,
    "145": 2,
    "146": 2,
    "147": 2,
    "170": 4,
    "171": 1,
    "172": 1
  },

  map: {
    print: "landscape",
    hexes: [
      {
        color: "offboard",
        labels: [
          {label: "Denver", angle: 157, percent: 0.6}
        ],
        offBoardRevenue: {
          angle: 90,
          percent: 0.25,
          phaseReversed: true,
          revenues: [
            {
              color: "white",
              cost: "30",
              phase: 2
            },
            {
              color: "black",
              textColor: "white",
              cost: "40",
              phase: 5
            },
            {
              color: "white",
              cost: "50",
              phase: 8
            }
          ]
        },
        offBoardTrack: [{side: 4},{side: 5}],
        hexes: ["A2"]
      },
      {
        color: "offboard",
        labels: [
          {label: "Chicago", angle: 203, percent: 0.6}
        ],
        offBoardRevenue: {
          angle: 270,
          percent: 0.25,
          phaseReversed: true,
          revenues: [
            {
              color: "white",
              cost: "40",
              phase: 2
            },
            {
              color: "black",
              textColor: "white",
              cost: "50",
              phase: 5
            },
            {
              color: "white",
              cost: "60",
              phase: 8
            }
          ]
        },
        offBoardTrack: [{side: 1},{side: 6}],
        hexes: ["A22"]
      },
      {
        color: "offboard",
        labels: [
          {label: "Southwest", angle: 157, percent: 0.6}
        ],
        offBoardRevenue: {
          angle: 90,
          percent: 0.25,
          phaseReversed: true,
          revenues: [
            {
              color: "white",
              cost: "20",
              phase: 2
            },
            {
              color: "black",
              textColor: "white",
              cost: "40",
              phase: 5
            },
            {
              color: "white",
              cost: "50",
              phase: 8
            }
          ]
        },
        offBoardTrack: [{side: 3},{side: 4},{side: 5}],
        hexes: ["N1"]
      },
      {
        color: "offboard",
        labels: [
          {label: "Southeast", angle: 203, percent: 0.6}
        ],
        offBoardRevenue: {
          angle: 270,
          percent: 0.25,
          phaseReversed: true,
          revenues: [
            {
              color: "white",
              cost: "20",
              phase: 2
            },
            {
              color: "black",
              textColor: "white",
              cost: "30",
              phase: 5
            },
            {
              color: "white",
              cost: "50",
              phase: 8
            }
          ]
        },
        offBoardTrack: [{side: 1},{side: 2},{side: 6}],
        hexes: ["M22"]
      },
      {
        color: "plain",
        water: {size:"small",cost:"$40",percent:0.5},
        centerTowns: [{ angle: 120, percent: 0.5 },
                      { angle: 240, percent: 0.5 }],
        hexes: ["A16"]
      },
      {
        color: "plain",
        water: {size:"small",cost:"$60",percent:0.5},
        centerTowns: [{ angle: 120, percent: 0.5 },
                      { angle: 240, percent: 0.5 }],
        hexes: ["E20","I10"]
      },
      {
        color: "plain",
        cities: [{
          companies: [{
            label: "AT",
            color: "maroon"
          }]
        }],
        hexes: ["B9"]
      },
      {
        color: "plain",
        water: {size:"small",cost:"$40",percent:0.67},
        labels: [{percent: 0.67,angle:180,label:"P"}],
        cities: [{
          companies: [{
            label: "MK",
            color: "maroon"
          }]
        }],
        hexes: ["B11"]
      },
      {
        color: "plain",
        mountain: {size:"small",cost:"$60",percent:0.67},
        cities: [{
          companies: [{
            label: "SL",
            color: "maroon"
          }]
        }],
        hexes: ["E12"]
      },
      {
        color: "plain",
        water: {size:"small",cost:"$60",percent:0.67},
        cities: [{
          companies: [{
            label: "SS",
            color: "maroon"
          }]
        }],
        hexes: ["H17"]
      },
      {
        color: "plain",
        water: {size:"small",cost:"$40",percent:0.67},
        labels: [{percent: 0.67,angle:180,label:"P"}],
        cities: [{
          companies: [{
            label: "MP",
            color: "maroon"
          }]
        }],
        hexes: ["C18"]
      },
      {
        color: "plain",
        labels: [{percent: 0.67,angle:180,label:"P"}],
        cities: [{
          companies: [{
            label: "FW",
            color: "maroon"
          }]
        }],
        hexes: ["J3"]
      },
      {
        color: "plain",
        labels: [{percent: 0.67,angle:180,label:"P"}],
        cities: [{
          companies: [{
            label: "TP",
            color: "black"
          }]
        }],
        hexes: ["J5"]
      },
      {
        color: "plain",
        cities: [{
          companies: [{
            label: "IC",
            color: "darkGreen"
          }]
        }],
        hexes: ["K16"]
      },
      {
        color: "plain",
        cities: [{
          companies: [{
            label: "GMO",
            color: "red"
          }]
        }],
        hexes: ["M20"]
      },
      {
        color: "plain",
        water: {size:"small",cost:"$60",percent: 0.67},
        cities: [{}],
        hexes: ["L11"]
      },
      {
        color: "plain",
        water: {size:"small",cost:"$80",percent: 0.67},
        cities: [{}],
        hexes: ["M14"]
      },
      {
        color: "plain",
        water: {size:"small",cost:"$80",percent: 0.67},
        cities: [{}],
        hexes: ["N7"]
      },
      {
        color: "plain",
        borders: [{color:"water",side:4}],
        water: {size:"small",cost:"$80",percent: 0.67},
        labels: [{percent: 0.67,angle:180,label:"P"}],
        cities: [{}],
        hexes: ["N17"]
      },
      {
        color: "plain",
        borders: [{color: "water", side: 1},
                  {color: "water", side: 6}],
        water: {cost: "$80", size: "small"},
        hexes: ["N19"]
      },
      {
        color: "plain",
        borders: [{color: "water", side: 3}],
        water: {cost: "$100", size: "small"},
        hexes: ["O18"]
      },
      {
        color: "plain",
        water: {cost: "$80", size: "small", angle: 270, percent: 0.4},
        centerTowns: [{ angle: 90, percent: 0.4 }],
        hexes: ["N21"]
      },
      {
        color: "plain",
        water: {cost: "$40", size: "small", angle: 270, percent: 0.4},
        centerTowns: [{ angle: 90, percent: 0.4 }],
        hexes: ["A10", "B13", "D17", "H3", "K14"]
      },
      {
        color: "plain",
        mountain: {cost: "$60", size: "small"},
        hexes: ["D13", "D15", "E14", "E16", "F11", "F13", "F15"]
      },
      {
        color: "plain",
        water: {cost: "$40", size: "small"},
        hexes: ["B17","C14","C16","G2","H5"]
      },
      {
        color: "plain",
        water: {cost: "$60", size: "small"},
        hexes: ["E18","F19","G18","H7","I8","I16","J11","J15","K10","O2"]
      },
      {
        color: "plain",
        water: {cost: "$80", size: "small"},
        hexes: ["L13","O4","O6","N9","N11","N13","N15"]
      },
      {
        color: "plain",
        water: {cost: "$100", size: "small"},
        hexes: ["O14","O16"]
      },
      {
        color: "plain",
        cities: [{
          size: 1
        }],
        hexes: ["B19","D5","F5","H13","M2","M6"]
      },
      {
        color: "plain",
        centerTowns: [{}],
        hexes: ["B7", "D9", "D21", "E8", "F9", "G10", "G20", "H21", "I14", "J9", "K4", "K20", "M8", "M10"]
      },
      {
        color: "plain",
        hexes: ["A4","A6","A8","A12","A14","A18","A20",
                "B3","B5","B15","B21",
                "C2","C4","C6","C8","C10","C12","C20",
                "D1","D3","D7","D11","D19",
                "E2","E4","E6","E10",
                "F1","F3","F7","F17","F21",
                "G4","G6","G8","G12","G14","G16",
                "H1","H9","H11","H15","H19",
                "I2","I4","I6","I12","I18","I20",
                "J1","J7","J13","J17","J19","J21",
                "K2","K6","K8","K12","K18",
                "L1","L3","L5","L7","L9","L15","L17","L19","L21",
                "M4","M12","M16","M18",
                "N3","N5"]
      }
    ]
  }
};

export default game;
