const game = {
  // Generic Game Info
  info: {
    title: "1828",
    designer: "J C Lawrence",
    background: "gray",
    width: 150,
    color_10: "orange",
    titleY: 1300,
    titleX: 1700,
    extraHomeTokens: 4
  },

  config: {
    plainMapHomes: true
  },

  colors: {
    train_yellow: "rgb(241, 231, 141)",
    train_green: "rgb(165,211,167)",
    train_blue: "rgb(148, 205, 235)",
    train_brown: "rgb(204, 170, 144)",
    train_red: "rgb(231, 103, 113)",
    train_gray: "rgb(180, 180, 180)",
    train_purple: "rgb(202, 161, 221)"
  },

  // Extra Tokens
  tokens: ["Round",
           "Merger",
           {token:"black"},
           {token:"black"},
           {token:"black"},
           {token:"black"},
           {token:"black"},
           {token:"black"},
           {label:"C&P", token:{type:"bar",colors:["white", "black"]}},
           {label:"coal", token:"black"},
           {label:"coal", token:"black"},
           {label:"coal", token:"black"}],

  // Need an IPO sheet
  ipo: false,
  revenue: false,

  players: [
    {number: 3, certLimit: "∞", capital: "$800"},
    {number: 4, certLimit: "∞", capital: "$700"},
    {number: 5, certLimit: "∞", capital: "$620"},
  ],

  // Railway Companies
  companies: [{
    name: "Boston & Maine",
    abbrev: "B&M",
    tokens: ["Free", "$100", "$100", "$100"],
    token: "blue",
    shares: [{ quantity: 1, label: "Director's Share", percent: 20, shares: 2 },
             { quantity: 8, percent: 10, shares: 1 }]
  },{
    name: "Baltimore & Ohio",
    abbrev: "B&O",
    tokens: ["Free", "$100", "$100"],
    token: { type: "quarters", colors: ["blue", "yellow"]},
    shares: [{ quantity: 1, label: "Director's Share", percent: 20, shares: 2 },
             { quantity: 8, percent: 10, shares: 1 }]
  },{
    name: "Chesapeake & Ohio",
    abbrev: "C&O",
    tokens: ["Free", "$100", "$100"],
    token: "cyan",
    shares: [{ quantity: 1, label: "Director's Share", percent: 20, shares: 2 },
             { quantity: 8, percent: 10, shares: 1 }]
  },{
    name: "Canadian Pacific Railway",
    abbrev: "CPR",
    tokens: ["Free", "$100", "$100", "$100"],
    token: {type:"bar", colors:["brown"]},
    shares: [{ quantity: 1, label: "Director's Share", percent: 20, shares: 2 },
             { quantity: 8, percent: 10, shares: 1 }]
  },{
    name: "Grand Trunk",
    abbrev: "GT",
    tokens: ["Free", "$100", "$100"],
    token: { type: "stripe", colors: ["yellow", "red"]},
    shares: [{ quantity: 1, label: "Director's Share", percent: 20, shares: 2 },
             { quantity: 8, percent: 10, shares: 1 }]
  },{
    name: "Erie Railroad",
    abbrev: "ERIE",
    tokens: ["Free", "$100", "$100"],
    token: {type:"bar", colors: ["yellow"]},
    shares: [{ quantity: 1, label: "Director's Share", percent: 20, shares: 2 },
             { quantity: 8, percent: 10, shares: 1 }]
  },{
    name: "Illinois Central",
    abbrev: "IC",
    tokens: ["Free", "$100", "$100", "$100"],
    token: {type: "halves", colors: ["green", "yellow"]},
    shares: [{ quantity: 1, label: "Director's Share", percent: 20, shares: 2 },
             { quantity: 8, percent: 10, shares: 1 }]
  },{
    name: "Michigan Central Railroad",
    abbrev: "MC",
    tokens: ["Free", "$100", "$100", "$100"],
    token: {type: "square", colors: ["yellow", "black"]},
    shares: [{ quantity: 1, label: "Director's Share", percent: 20, shares: 2 },
             { quantity: 8, percent: 10, shares: 1 }]
  },{
    name: "Missouri Pacific Railraod",
    abbrev: "MP",
    tokens: ["Free", "$100", "$100", "$100"],
    token: {type: "target", colors: ["red", "white"]},
    shares: [{ quantity: 1, label: "Director's Share", percent: 20, shares: 2 },
             { quantity: 8, percent: 10, shares: 1 }]
  },{
    name: "New York Central",
    abbrev: "NYC",
    tokens: ["Free", "$100", "$100"],
    token: {type: "stripe", colors:["black", "white"]},
    shares: [{ quantity: 1, label: "Director's Share", percent: 20, shares: 2 },
             { quantity: 8, percent: 10, shares: 1 }]
  },{
    name: "New York, Chicago & St. Louis Railroad",
    abbrev: "NKP",
    tokens: ["Free", "$100", "$100"],
    token: {type: "halves", colors: ["blue", "cyan"]},
    shares: [{ quantity: 1, label: "Director's Share", percent: 20, shares: 2 },
             { quantity: 8, percent: 10, shares: 1 }]
  },{
    name: "New York, New Haven & Hartford",
    abbrev: "NYH",
    tokens: ["Free", "$100", "$100"],
    token: "orange",
    shares: [{ quantity: 1, label: "Director's Share", percent: 20, shares: 2 },
             { quantity: 8, percent: 10, shares: 1 }]
  },{
    name: "Norfold & Western Railway",
    abbrev: "NW",
    tokens: ["Free", "$100", "$100", "$100"],
    token: {type: "stripes", colors:["red", "yellow"]},
    shares: [{ quantity: 1, label: "Director's Share", percent: 20, shares: 2 },
             { quantity: 8, percent: 10, shares: 1 }]
  },{
    name: "Ontario, Simcoe & Huron",
    abbrev: "OS&H",
    tokens: ["Free", "$100", "$100", "$100"],
    token: {type:"stripe", colors: ["green", "lightGreen"]},
    shares: [{ quantity: 1, label: "Director's Share", percent: 20, shares: 2 },
             { quantity: 8, percent: 10, shares: 1 }]
  },{
    name: "Pennsylvania Railroad",
    abbrev: "PRR",
    tokens: ["Free", "$100", "$100", "$100"],
    token: "red",
    shares: [{ quantity: 1, label: "Director's Share", percent: 20, shares: 2 },
             { quantity: 8, percent: 10, shares: 1 }]
  },{
    name: "Wabash Railroad",
    abbrev: "WAB",
    tokens: ["Free", "$100", "$100"],
    token: {type: "square", labelColor: "yellow", colors: ["blue", "red"]},
    shares: [{ quantity: 1, label: "Director's Share", percent: 20, shares: 2 },
             { quantity: 8, percent: 10, shares: 1 }]
  }],

  trains: [
    {
      name: "2",
      quantity: 6,
      price: "$80",
      color: "train_yellow",
      info: [
        {
          color: "train_blue",
          note: "Rusted by 5"
        }
      ]
    },
    {
      name: "3",
      quantity: 9,
      price: "$160",
      color: "train_green",
      info: [
        {
          color: "brown",
          note: "Rusted by 6"
        }
      ]
    },
    {
      name: "5",
      quantity: 4,
      price: "$250",
      color: "train_blue",
      info: [
        {
          color: "train_gray",
          note: "Rusted by 8E"
        }
      ]
    },
    {
      name: "3+D",
      quantity: 6,
      price: "$350",
      color: "train_brown",
      info: [
        {
          color: "train_purple",
          note: "Rusted by D"
        }
      ]
    },
    {
      name: "6",
      quantity: 4,
      price: "$650",
      color: "train_red",
      info: [
        {
          color: "train_yellow",
          note: "Permanent"
        }
      ]
    },
    {
      name: "8E",
      quantity: 3,
      price: "$800",
      color: "train_gray",
      info: [
        {
          color: "train_yellow",
          note: "Permanent"
        }
      ]
    },
    {
      name: "D",
      quantity: 6,
      price: "$900",
      color: "train_gray",
      info: [
        {
          color: "train_yellow",
          note: "Permanent"
        }
      ]
    }
  ],

  privates: [],

  phases: [
    {phase: "Yellow", train: "2", limit: "4", number: "6", tiles: "yellow"},
    {phase: "Green", train: "3", limit: "4", number: "9", tiles: "green", notes: "Private companies may be purchased"},
    {phase: "Blue", train: "5", limit: "4", rust: "2", number: "4", tiles: "green"},
    {phase: "Brown", train: "3+D", limit: "3", number: "6", tiles: "brown"},
    {phase: "Red", train: "6", limit: "2", rust: "3", number: "4", tiles: "brown", notes: "One less 6T when playing with 3 players. Private companies are closed"},
    {phase: "Gray", train: "8E", limit: "2", rust: "5", number: "3", tiles: "brown"},
    {phase: "Purple", train: "Diesel", limit: "2", rust: "3+D", number: "∞", tiles: "brown", notes: "Director's certificates cannot be bought from the IPO."},
  ],

  pools: [
    {name: "Market", notes: [],},
  ],

  rounds: [
    {name: "OR4", color: "train_purple",},
    {name: "OR3", color: "train_brown",},
    {name: "OR2", color: "train_green",},
    {name: "OR1", color: "train_yellow",},
    {name: "SR", color: "train_gray",},
  ],

  turns: [],

  stock: {

    paginated: true,
    orientation: "portrait",
    cell: {
      width: 0.7,
      height: 0.85,
    },

    type: "2D",
    par: {
      values: [
        {label: "Systems", color: "train_purple", height: "1.25in", width: "3.0in"},
        {label: "$120", color: "train_brown", height: "0.65in", width: "3.0in"},
        {label: "$105", color: "train_blue", height: "0.65in", width: "3.0in"},
        {label: "$94", color: "train_green", height: "0.65in", width: "3.0in"},
        {label: "$86", color: "train_green", height: "0.65in", width: "3.0in"},
        {label: "$79", color: "train_yellow", height: "1.25in", width: "3.0in"},
        {label: "$71", color: "train_yellow", height: "0.65in", width: "3.0in"},
        {label: "$67", color: "train_yellow", height: "1.25in", width: "3.0in"},
      ]
    },
    movement: {},
    market: [
      [
        { label: 122, arrow: "down" },
        130, 138, 147, 157, 167, 178, 191, 213, 240,
        272, 312, 357, 412,
        { label: 500, color: "train_red", },
      ],
      [
        { label: 112, arrow: "down" },
        { label: 120, color: "train_brown"},
        127, 136, 145, 154, 164, 176, 197, 221, 251, 287, 329, 380,
        { label: 443, arrow: "up" },
      ],
      [
        { label: 102, arrow: "down" },
        107, 113, 119, 126, 133, 140, 149, 165, 184, 207,
        235, 267, 305,
        { label: 353, arrow: "up" },
      ],
      [
        { label: 95, arrow: "down" },
        100,
        { label: 105, color: "train_blue", },
        111, 117, 124, 130, 139, 153, 171, 192, 218, 248, 284,
        { label: 328, arrow: "up" },
      ],
      [
        { label: 87, arrow: "down" },
        92, 96, 101, 106, 111, 117, 124, 136, 151, 169, 191, 216, 246,
        { label: 283, arrow: "up" },
      ],
      [
        { label: 81, arrow: "down" },
        86, 90,
        { label: 94, color: "train_green", },
        99, 104, 109, 116, 127, 141, 158, 179, 202,
        { label: 230, arrow: "up" },
      ],
      [
        { label: 76, arrow: "down" },
        80, 84, 88, 93, 97, 102, 108, 119, 132, 148, 167,
        { label: 189, arrow: "up" },
      ],
      [
        { label: 71, color: "train_gray", arrow: "down" },
        75, 78, 82,
        { label: 86, color: "train_green", },
        91, 95, 101, 111, 123, 138,
        { label: 156, arrow: "up" },
      ],
      [
        { label: 66, color: "train_gray", arrow: "down" },
        { label: 70, color: "train_gray",},
        73, 77, 81, 85, 89, 94, 104, 115,
        { label: 129, arrow: "up" },
      ],
      [
        { label: 62, color: "train_gray", arrow: "down" },
        { label: 65, color: "train_gray",},
        69, 72, 76,
        { label: 79, color: "train_yellow", },
        83, 88, 97,
        { label: 108, arrow: "up" },
      ],
      [
        { label: 58, color: "train_gray", arrow: "down" },
        { label: 61, color: "train_gray",},
        { label: 64, color: "train_gray",},
        67, 71, 74, 78, 82, 91,
        { label: 101, arrow: "up" },
      ],
      [
        { label: 54, color: "train_gray", arrow: "down" },
        { label: 57, color: "train_gray",},
        { label: 60, color: "train_gray",},
        { label: 63, color: "train_gray",},
        66, 69,
        { label: 71, color: "train_yellow", },
        77,
        { label: 85, arrow: "up" },
      ],
      [
        { label: 51, color: "train_gray", arrow: "down" },
        { label: 53, color: "train_gray",},
        { label: 56, color: "train_gray",},
        { label: 59, color: "train_gray",},
        62, 65, 68, 72,
        { label: 79, arrow: "up" },
      ],
      [
        { label: 47, color: "train_gray",},
        { label: 50, color: "train_gray",},
        { label: 52, color: "train_gray",},
        { label: 55, color: "train_gray",},
        { label: 58, color: "train_gray",},
        60, 64,
        { label: 67, color: "train_yellow", },
        { label: 74, arrow: "up" },
      ],
      [
        null,
        { label: 47, color: "train_gray", arrow: "down" },
        { label: 49, color: "train_gray",},
        { label: 51, color: "train_gray",},
        { label: 54, color: "train_gray",},
        { label: 57, color: "train_gray",},
        { label: 59, arrow: "up" },
      ],
      [
        null,
        { label: 43, color: "train_gray",},
        { label: 46, color: "train_gray",},
        { label: 48, color: "train_gray",},
        { label: 50, color: "train_gray",},
        { label: 53, color: "train_gray",},
        { label: 55, color: "train_gray", arrow: "up" },
      ],
      [
        null, null,
        { label: 43, color: "train_gray", arrow: "down" },
        { label: 45, color: "train_gray",},
        { label: 47, color: "train_gray",},
        { label: 49, color: "train_gray",},
        { label: 52, color: "train_gray", arrow: "up" },
      ],
      [
        null, null,
        { label: 40, color: "train_gray",},
        { label: 42, color: "train_gray",},
        { label: 44, color: "train_gray",},
        { label: 46, color: "train_gray",},
        { label: 48, color: "train_gray", arrow: "up" },
      ],
    ],
    legend: [],
  },

  tiles: {
    // Yellow
    "7": 6,
    "9": 16,
    "3": 3,
    "8": 15,
    "4": 4,
    "58": 3,
    "57": 7,
    "1": 1,
    "2": 1,
    "69": 1,
    "55": 1,
    "56": 1,

    // Green
    "14": 6,
    "15": 4,
    "16": 1,
    "18": 1,
    "19": 1,
    "20": 1,
    "23": 4,
    "24": 4,
    "25": 3,
    "26": 2,
    "27": 2,
    "28": 2,
    "29": 2,
    "30": 2,
    "31": 2,
    "205": 2,
    "206": 2,
    "121|BO": 1,
    "53|BA": 1,
    "54": {rotations:[240]},
    "59": 3,

    // Brown
    "39": 2,
    "40": 2,
    "70": 2,
    "41": 2,
    "42": 2,
    "43": 2,
    "44": 2,
    "45": 2,
    "46": 2,
    "47": 4,
    "62": {rotations: [240]},
    "63": 3,
    "448": 2,
    "449": 2,
    "61|BA": {rotations: [0,240]},
    "997|BO": {rotations: [180,300]},
    "64": 1,
    "65": 1,
    "66": 1,
    "67": 1,
    "68": 1
  },

  map: {
    hexes: [
      {
        color: "offboard",
        labels: [
          {
            angle: 0,
            percent: 0.333,
            label: "Copper Country",
          },
        ],
        values: [
          {
            value: 60,
          }
        ],
        offBoardTrack: [{side: 4},],
        hexes: ["A3"]
      },
      {
        color: "offboard",
        values: [
          {value: 20, angle: 180, percent: 0.5,},
        ],
        towns: [
          {
            rotation: 90,
            name: {
              name: "Marquette",
              reverse: true
            },
          },
        ],
        track: [{type: "straight", side: 1,},],
        hexes: ["A5"]
      },
      {
        color: "gray",
        cities: [
          {
            name: {
              rotation: 30,
              name: "Mackinaw City",
            },
            companies: ["MC"]
          },
        ],
        values: [{angle: 30, percent: 0.667, value: 30,},],
        track: [
          {start: 1,},{start: 5,},
        ],
        hexes: ["A7"]
      },
      {
        color: "offboard",
        offBoardRevenue: {
          angle: 0,
          percent: 0.15,
          revenues: [
            {color: "yellow", cost: "30",},
            {color: "brown", cost: "50",},
          ]
        },
        offBoardTrack: [{side: 5,},],
        hexes: ["A13"]
      },
      {
        color: "offboard",
        cities: [
          {
            angle: 90,
            percent: 1.0,
            outside: true,
            companies: ["OS&H"],
            name: {
              rotation: 60,
              name: "Canada",
            },
          }
        ],
        offBoardRevenue: {
          angle: 0,
          percent: 0.15,
          revenues: [
            {color: "yellow", cost: "30",},
            {color: "brown", cost: "50",},
          ]
        },
        offBoardTrack: [{side: 5,},{side: 6,},],
        hexes: ["A15"]
      },
      {
        color: "gray",
        track: [{type: "sharp", side: 5,},],
        hexes: ["A21"]
      },
      {
        color: "gray",
        track: [
          {side: 5},
          {side: 6},
        ],
        values: [{value: 40, percent: 0.75},],
        cities: [
          {
            name: {
              rotation: 30,
              name: "Montreal",
            },
            companies: ["CPR"]
          }
        ],
        hexes: ["A23"]
      },
      {
        color: "plain",
        water: {cost: "$80", size: "medium",},
        hexes: ["B6", "B8",],
      },
      {
        color: "offboard",
        labels: [
          {
            angle: 180,
            percent: 0.333,
            label: "West",
            x: -25,
          },
        ],
        offBoardRevenue: {
          revenues: [
            {color: "yellow", cost: "20", },
            {color: "brown", cost: "60", },
          ]
        },
        offBoardTrack: [
          {side: 3,},
          {side: 4,},
          {side: 5,},
        ],
        hexes: ["I1"]
      },
      {
        color: "plain",
        cities: [
          {
            angle: 120,
            percent: 0.4,
            name: {
              name: "St Louis",
              rotation: 30
            },
            companies: ["MP"]
          }
        ],
        water: {
          angle: 300,
          percent: 0.5,
          cost: "$80",
          size: "medium"
        },
        hexes: ["I3"],
      },

      {
        color: "offboard",
        labels: [
          {
            angle: 0,
            percent: 0.333,
            label: "New Orleans",
          },
        ],
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
          {side: 2,},
          {side: 3,},
        ],
        hexes: ["K3"]
      },
      {
        color: "gray",
        cities: [
          {
            name: {
              name: "Grand Rapids",
              rotation: 270
            },
            companies: ["GT"]
          }
        ],
        values: [
          {
            angle: 300,
            percent: 0.75,
            value: 30
          }
        ],
        track: [
          {start: 3,},
          {start: 4,},
          {start: 5,},
        ],
        hexes: ["D4"]
      },
      {
        color: "plain",
        cities: [
          {
            angle: 120,
            percent: 0.4,
            name: {
              name: "Lansing",
              rotation: 30
            }
          }
        ],
        water: {
          angle: 300,
          percent: 0.5,
          cost: "$80",
          size: "medium"
        },
        hexes: ["D6"],
      },
      {
        color: "offboard",
        labels: [
          {
            angle: 180,
            percent: 0.333,
            label: "Chicago",
          },
        ],
        offBoardRevenue: {
          revenues: [
            {color: "yellow", cost: "40", },
            {color: "brown", cost: "70", },
          ]
        },
        offBoardTrack: [
          {side: 4,},
          {side: 5,},
          {side: 6,},
        ],
        hexes: ["G3"]
      },
      {
        color: "yellow",
        cities: [
          {
            name: {
              name: "Nashville"
            },
            companies: ["IC"]
          },
        ],
        track: [
          {start: 1,},
          {start: 4,},
        ],
        values: [
          {
            percent: 0.75,
            value: 20
          }
        ],
        hexes: ["J6"]
      },
      {
        color: "plain",
        cities: [
          {
            angle: 120,
            percent: 0.4,
            name: {
              name: "Toledo",
              rotation: 30
            }
          }
        ],
        water: {
          angle: 300,
          percent: 0.5,
          cost: "$80",
          size: "medium"
        },
        hexes: ["F8"]
      },
      {
        copy: "F8",
        cities: [
          {
            name: {
              name: "Washington"
            }
          }
        ],
        hexes: ["J18"]
      },
      {
        copy: "F8",
        cities: [
          {
            name: {
              name: "Providence"
            }
          }
        ],
        hexes: ["F26"]
      },
      {
        color: "plain",
        companies: [
          {
            label: "E&K",
            angle: 180,
            percent: 0.60,
            radius: 8,
            color: "red",
          },
        ],
        centerTowns: [
          { x: -30, name: { name: "Adrian", reverse: true } },
          { x: 30, name: { name: "Ann Arbor" } }
        ],
        hexes: ["E7"]
      },
      {
        color: "yellow",
        water: {
          angle: 180,
          percent: 0.6,
          cost: "$80",
          size: "medium"
        },
        labels: [
          {
            label: "OO",
            percent: 0.667
          }
        ],
        cities: [
          {
            angle: 65,
            percent: 0.6,
            name: {
              name: "Detroit"
            }
          },
          {
            angle: 295,
            percent: 0.6,
            name: {
              name: "Windsor"
            }
          }
        ],
        hexes: ["E9"]
      },
      {
        copy: "E9",
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
        hexes: ["D14"]
      },
      {
        color: "gray",
        cities: [
          {
            name: {
              rotation: 30,
              name: "Cleveland"
            },
            companies: ["NKP"]
          }
        ],
        offBoardRevenue: {
          angle: 180,
          percent: 0.78,
          revenues: [
            {color: "yellow", cost: "30",},
            {color: "brown", cost: "40",},
          ]
        },
        track: [
          {
            side: 1
          },
          {
            side: 5
          },
          {
            side: 6
          }
        ],
        hexes: ["F10"]
      },
      {
        color: "plain",
        borders: [
          {
            side: 2,
            color: "water"
          }
        ],
        hexes: ["F12"]
      },
      {
        color: "gray",
        track: [
          {
            start: 2,
            end: 3
          }
        ],
        hexes: ["E13"]
      },
      {
        color: "gray",
        track: [
          {side: 3},
          {side: 5},
          {side: 6},
        ],
        centerTowns: [{name: {name: "Muskegon", rotation: 300,},},],
        values: [
          {angle: 270, percent: 0.50, value: 10,},
        ],
        hexes: ["C5"]
      },
      {
        color: "yellow",
        water: {
          angle: 330,
          percent: 0.667,
          cost: "$80",
          size: "small"
        },
        values: [{angle: 60, percent: 0.75, value: 20,},],
        cities: [
          {
            name: {name: "Peterborough",},
            companies: ["C&P"]
          },
        ],
        companies: [
          {
            label: "C&P",
            angle: 180,
            percent: 0.75,
            radius: 8,
            color: "red",
          },
        ],
        track: [
          {start: 1, end: 1,},
          {start: 4, end: 4,},
          {start: 6, end: 6,},
        ],
        borders: [{side: 5, color: "water",},],
        hexes: ["C15"]
      },
      {
        color: "plain",
        borders: [
          {
            side: 6,
            color: "water"
          }
        ],
        hexes: ["C17"]
      },
      {
        color: "offboard",
        labels: [
          {
            angle: 0,
            percent: 0.333,
            label: "Deep South",
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
        hexes: ["L16"]
      },
      {
        color: "gray",
        towns: [
          {
            angle: 180,
            percent: 0.57735,
            rotation: 90,
            name: {
              name: "Suffolk",
              reverse: true
            }
          }
        ],
        track: [
          {
            type: "sharp",
            side: 2
          }
        ],
        values: [
          {
            value: 10,
            angle: 0,
            percent: 0.10,
          }
        ],
        hexes: ["L18"]
      },
      {
        color: "yellow",
        labels: [
          {
            label: "OO",
            percent: 0.667
          }
        ],
        cities: [
          {
            angle: 75,
            percent: 0.55,
            name: {
              name: "Dunkirk",
            },
          },
          {
            angle: 285,
            percent: 0.55,
            name: {
              name: "Buffalo",
            },
            companies: ["ERIE"]
          }
        ],
        hexes: ["E15"]
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
        hexes: ["D16"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            name: {
              name: "Washington"
            }
          }
        ],
        hexes: ["I11"]
      },
      {
        color: "gray",
        offBoardRevenue: {
          angle: 180,
          percent: 0.75,
          revenues: [
            {color: "yellow", cost: "20",},
            {color: "brown", cost: "30",},
          ]
        },
        cities: [
          {
            name: {
              name: "Altoona",
              reverse: true,
              y: 30,

            },
            companies: ["PRR"]
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
          },
          {side: 2},
          {side: 3},
        ],
        hexes: ["H16"]
      },
      {
        color: "plain",
        hexes: ["I17"]
      },
      {
        color: "gray",
        cities: [
          {
            name: {
              name: "Rochester"
            }
          }
        ],
        values: [
          {
            value: 20,
            angle: 330,
            percent: 0.65,
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
            side: 6
          }
        ],
        hexes: ["D18"]
      },
      {
        color: "gray",
        values: [
          {
            value: 10,
            angle: 150,
            percent: 0.72,
          },
        ],
        towns: [
          {
            rotation: 60,
            angle: 150,
            percent: 0.26,
            name: {
              name: "Kingston",
              reverse: true
            }
          }
        ],
        track: [
          {
            type: "gentle",
            side: 1
          }
        ],
        hexes: ["C19"]
      },
      {
        color: "plain",
        mountain: {
          size: "large",
          cost: "$120",
          percent: 0.333
        },
        companies: [
          {
            label: "SVN",
            angle: 180,
            percent: 0.333,
            radius: 8,
            color: "red",
          }
        ],
        hexes: ["G19"]
      },
      {
        color: "yellow",
        values: [
          {
            value: 30,
            angle: 330,
            percent: 0.667
          }
        ],
        cities: [
          {
            name: {name: "Baltimore"},
            companies: ["B&O"]
          }
        ],
        track: [
          {
            side: 4
          },
          {
            side: 6
          }
        ],
        hexes: ["I19"]
      },
      {
        color: "gray",
        cities: [
          {
            name: {
              rotation: 30,
              name: "Norfolk",
            },
            companies: ["NW"],
          }
        ],
        offBoardRevenue: {
          angle: 330,
          percent: 0.60,
          revenues: [
            {color: "yellow", cost: "30",},
            {color: "brown", cost: "40",},
          ]
        },
        track: [
          {side: 1,},
          {side: 2,},
          {side: 6,},
        ],
        hexes: ["K19"]
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              rotation: 30,
              name: "Ottawa",
            }
          }
        ],
        borders: [
          {
            side: 5,
            color: "water"
          }
        ],
        hexes: ["B20"]
      },
      {
        color: "plain",
        mountain: {
          cost: "$120",
          size: "large",
          percent: 0.5,
          angle: 180
        },
        cities: [
          {
            angle: -45,
            percent: 0.5,
            name: {
              name: "Scranton",
              rotation: 45
            }
          }
        ],
        companies: [
          {
            label: "D&H",
            angle: 60,
            percent: 0.57,
            radius: 8,
            color: "red",
          }
        ],
        hexes: ["F20"]
      },
      {
        color: "plain",
        mountain: {
          cost: "$120",
          size: "large"
        },
        borders: [
          {
            side: 2,
            color: "water"
          }
        ],
        hexes: ["C21"]
      },
      {
        color: "plain",
        companies: [
          {
            label: "M&H",
            radius: 8,
            color: "red",
          }
        ],
        hexes: ["D22"]
      },
      {
        color: "gray",
        cities: [
          {
            name: {
              rotation: 30,
              name: "Schenecktady",
            },
          },
        ],
        track: [
          {side: 1,},
          {side: 5,},
          {side: 6,},
        ],
        values: [{value: 30, angle: 0, percent: 0.75, },],
        hexes: ["D24"]
      },
      {
        color: "yellow",
        companies: [
          {
            label: "C&A",
            angle: 180,
            percent: 0.60,
            radius: 8,
            color: "red",
          }
        ],
        labels: [
          {
            label: "OO",
            y: 57
          }
        ],
        cities: [
          {
            x: -40,
            y: 10,
            name: {
              rotation: 20,
              name: "Philidelphia",
              // reverse: true
            }
          },
          {
            x: 40,
            y: 10,
            name: {
              name: "Trenton",
              // reverse: true
            }
          }
        ],
        hexes: ["H22"]
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              rotation: 30,
              name: "Albany"
            },
            companies: ["NYC"]
          }
        ],
        hexes: ["E23"]
      },
      {
        color: "yellow",
        values: [
          {
            angle: 180,
            percent: 0.84,
            value: 40
          },
          {
            percent: 0.84,
            value: 40
          }
        ],
        cities: [
          {
            angle: 230,
            percent: 0.6,
            name: {
              name: "New York",
              reverse: true
            },
            companies: ["NYH"]
          },
          {
            angle: 50,
            percent: 0.6,
            name: {
              name: "Newark"
            }
          }
        ],
        labels: [
          {
            label: "NY",
            angle: 140,
            percent: 0.5
          }
        ],
        water: {
          angle: 310,
          percent: 0.7,
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
        hexes: ["G23"]
      },
      {
        color: "gray",
        towns: [
          {
            angle: 120,
            percent: 0.57735,
            rotation: 30,
            name: {
              name: "Atlantic City",
              reverse: true
            }
          }
        ],
        track: [
          {
            type: "sharp",
            side: 1
          }
        ],
        values: [
          {
            value: 10,
            angle: 330,
            percent: 0.10,
          }
        ],
        hexes: ["I23"]
      },
      {
        copy: "I23",
        towns: [
          {
            name: {
              name: "Mansfield"
            }
          }
        ],
        hexes: ["F28"]
      },
      {
        color: "plain",
        companies: [
          {
            label: "C&StL",
            percent: 0.60,
            radius: 8,
            color: "red",
          }
        ],
        centerTowns: [
          {
            name: {
              name: "Burlington"
            }
          }
        ],
        hexes: ["B24"]
      },
      {
        color: "yellow",
        cities: [
          {
            name: {
              name: "Boston",
              reverse: true,
              rotation: -90
            },
            companies: ["B&M"]
          }
        ],
        values: [
          {
            value: 30,
            angle: 90,
            percent: 0.67
          }
        ],
        track: [
          {
            side: 3
          },
          {
            side: 5
          }
        ],
        hexes: ["E27"]
      },
      {
        color: "offboard",
        labels: [
          {
            label: "Maine",
            angle: 180,
            percent: 0.333,
          }
        ],
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
        hexes: ["B28"]
      },
      {
        color: "gray",
        track: [
          {type: "sharp", side: 6,},
          {type: "gentle", side: 6,},
        ],
        hexes: ["D28"]
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              name: "Flint",
              rotation: 30
            }
          }
        ],
        hexes: ["D8"]
      },
      {
        color: "plain",
        companies: [
          {
            label: "StCT",
            angle: 0,
            percent: 0.60,
            radius: 8,
            color: "red",
          },
        ],
        centerTowns: [
          {
            name: {
              name: "Sarnia",
            }
          }
        ],
        hexes: ["D10"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            name: {
              name: "Erie"
            }
          }
        ],
        hexes: ["F14"]
      },
      {
        color: "plain",
        centerTowns: [
          { x: -30, name: { name: "Akron", reverse: true } },
          { x: 30, name: { name: "Canton" } }
        ],
        hexes: ["G11"]
      },
      {
        copy: "G11",
        centerTowns: [
          { name: { name: "Reading" } },
          { name: { name: "Allentown" } }
        ],
        hexes: ["G21"]
      },
      {
        copy: "G11",
        centerTowns: [
          { name: { name: "New Haven" } },
          { name: { name: "Hartford" } }
        ],
        hexes: ["F24"]
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              rotation: 30,
              name: "Louisville"
            },
            companies: ["WAB"]
          }
        ],
        hexes: ["H6"]
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              rotation: 30,
              name: "Cincinati"
            }
          }
        ],
        hexes: ["H8"]
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              rotation: 30,
              name: "Pittsburgh"
            }
          }
        ],
        hexes: ["H12"]
      },
      {
        color: "plain",
        cities: [
          {
            angle: 120,
            percent: 0.4,
            name: {
              name: "Barrie",
              rotation: 30
            }
          }
        ],
        water: {
          angle: 300,
          percent: 0.5,
          cost: "$80",
          size: "medium"
        },
        hexes: ["B14"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            name: {
              name: "Johnstown"
            }
          }
        ],
        hexes: ["H14"]
      },
      {
        copy: "H8",
        cities: [
          {
            name: {
              rotation: 30,
              name: "Lancaster"
            }
          }
        ],
        hexes: ["H20"]
      },
      {
        color: "plain",
        water: {
          cost: "$80",
          size: "medium"
        },
        borders: [
          {
            side: 5,
            color: "water"
          }
        ],
        hexes: ["E11",],
      },
      {
        color: "gray",
        cities: [
          {
            name: {
              name: "Virginia Coalfields",
              reverse: true,
              rotation: 30,
              y: 9,
            },
            companies: [
              {label: "coal", color: "black",},
            ]
          }
        ],
        track: [
          {side: 2},
          {side: 3},
          {side: 4},
        ],
        offBoardRevenue: {
          percent: 0.70,
          revenues: [
            {color: "yellow", cost: "30",},
            {color: "brown", cost: "60",},
          ]
        },
        hexes: ["K11",],
      },
      {
        color: "plain",
        centerTowns: [
          {
            name: {
              name: "Virginia ... Tunnel",
              reverse: true,
            }
          }
        ],
        mountain: {
          cost: "$120",
          size: "large",
          angle: 180,
          percent: 0.6,
        },
        track: [
          {
            type: "straight",
            gauge: "line"
          }
        ],
        hexes: ["K13",],
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              rotation: 30,
              name: "Richmond"
            },
            companies: ["C&O"],
          }
        ],
        hexes: ["K15"]
      },
      {
        color: "plain",
        water: {
          cost: "$80",
          size: "medium"
        },
        hexes: ["H2", "I21", "J2", "B22", "C23"]
      },
      {
        color: "plain",
        mountain: {
          cost: "$120",
          size: "large"
        },
        hexes: ["C25", "D26", "E21", "E25", "G17", "I15", "J14", "J16"]
      },
      {
        color: "plain",
        hexes: [
          "B16",
          "B18",
          "B26",
          "C7",
          "C13",
          "C27",
          "D12",
          "D20",
          "E5",
          "E17",
          "E19",
          "F6",
          "F16",
          "F18",
          "F22",
          "G5",
          "G7",
          "G9",
          "G13",
          "G15",
          "H4",
          "H10",
          "H18",
          "I5",
          "I7",
          "I9",
          "I13",
          "J4",
          "J8",
          "J10",
          "J12",
          "K17",
        ]
      }
    ]
  }
};

export default game;
