import React, { useContext } from "react";
import GameContext from "../context/GameContext";
import { multiDefaultTo } from "../util";
import Color from "../util/Color";

import Name from "./Name";

const CenterTown = ({ border, borderWidth, name, color, outlineColor, bgColor, width, size }) => {
  const { game } = useContext(GameContext);
  width = multiDefaultTo(20, width, game.info.townWidth);
  let scale = width / 20;
  borderWidth = multiDefaultTo(4, borderWidth, game.info.borderWidth) * scale;

  if (size === undefined) {
    size = 1;
  }

  if (size === 1) {
    if (border) {
      return (
        <Color>
          {c => (
            <circle fill={c("border")} stroke="none" cx="0" cy="0" r={width / 2 + borderWidth} />
          )}
        </Color>
      );
    } else {
      let nameNode = null;
  
      if (name) {
        nameNode = (
          <Name
            bgColor={bgColor}
            {...name}
            y={name.y || (name.reverse ? 18 : -18) * scale}
          />
        );
      }
      return (
        <Color context="companies">
          {c => (
            <React.Fragment>
              <g key="center-town-outline">
                <circle fill={c("centerTown")} stroke="none" cx="0" cy="0" r={width / 2 + 2} />
              </g>
              <g key="center-town-fill">
                <circle fill={c(color || "centerTown")} stroke="none" cx="0" cy="0" r={width / 2} />
              </g>
              {nameNode}
            </React.Fragment>
          )}
        </Color>
      );
    }
  } else if (size === 2) {
    width += 4;
    if (border) {
      let totalWidth = width + borderWidth * 2;
      return (
        <Color>
          {c => (
            <g>
              <path d={`M${totalWidth/2-1},${totalWidth/2} A${totalWidth/2},${totalWidth/2} 0 1,0 ${totalWidth/2-1},-${totalWidth/2} L-${totalWidth/2-1},-${totalWidth/2} A${totalWidth/2},${totalWidth/2} 0 1,0 -${totalWidth/2-1},${totalWidth/2} L${totalWidth/2-1},${totalWidth/2}`}
              fill={c("border")}
              stroke="none"
              />
            </g>
          )}
        </Color>
      );
    } else {
      let outlineWidth = width + borderWidth;
      let nameNode = null;

      if (name) {
        nameNode = (
          <Name
            bgColor={bgColor}
            {...name}
            y={name.y || (name.reverse ? 20 : -20)}
          />
        );
      }
      return (
        <Color>
          {c => (
            <g>
              <path d={`M${outlineWidth/2},${outlineWidth/2} A${outlineWidth/2},${outlineWidth/2} 0 1,0 ${outlineWidth/2},-${outlineWidth/2} L-${outlineWidth/2},-${outlineWidth/2} A${outlineWidth/2},${outlineWidth/2} 0 1,0 -${outlineWidth/2},${outlineWidth/2} L${outlineWidth/2},${outlineWidth/2}`}
              fill={c("white")}
              stroke={c(outlineColor || "track")}
              strokeWidth={`${borderWidth/2}`}
              />
              <circle fill={c(color || "centerTown")} stroke="none" cx={`-${width/2+borderWidth/2-1}`} cy="0" r={width / 2} />
              <circle fill={c(color || "centerTown")} stroke="none" cx={`${width/2+borderWidth/2-1}`} cy="0" r={width / 2} />
            {nameNode}
            </g>
          )}
        </Color>
      );
    }
  }
};

export default CenterTown;
