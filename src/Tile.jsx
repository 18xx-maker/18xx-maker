import React from "react";
import tiles from "./data/tiles";

import Hex from "./Hex";

const Tile = ({ id, border }) => {
  let hex = tiles[id];

  return <Hex hex={hex} id={id} border={border} />;
};

export default Tile;
