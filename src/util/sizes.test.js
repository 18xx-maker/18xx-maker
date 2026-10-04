import {
  getCharterSize,
  getSingleCardData,
  getSingleCharterData,
  getTileScale,
  getTileSize,
  getTokenGrid,
  getTokenSize,
} from "#util/sizes";
import defaults from "../defaults.json" with { type: "json" };

describe("getSingleCardData", () => {
  const { cards, paper } = defaults;

  it("drops bleed, cutlines and border", () => {
    const data = getSingleCardData(
      { ...cards, cutlines: 3, bleed: 4, border: 2 },
      paper,
    );
    expect(data).toMatchObject({
      bleedWidth: cards.width,
      bleedHeight: cards.height,
      cutlines: 0,
      border: 0,
    });
  });

  it("adds the bleed asked for around the card, not the one of the config", () => {
    const data = getSingleCardData(
      { ...cards, cutlines: 3, bleed: 4, border: 2 },
      paper,
      undefined,
      12.5,
    );
    expect(data).toMatchObject({
      width: cards.width,
      height: cards.height,
      bleed: 12.5,
      bleedWidth: cards.width + 25,
      bleedHeight: cards.height + 25,
      cutlines: 0,
      border: 0,
    });
    expect(data.totalWidth).toBe(data.bleedWidth);
  });

  it("does not change the config", () => {
    const config = { ...cards, bleed: 4 };
    getSingleCardData(config, paper);
    expect(config.bleed).toBe(4);
  });

  it("uses the size set for the type of card", () => {
    const config = {
      ...cards,
      layout: "free",
      sizes: { private: { width: 200 } },
    };
    expect(getSingleCardData(config, paper, "private")).toMatchObject({
      width: 200,
      height: cards.height,
    });
    expect(getSingleCardData(config, paper, "share")).toMatchObject({
      width: cards.width,
    });
    expect(getSingleCardData(config, paper)).toMatchObject({
      width: cards.width,
    });
  });

  it("uses the size of the die layouts", () => {
    expect(
      getSingleCardData({ ...cards, layout: "miniEuroDie" }, paper),
    ).toMatchObject({ width: 265.748, height: 173.228 });
    expect(
      getSingleCardData({ ...cards, layout: "dtgDie" }, paper),
    ).toMatchObject({ width: 250, height: 150 });
    expect(
      getSingleCardData(
        { ...cards, layout: "dtgDie", sizes: { private: { width: 10 } } },
        paper,
        "private",
      ),
    ).toMatchObject({ width: 250, height: 150 });
  });
});

describe("charters", () => {
  const { charters, paper } = defaults;

  it("drops bleed, cutlines and border without changing the config", () => {
    const config = { ...charters, cutlines: 3, bleed: 4, border: 2 };
    const data = getSingleCharterData(config, paper);

    expect(data).toMatchObject({ cutlines: 0, bleed: 0, border: 0 });
    expect(config.cutlines).toBe(3);
  });

  it("sizes minors by their own height", () => {
    const data = getSingleCharterData(
      { ...charters, smallerMinors: true },
      paper,
    );
    expect(getCharterSize(data, false)).toEqual({
      width: data.totalWidth,
      height: data.totalHeight,
    });
    expect(getCharterSize(data, true).height).toBe(data.totalMinorHeight);
    expect(data.totalMinorHeight).toBeLessThan(data.totalHeight);
  });

  it("sizes half width charters by the half width", () => {
    const data = getSingleCharterData(
      { ...charters, layout: "3x1minors" },
      paper,
    );
    expect(getCharterSize(data, true, true).width).toBe(data.totalHalfWidth);
    expect(data.totalHalfWidth).toBeLessThan(data.totalWidth);
    expect(getCharterSize(data, false, false).width).toBe(data.totalWidth);
  });
});

describe("tokens", () => {
  const tokens = {
    marketTokenSize: 50,
    stationTokenSize: 60,
    generalTokenSize: 40,
  };

  it("uses the biggest token plus a gap for the grid", () => {
    expect(getTokenGrid(tokens)).toBe(70);
    expect(getTokenGrid({ ...tokens, generalTokenSize: 80 })).toBe(90);
  });

  it("is 4 squares wide for a company and 2 for an extra token", () => {
    expect(getTokenSize(tokens, true)).toEqual({ width: 280, height: 70 });
    expect(getTokenSize(tokens, false)).toEqual({ width: 140, height: 70 });
  });
});

describe("tiles", () => {
  it("scales against the 150 unit hex", () => {
    expect(getTileScale(150)).toBe(1);
    expect(getTileScale(75)).toBe(0.5);
  });

  it("draws in a 200 unit square at that scale", () => {
    expect(getTileSize(150)).toEqual({ width: 200, height: 200 });
    expect(getTileSize(75)).toEqual({ width: 100, height: 100 });
  });
});
