import { assocPath, is, isNil } from "ramda";

import Svg from "@/components/Svg";
import Map from "@/components/map/Map";

import { MapOrientation } from "@/context/OrientationContext";
import { useConfig, useGame } from "@/hooks";
import { getMapData } from "@/util/map";
import { useIntParam } from "@/util/query";

const B18Map = () => {
  const { config } = useConfig();
  const game = useGame();

  const [variation, setVariation] = useIntParam("variation", 0);

  if (is(Array, game.map) && isNil(variation)) {
    setVariation(0);
  }

  const coords = config.coords;

  // Get map data
  let data = getMapData(game, coords, 100, variation);
  let offset = 0;

  // B18 Type F maps
  // https://wiki.board18.org/w/Type_%22F%22_Board_Map_Glitch
  if (data.horizontal && data.a1Valid === false) {
    offset = 87;
  }

  return (
    <MapOrientation>
      <div className="map">
        <Svg
          preserveAspectRatio="none"
          width={data.b18TotalWidth + offset}
          height={data.b18TotalHeight}
          viewBox={`${-offset} 0 ${data.totalWidth + offset} ${data.totalHeight}`}
        >
          <Map
            name={game.meta.id}
            game={game}
            config={assocPath(["tiles", "mapWidth"], 100, config)}
            variation={variation}
          />
        </Svg>
        <style>{`@media print {@page {size: ${data.b18PrintWidth} ${data.b18PrintHeight}; margin: 0; }}`}</style>
      </div>
    </MapOrientation>
  );
};

export default B18Map;
