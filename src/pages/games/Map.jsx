import { useBooleanParam, useIntParam } from "@/util/query";
import { MapOrientation } from "@/context/OrientationContext";

import { useConfig, useGame } from "@/hooks";
import MapSingle from "@/games/MapSingle";
import MapPaginated from "@/games/MapPaginated";

import { is, isNil } from "ramda";

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
