const tiles = {
  // 1830 Tiles
  "1": {
    color: "yellow",
    track: [
      {
        start: 1,
        end: 3,
        town: 10
      },
      {
        start: 4,
        end: 6,
        town: 10
      }
    ]
  },
  "2": {
    color: "yellow",
    track: [
      {
        start: 1,
        end: 4,
        town: 10
      },
      {
        start: 2,
        end: 3,
        town: 10
      }
    ]
  },
  "3": {
    color: "yellow",
    track: [
      {
        start: 1,
        end: 2,
        town: 10
      }
    ]
  },
  "4": {
    color: "yellow",
    track: [
      {
        start: 1,
        end: 4,
        town: 10
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
    city: [30, 2],
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
    city: [30, 2],
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
        cross: true
      },
      {
        start: 2,
        end: 4
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
        cross: true
      },
      {
        start: 6,
        end: 2
      }
    ]
  },
  "20": {
    color: "green",
    track: [
      {
        start: 1,
        end: 4,
        cross: true
      },
      {
        start: 2,
        end: 5
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
        cross: true
      },
      {
        start: 2,
        end: 4
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
        cross: true
      },
      {
        start: 2,
        end: 5
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
        cross: true
      },
      {
        start: 6,
        end: 2
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
        cross: true
      },
      {
        start: 6,
        end: 2
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
        cross: true
      },
      {
        start: 2,
        end: 5
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
    type: "B",
    city: 50,
    track: [{
      start: 1
    },{
      start: 3
    },{
      start: 5
    }]
  },
  "54": {
    color: "green",
    type: "NY",
    track: [{
      start: 1,
      end: 2,
      city: 60
    },{
      start: 3,
      end: 4,
      city: 60
    }]
  },
  "55": {
    color: "yellow",
    track: [{
      start: 1,
      end: 4,
      cross: true,
      town: 10
    },{
      start: 2,
      end: 5,
      town: 10
    }]
  },
  "56": {
    color: "yellow",
    track: [{
      start: 1,
      end: 3,
      cross: true,
      town: 10
    },{
      start: 2,
      end: 4,
      town: 10
    }]
  },
  "57": {
    color: "yellow",
    city: 20,
    track: [{
      start: 1,
      end: 4
    }]
  },
  "58": {
    color: "yellow",
    track: [{
      start: 1,
      end: 3,
      town: 10
    }]
  },
  "59": {},
  "61": {
    color: "brown",
    type: "B",
    city: 60,
    track: [{
      start: 1
    },{
      start: 3
    },{
      start: 4
    },{
      start: 5
    }]
  },
  "62": {
    color: "brown",
    type: "NY",
    track: [{
      start: 1,
      end: 2,
      city: 60
    },{
      start: 3,
      end: 4,
      city: 60
    }]
  },
  "63": {
    color: "brown",
    city: [40, 2],
    track: [{
      start: 1
    },{
      start: 2
    },{
      start: 3
    },{
      start: 4
    },{
      start: 5
    },{
      start: 6
    }]
  },
  "64": {
    color: "brown",
    type: "OO",
    track: [{
      start: 5,
      end: 1,
      city: 50
    },{
      start: 2,
      end: 3,
      city: 50
    }]
  },
  "65": {
    color: "brown",
    type: "OO",
    track: [{
      start: 5,
      end: 1,
      city: 50
    },{
      start: 3,
      end: 4,
      city: 50
    }]
  },
  "66": {
    color: "brown",
    type: "OO",
    track: [{
      start: 1,
      end: 4,
      city: 50
    },{
      start: 2,
      end: 3,
      city: 50
    }]
  },
  "67": {
    color: "brown",
    type: "OO",
    track: [{
      start: 1,
      end: 4,
      city: 50,
      cross: true
    },{
      start: 6,
      end: 2,
      city: 50
    }]
  },
  "68": {
    color: "brown",
    type: "OO",
    track: [{
      start: 1,
      end: 4,
      city: 50,
      cross: true
    },{
      start: 2,
      end: 5,
      city: 50
    }]
  },
  "69": {
    color: "yellow",
    track: [{
      start: 1,
      end: 4,
      town: 10,
      cross: true
    },{
      start: 6,
      end: 2,
      town: 10
    }]
  },
  "70": {
    color: "brown",
    track: [{
      start: 1,
      end: 2
    },{
      start: 1,
      end: 3,
      cross: true
    },{
      start: 2,
      end: 4
    },{
      start: 3,
      end: 4
    }]
  }
};

export default tiles;
