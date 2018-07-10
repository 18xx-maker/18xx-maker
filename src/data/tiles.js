const tiles = {
  // 1830 Tiles
  "1": {
    color: "yellow",
    values: [
      {
        angle: 150,
        percent: 0.7,
        value: 10
      },
      {
        angle: -30,
        percent: 0.7,
        value: 10
      }
    ],
    towns: [
      {
        x: -129.90375,
        y: 75,
        rotate: -45,
        angle: 225,
        percent: 1.7216875
      },
      {
        x: 129.90375,
        y: -75,
        rotate: -45,
        angle: 45,
        percent: 1.7216875
      }
    ],
    track: [
      {
        type: "gentle",
        side: 1
      },
      {
        type: "gentle",
        side: 4
      }
    ]
  },
  "2": {
    color: "yellow",
    values: [
      {
        angle: 215,
        percent: 0.75,
        value: 10
      },
      {
        angle: 33,
        percent: 0.6,
        value: 10
      }
    ],
    towns: [
      {
        angle: 180,
        percent: 0.66
      },
      {
        rotation: 30,
        x: -86.6025,
        angle: -60,
        percent: 0.57735
      }
    ],
    track: [
      {
        type: "straight",
        side: 1
      },
      {
        type: "sharp",
        side: 2
      }
    ]
  },
  "3": {
    color: "yellow",
    values: [
      {
        value: 10
      }
    ],
    towns: [
      {
        angle: 30,
        percent: 0.57735,
        rotation: -60
      }
    ],
    track: [
      {
        type: "sharp",
        side: 1
      }
    ]
  },
  "4": {
    color: "yellow",
    values: [
      {
        angle: -90,
        percent: 0.45,
        value: 10
      }
    ],
    towns: [{}],
    track: [
      {
        type: "straight",
        side: 1
      }
    ]
  },
  "7": {
    color: "yellow",
    track: [
      {
        type: "sharp",
        side: 1
      }
    ]
  },
  "8": {
    color: "yellow",
    track: [
      {
        type: "gentle",
        side: 1
      }
    ]
  },
  "9": {
    color: "yellow",
    track: [
      {
        type: "sharp",
        side: 1
      }
    ]
  },
  "14": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 30
      }
    ],
    cities: [{ size: 2 }],
    track: [
      {
        type: "city",
        side: 1
      },
      {
        type: "city",
        side: 2
      },
      {
        type: "city",
        side: 4
      },
      {
        type: "city",
        side: 5
      }
    ]
  },
  "15": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 30
      }
    ],
    cities: [{ size: 2 }],
    track: [
      {
        type: "city",
        side: 1
      },
      {
        type: "city",
        side: 2
      },
      {
        type: "city",
        side: 3
      },
      {
        type: "city",
        side: 4
      }
    ]
  },
  "16": {
    color: "green",
    track: [
      {
        type: "gentle",
        side: 1,
        cross: "over"
      },
      {
        type: "gentle",
        side: 2,
        cross: "under"
      }
    ]
  },
  "18": {
    color: "green",
    track: [
      {
        type: "straight",
        side: 1
      },
      {
        type: "sharp",
        side: 2
      }
    ]
  },
  "19": {
    color: "green",
    track: [
      {
        type: "straight",
        side: 1,
        cross: "over"
      },
      {
        type: "gentle",
        side: 6,
        cross: "under"
      }
    ]
  },
  "20": {
    color: "green",
    track: [
      {
        type: "straight",
        side: 1,
        cross: "over"
      },
      {
        type: "straight",
        side: 2,
        cross: "under"
      }
    ]
  },
  "23": {
    color: "green",
    track: [
      {
        type: "straight",
        side: 1
      },
      {
        type: "gentle",
        side: 5
      }
    ]
  },
  "24": {
    color: "green",
    track: [
      {
        type: "straight",
        side: 1
      },
      {
        type: "gentle",
        side: 1
      }
    ]
  },
  "25": {
    color: "green",
    track: [
      {
        type: "gentle",
        side: 1
      },
      {
        type: "gentle",
        side: 5
      }
    ]
  },
  "26": {
    color: "green",
    track: [
      {
        type: "straight",
        side: 1
      },
      {
        type: "sharp",
        side: 6
      }
    ]
  },
  "27": {
    color: "green",
    track: [
      {
        type: "straight",
        side: 1
      },
      {
        type: "sharp",
        side: 1
      }
    ]
  },
  "28": {
    color: "green",
    track: [
      {
        type: "gentle",
        side: 5
      },
      {
        type: "sharp",
        side: 6
      }
    ]
  },
  "29": {
    color: "green",
    track: [
      {
        type: "gentle",
        side: 1
      },
      {
        type: "sharp",
        side: 1
      }
    ]
  },
  "39": {
    color: "brown",
    track: [
      {
        type: "gentle",
        side: 1
      },
      {
        type: "sharp",
        side: 1
      },
      {
        type: "sharp",
        side: 2
      }
    ]
  },
  "40": {
    color: "brown",
    track: [
      {
        type: "gentle",
        side: 1
      },
      {
        type: "gentle",
        side: 3
      },
      {
        type: "gentle",
        side: 5
      }
    ]
  },
  "41": {
    color: "brown",
    track: [
      {
        type: "straight",
        side: 1
      },
      {
        type: "sharp",
        side: 4
      },
      {
        type: "gentle",
        side: 5
      }
    ]
  },
  "42": {
    color: "brown",
    track: [
      {
        type: "straight",
        side: 1
      },
      {
        type: "gentle",
        side: 1
      },
      {
        type: "sharp",
        side: 3
      }
    ]
  },
  "43": {
    color: "brown",
    track: [
      {
        type: "straight",
        side: 1
      },
      {
        type: "gentle",
        side: 1,
        cross: "over"
      },
      {
        type: "gentle",
        side: 2,
        cross: "under"
      },
      {
        type: "sharp",
        side: 2
      }
    ]
  },
  "44": {
    color: "brown",
    track: [
      {
        type: "straight",
        side: 1,
        cross: "over"
      },
      {
        type: "straight",
        side: 2,
        cross: "under"
      },
      {
        type: "sharp",
        side: 1
      },
      {
        type: "sharp",
        side: 4
      }
    ]
  },
  "45": {
    color: "brown",
    track: [
      {
        type: "straight",
        side: 1,
        cross: "over"
      },
      {
        type: "gentle",
        side: 6,
        cross: "under"
      },
      {
        type: "gentle",
        side: 2
      },
      {
        type: "sharp",
        side: 6
      }
    ]
  },
  "46": {
    color: "brown",
    track: [
      {
        type: "straight",
        side: 1,
        cross: "over"
      },
      {
        type: "gentle",
        side: 6,
        cross: "under"
      },
      {
        type: "sharp",
        side: 1
      },
      {
        type: "gentle",
        side: 4
      }
    ]
  },
  "47": {
    color: "brown",
    track: [
      {
        type: "straight",
        side: 1,
        cross: "over"
      },
      {
        type: "straight",
        side: 2,
        cross: "under"
      },
      {
        type: "gentle",
        side: 2
      },
      {
        type: "gentle",
        side: 5
      }
    ]
  },
  "53": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 50
      }
    ],
    labels: [
      {
        label: "B",
        angle: 150,
        percent: 0.8
      }
    ],
    cities: [{ size: 1 }],
    track: [
      {
        side: 1
      },
      {
        side: 3
      },
      {
        side: 5
      }
    ]
  },
  "54": {
    color: "green",
    values: [
      {
        angle: 90,
        percent: 0.7,
        value: 60
      },
      {
        angle: -30,
        percent: 0.7,
        value: 60
      }
    ],
    labels: {
      label: "NY",
      angle: 30,
      percent: 0.5
    },
    cities: [
      {
        angle: 150,
        percent: 0.5
      },
      {
        angle: -90,
        percent: 0.5
      }
    ],
    track: [
      {
        type: "sharp",
        side: 3
      },
      {
        type: "sharp",
        side: 5
      }
    ]
  },
  "55": {
    color: "yellow",
    values: [
      {
        value: 10,
        angle: 145,
        percent: 0.75
      },
      {
        value: 10,
        angle: 95,
        percent: 0.75
      }
    ],
    towns: [
      {
        angle: 180,
        percent: 0.7
      },
      {
        angle: 60,
        percent: 0.7,
        rotation: 60
      }
    ],
    track: [
      {
        type: "straight",
        side: 1,
        cross: "over"
      },
      {
        type: "straight",
        side: 2,
        cross: "under"
      }
    ]
  },
  "56": {
    color: "yellow",
    values: [
      {
        x: -129.90375,
        y: 75,
        angle: 255,
        percent: 2.2,
        value: 10
      },
      {
        x: -129.90375,
        y: -75,
        angle: 285,
        percent: 2.2,
        value: 10
      }
    ],
    towns: [
      {
        x: -129.90375,
        y: 75,
        rotate: -15,
        angle: 255,
        percent: 1.7216875
      },
      {
        x: -129.90375,
        y: -75,
        rotate: 15,
        angle: 285,
        percent: 1.7216875
      }
    ],
    track: [
      {
        type: "gentle",
        side: 1,
        cross: "over"
      },
      {
        type: "gentle",
        side: 2,
        cross: "under"
      }
    ]
  },
  "57": {
    color: "yellow",
    values: [
      {
        angle: 210,
        percent: 0.75,
        value: 20
      }
    ],
    cities: [{}],
    track: [
      {
        type: "straight"
      }
    ]
  },
  "58": {
    color: "yellow",
    values: [
      {
        angle: -120,
        percent: 0.2,
        value: 10
      }
    ],
    towns: [
      {
        angle: 60,
        percent: 0.288675,
        rotate: -30
      }
    ],
    track: [
      {
        type: "gentle",
        side: 1
      }
    ]
  },
  "59": {
    color: "green",
    values: [
      {
        angle: 180,
        percent: 0.7,
        value: 40
      },
      {
        angle: -60,
        percent: 0.7,
        value: 40
      }
    ],
    labels: {
      angle: 240,
      percent: 0.5,
      label: "OO"
    },
    cities: [
      {
        percent: 0.5
      },
      {
        angle: 120,
        percent: 0.5
      }
    ],
    track: [
      {
        type: "stop",
        side: 1
      },
      {
        type: "stop",
        side: 3
      }
    ]
  },
  "61": {
    color: "brown",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 60
      }
    ],
    labels: {
      label: "B",
      angle: 150,
      percent: 0.8
    },
    cities: [{ size: 1 }],
    track: [
      {
        side: 1
      },
      {
        side: 3
      },
      {
        side: 4
      },
      {
        side: 5
      }
    ]
  },
  "62": {
    color: "brown",
    values: [
      {
        angle: 30,
        percent: 0.6,
        value: 80
      },
      {
        angle: 210,
        percent: 0.6,
        value: 80
      }
    ],
    labels: {
      label: "NY",
      rotation: -60
    },
    cities: [
      {
        angle: 120,
        rotate: -60,
        percent: 0.57,
        size: 2
      },
      {
        angle: -60,
        rotate: -60,
        percent: 0.57,
        size: 2
      }
    ],
    track: [
      {
        type: "sharp",
        side: 3
      },
      {
        type: "sharp",
        side: 5
      }
    ]
  },
  "63": {
    color: "brown",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 40
      }
    ],
    cities: [{ size: 2 }],
    track: [
      {
        side: 1
      },
      {
        side: 2
      },
      {
        side: 3
      },
      {
        side: 4
      },
      {
        side: 5
      },
      {
        side: 6
      }
    ]
  },
  "64": {
    color: "brown",
    values: [
      {
        angle: 60,
        percent: 0.7,
        value: 50
      },
      {
        angle: 150,
        percent: 0.8,
        value: 50
      }
    ],
    labels: {
      angle: -75,
      percent: 0.65,
      label: "OO"
    },
    cities: [
      {
        percent: 0.57735
      },
      {
        angle: 210,
        percent: 0.5
      }
    ],
    track: [
      {
        type: "gentle",
        side: 1
      },
      {
        type: "sharp",
        side: 4
      }
    ]
  },
  "65": {
    color: "brown",
    values: [
      {
        angle: 60,
        percent: 0.7,
        value: 50
      },
      {
        angle: -30,
        percent: 0.8,
        value: 50
      }
    ],
    labels: {
      angle: 195,
      percent: 0.7,
      label: "OO"
    },
    cities: [
      {
        angle: 120,
        percent: 0.57735
      },
      {
        angle: 270,
        percent: 0.5
      }
    ],
    track: [
      {
        type: "gentle",
        side: 1
      },
      {
        type: "sharp",
        side: 5
      }
    ]
  },
  "66": {
    color: "brown",
    values: [
      {
        angle: 240,
        percent: 0.7,
        value: 50
      },
      {
        angle: 30,
        percent: 0.7,
        value: 50
      }
    ],
    labels: {
      angle: 300,
      percent: 0.5,
      label: "OO"
    },
    cities: [
      {
        angle: 180,
        percent: 0.6
      },
      {
        angle: 90,
        percent: 0.5
      }
    ],
    track: [
      {
        type: "straight",
        side: 1
      },
      {
        type: "sharp",
        side: 2
      }
    ]
  },
  "67": {
    color: "brown",
    values: [
      {
        angle: 120,
        percent: 0.7,
        value: 50
      },
      {
        angle: -25,
        percent: 0.8,
        value: 50
      }
    ],
    labels: {
      label: "OO",
      angle: 270,
      percent: 0.7
    },
    cities: [
      {
        angle: 180,
        percent: 0.6
      },
      {
        angle: 60,
        percent: 0.57735
      }
    ],
    track: [
      {
        type: "straight",
        side: 1,
        cross: "over"
      },
      {
        type: "gentle",
        side: 6,
        cross: "under"
      }
    ]
  },
  "68": {
    color: "brown",
    values: [
      {
        angle: 120,
        percent: 0.7,
        value: 50
      },
      {
        angle: -30,
        percent: 0.7,
        value: 50
      }
    ],
    labels: {
      label: "OO",
      angle: -90,
      percent: 0.7
    },
    cities: [
      {
        angle: 180,
        percent: 0.6
      },
      {
        angle: 60,
        percent: 0.6
      }
    ],
    track: [
      {
        type: "straight",
        side: 1,
        cross: "over"
      },
      {
        type: "straight",
        side: 2,
        cross: "under"
      }
    ]
  },
  "69": {
    color: "yellow",
    values: [
      {
        angle: 215,
        percent: 0.75,
        value: 10
      },
      {
        y: 150,
        angle: 165,
        percent: 2.2,
        value: 10
      }
    ],
    towns: [
      {
        angle: 180,
        percent: 0.66
      },
      {
        y: 150,
        angle: 165,
        percent: 1.73,
        rotate: 75
      }
    ],
    track: [
      {
        type: "straight",
        side: 1,
        cross: "over"
      },
      {
        type: "gentle",
        side: 6,
        cross: "under"
      }
    ]
  },
  "70": {
    color: "brown",
    track: [
      {
        type: "sharp",
        side: 1
      },
      {
        type: "gentle",
        side: 1,
        cross: "over"
      },
      {
        type: "gentle",
        side: 2,
        cross: "under"
      },
      {
        type: "sharp",
        side: 3
      }
    ]
  },

  // 1846 Tiles
  "5": {
    color: "yellow",
    track: [
      {
        side: 1
      },
      {
        side: 2
      }
    ],
    values: [
      {
        angle: 210,
        percent: 0.7,
        value: 20
      }
    ],
    cities: [{}]
  },
  "6": {
    color: "yellow",
    track: [
      {
        side: 1
      },
      {
        side: 3
      }
    ],
    values: [
      {
        angle: 210,
        percent: 0.7,
        value: 20
      }
    ],
    cities: [{}]
  },
  "17": {
    color: "green",
    track: [
      {
        type: "gentle",
        side: 1
      },
      {
        type: "gentle",
        side: 4
      }
    ]
  },
  "21": {
    color: "green",
    track: [
      {
        type: "gentle",
        side: 1
      },
      {
        type: "sharp",
        side: 4
      }
    ]
  },
  "22": {
    color: "green",
    track: [
      {
        type: "gentle",
        side: 5
      },
      {
        type: "sharp",
        side: 3
      }
    ]
  },
  "30": {
    color: "green",
    track: [
      {
        type: "gentle",
        side: 5
      },
      {
        type: "sharp",
        side: 1
      }
    ]
  },
  "31": {
    color: "green",
    track: [
      {
        type: "gentle",
        side: 1
      },
      {
        type: "sharp",
        side: 6
      }
    ]
  },
  "51": {
    color: "gray",
    cities: [
      {
        size: 2
      }
    ],
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 50
      }
    ],
    track: [
      {
        type: "city",
        side: 1
      },
      {
        type: "city",
        side: 2
      },
      {
        type: "city",
        side: 3
      },
      {
        type: "city",
        side: 5
      },
      {
        type: "city",
        side: 6
      }
    ]
  },
  "290": {
    color: "gray",
    cities: [
      {
        size: 3,
        rotate: 180
      }
    ],
    values: [
      {
        angle: 210,
        percent: 0.9,
        value: 70
      }
    ],
    labels: {
      label: "Z",
      angle: 150,
      percent: 0.9
    },
    track: [
      {
        side: 1
      },
      {
        side: 2
      },
      {
        side: 3
      },
      {
        side: 4
      },
      {
        side: 5
      }
    ]
  },
  "291": {
    color: "yellow",
    cities: [{}],
    labels: {
      label: "Z",
      angle: 150,
      percent: 0.75
    },
    values: [
      {
        angle: 210,
        percent: 0.75,
        value: 40
      }
    ],
    track: [
      {
        side: 1
      },
      {
        side: 2
      }
    ]
  },
  "292": {
    color: "yellow",
    cities: [{}],
    labels: {
      label: "Z",
      angle: 150,
      percent: 0.75
    },
    values: [
      {
        angle: 210,
        percent: 0.75,
        value: 40
      }
    ],
    track: [
      {
        side: 1
      },
      {
        side: 3
      }
    ]
  },
  "293": {
    color: "yellow",
    cities: [{}],
    labels: {
      label: "Z",
      angle: 150,
      percent: 0.75
    },
    values: [
      {
        angle: 210,
        percent: 0.75,
        value: 40
      }
    ],
    track: [
      {
        side: 1
      },
      {
        side: 4
      }
    ]
  },
  "294": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.75,
        value: 50
      }
    ],
    labels: {
      label: "Z",
      angle: 150,
      percent: 0.75
    },
    cities: [{ size: 2 }],
    track: [
      {
        side: 1
      },
      {
        side: 2
      },
      {
        side: 4
      },
      {
        side: 5
      }
    ]
  },
  "295": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.75,
        value: 50
      }
    ],
    labels: {
      label: "Z",
      angle: 150,
      percent: 0.75
    },
    cities: [{ size: 2 }],
    track: [
      {
        side: 1
      },
      {
        side: 2
      },
      {
        side: 3
      },
      {
        side: 4
      }
    ]
  },
  "296": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.75,
        value: 50
      }
    ],
    labels: {
      label: "Z",
      angle: 150,
      percent: 0.75
    },
    cities: [{ size: 2 }],
    track: [
      {
        side: 1
      },
      {
        side: 3
      },
      {
        side: 4
      },
      {
        side: 5
      }
    ]
  },
  "297": {
    color: "brown",
    values: [
      {
        angle: 210,
        percent: 0.9,
        value: 60
      }
    ],
    labels: {
      label: "Z",
      angle: 150,
      percent: 0.9
    },
    cities: [{ size: 3, rotate: 180 }],
    track: [
      {
        side: 1
      },
      {
        side: 2
      },
      {
        side: 3
      },
      {
        side: 4
      },
      {
        side: 5
      }
    ]
  },
  "298": {
    color: "green",
    labels: {
      angle: 30,
      percent: 0.7,
      label: "Chi"
    },
    values: [
      {
        angle: -10,
        percent: 0.7,
        rotation: -90,
        value: 40
      }
    ],
    cities: [
      {
        angle: -60,
        percent: 0.75
      },
      {
        angle: -120,
        percent: 0.75,
        rotation: -90,
        companies: [
          {
            label: "C&WI",
            color: "white"
          }
        ]
      },
      {
        angle: -180,
        percent: 0.75
      },
      {
        angle: -240,
        percent: 0.75
      }
    ],
    track: [
      {
        type: "sharp",
        side: 2
      },
      {
        type: "gentle",
        side: 2
      },
      {
        type: "straight",
        side: 2
      },
      {
        type: "gentle",
        side: 6
      }
    ]
  },
  "299": {
    color: "brown",
    labels: {
      angle: 30,
      percent: 0.7,
      label: "Chi"
    },
    values: [
      {
        angle: -10,
        percent: 0.7,
        rotation: -90,
        value: 70
      }
    ],
    cities: [
      {
        angle: -60,
        percent: 0.75
      },
      {
        angle: -120,
        percent: 0.75
      },
      {
        angle: -180,
        percent: 0.75
      },
      {
        angle: -240,
        percent: 0.75
      }
    ],
    track: [
      {
        type: "sharp",
        side: 2
      },
      {
        type: "gentle",
        side: 2
      },
      {
        type: "straight",
        side: 2
      },
      {
        type: "gentle",
        side: 6
      }
    ]
  },
  "300": {
    color: "gray",
    labels: {
      angle: 30,
      percent: 0.7,
      label: "Chi"
    },
    values: [
      {
        angle: -10,
        percent: 0.7,
        rotation: -90,
        value: 90
      }
    ],
    cities: [
      {
        angle: -60,
        percent: 0.75
      },
      {
        angle: -120,
        percent: 0.75
      },
      {
        angle: -180,
        percent: 0.75
      },
      {
        angle: -240,
        percent: 0.75
      }
    ],
    track: [
      {
        type: "sharp",
        side: 2
      },
      {
        type: "gentle",
        side: 2
      },
      {
        type: "straight",
        side: 2
      },
      {
        type: "gentle",
        side: 6
      }
    ]
  },
  "611": {
    color: "brown",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 40
      }
    ],
    cities: [{ size: 2 }],
    track: [
      {
        side: 1
      },
      {
        side: 2
      },
      {
        side: 3
      },
      {
        side: 4
      },
      {
        side: 5
      }
    ]
  },
  "619": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 30
      }
    ],
    cities: [{ size: 2 }],
    track: [
      {
        side: 1
      },
      {
        side: 3
      },
      {
        side: 4
      },
      {
        side: 5
      }
    ]
  },

  // 1889
  "437": {
    color: "yellow",
    icons: [
      {
        type: "port",
        angle: 60,
        percent: 0.7
      }
    ],
    values: [
      {
        angle: -120,
        percent: 0.2,
        value: 30
      }
    ],
    towns: [
      {
        angle: 60,
        percent: 0.288675,
        rotate: -30
      }
    ],
    track: [
      {
        type: "gentle",
        side: 1
      }
    ]
  },
  "438": {
    color: "yellow",
    values: [
      {
        angle: 200,
        percent: 0.75,
        value: 40
      }
    ],
    cities: [
      {
        name: {
          name: "Kotohira",
          rotation: 90
        }
      }
    ],
    mountain: {
      angle: 160,
      percent: 0.8,
      cost: "80",
      border: true
    },
    track: [{ side: 1 }, { side: 3 }]
  },
  "12": {
    color: "green",
    values: [
      {
        angle: 180,
        percent: 0.667,
        value: 30
      }
    ],
    cities: [{}],
    track: [{ side: 1 }, { side: 2 }, { side: 6 }]
  },
  "13": {
    color: "green",
    values: [
      {
        angle: 180,
        percent: 0.667,
        value: 30
      }
    ],
    cities: [{}],
    track: [{ side: 1 }, { side: 3 }, { side: 5 }]
  },
  "205": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.75,
        value: 30
      }
    ],
    cities: [{}],
    track: [{ side: 1 }, { side: 2 }, { side: 4 }]
  },
  "206": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.75,
        value: 30
      }
    ],
    cities: [{}],
    track: [{ side: 1 }, { side: 6 }, { side: 4 }]
  },
  "439": {
    color: "green",
    values: [
      {
        angle: 200,
        percent: 0.75,
        value: 60
      }
    ],
    mountain: {
      angle: 160,
      percent: 0.8,
      cost: "80",
      border: true
    },
    cities: [
      {
        size: 2,
        name: {
          name: "Kotohira",
          reverse: true,
          offset: 62
        }
      }
    ],
    track: [{ side: 1 }, { side: 3 }, { side: 5 }]
  },
  "440": {
    color: "green",
    values: [
      {
        angle: 180,
        percent: 0.75,
        value: 40
      }
    ],
    cities: [
      {
        size: 2,
        name: {
          name: "Takamatsu"
        },
        companies: [
          {
            label: "TKER",
            color: "red"
          }
        ]
      }
    ],
    track: [{ side: 1 }, { side: 2 }, { side: 6 }]
  },
  "448": {
    color: "brown",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 40
      }
    ],
    cities: [
      {
        size: 2
      }
    ],
    track: [{ side: 1 }, { side: 4 }, { side: 2 }, { side: 3 }]
  },
  "465": {
    color: "brown",
    values: [
      {
        angle: 210,
        percent: 0.9,
        value: 60
      }
    ],
    cities: [
      {
        size: 3,
        rotation: 180,
        name: {
          name: "Kochi",
          offset: 95,
          y: -3
        },
        companies: [
          {},
          {},
          {
            label: "TER",
            color: "cyan"
          }
        ]
      }
    ],
    track: [{ side: 1 }, { side: 2 }, { side: 3 }, { side: 6 }]
  },
  "466": {
    color: "brown",
    values: [
      {
        angle: 180,
        percent: 0.75,
        value: 60
      }
    ],
    cities: [
      {
        size: 2,
        name: {
          name: "Takamatsu"
        },
        companies: [
          {
            label: "TKER",
            color: "red"
          }
        ]
      }
    ],
    track: [{ side: 1 }, { side: 2 }, { side: 6 }]
  },
  "492": {
    color: "brown",
    values: [
      {
        angle: 210,
        percent: 0.9,
        value: 80
      }
    ],
    cities: [
      {
        size: 3,
        rotation: 180,
        name: {
          name: "Kotohira",
          reverse: true,
          offset: 75,
          y: 12,
          textLength: "20%"
        }
      }
    ],
    track: [
      { side: 1 },
      { side: 2 },
      { side: 3 },
      { side: 4 },
      { side: 5 },
      { side: 6 }
    ]
  },

  // 1849
  "73": {
    color: "yellow",
    values: [
      {
        angle: -120,
        percent: 0.2,
        value: 10
      }
    ],
    towns: [
      {
        angle: 60,
        percent: 0.288675,
        rotate: -30
      }
    ],
    track: [
      {
        type: "gentle",
        side: 1,
        gauge: "narrow"
      }
    ]
  },
  "74": {
    color: "yellow",
    values: [
      {
        angle: -90,
        percent: 0.45,
        value: 10
      }
    ],
    towns: [{}],
    track: [
      {
        type: "straight",
        side: 1,
        gauge: "narrow"
      }
    ]
  },
  "77": {
    color: "yellow",
    track: [{ type: "sharp", side: 1, gauge: "narrow" }]
  },
  "78": {
    color: "yellow",
    track: [{ type: "gentle", side: 1, gauge: "narrow" }]
  },
  "79": {
    color: "yellow",
    track: [{ type: "straight", side: 1, gauge: "narrow" }]
  },
  "644": {
    color: "yellow",
    track: [
      {
        side: 1,
        gauge: "narrow"
      },
      {
        side: 2
      }
    ],
    values: [
      {
        angle: 210,
        percent: 0.7,
        value: 20
      }
    ],
    cities: [{}]
  },
  "645": {
    color: "yellow",
    track: [
      {
        side: 1,
        gauge: "narrow"
      },
      {
        side: 3
      }
    ],
    values: [
      {
        angle: 210,
        percent: 0.7,
        value: 20
      }
    ],
    cities: [{}]
  },
  "657": {
    color: "yellow",
    values: [
      {
        angle: 210,
        percent: 0.75,
        value: 20
      }
    ],
    cities: [{}],
    track: [
      {
        side: 1,
        gauge: "narrow"
      },
      { side: 4 }
    ]
  },
  "658": {
    color: "yellow",
    track: [
      {
        side: 1
      },
      {
        side: 3,
        gauge: "narrow"
      }
    ],
    values: [
      {
        angle: 210,
        percent: 0.7,
        value: 20
      }
    ],
    cities: [{}]
  },
  "659": {
    color: "yellow",
    track: [
      {
        side: 1
      },
      {
        side: 2,
        gauge: "narrow"
      }
    ],
    values: [
      {
        angle: 210,
        percent: 0.7,
        value: 20
      }
    ],
    cities: [{}]
  },
  "679": {
    color: "yellow",
    values: [
      {
        value: 10
      }
    ],
    towns: [
      {
        angle: 30,
        percent: 0.57735,
        rotation: -60
      }
    ],
    track: [
      {
        type: "sharp",
        side: 1,
        gauge: "narrow"
      }
    ]
  },
  "624": {
    color: "green",
    track: [{ type: "sharp", side: 1 }, { type: "sharp", side: 2 }]
  },
  "650": {
    color: "green",
    track: [
      { type: "sharp", side: 1, gauge: "narrow" },
      { type: "sharp", side: 2, gauge: "narrow" }
    ]
  },
  "677": {
    color: "green",
    track: [
      {
        type: "straight",
        side: 1,
        gauge: "narrow"
      },
      {
        type: "gentle",
        side: 5,
        gauge: "narrow"
      }
    ]
  },
  "678": {
    color: "green",
    track: [
      {
        type: "straight",
        side: 1,
        gauge: "narrow"
      },
      {
        type: "gentle",
        side: 1,
        gauge: "narrow"
      }
    ]
  },
  "699": {
    color: "green",
    track: [
      {
        type: "gentle",
        side: 1,
        gauge: "narrow"
      },
      {
        type: "gentle",
        side: 5,
        gauge: "narrow"
      }
    ]
  },
  "660": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 30
      }
    ],
    cities: [{ size: 2 }],
    track: [
      {
        type: "city",
        side: 1
      },
      {
        type: "city",
        side: 2,
        gauge: "narrow"
      },
      {
        type: "city",
        side: 4
      },
      {
        type: "city",
        side: 5,
        gauge: "narrow"
      }
    ]
  },
  "661": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 30
      }
    ],
    cities: [{ size: 2 }],
    track: [
      {
        type: "city",
        side: 1,
        gauge: "narrow"
      },
      {
        type: "city",
        side: 2
      },
      {
        type: "city",
        side: 4,
        gauge: "narrow"
      },
      {
        type: "city",
        side: 5
      }
    ]
  },
  "662": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 30
      }
    ],
    cities: [{ size: 2 }],
    track: [
      {
        type: "city",
        side: 1,
        gauge: "narrow"
      },
      {
        type: "city",
        side: 2,
        gauge: "narrow"
      },
      {
        type: "city",
        side: 4
      },
      {
        type: "city",
        side: 5
      }
    ]
  },
  "663": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 30
      }
    ],
    cities: [{ size: 2 }],
    track: [
      {
        type: "city",
        side: 1,
        gauge: "narrow"
      },
      {
        type: "city",
        side: 2
      },
      {
        type: "city",
        side: 4
      },
      {
        type: "city",
        side: 5,
        gauge: "narrow"
      }
    ]
  },
  "672": {
    color: "brown",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 40
      }
    ],
    cities: [{ size: 2 }],
    track: [
      {
        side: 1,
        gauge: "double"
      },
      {
        side: 2,
        gauge: "double"
      },
      {
        side: 4,
        gauge: "double"
      },
      {
        side: 5,
        gauge: "double"
      }
    ]
  },
  "673": {
    color: "brown",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 40
      }
    ],
    cities: [{ size: 2 }],
    track: [
      {
        side: 1,
        gauge: "double"
      },
      {
        side: 2,
        gauge: "double"
      },
      {
        side: 3,
        gauge: "double"
      },
      {
        side: 4,
        gauge: "double"
      }
    ]
  },
  "674": {
    color: "brown",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 40
      }
    ],
    cities: [{ size: 2 }],
    track: [
      {
        side: 1,
        gauge: "double"
      },
      {
        side: 3,
        gauge: "double"
      },
      {
        side: 4,
        gauge: "double"
      },
      {
        side: 5,
        gauge: "double"
      }
    ]
  },
  "696": {
    color: "brown",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 20
      }
    ],
    centerTowns: [{}],
    track: [
      {
        side: 1,
        gauge: "double"
      },
      {
        side: 2,
        gauge: "double"
      },
      {
        side: 4,
        gauge: "double"
      },
      {
        side: 5,
        gauge: "double"
      }
    ]
  },
  "697": {
    color: "brown",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 20
      }
    ],
    centerTowns: [{}],
    track: [
      {
        side: 1,
        gauge: "double"
      },
      {
        side: 2,
        gauge: "double"
      },
      {
        side: 3,
        gauge: "double"
      },
      {
        side: 4,
        gauge: "double"
      }
    ]
  },
  "698": {
    color: "brown",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 20
      }
    ],
    centerTowns: [{}],
    track: [
      {
        side: 1,
        gauge: "double"
      },
      {
        side: 3,
        gauge: "double"
      },
      {
        side: 4,
        gauge: "double"
      },
      {
        side: 5,
        gauge: "double"
      }
    ]
  }
};

export default tiles;
