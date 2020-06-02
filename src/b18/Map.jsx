import React, { useContext } from "react";
import ConfigContext from "../context/ConfigContext";
import { useParams } from "react-router-dom";
import games from "../data/games";

import Map from "../map/Map";
import Svg from "../Svg";

import HexContext from "../context/HexContext";
import GameContext from "../context/GameContext";

import { getMapData } from "../map/util";

const B18Map = ({ coords }) => {
  let params = useParams();
  let game = games[params.game];

  const { config } = useContext(ConfigContext);
  const coords = config.coords;

  // Get map data
  let variation = Number(params.variation) || 0;
  let data = getMapData(game, coords, 100, variation);
  let offset = 0;

  // B18 Type F maps
  // https://wiki.board18.org/w/Type_%22F%22_Board_Map_Glitch
  if (data.horizontal && data.a1Valid === false) {
    offset = 87;
  }

  return (
    <GameContext.Provider value={params.game}>
      <HexContext.Provider value={{
        width: 100,
        rotation: data.horizontal ? 0 : 90
      }}>
        <div className="map">
          <Svg preserveAspectRatio="none" width={data.b18TotalWidth + offset} height={data.b18TotalHeight} viewBox={`${-offset} 0 ${data.totalWidth + offset} ${data.totalHeight}`}>
            <Map game={game} variation={variation} hexWidth={data.hexWidth} />
          </Svg>
          <style>{`@media print {@page {size: ${data.b18PrintWidth} ${data.b18PrintHeight};}}`}</style>
        </div>
      </HexContext.Provider>
    </GameContext.Provider>
  );
};

export default B18Map;
