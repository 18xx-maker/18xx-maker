import React from "react";
import games from "./data/games";
import Map from "./Map";
import Svg from "./Svg";
import Title from "./Title";
import HexContext from "./context/HexContext";
import util from "./util";
import * as R from "ramda";
import { NavLink, Redirect } from "react-router-dom";

import VariationSelect from "./nav/VariationSelect";

const MapSingle = ({ match }) => {
  let game = games[match.params.game];

  if (match.params.variation && !Array.isArray(game.map)) {
    return <Redirect to={`/${match.params.game}/map`} />;
  } else if (!match.params.variation && Array.isArray(game.map)) {
    return <Redirect to={`/${match.params.game}/map/0`} />;
  }

  let variation = Number(match.params.variation) || 0;

  let hexWidth = game.info.width;
  let edge = hexWidth * util.HEX_RATIO;
  let halfHexWidth = 0.5 * hexWidth;

  let map = Array.isArray(game.map) ? game.map[variation] : game.map;
  let hexes = map.hexes;
  if (map.copy !== undefined) {
    hexes = R.concat(game.map[map.copy].hexes, hexes);
  }
  let maxX = util.maxMapX(hexes);
  let maxY = util.maxMapY(hexes);

  let totalWidth =
      100 + (game.info.extraTotalWidth || 0) + halfHexWidth * (maxX + 1);
  let totalHeight =
      100 +
      (game.info.extraTotalHeight || 0) +
      (1.5 * (maxY - 1) * edge + 2 * edge);

  if (game.info.orientation === "horizontal") {
    let tmp = totalWidth;
    totalWidth = totalHeight;
    totalHeight = tmp;
  }

  let printWidth = `${(200 + totalWidth) / 100}in`;
  let printHeight = `${(150 + totalHeight) / 100}in`;

  let variationSelect = null;
  if(Array.isArray(game.map)) {
    let variations = R.map(R.prop("name"), game.map);
    variationSelect = (
      <VariationSelect base={`/${match.params.game}/map/`}
                       variations={variations} />
    );
  }

  return (
    <HexContext.Provider
      value={{
        width: game.info.width,
        rotation: game.info.orientation === "horizontal" ? 0 : 90
      }}
    >
      <div className="PrintNotes">
        <div>
          {variationSelect}
          <p>
            This map is meant to be printed in <b>{map.print || "portrait"}</b>{" "}
            mode
          </p>
        </div>
      </div>
      <div className="map">
        <Svg width={totalWidth} height={totalHeight}>
          <Title game={game} variation={variation} />
          <Map game={game} variation={variation} />
        </Svg>
        <style>{`@media print {@page {size: ${printWidth} ${printHeight};}}`}</style>
      </div>
    </HexContext.Provider>
  );
};

export default MapSingle;
