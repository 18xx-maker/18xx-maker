import React from "react";
import games from "./data/games";
import Map from "./Map";
import Svg from "./Svg";
import Title from "./Title";
import HexContext from "./context/HexContext";
import util from "./util";

const MapSingle = ({ match }) => {
  let game = games[match.params.game];

  let hexWidth = game.info.width;
  let edge = hexWidth * util.HEX_RATIO;
  let halfHexWidth = 0.5 * hexWidth;
  let maxX = util.maxMapX(game.map.hexes);
  let maxY = util.maxMapY(game.map.hexes);

  let totalWidth = (game.info.extraTotalWidth || 0) + halfHexWidth * (maxX + 1);
  let totalHeight =
    (game.info.extraTotalHeight || 0) + (1.5 * (maxY - 1) * edge + 2 * edge);

  if (game.info.orientation === "horizontal") {
    let tmp = totalWidth;
    totalWidth = totalHeight;
    totalHeight = tmp;
  }

  return (
    <HexContext.Provider
      value={{
        width: game.info.width,
        rotation: game.info.orientation === "horizontal" ? 0 : 90
      }}
    >
      <div className="cutlines">
        <div className="map">
          <Svg width={totalWidth} height={totalHeight}>
            <Title game={game} />
            <Map game={game} />
          </Svg>
        </div>
      </div>
    </HexContext.Provider>
  );
};

export default MapSingle;
