import { Navigate } from "react-router";

import Map from "@/components/map/Map";
import Paginate from "@/components/page/Paginate";

import { getMapData } from "@/util/map";

const MapPaginated = ({ game, config, variation }) => {
  const coords = config.coords;
  const hexWidth = config.tiles.mapWidth;

  if (!game.map) {
    return <Navigate to={`/games/${game.meta.slug}/`} replace />;
  }

  let data = getMapData(game, coords, hexWidth, variation);

  return (
    <div className="map" data-testid={`game-${game.meta.slug}-map-paginated`}>
      <Paginate component="Map" {...{ data, config, game }}>
        <Map
          name={game.meta.id}
          game={game}
          config={config}
          variation={variation}
        />
      </Paginate>
    </div>
  );
};

export default MapPaginated;
