import React from "react";
import * as R from "ramda";

import tiles from "./data/tiles";
import Tile from "./Tile";

import Svg from "./Svg";

const Tiles = () => {
  let tileNodes = R.map(id => {
    return (
      <Svg width="200" height="200" viewBox="-100 -100 200 200" transform="rotate(-90)">
        <Tile id={id} width={150} x={0} y={0} />
      </Svg>
    );
  }, R.keys(tiles));

  return <div className="tiles">{tileNodes}</div>;
};

export default Tiles;
