import { splitEvery } from "ramda";

import { layoutPaper, unitsToCss } from "./index.js";

// Sizes are floats, so a row that fills the page exactly can come out a hair
// short (0.3 / 0.1 is 2.9999999999999996)
const fit = (space, size) => Math.floor(space / size + 1e-9);

const dieLayouts = ["miniEuroDie", "dtgDie"];

export const isDieLayout = (layout) => dieLayouts.includes(layout);

// What the die layouts do not take from the config: the paper they are cut
// for, and the cutlines and bleed of the mini euro die. The size of a die card
// is `cards.dice` in the config, these are its sizes when the config has none.
const DIE_PAPER = { width: 850, height: 1100, margins: 25 };
const MINI_EURO_CUTLINES = 25;
const MINI_EURO_BLEED = 12.5;
const DIE_SIZES = {
  miniEuroDie: { width: 265.748, height: 173.228 },
  dtgDie: { width: 250, height: 150 },
};

// The card config for one type of card ("private", "share", "train" or
// "number"): its own width and height from `cards.sizes` where set, the shared
// ones otherwise. The die layouts have their own sizes, `cards.dice.<layout>`
// with the `sizes` of that die, and ignore `cards.sizes`.
export const typeCardConfig = (cards, type) => {
  const die = isDieLayout(cards.layout);
  const dieConfig = die ? (cards.dice?.[cards.layout] ?? {}) : undefined;
  const size = (die ? dieConfig.sizes : cards.sizes)?.[type];
  if (!die && !size) {
    return cards;
  }

  const base = die
    ? {
        width: dieConfig.width ?? DIE_SIZES[cards.layout].width,
        height: dieConfig.height ?? DIE_SIZES[cards.layout].height,
      }
    : cards;

  return {
    ...cards,
    width: size?.width ?? base.width,
    height: size?.height ?? base.height,
  };
};

// The card config and paper to lay the sheets of one type of card out on (the
// type is optional). The die layouts take their own paper, cutlines and bleed.
// The paper is the one the layout is worked out on, see layoutPaper.
export const resolveCardLayout = (cards, paper, type, printScale = 100) => {
  const typed = typeCardConfig(cards, type);

  switch (cards.layout) {
    case "miniEuroDie":
      return {
        cards: {
          ...typed,
          cutlines: MINI_EURO_CUTLINES,
          bleed: MINI_EURO_BLEED,
          border: 0,
        },
        paper: layoutPaper(DIE_PAPER, printScale),
      };
    case "dtgDie": {
      const padding = cards.dtgPadding ?? 0;
      return {
        cards: {
          ...typed,
          width: typed.width - 2 * padding,
          height: typed.height - 2 * padding,
          cutlines: padding,
          bleed: 0,
          border: 0,
        },
        paper: layoutPaper(DIE_PAPER, printScale),
      };
    }
    default:
      // No overrides for "free" layout
      return { cards: typed, paper: layoutPaper(paper, printScale) };
  }
};

// `orientation` ("portrait" or "landscape") forces the page orientation, by
// default whichever fits more cards is used
export const getCardData = (cards, paper, orientation) => {
  let { layout, width, height, cutlines, bleed, border } = cards;
  let { margins, width: pageWidth, height: pageHeight } = paper;

  let cutlinesAndBleed = cutlines + bleed;

  // Compute the size of each card with bleed
  let bleedWidth = 2.0 * bleed + width;
  let bleedHeight = 2.0 * bleed + height;

  // Compute the size of each card with bleed and cutlines
  let totalWidth = 2.0 * cutlinesAndBleed + width;
  let totalHeight = 2.0 * cutlinesAndBleed + height;

  let printableWidth = pageWidth - 2.0 * margins;
  let printableHeight = pageHeight - 2.0 * margins;

  let usableWidth = printableWidth;
  let usableHeight = printableHeight - (layout === "free" ? 0 : 25);

  // Calculate how many in portait
  let portrait = {
    perRow: fit(usableWidth, totalWidth),
    perColumn: fit(usableHeight, totalHeight),
  };
  portrait.perPage = portrait.perRow * portrait.perColumn;

  let landscape = {
    perRow: fit(usableHeight, totalWidth),
    perColumn: fit(usableWidth, totalHeight),
  };
  landscape.perPage = landscape.perRow * landscape.perColumn;

  // Use portrait if it's more or equal to landscape
  let usePortrait = orientation
    ? orientation === "portrait"
    : portrait.perPage >= landscape.perPage;

  let cardLayout = {
    perPage: usePortrait ? portrait.perPage : landscape.perPage,
    perRow: usePortrait ? portrait.perRow : landscape.perRow,
    perColumn: usePortrait ? portrait.perColumn : landscape.perColumn,
    landscape: !usePortrait,
  };

  // A card that is too big for the page still gets a page of its own
  if (cardLayout.perPage < 1) {
    cardLayout = {
      perPage: 1,
      perRow: 1,
      perColumn: 1,
      landscape: orientation === "landscape",
    };
  }

  // Return all data and some
  return {
    width,
    height,
    cutlines,
    bleed,
    border,
    cutlinesAndBleed,
    bleedWidth,
    bleedHeight,
    totalWidth,
    totalHeight,

    margins,
    pageWidth: cardLayout.landscape ? pageHeight : pageWidth,
    pageHeight: cardLayout.landscape ? pageWidth : pageHeight,
    printableWidth: cardLayout.landscape ? printableHeight : printableWidth,
    printableHeight: cardLayout.landscape ? printableWidth : printableHeight,
    usableWidth: cardLayout.landscape ? usableHeight : usableWidth,
    usableHeight: cardLayout.landscape ? usableWidth : usableHeight,

    portrait,
    landscape,
    layout: cardLayout,

    css: {
      width: unitsToCss(width),
      height: unitsToCss(height),
      cutlines: unitsToCss(cutlines),
      bleed: unitsToCss(bleed),
      cutlinesAndBleed: unitsToCss(cutlinesAndBleed),
      bleedWidth: unitsToCss(bleedWidth),
      bleedHeight: unitsToCss(bleedHeight),
      totalWidth: unitsToCss(totalWidth),
      totalHeight: unitsToCss(totalHeight),

      margins: unitsToCss(margins),
      pageWidth: cardLayout.landscape
        ? unitsToCss(pageHeight)
        : unitsToCss(pageWidth),
      pageHeight: cardLayout.landscape
        ? unitsToCss(pageWidth)
        : unitsToCss(pageHeight),
      printableWidth: cardLayout.landscape
        ? unitsToCss(printableHeight)
        : unitsToCss(printableWidth),
      printableHeight: cardLayout.landscape
        ? unitsToCss(printableWidth)
        : unitsToCss(printableHeight),
      usableWidth: cardLayout.landscape
        ? unitsToCss(usableHeight)
        : unitsToCss(usableWidth),
      usableHeight: cardLayout.landscape
        ? unitsToCss(usableWidth)
        : unitsToCss(usableHeight),
    },
  };
};

// The duplex modes of `cards.duplex` that print backs, the other one is "off"
const DUPLEX_MODES = ["separate", "long"];

// Backs are only printed on the free layout, the die layouts ignore duplex
export const duplexMode = (cards) =>
  cards.layout === "free" && DUPLEX_MODES.includes(cards.duplex)
    ? cards.duplex
    : "off";

const splitRows = (nodes, perRow) => {
  const rows = [];
  for (let i = 0; i < nodes.length; i += perRow) {
    rows.push(nodes.slice(i, i + perRow));
  }
  return rows;
};

// The slots of a page of backs for a sheet flipped on its long edge: every
// row is padded to a full row with empty slots and reversed, so the card in
// column j of the front lies behind column perRow - 1 - j of the back.
export const mirrorRows = (nodes, perRow) =>
  splitRows(nodes, perRow).flatMap((row) =>
    [...row, ...Array(perRow - row.length).fill(null)].reverse(),
  );

// The pages of cards with backs, in print order, as { index, slots, back }.
// `fronts` and `backs` are the cards in the same order, a card without a back
// has `null` in `backs`. A page of backs has `null` for an empty slot and is
// left out when it has no back at all; `index` is the page of fronts it
// belongs to.
//   long:     front, back, front, back ... (backs mirrored, flip on long edge)
//   separate: all the fronts, then all the backs in the same order
export const duplexPages = (fronts, backs, { perPage, perRow, mode }) => {
  const frontPages = splitEvery(perPage, fronts).map((slots, index) => ({
    index,
    slots,
    back: false,
  }));
  const backPages = splitEvery(perPage, backs).flatMap((slots, index) =>
    slots.some(Boolean)
      ? [
          {
            index,
            slots: mode === "long" ? mirrorRows(slots, perRow) : slots,
            back: true,
          },
        ]
      : [],
  );

  return mode === "long"
    ? frontPages.flatMap((page) => [
        page,
        ...backPages.filter(({ index }) => index === page.index),
      ])
    : [...frontPages, ...backPages];
};
