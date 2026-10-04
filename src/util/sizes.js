import { max } from "ramda";

import { getCardData, typeCardConfig } from "./cards.js";
import { getCharterData } from "./index.js";

// The sizes of the single element pages (a card, charter, token or tile on its
// own). The pages style themselves with these, and the export uses them for
// the size of the capture.

// A card on its own: no bleed, cutlines or border, and the die layouts have
// their own sizes. The type ("private", "share", "train" or "number") picks
// the size set for it in `cards.sizes`.
export const getSingleCardData = (cards, paper, type) => {
  const cardConfig = {
    ...typeCardConfig(cards, type),
    cutlines: 0,
    bleed: 0,
    border: 0,
  };

  switch (cards.layout) {
    case "miniEuroDie":
      cardConfig.width = 265.748;
      cardConfig.height = 173.228;
      break;
    case "dtgDie":
      cardConfig.width = 250;
      cardConfig.height = 150;
      break;
    default:
      // No overrides for "free" layout
      break;
  }

  return getCardData(cardConfig, paper);
};

// A charter on its own: no bleed, cutlines or border
export const getSingleCharterData = (charters, paper) =>
  getCharterData({ ...charters, cutlines: 0, bleed: 0, border: 0 }, paper);

// The size of the charter: full width unless it is drawn at half width (see
// charterHalfWidth), minor charters can be shorter
export const getCharterSize = (data, minor, halfWidth = false) => ({
  width: halfWidth ? data.totalHalfWidth : data.totalWidth,
  height: minor ? data.totalMinorHeight : data.totalHeight,
});

// The size of the square each token is drawn in (in units)
export const getTokenGrid = ({
  marketTokenSize,
  stationTokenSize,
  generalTokenSize,
}) => max(max(marketTokenSize, stationTokenSize), generalTokenSize) + 10;

// A company token is 4 squares (2 market, 2 station), an extra token 2
export const getTokenSize = (tokens, company) => {
  const grid = getTokenGrid(tokens);
  return { width: grid * (company ? 4 : 2), height: grid };
};

// The scale of a tile on its own against the 150 unit hex
export const getTileScale = (hexWidth) => hexWidth / 150;

// The size of a tile on its own (it is drawn in a 200 unit square)
export const getTileSize = (hexWidth) => {
  const size = getTileScale(hexWidth) * 200;
  return { width: size, height: size };
};
