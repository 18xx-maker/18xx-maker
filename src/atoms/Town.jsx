import React from "react";
import { colors } from "../data";

import Name from "./Name";

const Town = ({ border, name, color }) => {
  if (border) {
    return (
      <rect width="32" height="18" x="-16" y="-9" fill={colors["border"]} />
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
        <rect width="28" height="14" x="-14" y="-7" fill={colors[color] || colors["track"]} />
        {nameNode}
      </g>
    );
  }
};

export default Town;
