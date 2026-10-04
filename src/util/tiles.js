import {
  assoc,
  clone,
  concat,
  equals,
  forEach,
  forEachObjIndexed,
  is,
  mapObjIndexed,
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
export const customTiles = (gameTiles) => {
  const custom = {};

  forEachObjIndexed((tile, id) => {
    if (is(Object, tile) && tile.color && !tile.tile) {
      custom[id] = assoc("id", id, tile);
    }
  }, gameTiles || {});

  return custom;
};

// Maps a tile id to the games ({ slug, title, tiles }) that use it: any tile in
// the tiles map of a game (count, alias, extra data or definition), and the
// target of an alias.
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
      credit(id, game);
      if (is(Object, tile) && tile.tile) {
        credit(tile.tile, game);
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
        equals(assoc("id", id, entry.tile), tile),
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
