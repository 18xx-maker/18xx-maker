const game = {
  // Generic Game Info
  info: {
    title: "1860",
    subtitle: "Railways on the Isle of Wight",
    designer: "Mike Hutton",
    background: "water",
    width: 150,
    orientation: "horizontal",
    titleY: -30
  },

  // Extra Tokens
  tokens: ["Round"],

  // Railway Companies
  companies: [
    {
      name: "Cowes & Newport",
      abbrev: "C&N",
      tokens: ["Home", "£40", "£100", "£100"],
      color: "blue",
      shares: [
        {
          quantity: 1,
          label: "President Share",
          percent: 20,
          shares: 2
        },
        {
          quantity: 7,
          percent: 10,
          shares: 1
        },
        {
          quantity: 1,
          label: "Reserved for CMH",
          percent: 10,
          shares: 1
        }
      ]
    },
    {
      name: "Isle of Wight",
      abbrev: "IOW",
      tokens: ["Home", "£40", "£100", "£100"],
      color: "red",
      shares: [
        {
          quantity: 1,
          label: "President Share",
          percent: 20,
          shares: 2
        },
        {
          quantity: 7,
          percent: 10,
          shares: 1
        },
        {
          quantity: 1,
          label: "Reserved for RP&SC",
          percent: 10,
          shares: 1
        }
      ]
    },
    {
      name: "Isle of Wight, Newport Juntion",
      abbrev: "IWNJ",
      tokens: ["Home", "£40", "£100"],
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
      name: "Freshwater, Yarmouth & Newport",
      abbrev: "FYN",
      tokens: ["Home", "£40", "£100"],
      color: "darkGreen",
      shares: [
        {
          quantity: 1,
          label: "President Share",
          percent: 20,
          shares: 2
        },
        {
          quantity: 7,
          percent: 10,
          shares: 1
        },
        {
          quantity: 1,
          label: "Reserved for YHC",
          percent: 10,
          shares: 1
        }
      ]
    },
    {
      name: "Newport, Godshill & St. Lawrence",
      abbrev: "NGStL",
      tokens: ["Home", "£40"],
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
      name: "Brading Harbour Improvement & Railway",
      abbrev: "BHI&R",
      tokens: ["Home", "£40"],
      color: "pink",
      shares: [
        {
          quantity: 1,
          label: "President Share",
          percent: 20,
          shares: 2
        },
        {
          quantity: 7,
          percent: 10,
          shares: 1
        },
        {
          quantity: 1,
          label: "Reserved for BHC",
          percent: 10,
          shares: 1
        }
      ]
    },
    {
      name: "Shanklin & Chale",
      abbrev: "S&C",
      tokens: ["Home", "£40"],
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
      name: "Ventor, Yarmouth & South Coast",
      abbrev: "VY&SC",
      tokens: ["Home", "£40"],
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
    }
  ],

  trains: [
    {
      name: "2+1",
      quantity: 5,
      price: "£250",
      color: "yellow",
      info: [
        {
          color: "green",
          note: "Rusted by 4+2"
        }
      ]
    },
    {
      name: "3+2",
      quantity: 4,
      price: "£300",
      color: "green",
      info: [
        {
          color: "brown",
          note: "Rusted by 6+3"
        }
      ]
    },
    {
      name: "4+2",
      quantity: 3,
      price: "£350",
      color: "green",
      info: [
        {
          color: "brown",
          note: "Rusted by 7+4"
        }
      ]
    },
    {
      name: "5+3",
      quantity: 2,
      price: "£400",
      color: "brown",
      info: [
        {
          color: "brown",
          note: "Rusted by 8+4"
        }
      ]
    },
    {
      name: "6+3",
      quantity: 2,
      price: "£500",
      color: "brown",
      info: [
        {
          color: "yellow",
          note: "Permanent"
        }
      ]
    },
    {
      name: "7+4",
      quantity: 1,
      price: "£600",
      color: "brown",
      info: [
        {
          color: "yellow",
          note: "Permanent"
        }
      ]
    },
    {
      name: "8+4",
      quantity: 1,
      price: "£700",
      color: "brown",
      info: [
        {
          color: "yellow",
          note: "Permanent"
        }
      ]
    },
    {
      name: "9+5",
      quantity: 6,
      price: "£800",
      color: "brown",
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
      name: "Brading Harbour Company",
      price: "£30",
      revenue: "£5",
      description: "Can be exchanged for a share in the BHI&R pubilc company."
    },
    {
      name: "Yarmouth Harbour Company",
      price: "£50",
      revenue: "£10",
      description: "Can be exchanged for a share in the FYN public company."
    },
    {
      name: "Cowes Marina and Harbour",
      price: "£90",
      revenue: "£20",
      description: "Can be exchanged for a share in the C&N public company."
    },
    {
      name: "Ryde Pier & Shipping Company",
      price: "£130",
      revenue: "£30",
      description: "Can be exchanged for a share in the IOW public company."
    },
    {
      name: "Fishbourne Ferry Company",
      price: "£200",
      revenue: "£25",
      description:
        "Not available until the first 6+2 train has been purchased. Closes all other private companies."
    }
  ],

  phases: [
    {
      name: "2+1",
      limit: "4",
      number: "5",
      tiles: "yellow"
    },
    {
      name: "3+2",
      limit: "4",
      number: "4",
      tiles: "green"
    },
    {
      name: "4+2",
      rust: "2+1",
      limit: "3",
      number: "3",
      tiles: "green"
    },
    {
      name: "5+3",
      limit: "3",
      number: "2",
      tiles: "brown"
    },
    {
      name: "6+3",
      limit: "2",
      number: "2",
      rust: "3+2",
      tiles: "brown",
      notes:
        "Fishbourne private available; Purchase of Fishbourne closes shipping companies."
    },
    {
      name: "7+4",
      limit: "2",
      number: "1",
      rust: "4+2",
      tiles: "brown"
    },
    {
      name: "8+4",
      limit: "2",
      number: "1",
      rust: "5+3",
      tiles: "brown",
      notes:
        "Selling doesn’t reduce share price; no limit on certificates per player."
    },
    {
      name: "9+5",
      limit: "2",
      number: "6+",
      tiles: "brown",
      notes:
        "Southern Railway forms; no more track or base building after the next SR."
    }
  ],

  pools: [
    {
      name: "Bank Pool",
      notes: [
        {
          color: "orange",
          note:
            "If a company does not have a train, shares in that company are sold at HALF the current market price (round fractions down)"
        },
        {
          color: "orange",
          note: "Director's certificate may be sold"
        },
        {
          color: "orange",
          note:
            "There may be any number of certificates in the bank pool for any one company"
        }
      ]
    },
    {
      name: "IPO",
      notes: [
        {
          color: "green",
          note: "Companies float once 50% sold"
        }
      ]
    },
    {
      name: "Trains",
      notes: [
        {
          color: "yellow",
          note:
            "Buying a train from another company is not allowed if the buying company already has a train, and the selling company has only one train"
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
      steps: ["Sell any number of shares", "Buy one share"],
      ordered: true
    },
    {
      name: "Operating Round",
      steps: [
        "Lay or upgrade track",
        "Buy an additional base",
        "Run trains",
        "Retain or pay revenue",
        "Buy one or more trains"
      ],
      ordered: true
    }
  ],

  stock: {
    type: "1Diag",
    par: {
      type: "table",
      values: [
        [
          { label: 50, color: "gray" },
          {
            label: 54,
            color: "plain",
            rowspan: 3,
            labels: [
              {},
              {},
              {},
              {},
              {},
              {},
              { color: "cyan", label: "S&C" },
              { color: "maroon", label: "VYSC" }
            ]
          },
          {
            label: 58,
            color: "plain",
            rowspan: 3,
            labels: [
              {},
              {},
              {},
              {},
              { color: "yellow", label: "NGStL" },
              { color: "pink", label: "BHI&R" },
              { color: "cyan", label: "S&C" },
              { color: "maroon", label: "VYSC" }
            ]
          },
          {
            label: 62,
            color: "plain",
            rowspan: 3,
            labels: [
              {},
              {},
              { color: "darkGreen", label: "FYN" },
              { color: "black", label: "IWNJ" },
              { color: "yellow", label: "NGStL" },
              { color: "pink", label: "BHI&R" },
              { color: "cyan", label: "S&C" },
              { color: "maroon", label: "VYSC" }
            ]
          },
          {
            label: 68,
            color: "plain",
            rowspan: 3,
            labels: [
              {},
              {},
              { color: "darkGreen", label: "FYN" },
              { color: "black", label: "IWNJ" },
              { color: "yellow", label: "NGStL" },
              { color: "pink", label: "BHI&R" }
            ]
          },
          {
            label: 74,
            color: "plain",
            rowspan: 3,
            labels: [
              { color: "red", label: "IOW" },
              { color: "blue", label: "C&N" },
              { color: "darkGreen", label: "FYN" },
              { color: "black", label: "IWNJ" }
            ]
          },
          {
            label: 82,
            color: "plain",
            rowspan: 3,
            labels: [
              { color: "red", label: "IOW" },
              { color: "blue", label: "C&N" },
              { color: "darkGreen", label: "FYN" },
              { color: "black", label: "IWNJ" }
            ]
          },
          {
            label: 90,
            color: "plain",
            rowspan: 3,
            labels: [
              { color: "red", label: "IOW" },
              { color: "blue", label: "C&N" }
            ]
          },
          {
            label: 100,
            color: "plain",
            rowspan: 3,
            labels: [
              { color: "red", label: "IOW" },
              { color: "blue", label: "C&N" }
            ]
          }
        ],
        [{ label: 47, color: "gray" }],
        [{ label: 44, color: "gray" }],
        [
          { label: 40, color: "gray" },
          { label: 52, color: "gray" },
          { label: 56, color: "gray" },
          { label: 60, color: "gray" },
          { label: 65, color: "gray" },
          { label: 71, color: "gray" },
          { label: 78, color: "gray" },
          { label: 86, color: "gray" },
          { label: 95, color: "gray" }
        ]
      ]
    },
    splice: 27,
    market: [
      {
        start: true,
        color: "pink",
        label: "Bankrupt"
      },
      {
        color: "green",
        label: "7"
      },
      {
        color: "green",
        label: "14"
      },
      {
        color: "green",
        label: "20"
      },
      {
        color: "green",
        label: "26"
      },
      {
        color: "green",
        label: "31"
      },
      {
        color: "green",
        label: "36"
      },
      {
        color: "gray",
        label: "40"
      },
      {
        color: "gray",
        label: "44"
      },
      {
        color: "gray",
        label: "47"
      },
      {
        color: "gray",
        label: "50"
      },
      {
        color: "gray",
        label: "52"
      },
      {
        color: "yellow",
        label: "54"
      },
      {
        color: "gray",
        label: "56"
      },
      {
        color: "yellow",
        label: "58"
      },
      {
        color: "gray",
        label: "60"
      },
      {
        color: "yellow",
        label: "62"
      },
      {
        color: "gray",
        label: "65"
      },
      {
        color: "yellow",
        label: "68"
      },
      {
        color: "gray",
        label: "71"
      },
      {
        color: "yellow",
        label: "74"
      },
      {
        color: "gray",
        label: "78"
      },
      {
        color: "yellow",
        label: "82"
      },
      {
        color: "gray",
        label: "86"
      },
      {
        color: "yellow",
        label: "90"
      },
      {
        color: "gray",
        label: "95"
      },
      {
        color: "yellow",
        label: "100"
      },
      "105",
      "110",
      "116",
      "122",
      "128",
      "134",
      "142",
      "150",
      {
        color: "green",
        label: "158"
      },
      {
        color: "green",
        label: "166"
      },
      {
        color: "green",
        label: "174"
      },
      {
        color: "green",
        label: "182"
      },
      {
        color: "green",
        label: "191"
      },
      {
        color: "green",
        label: "200"
      },
      {
        color: "green",
        label: "210"
      },
      {
        color: "green",
        label: "220"
      },
      {
        color: "green",
        label: "230"
      },
      {
        color: "green",
        label: "240"
      },
      {
        color: "green",
        label: "250"
      },
      {
        color: "green",
        label: "260"
      },
      {
        color: "green",
        label: "270"
      },
      {
        color: "green",
        label: "280"
      },
      {
        color: "green",
        label: "290"
      },
      {
        color: "green",
        label: "300"
      },
      {
        color: "green",
        label: "310"
      },
      {
        color: "green",
        label: "320"
      },
      {
        color: "green",
        label: "330"
      },
      {
        color: "orange",
        label: "340",
        end: true
      }
    ],
    limits: [
      {
        color: "green",
        description: "Ignore first share sold when moving share price"
      }
    ]
  },

  tiles: {
    // Green
    "5": 2,
    "6": 2,
    "7": 2,
    "8": 4,
    "9": 4,
    "57": 2,
    "115": 2,
    "741": 5,
    "742": 10,
    "743": 7,
    "744": 2,
    "745": 2,
    "746": 2,
    "787": 1,
    // Green
    "12": 2,
    "16": 2,
    "17": 2,
    "18": 2,
    "19": 2,
    "20": 2,
    "21": 1,
    "22": 1,
    "205": 1,
    "206": 1,
    "625": 1,
    "626": 1,
    "747": 3,
    "748": 3,
    "1749": 3, // Labeled as 749 in the game
    "750": 3,
    "751": 3,
    "752": 3,
    "754": 2,
    "755": 2,
    "756": 2,
    "757": 2,
    "758": 1,
    "759": 3,
    "760": 1,
    "761": 1,
    "762": 2,
    "763": 1,
    "788": 1,
    // Brown
    "764": 2,
    "765": 2,
    "766": 2,
    "767": 2,
    "768": 2,
    "769": 2,
    "770": 2,
    "771": 1,
    "772": 2,
    "773": 1,
    "774": 1,
    "775": 1,
    "776": 3,
    "777": 2,
    "778": 1,
    "779": 1,
    "780": 1,
    "781": 1,
    "782": 1,
    "783": 1,
    "784": 1,
    "785": 1,
    "786": 1,
    "789": 1
  },

  map: {
    hexes: [
      {
        color: "plain",
        centerTowns: [{}],
        borders: [
          {
            side: 2,
            color: "mountain"
          }
        ],
        hexes: ["G1"]
      },
      {
        color: "plain",
        borders: [
          {
            side: 5,
            color: "mountain"
          },
          {
            side: 6,
            color: "mountain"
          }
        ],
        cities: [
          {
            angle: 180,
            percent: 0.5,
            companies: [
              {
                label: "C&N",
                color: "blue"
              }
            ]
          }
        ],
        centerTowns: [
          {
            percent: 0.25
          },
          {
            percent: 0.75
          }
        ],
        hexes: ["F2"]
      },
      {
        color: "plain",
        water: {
          cost: "TBD"
        },
        hexes: ["H2"]
      },
      {
        color: "water",
        offBoardRevenue: {
          revenues: [
            {
              color: "yellow",
              cost: "0"
            },
            {
              color: "green",
              cost: "20"
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
          }
        ],
        hexes: ["J2"]
      },
      {
        color: "plain",
        hexes: ["E3", "K7", "D8", "E11"]
      },
      {
        color: "plain",
        centerTowns: [{}],
        borders: [
          {
            side: 2,
            color: "mountain"
          },
          {
            side: 3,
            color: "mountain"
          }
        ],
        hexes: ["G3"]
      },
      {
        color: "yellow",
        cities: [
          {
            companies: [
              {
                label: "IOW",
                color: "red"
              }
            ]
          }
        ],
        values: [
          {
            value: 30,
            angle: 90,
            percent: 0.667
          }
        ],
        labels: [
          {
            label: "R",
            angle: 180,
            percent: 0.667
          }
        ],
        track: [
          {
            side: 6
          }
        ],
        hexes: ["I3"]
      },
      {
        color: "plain",
        cities: [
          {
            companies: [
              {
                label: "FYN",
                color: "darkGreen"
              }
            ]
          }
        ],
        borders: [
          {
            side: 2,
            color: "mountain"
          }
        ],
        hexes: ["B4"]
      },
      {
        color: "plain",
        water: {
          cost: "TBD"
        },
        hexes: ["D4"]
      },
      {
        color: "plain",
        centerTowns: [{}],
        borders: [
          {
            side: 5,
            color: "mountain"
          }
        ],
        hexes: ["F4"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            angle: 90,
            percent: 0.5
          },
          {
            angle: 270,
            percent: 0.5
          }
        ],
        hexes: ["H4"]
      },
      {
        color: "plain",
        cities: [{}],
        hexes: ["J4"]
      },
      {
        color: "plain",
        centerTowns: [{}],
        borders: [
          {
            side: 5,
            color: "mountain"
          }
        ],
        hexes: ["A5"]
      },
      {
        color: "plain",
        centerTowns: [{}],
        hexes: ["C5", "E5", "D6", "F6", "H8", "F10", "G11"]
      },
      {
        color: "yellow",
        values: [
          {
            value: 30,
            percent: 0.667
          }
        ],
        labels: [
          {
            angle: 270,
            percent: 0.667,
            label: "N"
          }
        ],
        cities: [{}],
        track: [
          {
            side: 3
          },
          {
            side: 4
          }
        ],
        hexes: ["G5"]
      },
      {
        color: "plain",
        borders: [
          {
            side: 1,
            color: "mountain"
          }
        ],
        centerTowns: [{}],
        hexes: ["I5"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            angle: 90,
            percent: 0.5
          }
        ],
        water: [
          {
            angle: 270,
            percent: 0.5,
            cost: "TBD"
          }
        ],
        hexes: ["K5"]
      },
      {
        color: "plain",
        cities: [{}],
        hexes: ["B6", "A7", "J8"]
      },
      {
        color: "plain",
        mountain: {
          cost: "TBD"
        },
        hexes: ["H6", "E7", "F8", "G13"]
      },
      {
        color: "plain",
        cities: [{}],
        labels: [
          {
            angle: 180,
            percent: 0.667,
            label: "B"
          }
        ],
        hexes: ["J6"]
      },
      {
        color: "plain",
        cities: [
          {
            companies: [
              {
                label: "BHI&R",
                color: "pink"
              }
            ]
          }
        ],
        hexes: ["L6"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            angle: 90,
            percent: 0.5
          }
        ],
        mountain: [
          {
            angle: 270,
            percent: 0.5,
            cost: "TBD"
          }
        ],
        hexes: ["C7", "H10", "H12"]
      },
      {
        color: "yellow",
        values: [
          {
            angle: 30,
            value: 10,
            percent: 0.5
          }
        ],
        labels: [
          {
            angle: 210,
            percent: 0.667,
            label: "M"
          }
        ],
        centerTowns: [
          {
            angle: 150,
            percent: 0.667
          }
        ],
        cities: [
          {
            angle: -60,
            percent: 0.5,
            companies: [
              {
                label: "IWNJ",
                color: "black"
              }
            ]
          }
        ],
        track: [
          {
            type: "stop",
            side: 6
          }
        ],
        hexes: ["G7"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            angle: 90,
            percent: 0.5
          },
          {
            angle: 270,
            percent: 0.5
          }
        ],
        borders: [
          {
            side: 4,
            color: "mountain"
          }
        ],
        hexes: ["I7"]
      },
      {
        color: "plain",
        labels: [
          {
            label: "B",
            angle: 180,
            percent: 0.667
          }
        ],
        cities: [
          {
            companies: [
              {
                label: "VYSC",
                color: "cyan"
              }
            ]
          }
        ],
        hexes: ["E9"]
      },
      {
        color: "plain",
        labels: [
          {
            label: "B",
            angle: 180,
            percent: 0.667
          }
        ],
        cities: [
          {
            companies: [
              {
                label: "NGStL",
                color: "yellow"
              }
            ]
          }
        ],
        hexes: ["G9"]
      },
      {
        color: "plain",
        cities: [{}],
        borders: [
          {
            side: 1,
            color: "mountain"
          }
        ],
        hexes: ["I9"]
      },
      {
        color: "yellow",
        cities: [{}],
        labels: [
          {
            label: "V",
            percent: 0.667
          }
        ],
        values: [
          {
            value: 30,
            angle: 270,
            percent: 0.667
          }
        ],
        track: [
          {
            side: 3
          }
        ],
        borders: [
          {
            side: 4,
            color: "mountain"
          }
        ],
        hexes: ["I11"]
      },
      {
        color: "plain",
        cities: [
          {
            companies: [
              {
                label: "S&C",
                color: "maroon"
              }
            ]
          }
        ],
        hexes: ["F12"]
      }
    ]
  }
};

export default game;
