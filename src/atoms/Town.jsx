import React, { useContext }  from "react";
import GameContext from "../context/GameContext";
import Color from "../util/Color";
import { multiDefaultTo } from "../util";

import Name from "./Name";

const Town = ({ border, borderWidth, name, color, bgColor }) => {
  const { game } = useContext(GameContext);
  const defaultWidth = 28;
  const defaultHeight = 14;
  borderWidth = multiDefaultTo(2, borderWidth, game.info.townBorderWidth);
  if (border) {
    return (
      <Color>
        {c => (
          <rect width={defaultWidth + borderWidth * 2}
                height={defaultHeight + borderWidth * 2}
                x={-0.5 * (defaultWidth + borderWidth * 2)}
                y={-0.5 * (defaultHeight + borderWidth * 2)}
                fill={c("border")} />
        )}
      </Color>
    );
  } else {
    let nameNode = null;

    if (name) {
      nameNode = (
        <Name
          bgColor={bgColor}
          name={name.name}
          y={name.y || (name.reverse ? 20 : -30)}
          rotation={(name.rotation || 0) + (name.reverse ? -90 : 90)}
          doRotation={true}
          reverse={true}
        />
      );
    }
    return (
      <Color>
        {c => (
          <g>
            <rect width={defaultWidth}
                  height={defaultHeight}
                  x={-0.5 * defaultWidth}
                  y={-0.5 * defaultHeight}
                  fill={c(color || "town")} />
            {nameNode}
          </g>
        )}
      </Color>
    );
  }
};

export default Town;
