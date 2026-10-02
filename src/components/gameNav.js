import { find } from "ramda";

export const gameNav = [
  {
    key: "1",
    section: "map",
    pagination: true,
    disabled: (game) => !game.map,
  },
  {
    key: "2",
    section: "tiles",
    disabled: (game) => !game.tiles,
  },
  {
    key: "3",
    section: "tokens",
    disabled: (game) => !game.companies && !game.tokens,
  },
  {
    key: "4",
    section: "cards",
  },
  {
    key: "5",
    section: "charters",
    disabled: (game) => !game.companies,
  },
  {
    key: "6",
    section: "market",
    pagination: true,
    disabled: (game) => !game.stock?.market,
  },
  {
    key: "7",
    section: "background",
  },
  {
    section: "par",
    pagination: true,
    disabled: (game) => !game.stock?.par?.values,
  },
  { section: "revenue", pagination: true },
  { section: "tile-manifest", disabled: (game) => !game.tiles },
];

// The first section a game has the data for, the best place to start editing
export const firstSection = (game) =>
  find((item) => !item.disabled?.(game), gameNav).section;
