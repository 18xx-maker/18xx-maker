import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { tiles as tileDefs } from "@18xx-maker/games";

import Svg from "../../../Svg";
import Tile from "../../../Tile";

import compose from "ramda/src/compose";
import filter from "ramda/src/filter";
import is from "ramda/src/is";
import keys from "ramda/src/keys";
import map from "ramda/src/map";
import propEq from "ramda/src/propEq";
import take from "ramda/src/take";
import uniq from "ramda/src/uniq";

import ColorContext from "../../../context/ColorContext";
import GameContext from "../../../context/GameContext";
import RotateContext from "../../../context/RotateContext";

import { getTile } from "../../../util";

import "./b18.scss";

const ROTATIONS = [0,60,120,180,240,300];

const Tiles = () => {
  const { game } = useContext(GameContext);
  let params = useParams();
  let color = params.color;

  let getGameTile = getTile(tileDefs, game.tiles || {});

  let tiles = compose(uniq,
                      filter(propEq("color", color)),
                      map(getGameTile))(keys(game.tiles));

  let height = game.info.orientation === "horizontal" ? 100 : 116;
  let width = game.info.orientation === "horizontal" ? 116 : 100;

  // Hardcoding tile width here since this is only for b18 output
  let totalWidth = (tiles.length * 150);

  // Same as above
  let viewBox = game.info.orientation === "horizontal" ?
      "-87.6025 -76 175.205 152" :
      "-76 -87.6025 152 175.205";

  let tileNodes = map(tile => {
    // Figure out rotations
    let rotations = ROTATIONS;
    if(is(Number, tile.rotations)) {
      rotations = take(tile.rotations, ROTATIONS);
    } else if(is(Array, tile.rotations)) {
      rotations = tile.rotations;
    }
    rotations = map(r => r + (game.info.orientation === "horizontal" ? 0 : 30),
                    rotations);

    return (
      <div key={tile.id}
           className={`tile tile-${tile.id}`}>
        {map(rotation => (
          <div key={`tile-${tile.id}-${rotation}`} className="tile-rotation">
            <Svg
              preserveAspectRatio="none"
              style={{width: `${width}px`,
                      height: `${height}px`}}
              viewBox={viewBox}>
              <g transform={`rotate(${rotation})`}>
                <RotateContext.Provider value={rotation}>
                  <Tile id={tile.id} border={true} gameTiles={game.tiles} />
                </RotateContext.Provider>
              </g>
            </Svg>
          </div>
        ), rotations)}
      </div>
    );}, tiles);

  return (
    <ColorContext.Provider value="tile">
      <div className="b18"
           style={{width: `${totalWidth}px`}}>
        <div className={`tiles ${color}`}>
          {tileNodes}
        </div>
      </div>
      <style>{`@media print {@page {size: ${totalWidth}px 900px;}}`}</style>
    </ColorContext.Provider>
  );
};

export default Tiles;
