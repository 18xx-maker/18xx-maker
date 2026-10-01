import defaults from "@/defaults.json";
import { getCardData } from "@/util/cards";

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
});
