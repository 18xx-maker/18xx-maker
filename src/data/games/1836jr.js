const game = {
  // Generic Game Info
  info: {
    title: "1836jr",
    designer: "David Hecht",
    background: "brown",
    width: 150,
    color_10: "orange",
    titleX: 50,
    titleY: -30,
    titleSize: 150,
    hexCoords: true,
    currency: "BEF"
  },

  links: {
    bgg: "https://boardgamegeek.com/boardgameexpansion/173574/1836jr",
    rules: "https://boardgamegeek.com/boardgameexpansion/173574/1836jr/files"
  },

  // Extra Tokens
  tokens: ["Round", "+20"],

  // Need an IPO sheet
  ipo: true,

  bank: "$12,000",

  players: [
    {
      number: 3,
      certLimit: 20,
      capital: "$800"
    },
    {
      number: 4,
      certLimit: 16,
      capital: "$600"
    },
    {
      number: 5,
      certLimit: 13,
      capital: "$480"
    },
    {
      number: 6,
      certLimit: 11,
      capital: "$400"
    }
  ],

  // Railway Companies
  companies: [
    {
      name: "Chemins de Fer de L'Etat Belge",
      abbrev: "B",
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
      name: "Grande Compagnie Du Luxembourg",
      abbrev: "GCL",
      tokens: ["Free", "$40", "$100", "$100"],
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
      name: "Chemin de Fer Du Nord",
      abbrev: "Nord",
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
      name: "Noord-Brabantsch-Duitsche Spoorweg-Maatschappij",
      abbrev: "NBDS",
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
      name: "Hollandsche IJzeren Spoorweg Maatschappij",
      abbrev: "HSM",
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
      name: "Noord-Friesche Locaal",
      abbrev: "NFL",
      tokens: ["Free", "$40"],
      color: "lightGreen",
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
      name: "Maatschappij Tot Exploitatie Van de Staats-Spoorwegen",
      abbrev: "MES",
      tokens: ["Free", "$40", "$100"],
      color: "purple",
      shares: [
        {
          quantity: 1,
          label: "President Share",
          percent: "20/10",
          shares: 2
        },
        {
          quantity: 8,
          percent: "10/5",
          shares: 1
        },
        {
          quantity: 10,
          percent: "5",
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
      name: "Amsterdam Canal Company",
      price: "F20",
      revenue: "F5",
      description: "Blocks Hex D6."
    },
    {
      name: "Enkhuizen-Stavoren Ferry",
      price: "F40",
      revenue: "F10",
      description:
      "Company may place free tile on B8."
    },
    {
      name: "Charbonnages du Hainaut",
      price: "F50",
      revenue: "F10",
      description:
      "Blocks Hex J8. Company may place tile and token on Hex J8 for F60."
    },
    {
      name: "Charbonnages du Hainaut",
      price: "F70",
      revenue: "F15",
      description:
      "Blocks Hex J8. Company may place tile and token on Hex J8 for F60."
    },
    {
      name: "Régie des Postes",
      price: "F70",
      revenue: "F15",
      description:
      "Owning company may place a +20 token on any city or town."
    },
    {
      name: "Chemins de Fer Luxembourgeois",
      price: "F160",
      revenue: "F25",
      description:
      "Blocks Hexes K11 & J12. Player gets a 10% certificate for GCL."
    },
    {
      name: "Chemin de Fer de Lille Á Valenciennes",
      price: "F220",
      revenue: "F30",
      description:
      "Blocks Hexes I3 & J4. Includes president's certificate for the Chemin de Fer du Nord. Closes on first train purchase."
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
      ordered: true,
      optional: ["Purchase private companies"]
    }
  ],

  stock: {
    type: "2D",
    par: {
      values: [100,90,82,76,71,67]
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
    "2": 1,
    "3": 2,
    "3|56": 1,
    "4": 2,
    "4|56": 1,
    "5|56": 2,
    "6|56": 2,
    "7": 4,
    "7|56": 3,
    "8": 8,
    "8|56": 6,
    "9": 7,
    "9|56": 6,
    "56": 1,
    "57": 4,
    "58": 2,
    "58|56": 1,
    "14": 3,
    "14|56": 1,
    "15": 2,
    "15|56": 2,
    "16": 1,
    "17|56": 1,
    "18": 1,
    "19": 1,
    "20": 1,
    "23": 3,
    "23|56": 1,
    "24": 3,
    "24|56": 1,
    "25": 1,
    "26": 1,
    "27": 1,
    "28": 1,
    "29": 1,
    "53|30": 2,
    "54|30": 1,
    "59": 2,
    "120|56": 1,
    "121|56": 2,
    "39": 1,
    "40": 1,
    "41": 2,
    "41|56": 1,
    "42": 2,
    "42|56": 1,
    "43": 2,
    "44": 1,
    "45": 2,
    "46": 2,
    "47": 1,
    "47|56": 1,
    "61|30": 2,
    "62|30": 1,
    "63": 3,
    "63|56": 1,
    "64": 1,
    "65": 1,
    "66": 1,
    "67": 1,
    "68": 1,
    "70": 1,
    "122|56": 1,
    "125|56": 4,
    "126|56": 1,
    "127|56": 1,
    "123|56": 1,
    "124|56": 1
  },

  map: {
    hexes: [
      { color: "gray",
        track: [{type: "sharp", side: 5}],
        values: [{angle: 180, percent: 0.333, value: 10}],
        cities: [{percent: 0.5,
                  name: {name: "Leeuwarden"},
                  companies: ["NFL"]}],
        hexes: ["A9"]
      },
      { color: "plain",
        hexes: ["A11","B12","C11","D12","E9","H8","I5","I7","K5"]
      },
      {
        color: "offboard",
        offBoardRevenue: {
          name: {name: "Hamburg"},
          revenues: [{color: "yellow", cost: "40"},
                     {color: "brown", cost: "70"}]
        },
        offBoardTrack: [{side:1},{side:6}],
        hexes: ["A13"]
      },
      {
        color: "plain",
        terrain: [{type: "water", cost: "F80", percent: 0.75}],
        centerTowns: [
          { x: -30, name: { name: "Enkhuizen", reverse: true } },
          { x: 30, name: { name: "Stavoren" } }
        ],
        hexes: ["B8"]
      },
      {
        color: "plain",
        cities: [{name: {name: "Groningen"}}],
        hexes: ["B10"]
      },
      {
        color: "plain",
        borders: [{color:"water",side:4}],
        hexes: ["C7"]
      },
      {
        color: "plain",
        borders: [{color:"water",side:1}],
        hexes: ["C9"]
      },
      {
        color: "yellow",
        values: [{angle: 180, percent: 0.26, value: 40}],
        cities: [{percent: 0.5,
                  name: {name: "Amsterdam"},
                  companies: ["HSM"]}],
        labels: [{label:"NY", angle:120, percent: 0.7},
                 {label:"TOR", angle:240, percent: 0.7}],
        track: [{type:"sharp", side: 5}],
        terrain: [{type:"water", cost:"F40", angle: 180, percent: 0.7}],
        tokens: [{company: "NFL", width: 15, angle: 60, percent: 0.75}],
        hexes: ["D6"]
      },
      {
        color: "plain",
        terrain: [{type:"water",cost:"F40"}],
        hexes: ["D8","D10","F8","G9","G11"]
      },
      {
        color: "plain",
        labels: [{label: "OO", percent: 0.667},
                 {label: "H", percent: 0.667, angle: 180}],
        cities: [{angle: 65, percent: 0.6,
                  name: {name: "Rotterdam"}},
                 {angle: 295, percent: 0.6,
                  name: {name: "Den Haag"}}],
        tokens: [{company: "NBDS", angle: 225, percent: 0.75, width: 15}],
        hexes: ["E5"]
      },
      {
        color: "plain",
        cities: [{name: {name: "Utrecht"}}],
        hexes: ["E7"]
      },
      {
        color: "plain",
        labels: [{label: "OO", percent: 0.667}],
        terrain: [{type: "water", cost: "F40", angle: 180, percent: 0.6}],
        cities: [{angle: 65, percent: 0.6,
                  name: {name: "Arnhem"}},
                 {angle: 295, percent: 0.6,
                  companies: ["NBDS"],
                  name: {name: "Nijmegen"}}],
        tokens: [{company: "HSM", angle: 135, percent: 0.75, width: 15}],
        hexes: ["E11"]
      },
      {
        color: "plain",
        centerTowns: [{name: {name: "Hoek van Holland"}}],
        terrain: [{type: "water", cost: "F40", percent: 0.6}],
        borders: [{color: "water", side: 5},
                  {color: "water", side: 6}],
        hexes: ["F4"]
      },
      {
        color: "plain",
        terrain: [{type:"water",cost:"F80"}],
        borders: [{color: "water", side: 6}],
        hexes: ["F6"]
      },
      {
        color: "plain",
        centerTowns: [{name: {name: "Eindhoven"}}],
        hexes: ["F10"]
      },
      {
        color: "plain",
        borders: [{color: "water", side: 3}],
        hexes: ["G3"]
      },
      {
        color: "plain",
        borders: [{color: "water", side: 2},
                  {color: "water", side: 3}],
        hexes: ["G5"]
      },
      {
        color: "plain",
        cities: [{name: {name: "Antwerp"}}],
        hexes: ["G7"]
      },
      {
        color: "plain",
        centerTowns: [{name: {name: "Bruges"}}],
        hexes: ["H2"]
      },
      {
        color: "plain",
        cities: [{name: {name: "Gand"}}],
        hexes: ["H4"]
      },
      {
        color: "yellow",
        values: [{percent: 0.5, value:30}],
        cities: [{angle: 150, percent: 0.333,
                  companies: ["B"],
                  name: {name: "Brussels", offset: 42}}],
        track: [{type: "gentle", side: 1}],
        labels: [{label: "B", angle: 240, percent: 0.6},
                 {label: "L", angle: 300, percent: 0.6}],
        hexes: ["H6"]
      },
      {
        color: "plain",
        labels: [{label: "OO", percent: 0.667}],
        terrain: [{type: "water", cost: "F40", angle: 180, percent: 0.6}],
        cities: [{angle: 65, percent: 0.6,
                  name: {name: "Maastricht"}},
                 {angle: 295, percent: 0.6,
                  name: {name: "Liège"}}],
        tokens: [{company: "B", angle: 135, percent: 0.75, width: 15}],
        hexes: ["H10"]
      },
      {
        color: "yellow",
        values: [{angle: 180, percent: 0.5, value:30}],
        cities: [{angle: 330, percent: 0.333,
                  companies: ["Nord"],
                  name: {name: "Lille", offset: 58, reverse: true}}],
        track: [{type: "gentle", side: 4}],
        labels: [{label: "B", angle: 60, percent: 0.6},
                 {label: "Bar", angle: 120, percent: 0.6}],
        hexes: ["I3"]
      },
      {
        color: "plain",
        terrain: [{type:"mountain",cost:"F60"}],
        hexes: ["I11","J10","J12","K7","K9"]
      },
      {
        color: "plain",
        cities: [{companies:["GCL"],
                  name: {reverse: true, name: "Namur"}}],
        terrain: [{type: "water", cost: "F40", angle: 180, percent: 0.6}],
        tokens: [{company: "Nord", percent: 0.8, width: 15}],
        hexes: ["I9"]
      },
      {
        color: "plain",
        hexes: ["J4"]
      },
      {
        color: "plain",
        cities: [{name: {name: "Charleroi"}}],
        hexes: ["J6"]
      },
      {
        color: "plain",
        cities: [{name: {reverse: true, name: "Hainaut Coalfields"}}],
        terrain: [{type: "mountain", cost: "F60", angle: 180, percent: 0.6}],
        icons: [{type: "coal", percent: 0.8}],
        hexes: ["J8"]
      },
      {
        color: "water",
        offBoardRevenue: {
          name: {name: "Harwich"},
          revenues: [{color: "yellow", cost: "+20"},
                     {color: "brown", cost: "+30"}]
        },
        offBoardTrack: [{side:4},{side:5}],
        hexes: ["E3"]
      },
      {
        color: "water",
        offBoardRevenue: {
          name: {name: "Dover"},
          revenues: [{color: "yellow", cost: "+20"},
                     {color: "brown", cost: "+30"}]
        },
        offBoardTrack: [{side:4},{side:5}],
        hexes: ["G1"]
      },
      {
        color: "land",
        offBoardRevenue: {
          name: {name: "Paris"},
          revenues: [{color: "yellow", cost: "+20"},
                     {color: "brown", cost: "+30"}]
        },
        offBoardTrack: [{side:3},{side:4}],
        hexes: ["J2"]
      },
      {
        color: "offboard",
        offBoardRevenue: {
          name: {name: "Dortmund"},
          revenues: [{color: "yellow", cost: "30"},
                     {color: "brown", cost: "50"}]
        },
        offBoardTrack: [{side:1}],
        hexes: ["E13"]
      },
      {
        color: "offboard",
        offBoardRevenue: {
          name: {name: "Cologne"},
          revenues: [{color: "yellow", cost: "30"},
                     {color: "brown", cost: "50"}]
        },
        offBoardTrack: [{side:1}],
        hexes: ["H12"]
      },
      {
        color: "plain",
        terrain: [{type: "mountain", cost: "F60", percent: 0.75}],
        centerTowns: [
          { x: -30, name: { name: "Arlon", reverse: true } },
          { x: 30, name: { name: "Luxembourg" } }
        ],
        hexes: ["K11"]
      },
      {
        color: "offboard",
        tokens: [{company:"GCL", width: 15, percent: 0.6}],
        offBoardRevenue: {
          name: {name: "Strasbourg"},
          revenues: [{color: "yellow", cost: "40"},
                     {color: "brown", cost: "70"}]
        },
        offBoardTrack: [{side:1},{side:2}],
        hexes: ["K13"]
      }
    ]
  }
};

export default game;
