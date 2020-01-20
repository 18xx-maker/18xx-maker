import React from "react";

import { GetFont } from "../context/FontContext";
import Color from "../data/Color";
import Currency from "../util/Currency";

import addIndex from "ramda/src/addIndex";
import is from "ramda/src/is";
import map from "ramda/src/map";

const arrows = {
  up: "↑",
  down: "↓",
  left: "←",
  right: "→"
};

const Cell = ({ cell, data, par }) => {
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
            let color = cell.color ? c(cell.color) : c("plain");
            let arrowColor = cell.arrowColor ? c(cell.arrowColor) : c("black");

            // Check if legend is used
            if (Number.isInteger(cell.legend) && cell.legend < data.legend.length) {
              color = c(data.legend[cell.legend].color);
            }

            // Check if this is a par
            if (cell.par) {
              color = (data.par && data.par.color) ? c(data.par.color) : c("gray");
            }

            // Set labelColor by explicit labelColor or text color with color from above
            let labelColor = cell.labelColor || t(color);

            let rotated = false;
            let subRotated = false;

            if (data.type !== "2D" && cell.label) {
              rotated = true;
            }
            if (data.type !== "2D" && cell.subLabel) {
              subRotated = true;
            }

            let arrowNodes = addIndex(map)((arrow, i) => {
              let left = arrow === "down" || arrow === "left";
              let arrowPadding = (arrow === "down" || arrow === "up") ? 10 : 5;

              return (
                <text
                  key={`arrow-${i}`}
                  fill={arrowColor}
                  fontFamily="display"
                  fontStyle="bold"
                  fontSize="15"
                  textAnchor={left ? "start" : "end"}
                  dominantBaseline="baseline"
                  x={left ? 5 : data.width - 5}
                  y={data.height - arrowPadding}
                >
                  {arrows[arrow] || "↻"}
                </text>
              );
            }, cell.arrow ? (is(Array, cell.arrow) ? cell.arrow : [cell.arrow]) : []);

            let companies = map(company => {
              let y = data.height - ((company.row || 1) * 10);
              return <Color context="companies">
                  {c => (
                    <path
                      d={`M 5 ${y} L ${data.width - 5} ${y}`}
                      linejoin="round"
                      linecap="round"
                      fill="none"
                      stroke={c(company.color)}
                      strokeWidth="8"
                    />
                  )}
                </Color>;
            }, cell.companies || []);

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
                {arrowNodes}
                {companies}
              </g>
            );
          }}
        </Color>
      )}
    </GetFont>
  );
};

export default Cell;
