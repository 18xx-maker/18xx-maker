import React, { useContext } from "react";
import { useBooleanParam, useIntParam } from "../../util/query";
import GameContext from "../../context/GameContext";
import ConfigContext from "../../context/ConfigContext";
import { MapOrientation } from "../../context/OrientationContext";

import MapSingle from "../../games/MapSingle";
import MapPaginated from "../../games/MapPaginated";

import is from "ramda/src/is";
import isNil from "ramda/src/isNil";

const Map = () => {
  const { config } = useContext(ConfigContext);
  const { game } = useContext(GameContext);

  const [paginated] = useBooleanParam('paginated');
  const [variation, setVariation] = useIntParam('variation');

  if (is(Array, game.map) && isNil(variation)) {
    setVariation(0);
  }

  return <MapOrientation>
           {paginated
            ? <MapPaginated {...{game, config, variation}}/>
            : <MapSingle {...{game, config, variation}}/>}
         </MapOrientation>;
};

export default Map;
