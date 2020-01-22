import length from "ramda/src/length"
import max from "ramda/src/max"
import reduce from "ramda/src/reduce"

import { equalPages, maxPages, unitsToCss } from "../util";

export const getMaxLength = reduce((acc, row) => {
  return max(acc, length(row));
}, 0);

// Give the stock section of a game and the stock config.json section, compute
// data that we need.
export const getMarketData = (stock, config, paper, pagination) => {
  let { margins, width: pageWidth, height: pageHeight } = paper;
  let splitPages = pagination === "max" ? maxPages : equalPages;

  // What part of the page can we use?
  let printableWidth = pageWidth - (2.0 * margins);
  let printableHeight = pageHeight - (2.0 * margins);

  // We have to make room for cutlines and bleed
  let usableWidth = printableWidth - 75;
  let usableHeight = printableHeight - 75;

  let width = 0;
  let height = 0;
  let rows = 0;
  let columns = 0;

  switch (stock.type) {
  case "1Diag":
    width = config.diag.width;
    height = config.diag.height;
    rows = 2;
    columns = Math.ceil(length(stock.market) / 2);
    break;
  case "1D":
    width = config.column.width;
    height = config.column.height;
    rows = 1;
    columns = length(stock.market);
    break;
  case "2D":
    width = config.cell.width;
    height = config.cell.height;
    rows = length(stock.market);
    columns = getMaxLength(stock.market);
    break;
  default:
    break;
  }

  // Now with width and height set we can figure out total height and total
  // width
  let totalWidth = width * columns;
  let totalHeight = height * rows + 50; // Add space for the title

  if (stock.type === "1D" || stock.type === "1Diag") {
    if (stock.legend && stock.legend.length > 0) {
      // Add space for legend
      totalHeight += 50;
    }
  }

  let printWidth = 55 + totalWidth;
  let printHeight = 55 + totalHeight;

  let humanWidth = `${Math.ceil(printWidth / 100.0)}in`;
  let humanHeight = `${Math.ceil(printHeight / 100.0)}in`;

  // Are we landscape or portrait
  let portraitPages =
      splitPages(totalWidth + 50, usableWidth).length *
      splitPages(totalHeight + 50, usableHeight).length;

  let landscapePages =
      splitPages(totalWidth + 50, usableHeight).length *
      splitPages(totalHeight + 50, usableWidth).length;

  let landscape = landscapePages < portraitPages;

  return {
    type: stock.type || "2D",
    ledges: stock.ledges || [],
    legend: stock.legend || [],
    market: stock.market || [],
    par: stock.par || {},
    splitPages,
    landscape,
    pages: landscape ? landscapePages : portraitPages,
    landscapePages,
    portraitPages,
    width,
    height,
    totalWidth,
    totalHeight,
    printWidth,
    printHeight,
    printableWidth: landscape ? printableHeight : printableWidth,
    printableHeight: landscape ? printableWidth : printableHeight,
    pageWidth: landscape ? pageHeight : pageWidth,
    pageHeight: landscape ? pageWidth : pageHeight,
    usableWidth: landscape ? usableHeight : usableWidth,
    usableHeight: landscape ? usableWidth : usableHeight,
    humanWidth,
    humanHeight,
    rows,
    columns,

    margins,

    css: {
      width: unitsToCss(width),
      height: unitsToCss(height),
      totalWidth: unitsToCss(totalWidth),
      totalHeight: unitsToCss(totalHeight),
      printWidth: unitsToCss(printWidth),
      printHeight: unitsToCss(printHeight),
      printableWidth: unitsToCss(landscape ? printableHeight : printableWidth),
      printableHeight: unitsToCss(landscape ? printableWidth : printableHeight),
      usableWidth: unitsToCss(landscape ? usableHeight : usableWidth),
      usableHeight: unitsToCss(landscape ? usableWidth : usableHeight),
      pageWidth: unitsToCss(landscape ? pageHeight : pageWidth),
      pageHeight: unitsToCss(landscape ? pageWidth : pageHeight),

      margins: unitsToCss(margins)
    }
  }
};

// Give the stock section of a game and the stock config.json section, compute
// data that we need.
export const getRevenueData = (revenue, config, paper, pagination) => {
  let { margins, width: pageWidth, height: pageHeight } = paper;

  revenue = revenue || {};
  let min = revenue.min || 1;
  let max = revenue.max || 100;
  let perRow = revenue.perRow || 20;

  let splitPages = pagination === "max" ? maxPages : equalPages;

  // What part of the page can we use?
  let printableWidth = pageWidth - (2.0 * margins);
  let printableHeight = pageHeight - (2.0 * margins);

  // We have to make room for cutlines and bleed
  let usableWidth = printableWidth - 75;
  let usableHeight = printableHeight - 75;

  let width = config.cell.width;
  let height = config.cell.height;
  let rows = Math.ceil(max / perRow);
  let columns = perRow;

  // Now with width and height set we can figure out total height and total
  // width
  let totalWidth = width * columns;
  let totalHeight = height * rows + 50; // Add space for the title
  let printWidth = 55 + totalWidth;
  let printHeight = 55 + totalHeight;

  let humanWidth = `${Math.ceil(printWidth / 100.0)}in`;
  let humanHeight = `${Math.ceil(printHeight / 100.0)}in`;

  // Are we landscape or portrait
  let portraitPages =
      splitPages(totalWidth + 50, usableWidth).length *
      splitPages(totalHeight + 50, usableHeight).length;

  let landscapePages =
      splitPages(totalWidth + 50, usableHeight).length *
      splitPages(totalHeight + 50, usableWidth).length;

  let landscape = landscapePages < portraitPages;

  return {
    min,
    max,
    perRow,
    splitPages,
    landscape,
    pages: landscape ? landscapePages : portraitPages,
    landscapePages,
    portraitPages,
    width,
    height,
    totalWidth,
    totalHeight,
    printWidth,
    printHeight,
    printableWidth: landscape ? printableHeight : printableWidth,
    printableHeight: landscape ? printableWidth : printableHeight,
    pageWidth: landscape ? pageHeight : pageWidth,
    pageHeight: landscape ? pageWidth : pageHeight,
    usableWidth: landscape ? usableHeight : usableWidth,
    usableHeight: landscape ? usableWidth : usableHeight,
    humanWidth,
    humanHeight,
    rows,
    columns,

    margins,

    css: {
      width: unitsToCss(width),
      height: unitsToCss(height),
      totalWidth: unitsToCss(totalWidth),
      totalHeight: unitsToCss(totalHeight),
      printWidth: unitsToCss(printWidth),
      printHeight: unitsToCss(printHeight),
      printableWidth: unitsToCss(landscape ? printableHeight : printableWidth),
      printableHeight: unitsToCss(landscape ? printableWidth : printableHeight),
      usableWidth: unitsToCss(landscape ? usableHeight : usableWidth),
      usableHeight: unitsToCss(landscape ? usableWidth : usableHeight),
      pageWidth: unitsToCss(landscape ? pageHeight : pageWidth),
      pageHeight: unitsToCss(landscape ? pageWidth : pageHeight),

      margins: unitsToCss(margins)
    }
  }
};

// Give the stock section of a game and the stock config.json section, compute
// data that we need.
export const getParData = (stock, config, paper, pagination) => {
  let { margins, width: pageWidth, height: pageHeight } = paper;
  let splitPages = pagination === "max" ? maxPages : equalPages;

  let values = (stock.par && stock.par.values) || [];

  // What part of the page can we use?
  let printableWidth = pageWidth - (2.0 * margins);
  let printableHeight = pageHeight - (2.0 * margins);

  // We have to make room for cutlines and bleed
  let usableWidth = printableWidth - 75;
  let usableHeight = printableHeight - 75;

  let width = config.par.width;
  let height = config.par.height;
  let rows = length(stock.par.values);
  let columns = Math.max(1, getMaxLength(stock.par.values));

  // Now with width and height set we can figure out total height and total
  // width
  let totalWidth = width * columns;
  let totalHeight = height * rows + 50; // Add space for the title
  let printWidth = 55 + totalWidth;
  let printHeight = 55 + totalHeight;
  let humanWidth = `${Math.ceil(printWidth / 100.0)}in`;
  let humanHeight = `${Math.ceil(printHeight / 100.0)}in`;

  // Are we landscape or portrait
  let portraitPages =
      splitPages(totalWidth + 50, usableWidth).length *
      splitPages(totalHeight + 50, usableHeight).length;

  let landscapePages =
      splitPages(totalWidth + 50, usableHeight).length *
      splitPages(totalHeight + 50, usableWidth).length;

  let landscape = landscapePages < portraitPages;

  return {
    values,
    par: stock.par || {},
    legend: stock.legend || [],
    splitPages,
    landscape,
    pages: landscape ? landscapePages : portraitPages,
    landscapePages,
    portraitPages,
    width,
    height,
    totalWidth,
    totalHeight,
    printWidth,
    printHeight,
    printableWidth: landscape ? printableHeight : printableWidth,
    printableHeight: landscape ? printableWidth : printableHeight,
    pageWidth: landscape ? pageHeight : pageWidth,
    pageHeight: landscape ? pageWidth : pageHeight,
    usableWidth: landscape ? usableHeight : usableWidth,
    usableHeight: landscape ? usableWidth : usableHeight,
    humanWidth,
    humanHeight,
    rows,
    columns,

    margins,

    css: {
      width: unitsToCss(width),
      height: unitsToCss(height),
      totalWidth: unitsToCss(totalWidth),
      totalHeight: unitsToCss(totalHeight),
      printWidth: unitsToCss(printWidth),
      printHeight: unitsToCss(printHeight),
      printableWidth: unitsToCss(landscape ? printableHeight : printableWidth),
      printableHeight: unitsToCss(landscape ? printableWidth : printableHeight),
      usableWidth: unitsToCss(landscape ? usableHeight : usableWidth),
      usableHeight: unitsToCss(landscape ? usableWidth : usableHeight),
      pageWidth: unitsToCss(landscape ? pageHeight : pageWidth),
      pageHeight: unitsToCss(landscape ? pageWidth : pageHeight),

      margins: unitsToCss(margins)
    }
  }
};
