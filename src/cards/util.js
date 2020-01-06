import { unitsToCss } from "../util";

export const getCardData = (cards, paper) => {
  let { layout, width, height, cutlines, bleed, border } = cards;
  let { margins, width: pageWidth, height: pageHeight } = paper;

  let cutlinesAndBleed = cutlines + bleed;

  // Compute the size of each card with bleed
  let bleedWidth = (2.0 * bleed) + width;
  let bleedHeight = (2.0 * bleed) + height;

  // Compute the size of each card with bleed and cutlines
  let totalWidth = (2.0 * cutlinesAndBleed) + width;
  let totalHeight = (2.0 * cutlinesAndBleed) + height;

  let printableWidth = pageWidth - (2.0 * margins);
  let printableHeight = pageHeight - (2.0 * margins);

  let usableWidth = printableWidth;
  let usableHeight = printableHeight - (layout === "free" ? 0 : 25);

  // Calculate how many in portait
  let portrait = {
    perRow: Math.floor(usableWidth / totalWidth),
    perColumn: Math.floor(usableHeight / totalHeight)
  };
  portrait.perPage = portrait.perRow * portrait.perColumn;

  let landscape = {
    perRow: Math.floor(usableHeight / totalWidth),
    perColumn: Math.floor(usableWidth / totalHeight)
  }
  landscape.perPage = landscape.perRow * landscape.perColumn;

  // Use portrait if it's more or equal to landscape
  let usePortrait = portrait.perPage >= landscape.perPage;

  let cardLayout = {
    perPage: usePortrait ? portrait.perPage : landscape.perPage,
    perRow: usePortrait ? portrait.perRow : landscape.perRow,
    perColumn: usePortrait ? portrait.perColumn : landscape.perColumn,
    landscape: !usePortrait
  };

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
      pageWidth: cardLayout.landscape ? unitsToCss(pageHeight) : unitsToCss(pageWidth),
      pageHeight: cardLayout.landscape ? unitsToCss(pageWidth) : unitsToCss(pageHeight),
      printableWidth: cardLayout.landscape ? unitsToCss(printableHeight) : unitsToCss(printableWidth),
      printableHeight: cardLayout.landscape ? unitsToCss(printableWidth) : unitsToCss(printableHeight),
      usableWidth: cardLayout.landscape ? unitsToCss(usableHeight) : unitsToCss(usableWidth),
      usableHeight: cardLayout.landscape ? unitsToCss(usableWidth) : unitsToCss(usableHeight)
    }
  };
}
