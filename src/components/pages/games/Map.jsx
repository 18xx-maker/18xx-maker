import { is, isNil } from "ramda";

import MapPaginated from "@/components/map/MapPaginated";
import MapSingle from "@/components/map/MapSingle";

import { MapOrientation } from "@/context/OrientationContext";
import { useConfig, useGame } from "@/hooks";
import { useBooleanParam, useIntParam } from "@/util/query";

const Map = () => {
  const { config } = useConfig();
  const game = useGame();

  const [paginated] = useBooleanParam("paginated");
  const [variation, setVariation] = useIntParam("variation", 0);

  if (is(Array, game.map) && isNil(variation)) {
    setVariation(0);
  }

  return (
    <MapOrientation>
      {paginated ? (
        <MapPaginated {...{ game, config, variation }} />
      ) : (
        <MapSingle {...{ game, config, variation }} />
      )}
    </MapOrientation>
  );
};

export default Map;
