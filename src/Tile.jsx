import React from "react";
import tiles from "./data/tiles";

import Hex from "./Hex";
import Id from "./atoms/Id";

const Tile = ({ id, border, mask }) => {
  let [idBase, idExtra] = id.split("|");
  let hex = tiles[id];

  if(!hex) {
    hex = tiles[idBase];
  }

  if(hex) {
    return <Hex hex={hex} id={id} mask={mask} border={border} />;
  } else {
    return <Id id={idBase} extra={idExtra} />;
  }
};

export default Tile;
