import React from "react";

import addIndex from "ramda/src/addIndex";
import map from "ramda/src/map";

import Color from "../data/Color";

import { mapCoord } from "./util";

const Line = ({ line, data }) => {
  let path = "M " + map(coord => mapCoord(coord, data), line.coords).join(" L ");

  let width = (line.width || 8) * data.scale;
  let borderWidth = line.borderWidth ? (line.borderWidth * data.scale) : (width + (4 * data.scale));

  let linecap = "round";
  let linejoin = "round";

  let strokeDashOffset = 0;
  let strokeDashArray = "none";

  if (line.dashed) {
    strokeDashArray = width * 2.5;
    if (line.offset) {
      strokeDashOffset = line.offset;
    }
  }

  return (
    <Color context="companies">
      {c => (
        <g>
          {line.border === false || (
            <path d={path}
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={borderWidth}
                  strokeLinecap={linecap}
                  strokeLinejoin={linejoin}
                  strokeDasharray={strokeDashArray}
                  strokeDashoffset={strokeDashOffset}
            />
          )}
          <path d={path}
                fill="none"
                stroke={c(line.color)}
                strokeWidth={width}
                strokeLinecap={linecap}
                strokeLinejoin={linejoin}
                strokeDasharray={strokeDashArray}
                strokeDashoffset={strokeDashOffset}
          />
        </g>
      )}
    </Color>
  );
}

const Lines = ({ data }) => {
  return addIndex(map)((line, i) => <Line key={`line-${i}`} line={line} data={data}/>, data.lines || []);
}

export default Lines;
