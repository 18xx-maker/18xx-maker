import * as util from "./util";

describe("trackType", () => {
  it("should identify city tiles", () => {
    expect(util.trackType({ start: 1 })).toEqual("city");
  });

  it("should handle simple tiles", () => {
    expect(util.trackType({ start: 1, end: 2 })).toEqual("sharp");
    expect(util.trackType({ start: 1, end: 3 })).toEqual("gentle");
    expect(util.trackType({ start: 1, end: 4 })).toEqual("straight");
  });

  it("should handle reverse tiles", () => {
    expect(util.trackType({ start: 2, end: 1 })).toEqual("sharp");
    expect(util.trackType({ start: 3, end: 1 })).toEqual("gentle");
    expect(util.trackType({ start: 4, end: 1 })).toEqual("straight");
  });

  it("should handle looping tiles", () => {
    expect(util.trackType({ start: 6, end: 1 })).toEqual("sharp");
    expect(util.trackType({ start: 6, end: 2 })).toEqual("gentle");
    expect(util.trackType({ start: 6, end: 3 })).toEqual("straight");
  });

  it("should handle reverse looping tiles", () => {
    expect(util.trackType({ start: 1, end: 6 })).toEqual("sharp");
    expect(util.trackType({ start: 2, end: 6 })).toEqual("gentle");
    expect(util.trackType({ start: 3, end: 6 })).toEqual("straight");
  });
});

describe("maxPages", () => {
  it("handle < single pages", () => {
    expect(util.maxPages(90, 100)).toEqual([90]);
  });

  it("handle single pages", () => {
    expect(util.maxPages(100, 100)).toEqual([100]);
  });

  it("handle < double pages", () => {
    expect(util.maxPages(190, 100)).toEqual([95,95]);
  });

  it("handle double pages", () => {
    expect(util.maxPages(200, 100)).toEqual([100,100]);
  });

  it("handle > double pages", () => {
    expect(util.maxPages(210, 100)).toEqual([55,100,55]);
  });

  it("handle triple pages", () => {
    expect(util.maxPages(300, 100)).toEqual([100,100,100]);
  });
});

describe("equalPages", () => {
  it("handle < single pages", () => {
    expect(util.equalPages(90, 100)).toEqual([90]);
  });

  it("handle single pages", () => {
    expect(util.equalPages(100, 100)).toEqual([100]);
  });

  it("handle < double pages", () => {
    expect(util.equalPages(190, 100)).toEqual([95,95]);
  });

  it("handle double pages", () => {
    expect(util.equalPages(200, 100)).toEqual([100,100]);
  });

  it("handle > double pages", () => {
    expect(util.equalPages(210, 100)).toEqual([70,70,70]);
  });

  it("handle triple pages", () => {
    expect(util.equalPages(300, 100)).toEqual([100,100,100]);
  });
});

describe("marketColor", () => {
  it("should handle empty lists", () => {
    expect(util.marketColor([], 20)).toEqual("plain");
  });

  it("should handle multiple limits", () => {
    let limits = [
      {
        color: "yellow",
        value: 60
      },
      {
        color: "orange",
        value: 45
      },
      {
        color: "brown",
        value: 30
      }
    ];
    expect(util.marketColor(limits, 80)).toEqual("plain");
    expect(util.marketColor(limits, 60)).toEqual("yellow");
    expect(util.marketColor(limits, 40)).toEqual("orange");
    expect(util.marketColor(limits, 29)).toEqual("brown");
  });
});
