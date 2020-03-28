import * as util from "./util";

import config from "./defaults.json";

describe("inchesToCss", () => {
  it("should format a number to css inches", () => {
    expect(util.inchesToCss(5)).toEqual("5in");
  });
});

describe("unitsToInches", () => {
  it("should convert a number of units to a number of inches", () => {
    expect(util.unitsToInches(150)).toEqual(1.5);
    expect(util.unitsToInches(100)).toEqual(1);
  });
});

describe("unitsToCss", () => {
  it("should format units to css inches", () => {
    expect(util.unitsToCss(150)).toEqual("1.5in");
    expect(util.unitsToCss(100)).toEqual("1in");
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

describe("addPaginationData", () => {
  it("should generate proper pagination data", () => {
    const input = {
      totalWidth: 3050,
      totalHeight: 2050,
      css: {
        totalWidth: "30.5in",
        totalHeight: "20.5in"
      }
    };

    const output = {
      totalWidth: 3050,
      totalHeight: 2050,
      contentWidth: 3100,
      contentHeight: 2100,
      landscapePages: 12,
      portraitPages: 15,
      landscape: true,
      pages: 12,
      humanWidth: "31in",
      humanHeight: "21in",
      splitPages: util.equalPages,
      pageWidth: 1100,
      pageHeight: 850,
      margin: 25,
      margins: 25,
      cutlines: 25,
      cutlinesOffset: 0,
      bleed: 12.5,
      cutlinesAndBleed: 37.5,
      printableWidth: 1050,
      printableHeight: 800,
      usableWidth: 975,
      usableHeight: 725,
      xPages: [775, 775, 775, 775],
      yPages: [700, 700, 700],
      css: {
        totalWidth: "30.5in",
        totalHeight: "20.5in",
        contentWidth: "31in",
        contentHeight: "21in",
        pageWidth: "11in",
        pageHeight: "8.5in",
        margin: "0.25in",
        margins: "0.25in",
        cutlines: "0.25in",
        cutlinesOffset: "0in",
        bleed: "0.125in",
        cutlinesAndBleed: "0.375in",
        printableWidth: "10.5in",
        printableHeight: "8in",
        usableWidth: "9.75in",
        usableHeight: "7.25in"
      }
    };

    expect(util.addPaginationData(input, config)).toEqual(output);
  })
});
