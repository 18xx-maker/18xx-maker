import React from "react";
import * as R from "ramda";

const Position = ({ data, children }) => {
  if (!data) {
    data = [];
  } else if (!Array.isArray(data)) {
    data = [data];
  }

  return R.map(d => {
    // Is polar coordinates?
    if (d.angle) {
      return null;
    } else {
      let translate = `${d.x || 0} ${d.y || 0}`;
      let rotate =
        d.rotate === undefined
          ? d.rotation === undefined
            ? 0
            : d.rotation
          : d.rotate;

      if (d.side) {
        rotate = rotate + (d.side - 1) * 60;
      }

      return (
        <g transform={`translate(${translate}) rotate(${rotate})`}>
          {children(d)}
        </g>
      );
    }
  }, data);
};

export default Position;
