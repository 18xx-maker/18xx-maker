import React from "react";
import Color from "../util/Color";

import Name from "./Name";

const CenterTown = ({ border, name, color, bgColor, width }) => {
  width = width || 20;
  if (border) {
    return (
      <Color>
        {c => (
          <circle fill={c("border")} stroke="none" cx="0" cy="0" r={width / 2 + 4} />
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
          y={name.y || (name.reverse ? 18 : -18)}
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
};

export default CenterTown;
