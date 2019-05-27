import React from "react";
import Color from "../data/Color";

import Name from "./Name";

const CenterTown = ({ border, name, color, bgColor }) => {
  if (border) {
    return (
      <Color>
        {c => (
          <circle fill={c("border")} stroke="none" cx="0" cy="0" r="14" />
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
              <circle fill={c("centerTown")} stroke="none" cx="0" cy="0" r="12" />
            </g>
            <g key="center-town-fill">
              <circle fill={c(color || "centerTown")} stroke="none" cx="0" cy="0" r="10" />
            </g>
            {nameNode}
          </React.Fragment>
        )}
      </Color>
    );
  }
};

export default CenterTown;
