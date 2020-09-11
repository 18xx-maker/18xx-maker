import React from "react";

import addIndex from "ramda/src/addIndex";
import concat from "ramda/src/concat";
import map from "ramda/src/map";

import { mapCoord } from "./util";
import Color from "../util/Color";

const Border = ({ border, data, bg }) => {
  let path = "M " + map(coord => mapCoord(coord, data), border.coords).join(" L ");

  let width = (border.width || 8) * data.scale;
  let borderWidth = border.borderWidth ? (border.borderWidth * data.scale) : (width + (4 * data.scale));

  let linecap = "round";
  let linejoin = "round";

  let strokeDashOffset = 0;
  let strokeDashArray = "none";

  if (border.dashed) {
    strokeDashArray = border.dashArray || (width * 2.5);
    if (border.offset) {
      strokeDashOffset = border.offset;
    }
  }

  return (
    <Color context="companies">
      {c => (
        <g>
          {border.border === false || (bg && (
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
                       stroke={c(border.color)}
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

const Borders = ({ data }) => {
  let borders = addIndex(map)((b, i) => <Border key={`border-bg-${i}`} bg={true} border={b} data={data}/>, data.borders || []);
  borders = concat(borders, addIndex(map)((b, i) => <Border key={`border-${i}`} border={b} data={data}/>, data.borders || []));
  return borders;
}

export default Borders;
