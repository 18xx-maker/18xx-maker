import React from "react";

import addIndex from "ramda/src/addIndex";
import map from "ramda/src/map";

import Color from "../data/Color";

const Line = ({ line, data }) => {
  let ratio = data.hexWidth / 150;

  let path = "M " + map(pair => map(coord => coord * ratio,
                                   pair).join(" "),
                        line.coords).join(" L ");

  let width = line.width || 8;
  let borderWidth = line.borderWidth || (width + 4);

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
          {line.border && (
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
  console.log("Lines");
  return addIndex(map)((line, i) => <Line key={`line-${i}`} line={line} data={data}/>, data.lines || []);
}

export default Lines;
