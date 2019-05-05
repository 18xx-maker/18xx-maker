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

const MapSingle = ({ match, coords }) => {
  let game = games[match.params.game];

  // Do redirects if we need or do not need a variation in the url
  if (match.params.variation && !Array.isArray(game.map)) {
    return <Redirect to={`/${match.params.game}/map`} />;
  } else if (!match.params.variation && Array.isArray(game.map)) {
    return <Redirect to={`/${match.params.game}/map/0`} />;
  }

  // Get map data
  let variation = Number(match.params.variation) || 0;
  let data = getMapData(game, coords, variation);

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
      <div className="PrintNotes">
        <div>
          {variationSelect}
          <p>
            This map is meant to be printed in <b>{data.map.print || "portrait"}</b>{" "}
            mode
          </p>
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
  coords: state.config.coords
});

export default connect(mapStateToProps)(MapSingle);
