import React from "react";
import { colors } from "../data";

import Name from "./Name";

const CenterTown = ({ border, name }) => {
  if (border) {
    return (
      <circle fill={colors["border"]} stroke="none" cx="0" cy="0" r="12" />
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
        <circle fill={colors["track"]} stroke="none" cx="0" cy="0" r="10" />
        {nameNode}
      </g>
    );
  }
};

export default CenterTown;
