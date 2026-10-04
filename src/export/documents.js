import { flatten, map, range } from "ramda";

import { applyCompanyOverrides } from "../util/companyOverrides.js";
import { cardCompanyTrains, charterHalfWidth } from "../util/companyTrains.js";
import {
  addPaginationData,
  compileCompanies,
  maxPlayers,
  printableHeight,
  printableWidth,
} from "../util/index.js";
import { getMapData } from "../util/map.js";
import { getMarketData, getParData, getRevenueData } from "../util/market.js";
import {
  getCharterSize,
  getSingleCardData,
  getSingleCharterData,
  getTileSize,
  getTokenSize,
} from "../util/sizes.js";
import { b18Images } from "./b18.js";
import { safeName } from "./names.js";

// The token page wraps its tokens in a block that is also a .printElement, the
// token itself is inside
const TOKEN_SELECTOR = ".token .printElement";

// The pages whose png takes the background option (white by default). The
// png of every other page (the background, cards, charters, tokens, tiles) is
// always transparent.
export const BACKGROUND_PAGES = [
  "map",
  "market",
  "par",
  "revenue",
  "tile-manifest",
];

const inches = (size) =>
  size && { widthIn: size.width / 100, heightIn: size.height / 100 };

// Every document a game can export, in the order they are printed. Inputs are
// plain data:
//   game    the game
//   config  the resolved config (see util/resolveConfig)
//   data    { slug, tiles, companyOverrides, layouts, plainSheetNames }: the
//           slug the game has on the site (its id), the compiled tile
//           definitions, the company override sets (src/data/companies), the
//           layouts a config can choose from ({ cards, tokens, tiles }) and if
//           a sheet is named without its layout unless all layouts are
//           exported ("cards", not "cards-single"), like the app does
//
// Each document is
//   id        unique in the list
//   kind      what it is
//   route     where the page is on the site
//   query     the url parameters of the page
//   mode      "single" (one page or sheet), "paginated" or "item" (one element)
//   formats   "pdf", "png", "svg", "b18"
//   size      { widthIn, heightIn } of the element a png captures, or null
//   paper     the paper of the config
//   capture   how a png, svg or b18 image is captured: the element to capture, the
//             viewport (b18) and background, true when the image takes the
//             background option (BACKGROUND_PAGES), false when it is always
//             transparent
//   basename  the name of the file, without the game or the extension
//   variation the map variation, for the map documents
//
// options are { cardBleed }: the bleed in units around the single card images
// (0 for none), see the `exports.cards.bleed` of a game
export const documents = (game, config, data, { cardBleed = 0 } = {}) => {
  const { slug } = data;
  const paper = {
    width: config.paper.width,
    height: config.paper.height,
    margins: config.paper.margins,
  };
  const variations = Array.isArray(game.map) ? range(0, game.map.length) : [];
  const docs = [];

  const add = (doc) => {
    docs.push({
      query: {},
      mode: "single",
      formats: ["pdf"],
      size: null,
      paper,
      capture: null,
      ...doc,
      route: `/games/${slug}/${doc.route}`,
    });
  };

  const element = (background = false, selector = ".printElement") => ({
    selector,
    viewport: null,
    background,
  });

  // A document with pdf, png and svg output (the background is no svg), and
  // its paginated version (pdf only),
  // which is only there when the document does not fit on one page
  const paged = (kind, size, variation) => {
    const suffix = variation === undefined ? "" : `-${variation}`;
    const query = variation === undefined ? {} : { variation };
    add({
      id: `${kind}${suffix}`,
      kind,
      route: kind,
      query,
      formats: ["pdf", "png", "svg"],
      size: inches(size),
      capture: element(BACKGROUND_PAGES.includes(kind)),
      basename: `${kind}${suffix}`,
      variation,
    });
    const { pages } = addPaginationData(
      { totalWidth: size.width, totalHeight: size.height },
      config,
    );
    if (pages <= 1) return;
    add({
      id: `${kind}${suffix}/paginated`,
      kind,
      route: kind,
      query: { paginated: "true", ...query },
      mode: "paginated",
      basename: `${kind}${suffix}-paginated`,
      variation,
    });
  };

  // Pages that print more than one element are sheets (pdf only), with a
  // document for each layout when asked for
  // Tokens have no layout in their name unless there are several, and neither
  // do the other sheets with plainSheetNames
  const sheet = (kind, layoutConfig) => {
    const all = config.export && config.export.allLayouts;
    for (const layout of all ? data.layouts[kind] : [layoutConfig.layout]) {
      add({
        id: `${kind}:${layout}`,
        kind,
        route: kind,
        query: all ? { [`config.${kind}.layout`]: layout } : {},
        basename:
          !all && (kind === "tokens" || data.plainSheetNames)
            ? kind
            : `${kind}-${layout}`,
      });
    }
  };

  // Background
  add({
    id: "background",
    kind: "background",
    route: "background",
    formats: ["pdf", "png"],
    size: inches({
      width: printableWidth(config.paper),
      height: printableHeight(config.paper),
    }),
    capture: element(),
    basename: "background",
  });

  // Cards
  if (game.companies || game.privates || game.trains || game.players) {
    sheet("cards", config.cards);
  }

  // Charters
  if (game.companies) {
    add({
      id: "charters",
      kind: "charters",
      route: "charters",
      basename: "charters",
    });
  }

  // Map
  if (game.map) {
    for (const variation of variations.length ? variations : [undefined]) {
      const mapData = getMapData(
        game,
        config.coords,
        config.tiles.mapWidth,
        variation,
      );
      paged(
        "map",
        { width: mapData.totalWidth, height: mapData.totalHeight },
        variation,
      );
    }
  }

  // Market and par
  if (game.stock && game.stock.market) {
    const marketData = getMarketData(game.stock, config);
    paged("market", {
      width: marketData.totalWidth,
      height: marketData.totalHeight,
    });
  }
  if (game.stock && game.stock.par && game.stock.par.values) {
    const parData = getParData(game.stock, config);
    paged("par", { width: parData.totalWidth, height: parData.totalHeight });
  }

  // Revenue
  const revenueData = getRevenueData(game.revenue, config);
  paged("revenue", {
    width: revenueData.totalWidth,
    height: revenueData.totalHeight,
  });

  // Tiles
  if (game.tiles) {
    add({
      id: "tile-manifest",
      kind: "tile-manifest",
      route: "tile-manifest",
      formats: ["pdf", "png"],
      capture: element(true),
      basename: "tile-manifest",
    });
    sheet("tiles", config.tiles);
  }

  // Tokens
  if (game.companies || game.tokens) {
    sheet("tokens", config.tokens);
  }

  // The elements of the sheets, a png each (and an svg for the tokens and
  // tiles, which are svgs)
  const item = ({ selector, formats = ["png"], ...doc }) =>
    add({
      mode: "item",
      formats,
      capture: element(false, selector),
      ...doc,
    });

  // Cards
  const cardSize = (type) => {
    const { bleedWidth, bleedHeight } = getSingleCardData(
      config.cards,
      config.paper,
      type,
      cardBleed,
    );
    return inches({ width: bleedWidth, height: bleedHeight });
  };
  const card = (type, index, basename) =>
    item({
      id: `cards/${type}/${index}`,
      kind: "card",
      route: `cards/${type}/${index}`,
      query: cardBleed > 0 ? { cardBleed } : {},
      size: cardSize(type),
      basename,
    });

  for (const n of range(1, maxPlayers(game.players || []) + 1)) {
    card("number", n, `card-number-${n}`);
  }
  (game.privates || []).forEach((_, i) =>
    card("private", i, `card-private-${i + 1}`),
  );
  const companies =
    applyCompanyOverrides(
      data.companyOverrides,
      compileCompanies(game),
      config.overrideCompanies,
      config.overrideSelection,
    ) || [];
  // Trains owned by companies come after the game's trains
  [
    ...(game.trains || []),
    ...cardCompanyTrains(companies, config.charters, game.trains),
  ].forEach((train, i) =>
    card(
      "train",
      i,
      `card-train-${i + 1}-${safeName(String(train.name).replace(" ", "_"))}`,
    ),
  );

  const shares = flatten(
    map((c) => map((s) => ({ ...s, company: c }), c.shares || []), companies),
  );
  shares.forEach((share, i) =>
    card("share", i, `card-share-${i + 1}-${safeName(share.company.abbrev)}`),
  );

  // Charters
  const charterData = getSingleCharterData(config.charters, config.paper);
  companies.forEach((company, i) =>
    item({
      id: `charters/${i}`,
      kind: "charter",
      route: `charters/${i}`,
      size: inches(
        getCharterSize(
          charterData,
          !!company.minor,
          charterHalfWidth(config.charters, !!company.minor),
        ),
      ),
      basename: `charter-${i + 1}-${safeName(company.abbrev)}`,
    }),
  );

  // Tokens: the companies first, then the extra tokens
  companies.forEach((company, i) =>
    item({
      id: `tokens/${i}`,
      kind: "token",
      route: `tokens/${i}`,
      size: inches(getTokenSize(config.tokens, true)),
      basename: `token-${i + 1}-${safeName(company.abbrev)}`,
      selector: TOKEN_SELECTOR,
      formats: ["png", "svg"],
    }),
  );
  // "quantity" of 0 removes a token, like the token page does
  (game.tokens || [])
    .filter((token) => !(token && token.quantity === 0))
    .forEach((_, i) =>
      item({
        id: `tokens/${i + companies.length}`,
        kind: "token",
        route: `tokens/${i + companies.length}`,
        size: inches(getTokenSize(config.tokens, false)),
        basename: `token-${i + 1 + companies.length}`,
        selector: TOKEN_SELECTOR,
        formats: ["png", "svg"],
      }),
    );

  // Tiles
  if (game.tiles) {
    for (const id of Object.keys(game.tiles)) {
      item({
        id: `tiles/${id}`,
        kind: "tile",
        route: `tiles/${encodeURIComponent(id)}`,
        size: inches(getTileSize(config.tiles.width)),
        basename: `tile-${id.replace(/[^\w.-]+/g, "_")}`,
        formats: ["png", "svg"],
      });
    }
  }

  // Board 18
  for (const doc of b18Images(game, config, data, { slug })) {
    docs.push({ ...doc, paper });
  }

  return docs;
};
