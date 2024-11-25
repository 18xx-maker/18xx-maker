import { is } from "ramda";

import Hex from "./Hex";
import Id from "./atoms/Id";
import { tiles } from "./data";

const Tile = ({ id, border, clipPath, gameTiles }) => {
  let hex = null;

  if (gameTiles) {
    // Check to make sure we don't need to use aliases or custom tiles
    if (is(Object, gameTiles[id])) {
      if (gameTiles[id].tile) {
        // This is an alias
        hex = tiles[gameTiles[id].tile];
      } else if (!gameTiles[id].color) {
        // This is just extra data
        hex = { ...tiles[id], ...gameTiles[id] };
      } else {
        // This is a full tile definition
        hex = gameTiles[id];
      }
    }
  }

  let [idBase, idExtra] = id.split("|");

  if (!hex) {
    hex = tiles[id];

    if (!hex) {
      hex = tiles[idBase];
    }
  }

  return hex ? (
    <Hex hex={hex} id={id} clipPath={clipPath} border={border} />
  ) : (
    <Id id={idBase} extra={idExtra} />
  );
};

export default Tile;
