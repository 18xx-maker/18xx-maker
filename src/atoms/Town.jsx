import React from "react";
import { colors } from "../data";

import Name from "./Name";

const Town = ({ border, name }) => {
  if (border) {
    return (
      <rect width="24" height="14" x="-12" y="-7" fill={colors["border"]} />
    );
  } else {
    let nameNode = null;

    if (name) {
      nameNode = (
        <Name
          name={name.name}
          reverse={name.reverse}
          rotation={name.rotation}
          town={true}
        />
      );
    }
    return (
      <g>
        <rect width="20" height="10" x="-10" y="-5" fill={colors["track"]} />
        {nameNode}
      </g>
    );
  }
};

export default Town;
