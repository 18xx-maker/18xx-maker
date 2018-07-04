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
  return 173 * div + 100 + (odd ? 0 : 87);
};

const Svg = () => {
  let ids = R.chain(k => Array(game.tiles[k]).fill(k), R.keys(game.tiles));

  let tiles = R.addIndex(R.map)(
    (id, index) => (
      <svg width="174" height="150" viewBox="-87 -75 174 150" transform="rotate(-90)">
        <Tile id={id} />
      </svg>
    ),
    ids
  );

  return <div className="tileSheet">{tiles}</div>;
};

export default Svg;
