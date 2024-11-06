import yellow from "./yellow";
import green from "./green";
import brown from "./brown";
import gray from "./gray";
import other from "./other";

import { assoc, clone, mapObjIndexed, forEach, forEachObjIndexed } from "ramda";

let aliases = {};
const gatherAliases = (tiles) => {
  forEachObjIndexed((tile, id) => {
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
