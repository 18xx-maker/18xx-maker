import React from "react";
import * as R from "ramda";
import tiles from "./data/tiles";

import Tile from "./Tile";
import Svg from "./Svg";

import games from "./data/games";
import ColorContext from "./context/ColorContext";

import "./TileManifest.css";

const getCol = id => {
  let tile = tiles[id];

  if (!tile) {
    let [idBase] = id.split("|");
    tile = tiles[idBase];
  }

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

  let ids = R.sortWith(
    [
      R.ascend(id => Number(id.split("|")[0] || 0)),
      R.ascend(id => Number(id.split("|")[1] || 0))
    ],
    R.keys(game.tiles)
  );

  let tileNodes = R.addIndex(R.map)((id, i) => {
    let [idBase, idExtra] = id.split("|");
    if (!tiles[id] && !tiles[idBase]) return null;
    let tile = game.tiles[id] || game.tiles[idBase];
    let quantity = R.is(Object, tile) ? R.propOr(1, "quantity", tile) : tile;
    return (
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
        <div className="TileManifest--Id">
          {idBase}
          {idExtra && ` (${idExtra})`}
        </div>
        <div className="TileManifest--Quantity">{quantity}x</div>
      </div>
    );
  }, ids);

  return (
    <ColorContext.Provider value="tile">
      <div className="PrintNotes">
        <div><p>Tile Manifest is meant to be printed in <b>portait</b> mode</p></div>
      </div>
      <div className="TileManifest">
        <div className="TileManifest--Title">{game.info.title} Tile Manifest</div>
        {tileNodes}
      </div>
    </ColorContext.Provider>
  );
};

export default TileManifest;
