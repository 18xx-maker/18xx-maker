import length from "ramda/src/length"
import max from "ramda/src/max"
import reduce from "ramda/src/reduce"

import { unitsToCss } from "../util";

export const getColumns = reduce((acc, row) => {
  return max(acc, length(row));
}, 0);

// Give the stock section of a game and the stock config.json section, computer
// data that we need.
export const getMarketData = (stock, config, paper) => {
  let { margins, width: pageWidth, height: pageHeight } = paper;

  let printableWidth = pageWidth - (2.0 * margins);
  let printableHeight = pageHeight - (2.0 * margins);

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
    columns = getColumns(stock.market);
  default:
    break;
  }

  // Now with width and height set we can figure out total height and total
  // width
  let totalWidth = width * columns;
  let totalHeight = height * rows + 50; // Add space for the title

  let humanWidth = `${Math.ceil((50 + totalWidth) / 100.0)}in`;
  let humanHeight = `${Math.ceil((50 + totalHeight) / 100.0)}in`;

  return {
    type: stock.type || "2D",
    ledges: stock.ledges || [],
    legend: stock.legend || [],
    width,
    height,
    totalWidth,
    totalHeight,
    printableWidth,
    printableHeight,
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
      printableWidth: unitsToCss(printableWidth),
      printableHeight: unitsToCss(printableHeight),

      margins: unitsToCss(margins)
    }
  }
};
