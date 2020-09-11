import React from "react";
import Color from "../util/Color";

import Name from "./Name";

const Town = ({ border, name, color, bgColor }) => {
  if (border) {
    return (
      <Color>
        {c => (
          <rect width="32" height="18" x="-16" y="-9" fill={c("border")} />
        )}
      </Color>
    );
  } else {
    let nameNode = null;

    if (name) {
      nameNode = (
        <Name
          bgColor={bgColor}
          name={name.name}
          y={name.y || (name.reverse ? 20 : -30)}
          rotation={(name.rotation || 0) + (name.reverse ? -90 : 90)}
          doRotation={true}
          reverse={true}
        />
      );
    }
    return (
      <Color>
        {c => (
          <g>
            <rect width="28" height="14" x="-14" y="-7" fill={c(color || "town")} />
            {nameNode}
          </g>
        )}
      </Color>
    );
  }
};

export default Town;
