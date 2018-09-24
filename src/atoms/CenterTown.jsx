import React from "react";
import { colors } from "../data";

import Name from "./Name";

const CenterTown = ({ border, name, color }) => {
  if (border) {
    return (
      <circle fill={colors["border"]} stroke="none" cx="0" cy="0" r="14" />
    );
  } else {
    let nameNode = null;

    if (name) {
      nameNode = (
        <Name
          {...name}
          town={true}
        />
      );
    }
    return (
      <g>
        <circle fill={colors[color] || colors["track"]} stroke="none" cx="0" cy="0" r="12" />
        {nameNode}
      </g>
    );
  }
};

export default CenterTown;
