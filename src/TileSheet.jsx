import React from "react";
import * as R from "ramda";
import { paper } from "./data";

import Tile from "./Tile";

import games from "./data/games";

const groupsOf = R.curry(function group(n, list) {
  return R.isEmpty(list)
    ? []
    : R.prepend(R.take(n, list), group(n, R.drop(n, list)));
});

const HEX_RATIO = 0.57735;
const RATIO = 0.966666667;

const TileSheet = ({ match }) => {
  let game = games[match.params.game];
  let width = game.info.width;
  let height = width * HEX_RATIO * 2;
  let tileHeight = width * RATIO;
  let tileWidth = 2 * width * HEX_RATIO * RATIO;
  let perRow = Math.floor((paper.width - 0.5 * tileWidth) / tileWidth);
  let ids = R.chain(k => Array(game.tiles[k]).fill(k), R.keys(game.tiles));

  let tiles = R.map(
    row => (
      <div className="row">
        {R.map(
          id => (
            <svg
              width={tileWidth}
              height={tileHeight}
              viewBox={`${height * -0.5} ${width * -0.5} ${height} ${width}`}
              transform="rotate(-90)"
            >
              <Tile id={id} />
            </svg>
          ),
          row
        )}
      </div>
    ),
    groupsOf(perRow, ids)
  );

  return <div className="tileSheet">{tiles}</div>;
};

export default TileSheet;
