import React from "react";

import addIndex from "ramda/src/addIndex";
import map from "ramda/src/map";

import { toCoords } from "./util";
import Color from "../data/Color";

const Border = ({ border, data }) => {
  let coords = map(toCoords, border.coords);
  let pathCoords = map(c => {
    let x = data.hexX(c[0], c[1]);
    let y = data.hexY(c[0], c[1]);

    if (data.horizontal) {
      if (c[0] % 2 === 0) {
        if (c[1] % 2 === 0) {
          x -= (0.5 * data.edge);
        } else {
          x -= data.edge;
        }
      } else {
        if (c[1] % 2 === 0) {
          x -= data.edge;
        } else {
          x -= (0.5 * data.edge);
        }
      }
    } else {
      if (c[0] % 2 === 0) {
        if (c[1] % 2 === 0) {
          y -= data.edge;
        } else {
          y -= (0.5 * data.edge);
        }
      } else {
        if (c[1] % 2 === 0) {
          y -= (0.5 * data.edge);
        } else {
          y -= data.edge;
        }
      }
    }

    return `${x} ${y}`;
  }, coords)
  let path = `M ${pathCoords.join(" L ")}`

  let width = border.width || 8;
  let borderWidth = border.borderWidth || 12;

  let linecap = "round";
  let linejoin = "round";

  let strokeDashOffset = 0;
  let strokeDashArray = "none";

  if (border.type === "dashed") {
    strokeDashArray = width * 2.5;
    if (border.offset) {
      strokeDashOffset = border.offset;
    }
  }

  return (
    <Color context="companies">
      {c => (
        <g>
          {border.border === false || (
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
                stroke={c(border.color)}
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

const Borders = ({ data }) => {
  return addIndex(map)((b, i) => <Border key={`border-${i}`} border={b} data={data}/>, data.borders || []);
}

export default Borders;
