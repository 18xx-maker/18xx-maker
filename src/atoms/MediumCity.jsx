import React from "react";
import { colors } from "../data";

import Name from "./Name";

const MediumCity = ({ border, name, reverse, color }) => {
  if (border) {
    return (
      <circle fill={colors["border"]} stroke="none" cx="0" cy="0" r="21" />
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
      <g>
        <circle
          fill={colors["border"]}
          stroke={colors["track"]}
          strokeWidth="3"
          cx="0"
          cy="0"
          r="17"
        />
        <circle
          fill={colors[color || "track"]}
          cx="0"
          cy="0"
          r="12"
        />
        {nameNode}
      </g>
    );
  }
};

export default MediumCity;
