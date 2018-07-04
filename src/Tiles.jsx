import React from "react";
import * as R from "ramda";

import tiles from "./data/tiles";
import Tile from "./Tile";

const Tiles = () => {
  let tileNodes = R.map(id => {
    return (
      <svg width="200" height="200" viewBox="-100 -100 200 200" transform="rotate(-90)">
        <Tile id={id} width={150} x={0} y={0} />
      </svg>
    );
  }, R.keys(tiles));

  return <div className="tiles">{tileNodes}</div>;
};

export default Tiles;
