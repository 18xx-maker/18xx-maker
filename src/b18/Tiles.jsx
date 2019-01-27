import React from "react";
import tileDefs from "../data/tiles";

import Svg from "../Svg";
import Tile from "../Tile";

import assoc from "ramda/es/assoc";
import compose from "ramda/es/compose";
import filter from "ramda/es/filter";
import is from "ramda/es/is";
import keys from "ramda/es/keys";
import map from "ramda/es/map";
import prop from "ramda/es/prop";
import propEq from "ramda/es/propEq";
import take from "ramda/es/take";

import ColorContext from "../context/ColorContext";
import RotateContext from "../context/RotateContext";

import "./b18.scss";

import games from "../data/games";

const getTile = id => compose(assoc("id", id), prop(id))(tileDefs);

const ROTATIONS = [0,60,120,180,240,300];

const Tiles = ({match}) => {
  let color = match.params.color;
  let game = games[match.params.game];

  let tiles = compose(filter(propEq("color", color)),
                      map(getTile))(keys(game.tiles));

  let height = game.info.orientation === "horizontal" ? 100 : 116;
  let width = game.info.orientation === "horizontal" ? 116 : 100;

  let totalWidth = (tiles.length * 150);

  let viewBox = game.info.orientation === "horizontal" ?
      "-87.6025 -76 175.205 152" :
      "-76 -87.6025 152 175.205";

  let tileNodes = map(tile => {
    // Merge tile with game tile
    if(is(Object,game.tiles[tile.id])) {
      tile = {...tile, ...game.tiles[tile.id]};
    }

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
              style={{width: `${width}px`,
                      height: `${height}px`}}
              viewBox={viewBox}>
              <g transform={`rotate(${rotation})`}>
                <RotateContext.Provider value={rotation}>
                  <Tile id={tile.id} border={true} />
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
