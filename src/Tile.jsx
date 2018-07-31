import React from "react";
import tiles from "./data/tiles";

import Hex from "./Hex";

const Tile = ({ id, border }) => {
  let hex = tiles[id];

  // If the full id doesn't exist check for only the base
  if (!hex) {
    let [idBase] = id.split("|");
    hex = tiles[idBase];
  }

  if(!hex) {
    return null;
  }

  return <Hex hex={hex} id={id} border={border} />;
};

export default Tile;
