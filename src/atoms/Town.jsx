import React from "react";
import { colors } from "../data";

import Name from "./Name";

const Town = ({ border, name, color }) => {
  if (border) {
    return (
      <rect width="30" height="16" x="-15" y="-8" fill={colors["border"]} />
    );
  } else {
    let nameNode = null;

    if (name) {
      nameNode = (
        <Name
          name={name.name}
          y={name.y || (name.reverse ? 20 : -28)}
          rotation={name.rotation}
          reverse={true}
        />
      );
    }
    return (
      <g>
        <rect width="26" height="12" x="-13" y="-6" fill={colors[color] || colors["track"]} />
        {nameNode}
      </g>
    );
  }
};

export default Town;
