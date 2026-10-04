import { keys, map, path } from "ramda";

import { companyThemes, mapThemes } from "@/data";

const getThemeOptions = (theme) =>
  map(
    (value) => ({
      value,
      label: path([value, "name"], theme),
    }),
    keys(theme),
  );

export const sections = [
  {
    section: "colors",
    items: [
      {
        name: "theme",
        root: true,
        options: getThemeOptions(mapThemes),
        themePreview: "map",
      },
      {
        name: "companiesTheme",
        root: true,
        options: getThemeOptions(companyThemes),
        themePreview: "companies",
      },
      {
        group: [
          {
            name: "companySvgLogos",
            root: true,
          },
          {
            name: "overrideCompanies",
            root: true,
          },
        ],
      },
    ],
  },
  {
    section: "export",
    items: [
      {
        name: "allLayouts",
      },
    ],
  },
  {
    section: "layout",
    items: [
      {
        group: [
          {
            name: "margin",
            root: true,
            dimension: true,
          },
        ],
      },
      {
        group: [
          {
            name: "paperWidth",
            path: "paper.width",
            dimension: true,
            description: false,
          },
          {
            name: "paperHeight",
            path: "paper.height",
            dimension: true,
            description: false,
          },
        ],
      },
      {
        name: "paperMargins",
        path: "paper.margins",
        dimension: true,
        description: false,
      },
      {
        note: "paperSize",
      },
    ],
  },
  {
    section: "tokens",
    items: [
      {
        group: [
          {
            name: "layout",
          },
          {
            name: "reverseMarketTokens",
          },
        ],
      },
      {
        group: [
          {
            name: "marketTokenSize",
            dimension: true,
          },
          {
            name: "stationTokenSize",
            dimension: true,
          },
        ],
      },
      {
        name: "generalTokenSize",
        dimension: true,
      },
    ],
  },
  {
    section: "maps",
    items: [
      {
        name: "coords",
        root: true,
      },
      {
        name: "straightCityNames",
        root: true,
      },
      {
        name: "plainMapCompanies",
        root: true,
      },
      {
        name: "tileCompanies",
        root: true,
      },
      {
        group: [
          { name: "cutlines", root: true, dimension: true, description: false },
          {
            name: "cutlinesOffset",
            root: true,
            dimension: true,
            description: false,
          },
        ],
      },
      {
        group: [
          { name: "margin", root: true, dimension: true, description: false },
          { name: "bleed", root: true, dimension: true, description: false },
        ],
      },
      {
        note: "pagination",
      },
      {
        name: "market",
      },
      {
        name: "players",
      },
      {
        name: "roundTracker",
      },
    ],
  },
  {
    section: "tiles",
    items: [
      {
        group: [
          {
            name: "layout",
          },
          {
            name: "id",
          },
        ],
      },
      {
        group: [
          {
            name: "width",
            dimension: true,
          },
          {
            name: "mapWidth",
            dimension: true,
          },
        ],
      },
      {
        name: "colorblind",
      },
      {
        name: "gaps",
      },
      {
        name: "cutBorder",
      },
      {
        pins: true,
      },
    ],
  },
  {
    section: "stock",
    items: [
      {
        group: [
          {
            name: "cellWidth",
            path: "stock.cell.width",
            dimension: true,
          },
          {
            name: "cellHeight",
            path: "stock.cell.height",
            dimension: true,
          },
        ],
      },
      {
        group: [
          {
            name: "value",
          },
          {
            name: "arrows",
          },
        ],
      },
      {
        group: [
          {
            name: "column",
          },
          {
            name: "diag",
          },
        ],
      },
      {
        name: "par",
      },
      {
        group: [
          { name: "cutlines", root: true, dimension: true, description: false },
          {
            name: "cutlinesOffset",
            root: true,
            dimension: true,
            description: false,
          },
        ],
      },
      {
        group: [
          { name: "margin", root: true, dimension: true, description: false },
          { name: "bleed", root: true, dimension: true, description: false },
        ],
      },
      {
        note: "pagination",
      },
      {
        name: "displayLegend",
        path: "stock.display.legend",
      },
      {
        name: "displayPar",
        path: "stock.display.par",
      },
      {
        name: "displayRoundTracker",
        path: "stock.display.roundTracker",
      },
    ],
  },
  {
    section: "charters",
    items: [
      {
        group: [
          {
            name: "style",
          },
          {
            name: "layout",
          },
        ],
      },
      {
        name: "halfWidth",
      },
      {
        name: "halfWidthMinors",
      },
      {
        name: "smallerMinors",
      },
      {
        group: [
          {
            name: "cutlines",
            dimension: true,
          },
          {
            name: "bleed",
            dimension: true,
          },
        ],
      },
      {
        name: "border",
      },
      {
        name: "showPhaseChart",
      },
      {
        name: "showTurnOrder",
      },
      {
        name: "trainCards",
      },
      {
        name: "trainCardBorder",
      },
      {
        name: "trainCardRound",
      },
      {
        name: "blackBand",
      },
      {
        pins: true,
      },
    ],
  },
  {
    section: "cards",
    items: [
      {
        group: [
          {
            name: "shareStyle",
          },
          {
            name: "layout",
          },
        ],
      },
      {
        group: [
          { name: "width", dimension: true, description: false },
          { name: "height", dimension: true, description: false },
        ],
      },
      {
        group: [
          { name: "cutlines", dimension: true, description: false },
          { name: "bleed", dimension: true, description: false },
        ],
      },
      {
        group: [
          { name: "padding", dimension: true, description: false },
          { name: "dtgPadding", dimension: true, description: false },
        ],
      },
      {
        note: "sizes",
      },
      {
        group: [
          {
            name: "typeSizes.private.width",
            path: "cards.sizes.private.width",
            dimension: true,
            clearable: true,
            inherit: "cards.width",
            description: false,
          },
          {
            name: "typeSizes.private.height",
            path: "cards.sizes.private.height",
            dimension: true,
            clearable: true,
            inherit: "cards.height",
            description: false,
          },
        ],
      },
      {
        group: [
          {
            name: "typeSizes.share.width",
            path: "cards.sizes.share.width",
            dimension: true,
            clearable: true,
            inherit: "cards.width",
            description: false,
          },
          {
            name: "typeSizes.share.height",
            path: "cards.sizes.share.height",
            dimension: true,
            clearable: true,
            inherit: "cards.height",
            description: false,
          },
        ],
      },
      {
        group: [
          {
            name: "typeSizes.train.width",
            path: "cards.sizes.train.width",
            dimension: true,
            clearable: true,
            inherit: "cards.width",
            description: false,
          },
          {
            name: "typeSizes.train.height",
            path: "cards.sizes.train.height",
            dimension: true,
            clearable: true,
            inherit: "cards.height",
            description: false,
          },
        ],
      },
      {
        group: [
          {
            name: "typeSizes.number.width",
            path: "cards.sizes.number.width",
            dimension: true,
            clearable: true,
            inherit: "cards.width",
            description: false,
          },
          {
            name: "typeSizes.number.height",
            path: "cards.sizes.number.height",
            dimension: true,
            clearable: true,
            inherit: "cards.height",
            description: false,
          },
        ],
      },
      {
        note: "typeSizesNote",
      },
      {
        name: "border",
      },
      {
        name: "blackBand",
      },
      {
        pins: true,
      },
    ],
  },
  {
    section: "privates",
    items: [
      {
        name: "style",
      },
    ],
  },
  {
    section: "trains",
    items: [
      {
        name: "style",
      },
      {
        name: "images",
      },
    ],
  },
  {
    section: "currency",
    items: [
      {
        note: "description",
      },
      {
        name: "bank",
      },
      {
        name: "border",
      },
      {
        name: "capital",
      },
      {
        name: "market",
      },
      {
        name: "offboard",
      },
      {
        name: "par",
      },
      {
        name: "private",
      },
      {
        name: "revenue",
      },
      {
        name: "terrain",
      },
      {
        name: "token",
      },
      {
        name: "train",
      },
      {
        name: "treasury",
      },
      {
        name: "value",
      },
    ],
  },
  {
    section: "data",
  },
];
