import { assoc, clone, forEach, forEachObjIndexed, mapObjIndexed } from "ramda";

import brown from "@/data/tiles/brown.json" with { type: "json" };
import gray from "@/data/tiles/gray.json" with { type: "json" };
import green from "@/data/tiles/green.json" with { type: "json" };
import other from "@/data/tiles/other.json" with { type: "json" };
import yellow from "@/data/tiles/yellow.json" with { type: "json" };

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
