import React from "react";

import Color from "../data/Color";
import Name from "./Name";

const MediumCity = ({ border, name, reverse, color }) => {
  if (border) {
    return (
      <Color>
        {c => (
          <circle fill={c("border")} stroke="none" cx="0" cy="0" r="21" />
        )}
      </Color>
    );
  } else {
    let nameNode = null;

    if (name) {
      nameNode = (
        <Name
          {...name}
          y={name.y || (name.reverse ? 25 : -25)}
        />
      );
    }

    return (
      <Color context="companies">
        {c => (
          <g>
            <circle
              fill={c("border")}
              stroke={c("track")}
              strokeWidth="3"
              cx="0"
              cy="0"
              r="17"
            />
            <circle
              fill={c(color || "track")}
              cx="0"
              cy="0"
              r="12"
            />
            {nameNode}
          </g>
        )}
      </Color>
    );
  }
};

export default MediumCity;
