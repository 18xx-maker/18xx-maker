import { unitsToCss } from "../util";

export const getCardData = (cards, paper) => {
  let { width, height, cutlines, bleed } = cards;
  let { margins, width: pageWidth, height: pageHeight } = paper;

  let cutlinesAndBleed = cutlines + bleed;

  // Compute the size of each card with bleed
  let bleedWidth = (2.0 * bleed) + width;
  let bleedHeight = (2.0 * bleed) + height;

  // Compute the size of each card with bleed and cutlines
  let totalWidth = (2.0 * cutlinesAndBleed) + width;
  let totalHeight = (2.0 * cutlinesAndBleed) + height;

  let usableWidth = pageWidth - (2.0 * margins);
  let usableHeight = pageHeight - (2.0 * margins);

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

  let layout = {
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
    cutlinesAndBleed,
    bleedWidth,
    bleedHeight,
    totalWidth,
    totalHeight,

    margins,
    pageWidth: layout.landscape ? pageHeight : pageWidth,
    pageHeight: layout.landscape ? pageWidth : pageHeight,
    usableWidth: layout.landscape ? usableHeight : usableWidth,
    usableHeight: layout.landscape ? usableWidth : usableHeight,

    portrait,
    landscape,
    layout,

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
      pageWidth: unitsToCss(pageWidth),
      pageHeight: unitsToCss(pageHeight),
      usableWidth: unitsToCss(usableWidth),
      usableHeight: unitsToCss(usableHeight)
    }
  };
}
