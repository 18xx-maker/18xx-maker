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
