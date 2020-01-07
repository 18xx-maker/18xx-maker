import yellow from "./yellow";
import green from "./green";
import brown from "./brown";
import gray from "./gray";

import clone from "ramda/src/clone";
import forEach from "ramda/src/forEach";
import forEachObjIndexed from "ramda/src/forEachObjIndexed";

let aliases = {};
const gatherAliases = (tiles) => {
  forEachObjIndexed((tile, id) => {
    forEach(alias => {
      aliases[alias] = clone(tile);
    }, tile.aliases || []);
  }, tiles);
}

gatherAliases(yellow);
gatherAliases(green);
gatherAliases(brown);
gatherAliases(gray);

export default {
  ...yellow,
  ...green,
  ...brown,
  ...gray,
  ...aliases
};
