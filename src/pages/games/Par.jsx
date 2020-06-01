import React, { useContext } from "react";
import { useBooleanParam } from "../../util/query";
import GameContext from "../../context/GameContext";
import ConfigContext from "../../context/ConfigContext";

import ParSingle from "../../market/ParSingle";
import ParPaginated from "../../market/ParPaginated";

const Par = () => {
  const { config } = useContext(ConfigContext);
  const { game } = useContext(GameContext);

  const [paginated] = useBooleanParam('paginated');

  return (paginated
          ? <ParPaginated {...{game, config}}/>
          : <ParSingle {...{game, config}}/>);
};

export default Par;
