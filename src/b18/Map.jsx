import React from "react";
import { connect } from "react-redux";
import games from "../data/games";

import Map from "../map/Map";
import Svg from "../Svg";
import Title from "../Title";

import HexContext from "../context/HexContext";
import GameContext from "../context/GameContext";

import { getMapData } from "../map/util";

const B18Map = ({ match, coords }) => {
  let game = games[match.params.game];

  // Get map data
  let variation = Number(match.params.variation) || 0;
  let data = getMapData(game, coords, 100, variation);

  return (
    <GameContext.Provider value={match.params.game}>
    <HexContext.Provider
      value={{
        width: 100,
        rotation: data.horizontal ? 0 : 90
      }}
    >
      <div className="map">
        <Svg width={data.totalWidth} height={data.totalHeight}>
          <Title game={game} variation={variation} hexWidth={data.hexWidth} />
          <Map game={game} variation={variation} hexWidth={data.hexWidth} />
        </Svg>
        <style>{`@media print {@page {size: ${data.printWidth} ${data.printHeight};}}`}</style>
      </div>
    </HexContext.Provider>
    </GameContext.Provider>
  );
};

const mapStateToProps = state => ({
  coords: state.config.coords
});

export default connect(mapStateToProps)(B18Map);
