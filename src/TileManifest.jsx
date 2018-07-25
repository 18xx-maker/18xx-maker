import React from "react";
import * as R from "ramda";
import tiles from "./data/tiles";

import Tile from "./Tile";
import Svg from "./Svg";

import games from "./data/games";

import "./TileManifest.css";

const HEX_RATIO = 0.57735;

const getCol = id => {
  let tile = tiles[id];
  switch (tile.color) {
    case "yellow":
      return 1;
    case "green":
      return 2;
    case "brown":
      return 3;
    default:
      return 4;
  }
};

const TileManifest = ({ match }) => {
  let game = games[match.params.game];
  let ids = R.sort(R.ascend(id => id.padStart(3, "0")), R.keys(game.tiles));

  let tiles = R.addIndex(R.map)(
    (id, i) => (
      <div
        key={i}
        className="TileManifest--Tile"
        style={{ gridColumn: `${getCol(id)} / span 1` }}
      >
        <div className="TileManifest--Image">
          <Svg
            key={`${id}-${i}`}
            style={{
              height: "0.4in",
              width: "0.46188in"
            }}
            viewBox={`-86.6025 -75 173.205 150`}
          >
            <Tile id={id} />
          </Svg>
        </div>
        <div className="TileManifest--Id">{id}</div>
        <div className="TileManifest--Quantity">{game.tiles[id]}x</div>
      </div>
    ),
    ids
  );

  return (
    <div className="TileManifest">
      <div className="TileManifest--Title">{game.info.title} Tile Manifest</div>
      {tiles}
      <div className="PrintNotes">
        Tile Manifest is meant to be printed in <b>portait</b> mode
      </div>
    </div>
  );
};

export default TileManifest;
