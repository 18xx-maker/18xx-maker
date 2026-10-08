import { is } from "ramda";

import Hex from "@/components/Hex";
import Id from "@/components/atoms/Id";

import { tiles } from "@/data";

const Tile = ({ id, border, clipPath, gameTiles }) => {
  let hex = null;
  let [idBase, idExtra] = id.split("|");
  // A tile of the library by its id, or by the id without the variant
  const lib = (key) => tiles[key] || tiles[key.split("|")[0]];

  if (gameTiles) {
    // Check to make sure we don't need to use aliases or custom tiles
    if (is(Object, gameTiles[id])) {
      if (gameTiles[id].tile) {
        // This is an alias
        hex = lib(gameTiles[id].tile);
      } else if (!gameTiles[id].color) {
        // This is just extra data
        hex = { ...lib(id), ...gameTiles[id] };
      } else {
        // This is a full tile definition
        hex = gameTiles[id];
      }
    }
  }

  if (!hex) {
    hex = lib(id);
  }

  return hex ? (
    <Hex hex={hex} id={id} clipPath={clipPath} border={border} />
  ) : (
    <Id id={idBase} extra={idExtra} />
  );
};

export default Tile;
