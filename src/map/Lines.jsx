import React from "react";

import addIndex from "ramda/src/addIndex";
import concat from "ramda/src/concat";
import map from "ramda/src/map";

import Color from "../util/Color";

import { mapCoord } from "./util";

const Line = ({ line, data, bg }) => {
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
          {line.border === false || (bg && (
            <path d={path}
                  fill="none"
                  stroke={c("track")}
                  strokeWidth={borderWidth}
                  strokeLinecap={linecap}
                  strokeLinejoin={linejoin}
                  strokeDasharray={strokeDashArray}
                  strokeDashoffset={strokeDashOffset}
            />
          ))}
          {bg || (<path d={path}
                       fill="none"
                       stroke={c(line.color)}
                       strokeWidth={width}
                       strokeLinecap={linecap}
                       strokeLinejoin={linejoin}
                       strokeDasharray={strokeDashArray}
                       strokeDashoffset={strokeDashOffset}
                 />
                )}
        </g>
      )}
    </Color>
  );
}

const Lines = ({ data }) => {
  let lines = addIndex(map)((b, i) => <Line key={`line-bg-${i}`} bg={true} line={b} data={data}/>, data.lines || []);
  lines = concat(lines, addIndex(map)((b, i) => <Line key={`line-${i}`} line={b} data={data}/>, data.lines || []));
  return lines;
}

export default Lines;
