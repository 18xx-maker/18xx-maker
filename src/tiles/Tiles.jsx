import React from "react";
import * as R from "ramda";

import  * as tiles from "../data/tiles";
import Tile from "../Tile";

import Svg from "../Svg";
import ColorContext from "../context/ColorContext";

const Tiles = ({color}) => {
  let ids = R.sortWith(
    [
      R.ascend(id => Number(id.split("|")[0] || 0)),
      R.ascend(id => Number(id.split("|")[1] || 0))
    ],
    R.keys(tiles[color])
  );

  let tileNodes = R.map(id => {
    return (
      <Svg key={id}
           width="200"
           height="200"
           viewBox="-100 -100 200 200"
           transform="rotate(-90)">
        <Tile id={id} width={150} x={0} y={0} />
      </Svg>
    );
  }, ids);

  return (
    <ColorContext.Provider value="tile">
      <div className="tiles">{tileNodes}</div>
    </ColorContext.Provider>
  );
};

export default Tiles;
