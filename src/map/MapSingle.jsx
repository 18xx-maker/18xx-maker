import React from "react";
import { connect } from "react-redux";
import games from "../data/games";
import Map from "./Map";
import Svg from "../Svg";
import Title from "../Title";
import HexContext from "../context/HexContext";
import GameContext from "../context/GameContext";
import * as R from "ramda";
import { Redirect } from "react-router-dom";

import VariationSelect from "../nav/VariationSelect";
import { getMapData } from "./util";

const MapSingle = ({ match, coords, hexWidth }) => {
  let game = games[match.params.game];

  // Do redirects if we need or do not need a variation in the url
  if (match.params.variation && !Array.isArray(game.map)) {
    return <Redirect to={`/${match.params.game}/map`} />;
  } else if (!match.params.variation && Array.isArray(game.map)) {
    return <Redirect to={`/${match.params.game}/map/0`} />;
  }

  // Get map data
  let variation = Number(match.params.variation) || 0;
  let data = getMapData(game, coords, hexWidth, variation);

  // Variation Select Box
  let variationSelect = null;
  if(Array.isArray(game.map)) {
    let variations = R.map(R.prop("name"), game.map);
    variationSelect = (
      <VariationSelect base={`/${match.params.game}/map/`}
                       variations={variations} />
    );
  }

  return (
    <GameContext.Provider value={match.params.game}>
    <HexContext.Provider
      value={{
        width: data.hexWidth,
        rotation: data.horizontal ? 0 : 90
      }}
    >
      {game.wip && (
      <div className="WIP">
        <div>
          <p>This game is a work in progress. It is not fully implemented</p>
        </div>
      </div>)}
      <div className="PrintNotes">
        <div>
          {variationSelect}
        </div>
      </div>
      <div className="map">
        <Svg width={data.totalWidth} height={data.totalHeight}>
          <Title game={game} variation={variation} />
          <Map game={game} variation={variation} />
        </Svg>
        <style>{`@media print {@page {size: ${data.printWidth} ${data.printHeight};}}`}</style>
      </div>
    </HexContext.Provider>
    </GameContext.Provider>
  );
};

const mapStateToProps = state => ({
  coords: state.config.coords,
  hexWidth: state.config.tiles.width
});

export default connect(mapStateToProps)(MapSingle);
