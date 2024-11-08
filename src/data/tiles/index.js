import yellow from "./yellow.json" with { type: "json" };
import green from "./green.json" with { type: "json" };
import brown from "./brown.json" with { type: "json" };
import gray from "./gray.json" with { type: "json" };
import other from "./other.json" with { type: "json" };

import { assoc, clone, mapObjIndexed, forEach, forEachObjIndexed } from "ramda";

let aliases = {};
const gatherAliases = (tiles) => {
  forEachObjIndexed((tile) => {
    forEach((alias) => {
      aliases[alias] = clone(tile);
    }, tile.aliases || []);
  }, tiles);
};

gatherAliases(yellow);
gatherAliases(green);
gatherAliases(brown);
gatherAliases(gray);
gatherAliases(other);

const allTiles = {
  ...yellow,
  ...green,
  ...brown,
  ...gray,
  ...other,
  ...aliases,
};

export default mapObjIndexed((tile, id) => assoc("id", id, tile), allTiles);
