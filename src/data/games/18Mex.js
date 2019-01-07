const game = {
  // Generic Game Info
  info: {
    title: "18Mex",
    designer: "Mark Derrick",
    background: "brown",
    width: 150,
    color_10: "orange",
    orientation: "horizontal",
    titleRotate: -90,
    titleX: 175,
    titleY: 1550,
    hexCoords: true
  },

  // Extra Tokens
  tokens: ["Round"],

  // Need an IPO sheet
  ipo: true,

  bank: "$9,000",

  players: [
    {
      number: 3,
      certLimit: 19,
      capital: "$625"
    },
    {
      number: 4,
      certLimit: 14,
      capital: "$500"
    },
    {
      number: 5,
      certLimit: 11,
      capital: "$450"
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
      name: "P1",
      price: "$20",
      revenue: "$5",
      description: ""
    },
    {
      name: "P2",
      price: "$40",
      revenue: "$10",
      description:
      "Owning company may place the Copper Canyan tile in the named hex for $60 unless that hex is already built."
    },
    {
      name: "P3",
      price: "$50",
      description:
      "Immediately trade in for associated minor railroad"
    },
    {
      name: "P4",
      price: "$50",
      description:
      "Immediately trade in for associated minor railroad"
    },
    {
      name: "P5",
      price: "$50",
      description:
      "Immediately trade in for associated minor railroad"
    },
    {
      name: "P6",
      price: "$100",
      revenue: "$20",
      description:
      "Comes with 10% Chi"
    },
    {
      name: "P7",
      price: "$140",
      revenue: "$25",
      description:
      "Comes with President's Certificate of NdM. Owner must immediately set NdM's par price. Closes when NdM buys a train. May not be sold to a company."
    }
  ],

  phases: [
    {
      name: "2",
      limit: "-/4/1",
      number: "6",
      tiles: "yellow"
    },
    {
      name: "3",
      limit: "-/4/1",
      number: "6",
      tiles: "green",
      notes: "Private companies may be purchased"
    },
    {
      name: "4",
      rust: "2",
      limit: "4/3/2",
      number: "3",
      tiles: "green"
    },
    {
      name: "5",
      limit: "3/2/-",
      number: "2",
      tiles: "brown",
      notes: "Private companies are closed"
    },
    {
      name: "6",
      limit: "3/2/-",
      number: "2",
      rust: "3",
      tiles: "brown"
    },
    {
      name: "4D",
      limit: "3/2/-",
      number: "7",
      tiles: "brown"
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
      name: "5",
      color: "brown"
    },
    {
      name: "4",
      color: "green"
    },
    {
      name: "2",
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
        "Buy one share"
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
          label: 90,
          width: "2.5in"
        },
        {
          label: 80,
          width: "2.25in"
        },
        {
          label: 75,
          width: "2.125in"
        },
        {
          label: 70,
          width: "2in"
        },
        {
          label: 60,
          width: "1.75in"
        }
      ]
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
    "3": 3, // Yellow
    "4": 3,
    "5": 2,
    "6": 2,
    "7": 5,
    "8": 13,
    "9": 9,
    "57": 4,
    "58": 4,
    "470": 1,
    "471": 1,
    "472": 1,
    "473": 1,
    "69": 1, // Brown
    "14": 4,
    "15": 4,
    "16": 1,
    "17": 1,
    "18": 1,
    "19": 1,
    "20": 1,
    "23": 4,
    "24": 4,
    "25": 3,
    "26": 1,
    "27": 1,
    "28": 1,
    "29": 1,
    "141": 2,
    "142": 2,
    "143": 2,
    "144": 2,
    "474": 2,
    "475": 1,
    "476": 1,
    "477": 1,
    "478": 1,
    "479": 1,
    "39": 1, // Brown
    "40": 2,
    "41": 3,
    "42": 3,
    "43": 2,
    "44": 1,
    "45": 2,
    "46": 2,
    "47": 2,
    "63": 7,
    "70": 1,
    "480": 1,
    "481": 1,
    "482": 1,
    "483": 1,
    "484": 1,
    "485": 1,
    "486": 1,
    "455": 1 // Gray
  },

  map: {
    hexes: [
      {
        color: "offboard",
        offBoardRevenue: {
          name: {name: "Ciudad Juárez / El Paso"},
          revenues: [
            {color: "yellow", cost: "30"},
            {color: "brown", cost: "60"}
          ]
        },
        offBoardTrack: [{side: 1},{side:2}],
        hexes: ["F1"]
      },
      {
        color: "offboard",
        offBoardRevenue: {
          name: {name: "Baja California"},
          revenues: [
            {color: "yellow", cost: "30"},
            {color: "brown", cost: "50"}
          ]
        },
        offBoardTrack: [{side: 6}],
        hexes: ["A2"]
      },
      {
        color: "gray",
        cities: [{
          companies: [{
            label: "Pac",
            color: "gray"
          }]
        }],
        offBoardRevenue: {
          name: {name: "Nogales / Tuscon"},
          angle: 180,
          percent: 0.6,
          revenues: [
            {color: "yellow", cost: "30"},
            {color: "brown", cost: "50"}
          ]
        },
        track: [{side:1},{side:2}],
        hexes: ["C2"]
      },
      { // 120 Mountain
        color: "plain",
        terrain: [{
          type: "mountain",
          cost: "$120"
        }],
        hexes: ["E2","D3","G4","D5","G6","I6","H7","E8","F9","I14","I16"]
      },
      { // 60 Mountain
        color: "plain",
        terrain: [{ type: "mountain", cost: "$60" }],
        hexes: ["B3","K12","H17","L17"]
      },
      { // 10 Plants
        color: "plain",
        terrain: [{ type: "cactus", cost: "$10" }],
        hexes: ["B5"]
      },
      { // 20 Plants
        color: "plain",
        terrain: [{ type: "cactus", cost: "$20" }],
        hexes: ["F3", "E4", "H5", "J5","C6","F7","I8","I10","K10"]
      },
      {
        color: "plain",
        cities: [{
          name: {name: "Hermosillo"}
        }],
        mountain: { percent: 0.667, cost: "$60" },
        hexes: ["C4"]
      },
      {
        color: "yellow",
        track: [{side:1},{side:2},{side:4}],
        values: [{
          value: 20,
          angle: 120,
          percent: 0.667
        }],
        cities: [{
          companies: [{
            label: "Chi",
            color: "gray"
          }],
          name: {offset: 75, name: "Chihuahua"}
        }],
        hexes: ["F5"]
      },
      { // 20 Water
        color: "plain",
        terrain: [{type: "river", cost: "$20"}],
        hexes: ["I4","K8","G14","K20","M20"]
      },
      {
        color: "gray",
        offBoardRevenue: {
          name: {name: "San Antonio"},
          angle: 180,
          percent: 0.6,
          revenues: [
            {color: "yellow", cost: "30"},
            {color: "brown", cost: "60"}
          ]
        },
        cities: [{
          size: 2
        }],
        track: [{side:1},{side:2}],
        hexes: ["K4"]
      },
      {
        color: "plain",
        mountain: {
          cost: "$120"
        },
        labels: [{
          percent: 0.55,
          label: "CC"
        }],
        hexes: ["E6"]
      },
      { // Plain
        color: "plain",
        hexes: ["K6","D7","G8","J11","G12","H13","I18"]
      },
      {
        color: "plain",
        cities: [{
          name: {name: "Nuevo Laredo", reverse: true}
        }],
        terrain: [{
          type: "river",
          cost: "$20",
          angle: 180,
          percent: 0.65
        }],
        hexes: ["J7"]
      },
      { // 40 Swamp
        color: "plain",
        terrain: [{ type: "swamp", cost: "$40" }],
        hexes: ["L7","L11"]
      },
      {
        color: "plain",
        cities: [{
          name: {name: "Los Mochis", reverse: true}
        }],
        terrain: [{
          type: "river",
          cost: "$20",
          angle: 180,
          percent: 0.65
        }],
        hexes: ["D9"]
      },
      {
        color: "plain",
        cities: [{
          name: {name: "Torreón"},
          companies: [{
            label: "MC",
            color: "gray"
          }]
        }],
        hexes: ["H9"]
      },
      {
        color: "plain",
        cities: [{
          name: {name: "Monterrey"}
        }],
        hexes: ["J9"]
      },
      {
        color: "gray",
        cities: [{
          size: 2,
          name: {offset: 75, name: "Matamoros"},
          companies: [{
            label: "TM",
            color: "gray"
          }]
        }],
        offBoardRevenue: {
          angle: 180,
          percent: 0.667,
          revenues: [
            {color: "yellow", cost: "20"},
            {color: "brown", cost: "40"}
          ]
        },
        track: [{side:1},{side:2},{side:3},{side:4}],
        hexes: ["L9"]
      },
      {
        color: "plain",
        centerTowns: [{name:{name:"Culicán"}}],
        hexes: ["E10"]
      },
      {
        color: "plain",
        centerTowns: [{name:{name:"Durango"}}],
        mountain: { percent: 0.6, cost: "$60" },
        hexes: ["G10"]
      },
      {
        color: "plain",
        centerTowns: [{name:{name:"Zacatecas"}}],
        terrain: [{ type: "cactus", percent: 0.6, cost: "$20" }],
        hexes: ["H11"]
      },
      {
        color: "plain",
        values: [{
          value: 20,
          angle: 270,
          percent: 0.7
        },{
          value: 10,
          angle: 105,
          percent: 0.7
        }],
        cities: [{
          name: {offset: 55, name: "Mazatlán", reverse: true},
          companies: [{
            color: "black",
            label: "B"
          }]
        }],
        terrain: [{
          type: "river",
          cost: "$20",
          angle: 180,
          percent: 0.65
        }],
        towns: [{angle:60, percent: 0.58, rotate: 60}],
        track: [{side:2,type:"mid"}],
        hexes: ["F11"]
      },
      {
        color: "plain",
        centerTowns: [{name:{name:"San Luis Potosí"}}],
        hexes: ["I12"]
      },
      {
        color: "plain",
        cities: [{
          name: {name: "Querétaro"}
        }],
        terrain: [{ type: "mountain", percent: 0.667, cost: "$60" }],
        hexes: ["J13"]
      },
      {
        color: "plain",
        values: [{
          value: 20,
          angle: 90,
          percent: 0.7
        },{
          value: 10,
          angle: 285,
          percent: 0.7
        }],
        cities: [{
          name: {offset: 45, name: "Tampico"},
          companies: [{
            color: "black",
            label: "A"
          }]
        }],
        terrain: [{
          type: "swamp",
          cost: "$40",
          percent: 0.65
        }],
        towns: [{angle:240, percent: 0.58, rotate: 60}],
        track: [{side:5,type:"mid"}],
        hexes: ["L13"]
      },
      {
        color: "plain",
        cities: [{
          name: {name: "Guadalajara", reverse: true}
        }],
        terrain: [{
          type: "river",
          cost: "$20",
          angle: 180,
          percent: 0.65
        }],
        hexes: ["H15"]
      },
      {
        color: "plain",
        terrain: [{ type: "mountain", cost: "$60" }],
        borders: [{
          side: 1, dashed: true, color: "red"
        },{
          side: 2, dashed: true, color: "red"
        }],
        hexes: ["K14"]
      },
      {
        color: "yellow",
        cities: [{
          name: {offset: 40, name: "Mexico City", reverse: true},
          companies: [{
            label: "NdM",
            color: "gray"
          }]
        }],
        values: [{
          value: 20,
          angle: 240,
          percent: 0.667
        }],
        centerTowns: [{
          name: {name: "Toluca"},
          angle: 135,
          percent: 0.6
        }],
        borders: [{color: "red", dashed: true, side: 5}],
        track: [{side:4},{side:6}],
        hexes: ["J15"]
      },
      {
        color: "plain",
        terrain: [{ type: "mountain", cost: "$60" }],
        borders: [{
          side: 6, dashed: true, color: "red"
        }],
        hexes: ["L15"]
      },
      {
        color: "plain",
        centerTowns: [{name:{name:"Puerto Vallarta"}}],
        hexes: ["G16"]
      },
      {
        color: "yellow",
        terrain: [{ type: "mountain", cost: "$60", angle: 30, percent: 0.6}],
        values: [{
          value: 10,
          angle: 210,
          percent: 0.7
        }],
        towns: [{name:{name: "Puebla", rotation: 90}, rotate: -60}],
        borders: [
          {color: "red", dashed: true, side: 1},
          {color: "red", dashed: true, side: 2},
          {color: "red", dashed: true, side: 4}
        ],
        track: [{side: 3, type: "straight"}],
        hexes: ["K16"]
      },
      {
        color: "plain",
        cities: [{
          companies: [{
            label: "Mex",
            color: "gray"
          }],
          name: {name: "Veracruz"}
        }],
        centerTowns: [{ angle: 300, percent: 0.667}],
        terrain: [{ type: "swamp", cost: "$40", percent: 0.65 }],
        borders: [{color: "red", dashed: true, side: 3}],
        hexes: ["M16"]
      },
      {
        color: "plain",
        terrain: [{type: "mountain", cost: "$120"}],
        borders: [{color: "red", dashed: true, side: 5}],
        hexes: ["J17"]
      },
      {
        color: "offboard",
        offBoardRevenue: {
          name: {name: "Mérida"},
          angle: 180,
          percent: 0.6,
          revenues: [
            {color: "yellow", cost: "10"},
            {color: "brown", cost: "50"}
          ]
        },
        cities: [{
          companies: [{
            color: "gray",
            label: "UdY"
          }]
        }],
        offBoardTrack: [{side: 2},{side:3}],
        hexes: ["N17"]
      },
      {
        color: "plain",
        terrain: [{type: "mountain", cost: "$120"}],
        borders: [{color: "red", dashed: true, side: 4}],
        hexes: ["K18"]
      },
      {
        color: "yellow",
        terrain: [{type: "mountain", angle: 150, percent: 0.6, cost: "$60"}],
        track: [{side: 2, type: "straight"}],
        hexes: ["M18"]
      },
      {
        color: "plain",
        centerTowns: [{name:{name:"Acapulco"}}],
        terrain: [{ type: "mountain", percent: 0.6, cost: "$120" }],
        hexes: ["J19"]
      },
      {
        color: "plain",
        values: [{
          value: 20,
          angle: 270,
          percent: 0.7
        }],
        cities: [{
          name: {offset: 40, name: "Oaxaca"},
          companies: [{
            color: "black",
            label: "C"
          }]
        }],
        terrain: [{
          type: "river",
          cost: "$20",
          percent: 0.65
        }],
        track: [{side:5}],
        hexes: ["L19"]
      },
      {
        color: "gray",
        track: [{side:4,type:"sharp"}],
        hexes: ["L21"]
      },
      {
        color: "offboard",
        offBoardRevenue: {
          name: {name: "Guatemala"},
          revenues: [
            {color: "yellow", cost: "30"},
            {color: "brown", cost: "40"}
          ]
        },
        offBoardTrack: [{side:3}],
        hexes: ["N21"]
      }
    ]
  }
};

export default game;
