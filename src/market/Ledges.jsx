import React from "react";

import addIndex from "ramda/src/addIndex";
import map from "ramda/src/map";

import Color from "../util/Color";

const ledgeCoord = (coord, data) => {
  let coords = coord.split(" ");
  let x = parseInt(coords[0]);
  let y = parseInt(coords[1]);

  return `${x * data.width} ${y * data.height + (data.stock.title === false ? 0 : 50)}`;
};

const Ledge = ({ ledge, data }) => {
  let path = "M " + map(coord => ledgeCoord(coord, data), ledge.coords).join(" L ");

  let width = (ledge.width || 3);
  let borderWidth = ledge.borderWidth || (width + 2);

  let linecap = "round";
  let linejoin = "round";

  let strokeDashOffset = 0;
  let strokeDashArray = "none";

  if (ledge.dashed) {
    strokeDashArray = ledge.dashArray || (width * 2.5);
    if (ledge.offset) {
      strokeDashOffset = ledge.offset;
    }
  }

  return (
    <Color context="companies">
      {c => (
        <g>
          {ledge.border === true && (
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
                stroke={c(ledge.color)}
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

const Ledges = ({ data }) => {
  return addIndex(map)((l, i) => <Ledge key={`ledge-${i}`} ledge={l} data={data}/>, data.ledges || []);
}

export default Ledges;
