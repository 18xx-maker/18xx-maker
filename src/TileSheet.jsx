import React from "react";
import * as R from "ramda";
import { paper } from "./data";

import tileDefs from "./data/tiles";
import util from "./util";
import Tile from "./Tile";
import Svg from "./Svg";

import games from "./data/games";

const HEX_RATIO = 0.57735;
const RATIO = 1.0;

const tileColors = ["yellow", "green", "brown", "gray"];

const TileSheet = ({ match }) => {
  let game = games[match.params.game];
  let height = game.info.width;
  let width = height * HEX_RATIO * 2;
  let tileHeight = height * RATIO;
  let tileWidth = width * RATIO;
  let perRow = Math.floor(paper.width / (tileWidth + 12.5));
  let ids = R.sortWith(
    [
      R.ascend(id => tileColors.indexOf((tileDefs[id] || tileDefs[id.split("|")[0]] || {color:"other"}).color)),
      R.ascend(id => Number(id.split("|")[0] || 0)),
      R.ascend(id => Number(id.split("|")[1] || 0))
    ],
    R.chain(k => Array(game.tiles[k]).fill(k), R.keys(game.tiles))
  );

  let tiles = R.addIndex(R.map)(
    (row, i) => (
      <div
        key={i}
        className="row"
        style={{ width: `${(perRow * (tileWidth + 12.5) - 12.5) * 0.01}in` }}
      >
        {R.addIndex(R.map)(
          (id, i) => (
            <Svg
              key={`${id}-${i}`}
              style={{
                width: `${tileWidth * 0.01}in`,
                height: `${tileHeight * 0.01}in`
              }}
              viewBox={`-86.6025 -75 173.205 150`}
            >
              <Tile id={id} />
            </Svg>
          ),
          row
        )}
      </div>
    ),
    util.groupsOf(perRow, ids)
  );

  return (
    <div className="tileSheet">
      <div className="PrintNotes">
        Tiles are meant to be printed in <b>portait</b> mode
      </div>
      {tiles}
    </div>
  );
};

export default TileSheet;
