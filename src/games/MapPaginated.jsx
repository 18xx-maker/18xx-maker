import { useNavigate } from "react-router";

import Paginate from "@/components/Paginate";
import Map from "@/map/Map";
import { getMapData } from "@/util/map";

import "@/games/MapPaginated.css";

const MapPaginated = ({ game, config, variation }) => {
  const navigate = useNavigate();
  const coords = config.coords;
  const hexWidth = config.tiles.mapWidth;

  if (!game.map) {
    navigate(`/games/${game.meta.slug}/`);
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
