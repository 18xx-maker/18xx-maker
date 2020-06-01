import React, { useContext } from "react";
import { useBooleanParam } from "../../util/query";
import GameContext from "../../context/GameContext";
import ConfigContext from "../../context/ConfigContext";

import RevenueSingle from "../../market/RevenueSingle";
import RevenuePaginated from "../../market/RevenuePaginated";

const Revenue = () => {
  const { config } = useContext(ConfigContext);
  const { game } = useContext(GameContext);

  const [paginated] = useBooleanParam('paginated');

  return (paginated
          ? <RevenuePaginated {...{game, config}}/>
          : <RevenueSingle {...{game, config}}/>);
};

export default Revenue;
