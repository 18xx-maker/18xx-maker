import { redirect } from "react-router";

import Svg from "@/components/Svg";
import Map from "@/components/map/Map";
import { getMapData } from "@/util/map";

const MapSingle = ({ game, config, variation }) => {
  const coords = config.coords;
  const hexWidth = config.tiles.mapWidth;

  // Do redirects if we need or do not need a variation in the url
  if (!game.map) {
    redirect(`/games/${game.meta.slug}/`);
  }

  // Get map data
  let data = getMapData(game, coords, hexWidth, variation);

  return (
    <div className="map" data-testid={`game-${game.meta.slug}-map`}>
      <Svg
        className="printElement"
        width={`${data.totalWidth / 100}in`}
        height={`${data.totalHeight / 100}in`}
        viewBox={`0 0 ${data.totalWidth} ${data.totalHeight}`}
      >
        <Map
          name={game.meta.id}
          game={game}
          config={config}
          variation={variation}
        />
      </Svg>
      <style>{`@media print {@page {size: ${data.printWidth} ${data.printHeight}; margin: 0.25in 0.25in 0.25in 0.25in; }}`}</style>
    </div>
  );
};

export default MapSingle;
