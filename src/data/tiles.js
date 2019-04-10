const tiles = {
  // 1830 Tiles
  "1": {
    color: "yellow",
    values: [{angle: 150, percent: 0.8, value: 10},
             {angle: -30, percent: 0.8, value: 10}],
    towns: [{x: -129.90375, y: 75, rotate: -45, angle: 225, percent: 1.73},
            {x: 129.90375, y: -75, rotate: -45, angle: 45, percent: 1.73}],
    track: [{type: "gentle", side: 1},
            {type: "gentle", side: 4}]
  },
  "2": {
    color: "yellow",
    values: [{angle: 215, percent: 0.75, value: 10},
             {angle: 30, percent: 0.667, value: 10}],
    towns: [{angle: 180, percent: 0.66},
            {rotation: 30, x: -86.6025, angle: -60, percent: 0.57735}],
    track: [{type: "straight", side: 1},
            {type: "sharp", side: 2}]
  },
  "3": {
    color: "yellow",
    values: [{value: 10}],
    towns: [{angle: 30, percent: 0.57735, rotation: -60}],
    track: [{type: "sharp", side: 1}]
  },
  "4": {
    color: "yellow",
    rotations: 3,
    values: [{angle: -90, percent: 0.50, value: 10}],
    towns: [{}],
    track: [{type: "straight", side: 1}]
  },
  "5": {
    color: "yellow",
    rotations: 3,
    track: [{side: 1}, {side: 2}],
    values: [{angle: 210, percent: 0.7, value: 20}],
    cities: [{}]
  },
  "6": {
    color: "yellow",
    track: [{side: 1}, {side: 3}],
    values: [{angle: 210, percent: 0.7, value: 20}],
    cities: [{}]
  },
  "7": {
    color: "yellow",
    track: [{type: "sharp", side: 1}]
  },
  "8": {
    color: "yellow",
    track: [{type: "gentle", side: 1}]
  },
  "9": {
    color: "yellow",
    rotations: 3,
    track: [{type: "straight", side: 1}]
  },
  "12": {
    color: "green",
    values: [{angle: 180, percent: 0.667, value: 30}],
    cities: [{}],
    track: [{ side: 1 }, { side: 2 }, { side: 6 }]
  },
  "13": {
    color: "green",
    rotations: 2,
    values: [{angle: 180, percent: 0.667, value: 30}],
    cities: [{}],
    track: [{ side: 1 }, { side: 3 }, { side: 5 }]
  },
  "14": {
    color: "green",
    rotations: 3,
    values: [{angle: 210, percent: 0.8, value: 30}],
    cities: [{ size: 2 }],
    track: [{side: 1}, {side: 2}, {side: 4}, {side: 5}]
  },
  "15": {
    color: "green",
    values: [{angle: 210, percent: 0.8, value: 30}],
    cities: [{ size: 2 }],
    track: [{side: 1}, {side: 2}, {side: 3}, {side: 4}]
  },
  "16": {
    color: "green",
    track: [{type: "gentle", side: 1, cross: "over"},
            {type: "gentle", side: 2, cross: "under"}]
  },
  "17": {
    color: "green",
    rotations: 3,
    track: [{type: "gentle", side: 1},
            {type: "gentle", side: 4}]
  },
  "18": {
    color: "green",
    track: [{type: "straight", side: 1},
            {type: "sharp", side: 2}]
  },
  "19": {
    color: "green",
    track: [{type: "straight", side: 1, cross: "over"},
            {type: "gentle", side: 6, cross: "under"}]
  },
  "20": {
    color: "green",
    rotations: 3,
    track: [{type: "straight", side: 1, cross: "over"},
            {type: "straight", side: 2, cross: "under"}]
  },
  "21": {
    color: "green",
    track: [{type: "gentle", side: 1},
            {type: "sharp", side: 4}]
  },
  "22": {
    color: "green",
    track: [{type: "gentle", side: 5},
            {type: "sharp", side: 3}]
  },
  "23": {
    color: "green",
    track: [{type: "straight", side: 1},
            {type: "gentle", side: 5}]
  },
  "24": {
    color: "green",
    track: [{type: "straight", side: 1},
            {type: "gentle", side: 1}]
  },
  "25": {
    color: "green",
    track: [{type: "gentle", side: 1},
            {type: "gentle", side: 5}]
  },
  "26": {
    color: "green",
    track: [{type: "straight", side: 1},
            {type: "sharp", side: 6}]
  },
  "27": {
    color: "green",
    track: [{type: "straight", side: 1},
            {type: "sharp", side: 1}]
  },
  "28": {
    color: "green",
    track: [{type: "gentle", side: 5},
            {type: "sharp", side: 6}]
  },
  "29": {
    color: "green",
    track: [{type: "gentle", side: 1},
            {type: "sharp", side: 1}]
  },
  "30": {
    color: "green",
    track: [{type: "gentle", side: 5},
            {type: "sharp", side: 1}]
  },
  "31": {
    color: "green",
    track: [{type: "gentle", side: 1},
            {type: "sharp", side: 6}]
  },
  "39": {
    color: "brown",
    track: [{type: "gentle", side: 1},
            {type: "sharp", side: 1},
            {type: "sharp", side: 2}]
  },
  "40": {
    color: "brown",
    rotations: 2,
    track: [{type: "gentle", side: 1},
            {type: "gentle", side: 3},
            {type: "gentle", side: 5}]
  },
  "41": {
    color: "brown",
    track: [{type: "straight", side: 1},
            {type: "sharp", side: 4},
            {type: "gentle", side: 5}]
  },
  "42": {
    color: "brown",
    track: [{type: "straight", side: 1},
            {type: "gentle", side: 1},
            {type: "sharp", side: 3}]
  },
  "43": {
    color: "brown",
    track: [{type: "straight", side: 1},
            {type: "gentle", side: 1, cross: "over"},
            {type: "gentle", side: 2, cross: "under"},
            {type: "sharp", side: 2}]
  },
  "44": {
    color: "brown",
    rotations: 3,
    track: [{type: "straight", side: 1, cross: "over"},
            {type: "straight", side: 2, cross: "under"},
            {type: "sharp", side: 1},
            {type: "sharp", side: 4}
           ]
  },
  "45": {
    color: "brown",
    track: [{type: "straight", side: 1, cross: "over"},
            {type: "gentle", side: 6, cross: "under"},
            {type: "gentle", side: 2},
            {type: "sharp", side: 6}]
  },
  "46": {
    color: "brown",
    track: [{type: "straight", side: 1, cross: "over"},
            {type: "gentle", side: 6, cross: "under"},
            {type: "sharp", side: 1},
            {type: "gentle", side: 4}]
  },
  "47": {
    color: "brown",
    rotations: 3,
    track: [{type: "straight", side: 1, cross: "over"},
            {type: "straight", side: 2, cross: "under"},
            {type: "gentle", side: 2},
            {type: "gentle", side: 5}]
  },
  "51": {
    color: "gray",
    cities: [{size: 2}],
    values: [{angle: 210, percent: 0.8, value: 50}],
    track: [{type: "city", side: 1},
            {type: "city", side: 2},
            {type: "city", side: 3},
            {type: "city", side: 5},
            {type: "city", side: 6}]
  },
  "53": {
    color: "green",
    rotations: 2,
    values: [{angle: 210, percent: 0.8, value: 50}],
    labels: [{label: "B", angle: 150, percent: 0.8}],
    cities: [{ size: 1 }],
    track: [{side: 1}, {side: 3}, {side: 5}]
  },
  "53|BA": {
    color: "green",
    rotations: 2,
    values: [{angle: 210, percent: 0.8, value: 50}],
    names: [{name: "Baltimore", rotate:60, angle: 60, percent: 0.5}],
    cities: [{ size: 1 }],
    track: [{side: 1}, {side: 3}, {side: 5}]
  },
  "54": {
    color: "green",
    values: [{angle: 90, percent: 0.7, value: 60},
             {angle: -30, percent: 0.7, value: 60}],
    labels: {label: "NY", angle: 30, percent: 0.5},
    cities: [{angle: 150, percent: 0.5},
             {angle: -90, percent: 0.5}],
    track: [{type: "sharp", side: 3}, {type: "sharp", side: 5}]
  },
  "55": {
    color: "yellow",
    values: [{value: 10, angle: 145, percent: 0.75},
             {value: 10, angle: 95, percent: 0.75}],
    towns: [{angle: 180, percent: 0.7},
            {angle: 60, percent: 0.7, rotation: 60}],
    track: [{type: "straight", side: 1, cross: "over"},
            {type: "straight", side: 2, cross: "under"}]
  },
  "56": {
    color: "yellow",
    values: [{x: -129.90375, y: 75, angle: 255, percent: 2.2, value: 10},
             {x: -129.90375, y: -75, angle: 285, percent: 2.2, value: 10}],
    towns: [{x: -129.90375, y: 75, rotate: -15, angle: 255, percent: 1.7216875},
            {x: -129.90375, y: -75, rotate: 15, angle: 285, percent: 1.7216875}],
    track: [{type: "gentle", side: 1, cross: "over"},
            {type: "gentle", side: 2, cross: "under"}]
  },
  "57": {
    color: "yellow",
    rotations: 3,
    values: [{angle: 210, percent: 0.75, value: 20}],
    cities: [{}],
    track: [{type: "straight"}]
  },
  "58": {
    color: "yellow",
    values: [{angle: -120, percent: 0.20, value: 10}],
    towns: [{angle: 60, percent: 0.28, rotate: -30}],
    track: [{type: "gentle", side: 1}]
  },
  "59": {
    color: "green",
    values: [{angle: 180, percent: 0.7, value: 40},
             {angle: -60, percent: 0.7, value: 40}],
    labels: {angle: 240, percent: 0.5, label: "OO"},
    cities: [{percent: 0.5},
             {angle: 120, percent: 0.5}],
    track: [{type: "stop", side: 1}, {type: "stop", side: 3}]
  },
  "61": {
    color: "brown",
    values: [{angle: 210, percent: 0.8, value: 60}],
    labels: {label: "B", angle: 150, percent: 0.8},
    cities: [{ size: 1 }],
    track: [{side: 1}, {side: 3}, {side: 4}, {side: 5}]
  },
  "61|BA": {
    color: "brown",
    values: [{angle: 210, percent: 0.8, value: 60}],
    names: [{name: "Baltimore", rotate:60, angle: 60, percent: 0.5}],
    cities: [{ size: 1 }],
    track: [{side: 1}, {side: 3}, {side: 4}, {side: 5}]
  },
  "62": {
    color: "brown",
    values: [{angle: 30, percent: 0.6, value: 80},
             {angle: 210, percent: 0.6, value: 80}],
    labels: {label: "NY", fixed: true, rotation: 120},
    cities: [{angle: 120, rotate: -60, percent: 0.57, size: 2},
             {angle: -60, rotate: -60, percent: 0.57, size: 2}],
    track: [{type: "sharp", side: 3},
            {type: "sharp", side: 5}]
  },
  "63": {
    color: "brown",
    rotations: 1,
    values: [{angle: 210, percent: 0.8, value: 40}],
    cities: [{ size: 2 }],
    track: [{side: 1}, {side: 2}, {side: 3},
            {side: 4}, {side: 5}, {side: 6}]
  },
  "64": {
    color: "brown",
    values: [{angle: 60, percent: 0.7, value: 50},
             {angle: 150, percent: 0.8, value: 50}],
    labels: {angle: -75, percent: 0.65, label: "OO"},
    cities: [{percent: 0.57735},
             {angle: 210, percent: 0.5}],
    track: [{type: "gentle", side: 1},
            {type: "sharp", side: 4}]
  },
  "65": {
    color: "brown",
    values: [{angle: 60, percent: 0.7, value: 50},
             {angle: -30, percent: 0.8, value: 50}],
    labels: {angle: 195, percent: 0.7, label: "OO"},
    cities: [{angle: 120, percent: 0.57735},
             {angle: 270, percent: 0.5}],
    track: [{type: "gentle", side: 1}, {type: "sharp", side: 5}]
  },
  "66": {
    color: "brown",
    values: [{angle: 240, percent: 0.7, value: 50},
             {angle: 30, percent: 0.7, value: 50}],
    labels: {angle: 300, percent: 0.5, label: "OO"},
    cities: [{angle: 180, percent: 0.6},
             {angle: 90, percent: 0.5}],
    track: [{type: "straight", side: 1},
            {type: "sharp", side: 2}]
  },
  "67": {
    color: "brown",
    values: [{angle: 120, percent: 0.7, value: 50},
             {angle: -25, percent: 0.8, value: 50}],
    labels: {label: "OO", angle: 270, percent: 0.7},
    cities: [{angle: 180, percent: 0.6},
             {angle: 60, percent: 0.57735}],
    track: [{type: "straight", side: 1, cross: "over"},
            {type: "gentle", side: 6, cross: "under"}]
  },
  "68": {
    color: "brown",
    values: [{angle: 120, percent: 0.7, value: 50},
             {angle: -30, percent: 0.7, value: 50}],
    labels: {label: "OO", angle: -90, percent: 0.7},
    cities: [{angle: 180, percent: 0.6},
             {angle: 60, percent: 0.6}],
    track: [{type: "straight", side: 1, cross: "over"},
            {type: "straight", side: 2, cross: "under"}]
  },
  "69": {
    color: "yellow",
    values: [{angle: 215, percent: 0.75, value: 10},
             {y: 150, angle: 165, percent: 2.2, value: 10}],
    towns: [{angle: 180, percent: 0.66},
            {y: 150, angle: 165, percent: 1.73, rotate: 75}],
    track: [{type: "straight", side: 1, cross: "over"},
            {type: "gentle", side: 6, cross: "under"}]
  },
  "70": {
    color: "brown",
    track: [{type: "sharp", side: 1},
            {type: "gentle", side: 1, cross: "over"},
            {type: "gentle", side: 2, cross: "under"},
            {type: "sharp", side: 3}]
  },
  "73": {
    color: "yellow",
    values: [{angle: -120, percent: 0.20, value: 10}],
    towns: [{angle: 60, percent: 0.28, rotate: -30}],
    track: [{type: "gentle", side: 1, gauge: "narrow", offset: 10}]
  },
  "74": {
    color: "yellow",
    rotations: 3,
    values: [{angle: -90, percent: 0.5, value: 10}],
    towns: [{}],
    track: [{type: "straight", side: 1, gauge: "narrow", offset: 3}]
  },
  "75": {
    color: "yellow",
    values: [{angle: 210, percent: 0.7, value: 20}],
    cities: [{}],
    track: [{side: 1, gauge: "narrow"},
            {side: 2, gauge: "narrow"}]
  },
  "76": {
    color: "yellow",
    values: [{angle: 210, percent: 0.7, value: 20}],
    cities: [{}],
    track: [{side: 1, gauge: "narrow"},
            {side: 3, gauge: "narrow"}]
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
    rotations: 3,
    track: [{ type: "straight", side: 1, gauge: "narrow" }]
  },
  "80": {
    color: "green",
    track: [{side:1},{side:6, type: "lawson" }]
  },
  "81": {
    color: "green",
    rotations: 2,
    track: [{side: 2}, {side: 4}, {side: 6} ]
  },
  "82": {
    color: "green",
    track: [{side: 2}, {side: 5}, {side: 6} ]
  },
  "83": {
    color: "green",
    track: [{ ide: 1}, {side: 2}, {side: 5} ]
  },
  "100": {
    color: "green",
    values: [{angle: 180, percent: 0.667, value: 30}],
    cities: [{}],
    track: [{ side: 1, gauge: "narrow" },
            { side: 2, gauge: "narrow" },
            { side: 6, gauge: "narrow" }]
  },
  "101": {
    color: "green",
    rotations: 2,
    values: [{angle: 180, percent: 0.667, value: 30}],
    cities: [{}],
    track: [{ side: 1, gauge: "narrow" },
            { side: 3, gauge: "narrow" },
            { side: 5, gauge: "narrow" }]
  },
  "115": {
    color: "yellow",
    values: [{angle: 210, percent: 0.75, value: 20}],
    cities: [{}],
    track: [{side: 1}]
  },
  "120": {
    color: "green",
    values: [{angle: 75, percent: 0.6, value: 60},
             {angle: -15, percent: 0.6, value: 60}],
    labels: {label: "T", angle: 30, percent: 0.2},
    cities: [{angle: 150, percent: 0.5},
             {angle: -90, percent: 0.5}],
    track: [{type: "sharp", side: 3}, {type: "sharp", side: 5}]
  },
  "121": {
    color: "green",
    rotations: 2,
    values: [{angle: 210, percent: 0.8, value: 50}],
    labels: [{label: "BL", angle: 150, percent: 0.8}],
    cities: [{size: 2}],
    track: [{side: 1}, {side: 3}, {side: 5}]
  },
  "121|BO": {
    color: "green",
    rotations: 2,
    values: [{angle: 210, percent: 0.8, value: 50}],
    cities: [{ size: 2, name:{name:"Boston",reverse:true,offset:33}}],
    track: [{side: 1}, {side: 3}, {side: 5}]
  },
  "122": {
    color: "brown",
    values: [{angle: 30, percent: 0.6, value: 80},
             {angle: 210, percent: 0.6, value: 80}],
    labels: {label: "T", fixed: true, rotation: 120},
    cities: [{angle: 120, rotate: -60, percent: 0.57, size: 2},
             {angle: -60, rotate: -60, percent: 0.57, size: 2}],
    track: [{type: "sharp", side: 3},
            {type: "sharp", side: 5}]
  },
  "123": {
    color: "gray",
    labels: [ { label: "H", angle: 270, percent: 0.87 } ],
    values: [ { angle: 210, percent: 0.87, value: 100 } ],
    cities: [{ size: 3, rotation: 180 }],
    track: [ { side: 2 }, {side: 3}, {side: 4}, {side: 5}, {side: 6} ]
  },
  "124": {
    color: "gray",
    labels: [ { label: "T", angle: 270, percent: 0.87 } ],
    values: [ { angle: 210, percent: 0.87, value: 100 } ],
    cities: [{ size: 4 }],
    track: [ { side: 2 }, {side: 3}, {side: 4}, {side: 5} ]
  },
  "125": {
    color: "brown",
    labels: [ { label: "L", angle: 270, percent: 0.87 } ],
    values: [ { angle: 210, percent: 0.87, value: 40 } ],
    cities: [{ size: 2 }],
    track: [ { side: 2 }, {side: 3}, {side: 4}, {side: 5}, {side: 6} ]
  },
  "126": {
    color: "brown",
    labels: [ { label: "L", angle: 270, percent: 0.87 } ],
    values: [ { angle: 210, percent: 0.87, value: 60 } ],
    cities: [{ size: 2 }],
    track: [ {side: 1}, {side: 2}, {side: 3}, {side: 4}, {side: 5}, {side: 6} ]
  },
  "127": {
    color: "brown",
    labels: [ { label: "B", angle: 270, percent: 0.87 } ],
    values: [ { angle: 210, percent: 0.87, value: 60 } ],
    cities: [{ size: 2 }],
    track: [ {side: 2}, {side: 3}, {side: 4}, {side: 5}, {side: 6} ]
  },
  "141": {
    color: "green",
    centerTowns: [{}],
    values: [{ value: 10, angle: 115, percent: 0.5 }],
    track: [{side: 1},{side:4},{side:5}]
  },
  "142": {
    color: "green",
    centerTowns: [{}],
    values: [{
      value: 10,
      angle: 240,
      percent: 0.5
    }],
    track: [{side: 1},{side:3},{side:4}]
  },
  "143": {
    color: "green",
    centerTowns: [{}],
    values: [{
      value: 10,
      angle: 240,
      percent: 0.5
    }],
    track: [{side: 1},{side:2},{side:3}]
  },
  "144": {
    color: "green",
    rotations: 2,
    centerTowns: [{}],
    values: [{
      value: 10,
      angle: 180,
      percent: 0.5
    }],
    track: [{side: 1},{side:3},{side:5}]
  },
  "145": {
    color: "brown",
    rotations: 3,
    values: [ { angle: 210, percent: 0.8, value: 20 } ],
    centerTowns: [{}],
    track: [ { side: 1, }, { side: 2, }, { side: 4, }, { side: 5, } ]
  },
  "146": {
    color: "brown",
    values: [ { angle: 210, percent: 0.8, value: 20 } ],
    centerTowns: [{}],
    track: [ { side: 1, }, { side: 4, }, { side: 5, }, { side: 6, } ]
  },
  "147": {
    color: "brown",
    values: [ { angle: 210, percent: 0.8, value: 20 } ],
    centerTowns: [{}],
    track: [ { side: 1, }, { side: 3, }, { side: 4, }, { side: 5, } ]
  },
  "170": {
    color: "brown",
    cities: [ { size: 2 } ],
    labels: { label: "P", angle: 150, percent: 0.8 },
    values: [ { angle: 210, percent: 0.8, value: 50 } ],
    track: [ { side: 1 }, { side: 2 }, { side: 3 }, { side: 4 }, { side: 5 } ]
  },
  "171": {
    color: "gray",
    rotations: 1,
    cities: [ { size: 3, rotate: 180 } ],
    values: [ { angle: 270, percent: 0.88, value: 60 } ],
    track: [ { side: 1 }, { side: 2 }, { side: 3 }, { side: 4 }, { side: 5 }, { side: 6 } ]
  },
  "172": {
    color: "gray",
    rotations: 1,
    cities: [ { size: 2 } ],
    values: [ { angle: 210, percent: 0.8, value: 60 } ],
    track: [ { side: 1 }, { side: 2 }, { side: 3 }, { side: 4 }, { side: 5 }, { side: 6 } ]
  },
  "190": {
    color: "green",
    rotations: 2,
    values: [{angle: -22, percent: 0.9, value: 40}],
    labels: [{angle: 145, percent: 0.92, label: "A"}],
    cities: [{angle: 60, percent: 0.55},
             {angle: 180, percent: 0.55},
             {angle: 300, percent: 0.55}],
    track: [{type: "straight", side: 1, cross: "over"},
            {type: "straight", side: 2, cross: "under"},
            {type: "straight", side: 3, cross: "under"}]
  },
  "191": {
    color: "brown",
    rotations: 1,
    values: [{angle: -90, percent: 0.9, value: 60}],
    labels: {angle: -270, percent: 0.9, label: "A"},
    cities: [{ size: 4 }],
    track: [{side: 1}, {side: 2}, {side: 3}, {side: 4}, {side: 5}, {side: 6}]
  },
  "193": {
    color: "brown",
    values: [{angle: 215, percent: 0.8, value: 40}],
    labels: [{angle: 270, percent: 0.9, label: "S"}],
    cities: [{ size: 2 }],
    track: [{side: 1}, {side: 2}, {side: 3}, {side: 4}]
  },
  "201": {
    color: "yellow",
    values: [ { angle: 210, percent: 0.75, value: 30 } ],
    labels: { label: "Y", angle: 155, percent: 0.75 },
    cities: [ { size: 1 } ],
    track: [ { side: 1 }, { side: 6 }, ]
  },
  "202": {
    color: "yellow",
    values: [ { angle: 210, percent: 0.75, value: 30 } ],
    labels: { label: "Y", angle: 155, percent: 0.75 },
    cities: [ { size: 1 } ],
    track: [ { side: 1 }, { side: 5 }, ]
  },
  "290": {
    color: "gray",
    cities: [{size: 3, rotate: 180}],
    values: [{angle: 270, percent: 0.88, value: 70}],
    labels: {label: "Z", angle: 330, percent: 0.88},
    track: [{side: 1}, {side: 2}, {side: 3}, {side: 4}, {side: 5}]
  },
  "291": {
    color: "yellow",
    cities: [{}],
    labels: {label: "Z", angle: 150, percent: 0.75},
    values: [{angle: 210, percent: 0.75, value: 40}],
    track: [{side: 1}, {side: 2}]
  },
  "292": {
    color: "yellow",
    cities: [{}],
    labels: {label: "Z", angle: 150, percent: 0.75},
    values: [{angle: 210, percent: 0.75, value: 40}],
    track: [{side: 1}, {side: 3}]
  },
  "293": {
    color: "yellow",
    rotations: 3,
    cities: [{}],
    labels: {label: "Z", angle: 150, percent: 0.75},
    values: [{angle: 210, percent: 0.75, value: 40}],
    track: [{side: 1}, {side: 4}]
  },
  "294": {
    color: "green",
    rotations: 3,
    values: [{angle: 210, percent: 0.75, value: 50}],
    labels: {label: "Z", angle: 150, percent: 0.75},
    cities: [{ size: 2 }],
    track: [{side: 1}, {side: 2}, {side: 4}, {side: 5}]
  },
  "295": {
    color: "green",
    values: [{angle: 210, percent: 0.75, value: 50}],
    labels: {label: "Z", angle: 150, percent: 0.75},
    cities: [{ size: 2 }],
    track: [{side: 1}, {side: 2}, {side: 3}, {side: 4}]
  },
  "296": {
    color: "green",
    values: [{angle: 210, percent: 0.75, value: 50}],
    labels: {label: "Z", angle: 150, percent: 0.75},
    cities: [{ size: 2 }],
    track: [{side: 1}, {side: 3}, {side: 4}, {side: 5}]
  },
  "297": {
    color: "brown",
    values: [{angle: 210, percent: 0.9, value: 60}],
    labels: {label: "Z", angle: 150, percent: 0.9},
    cities: [{ size: 3, rotate: 180 }],
    track: [{side: 1}, {side: 2}, {side: 3}, {side: 4}, {side: 5}]
  },
  "298": {
    color: "green",
    labels: {angle: 30, percent: 0.7, label: "Chi"},
    values: [{angle: -10, percent: 0.7, rotation: -90, value: 40}],
    cities: [{angle: -60, percent: 0.75},
             {angle: -120, percent: 0.75, rotation: -90,
              companies: [{label: "C&WI", color: "white"}]},
             {angle: -180, percent: 0.75},
             {angle: -240, percent: 0.75}],
    track: [{type: "sharp", side: 2},

            {type: "gentle", side: 2},
            {type: "straight", side: 2},
            {type: "gentle", side: 6}]
  },
  "299": {
    color: "brown",
    labels: {angle: 30, percent: 0.7, label: "Chi"},
    values: [{angle: -10, percent: 0.7, rotation: -90, value: 70}],
    cities: [{angle: -60, percent: 0.75},
             {angle: -120, percent: 0.75},
             {angle: -180, percent: 0.75},
             {angle: -240, percent: 0.75}],
    track: [{type: "sharp", side: 2},
            {type: "gentle", side: 2},
            {type: "straight", side: 2},
            {type: "gentle", side: 6}]
  },
  "300": {
    color: "gray",
    labels: {angle: 30, percent: 0.7, label: "Chi"},
    values: [{angle: -10, percent: 0.7, rotation: -90, value: 90}],
    cities: [{angle: -60, percent: 0.75},
             {angle: -120, percent: 0.75},
             {angle: -180, percent: 0.75},
             {angle: -240, percent: 0.75}],
    track: [{type: "sharp", side: 2},
            {type: "gentle", side: 2},
            {type: "straight", side: 2},
            {type: "gentle", side: 6}]
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
  "611|JC": {
    color: "brown",
    values: [{angle: 210, percent: 0.8, value: 40}],
    labels: [{angle: 154, percent: 0.8, label: "JC"}],
    cities: [{ size: 2 }],
    track: [{side: 1}, {side: 2}, {side: 3}, {side: 4}, {side: 5}]
  },
  "619": {
    color: "green",
    values: [{angle: 210, percent: 0.8, value: 30}],
    cities: [{ size: 2 }],
    track: [{side: 1}, {side: 3}, {side: 4}, {side: 5}]
  },

  // 1889
  "437": {
    color: "yellow",
    icons: [{type: "port", angle: 60, percent: 0.73}],
    values: [{angle: -120, percent: 0.20, value: 30}],
    towns: [{angle: 60, percent: 0.28, rotate: -30}],
    track: [{type: "gentle", side: 1}]
  },
  "438": {
    color: "yellow",
    values: [{angle: 210, percent: 0.8, value: 40}],
    labels: [{label: "H", angle: 330, percent: 0.75}],
    cities: [{}],
    mountain: {angle: 150, percent: 0.8, cost: "80",
               size: "tiny", border: true},
    track: [{ side: 1 }, { side: 3 }]
  },
  "205": {
    color: "green",
    values: [{angle: 210, percent: 0.75, value: 30}],
    cities: [{}],
    track: [{ side: 1 }, { side: 2 }, { side: 4 }]
  },
  "206": {
    color: "green",
    values: [{angle: 210, percent: 0.75, value: 30}],
    cities: [{}],
    track: [{ side: 1 }, { side: 6 }, { side: 4 }]
  },
  "439": {
    color: "green",
    rotations: 3,
    values: [{angle: 210, percent: 0.8, value: 60}],
    mountain: {angle: 150, percent: 0.8, cost: "80", size: "tiny", border: true},
    labels: [{label: "H", angle: 330, percent: 0.75}],
    cities: [{ size: 2 }],
    track: [{ side: 1 }, { side: 3 }, { side: 5 }]
  },
  "440": {
    color: "green",
    values: [{angle: 150, percent: 0.8, value: 40}],
    labels: [{label: "T", angle: 330, percent: 0.8}],
    cities: [{size: 2, companies: [{label: "KO", color: "pink"}]}],
    track: [{ side: 1 }, { side: 2 }, { side: 3 }]
  },
  "441": {
    color: "yellow",
    values: [
      {
        angle: 210,
        percent: 0.75,
        value: 10
      }
    ],
    labels: [
      {
        label: "B",
        angle: 150,
        percent: 0.75
      }
    ],
    cities: [{ size: 1 }],
    track: [
      {
        side: 1
      }
    ]
  },
  "442": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 30
      }
    ],
    cities: [{ size: 2 }],
    labels: [{
      angle: 150,
      percent: 0.8,
      label: "B"
    }],
    track: [
      {
        side: 2
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
  "443": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 40
      }
    ],
    cities: [{ size: 2 }],
    labels: [{
      angle: 150,
      percent: 0.8,
      label: "M"
    }],
    track: [
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
  "444": {
    color: "brown",
    values: [{angle: 210, percent: 0.8, value: 50}],
    cities: [{ size: 2 }],
    labels: [{percent: 0.55, label: "B·M"}],
    track: [{side: 2}, {side: 3}, {side: 4}, {side: 5}, {side: 6}]
  },
  "445": {
    color: "yellow",
    values: [{angle: -120, percent: 0.20, value: 20}],
    towns: [{angle: 60, percent: 0.28, rotate: -30}],
    track: [{type: "gentle", side: 1}]
  },
  "446": {
    color: "gray",
    rotations: 1,
    values: [{angle: 210, percent: 0.9, value: 70}],
    labels: [{label: "B", angle: 335, percent: 0.82}],
    cities: [{size: 3}],
    track: [{ side: 1 }, { side: 2 }, { side: 3 }, { side: 4 }, { side: 5 }, { side: 6 }]
  },
  "448": {
    color: "brown",
    values: [{angle: 210, percent: 0.8, value: 40}],
    cities: [{size: 2}],
    track: [{ side: 1 }, { side: 2 }, { side: 3 }, { side: 4 }]
  },
  "449": {
    color: "brown",
    rotations: 3,
    values: [{angle: 210, percent: 0.8, value: 40}],
    cities: [{size: 2}],
    track: [{ side: 1 }, { side: 2 }, { side: 4 }, { side: 5 }]
  },
  "455": {
    color: "gray",
    rotations: 1,
    cities: [ { size: 3, rotate: 180 } ],
    values: [ { angle: 270, percent: 0.88, value: 50 } ],
    track: [ { side: 1 }, { side: 2 }, { side: 3 }, { side: 4 }, { side: 5 }, { side: 6 } ]
  },
  "465": {
    color: "brown",
    values: [{angle: 150, percent: 0.82, value: 60}],
    labels: [{label: "K", angle: 270, percent: 0.82}],
    cities: [{size: 3,
              rotation: 30,
              companies: [{label: "TR", color: "green"}]}],
    track: [{ side: 4 }, { side: 5 }, { side: 3 }, { side: 6 }]
  },
  "466": {
    color: "brown",
    values: [
      {
        angle: 150,
        percent: 0.8,
        value: 60
      }
    ],
    labels: [
      {
        label: "T",
        angle: 330,
        percent: 0.8
      }
    ],
    cities: [{size: 2, companies: [{label: "KO", color: "pink"}]}],
    track: [{ side: 1 }, { side: 2 }, { side: 3 }]
  },
  "470": {
    color: "yellow",
    values: [
      {
        angle: 300,
        percent: 0.667,
        value: 20
      }
    ],
    names: [{
      name: "Copper Canyon",
      angle: 90,
      percent: 0.35,
      rotation: -45
    }],
    towns: [{
      percent: 0.667,
      rotate: 10
    }],
    track: [{
      side: 1,
      type: "straight"
    },{
      side: 4,
      type: "sharp"
    },{
      side: 5,
      type: "gentle"
    }]
  },
  "471": {
    color: "yellow",
    values: [{
      angle: 150,
      percent: 0.8,
      value: 30
    },{
      angle: 315,
      percent: 0.7,
      value: 10
    }],
    cities: [{name: {offset: 25, name: "Mazatlán"}}],
    towns: [{
      angle: 270,
      rotation: 90,
      percent: 0.58
    }],
    track: [{
      side: 1
    },{
      side: 4
    },{
      side: 5.5,
      type: "mid"
    }]
  },
  "472": {
    color: "yellow",
    values: [{
      angle: 90,
      percent: 0.8,
      value: 20
    },{
      angle: 285,
      percent: 0.7,
      value: 10
    }],
    cities: [{name: {name: "Tampico"}}],
    towns: [{
      angle: 240,
      rotation: 60,
      percent: 0.58
    }],
    track: [{
      side: 1
    },{
      side: 2
    },{
      side: 3
    },{
      side: 5,
      type: "mid"
    }]
  },
  "473": {
    color: "yellow",
    values: [{
      angle: 90,
      percent: 0.8,
      value: 20
    },{
      angle: 285,
      percent: 0.7,
      value: 10
    }],
    cities: [{name: {name: "Veracruz"}}],
    towns: [{
      angle: 240,
      rotation: 60,
      percent: 0.58
    }],
    track: [{
      side: 1
    },{
      side: 3
    },{
      side: 5,
      type: "mid"
    }]
  },
  "474": {
    color: "green",
    values: [{
      value: 10,
      angle: 180,
      percent: 0.5
    }],
    centerTowns: [{}],
    track: [{side:1},{side:2},{side:3},{side:5},{side:6}]
  },
  "475": {
    color: "green",
    values: [{
      value: 30,
      angle: 330,
      percent: 0.8
    }],
    cities: [{name: {name: "Los Mochis"}}],
    track: [{side:1},{side:2},{side:6}]
  },
  "476": {
    color: "green",
    values: [{
      value: 30,
      angle: 270,
      percent: 0.8
    },{
      value: 10,
      angle: 75,
      percent: 0.7
    }],
    cities: [{name: {name: "Mazatlán"}}],
    towns: [{
      angle: 30,
      percent: 0.58,
      rotation: 30
    }],
    track: [{side: 1.5, type: "mid"},{side:3},{side:5},{side:6}]
  },
  "477": {
    color: "green",
    values: [{value: 30, angle: 90, percent: 0.8},
             {value: 10, angle: 255, percent: 0.7}],
    names: [{name: "Tampico", angle: 156, percent: 0.7}],
    cities: [{}],
    towns: [{angle: 210, percent: 0.58, rotation: 30}],
    track: [{side: 4.5, type: "mid"},{side:1},{side:2},{side:3},{side:6}]
  },
  "478": {
    color: "green",
    values: [{value: 30, angle: 180, percent: 0.7},
             {value: 20, angle: 325, percent: 0.8}],
    cities: [{size: 2,
              name: {reverse: true, offset: 31, name: "Veracruz"}}],
    towns: [{ percent: 0.58 }],
    track: [{side:1,type:"mid"},{side:3},{side:5}]
  },
  "479a": {
    color: "green",
    rotations: 1,
    values: [{value: 40, angle: 210, percent: 0.75}],
    cities: [{angle:300,percent:0.33,size:2,rotation:30,
              name: {name: "Mexico City", reverse: true},
              companies: [{color: "green", label: "NdM"}]}],
    centerTowns: [{angle: 120, percent: 0.65,
                   name: {name: "Toluca", rotation: 30}}],
    track: [{side:4},{side:6}]
  },
  "479b": {
    color: "green",
    rotations: 1,
    values: [{value: 10, angle: 256, percent: 0.7}],
    terrain: [{type: "mountain", cost: "$40", angle: 180, percent: 0.6}],
    towns: [{rotation: 120, angle: 300, percent: 0.5,
             name: {reverse: true, name: "Puebla"}}],
    track: [{side:3,type: "straight"}]
  },
  "480": {
    color: "brown",
    rotations: 1,
    names: [{angle: 210, percent: 0.8, rotation: 15, name: "Guadalajara", fontSize: 8}],
    values: [{value: 50, angle: 330, percent: 0.8}],
    cities: [{size:2}],
    track: [{side:1},{side:2},{side:3},{side:4},{side:5},{side:6}]
  },
  "481": {
    color: "brown",
    values: [{value: 40, angle: 330, percent: 0.8}],
    cities: [{size: 2, name: {name: "Los Mochis"}}],
    track: [{side:1},{side:2},{side:6}]
  },
  "482": {
    color: "brown",
    values: [{value: 40, angle: 270, percent: 0.85},
             {value: 20, angle: 68, percent: 0.75}],
    names: [{name: "Mazatlán", angle: -20, percent: 0.8}],
    cities: [{size:2,rotation:30}],
    towns: [{angle: 30, percent: 0.58, rotation: 30}],
    track: [{side: 1.5, type: "mid"},{side:3},{side:4},{side:5},{side:6}]
  },
  "483": {
    color: "brown",
    values: [{value: 40, angle: 90, percent: 0.8},
             {value: 20, angle: 255, percent: 0.7}],
    names: [{name: "Tampico", angle: 156, percent: 0.7}],
    cities: [{}],
    towns: [{angle: 210, percent: 0.58, rotation: 30}],
    track: [{side: 4.5, type: "mid"},{side:1},{side:2},{side:3},{side:6}]
  },
  "484": {
    color: "brown",
    values: [{value: 40, angle: 210, percent: 0.8},
             {value: 30, angle: 325, percent: 0.8}],
    cities: [{size: 2, name: {reverse: true, offset: 31, name: "Veracruz"}}],
    towns: [{ percent: 0.58 }],
    track: [{side:1,type:"mid"},{side:3},{side:4},{side:5}]
  },
  "485a": {
    color: "brown",
    rotations: 1,
    values: [{value: 60, angle: 210, percent: 0.8}],
    cities: [{angle:300,percent:0.333,size:2,rotation:30,
              extend: "right",
              name: {name: "Mexico City"},
              companies: [{color: "green", label: "NdM"}]}],
    towns: [{angle: 120, percent: 0.65, rotation: -60,
             name: {name: "Toluca"}}],
    track: [{side:1},{side:2},{side:3},{side:4},{side:6}]
  },
  "485b": {
    color: "brown",
    rotations: 1,
    values: [{value: 10, angle: 270, percent: 0.85}],
    cities: [{size:2,angle:120,percent:1,rotation:30}],
    towns: [{rotation: 120, angle: 300, percent: 0.5,
             name: {reverse: true, name: "Puebla"}}],
    track: [{side:3,type:"gentle"},{side:3,type: "straight"}]
  },
  "486a": {
    color: "brown",
    rotations: 1,
    values: [{value: 50, angle: 210, percent: 0.8}],
    cities: [{angle:300,percent:0.333,size:2,rotation:30,
              extend: "right",
              name: {name: "Mexico City"},
              companies: [{color: "green", label: "NdM"}]}],
    towns: [{angle: 120, percent: 0.65, rotation: -60,
             name: {name: "Toluca"}}],
    track: [{side:1},{side:2},{side:3},{side:4},{side:6}]
  },
  "486b": {
    color: "brown",
    rotations: 1,
    values: [{value: 10, angle: 265, percent: 0.82}],
    cities: [{angle:120,percent:0.333,size:2,rotation:30,extend:"left"}],
    towns: [{rotation: 120, angle: 300, percent: 0.6,
             name: {reverse: true, name: "Puebla"}}],
    track: [{side:3,type:"gentle"},{side:3,type: "straight"}]
  },
  "492": {
    color: "brown",
    rotations: 1,
    values: [{angle: 210, percent: 0.9, value: 80}],
    labels: [{label: "H", angle: 335, percent: 0.82}],
    cities: [{size:3}],
    track: [{side:1},{side:2},{side:3},{side:4},{side:5},{side:6}]
  },
  "513": {
    color: "gray",
    rotations: 1,
    cities: [ { size: 3, rotate: 180 } ],
    values: [ { angle: 270, percent: 0.9, value: 60 } ],
    track: [ { side: 1 }, { side: 2 }, { side: 3 }, { side: 4 }, { side: 5 }, { side: 6 } ]
  },
  "544": {
    color: "brown",
    rotations: 3,
    track: [ { side: 1, }, { side: 2, }, { side: 4, }, { side: 5, } ]
  },
  "545": {
    color: "brown",
    track: [ { side: 1, }, { side: 2, }, { side: 3, }, { side: 4, } ]
  },
  "546": {
    color: "brown",
    track: [ { side: 1, }, { side: 3, }, { side: 4, }, { side: 5, } ]
  },
  "576": {
    color: "green",
    values: [ { angle: 210, percent: 0.75, value: 40 } ],
    labels: { label: "Y", angle: 155, percent: 0.75 },
    cities: [{ size: 1 }],
    track: [ { side: 1 }, { side: 4 }, { side: 5 }, ]
  },
  "577": {
    color: "green",
    values: [ { angle: 210, percent: 0.75, value: 40 } ],
    labels: { label: "Y", angle: 155, percent: 0.75 },
    cities: [{ size: 1 }],
    track: [ { side: 1 }, { side: 3 }, { side: 4 }, ]
  },
  "578": {
    color: "green",
    values: [ { angle: 210, percent: 0.75, value: 40 } ],
    labels: { label: "Y", angle: 155, percent: 0.75 },
    cities: [{ size: 1 }],
    track: [ { side: 1 }, { side: 2 }, { side: 3 }, ]
  },
  "579": {
    color: "green",
    rotations: 2,
    values: [ { angle: 210, percent: 0.75, value: 40 } ],
    labels: { label: "Y", angle: 155, percent: 0.75 },
    cities: [{ size: 1 }],
    track: [ { side: 1 }, { side: 3 }, { side: 5 }, ]
  },
  "580": {
    color: "green",
    values: [ { angle: 135, percent: 0.7, value: 60 }, { angle: 45, percent: 0.7, value: 60 } ],
    labels: { label: "P", angle: 90, percent: 0.5 },
    cities: [ { angle: 210, percent: 0.5 },
              { angle: -30, percent: 0.5 } ],
    track: [ { type: "sharp", side: 4 }, { type: "sharp", side: 6 } ]
  },
  "581": {
    color: "green",
    rotations: 2,
    values: [ { angle: 210, percent: 0.7, value: 50 } ],
    labels: { label: "B-V", angle: 90, percent: 0.75 },
    cities: [ { angle: 270, percent: 0.5 },
              { angle: 30, percent: 0.5 },
              { angle: 150, percent: 0.5 } ],
    track: [ { type: "sharp", side: 1 }, { type: "sharp", side: 3 }, { type: "sharp", side: 5 } ]
  },
  "582": {
    color: "brown",
    values: [ { angle: 210, percent: 0.75, value: 50 } ],
    labels: { label: "Y", angle: 155, percent: 0.75 },
    cities: [{ size: 2 }],
    track: [ { side: 1 }, { side: 3 }, { side: 4 }, { side: 5 }, ]
  },
  "583": {
    color: "brown",
    values: [ { angle: 90, percent: 0.8, value: 80 }, { angle: 270, percent: 0.8, value: 80 } ],
    labels: { label: "P", angle: 0, percent: 0, size: "medium" },
    cities: [ { angle: 180, percent: 0.5, size: 2 },
              { percent: 0.5, size: 2 } ],
    track: [ { type: "sharp", side: 4 }, { type: "sharp", side: 6 } ]
  },
  "584": {
    color: "brown",
    rotations: 1,
    cities: [ { size: 3, rotate: 180 } ],
    labels: { label: "B-V", angle: 155, percent: 0.85 },
    values: [ { angle: 270, percent: 0.9, value: 60 } ],
    track: [ { side: 1 }, { side: 2 }, { side: 3 }, { side: 4 }, { side: 5 }, { side: 6 } ]
  },

  // 1849
  "644": {
    color: "yellow",
    track: [{side: 1, gauge: "narrow"}, {side: 2}],
    values: [{angle: 210, percent: 0.7, value: 20}],
    cities: [{}]
  },
  "645": {
    color: "yellow",
    track: [{side: 1, gauge: "narrow"}, {side: 3}],
    values: [{angle: 210, percent: 0.7, value: 20}],
    cities: [{}]
  },
  "646": {
    color: "brown",
    rotations: 2,
    track: [{type: "gentle", gauge: "narrow", side: 1},
            {type: "gentle", gauge: "narrow", side: 3},
            {type: "gentle", gauge: "narrow", side: 5}]
  },
  "647": {
    color: "brown",
    track: [{type: "gentle", gauge: "narrow", side: 1},
            {type: "sharp", gauge: "narrow", side: 1},
            {type: "sharp", gauge: "narrow", side: 2}]
  },
  "648": {
    color: "brown",
    track: [{type: "straight", gauge: "narrow", side: 1},
            {type: "sharp", gauge: "narrow", side: 4},
            {type: "gentle", gauge: "narrow", side: 5}]
  },
  "649": {
    color: "brown",
    track: [{type: "straight", gauge: "narrow", side: 1},
            {type: "gentle", gauge: "narrow", side: 1},
            {type: "sharp", gauge: "narrow", side: 3}]
  },
  "651": {
    color: "green",
    values: [{angle: 210, percent: 0.8, value: 90}],
    labels: [{label: "P", angle: 150, percent: 0.8}],
    cities: [{ size: 2 }],
    track: [{side: 1, gauge: "narrow"},
            {side: 2, gauge: "narrow"},
            {side: 3},
            {side: 4},
            {side: 6}]
  },
  "652": {
    color: "brown",
    values: [{angle: 210, percent: 0.8, value: 130}],
    labels: [{label: "P", angle: 150, percent: 0.8}],
    cities: [{ size: 2 }],
    track: [{side: 1, gauge: "double"},
            {side: 2, gauge: "double"},
            {side: 3, gauge: "double"},
            {side: 4},
            {side: 6, gauge: "double"}]
  },
  "653": {
    color: "green",
    values: [{angle: 210, percent: 0.8, value: 60}],
    labels: [{label: "C", angle: 150, percent: 0.8}],
    cities: [{ size: 2 }],
    track: [{side: 2},
            {side: 3, gauge: "narrow"},
            {side: 5}]
  },
  "654": {
    color: "brown",
    values: [{angle: 210, percent: 0.8, value: 90}],
    labels: [{label: "C", angle: 150, percent: 0.8}],
    cities: [{ size: 2 }],
    track: [{side: 1, gauge: "double"},
            {side: 2},
            {side: 3, gauge: "double"},
            {side: 5}]
  },
  "655": {
    color: "brown",
    rotations: 2,
    values: [{angle: 210, percent: 0.8, value: 50}],
    labels: [{label: "M", angle: 150, percent: 0.8}],
    cities: [{ size: 2 }],
    track: [{side: 1},
            {side: 3},
            {side: 5}]
  },
  "656": {
    color: "brown",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 80
      }
    ],
    labels: [
      {
        label: "M",
        angle: 150,
        percent: 0.8
      }
    ],
    cities: [{ size: 2 }],
    track: [
      {
        side: 1
      },
      {
        side: 2,
        gauge: "narrow"
      },
      {
        side: 3
      },
      {
        side: 5,
        gauge: "double"
      }
    ]
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
        offset: -3,
        gauge: "narrow"
      }
    ]
  },
  "680": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 10
      }
    ],
    centerTowns: [{}],
    track: [
      {
        side: 1,
        gauge: "narrow"
      },
      {
        side: 2,
        gauge: "narrow"
      },
      {
        side: 3
      },
      {
        side: 4
      }
    ]
  },
  "681": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 10
      }
    ],
    centerTowns: [{}],
    track: [
      {
        side: 1,
        gauge: "narrow"
      },
      {
        side: 2
      },
      {
        side: 3,
        gauge: "narrow"
      },
      {
        side: 4
      }
    ]
  },
  "682": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 10
      }
    ],
    centerTowns: [{}],
    track: [
      {
        side: 1,
        gauge: "narrow"
      },
      {
        side: 2
      },
      {
        side: 3
      },
      {
        side: 4,
        gauge: "narrow"
      }
    ]
  },
  "683": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 10
      }
    ],
    centerTowns: [{}],
    track: [
      {
        side: 1
      },
      {
        side: 2,
        gauge: "narrow"
      },
      {
        side: 3,
        gauge: "narrow"
      },
      {
        side: 4
      }
    ]
  },
  "684": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 10
      }
    ],
    centerTowns: [{}],
    track: [
      {
        side: 4
      },
      {
        side: 1,
        gauge: "narrow"
      },
      {
        side: 3,
        gauge: "narrow"
      },
      {
        side: 5
      }
    ]
  },
  "685": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 10
      }
    ],
    centerTowns: [{}],
    track: [
      {
        side: 3
      },
      {
        side: 1,
        gauge: "narrow"
      },
      {
        side: 5,
        gauge: "narrow"
      },
      {
        side: 4
      }
    ]
  },
  "686": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 10
      }
    ],
    centerTowns: [{}],
    track: [
      {
        side: 3
      },
      {
        side: 1,
        gauge: "narrow"
      },
      {
        side: 4,
        gauge: "narrow"
      },
      {
        side: 5
      }
    ]
  },
  "687": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 10
      }
    ],
    centerTowns: [{}],
    track: [
      {
        side: 1
      },
      {
        side: 3,
        gauge: "narrow"
      },
      {
        side: 5,
        gauge: "narrow"
      },
      {
        side: 4
      }
    ]
  },
  "688": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 10
      }
    ],
    centerTowns: [{}],
    track: [
      {
        side: 1
      },
      {
        side: 4,
        gauge: "narrow"
      },
      {
        side: 6,
        gauge: "narrow"
      },
      {
        side: 3
      }
    ]
  },
  "689": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 10
      }
    ],
    centerTowns: [{}],
    track: [
      {
        side: 3
      },
      {
        side: 1,
        gauge: "narrow"
      },
      {
        side: 6,
        gauge: "narrow"
      },
      {
        side: 4
      }
    ]
  },
  "690": {
    color: "green",
    rotations: 3,
    values: [{angle: 210, percent: 0.8, value: 10}],
    centerTowns: [{}],
    track: [{side: 3},
            {side: 1, gauge: "narrow"},
            {side: 4, gauge: "narrow"},
            {side: 6}]
  },
  "691": {
    color: "green",
    rotations: 3,
    values: [{angle: 210, percent: 0.8, value: 10}],
    centerTowns: [{}],
    track: [{side: 1},
            {side: 3, gauge: "narrow"},
            {side: 6, gauge: "narrow"},
            {side: 4}]
  },
  "692": {
    color: "green",
    track: [{type: "straight", gauge: "narrow", side: 1},
            {type: "sharp", gauge: "narrow", side: 6}]
  },
  "693": {
    color: "green",
    track: [{type: "straight", gauge: "narrow", side: 1},
            {type: "sharp", gauge: "narrow", side: 1}]
  },
  "694": {
    color: "green",
    track: [{type: "gentle", gauge: "narrow", side: 5},
            {type: "sharp", gauge: "narrow", side: 6}]
  },
  "695": {
    color: "green",
    track: [{type: "gentle", gauge: "narrow", side: 1},
            {type: "sharp", gauge: "narrow", side: 1}]
  },
  "624": {
    color: "green",
    track: [{ type: "sharp", side: 1 }, { type: "sharp", side: 2 }]
  },
  "625": {
    color: "green",
    track: [{ type: "sharp", side: 2 }, { type: "sharp", side: 6 }]
  },
  "626": {
    color: "green",
    rotations: 3,
    track: [{ type: "sharp", side: 2 }, { type: "sharp", side: 5 }]
  },
  "650": {
    color: "green",
    track: [
      { type: "sharp", side: 1, gauge: "narrow" },
      { type: "sharp", side: 2, gauge: "narrow" }
    ]
  },
  "675": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 20
      }
    ],
    labels: [
      {
        label: "S",
        angle: 150,
        percent: 0.8
      }
    ],
    cities: [{}],
    track: [
      {
        side: 3
      },
      {
        side: 4,
        gauge: "narrow"
      },
      {
        side: 5
      }
    ]
  },
  "676": {
    color: "brown",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 30
      }
    ],
    labels: [
      {
        label: "S",
        angle: 150,
        percent: 0.8
      }
    ],
    cities: [{ size: 2 }],
    track: [
      {
        side: 3,
        gauge: "double"
      },
      {
        side: 4,
        gauge: "double"
      },
      {
        side: 5
      }
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
  "700": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 10
      }
    ],
    centerTowns: [{}],
    track: [
      {
        side: 2,
        gauge: "narrow"
      },
      {
        side: 4,
        gauge: "narrow"
      },
      {
        side: 1
      },
      {
        side: 3
      }
    ]
  },
  "701": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 10
      }
    ],
    centerTowns: [{}],
    track: [
      {
        side: 3,
        gauge: "narrow"
      },
      {
        side: 4,
        gauge: "narrow"
      },
      {
        side: 1
      },
      {
        side: 2
      }
    ]
  },
  "702": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 10
      }
    ],
    centerTowns: [{}],
    track: [
      {
        side: 3,
        gauge: "narrow"
      },
      {
        side: 4,
        gauge: "narrow"
      },
      {
        side: 1
      },
      {
        side: 5
      }
    ]
  },
  "703": {
    color: "green",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 10
      }
    ],
    centerTowns: [{}],
    track: [
      {
        side: 4,
        gauge: "narrow"
      },
      {
        side: 5,
        gauge: "narrow"
      },
      {
        side: 1
      },
      {
        side: 3
      }
    ]
  },
  "704": {
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
        side: 4,
        gauge: "narrow"
      },
      {
        side: 5,
        gauge: "narrow"
      }
    ]
  },
  "705": {
    color: "green",
    values: [{angle: 210, percent: 0.8, value: 30}],
    cities: [{ size: 2 }],
    track: [{side: 1},
            {side: 5},
            {side: 4, gauge: "narrow"},
            {side: 3, gauge: "narrow"}]
  },
  "706": {
    color: "green",
    values: [{angle: 210, percent: 0.8, value: 30}],
    cities: [{ size: 2 }],
    track: [{side: 3},
            {side: 4},
            {side: 1, gauge: "narrow"},
            {side: 2, gauge: "narrow"}]
  },
  "707": {
    color: "green",
    values: [{angle: 210, percent: 0.8, value: 30}],
    cities: [{ size: 2 }],
    track: [{side: 2},
            {side: 4},
            {side: 1, gauge: "narrow"},
            {side: 3, gauge: "narrow"}]
  },
  "708": {
    color: "green",
    track: [{type: "gentle", gauge: "narrow", side: 5},
            {type: "sharp", gauge: "narrow", side: 1}]
  },
  "709": {
    color: "green",
    track: [{type: "gentle", gauge: "narrow", side: 1},
            {type: "sharp", gauge: "narrow", side: 6}]
  },
  "710": {
    color: "green",
    track: [{type: "gentle", gauge: "narrow", cross: "over", side: 1},
            {type: "gentle", cross: "under", side: 2}]
  },
  "711": {
    color: "green",
    track: [{type: "straight", gauge: "narrow", cross: "over", side: 1},
            {type: "gentle", cross: "under", side: 6}]
  },
  "712": {
    color: "green",
    track: [{type: "gentle", cross: "under", side: 1},
            {type: "gentle", gauge: "narrow", cross: "over", side: 2}]
  },
  "713": {
    color: "green",
    track: [{type: "straight", cross: "under", side: 1},
            {type: "gentle", gauge: "narrow", cross: "over", side: 6}]
  },
  "714": {
    color: "green",
    rotations: 3,
    track: [{type: "straight", cross: "under", side: 1},
            {type: "straight", gauge: "narrow", cross: "over", side: 2}]
  },
  "715": {
    color: "green",
    rotations: 3,
    track: [{type: "straight", gauge: "narrow", cross: "over", side: 1},
            {type: "straight", cross: "under", side: 2}]
  },
  "660": {
    color: "green",
    rotations: 3,
    values: [{angle: 210, percent: 0.8, value: 30}],
    cities: [{ size: 2 }],
    track: [{side: 1},
            {side: 2, gauge: "narrow"},
            {side: 4},
            {side: 5, gauge: "narrow"}]
  },
  "661": {
    color: "green",
    rotations: 3,
    values: [{angle: 210, percent: 0.8, value: 30}],
    cities: [{ size: 2 }],
    track: [{side: 1, gauge: "narrow"},
            {side: 2},
            {side: 4, gauge: "narrow"},
            {side: 5}]
  },
  "662": {
    color: "green",
    values: [{angle: 210, percent: 0.8, value: 30}],
    cities: [{ size: 2 }],
    track: [{side: 1, gauge: "narrow"},
            {side: 2, gauge: "narrow"},
            {side: 4},
            {side: 5}
           ]
  },
  "663": {
    color: "green",
    values: [{angle: 210, percent: 0.8, value: 30}],
    cities: [{ size: 2 }],
    track: [{type: "city", side: 1, gauge: "narrow"},
            {type: "city", side: 2},
            {type: "city", side: 4},
            {type: "city", side: 5, gauge: "narrow"}]
  },
  "664": {
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
        side: 2,
        gauge: "narrow"
      },
      {
        side: 3,
        gauge: "narrow"
      },
      {
        side: 4
      }
    ]
  },
  "665": {
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
        side: 1,
        gauge: "narrow"
      },
      {
        side: 2
      },
      {
        side: 3
      },
      {
        side: 4,
        gauge: "narrow"
      }
    ]
  },
  "666": {
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
        side: 2,
        gauge: "narrow"
      },
      {
        side: 3
      },
      {
        side: 4,
        gauge: "narrow"
      }
    ]
  },
  "667": {
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
        side: 2
      },
      {
        side: 3,
        gauge: "narrow"
      },
      {
        side: 4,
        gauge: "narrow"
      }
    ]
  },
  "668": {
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
        side: 4
      },
      {
        side: 3,
        gauge: "narrow"
      },
      {
        side: 5,
        gauge: "narrow"
      }
    ]
  },
  "669": {
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
        side: 3
      },
      {
        side: 5
      },
      {
        side: 1,
        gauge: "narrow"
      },
      {
        side: 4,
        gauge: "narrow"
      }
    ]
  },
  "670": {
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
        side: 3
      },
      {
        side: 4
      },
      {
        side: 1,
        gauge: "narrow"
      },
      {
        side: 5,
        gauge: "narrow"
      }
    ]
  },
  "671": {
    color: "green",
    values: [{angle: 210, percent: 0.8, value: 30}],
    cities: [{ size: 2 }],
    track: [{side: 4},
            {side: 5},
            {side: 1, gauge: "narrow"},
            {side: 3, gauge: "narrow"}]
  },

  "672": {
    color: "brown",
    rotations: 3,
    values: [{angle: 210, percent: 0.8, value: 40}],
    cities: [{ size: 2 }],
    track: [{side: 1, gauge: "double"},
            {side: 2, gauge: "double"},
            {side: 4, gauge: "double"},
            {side: 5, gauge: "double"}]
  },
  "673": {
    color: "brown",
    values: [{angle: 210, percent: 0.8, value: 40}],
    cities: [{ size: 2 }],
    track: [{side: 1, gauge: "double"},
            {side: 2, gauge: "double"},
            {side: 3, gauge: "double"},
            {side: 4, gauge: "double"}]
  },
  "674": {
    color: "brown",
    values: [{angle: 210, percent: 0.8, value: 40}],
    cities: [{ size: 2 }],
    track: [{side: 1, gauge: "double"},
            {side: 3, gauge: "double"},
            {side: 4, gauge: "double"},
            {side: 5, gauge: "double"}]
  },
  "696": {
    color: "brown",
    rotations: 3,
    values: [{angle: 210, percent: 0.8, value: 20}],
    centerTowns: [{}],
    track: [{side: 1, gauge: "double"},
            {side: 2, gauge: "double"},
            {side: 4, gauge: "double"},
            {side: 5, gauge: "double"}]
  },
  "697": {
    color: "brown",
    values: [{angle: 210, percent: 0.8, value: 20}],
    centerTowns: [{}],
    track: [{side: 1, gauge: "double"},
            {side: 2, gauge: "double"},
            {side: 3, gauge: "double"},
            {side: 4, gauge: "double"}]
  },
  "698": {
    color: "brown",
    values: [{angle: 210, percent: 0.8, value: 20}],
    centerTowns: [{}],
    track: [{side: 1, gauge: "double"},
            {side: 3, gauge: "double"},
            {side: 4, gauge: "double"},
            {side: 5, gauge: "double"}]
  },
  "741": {
    color: "yellow",
    labels: [{label: "£", angle: 30, percent: 0.1, size: 30}],
    towns: [{angle: 30, percent: 0.57735, rotation: -60, color: "halt"}],
    track: [{ type: "sharp", side: 1 }]
  },
  "742": {
    color: "yellow",
    labels: [{angle: 240, percent: 0.2, size: 30, label: "£"}],
    towns: [{angle: 60, percent: 0.28, rotate: -30, color: "halt"}],
    track: [{type: "gentle", side: 1}]
  },
  "743": {
    color: "yellow",
    rotations: 3,
    labels: [{angle: 270, percent: 0.45, size: 30, label: "£"}],
    towns: [{color: "halt"}],
    track: [{ type: "straight", side: 1 }]
  },
  "744": {
    color: "yellow",
    rotations: 3,
    labels: [{angle: 270, percent: 0.45, y: -25, size: 30, label: "£"},
             {angle: 270, percent: 0.45, y: 25, size: 30, label: "£"}],
    towns: [{percent: 0.333, color: "halt"},
            {angle: 180, percent: 0.333, color: "halt"}],
    track: [{ type: "straight", side: 1 }]
  },
  "745": {
    color: "yellow",
    labels: [{angle: 150, percent: 0.5, x: 5, size: 30, label: "£"},
             {angle: 330, percent: 0.5, x: 5, y: 5, size: 30, label: "£"}],
    towns: [{x: -129.88125, y: 75, angle: 225, percent: 1.73, rotate: -45, color: "halt"},
            {x: -129.88125, y: 75, angle: 255, percent: 1.73, rotate: -15, color: "halt"}],
    track: [{type: "gentle", side: 1}]
  },
  "746": {
    color: "yellow",
    rotations: 3,
    labels: [{label: "B", angle: 150, percent: 0.8}],
    values: [{angle: 210, percent: 0.75, value: 20}],
    cities: [{}],
    track: [{type: "straight"}]
  },
  "747": {
    color: "green",
    values: [{value: 10}],
    towns: [{angle: 30, percent: 0.57735, rotation: -60}],
    track: [{type: "sharp", side: 1}]
  },
  "748": {
    color: "green",
    values: [{angle: -120, percent: 0.2, value: 10}],
    towns: [{angle: 60, percent: 0.28, rotate: -30}],
    track: [{type: "gentle", side: 1}]
  },
  // Labeled 749 in 1860
  "1749": {
    color: "green",
    rotations: 3,
    values: [{angle: -90, percent: 0.50, value: 10}],
    towns: [{}],
    track: [{type: "straight", side: 1}]
  },
  "750": {
    color: "green",
    labels: [{label: "£", angle: 180, percent: 0.45, size: 30}],
    centerTowns: [{ color: "halt" }],
    track: [{ side: 1 }, { side: 2 }, { side: 6 }]
  },
  "751": {
    color: "green",
    labels: [{label: "£", angle: 90, percent: 0.45, size: 30}],
    centerTowns: [{ color: "halt" }],
    track: [{ side: 1 }, { side: 4 }, { side: 6 }]
  },
  "752": {
    color: "green",
    labels: [{label: "£", angle: 270, percent: 0.45, size: 30}],
    centerTowns: [{ color: "halt" }],
    track: [{ side: 1 }, { side: 4 }, { side: 2 }]
  },
  "753": {
    color: "green",
    rotations: 2,
    labels: [{label: "£", angle: 180, percent: 0.45, size: 30}],
    centerTowns: [{ color: "halt" }],
    track: [{ side: 1 }, { side: 3 }, { side: 5 }]
  },
  "754": {
    color: "green",
    labels: [{label: "£", angle: 90, percent: 0.45, y: -37.5, size: 30}],
    values: [{value: 10, angle: 90, percent: 0.5}],
    towns: [{color: "halt", angle: 180, percent: 0.5}],
    centerTowns: [{}],
    track: [{ side: 1 }, { side: 4 }, { side: 6 }]
  },
  "755": {
    color: "green",
    labels: [{label: "£", angle: 270, percent: 0.45, y: -37.5, size: 30}],
    values: [{value: 10, angle: -90, percent: 0.5}],
    towns: [{color: "halt", angle: 180, percent: 0.5}],
    centerTowns: [{}],
    track: [{ side: 1 }, { side: 4 }, { side: 2 }]
  },
  "756": {
    color: "green",
    track: [{side: 1}, {side: 2}],
    values: [{angle: 210, percent: 0.7, value: 30}],
    cities: [{}]
  },
  "757": {
    color: "green",
    rotations: 3,
    values: [{angle: 210, percent: 0.8, value: 20}],
    labels: [{label: "B", angle: 150, percent: 0.8}],
    cities: [{ size: 1 }],
    track: [{ side: 1 }, { side: 2 }, { side: 4 }, { side: 5 }]
  },
  "758": {
    color: "green",
    labels: [{label: "R", angle: 180, percent: 0.667}],
    track: [{side: 5}, {side: 6}],
    values: [{angle: 90, percent: 0.667, value: 50}],
    cities: [{}]
  },
  "759": {
    color: "green",
    values: [{angle: 210, percent: 0.75, value: 30}],
    cities: [{}],
    track: [{side: 1}]
  },
  "760": {
    color: "green",
    values: [{value: 40, angle: 210, percent: 0.75},
             {value: 40, angle: 330, percent: 0.75}],
    labels: [{label: "V", angle: 270, percent: 0.667}],
    cities: [{angle: 150, percent: 0.5},
             {angle: 30, percent: 0.5}],
    track: [{ type: "sharpStopRev", side: 2 }, { type: "sharpStop", side: 3 }]
  },
  "761": {
    color: "green",
    labels: [{label: "£", angle: 90, percent: 0.45, y: -50, size: 30},
             {label: "M", angle: 30, percent: 0.65}],
    values: [{angle: 330, percent: 0.75, value: 20}],
    towns: [{color: "halt", angle: 180, percent: 0.667}],
    cities: [{}],
    track: [{side: 1}, {side: 4}, {side: 5}, {side: 6}]
  },
  "762": {
    color: "green",
    values: [{angle: 210, percent: 0.8, value: 20}],
    labels: [{label: "B", angle: 150, percent: 0.8}],
    cities: [{ size: 1 }],
    track: [{ side: 1 }, { side: 2 }, { side: 3 }, { side: 4 }]
  },
  "763": {
    color: "green",
    values: [{angle: 150, percent: 0.8, value: 50},
             {value: 30, angle: -120, percent: 0.7}],
    labels: [{label: "N", angle: 90, percent: 0.8}],
    cities: [{ angle: 90, percent: 0.20 },
             { angle: -60, percent: 0.6 }],
    track: [{ side: 1 }, { side: 2 }, { side: 3 }, { side: 4 }, { side: 6, type: "stop" }]
  },
  "764": {
    color: "brown",
    values: [{value: 20}],
    towns: [{angle: 30, percent: 0.57735, rotation: -60}],
    track: [{type: "sharp", side: 1}]
  },
  "765": {
    color: "brown",
    rotations: 3,
    values: [{angle: -90, percent: 0.50, value: 20}],
    towns: [{}],
    track: [{type: "straight", side: 1}]
  },
  "766": {
    color: "brown",
    values: [{angle: -120, percent: 0.20, value: 20}],
    towns: [{angle: 60, percent: 0.28, rotate: -30}],
    track: [{type: "gentle", side: 1}]
  },
  "767": {
    color: "brown",
    values: [{angle: 210, percent: 0.8, value: 10}],
    centerTowns: [{}],
    track: [{side: 1}, {side: 2}, {side: 3}, {side: 4}]
  },
  "768": {
    color: "brown",
    rotations: 3,
    values: [{angle: 210, percent: 0.8, value: 10}],
    centerTowns: [{}],
    track: [{side: 1}, {side: 2}, {side: 4}, {side: 5}]
  },
  "769": {
    color: "brown",
    values: [{angle: 210, percent: 0.8, value: 10}],
    centerTowns: [{}],
    track: [{side: 1}, {side: 3}, {side: 4}, {side: 5}]
  },
  "770": {
    color: "brown",
    values: [
      {
        angle: 210,
        percent: 0.8,
        value: 30
      }
    ],
    labels: [
      {
        label: "B",
        angle: 150,
        percent: 0.8
      }
    ],
    cities: [{ size: 2 }],
    track: [{ side: 1 }, { side: 3 }, { side: 4 }, { side: 5 }, { side: 6 }]
  },
  "771": {
    color: "brown",
    values: [{angle: 180, percent: 0.667, value: 50}],
    cities: [{}],
    track: [{ side: 1 }, { side: 2 }, { side: 6 }]
  },
  "772": {
    color: "brown",
    track: [{side: 1}, {side: 2}],
    values: [{angle: 210, percent: 0.7, value: 40}],
    cities: [{}]
  },
  "773": {
    color: "brown",
    rotations: [60],
    values: [{angle: 90, percent: 0.825, value: 50},
             {value: 30, angle: -35, percent: 0.75}],
    labels: [{label: "N", angle: 210, percent: 0.8}],
    cities: [{ rotation: 90, size: 2, angle: 90, percent: 0.2 },
             { angle: -90, percent: 0.6 }],
    track: [{ side: 6, type: "mid", rotation: -30 },
            { side: 1 }, { side: 2 }, { side: 3 }, { side: 4 },
            { side: 5, type: "sharp" }]
  },
  "774": {
    color: "brown",
    rotations: [0],
    values: [{value: 50, angle: 210, percent: 0.75},
             {value: 50, angle: 330, percent: 0.75}],
    labels: [{label: "V", angle: 270, percent: 0.667}],
    cities: [{angle: 150, percent: 0.5},
             {angle: 30, percent: 0.5}],
    track: [{ type: "sharpStopRev", side: 2 }, { type: "sharpStop", side: 3 }]
  },
  "775": {
    color: "brown",
    rotations: [0],
    values: [{angle: 330, percent: 0.75, value: 20},
             {angle: 213, percent: 0.8, value: 10}],
    labels: [{label: "M", angle: 30, percent: 0.65}],
    towns: [{angle: 180, percent: 0.667}],
    cities: [{ size: 2 }],
    track: [{side: 1}, {side: 2}, {side: 3}, {side: 4}, {side: 5}, {side: 6}]
  },
  "776": {
    color: "brown",
    values: [{angle: 210, percent: 0.8, value: 40}],
    cities: [{ size: 2 }],
    track: [{ side: 1 }, { side: 2 }, { side: 3 }, { side: 4 }]
  },
  "777": {
    color: "brown",
    track: [{ side: 1 }],
    values: [{angle: 210, percent: 0.7, value: 60}],
    cities: [{}]
  },
  "778": {
    color: "brown",
    rotations: 3,
    track: [{type: "straight", side: 1, cross: "over"},
            {type: "gentle", side: 6, cross: "under"},
            {type: "gentle", side: 3, cross: "under"}]
  },
  "779": {
    color: "brown",
    track: [{type: "sharp", side: 2},
            {type: "gentle", side: 4, cross: "under"},
            {type: "gentle", side: 5, cross: "over"}]
  },
  "780": {
    color: "brown",
    rotations: 3,
    track: [{type: "sharp", side: 2},
            {type: "sharp", side: 5},
            {type: "straight", side: 1}]
  },
  "781": {
    color: "brown",
    rotations: 2,
    track: [{type: "sharp", side: 2},
            {type: "sharp", side: 4},
            {type: "sharp", side: 6}]
  },
  "782": {
    color: "brown",
    labels: [{label: "£", angle: 90, percent: 0.45, y: -50, size: 30}],
    values: [{angle: 240, percent: 0.5, value: 20}],
    towns: [{color: "halt", angle: 180, percent: 0.667}],
    centerTowns: [{}],
    track: [{ side: 1 }, { side: 2 }, { side: 3 }, { side: 4 }, { side: 6 }]
  },
  "783": {
    color: "brown",
    labels: [{label: "£", angle: 90, percent: 0.45, y: -50, size: 30}],
    values: [{angle: 60, percent: 0.5, value: 20}],
    towns: [{color: "halt", angle: 180, percent: 0.667}],
    centerTowns: [{}],
    track: [{ side: 1 }, { side: 3 }, { side: 4 }, { side: 5 }, { side: 6 }]
  },
  "784": {
    color: "brown",
    labels: [{label: "£", angle: 90, percent: 0.45, y: -50, size: 30}],
    values: [{angle: -60, percent: 0.5, value: 20}],
    towns: [{color: "halt", angle: 180, percent: 0.667}],
    centerTowns: [{}],
    track: [{ side: 1 }, { side: 2 }, { side: 3 }, { side: 4 }, { side: 5 }]
  },
  "785": {
    color: "brown",
    labels: [{label: "£", angle: 90, percent: 0.45, y: -50, size: 30}],
    values: [{angle: 120, percent: 0.5, value: 20}],
    towns: [{color: "halt", angle: 180, percent: 0.667}],
    centerTowns: [{}],
    track: [{ side: 1 }, { side: 2 }, { side: 4 }, { side: 5 }, { side: 6 }]
  },
  "786": {
    color: "brown",
    rotations: [0],
    labels: [{label: "R", angle: 180, percent: 0.667}],
    track: [{side: 5}, {side: 6}],
    values: [{angle: 90, percent: 0.667, value: 60}],
    cities: [{}]
  },
  "787": {
    color: "yellow",
    rotations: [0],
    labels: [{label: "£", angle: 270, percent: 0.333, y: 50, size: 30},
             {label: "C", angle: 120, percent: 0.7}],
    values: [{angle: 240, percent: 0.7, value: 20},
             {angle: 300, percent: 0.5, value: 10}],
    cities: [{angle: 180, percent: 0.333}],
    towns: [{percent: 0.25},
            {color: "halt", percent: 0.667}],
    track: [{ side: 1 }]
  },
  "788": {
    color: "green",
    rotations: [0],
    labels: [{label: "£", angle: 270, percent: 0.333, y: 50, size: 30},
             {label: "C", angle: 120, percent: 0.7}],
    values: [{angle: 240, percent: 0.7, value: 30},
             {angle: 300, percent: 0.5, value: 10}],
    cities: [{angle: 180, percent: 0.333}],
    towns: [{percent: 0.25}],
    centerTowns: [{color: "halt", percent: 0.667}],
    track: [{ side: 1 }, { type: "custom", path: "m 0 75 C 0 50, 30 50, 45 25", side: 2 }]
  },
  "789": {
    color: "brown",
    rotations: [0],
    labels: [{label: "£", angle: 270, percent: 0.333, y: 50, size: 30},
             {label: "C", angle: 120, percent: 0.7}],
    values: [{angle: 240, percent: 0.7, value: 60},
             {angle: 300, percent: 0.5, value: 20}],
    cities: [{angle: 180, percent: 0.333}],
    towns: [{percent: 0.25}],
    centerTowns: [{color: "halt", percent: 0.667}],
    track: [{ side: 1 }, { type: "custom", path: "m 0 75 C 0 50, 30 50, 45 25", side: 2 }]
  },
  "800": {
    color: "green",
    values: [{angle: 210, percent: 0.8, value: 30}],
    labels: [{label: "D&SL", angle: 270, percent: 0.575}],
    centerTowns: [{}],
    track: [{side: 1}, {side: 2}, {side: 3}, {side: 4}]
  },
  "802": {
    color: "green",
    values: [{angle: 210, percent: 0.8, value: 40}],
    labels: [{label: "D", angle: 150, percent: 0.8}],
    cities: [{size: 2, name: {name: "Denver", reverse: true, offset: 66.67}}],
    track: [{side: 1}, {side: 3}, {side: 4}, {side: 5}]
  },
  "802|3": {
    color: "green",
    values: [{angle: 210, percent: 0.8, value: 40}],
    labels: [{label: "D", angle: 150, percent: 0.8}],
    cities: [{size: 2,
              companies: [{}, {label: "C&W", color: "blue"}],
              name: {name: "Denver", reverse: true, offset: 66.67}}],
    track: [{side: 1}, {side: 3}, {side: 4}, {side: 5}]
  },
  "804": {
    color: "brown",
    values: [{angle: 180, percent: 0.667, value: 40}],
    cities: [{}],
    track: [{ side: 1 }, { side: 2 }, { side: 6 }]
  },
  "803": {
    color: "brown",
    values: [{angle: 210, percent: 0.8, value: 50}],
    labels: [{label: "D", angle: 150, percent: 0.8}],
    cities: [{size: 2, name: {name: "Denver", reverse: true, offset: 66.67}}],
    track: [{side: 1}, {side: 3}, {side: 4}, {side: 5}]
  },
  "805": {
    color: "gray",
    values: [{angle: 210, percent: 0.8, value: 60}],
    labels: [{label: "D", angle: 150, percent: 0.8}],
    cities: [{size: 2, name: {name: "Denver", reverse: true, offset: 66.67}}],
    track: [{side: 1}, {side: 3}, {side: 4}, {side: 5}]
  },
  "806": {
    color: "gray",
    values: [{angle: 210, percent: 0.75, value: 10}],
    centerTowns: [{}],
    track: [{type: "city", side: 1},
            {type: "city", side: 6},
            {type: "city", side: 4}]
  },
  "807": {
    color: "gray",
    values: [{angle: 210, percent: 0.75, value: 10}],
    centerTowns: [{}],
    track: [{type: "city", side: 1},
            {type: "city", side: 2},
            {type: "city", side: 4}]
  },
  "808": {
    color: "gray",
    values: [{angle: 180, percent: 0.667, value: 10}],
    centerTowns: [{}],
    track: [{type: "city", side: 1},
            {type: "city", side: 2},
            {type: "city", side: 6}]
  },
  "956": {
    color: "yellow",
    rotations: 3,
    values: [{angle: 210, percent: 0.7, value: 20}],
    cities: [{}],
    track: [{side: 1, gauge: "narrow"},
            {side: 4, gauge: "narrow"}]
  },
  "957": {
    color: "green",
    track: [{type: "gentle", side: 1, gauge: "narrow", cross: "over"},
            {type: "gentle", side: 2, gauge: "narrow", cross: "under"}]
  },
  "958": {
    color: "green",
    track: [{type: "gentle", side: 1, gauge: "narrow", cross: "over"},
            {type: "gentle", side: 4, gauge: "narrow", cross: "under"}]
  },
  "959": {
    color: "green",
    track: [{type: "straight", side: 1, gauge: "narrow", cross: "over"},
            {type: "sharp", side: 2, gauge: "narrow", cross: "under"}]
  },
  "960": {
    color: "green",
    track: [{type: "straight", side: 1, gauge: "narrow", cross: "over"},
            {type: "gentle", side: 6, gauge: "narrow", cross: "under"}]
  },
  "961": {
    color: "green",
    rotations: 3,
    track: [{type: "straight", side: 1, gauge: "narrow", cross: "over"},
            {type: "straight", side: 2, gauge: "narrow", cross: "under"}]
  },
  "962": {
    color: "green",
    values: [{angle: 210, percent: 0.75, value: 30}],
    cities: [{}],
    track: [{ side: 1, gauge: "narrow" },
            { side: 6, gauge: "narrow" },
            { side: 4, gauge: "narrow" }]
  },
  "963": {
    color: "green",
    values: [{angle: 210, percent: 0.75, value: 30}],
    cities: [{}],
    track: [{ side: 1, gauge: "narrow" },
            { side: 2, gauge: "narrow" },
            { side: 4, gauge: "narrow" }]
  },
  "964": {
    color: "green",
    rotations: 3,
    values: [{angle: 180, percent: 0.6, value: 20}],
    cities: [{angle: 90, percent: 0.5},
             {angle: 270, percent: 0.5}],
    track: [{type: "sharp", gauge: "narrow", side: 2},
            {type: "sharp", gauge: "narrow", side: 5}]
  },
  "965": {
    color: "green",
    rotations: 3,
    values: [{angle: 315, percent: 0.7, value: 20}],
    cities: [{angle: 60, percent: 0.5},
             {angle: 240, percent: 0.5}],
    track: [{type: "gentle", gauge: "narrow", side: 2},
            {type: "gentle", gauge: "narrow", side: 5}]
  },
  "966": {
    color: "green",
    values: [{angle: 330, percent: 0.6, value: 20}],
    cities: [{angle: 60, percent: 0.5},
             {angle: 240, percent: 0.5}],
    track: [{type: "gentle", gauge: "narrow", cross: "over", side: 2},
            {type: "gentle", gauge: "narrow", cross: "under", side: 3}]
  },
  "967": {
    color: "green",
    values: [{angle: 210, percent: 0.75, value: 20}],
    cities: [{angle: 60, percent: 0.5},
             {angle: 270, percent: 0.5}],
    track: [{type: "gentle", gauge: "narrow", side: 2},
            {type: "sharp", gauge: "narrow", side: 5}]
  },
  "968": {
    color: "green",
    values: [{angle: 270, percent: 0.5, value: 20}],
    cities: [{angle: 90, percent: 0.6},
             {angle: 180, percent: 0.575}],
    track: [{type: "straight", gauge: "narrow", side: 1},
            {type: "sharp", gauge: "narrow", side: 2}]
  },
  "969": {
    color: "green",
    values: [{angle: 105, percent: 0.6, value: 20}],
    cities: [{angle: 300, percent: 0.6},
             {angle: 180, percent: 0.575}],
    track: [{type: "straight", gauge: "narrow", cross: "over", side: 1},
            {type: "gentle", gauge: "narrow", cross: "under", side: 6}]
  },
  "970": {
    color: "green",
    rotations: 3,
    values: [{angle: 300, percent: 0.6, value: 20}],
    cities: [{angle: 60, percent: 0.575},
             {angle: 180, percent: 0.575}],
    track: [{type: "straight", gauge: "narrow", cross: "over", side: 1},
            {type: "straight", gauge: "narrow", cross: "under", side: 2}]
  },
  "971": {
    color: "green",
    values: [{angle: 210, percent: 0.7, value: 40}],
    borders: [{side: 1, color: "offboard"},
              {side: 2, color: "offboard"},
              {side: 3, color: "offboard"},
              {side: 4, color: "offboard"},
              {side: 5, color: "offboard"},
              {side: 6, color: "offboard"}],
    cities: [{}],
    track: [{side: 1, gauge: "narrow"}, {side: 2, gauge: "narrow"}]
  },
  "972": {
    color: "green",
    values: [{angle: 210, percent: 0.7, value: 40}],
    borders: [{side: 1, color: "offboard"},
              {side: 2, color: "offboard"},
              {side: 3, color: "offboard"},
              {side: 4, color: "offboard"},
              {side: 5, color: "offboard"},
              {side: 6, color: "offboard"}],
    cities: [{}],
    track: [{side: 1, gauge: "narrow"},
            {side: 3, gauge: "narrow"}]
  },
  "973": {
    color: "green",
    rotations: 3,
    values: [{angle: 210, percent: 0.7, value: 40}],
    borders: [{side: 1, color: "offboard"},
              {side: 2, color: "offboard"},
              {side: 3, color: "offboard"},
              {side: 4, color: "offboard"},
              {side: 5, color: "offboard"},
              {side: 6, color: "offboard"}],
    cities: [{}],
    track: [{side: 1, gauge: "narrow"},
            {side: 4, gauge: "narrow"}]
  },
  "974": {
    color: "green",
    values: [{angle: 210, percent: 0.8, value: 60}],
    labels: [{label: "B", angle: 150, percent: 0.8}],
    cities: [{ size: 2 }],
    borders: [{side: 1, color: "offboard"},
              {side: 2, color: "offboard"},
              {side: 3, color: "offboard"},
              {side: 4, color: "offboard"},
              {side: 5, color: "offboard"},
              {side: 6, color: "offboard"}],
    track: [{side: 1, gauge: "narrow"},
            {side: 3, gauge: "narrow"},
            {side: 4, gauge: "narrow"},
            {side: 5, gauge: "narrow"}]
  },
  "975": {
    color: "brown",
    rotations: 3,
    values: [{angle: 210, percent: 0.8, value: 40}],
    cities: [{ size: 2 }],
    track: [{gauge: "narrow", side: 1},
            {gauge: "narrow", side: 2},
            {gauge: "narrow", side: 4},
            {gauge: "narrow", side: 5}]
  },
  "976": {
    color: "brown",
    values: [{angle: 210, percent: 0.8, value: 40}],
    cities: [{ size: 2 }],
    track: [{gauge: "narrow", side: 1},
            {gauge: "narrow", side: 2},
            {gauge: "narrow", side: 3},
            {gauge: "narrow", side: 4}]
  },
  "977": {
    color: "brown",
    values: [{angle: 210, percent: 0.8, value: 40}],
    cities: [{ size: 2 }],
    track: [{gauge: "narrow", side: 1},
            {gauge: "narrow", side: 3},
            {gauge: "narrow", side: 4},
            {gauge: "narrow", side: 5}]
  },
  "978": {
    color: "brown",
    values: [{angle: 210, percent: 0.75, value: 60}],
    cities: [{ size: 2 }],
    borders: [{side: 1, color: "offboard"},
              {side: 2, color: "offboard"},
              {side: 3, color: "offboard"},
              {side: 4, color: "offboard"},
              {side: 5, color: "offboard"},
              {side: 6, color: "offboard"}],
    track: [{side: 1, gauge: "narrow"},
            {side: 2, gauge: "narrow"},
            {side: 6, gauge: "narrow"}]
  },
  "979": {
    color: "brown",
    rotations: 2,
    values: [{angle: 210, percent: 0.75, value: 60}],
    cities: [{ size: 2 }],
    borders: [{side: 1, color: "offboard"},
              {side: 2, color: "offboard"},
              {side: 3, color: "offboard"},
              {side: 4, color: "offboard"},
              {side: 5, color: "offboard"},
              {side: 6, color: "offboard"}],
    track: [{side: 1, gauge: "narrow"},
            {side: 3, gauge: "narrow"},
            {side: 5, gauge: "narrow"}]
  },
  "980": {
    color: "brown",
    values: [{angle: 210, percent: 0.75, value: 60}],
    cities: [{ size: 2 }],
    borders: [{side: 1, color: "offboard"},
              {side: 2, color: "offboard"},
              {side: 3, color: "offboard"},
              {side: 4, color: "offboard"},
              {side: 5, color: "offboard"},
              {side: 6, color: "offboard"}
             ],
    track: [{side: 1, gauge: "narrow"},
            {side: 4, gauge: "narrow"},
            {side: 6, gauge: "narrow"}]
  },
  "985": {
    color: "brown",
    values: [{angle: 210, percent: 0.75, value: 60}],
    cities: [{ size: 2 }],
    borders: [{side: 1, color: "offboard"},
              {side: 2, color: "offboard"},
              {side: 3, color: "offboard"},
              {side: 4, color: "offboard"},
              {side: 5, color: "offboard"},
              {side: 6, color: "offboard"}],
    track: [{side: 1, gauge: "narrow"},
            {side: 4, gauge: "narrow"},
            {side: 2, gauge: "narrow"}]
  },
  "986": {
    color: "brown",
    values: [
      {
        angle: 210,
        percent: 0.75,
        value: 80
      }
    ],
    labels: [
      {
        label: "B",
        angle: 150,
        percent: 0.8
      }
    ],
    cities: [{ size: 2 }],
    borders: [
      {
        side: 1,
        color: "offboard"
      },
      {
        side: 2,
        color: "offboard"
      },
      {
        side: 3,
        color: "offboard"
      },
      {
        side: 4,
        color: "offboard"
      },
      {
        side: 5,
        color: "offboard"
      },
      {
        side: 6,
        color: "offboard"
      }
    ],
    track: [
      {
        side: 1,
        gauge: "narrow"
      },
      {
        side: 2,
        gauge: "narrow"
      },
      {
        side: 3,
        gauge: "narrow"
      },
      {
        side: 5,
        gauge: "narrow"
      },
      {
        side: 6,
        gauge: "narrow"
      }
    ]
  },
  "987": {
    color: "brown",
    labels: [
      {
        label: "HQG",
        angle: -40,
        percent: 0.667
      }
    ],
    values: [
      {
        angle: 210,
        percent: 0.75,
        value: 90
      }
    ],
    cities: [{ size: 2 }],
    borders: [
      {
        side: 1,
        color: "offboard"
      },
      {
        side: 2,
        color: "offboard"
      },
      {
        side: 3,
        color: "offboard"
      },
      {
        side: 4,
        color: "offboard"
      },
      {
        side: 5,
        color: "offboard"
      },
      {
        side: 6,
        color: "offboard"
      }
    ],
    track: [
      {
        side: 1
      },
      {
        gauge: "narrow",
        side: 2
      },
      {
        gauge: "narrow",
        side: 3
      },
      {
        side: 4
      }
    ]
  },
  "988": {
    color: "gray",
    values: [
      {
        angle: 210,
        percent: 0.875,
        value: 50
      }
    ],
    cities: [{ size: 3 }],
    track: [
      {
        gauge: "narrow",
        side: 1
      },
      {
        gauge: "narrow",
        side: 3
      },
      {
        gauge: "narrow",
        side: 4
      },
      {
        gauge: "narrow",
        side: 5
      },
      {
        gauge: "narrow",
        side: 6
      }
    ]
  },
  "989": {
    color: "gray",
    values: [
      {
        angle: 210,
        percent: 0.825,
        value: 70
      }
    ],
    cities: [{ size: 3 }],
    borders: [{side: 1, color: "offboard"},
              {side: 2, color: "offboard"},
              {side: 3, color: "offboard"},
              {side: 4, color: "offboard"},
              {side: 5, color: "offboard"},
              {side: 6, color: "offboard"}],
    track: [{gauge: "narrow", side: 1},
            {gauge: "narrow", side: 3},
            {gauge: "narrow", side: 4},
            {gauge: "narrow", side: 5},
            {gauge: "narrow", side: 6}]},
  "990": {
    color: "gray",
    rotations: 1,
    labels: [{label: "B", angle: 150, percent: 0.85}],
    values: [{angle: 210, percent: 0.825, value: 100}],
    cities: [{ size: 3 }],
    borders: [{side: 1, color: "offboard"},
              {side: 2, color: "offboard"},
              {side: 3, color: "offboard"},
              {side: 4, color: "offboard"},
              {side: 5, color: "offboard"},
              {side: 6, color: "offboard"}],
    track: [{gauge: "narrow", side: 1},
            {gauge: "narrow", side: 2},
            {gauge: "narrow", side: 3},
            {gauge: "narrow", side: 4},
            {gauge: "narrow", side: 5},
            {gauge: "narrow", side: 6}]
  },
  "997|BO": {
    color: "brown",
    values: [{angle: 210, percent: 0.8, value: 60}],
    cities: [{ size: 2, name:{name:"Boston",reverse:true,offset:33}}],
    track: [{side: 1}, {side: 3}, {side: 4}, {side: 5}]
  },
  "18340": {
    color: "yellow",
    labels: [ { label: "B", angle: 150, percent: 0.85 } ],
    values: [ { angle: 335, percent: 0.825, value: 30 } ],
    cities: [ { size: 1, name: { name: "Luxembourg" } } ],
    track: [ { side: 1 } ]
  },
  "18341": {
    color: "green",
    labels: [ { label: "Antwerp", angle: 250, x: 20, y: -20, percent: 0.5, rotation: 60 } ],
    values: [ { angle: 335, percent: 0.825, value: 40 } ],
    cities: [{ size: 2 }],
    track: [ { side: 2 }, {side: 3} ]
  },
  "18342": {
    color: "brown",
    labels: [ { label: "Antwerp", angle: 250, x: 20, y: -20, percent: 0.5, rotation: 60 } ],
    values: [ { angle: 335, percent: 0.825, value: 60 } ],
    cities: [{ size: 3 } ],
    track: [ { side: 2 }, {side: 3}, {side: 4} ]
  },
  "18343": {
    color: "gray",
    labels: [ { label: "Antwerp", angle: 300, x: 30, y: -20, percent: 0.5, rotation: 90, size: 16 } ],
    values: [ { angle: 335, percent: 0.85, value: 80 } ],
    cities: [{ size: 4 }],
    track: [ { side: 2 }, {side: 3}, {side: 4}, {size: 5} ]
  },
};

export default tiles;
