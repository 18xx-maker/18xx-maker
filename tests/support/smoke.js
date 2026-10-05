import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import games from "@/data/games";
import { compileCompanies } from "@/util/companies/companies";

import { allowConsole } from "@tests/support/console.js";
import { gameSlugs, renderApp } from "@tests/support/helpers.jsx";

const always = () => true;

// Every game page. path is relative to /games/:slug/. A page the game has
// data for renders its own testid (game-<slug><suffix>). Pages whose game
// lacks the data redirect to the game's info page (unless redirects is false).
const page = (id, suffix, has = always, extra = {}) => ({
  has,
  id,
  path: () => id,
  redirects: true,
  suffix,
  ...extra,
});

export const parts = [
  page("info", "", always, { path: () => "" }),
  page("background", "-background"),
  page("cards", "-cards"),
  page("charters", "-charters", (g) => !!g.companies),
  page("map", "-map", (g) => !!g.map),
  page("map?paginated=true", "-map-paginated", (g) => !!g.map),
  page("market", "-market", (g) => !!g.stock?.market),
  page("market?paginated=true", "-market-paginated", (g) => !!g.stock?.market),
  page("par", "-par", (g) => !!g.stock?.par?.values),
  page("par?paginated=true", "-par-paginated", (g) => !!g.stock?.par?.values),
  page("revenue", "-revenue"),
  page("revenue?paginated=true", "-revenue-paginated"),
  page("tile-manifest", "-tile-manifest", (g) => !!g.tiles),
  page("tiles", "-tiles", (g) => !!g.tiles),
  page("tokens", "-tokens", (g) => !!g.companies || !!g.tokens),
];

// B18 tiles and tokens do not redirect, so are only tested with data
export const b18 = [
  page("b18/map", "-b18-map", (g) => !!g.map),
  ...["yellow", "green", "brown"].map((color) =>
    page(`b18/tiles/${color}`, "-b18-tiles", (g) => !!g.tiles, {
      redirects: false,
    }),
  ),
  page("b18/tokens", "-b18-tokens", always, { redirects: false }),
];

// Single element pages. The card page throws for a card that does not exist,
// so only the card types a game has are tested (index 0 is the first of each)
const card = (type, has) =>
  page(`cards/${type}/0`, "-card", has, { redirects: false });

export const single = [
  card("private", (g) => g.privates?.length > 0),
  card("share", (g) => compileCompanies(g).some((c) => c.shares?.length > 0)),
  card("train", (g) => g.trains?.length > 0),
  card("number", always),
  page("charters/0", "-charter", (g) => !!g.companies),
  page("tiles/:id", "-tile", (g) => !!g.tiles, {
    path: (g) =>
      `tiles/${encodeURIComponent(g.tiles ? Object.keys(g.tiles)[0] : "1")}`,
  }),
  page("tokens/0", "-token", always),
  // Not a print page, so not in the snapshots
  page("problems", "-problems", always, { redirects: false }),
  page("changes", "-changes", always, { redirects: false }),
  page("history", "-history", always, { redirects: false }),
];

export const groups = { b18, parts, single };

export const findGame = (slug) =>
  Object.values(games).find((g) => g.meta.slug === slug);

// Console output that is known and expected, by game slug and page id. These
// are real data bugs. The test fails if the output stops, so fix the data
// and remove the entry.
// TODO: map hexes defined twice (duplicate React key) in 1871BC, 18NC and
// 18TraXX2020 (D26, E23, J8, F4)
// TODO: 18EB defines two trains named "5", so the charters phase table
// renders duplicate <li> keys
const sameKey = (key) => new RegExp(`same key[\\s\\S]*\\b${key}\\b`);
const mapKeys = {
  "1871BC": ["F10"],
  "18NC": ["C14"],
  "18TraXX2020": ["D26", "E23", "J8", "F4"],
};
const knownConsole = {
  ...Object.fromEntries(
    Object.entries(mapKeys).map(([slug, keys]) => {
      const patterns = keys.map(sameKey);
      return [
        slug,
        {
          "b18/map": patterns,
          map: patterns,
          "map?paginated=true": patterns,
        },
      ];
    }),
  ),
  "18EB": { charters: [/same key/] },
};

const shardOf = (shard, count) =>
  gameSlugs.filter((_, index) => index % count === shard);

// Defines a describe per game with a test per page the game has data for.
// Shard the games over several files to run them in parallel.
export const gamePages = (group, shard = 0, count = 1) => {
  describe.each(shardOf(shard, count))(`%s ${group} pages`, (slug) => {
    const game = findGame(slug);

    groups[group]
      .filter((entry) => entry.has(game))
      .forEach((entry) => {
        it(`${entry.id} can load and display`, async () => {
          knownConsole[slug]?.[entry.id]?.forEach(allowConsole);
          renderApp(`/games/${slug}/${entry.path(game)}`);
          expect(
            await screen.findByTestId(`game-${slug}${entry.suffix}`),
          ).toBeInTheDocument();
        });
      });
  });
};

// A game lacking the data for a page, for testing the redirect
export const lackingGame = (entry) =>
  gameSlugs.map(findGame).find((game) => !entry.has(game));

// The app page is electron only, everyone else goes home
export const routes = [
  ["/", "home"],
  ["/elements", "atoms"],
  ["/elements/tiles", "tiles"],
  ["/elements/logos", "logos"],
  ["/elements/positioning", "positioning"],
  ["/games", "games"],
  ["/app", "home"],
  ["/settings", "settings"],
];

export const docs = Object.keys(
  import.meta.glob("../../src/docs/**/*.en.md", { eager: false }),
).map((file) => file.replace("../../src/docs/", "").replace(/\.en\.md$/, ""));

export const docsUrl = (doc) => (doc === "index" ? "/docs" : `/docs/${doc}`);

// Every URL the smoke tests visit
export const visitedUrls = () => [
  ...routes.map(([url]) => url),
  ...docs.map(docsUrl),
  ...gameSlugs.flatMap((slug) => {
    const game = findGame(slug);
    return Object.values(groups).flatMap((entries) =>
      entries
        .filter((entry) => entry.has(game))
        .map((entry) => `/games/${slug}/${entry.path(game)}`),
    );
  }),
];
