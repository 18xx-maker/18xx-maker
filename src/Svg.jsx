import React from "react";
import * as R from "ramda";

import Hex from "./Hex";
import Tile from "./Tile";
import tiles from "./data/tiles";
import game from "./data/games/1830";

const getX = index => {
  return 150 * (index % 7) + 100;
};

const getY = index => {
  let div = Math.floor(index / 7);
  let odd = (index % 7) % 2 === 0;
  return (173 * div) + 100 + (odd ? 0 : 87);
};

const Svg = () => {
  let ids = R.chain(k => Array(game.tiles[k]).fill(k), R.keys(game.tiles));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css?family=Limelight');
        </style>
      </defs>

      {R.addIndex(R.map)(
        (id, index) => (
          <Tile
            id={id}
            width={150}
            x={getX(index)}
            y={getY(index)}
          />
        ),
        ids
      )}
    </svg>
  );
};

export default Svg;
