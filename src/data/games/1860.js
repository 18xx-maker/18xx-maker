const game = {
  // Generic Game Info
  info: {
    title: "1860",
    subtitle: "Railways on the Isle of Wight",
    designer: "Mike Hutton",
    background: "water",
    width: 150,
    orientation: "horizontal"
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
      description:
        "Can be exchanged for a share in the FYN public company."
    },
    {
      name: "Cowes Marina and Harbour",
      price: "£90",
      revenue: "£20",
      description:
        "Can be exchanged for a share in the C&N public company."
    },
    {
      name: "Ryde Pier & Shipping Company",
      price: "£130",
      revenue: "£30",
      description:
        "Can be exchanged for a share in the IOW public company."
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
      name: "Market",
      notes: [
        {
          color: "orange",
          note: "If a company does not have a train, shares in that company are sold at HALF the current market price (round fractions down)"
        },
        {
          color: "orange",
          note: "Director's certificate may be sold"
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
          note: "Buying a train from another company is not allowed if the buying company already has a train, and the selling company has only one train"
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
      steps: ["Sell any number of certificates", "Buy one certificate"],
      ordered: true
    },
    {
      name: "Operating Round",
      steps: [
        "Lay or upgrade track",
        "Buy an additional base",
        "Run trains",
        "Retain or pay revenue",
        "Buy one or more trains",
        "May be declared insolvent"
      ],
      ordered: true
    }
  ],

  stock: {
    type: "2D",
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
    limits: [
      {
        color: "yellow",
        description: "Certificates no longer count towards the share limit",
        value: 60
      },
      {
        color: "orange",
        description: "Players may own more than 60% of the company",
        value: 45
      },
      {
        color: "brown",
        description: "Multiple certificates may be bought in the same turn",
        value: 30
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
    "749": 3,
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
    "770": 1,
    "771": 1,
    "772": 2,
    "773": 1,
    "774": 1,
    "775": 1,
    "776": 2,
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
        color: "offboard",
        labels: [
          {
            label: "Gulf"
          }
        ],
        offBoardRevenue: {
          percent: 0.333,
          revenues: [
            {
              color: "yellow",
              cost: "30"
            },
            {
              color: "brown",
              cost: "60"
            }
          ]
        },
        offBoardTrack: [
          {
            side: 4
          }
        ],
        hexes: ["I1"]
      },
      {
        color: "gray",
        cities: [
          {
            name: {
              name: "Lansing"
            }
          }
        ],
        values: [
          {
            angle: 90,
            percent: 0.667,
            value: 20
          }
        ],
        track: [
          {
            start: 4
          },
          {
            start: 5
          }
        ],
        hexes: ["D2"]
      },
      {
        color: "offboard",
        labels: [
          {
            label: "Chicago",
            x: -25
          }
        ],
        offBoardRevenue: {
          percent: 0.333,
          x: -25,
          revenues: [
            {
              color: "yellow",
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
            side: 3
          },
          {
            side: 4
          },
          {
            side: 5
          }
        ],
        hexes: ["F2"]
      },
      {
        copy: "I1",
        offBoardTrack: [
          {
            side: 3
          }
        ],
        hexes: ["J2"]
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
          percent: 0.4,
          cost: "$80",
          size: "small"
        },
        hexes: ["F4"]
      },
      {
        copy: "F4",
        cities: [
          {
            name: {
              name: "Washington"
            }
          }
        ],
        hexes: ["J14"]
      },
      {
        copy: "F4",
        cities: [
          {
            name: {
              name: "Providence"
            }
          }
        ],
        hexes: ["F22"]
      },
      {
        color: "yellow",
        water: {
          angle: 180,
          percent: 0.667,
          cost: "$80",
          size: "small"
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
        hexes: ["E5"]
      },
      {
        copy: "E5",
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
        hexes: ["D10"]
      },
      {
        copy: "A17",
        values: [
          {
            angle: 180,
            percent: 0.333,
            value: 30
          }
        ],
        cities: [
          {
            percent: 0.5,
            name: {
              name: "Cleveland"
            },
            companies: [
              {
                label: "C&O",
                color: "cyan"
              }
            ]
          }
        ],
        hexes: ["F6"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            name: {
              name: "London"
            }
          }
        ],
        borders: [
          {
            side: 5,
            color: "water"
          }
        ],
        hexes: ["E7"]
      },
      {
        color: "plain",
        borders: [
          {
            side: 2,
            color: "water"
          }
        ],
        hexes: ["F8"]
      },
      {
        color: "offboard",
        labels: [
          {
            label: "Canadian West"
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
              cost: "50"
            }
          ]
        },
        offBoardTrack: [
          {
            side: 5
          }
        ],
        hexes: ["A9"]
      },
      {
        color: "gray",
        track: [
          {
            start: 2,
            end: 3
          }
        ],
        hexes: ["E9"]
      },
      {
        copy: "A9",
        offBoardTrack: [
          {
            side: 6
          }
        ],
        hexes: ["A11"]
      },
      {
        color: "plain",
        borders: [
          {
            side: 5,
            color: "water"
          }
        ],
        hexes: ["C11"]
      },
      {
        color: "plain",
        borders: [
          {
            side: 6,
            color: "water"
          }
        ],
        hexes: ["C13"]
      },
      {
        color: "offboard",
        labels: [
          {
            label: "Deep South"
          }
        ],
        offBoardRevenue: {
          percent: 0.333,
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
        hexes: ["K13"]
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
              rotation: 30
            },
            companies: [
              {
                label: "Erie",
                color: "yellow"
              }
            ]
          },
          {
            angle: 285,
            percent: 0.55,
            name: {
              name: "Buffalo",
              rotation: -30
            },
            companies: [
              {
                label: "Erie",
                color: "yellow"
              }
            ]
          }
        ],
        hexes: ["E11"]
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
        hexes: ["D12"]
      },
      {
        color: "gray",
        values: [
          {
            value: 10,
            percent: 0.8,
            angle: 180
          }
        ],
        cities: [
          {
            name: {
              name: "Altoona"
            },
            companies: [
              {
                label: "PRR",
                color: "darkGreen"
              }
            ]
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
          }
        ],
        hexes: ["H12"]
      },
      {
        color: "plain",
        labels: [
          {
            label: "B&O"
          }
        ],
        hexes: ["I13"]
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
            y: -60
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
        hexes: ["D14"]
      },
      {
        color: "gray",
        values: [
          {
            value: 10,
            angle: -30,
            percent: 0.5
          }
        ],
        towns: [
          {
            rotation: 60,
            angle: 150,
            percent: 0.26,
            name: {
              name: "Kingston",
              reverse: true,
              rotation: -90
            }
          }
        ],
        track: [
          {
            type: "gentle",
            side: 1
          }
        ],
        hexes: ["C15"]
      },
      {
        color: "plain",
        mountain: {
          size: "medium",
          cost: "$120",
          percent: 0.333
        },
        labels: [
          {
            label: "SVR",
            angle: 180,
            percent: 0.333
          }
        ],
        hexes: ["G15"]
      },
      {
        color: "yellow",
        labels: [
          {
            label: "B",
            angle: 150,
            percent: 0.7
          },
          {
            label: "B&O",
            angle: 210,
            percent: 0.7
          }
        ],
        values: [
          {
            value: 30,
            angle: 90,
            percent: 0.667
          }
        ],
        cities: [
          {
            name: {
              name: "Baltimore",
              reverse: true,
              rotation: -30
            },
            companies: [
              {
                label: "B&O",
                color: "blue"
              }
            ]
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
        hexes: ["I15"]
      },
      {
        color: "gray",
        cities: [
          {
            name: {
              name: "Richmond",
              reverse: true
            }
          }
        ],
        values: [
          {
            value: 20,
            angle: 270,
            percent: 0.66
          }
        ],
        track: [
          {
            side: 2
          }
        ],
        hexes: ["K15"]
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              name: "Ottowa"
            }
          }
        ],
        borders: [
          {
            side: 5,
            color: "water"
          }
        ],
        hexes: ["B16"]
      },
      {
        color: "plain",
        mountain: {
          cost: "$120",
          size: "medium",
          y: -25
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
        labels: [
          {
            label: "D&H",
            angle: 45,
            percent: 0.5
          }
        ],
        hexes: ["F16"]
      },
      {
        color: "gray",
        track: [
          {
            type: "sharp",
            side: 5
          }
        ],
        hexes: ["A17"]
      },
      {
        color: "plain",
        mountain: {
          cost: "$120",
          size: "medium"
        },
        borders: [
          {
            side: 2,
            color: "water"
          }
        ],
        hexes: ["C17"]
      },
      {
        color: "plain",
        labels: [
          {
            label: "M&H"
          }
        ],
        hexes: ["D18"]
      },
      {
        color: "yellow",
        labels: [
          {
            label: "C&A",
            y: -30
          },
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
              name: "Philidelphia",
              reverse: true
            }
          },
          {
            x: 40,
            y: 10,
            name: {
              name: "Trenton",
              reverse: true
            }
          }
        ],
        hexes: ["H18"]
      },
      {
        copy: "F6",
        values: [
          {
            value: 40
          }
        ],
        cities: [
          {
            name: {
              name: "Montreal"
            },
            companies: [
              {
                label: "CPR",
                color: "red"
              }
            ]
          }
        ],
        hexes: ["A19"]
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              name: "Albany"
            },
            companies: [
              {
                label: "NYC",
                color: "black"
              }
            ]
          }
        ],
        hexes: ["E19"]
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
            companies: [
              {
                label: "NYNH",
                color: "orange"
              }
            ]
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
          percent: 0.5,
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
        hexes: ["G19"]
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
              reverse: true,
              rotation: -90
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
            angle: 300,
            percent: 0.2
          }
        ],
        hexes: ["I19"]
      },
      {
        copy: "I19",
        towns: [
          {
            name: {
              name: "Fall River"
            }
          }
        ],
        hexes: ["F24"]
      },
      {
        color: "plain",
        labels: [
          {
            label: "C&St L",
            percent: 0.4
          }
        ],
        centerTowns: [
          {
            name: {
              name: "Burlington"
            }
          }
        ],
        hexes: ["B20"]
      },
      {
        color: "yellow",
        labels: [
          {
            angle: 150,
            percent: 0.7,
            label: "B"
          }
        ],
        cities: [
          {
            name: {
              name: "Boston",
              reverse: true,
              rotation: -90
            },
            companies: [
              {
                label: "B&M",
                color: "maroon"
              }
            ]
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
        hexes: ["E23"]
      },
      {
        color: "offboard",
        labels: [
          {
            label: "Maritime Provinces",
            angle: 180,
            percent: 0.333,
            x: 5
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
        hexes: ["B24"]
      },
      {
        color: "gray",
        track: [
          {
            type: "sharp",
            side: 6
          }
        ],
        hexes: ["D24"]
      },
      {
        color: "plain",
        centerTowns: [
          {
            name: {
              name: "Flint"
            }
          }
        ],
        hexes: ["D4"]
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
        hexes: ["F10"]
      },
      {
        color: "plain",
        centerTowns: [
          { x: -30, name: { name: "Akron", reverse: true } },
          { x: 30, name: { name: "Canton" } }
        ],
        hexes: ["G7"]
      },
      {
        copy: "G7",
        centerTowns: [
          { name: { name: "Reading" } },
          { name: { name: "Allentown" } }
        ],
        hexes: ["G17"]
      },
      {
        copy: "G7",
        centerTowns: [
          { name: { name: "New Haven" } },
          { name: { name: "Hartford" } }
        ],
        hexes: ["F20"]
      },
      {
        color: "plain",
        cities: [
          {
            name: {
              name: "Columbus"
            }
          }
        ],
        hexes: ["H4"]
      },
      {
        copy: "H4",
        cities: [
          {
            name: {
              name: "Barrie"
            }
          }
        ],
        hexes: ["B10"]
      },
      {
        copy: "H4",
        cities: [
          {
            name: {
              name: "Pittsburgh"
            }
          }
        ],
        hexes: ["H10"]
      },
      {
        copy: "H4",
        cities: [
          {
            name: {
              name: "Lancaster"
            }
          }
        ],
        hexes: ["H16"]
      },
      {
        color: "plain",
        water: {
          cost: "$80",
          size: "small"
        },
        hexes: ["D6", "I17", "B18", "C19"]
      },
      {
        color: "plain",
        mountain: {
          cost: "$120",
          size: "medium"
        },
        hexes: ["C21", "D22", "E17", "E21", "G13", "I11", "J10", "J12"]
      },
      {
        color: "plain",
        hexes: [
          "B12",
          "B14",
          "B22",
          "C7",
          "C9",
          "C23",
          "D8",
          "D16",
          "D20",
          "E3",
          "E13",
          "E15",
          "F12",
          "F14",
          "F18",
          "G3",
          "G5",
          "G9",
          "G11",
          "H2",
          "H6",
          "H8",
          "H14",
          "I3",
          "I5",
          "I7",
          "I9",
          "J4",
          "J6",
          "J8"
        ]
      }
    ]
  }
};

export default game;
