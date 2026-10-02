/* eslint-disable testing-library/no-container, testing-library/no-node-access -- the element an export captures is found by its selector */
import { waitFor } from "@testing-library/react";

import { companies as companyOverrides } from "@/data";
import tiles from "@/data/tiles";
import config from "@/defaults.json";
import schema from "@/schemas/config.schema.json";
import { documents } from "#export/documents";
import { docPath } from "#export/names";
import { resolveConfig } from "#util/resolveConfig";

import { allowConsole } from "@tests/console.js";
import { gameSlugs, renderApp } from "@tests/helpers.jsx";
import { findGame } from "@tests/smoke.js";

const layouts = (name) => schema.properties[name].properties.layout.enum;

// One document of each kind and size, the sizes of a kind are the same for
// all of its elements except for a few (minor charters, extra tokens)
const sample = (docs) => {
  const seen = new Set();
  return docs.filter((doc) => {
    const key = [
      doc.kind,
      doc.route.replace(/^(\/games\/[^/]+\/(?:cards\/[a-z]+|\w+))\/.*$/, "$1"),
      JSON.stringify(doc.size),
    ].join();
    return !seen.has(key) && seen.add(key);
  });
};

const sizeOf = (slug) => {
  const game = findGame(slug);
  const resolved = resolveConfig({
    defaults: config,
    gameConfig: game.config,
  }).config;
  return documents(game, resolved, {
    slug,
    tiles,
    companyOverrides,
    layouts: {
      cards: layouts("cards"),
      tiles: layouts("tiles"),
      tokens: layouts("tokens"),
    },
  })
    .filter((doc) => doc.size && doc.formats.includes("png"))
    .map((doc) => ({ ...doc, slug }));
};

// Known data bugs, see tests/smoke.js: duplicate React keys
const sameKey = {
  "1871BC": ["map"],
  "18NC": ["map"],
  "18TraXX2020": ["map"],
  "18EB": ["charters/9"],
};

// The documents' sizes are what the pages render, in inches at 96 pixels
describe.each(gameSlugs)("%s export sizes", (slug) => {
  it.each(sample(sizeOf(slug)).map((doc) => [doc.id, doc]))(
    "%s is as big as its page",
    async (id, doc) => {
      if (sameKey[slug]?.includes(doc.id)) allowConsole(/same key/);
      const url = docPath(doc);
      const { container } = renderApp(
        `${url}${url.includes("?") ? "&" : "?"}print=true`,
      );

      await waitFor(() =>
        expect(container.querySelector(doc.capture.selector)).not.toBeNull(),
      );
      const box = container
        .querySelector(doc.capture.selector)
        .getBoundingClientRect();

      expect(box.width / 96).toBeCloseTo(doc.size.widthIn, 1);
      expect(box.height / 96).toBeCloseTo(doc.size.heightIn, 1);
    },
  );
});
