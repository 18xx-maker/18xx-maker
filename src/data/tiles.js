const tiles = {
  // 1830 Tiles
  "1": {
    color: "yellow",
    values: [
      {
        x: 25,
        y: 45,
        value: 10
      },
      {
        x: -25,
        y: -45,
        value: 10
      }
    ],
    towns: [
      {
        x: -40,
        y: -5,
        rotate: 75
      },
      {
        x: 40,
        y: 5,
        rotate: 75
      }
    ],
    track: [
      {
        start: 1,
        end: 3
      },
      {
        start: 4,
        end: 6
      }
    ]
  },
  "2": {
    color: "yellow",
    values: [
      {
        x: 45,
        y: -28,
        value: 10
      },
      {
        x: -41,
        y: 33,
        value: 10
      }
    ],
    towns: [
      {
        x: -40,
        y: 0,
        rotate: 90
      },
      {
        x: 22,
        y: -50,
        rotate: 60
      }
    ],
    track: [
      {
        start: 1,
        end: 4
      },
      {
        start: 2,
        end: 3
      }
    ]
  },
  "3": {
    color: "yellow",
    values: [
      {
        x: -10,
        y: -5,
        value: 10
      }
    ],
    towns: [
      {
        x: -38,
        y: -22,
        rotate: 30
      }
    ],
    track: [
      {
        start: 1,
        end: 2
      }
    ]
  },
  "4": {
    color: "yellow",
    values: [
      {
        y: 33,
        value: 10
      }
    ],
    towns: [
      {
        x: 0,
        y: 0,
        rotate: 90
      }
    ],
    track: [
      {
        start: 1,
        end: 4
      }
    ]
  },
  "7": {
    color: "yellow",
    track: [
      {
        start: 1,
        end: 2
      }
    ]
  },
  "8": {
    color: "yellow",
    track: [
      {
        start: 1,
        end: 3
      }
    ]
  },
  "9": {
    color: "yellow",
    track: [
      {
        start: 1,
        end: 4
      }
    ]
  },
  "14": {
    color: "green",
    values: [
      {
        x: 50,
        y: 28,
        value: 30
      }
    ],
    cities: [{ size: 2 }],
    track: [
      {
        start: 1
      },
      {
        start: 2
      },
      {
        start: 4
      },
      {
        start: 5
      }
    ]
  },
  "15": {
    color: "green",
    values: [
      {
        x: 50,
        y: 28,
        value: 30
      }
    ],
    cities: [{ size: 2 }],
    track: [
      {
        start: 1
      },
      {
        start: 2
      },
      {
        start: 3
      },
      {
        start: 4
      }
    ]
  },
  "16": {
    color: "green",
    track: [
      {
        start: 1,
        end: 3,
        cross: "over"
      },
      {
        start: 2,
        end: 4,
        cross: "under"
      }
    ]
  },
  "18": {
    color: "green",
    track: [
      {
        start: 1,
        end: 4
      },
      {
        start: 2,
        end: 3
      }
    ]
  },
  "19": {
    color: "green",
    track: [
      {
        start: 1,
        end: 4,
        cross: "over"
      },
      {
        start: 6,
        end: 2,
        cross: "under"
      }
    ]
  },
  "20": {
    color: "green",
    track: [
      {
        start: 1,
        end: 4,
        cross: "over"
      },
      {
        start: 2,
        end: 5,
        cross: "under"
      }
    ]
  },
  "23": {
    color: "green",
    track: [
      {
        start: 1,
        end: 4
      },
      {
        start: 5,
        end: 1
      }
    ]
  },
  "24": {
    color: "green",
    track: [
      {
        start: 1,
        end: 4
      },
      {
        start: 1,
        end: 3
      }
    ]
  },
  "25": {
    color: "green",
    track: [
      {
        start: 1,
        end: 3
      },
      {
        start: 5,
        end: 1
      }
    ]
  },
  "26": {
    color: "green",
    track: [
      {
        start: 1,
        end: 4
      },
      {
        start: 6,
        end: 1
      }
    ]
  },
  "27": {
    color: "green",
    track: [
      {
        start: 1,
        end: 4
      },
      {
        start: 1,
        end: 2
      }
    ]
  },
  "28": {
    color: "green",
    track: [
      {
        start: 5,
        end: 1
      },
      {
        start: 6,
        end: 1
      }
    ]
  },
  "29": {
    color: "green",
    track: [
      {
        start: 1,
        end: 2
      },
      {
        start: 1,
        end: 3
      }
    ]
  },
  "39": {
    color: "brown",
    track: [
      {
        start: 1,
        end: 2
      },
      {
        start: 1,
        end: 3
      },
      {
        start: 2,
        end: 3
      }
    ]
  },
  "40": {
    color: "brown",
    track: [
      {
        start: 1,
        end: 3
      },
      {
        start: 3,
        end: 5
      },
      {
        start: 5,
        end: 1
      }
    ]
  },
  "41": {
    color: "brown",
    track: [
      {
        start: 1,
        end: 4
      },
      {
        start: 4,
        end: 5
      },
      {
        start: 5,
        end: 1
      }
    ]
  },
  "42": {
    color: "brown",
    track: [
      {
        start: 1,
        end: 4
      },
      {
        start: 1,
        end: 3
      },
      {
        start: 3,
        end: 4
      }
    ]
  },
  "43": {
    color: "brown",
    track: [
      {
        start: 1,
        end: 4
      },
      {
        start: 1,
        end: 3,
        cross: "over"
      },
      {
        start: 2,
        end: 4,
        cross: "under"
      },
      {
        start: 2,
        end: 3
      }
    ]
  },
  "44": {
    color: "brown",
    track: [
      {
        start: 1,
        end: 4,
        cross: "over"
      },
      {
        start: 2,
        end: 5,
        cross: "under"
      },
      {
        start: 1,
        end: 2
      },
      {
        start: 4,
        end: 5
      }
    ]
  },
  "45": {
    color: "brown",
    track: [
      {
        start: 1,
        end: 4,
        cross: "under"
      },
      {
        start: 6,
        end: 2,
        cross: "over"
      },
      {
        start: 2,
        end: 4
      },
      {
        start: 6,
        end: 1
      }
    ]
  },
  "46": {
    color: "brown",
    track: [
      {
        start: 1,
        end: 4,
        cross: "under"
      },
      {
        start: 6,
        end: 2,
        cross: "over"
      },
      {
        start: 1,
        end: 2
      },
      {
        start: 4,
        end: 6
      }
    ]
  },
  "47": {
    color: "brown",
    track: [
      {
        start: 1,
        end: 4,
        cross: "over"
      },
      {
        start: 2,
        end: 5,
        cross: "under"
      },
      {
        start: 2,
        end: 4
      },
      {
        start: 5,
        end: 1
      }
    ]
  },
  "53": {
    color: "green",
    values: [
      {
        x: 50,
        y: 28,
        value: 50
      }
    ],
    label: {
      label: "B",
      x: 50,
      y: -25
    },
    cities: [{ size: 1 }],
    track: [
      {
        start: 1
      },
      {
        start: 3
      },
      {
        start: 5
      }
    ]
  },
  "54": {
    color: "green",
    values: [
      {
        x: 35,
        y: -30,
        value: 60
      },
      {
        x: -35,
        y: -30,
        value: 60
      }
    ],
    label: {
      label: "NY",
      y: -40
    },
    cities: [
      {
        x: -35,
        y: 20
      },
      {
        x: 35,
        y: 20
      }
    ],
    track: [
      {
        start: 6,
        end: 1
      },
      {
        start: 4,
        end: 5
      }
    ]
  },
  "55": {
    color: "yellow",
    values: [
      {
        value: 10,
        x: -5,
        y: 55
      },
      {
        value: 10,
        x: -45,
        y: 33
      }
    ],
    towns: [
      {
        x: 22,
        y: 38,
        rotate: 150
      },
      {
        x: -45,
        y: 0,
        rotate: 90
      }
    ],
    track: [
      {
        start: 1,
        end: 4,
        cross: "over"
      },
      {
        start: 2,
        end: 5,
        cross: "under"
      }
    ]
  },
  "56": {
    color: "yellow",
    values: [
      {
        value: 10,
        x: 30,
        y: 30
      },
      {
        value: 10,
        x: -30,
        y: 30
      }
    ],
    towns: [
      {
        x: -50,
        y: -3,
        rotate: 80
      },
      {
        x: 50,
        y: -3,
        rotate: 100
      }
    ],
    track: [
      {
        start: 1,
        end: 3,
        cross: "over"
      },
      {
        start: 2,
        end: 4,
        cross: "under"
      }
    ]
  },
  "57": {
    color: "yellow",
    values: [
      {
        x: 50,
        y: 28,
        value: 20
      }
    ],
    cities: [{ size: 1 }],
    track: [
      {
        start: 1,
        end: 4
      }
    ]
  },
  "58": {
    color: "yellow",
    values: [
      {
        x: 8,
        y: 10,
        value: 10
      }
    ],
    towns: [
      {
        x: -8,
        y: -18,
        rotate: 60
      }
    ],
    track: [
      {
        start: 1,
        end: 3
      }
    ]
  },
  "59": {
    color: "green",
    values: [
      {
        x: 50,
        y: 15,
        value: 40
      },
      {
        x: 0,
        y: 45,
        value: 40
      }
    ],
    label: {
      label: "OO",
      x: -17,
      y: -43
    },
    cities: [
      {
        x: -38,
        y: 7
      },
      {
        x: 25,
        y: -30
      }
    ],
    track: [
      {
        end: 1
      },
      {
        end: 3
      }
    ]
  },
  "61": {
    color: "brown",
    values: [
      {
        x: 50,
        y: 28,
        value: 60
      }
    ],
    label: {
      label: "B",
      x: 50,
      y: -25
    },
    cities: [{ size: 1 }],
    track: [
      {
        start: 1
      },
      {
        start: 3
      },
      {
        start: 4
      },
      {
        start: 5
      }
    ]
  },
  "62": {
    color: "brown",
    values: [
      {
        x: 40,
        y: 22,
        rotate: 30,
        value: 80
      },
      {
        x: -40,
        y: -22,
        rotate: 30,
        value: 80
      }
    ],
    label: {
      label: "NY",
      rotate: 30
    },
    cities: [
      {
        x: 22,
        y: -38,
        size: 2,
        rotate: 30
      },
      {
        x: -22,
        y: 38,
        size: 2,
        rotate: 30
      }
    ],
    track: [
      {
        start: 5,
        end: 6
      },
      {
        start: 3,
        end: 4
      }
    ]
  },
  "63": {
    color: "brown",
    values: [
      {
        x: 50,
        y: 28,
        value: 40
      }
    ],
    cities: [{ size: 2 }],
    track: [
      {
        start: 1
      },
      {
        start: 2
      },
      {
        start: 3
      },
      {
        start: 4
      },
      {
        start: 5
      },
      {
        start: 6
      }
    ]
  },
  "64": {
    color: "brown",
    values: [
      {
        x: -42,
        y: -22,
        value: 50
      },
      {
        x: -35,
        y: 38,
        value: 50
      }
    ],
    label: {
      label: "OO",
      x: 50,
      y: -15
    },
    cities: [
      {
        y: -40
      },
      {
        y: 35,
        x: 15
      }
    ],
    track: [
      {
        start: 5,
        end: 1
      },
      {
        start: 2,
        end: 3
      }
    ]
  },
  "65": {
    color: "brown",
    values: [
      {
        x: -35,
        y: -35,
        value: 50
      },
      {
        x: -50,
        y: 30,
        value: 50
      }
    ],
    label: {
      label: "OO",
      x: 50,
      y: 15
    },
    cities: [
      {
        y: 40
      },
      {
        y: -35,
        x: 15
      }
    ],
    track: [
      {
        start: 1,
        end: 3
      },
      {
        start: 5,
        end: 6
      }
    ]
  },
  "66": {
    color: "brown",
    values: [
      {
        x: -42,
        y: -24,
        value: 50
      },
      {
        x: 25,
        y: 45,
        value: 50
      }
    ],
    label: {
      label: "OO",
      x: -30,
      y: 35
    },
    cities: [
      {
        y: -40
      },
      {
        x: 44
      }
    ],
    track: [
      {
        start: 1,
        end: 4
      },
      {
        start: 2,
        end: 3
      }
    ]
  },
  "67": {
    color: "brown",
    values: [
      {
        x: -52,
        y: 26,
        value: 50
      },
      {
        x: 30,
        y: -45,
        value: 50
      }
    ],
    label: {
      label: "OO",
      x: 5,
      y: 40
    },
    cities: [
      {
        x: -20,
        y: -38
      },
      {
        x: 45
      }
    ],
    track: [
      {
        start: 1,
        end: 4,
        cross: "over"
      },
      {
        start: 6,
        end: 2,
        cross: "under"
      }
    ]
  },
  "68": {
    color: "brown",
    values: [{
      x: 0,
      y: 55,
      value: 50
    },{
      x: -45,
      y: 28,
      value: 50
    }],
    label: {
      label: "OO",
      x: 25,
      y: -47
    },
    cities: [
      {
        x: 44
      },
      {
        x: -18,
        y: -38
      }
    ],
    track: [
      {
        start: 1,
        end: 4,
        cross: "over"
      },
      {
        start: 2,
        end: 5,
        cross: "under"
      }
    ]
  },
  "69": {
    color: "yellow",
    values: [{
      x: 45,
      y: -32,
      value: 10
    },{
      x: 3,
      y: 50,
      value: 10
    }],
    towns: [
      {
        x: -26,
        y: 38,
        rotate: 18
      },
      {
        x: 45,
        y: 0,
        rotate: 90
      }
    ],
    track: [
      {
        start: 1,
        end: 4,
        cross: "over"
      },
      {
        start: 6,
        end: 2,
        cross: "under"
      }
    ]
  },
  "70": {
    color: "brown",
    track: [
      {
        start: 1,
        end: 2
      },
      {
        start: 1,
        end: 3,
        cross: "over"
      },
      {
        start: 2,
        end: 4,
        cross: "under"
      },
      {
        start: 3,
        end: 4
      }
    ]
  }
};

export default tiles;
