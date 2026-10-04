import { unitsToCss } from "./index.js";

// Sizes are floats, so a row that fills the page exactly can come out a hair
// short (0.3 / 0.1 is 2.9999999999999996)
const fit = (space, size) => Math.floor(space / size + 1e-9);

const dieLayouts = ["miniEuroDie", "dtgDie"];

// The card config for one type of card ("private", "share", "train" or
// "number"): its own width and height from `cards.sizes` where set, the shared
// ones otherwise. The die layouts force their own size and ignore overrides.
export const typeCardConfig = (cards, type) => {
  const size = cards.sizes?.[type];
  if (!size || dieLayouts.includes(cards.layout)) {
    return cards;
  }

  return {
    ...cards,
    ...(size.width !== undefined && { width: size.width }),
    ...(size.height !== undefined && { height: size.height }),
  };
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
