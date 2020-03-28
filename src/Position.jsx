import React from "react";
import * as R from "ramda";

const Position = ({ data, children }) => {
  if (!data) {
    data = [];
  } else if (!Array.isArray(data)) {
    data = [data];
  }

  return R.map(d => {
    // Set everything to defaults of 0
    let angle = d.angle || 0;
    let rotation = d.rotate || d.rotation || 0;
    if (d.side) {
      rotation = rotation + (d.side - 1) * 60;
    }

    let x = d.x || 0;
    let y = d.y || 0;

    // Compute percent distant into translate
    let translate = 75 * (d.percent || 0);
    let rotate = -(d.angle || 0) + (rotation || 0);

    let passing = {...d};

    return (
      <g
        key={`position-${angle}-${rotate}-${translate}-${x}-${y}`}
        transform={`rotate(${angle} ${x} ${y}) translate(0 ${translate}) rotate(${rotate} ${x} ${y}) translate(${x} ${y})`}
      >
        {children(passing)}
      </g>
    );
  }, data);
};

export default Position;
