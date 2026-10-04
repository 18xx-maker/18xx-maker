import {
  assoc,
  clone,
  concat,
  equals,
  forEach,
  forEachObjIndexed,
  is,
  mapObjIndexed,
  omit,
  prop,
  reduce,
  values,
} from "ramda";

const gatherAliases = (tiles, into) => {
  forEachObjIndexed((tile) => {
    forEach((alias) => {
      into[alias] = clone(tile);
    }, tile.aliases || []);
  }, tiles);
};

export const gatherTileColors = (tiles) => {
  return Array.from(
    reduce(
      (acc, tile) => {
        return acc.add(prop("color", tile));
      },
      new Set(["other"]),
      values(tiles),
    ),
  );
};

export const compileTiles = (...tileJSONs) => {
  let aliases = {};

  forEach((tiles) => {
    gatherAliases(tiles, aliases);
  }, tileJSONs);

  let allTiles = reduce(
    (acc, jsons) => ({ ...acc, ...jsons }),
    {},
    concat(tileJSONs, [aliases]),
  );

  return mapObjIndexed((tile, id) => assoc("id", id, tile), allTiles);
};

// Full tile definitions of a game, the same ones Tile.jsx draws as they are:
// a color and no alias target. Aliases and extra data are left out.
const validValues = (values) =>
  values === undefined ||
  (Array.isArray(values) &&
    values.every(
      (v) =>
        is(Object, v) &&
        v !== null &&
        (typeof v.value === "number" || typeof v.value === "string"),
    ));

const isDefinition = (tile) =>
  is(Object, tile) && !Array.isArray(tile) && tile.color && !tile.tile;

export const customTiles = (gameTiles) => {
  const custom = {};

  forEachObjIndexed((tile, id) => {
    if (isDefinition(tile) && validValues(tile.values)) {
      custom[id] = assoc("id", id, tile);
    }
  }, gameTiles || {});

  return custom;
};

// Maps a tile id to the games ({ slug, title, tiles }) that use it: any tile in
// the tiles map of a game (count, alias or extra data), the base id of "a|b"
// ids, and the target of an alias. Full definitions are not credited here.
export const tileUsage = (games) => {
  const usage = {};

  const credit = (id, game) => {
    usage[id] = usage[id] || [];
    if (!usage[id].includes(game)) {
      usage[id].push(game);
    }
  };

  forEach((game) => {
    forEachObjIndexed((tile, id) => {
      // A full definition is credited through the slugs of its entry
      if (isDefinition(tile)) {
        return;
      }
      credit(id, game);
      credit(id.split("|")[0], game);
      if (is(Object, tile) && tile.tile) {
        credit(String(tile.tile), game);
        credit(String(tile.tile).split("|")[0], game);
      }
    }, game.tiles || {});
  }, games);

  return usage;
};

// The generic tiles followed by the custom tiles of every game. A custom tile
// the same as one already listed is not listed again, its game is added to
// that entry's slugs. A different definition for the same id is its own entry.
// An entry is { key, id, tile, gameTiles, slugs }; key is only for React.
export const mergeKnownTiles = (generic, games) => {
  const entries = values(generic).map((tile) => ({
    key: tile.id,
    id: tile.id,
    tile,
    gameTiles: undefined,
    slugs: undefined,
  }));
  const byId = {};
  forEach((entry) => {
    byId[entry.id] = [entry];
  }, entries);

  forEach((game) => {
    forEachObjIndexed((tile, id) => {
      const same = (byId[id] || []).find((entry) =>
        equals(
          omit(["quantity"], assoc("id", id, entry.tile)),
          omit(["quantity"], tile),
        ),
      );

      if (same) {
        if (same.slugs && !same.slugs.includes(game.slug)) {
          same.slugs.push(game.slug);
        }
        return;
      }

      const entry = {
        key: JSON.stringify([game.slug, id]),
        id,
        tile,
        gameTiles: game.tiles,
        slugs: [game.slug],
      };
      byId[id] = [...(byId[id] || []), entry];
      entries.push(entry);
    }, customTiles(game.tiles));
  }, games);

  return entries;
};
