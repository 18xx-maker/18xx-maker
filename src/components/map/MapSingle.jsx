import { Navigate } from "react-router";

import Editor from "@/components/editor/Editor";
import Map from "@/components/map/Map";

import { scalePageSize } from "@/util";
import { getMapData } from "@/util/map";

const MapSingle = ({ game, config, variation }) => {
  const coords = config.coords;
  const hexWidth = config.tiles.mapWidth;

  // Do redirects if we need or do not need a variation in the url
  if (!game.map) {
    return <Navigate to={`/games/${game.meta.slug}/`} replace />;
  }

  // Get map data
  let data = getMapData(game, coords, hexWidth, variation);

  return (
    <div className="map" data-testid={`game-${game.meta.slug}-map`}>
      <Editor
        className="printElement"
        width={data.totalWidth}
        height={data.totalHeight}
      >
        <Map
          name={game.meta.id}
          game={game}
          config={config}
          variation={variation}
          interactive
        />
      </Editor>
      <style>{`@media print {@page {size: ${scalePageSize(data.printWidth, config.printScale)} ${scalePageSize(data.printHeight, config.printScale)}; margin: 0.25in 0.25in 0.25in 0.25in; }}`}</style>
    </div>
  );
};

export default MapSingle;
