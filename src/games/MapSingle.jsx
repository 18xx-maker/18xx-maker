import React from "react";
import Map from "../map/Map";
import Svg from "../Svg";
import { Redirect } from "react-router-dom";

import { getMapData } from "../map/util";

const MapSingle = ({ game, config, variation }) => {
  const coords = config.coords;
  const hexWidth = config.tiles.mapWidth;

  // Do redirects if we need or do not need a variation in the url
  if (!game.map) {
    return <Redirect to={`/games/${game.slug}/`} />;
  }

  // Get map data
  let data = getMapData(game, coords, hexWidth, variation);

  return (
    <div className="map">
      <Svg width={`${data.totalWidth / 100}in`} height={`${data.totalHeight / 100}in`} viewBox={`0 0 ${data.totalWidth} ${data.totalHeight}`}>
        <Map name={game.id}
             game={game}
             config={config}
             variation={variation} />
      </Svg>
      <style>{`@media print {@page {size: ${data.printWidth} ${data.printHeight}; margin: 0.25in 0.25in 0.25in 0.25in; }}`}</style>
    </div>
  );
};

export default MapSingle;
