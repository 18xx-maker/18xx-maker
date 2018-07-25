const game = {
  // Generic Game Info
  info: {
    title: "1889",
    subtitle: "History of Shikoku Railways",
    designer: "Yasutaka Ikeda",
    background: "water",
    width: 150,
    orientation: "horizontal",
    titleX: 280,
    titleY: 860,
    color_5: "cyan",
    color_10: "blue"
  },

  tokens: ["Round"],

  ipo: true,

  bank: "¥7,000",

  players: [{
    number: 2,
    certLimit: 25,
    capital: "¥420"
  },{
    number: 3,
    certLimit: 19,
    capital: "¥420"
  },{
    number: 4,
    certLimit: 14,
    capital: "¥420"
  },{
    number: 5,
    certLimit: 12,
    capital: "¥390"
  },{
    number: 6,
    certLimit: 11,
    capital: "¥390"
  }],

  pools: [
    {
      name: "Bank Pool",
      notes: [
        {
          color: "blue",
          note: "Shares in the market pay dividends to the company"
        },
        {
          color: "purple",
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
      steps: ["Buy one certificate", "Sell any number of certificates"],
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
      ordered: true
    }
  ],

  stock: {
    type: "2D",
    par: {
      values: [100, 90, 80, 75, 70, 65],
      cells: [[0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3]]
    },
    market: [
      [75,80,90,100,110,125,140,155,175,200,225,255,285,315,350],
      [70,75,80,90,100,110,125,140,155,175,200,225,255,285,315],
      [65,70,75,80,90,100,110,125,140,155,175,200],
      [60,65,70,75,80,90,100,110,125,140],
      [55,60,65,70,75,80,90,100],
      [50,55,60,65,70,75,80],
      [45,50,55,60,65,70],
      [40,45,50,55,60],
      [30,40,45,50],
      [20,30,40,45],
      [10,20,30,40]],
    limits: [
      {
        color: "yellow",
        description: "Certificates no longer count towards the share limit",
        value: 50
      },
      {
        color: "orange",
        description: "Players may own more than 60% of the company",
        value: 30
      }
    ]
  },

  trains: [
    {
      name: "2",
      quantity: 6,
      price: "¥80",
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
      price: "¥180",
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
      price: "¥300",
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
      price: "¥450",
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
      price: "¥630",
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
      quantity: 9,
      price: "¥1100",
      color: "brown",
      description: "Cost ¥800 when trading in a 4T, 5T or 6T",
      info: [
        {
          color: "yellow",
          note: "Permanent"
        }
      ]
    }
  ],

  companies: [
    {
      name: "Awa Railroad",
      abbrev: "AR",
      color: "red",
      tokens: ["Free", "¥40"],
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
      name: "Iyo Railway",
      abbrev: "IR",
      color: "orange",
      tokens: ["Free", "¥40"],
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
      name: "Sanuki Railway",
      abbrev: "SR",
      color: "blue",
      tokens: ["Free", "¥40"],
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
      name: "Takamatsu & Kotohira Electric Railway",
      abbrev: "KO",
      color: "pink",
      tokens: ["Free", "¥40"],
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
      name: "Tosa Electric Railway",
      abbrev: "TR",
      color: "darkGreen",
      tokens: ["Free", "¥40", "¥40"],
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
      name: "Tosa Kuroshio Railway",
      abbrev: "KU",
      color: "purple",
      tokens: ["Free"],
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
      name: "Uwajima Railway",
      abbrev: "UR",
      color: "maroon",
      tokens: ["Free", "¥40", "¥40"],
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
      number: "∞",
      rust: "4",
      tiles: "brown"
    }
  ],

  privates: [
    {
      name: "Takamatsu E-Railroad",
      price: "¥20",
      revenue: "¥5",
      icon: "A",
      desription: "Blocks Takamatsu (K4)."
    },{
      name: "Mitsubishi Ferry",
      price: "¥30",
      revenue: "¥5",
      icon: "B",
      description: "Player owner may place the port tile on a coastal town (B11, G10, I12, or J9) without a tile on it already, outside of the operating rounds of a company controller by another player. The player need not control a company or have connectivity to the placed tile from one of their companies. This does not close the company."
    },{
      name: "Ehime Railroad",
      price: "¥40",
      revenue: "¥10",
      icon: "C",
      description: "When this company is sold to a corporation, the selling player may immediately place a green tile on Ohzu (C4), in addition to any tile which it may lay during the same operating round. This does not close the company."
    },{
      name: "Sumitomo Mines Railway",
      price: "¥50",
      revenue: "¥15",
      icon: "D",
      description: "Owning corporation may ignore building cost for mountain hexes which do not also contain rivers. This does not close the company."
    },{
      name: "Dougo Railway",
      price: "¥60",
      revenue: "¥15",
      icon: "E",
      description: "Owning player may exchange this private company for a 10% share of Iyo Railway from the initial offering."
    },{
      name: "South Iyo Railway",
      price: "¥80",
      revenue: "¥20",
      icon: "F",
      players: "3+"
    },{
      name: "Uno-Takamatsu Ferry",
      price: "¥150",
      revenue: "¥30 / ¥50",
      players: "4+",
      icon: "G",
      description: "Does not close while owned by a player. If owned by a player when the first 5-train is purchased it may no longer be sold to a public company and the revenue is increased to 50."
    }
  ],

  tiles: {
    "3": 2,
    "5": 2,
    "6": 2,
    "7": 2,
    "8": 5,
    "9": 5,
    "57": 2,
    "58": 3,
    "437": 1,
    "438": 1,
    // Green
    "12": 1,
    "13": 1,
    "14": 1,
    "15": 3,
    "16": 1,
    "19": 1,
    "20": 1,
    "23": 2,
    "24": 2,
    "25": 1,
    "26": 1,
    "27": 1,
    "28": 1,
    "29": 1,
    "205": 1,
    "206": 1,
    "439": 1,
    "440": 1,
    // Brown
    "39": 1,
    "40": 1,
    "41": 1,
    "42": 1,
    "45": 1,
    "46": 1,
    "47": 1,
    "448": 4,
    "465": 1,
    "466": 1,
    "492": 1,
    "611": 2
  },

  map: {
    print: "landscape",
    hexes: [
      {
        color: "plain",
        hexes: ["D3", "H3", "J3", "B5", "C8", "E8", "I8", "D9", "I10"]
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              name: "Saijou"
            }
          }
        ],
        hexes: ["F3"]
      },
      {
        copy: "F3",
        cities: [
          {
            name: {
              name: "Niihama"
            }
          }
        ],
        hexes: ["G4"]
      },
      {
        copy: "F3",
        cities: [
          {
            name: {
              name: "Ikeda"
            }
          }
        ],
        hexes: ["H7"]
      },
      {
        copy: "F3",
        cities: [
          {
            name: {
              name: "Sukumo"
            }
          }
        ],
        hexes: ["A10"]
      },
      {
        copy: "F3",
        cities: [
          {
            name: {
              name: "Anan"
            }
          }
        ],
        hexes: ["J11"]
      },
      {
        copy: "F3",
        cities: [
          {
            name: {
              name: "Nahari"
            }
          }
        ],
        hexes: ["G12"]
      },
      {
        copy: "F3",
        cities: [
          {
            name: {
              name: "Matsuyama"
            },
            companies: [
              {
                label: "IR",
                color: "orange"
              }
            ]
          }
        ],
        hexes: ["E2"]
      },
      {
        copy: "F3",
        cities: [
          {
            name: {
              name: "Marugame"
            },
            companies: [
              {
                label: "SR",
                color: "blue"
              }
            ]
          }
        ],
        hexes: ["I2"]
      },
      {
        copy: "F3",
        cities: [
          {
            name: {
              name: "Tokushima"
            },
            companies: [
              {
                label: "AR",
                color: "red"
              }
            ]
          }
        ],
        hexes: ["K8"]
      },
      {
        copy: "F3",
        cities: [
          {
            name: {
              name: "Kubokawa"
            },
            companies: [
              {
                label: "KU",
                color: "purple"
              }
            ]
          }
        ],
        hexes: ["C10"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            name: {
              name: "Ritsurin Kouen"
            }
          }
        ],
        hexes: ["J5"]
      },
      {
        color: "plain",
        icons: [
          {
            type: "port",
            percent: 0.5
          }
        ],
        centerTowns: [
          {
            name: {
              name: "Nangoku"
            }
          }
        ],
        hexes: ["G10"]
      },
      {
        color: "plain",
        icons: [
          {
            type: "port",
            percent: 0.5
          }
        ],
        centerTowns: [
          {
            name: {
              name: "Komatsujima"
            }
          }
        ],
        hexes: ["J9"]
      },
      {
        color: "plain",
        icons: [
          {
            type: "port",
            percent: 0.5
          }
        ],
        centerTowns: [
          {
            name: {
              name: "Muki"
            }
          }
        ],
        hexes: ["I12"]
      },
      {
        color: "plain",
        icons: [
          {
            type: "port",
            percent: 0.5
          }
        ],
        centerTowns: [
          {
            name: {
              name: "Nakamura"
            }
          }
        ],
        hexes: ["B11"]
      },
      {
        color: "plain",
        water: {
          cost: "80"
        },
        hexes: ["K6"]
      },
      {
        color: "plain",
        water: {
          percent: 0.4
        },
        mountain: {
          angle: 180,
          percent: 0.1,
          cost: "80"
        },
        hexes: ["H5", "I6"]
      },
      {
        color: "plain",
        mountain: {
          cost: "80"
        },
        hexes: [
          "E4",
          "D5",
          "F5",
          "C6",
          "E6",
          "G6",
          "D7",
          "F7",
          "A8",
          "G8",
          "B9",
          "H9",
          "H11",
          "H13"
        ]
      },
      {
        color: "plain",
        cities: [
          {
            angle: 120,
            percent: 0.4,
            name: {
              name: "Kotohira",
              rotation: 30
            }
          }
        ],
        mountain: {
          angle: 300,
          percent: 0.4,
          cost: "80"
        },
        hexes: ["I4"]
      },
      {
        color: "yellow",
        values: [
          {
            value: 20,
            angle: 180,
            percent: 0.667
          }
        ],
        cities: [
          {
            name: {
              name: "Ohzu",
              reverse: true
            }
          }
        ],
        labels: [{
          label: "C",
          angle: 270,
          percent: 0.667
        }],
        track: [
          {
            side: 3
          }
        ],
        hexes: ["C4"]
      },
      {
        copy: "C4",
        cities: [
          {
            name: {
              name: "Takamatsu",
              reverse: false,
              rotation: 60
            },
            companies: [
              {
                label: "KO",
                color: "pink"
              }
            ]
          }
        ],
        values: [
          {
            value: 30,
            angle: 165
          }
        ],
        labels: [{
          label: "A",
          angle: 270,
          percent: 0.75
        }],
        track: [
          {
            side: 1
          },
          {
            side: 2
          }
        ],
        hexes: ["K4"]
      },
      {
        color: "gray",
        values: [
          {
            angle: 210,
            percent: 0.8,
            value: 40
          }
        ],
        cities: [
          {
            size: 2,
            name: {
              name: "Uwajima",
              reverse: true
            },
            companies: [
              {
                label: "UR",
                color: "maroon"
              }
            ]
          }
        ],
        track: [{ side: 2 }, { side: 4 }, { side: 6 }],
        hexes: ["B7"]
      },
      {
        color: "gray",
        towns: [
          {
            angle: -30,
            percent: 0.57735,
            rotation: 60,
            name: {
              name: "Yawatahama",
              rotation: -90
            }
          }
        ],
        track: [
          {
            type: "sharp",
            side: 6
          }
        ],
        values: [
          {
            value: 20,
            angle: 150,
            percent: 0.2
          }
        ],
        hexes: ["B3"]
      },
      {
        color: "gray",
        towns: [
          {
            angle: -150,
            percent: 0.57735,
            rotation: -60,
            name: {
              name: "Muroto",
              reverse: true,
              rotation: 90
            }
          }
        ],
        track: [
          {
            type: "sharp",
            side: 4
          }
        ],
        values: [
          {
            value: 20,
            angle: 30,
            percent: 0.2
          }
        ],
        hexes: ["G14"]
      },
      {
        color: "gray",
        track: [
          {
            type: "gentle",
            side: 6
          }
        ],
        hexes: ["J7"]
      },
      {
        color: "offboard",
        offBoardTrack: [
          {
            side: 1
          },
          {
            side: 2
          }
        ],
        labels: [
          {
            label: "Imabari"
          }
        ],
        offBoardRevenue: {
          angle: 180,
          percent: 0.333,
          revenues: [
            {
              color: "yellow",
              cost: "30"
            },
            {
              color: "brown",
              cost: "60"
            },
            {
              color: "black",
              textColor: "white",
              cost: "D100"
            }
          ]
        },
        hexes: ["F1"]
      },
      {
        copy: "F1",
        labels: [
          {
            label: "Sakaide & Okayama"
          }
        ],
        offBoardRevenue: {
          angle: 180,
          percent: 0.333,
          revenues: [
            {
              color: "yellow",
              cost: "20"
            },
            {
              color: "brown",
              cost: "40"
            },
            {
              color: "black",
              textColor: "white",
              cost: "D80"
            }
          ]
        },
        hexes: ["J1"]
      },
      {
        color: "offboard",
        offBoardTrack: [
          {
            side: 2
          },
          {
            side: 3
          }
        ],
        labels: [
          {
            label: "Naruto & Awaji",
            x: 10
          }
        ],
        offBoardRevenue: {
          angle: 180,
          percent: 0.333,
          x: 20,
          revenues: [
            {
              color: "yellow",
              cost: "20"
            },
            {
              color: "brown",
              cost: "40"
            },
            {
              color: "black",
              textColor: "white",
              cost: "D80"
            }
          ]
        },
        hexes: ["L7"]
      },
      {
        color: "green",
        water: {
          angle: 60,
          percent: 0.725,
          cost: 80,
          size: "tiny",
          border: true
        },
        values: [
          {
            angle: 210,
            percent: 0.725,
            value: 30
          }
        ],
        cities: [
          {
            size: 2,
            rotation: 30,
            name: {
              name: "Kouchi",
              reverse: true,
              offset: 54
            },
            companies: [
              {
                label: "TR",
                color: "darkGreen"
              }
            ]
          }
        ],
        track: [{ side: 3 }, { side: 4 }, { side: 5 }, { side: 6 }],
        hexes: ["F9"]
      }
    ]
  }
};

export default game;
