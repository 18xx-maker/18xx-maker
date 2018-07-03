import util from "./util";

describe("trackType", () => {
  it("should identify city tiles", () => {
    expect(util.trackType({start: 1})).toEqual("city");
  });

  it("should handle simple tiles", () => {
    expect(util.trackType({start: 1, end: 2})).toEqual("sharp");
    expect(util.trackType({start: 1, end: 3})).toEqual("gentle");
    expect(util.trackType({start: 1, end: 4})).toEqual("straight");
  });

  it("should handle reverse tiles", () => {
    expect(util.trackType({start: 2, end: 1})).toEqual("sharp");
    expect(util.trackType({start: 3, end: 1})).toEqual("gentle");
    expect(util.trackType({start: 4, end: 1})).toEqual("straight");
  });

  it("should handle looping tiles", () => {
    expect(util.trackType({start: 6, end: 1})).toEqual("sharp");
    expect(util.trackType({start: 6, end: 2})).toEqual("gentle");
    expect(util.trackType({start: 6, end: 3})).toEqual("straight");
  });

  it("should handle reverse looping tiles", () => {
    expect(util.trackType({start: 1, end: 6})).toEqual("sharp");
    expect(util.trackType({start: 2, end: 6})).toEqual("gentle");
    expect(util.trackType({start: 3, end: 6})).toEqual("straight");
  });
});

describe("marketColor", () => {
  it("should handle empty lists", () => {
    expect(util.marketColor([], 20)).toEqual("plain");
  });

  it("should handle multiple limits", () => {
    let limits = [{
      color: "yellow",
      value: 60
    },{
      color: "orange",
      value: 45
    },{
      color: "brown",
      value: 30
    }]
    expect(util.marketColor(limits, 80)).toEqual("plain");
    expect(util.marketColor(limits, 60)).toEqual("yellow");
    expect(util.marketColor(limits, 40)).toEqual("orange");
    expect(util.marketColor(limits, 29)).toEqual("brown");
  });
});
