import defaults from "@/defaults.json";
import { getCardData, typeCardConfig } from "@/util/cards";

const { cards, paper } = defaults;

describe("getCardData", () => {
  it("should add bleed and cutlines around the card", () => {
    const data = getCardData(cards, paper);

    expect(data.bleedWidth).toBeCloseTo(265.748 + 25);
    expect(data.bleedHeight).toBeCloseTo(173.228 + 25);
    expect(data.cutlinesAndBleed).toBe(37.5);
    expect(data.totalWidth).toBeCloseTo(265.748 + 75);
    expect(data.totalHeight).toBeCloseTo(173.228 + 75);
  });

  it("should use landscape when more cards fit", () => {
    const data = getCardData(cards, paper);

    // Portrait fits 2 x 4 but landscape fits 3 x 3 once 25 is reserved
    expect(data.portrait).toEqual({ perRow: 2, perColumn: 4, perPage: 8 });
    expect(data.landscape).toEqual({ perRow: 3, perColumn: 3, perPage: 9 });
    expect(data.layout).toEqual({
      landscape: true,
      perColumn: 3,
      perPage: 9,
      perRow: 3,
    });
  });

  it("should swap the page dimensions for landscape", () => {
    const data = getCardData(cards, paper);

    expect(data.pageWidth).toBe(1100);
    expect(data.pageHeight).toBe(850);
    expect(data.printableWidth).toBe(1050);
    expect(data.printableHeight).toBe(800);
    expect(data.usableWidth).toBe(1025);
    expect(data.usableHeight).toBe(800);
    expect(data.css.pageWidth).toBe("11in");
    expect(data.css.pageHeight).toBe("8.5in");
  });

  it("should prefer portrait when it fits the same or more", () => {
    const data = getCardData(
      { ...cards, width: 100, height: 100, cutlines: 0, bleed: 0 },
      paper,
    );

    expect(data.portrait.perPage).toBe(80);
    expect(data.landscape.perPage).toBe(80);
    expect(data.layout.landscape).toBe(false);
    expect(data.pageWidth).toBe(850);
    expect(data.pageHeight).toBe(1100);
  });

  it("should not reserve pin space for the free layout", () => {
    // 175 total size: 1050 fits 6 but 1025 (with the 25 reserved) only 5
    const size = {
      ...cards,
      width: 100,
      height: 100,
      cutlines: 25,
      bleed: 12.5,
    };
    const pinned = getCardData(size, paper);
    const free = getCardData({ ...size, layout: "free" }, paper);

    expect(pinned.portrait.perColumn).toBe(5);
    expect(pinned.landscape.perRow).toBe(5);
    expect(free.portrait.perColumn).toBe(6);
    expect(free.landscape.perRow).toBe(6);
    expect(free.usableHeight).toBe(1050);
    expect(pinned.usableHeight).toBe(1025);
  });

  it("should convert sizes to css inches", () => {
    const data = getCardData(cards, paper);

    expect(data.css.cutlines).toBe("0.25in");
    expect(data.css.bleed).toBe("0.125in");
    expect(data.css.width).toBe("2.65748in");
    expect(data.css.totalWidth).toBe(`${data.totalWidth / 100}in`);
  });

  it("should fit cards that fill the page up to floating point error", () => {
    // 0.3 / 0.1 is 2.9999999999999996
    const data = getCardData(
      {
        ...cards,
        layout: "free",
        width: 0.1,
        height: 0.1,
        cutlines: 0,
        bleed: 0,
      },
      { width: 0.3, height: 0.3, margins: 0 },
    );

    expect(data.portrait.perRow).toBe(3);
    expect(data.portrait.perColumn).toBe(3);
  });

  it("should still place one card per page when none fit", () => {
    const data = getCardData(
      { ...cards, layout: "free", width: 2000, height: 100, bleed: 0 },
      paper,
    );

    expect(data.layout.perPage).toBe(1);
    expect(data.layout.perRow).toBe(1);
    expect(data.layout.perColumn).toBe(1);
  });
});

describe("typeCardConfig", () => {
  const free = { ...cards, layout: "free" };
  const sizes = {
    private: { width: 200, height: 100 },
    share: { width: 300 },
    train: { height: 90 },
  };

  it("uses the size of the type", () => {
    expect(typeCardConfig({ ...free, sizes }, "private")).toMatchObject({
      width: 200,
      height: 100,
    });
  });

  it("falls back to the card size for what is not set", () => {
    expect(typeCardConfig({ ...free, sizes }, "share")).toMatchObject({
      width: 300,
      height: cards.height,
    });
    expect(typeCardConfig({ ...free, sizes }, "train")).toMatchObject({
      width: cards.width,
      height: 90,
    });
  });

  it("returns the config as it is without a size for the type", () => {
    const config = { ...free, sizes };
    expect(typeCardConfig(config, "number")).toBe(config);
    expect(typeCardConfig(free, "private")).toBe(free);
  });

  it("ignores the sizes of the die layouts", () => {
    for (const layout of ["miniEuroDie", "dtgDie"]) {
      const config = { ...cards, layout, sizes };
      expect(typeCardConfig(config, "private")).toBe(config);
    }
  });
});

describe("getCardData orientation", () => {
  it("can be forced", () => {
    expect(getCardData(cards, paper, "landscape").layout.landscape).toBe(true);

    const portrait = getCardData(cards, paper, "portrait");
    expect(portrait.layout).toEqual({
      landscape: false,
      perColumn: 4,
      perPage: 8,
      perRow: 2,
    });
    expect(portrait.pageWidth).toBe(paper.width);
  });

  it("keeps the forced orientation for a card too big for the page", () => {
    const big = { ...cards, width: 5000, height: 5000 };
    expect(getCardData(big, paper, "landscape").layout).toMatchObject({
      landscape: true,
      perPage: 1,
    });
    expect(getCardData(big, paper).layout.landscape).toBe(false);
  });
});
