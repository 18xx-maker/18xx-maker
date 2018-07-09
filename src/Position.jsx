import React from "react";
import * as R from "ramda";

const width = 75;
const bigWidth = 86.6025;
const vary = bigWidth - width;

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

    return (
      <g
        transform={`rotate(${angle} ${x} ${y}) translate(0 ${translate}) rotate(${rotate} ${x} ${y}) translate(${x} ${y})`}
      >
        {children(d)}
      </g>
    );
  }, data);
};

export default Position;
