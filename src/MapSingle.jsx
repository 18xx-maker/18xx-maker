import React from "react";
import games from "./data/games";
import Map from "./Map";
import Svg from "./Svg";
import Title from "./Title";
import HexContext from "./context/HexContext";
import util from "./util";
import { NavLink, Redirect } from "react-router-dom";

const MapSingle = ({ match }) => {
  let game = games[match.params.game];

  if (match.params.variation && !Array.isArray(game.map)) {
    return <Redirect to={`/${match.params.game}/map`} />;
  } else if (!match.params.variation && Array.isArray(game.map)) {
    return <Redirect to={`/${match.params.game}/map/0`} />;
  }

  let variation = Number(match.params.variation) || 0;

  console.log(match, variation);
  let hexWidth = game.info.width;
  let edge = hexWidth * util.HEX_RATIO;
  let halfHexWidth = 0.5 * hexWidth;

  let map = Array.isArray(game.map) ? game.map[variation] : game.map;
  let maxX = util.maxMapX(map.hexes);
  let maxY = util.maxMapY(map.hexes);

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
            <Title game={game} variation={variation} />
            <Map game={game} variation={variation} />
          </Svg>
          <div className="PrintNotes">
            This map is meant to be printed in{" "}
            <b>{game.map.print || "portrait"}</b> mode
            {Array.isArray(game.map) && (
              <ul>
                {game.map.map((m, i) => (
                  <li key={`${match.params.game}-${i}`}>
                    <NavLink to={`/${match.params.game}/map/${i}`}>
                      {m.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </HexContext.Provider>
  );
};

export default MapSingle;
