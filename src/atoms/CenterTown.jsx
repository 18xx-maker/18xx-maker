import React from "react";
import Color from "../data/Color";

import Name from "./Name";

const CenterTown = ({ border, name, color }) => {
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
              {nameNode}
            </g>
            <g key="center-town-fill">
              <circle fill={c(color || "centerTown")} stroke="none" cx="0" cy="0" r="10" />
              {nameNode}
            </g>
          </React.Fragment>
        )}
      </Color>
    );
  }
};

export default CenterTown;
