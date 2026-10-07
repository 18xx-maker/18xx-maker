import { is, length, max, reduce } from "ramda";

// TODO: Relative import since this is used in the CLI
import { unitsToCss } from "./index.js";

export const getMaxLength = reduce((acc, row) => {
  return max(acc, length(row));
}, 0);

// A market or par cell can be a label, a value or an object: always give back
// an object, or null for anything else
export const normalizeCell = (cell) => {
  if (is(String, cell)) {
    return { label: cell };
  } else if (is(Number, cell)) {
    return { value: cell };
  } else if (is(Object, cell)) {
    // Nothing to do, just assume we have a valid object
    return cell;
  }
  return null;
};

const movementArrows = ["up", "down", "left", "right"];
const MOVEMENT_CHAR = 6.5;
const MOVEMENT_LINE = 14;
const MOVEMENT_WRAP = 40;
const MOVEMENT_PAD = 10;
const MOVEMENT_SIDE = 6;
const MOVEMENT_TITLE = 30;
const MOVEMENT_CENTER = { width: 60, height: 30 };

// Break a text into lines of about the given number of characters, on spaces
const wrapText = (text, size) => {
  const lines = [];
  let line = "";
  String(text)
    .split(/\s+/)
    .forEach((word) => {
      if (line && line.length + 1 + word.length > size) {
        lines.push(line);
        line = word;
      } else {
        line = line ? `${line} ${word}` : word;
      }
    });
  if (line) {
    lines.push(line);
  }
  return lines;
};

// Lay out the movement legend (stock.movement) in units: the lines of text of
// every arrow and of every other key, the size of the box, and where the
// compass sits in it. No text measuring, a character is 6.5 units wide like
// the legend of a 1D market.
export const getMovementData = (movement) => {
  const arrows = {};
  movementArrows.forEach((key) => {
    arrows[key] = (movement[key] || []).flatMap((text) =>
      wrapText(text, MOVEMENT_WRAP),
    );
  });
  const extras = Object.keys(movement)
    .filter((key) => !movementArrows.includes(key))
    .flatMap((key) =>
      movement[key].flatMap((text) =>
        wrapText(`${key}: ${text}`, MOVEMENT_WRAP),
      ),
    );

  const textWidth = (lines) =>
    reduce((acc, line) => max(acc, line.length * MOVEMENT_CHAR), 0, lines);
  const side = {
    left: max(textWidth(arrows.left), 50),
    right: max(textWidth(arrows.right) + MOVEMENT_SIDE, 50),
  };
  const lineCount = (lines) => Math.max(lines.length, 1);
  // The up text starts 20 under the top and its last baseline stays above
  // the price box
  const topHeight = Math.max(
    40,
    MOVEMENT_LINE * Math.max(lineCount(arrows.left), lineCount(arrows.right)) +
      6,
    MOVEMENT_LINE * lineCount(arrows.up) + 12,
  );
  const bottomHeight = max(40, MOVEMENT_LINE * lineCount(arrows.down) + 6);
  const center = {
    x: MOVEMENT_PAD + side.left + MOVEMENT_CENTER.width / 2,
    y: MOVEMENT_TITLE + topHeight + MOVEMENT_CENTER.height / 2,
  };
  const extrasHeight = extras.length
    ? extras.length * MOVEMENT_LINE + MOVEMENT_PAD
    : 0;

  return {
    arrows,
    extras,
    side,
    center,
    centerBox: MOVEMENT_CENTER,
    lineHeight: MOVEMENT_LINE,
    pad: MOVEMENT_PAD,
    topHeight,
    bottomHeight,
    width: Math.max(
      2 * MOVEMENT_PAD + side.left + MOVEMENT_CENTER.width + side.right,
      center.x +
        MOVEMENT_PAD +
        Math.max(textWidth(arrows.up), textWidth(arrows.down)) +
        MOVEMENT_PAD,
      textWidth(extras) + 2 * MOVEMENT_PAD,
      180,
    ),
    height:
      MOVEMENT_TITLE +
      topHeight +
      MOVEMENT_CENTER.height +
      bottomHeight +
      extrasHeight +
      MOVEMENT_PAD,
  };
};

// Given the stock section of a game and the stock config.json section, compute
// data that we need.
export const getMarketData = (stock, config) => {
  let {
    stock: { cell, column, diag },
  } = config;

  let width = 0;
  let height = 0;
  let rows = 0;
  let columns = 0;
  let cellWidth =
    (stock.cell && stock.cell.width ? stock.cell.width : 1) * cell.width;
  let cellHeight =
    (stock.cell && stock.cell.height ? stock.cell.height : 1) * cell.height;

  switch (stock.type) {
    case "1Diag":
      width = cellWidth;
      height = diag * cellHeight;
      rows = 2;
      columns = Math.ceil(length(stock.market) / 2);
      break;
    case "1D":
      width = cellWidth;
      height = column * cellHeight;
      rows = 1;
      columns = length(stock.market);
      break;
    case "2D":
      width = cellWidth;
      height = cellHeight;
      rows = length(stock.market);
      columns = getMaxLength(stock.market);
      break;
    default:
      break;
  }

  // Now with width and height set we can figure out total height and total
  // width
  let totalWidth = width * columns + 10;
  let totalHeight = height * rows + (stock.title === false ? 0 : 50);

  // Are we displaying par, if so does this add to the height or width?
  if (stock.display && stock.display.par) {
    let parData = getParData(stock, config);
    let parTotalWidth = parData.totalWidth + width * stock.display.par.x;
    let parTotalHeight =
      parData.totalHeight +
      (stock.type === "1Diag" ? height / 2 : height) * stock.display.par.y +
      50;

    totalWidth = max(totalWidth, parTotalWidth);
    totalHeight = max(totalHeight, parTotalHeight);
  }

  // And the movement legend
  if (
    config.stock.display.movement &&
    stock.movement &&
    stock.display &&
    stock.display.movement
  ) {
    let movement = getMovementData(stock.movement);
    totalWidth = max(
      totalWidth,
      movement.width + cell.width * stock.display.movement.x,
    );
    totalHeight = max(
      totalHeight,
      movement.height +
        cell.height * stock.display.movement.y +
        (stock.title === false ? 0 : 50),
    );
  }

  let humanWidth = `${Math.ceil(totalWidth / 100.0)}in`;
  let humanHeight = `${Math.ceil(totalHeight / 100.0)}in`;

  if (stock.type === "1D" || stock.type === "1Diag") {
    if (
      config.stock.display.legend &&
      stock.legend &&
      stock.legend.length > 0
    ) {
      // Add space for legend
      totalHeight += 50;
    }
  }
  totalHeight +=
    stock.display && stock.display.extraTotalHeight
      ? stock.display.extraTotalHeight
      : 0;
  totalWidth +=
    stock.display && stock.display.extraTotalWidth
      ? stock.display.extraTotalWidth
      : 0;

  return {
    type: stock.type || "2D",
    ledges: stock.ledges || [],
    legend: stock.legend || [],
    market: stock.market || [],
    par: stock.par || {},
    cell: stock.cell || {},
    display: stock.display || {},
    width,
    height,
    humanWidth,
    humanHeight,
    totalWidth,
    totalHeight,
    rows,
    columns,
    stock,
    config,

    css: {
      width: unitsToCss(width),
      height: unitsToCss(height),
      totalWidth: unitsToCss(totalWidth),
      totalHeight: unitsToCss(totalHeight),
    },
  };
};

// Give the stock section of a game and the stock config.json section, compute
// data that we need.
export const getRevenueData = (revenue, config) => {
  let {
    stock: { cell },
  } = config;

  revenue = revenue || {};
  let min = revenue.min || 1;
  let max = revenue.max || 100;
  let perRow = revenue.perRow || 20;

  let width = cell.width;
  let height = cell.height;
  let rows = Math.ceil(max / perRow);
  let columns = perRow;

  let totalWidth = width * columns;
  let totalHeight = height * rows + 50; // Add space for the title

  return {
    min,
    max,
    perRow,
    width,
    height,
    totalWidth,
    totalHeight,
    rows,
    columns,

    css: {
      width: unitsToCss(width),
      height: unitsToCss(height),
      totalWidth: unitsToCss(totalWidth),
      totalHeight: unitsToCss(totalHeight),
    },
  };
};

// Give the stock section of a game and the stock config.json section, compute
// data that we need.
export const getParData = (stock, config) => {
  let {
    stock: { cell, par },
  } = config;

  let parSection = stock.par || {};
  let values = parSection.values || [];

  let width = (parSection.width || par) * cell.width;
  let height = (parSection.height || 1) * cell.height;
  let rows = length(values);
  let columns = getMaxLength(values) || 1;
  let totalWidth = width * columns;
  let totalHeight = height * rows + (stock.title === false ? 0 : 50);

  return {
    values,
    par: parSection,
    legend: stock.legend || [],

    rows,
    columns,

    width,
    height,
    totalWidth,
    totalHeight,

    css: {
      width: unitsToCss(width),
      height: unitsToCss(height),
      totalWidth: unitsToCss(totalWidth),
      totalHeight: unitsToCss(totalHeight),
    },
  };
};
