import defaults from "@/defaults.json";
import {
  duplexMode,
  duplexPages,
  getCardData,
  mirrorRows,
  resolveCardLayout,
  typeCardConfig,
} from "@/util/cards";

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

  it("ignores the sizes of the die layouts and uses the size of the die", () => {
    for (const layout of ["miniEuroDie", "dtgDie"]) {
      const die = cards.dice[layout];
      expect(
        typeCardConfig({ ...cards, layout, sizes }, "private"),
      ).toMatchObject({ width: die.width, height: die.height });
    }
  });

  it("uses the sizes of the die for the type of card", () => {
    const dice = {
      miniEuroDie: {
        width: 300,
        height: 200,
        sizes: { share: { width: 120 }, train: { height: 90 } },
      },
    };
    const config = { ...cards, layout: "miniEuroDie", dice };
    expect(typeCardConfig(config, "share")).toMatchObject({
      width: 120,
      height: 200,
    });
    expect(typeCardConfig(config, "train")).toMatchObject({
      width: 300,
      height: 90,
    });
    expect(typeCardConfig(config, "private")).toMatchObject({
      width: 300,
      height: 200,
    });
  });

  it("falls back to the size of the die when the config has none", () => {
    const { dice, ...bare } = cards;
    expect(dice).toBeDefined();
    expect(
      typeCardConfig({ ...bare, layout: "miniEuroDie" }, "private"),
    ).toMatchObject({ width: 265.748, height: 173.228 });
    expect(
      typeCardConfig(
        { ...bare, layout: "dtgDie", dice: { dtgDie: { width: 260 } } },
        "private",
      ),
    ).toMatchObject({ width: 260, height: 150 });
  });
});

describe("resolveCardLayout", () => {
  it("leaves free layouts to the config and the paper", () => {
    const free = { ...cards, layout: "free", sizes: { share: { width: 111 } } };
    const resolved = resolveCardLayout(free, paper, "share");
    expect(resolved.cards).toMatchObject({ width: 111, height: cards.height });
    expect(resolved.paper).toBe(paper);
    expect(resolveCardLayout(free, paper).cards).toBe(free);
  });

  it("gives the mini euro die the numbers it always had", () => {
    const resolved = resolveCardLayout({ ...cards, border: 4 }, paper);
    expect(resolved.cards).toMatchObject({
      width: 265.748,
      height: 173.228,
      cutlines: 25,
      bleed: 12.5,
      border: 0,
    });
    expect(resolved.paper).toEqual({ width: 850, height: 1100, margins: 25 });
  });

  it("gives the dtg die the numbers it always had, padding included", () => {
    const dtg = { ...cards, layout: "dtgDie" };
    expect(resolveCardLayout(dtg, paper).cards).toMatchObject({
      width: 250,
      height: 150,
      cutlines: 0,
      bleed: 0,
      border: 0,
    });
    expect(
      resolveCardLayout({ ...dtg, dtgPadding: 5 }, paper).cards,
    ).toMatchObject({ width: 240, height: 140, cutlines: 5, bleed: 0 });
  });

  it("uses the size of the die and of the type on that die", () => {
    const dice = {
      miniEuroDie: {
        width: 300,
        height: 200,
        sizes: { number: { width: 100 } },
      },
    };
    const config = { ...cards, dice };
    expect(resolveCardLayout(config, paper, "share").cards).toMatchObject({
      width: 300,
      height: 200,
    });
    expect(resolveCardLayout(config, paper, "number").cards).toMatchObject({
      width: 100,
      height: 200,
    });
  });

  it("lays the die out on the paper divided by the print scale", () => {
    const resolved = resolveCardLayout(cards, paper, undefined, 125);
    expect(resolved.paper).toEqual({ width: 680, height: 880, margins: 20 });

    const free = { ...cards, layout: "free" };
    expect(resolveCardLayout(free, paper, undefined, 125).paper).toEqual({
      width: 680,
      height: 880,
      margins: 20,
    });
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

describe("duplexMode", () => {
  it("is only on for the free layout with a mode", () => {
    expect(duplexMode({ layout: "free", duplex: "long" })).toBe("long");
    expect(duplexMode({ layout: "free", duplex: "separate" })).toBe("separate");
    expect(duplexMode({ layout: "free", duplex: "off" })).toBe("off");
    expect(duplexMode({ layout: "free" })).toBe("off");
    expect(duplexMode({ layout: "miniEuroDie", duplex: "long" })).toBe("off");
    expect(duplexMode({ layout: "dtgDie", duplex: "separate" })).toBe("off");
  });
});

describe("mirrorRows", () => {
  it("reverses every row of a full page", () => {
    expect(mirrorRows(["1", "2", "3", "4", "5", "6"], 3)).toEqual([
      "3",
      "2",
      "1",
      "6",
      "5",
      "4",
    ]);
  });

  it("pads a partial row so the cards stay behind their fronts", () => {
    expect(mirrorRows(["1", "2", "3", "4", "5"], 3)).toEqual([
      "3",
      "2",
      "1",
      null,
      "5",
      "4",
    ]);
  });

  it("pads a partial page of one row", () => {
    expect(mirrorRows(["1"], 3)).toEqual([null, null, "1"]);
  });

  it("keeps empty slots where they are mirrored to", () => {
    expect(mirrorRows(["1", null, "3"], 3)).toEqual(["3", null, "1"]);
  });

  it("does nothing with one card per row", () => {
    expect(mirrorRows(["1"], 1)).toEqual(["1"]);
    expect(mirrorRows(["1", "2"], 1)).toEqual(["1", "2"]);
  });
});

describe("duplexPages", () => {
  const fronts = ["a", "b", "c", "d", "e"];
  const backs = ["A", "B", "C", null, "E"];

  it("follows every page of fronts with its mirrored backs", () => {
    expect(
      duplexPages(fronts, backs, { perPage: 4, perRow: 2, mode: "long" }),
    ).toEqual([
      { index: 0, slots: ["a", "b", "c", "d"], back: false },
      { index: 0, slots: ["B", "A", null, "C"], back: true },
      { index: 1, slots: ["e"], back: false },
      { index: 1, slots: [null, "E"], back: true },
    ]);
  });

  it("prints all the backs after all the fronts, not mirrored", () => {
    expect(
      duplexPages(fronts, backs, { perPage: 4, perRow: 2, mode: "separate" }),
    ).toEqual([
      { index: 0, slots: ["a", "b", "c", "d"], back: false },
      { index: 1, slots: ["e"], back: false },
      { index: 0, slots: ["A", "B", "C", null], back: true },
      { index: 1, slots: ["E"], back: true },
    ]);
  });

  it("leaves out a page of backs without any back", () => {
    const none = [null, null, null, null, "E"];
    expect(
      duplexPages(fronts, none, { perPage: 4, perRow: 2, mode: "long" }).map(
        ({ index, back }) => [index, back],
      ),
    ).toEqual([
      [0, false],
      [1, false],
      [1, true],
    ]);
    expect(
      duplexPages(fronts, none, {
        perPage: 4,
        perRow: 2,
        mode: "separate",
      }).map(({ index, back }) => [index, back]),
    ).toEqual([
      [0, false],
      [1, false],
      [1, true],
    ]);
  });

  it("does not mirror a page of one card", () => {
    expect(
      duplexPages(["a", "b"], ["A", "B"], {
        perPage: 1,
        perRow: 1,
        mode: "long",
      }),
    ).toEqual([
      { index: 0, slots: ["a"], back: false },
      { index: 0, slots: ["A"], back: true },
      { index: 1, slots: ["b"], back: false },
      { index: 1, slots: ["B"], back: true },
    ]);
  });
});
