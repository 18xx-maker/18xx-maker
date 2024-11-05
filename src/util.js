import overrides from "./data/companies";

import { addIndex, adjust, ascend, chain, compose, curry, defaultTo, find, fromPairs, head, is, join, juxt, lte, map, max, mergeAll, mergeLeft, nth, pick, prop, propOr, reduce, reverse, sortWith, split, tail, toPairs, toUpper } from "ramda";

export const maxPlayers = compose(
  reduce(max, 0),
  map(prop("number"))
);

export const isElectron =
  typeof navigator === "undefined"
    ? false
    : /electron/i.test(navigator.userAgent);

export const tileColors = [
  "yellow",
  "yellow/green",
  "green",
  "green/brown",
  "brown",
  "brown/gray",
  "gray",
  "offboard",
  "water",
  "mountain",
  "tunnel",
  "other",
  "none",
];
const idBaseSort = compose(
  Number,
  defaultTo(0),
  nth(0),
  split("|"),
  propOr("", "id")
);
const idExtraSort = compose(
  Number,
  defaultTo(0),
  nth(1),
  split("|"),
  propOr("", "id")
);
const colorSort = compose(
  tileColors.indexOf.bind(tileColors),
  prop("color"),
  defaultTo({ color: "other" })
);
export const sortTiles = sortWith([
  ascend(colorSort),
  ascend(idBaseSort),
  ascend(idExtraSort),
]);

export const capitalize = compose(
  join(""),
  juxt([compose(toUpper, head), tail])
);

export const mapKeys = curry((fn, obj) =>
  fromPairs(map(adjust(0, fn), toPairs(obj)))
);

export const linear = curry((percent, p1, p2) => [
  p1[0] * percent + p2[0] * (1.0 - percent),
  p1[1] * percent + p2[1] * (1.0 - percent),
]);

export const midpoint = linear(0.5);

export const pointsToString = compose(join(" "), map(join(",")));

export const inchesToCss = (inches) => `${inches}in`;
export const mmToCss = (inches) => `${inches}mm`;
export const inchesToMm = (inches) => inches * 25.4;
export const unitsToInches = (units) => units / 100.0;
export const unitsToCss = compose(inchesToCss, unitsToInches);
export const unitsToCssMm = compose(mmToCss, inchesToMm, unitsToInches);

export const printableWidth = ({ width, margins }) => {
  let margin = 0;
  if (is(Number, margins)) {
    margin += 2 * margins;
  } else {
    margin += margins.left + margins.right;
  }

  return width - margin;
};

export const printableHeight = ({ height, margins }) => {
  let margin = 0;
  if (is(Number, margins)) {
    margin += 2 * margins;
  } else {
    margin += margins.top + margins.bottom;
  }

  return height - margin;
};

export const fillArray = curry((getNumber, array) => {
  return chain((a) => Array(getNumber(a)).fill(a), array);
});

export const marketColor = curry((limits, value) => {
  return propOr(
    "plain",
    "color",
    find((limit) => lte(value, limit.value), reverse(limits))
  );
});

export const equalPages = (total, page) => {
  total = total || 0;
  page = page || 1;

  let pages = Math.ceil(total / page);

  let result = new Array(pages);
  result.fill(total / pages);
  return result;
};

export const getTile = curry((tileDefs, tiles, id) => {
  let tile = {};
  let quantity = 1;

  if (is(Object, tiles[id])) {
    quantity = tiles[id].print || tiles[id].quantity || 1;
    if (tiles[id].tile) {
      // We aliased (in a game file) this tile to another tile)
      let aliasId = tiles[id].tile;
      tile = tileDefs[aliasId] || tileDefs[split("|", aliasId)[0]];
    } else if (!tiles[id].color) {
      // This tile might have rotations or other such items but isn't a full tile
      tile = tileDefs[id] || tileDefs[split("|", id)[0]];
      tile = { ...tile, ...tiles[id] };
    } else {
      // This is actually the tile object
      tile = tiles[id];
    }
  } else {
    // Search for tiles in the tile def with this id
    tile = tileDefs[id] || tileDefs[split("|", id)[0]];
    quantity = tiles[id] || 1;
  }

  return {
    ...tile,
    id,
    quantity,
  };
});

export const compileCompanies = (game) => {
  return map((company) => {
    if (
      company.minor &&
      !company.tokens &&
      game.tokenTypes &&
      game.tokenTypes["minor"]
    ) {
      company.tokenType = "minor";
      company.tokens = game.tokenTypes["minor"];
    } else if (
      !company.tokens &&
      game.tokenTypes &&
      game.tokenTypes["default"]
    ) {
      company.tokenType = "default";
      company.tokens = game.tokenTypes["default"];
    } else if (is(String, company.tokens)) {
      company.tokenType = company.tokens;
      company.tokens = game.tokenTypes[company.tokens];
    }

    if (
      company.minor &&
      !company.shares &&
      game.shareTypes &&
      game.shareTypes["minor"]
    ) {
      company.shareType = "minor";
      company.shares = game.shareTypes["minor"];
    } else if (
      !company.shares &&
      game.shareTypes &&
      game.shareTypes["default"]
    ) {
      company.shareType = "default";
      company.shares = game.shareTypes["default"];
    } else if (is(String, company.shares)) {
      company.shareType = company.shares;
      company.shares = game.shareTypes[company.shares];
    }

    return company;
  }, (game && game.companies) || []);
};

export const overrideCompanies = (companies, override, selections) => {
  if (override === "none" || !overrides[override]) {
    return companies;
  }

  let overrideCompanies = overrides[override].companies;

  return addIndex(map)((company, index) => {
    // If we have selections, filter/select our overrides with them
    if ((selections || []).length > 0) {
      overrideCompanies = map(
        (index) => prop(index, overrideCompanies),
        selections
      );
    }

    // If we have a valid override for the index, merge!
    if (overrideCompanies[index]) {
      company = mergeLeft(company, overrideCompanies[index]);

      // Remove some fields if they don't exist on the override company
      company.logo = overrideCompanies[index].logo;
      company.token = overrideCompanies[index].token;
    }

    return company;
  }, companies || []);
};

export const getFontProps = (props, size, weight, family, style) => {
  return mergeAll([
    {
      fontFamily: "display",
      fontSize: 12,
      fontStyle: "regular",
      fontWeight: "bold",
    },
    {
      fontFamily: family,
      fontSize: size,
      fontStyle: style,
      fontWeight: weight,
    },
    pick(["fontFamily", "fontSize", "fontStyle", "fontWeight"], props),
  ]);
};

export const getCharterData = (charters, paper) => {
  let {
    layout,
    halfWidth: useHalfWidth,
    smallerMinors,
    cutlines,
    bleed,
    border,
  } = charters;
  let { margins, width: pageWidth, height: pageHeight } = paper;

  let cutlinesAndBleed = cutlines + bleed;

  let usableWidth = pageWidth - 2.0 * margins;
  let usableHeight = pageHeight - 2.0 * margins;

  let totalWidth = usableWidth / (useHalfWidth ? 2 : 1);
  let totalHalfWidth = usableWidth / 2;
  let totalHeight = usableHeight / 2;
  let totalMinorHeight = usableHeight / (smallerMinors ? 3 : 2);

  let perPage = useHalfWidth ? 4 : 2;
  let minorsPerPage = smallerMinors
    ? useHalfWidth
      ? 6
      : 3
    : useHalfWidth
    ? 4
    : 2;

  // Setup actual variables based on die choices
  switch (layout) {
    case "3x1":
      cutlines = 0;
      bleed = 0;
      cutlinesAndBleed = 0;
      usableWidth = 750;
      usableHeight = 1000;
      totalWidth = usableWidth;
      totalHalfWidth = usableWidth; // No half height option
      totalHeight = Math.floor(usableHeight / 3);
      totalMinorHeight = Math.floor(usableHeight / 3);
      usableHeight = usableHeight + 50; // add pins
      perPage = 3;
      minorsPerPage = 3;
      break;
    case "3x2":
      cutlines = 0;
      bleed = 0;
      cutlinesAndBleed = 0;
      usableWidth = 750;
      usableHeight = 1000;
      totalWidth = usableWidth / 2;
      totalHalfWidth = totalWidth; // No half height option
      totalHeight = Math.floor(usableHeight / 3);
      totalMinorHeight = Math.floor(usableHeight / 3);
      usableHeight = usableHeight + 50; // add pins
      perPage = 6;
      minorsPerPage = 6;
      break;
    case "3x1minors":
      cutlines = 0;
      bleed = 0;
      cutlinesAndBleed = 0;
      usableWidth = 750;
      usableHeight = 1000;
      totalWidth = usableWidth;
      totalHalfWidth = totalWidth / 2;
      totalHeight = Math.floor(usableHeight / 3);
      totalMinorHeight = Math.floor(usableHeight / 3);
      usableHeight = usableHeight + 50; // add pins
      perPage = 3;
      minorsPerPage = 6;
      break;
    case "free":
    default:
      // Variables already setup for this layout
      break;
  }

  let width = totalWidth - 2.0 * cutlinesAndBleed;
  let halfWidth = totalHalfWidth - 2.0 * cutlinesAndBleed;
  let height = totalHeight - 2.0 * cutlinesAndBleed;
  let minorHeight = totalMinorHeight - 2.0 * cutlinesAndBleed;

  let bleedWidth = width + 2.0 * bleed;
  let bleedHalfWidth = halfWidth + 2.0 * bleed;
  let bleedHeight = height + 2.0 * bleed;
  let bleedMinorHeight = minorHeight + 2.0 * bleed;

  return {
    layout,
    width,
    halfWidth,
    height,
    minorHeight,
    cutlines,
    bleed,
    border,
    cutlinesAndBleed,
    bleedWidth,
    bleedHalfWidth,
    bleedHeight,
    bleedMinorHeight,
    totalWidth,
    totalHalfWidth,
    totalHeight,
    totalMinorHeight,

    perPage,
    minorsPerPage,

    margins,
    pageWidth,
    pageHeight,
    usableWidth,
    usableHeight,

    css: {
      width: unitsToCss(width),
      halfWidth: unitsToCss(halfWidth),
      height: unitsToCss(height),
      minorHeight: unitsToCss(minorHeight),
      cutlines: unitsToCss(cutlines),
      bleed: unitsToCss(bleed),
      cutlinesAndBleed: unitsToCss(cutlinesAndBleed),
      bleedWidth: unitsToCss(bleedWidth),
      bleedHalfWidth: unitsToCss(bleedHalfWidth),
      bleedHeight: unitsToCss(bleedHeight),
      bleedMinorHeight: unitsToCss(bleedMinorHeight),
      totalWidth: unitsToCss(totalWidth),
      totalHalfWidth: unitsToCss(totalHalfWidth),
      totalHeight: unitsToCss(totalHeight),
      totalMinorHeight: unitsToCss(totalMinorHeight),

      margins: unitsToCss(margins),
      pageWidth: unitsToCss(pageWidth),
      pageHeight: unitsToCss(pageHeight),
      usableWidth: unitsToCss(usableWidth),
      usableHeight: unitsToCss(usableHeight),
    },
  };
};

/*
 * addPaginationData expects to receive an object with totalWidth and
 * totalHeight defined. It will then add all pagination data to this using the
 * config data that was also passed in.
 */
export const addPaginationData = (data, config) => {
  // Pull data we need from the config
  const { paper, cutlines, cutlinesOffset, bleed, margin } = config;
  const { margins, width: pageWidth, height: pageHeight } = paper;
  const splitPages = equalPages;
  const cutlinesAndBleed = cutlines + bleed;

  const printableWidth = pageWidth - 2.0 * margins;
  const printableHeight = pageHeight - 2.0 * margins;

  const usableWidth = printableWidth - 2.0 * cutlinesAndBleed;
  const usableHeight = printableHeight - 2.0 * cutlinesAndBleed;

  const contentWidth = data.totalWidth + 2.0 * margin;
  const contentHeight = data.totalHeight + 2.0 * margin;

  const portraitPages =
    splitPages(contentWidth, usableWidth).length *
    splitPages(contentHeight, usableHeight).length;
  const landscapePages =
    splitPages(contentWidth, usableHeight).length *
    splitPages(contentHeight, usableWidth).length;
  const landscape = landscapePages < portraitPages;
  const pages = landscape ? landscapePages : portraitPages;

  const xPages = landscape
    ? splitPages(contentWidth, usableHeight)
    : splitPages(contentWidth, usableWidth);
  const yPages = landscape
    ? splitPages(contentHeight, usableWidth)
    : splitPages(contentHeight, usableHeight);

  let humanWidth = `${Math.ceil(data.totalWidth / 100.0)}in`;
  let humanHeight = `${Math.ceil(data.totalHeight / 100.0)}in`;

  const measurements = {
    margin,
    cutlines,
    cutlinesOffset,
    bleed,
    cutlinesAndBleed,

    contentWidth,
    contentHeight,

    printableWidth: landscape ? printableHeight : printableWidth,
    printableHeight: landscape ? printableWidth : printableHeight,

    usableWidth: landscape ? usableHeight : usableWidth,
    usableHeight: landscape ? usableWidth : usableHeight,

    pageWidth: landscape ? pageHeight : pageWidth,
    pageHeight: landscape ? pageWidth : pageHeight,
    margins,
  };

  return {
    ...data,
    splitPages,
    portraitPages,
    landscapePages,
    landscape,
    pages,
    xPages,
    yPages,

    humanWidth,
    humanHeight,

    ...measurements,

    css: {
      ...(data.css || {}),
      ...map(unitsToCss, measurements),
    },
  };
};

// borrowed from rambda defaultTo
// Copyright (c) 2017 Dejan Toteff
function flagIs(inputArguments) {
  return (
    inputArguments === undefined ||
    inputArguments === null ||
    Number.isNaN(inputArguments) === true
  );
}

// borrowed from rambda defaultTo
// Copyright (c) 2017 Dejan Toteff
export function multiDefaultTo(defaultArgument, ...inputArguments) {
  if (arguments.length === 1) {
    return (..._inputArguments) =>
      multiDefaultTo(defaultArgument, ..._inputArguments);
  }

  const limit = inputArguments.length - 1;
  let len = limit + 1;
  let ready = false;
  let holder;

  while (!ready) {
    const instance = inputArguments[limit - len + 1];

    if (len === 0) {
      ready = true;
    } else if (flagIs(instance)) {
      len -= 1;
    } else {
      holder = instance;
      ready = true;
    }
  }

  return holder === undefined ? defaultArgument : holder;
}
