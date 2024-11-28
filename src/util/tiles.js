import {
  assoc,
  clone,
  concat,
  forEach,
  forEachObjIndexed,
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
