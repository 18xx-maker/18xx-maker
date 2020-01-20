import React from "react";

import { GetFont } from "../context/FontContext";
import Color from "../data/Color";
import Currency from "../util/Currency";

import is from "ramda/src/is";

const ParCell = ({ cell, data }) => {
  if (is(String, cell)) {
    cell = {
      label: cell
    };
  } else if (is(Number, cell)) {
    cell = {
      value: cell
    };
  } else if (is(Object, cell)) {
    // Nothing to do, just assume we have a valid object
  } else {
    // Don't know how to handle cells that aren't objects, numbers or strings
    return null;
  }

  return (
    <GetFont>
      {font => (
        <Color>
          {(c,t) => {

            // Standard colors
            let color = cell.color ?
                c(cell.color) :
                (data.par && data.par.color ?
                 c(data.par.color)
                 : c("gray"));

            // Check if legend is used
            if (Number.isInteger(cell.legend) && cell.legend < data.legend.length) {
              color = c(data.legend[cell.legend].color);
            }

            // Set labelColor by explicit labelColor or text color with color from above
            let labelColor = cell.labelColor || t(color);

            let rotated = false;
            let subRotated = false;

            let text = "value" in cell ? <Currency value={cell.value} type="market"/> : cell.label;

            return (
              <g>
                <rect x="0"
                      y="0"
                      width={data.width}
                      height={data.height}
                      stroke={c("black")}
                      strokeWidth="1"
                      fill={color}
                />
                {text && (
                  <text
                    transform={rotated ? "rotate(-90)" : null}
                    fill={labelColor}
                    fontFamily="display"
                    fontStyle="bold"
                    fontSize="15"
                    textAnchor={rotated ? "end" : "state"}
                    textDecoration={cell.underline ? "underline" : null}
                    dominantBaseline="hanging"
                    x={rotated ? -5 : 5}
                    y="5"
                  >
                    {text}
                  </text>
                )}
                {cell.subLabel && (
                  <text
                    transform={subRotated ? "rotate(-90)" : null}
                    fill={labelColor}
                    fontFamily="display"
                    fontStyle="bold"
                    fontSize="15"
                    textAnchor="start"
                    dominantBaseline={subRotated ? "hanging" : "baseline"}
                    x={subRotated ? (-data.height + 5) : 5}
                    y={subRotated ? 5 : (data.height - 5)}
                  >
                    {cell.subLabel}
                  </text>
                )}
              </g>
            );
          }}
        </Color>
      )}
    </GetFont>
  );
};

export default ParCell;
