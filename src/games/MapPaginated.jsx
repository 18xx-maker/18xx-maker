import React from "react";
import Map from "../map/Map";
import { Redirect } from "react-router-dom";

import { getMapData } from "../map/util";

import Paginate from "../util/Paginate";
import "../map/MapPaginated.css";

const MapPaginated = ({ game, config, variation }) => {
  const coords = config.coords;
  const hexWidth = config.tiles.mapWidth;

  if (!game.map) {
    return <Redirect to={`/games/${game.slug}/`} />;
  }

  let data = getMapData(game, coords, hexWidth, variation);

  return (
    <Paginate component="Map" {...{data, config, game}}>
      <Map name={game.id}
           game={game}
           config={config}
           variation={variation} />
    </Paginate>
  );
};

export default MapPaginated;
