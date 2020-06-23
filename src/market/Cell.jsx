import React from "react";

import { GetFont } from "../context/FontContext";
import Color from "../data/Color";
import Currency from "../util/Currency";

import { compileCompanies, overrideCompanies } from "../util";

import addIndex from "ramda/src/addIndex";
import findIndex from "ramda/src/findIndex";
import is from "ramda/src/is";
import map from "ramda/src/map";
import propEq from "ramda/src/propEq";

const arrows = {
  up: "↑",
  down: "↓",
  left: "←",
  right: "→"
};

const Cell = ({ cell, par, game, config, data }) => {
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

            if (cell.rotated || (data.type !== "2D" && cell.label)) {
              rotated = true;
            }
            if (cell.subRotated || (data.type !== "2D" && cell.subLabel)) {
              subRotated = true;
            }

            let arrowNodes = addIndex(map)((arrow, i) => {
              let left = arrow === "down" || arrow === "left";
              let arrowPadding = (arrow === "down" || arrow === "up") ? 10 : 5;

              return (
                <text
                  key={`arrow-${i}`}
                  fill={arrowColor}
                  stroke={c("black")}
                  strokeWidth={0.5}
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

            let companies = overrideCompanies(compileCompanies(game),
                                              config.overrideCompanies,
                                              config.overrideSelection);

            let companyNodes = addIndex(map)((company, index) => {
              if (is(String, company)) {
                company = {
                  row: index + 1,
                  abbrev: company
                }
              }

              // Look into the original game companies and find this abbrev
              let companyIndex = findIndex(propEq("abbrev", company.abbrev), (game.companies || []));
              if (companyIndex === -1) {
                return null;
              }
              let companyData = companies[companyIndex];

              let y = data.height -
                  ((company.row || 1) *
                   (data.type === "1D" ? 21 : 13));
              return <Color key={`company-${company.row}`}
                            context="companies">
             {c => (
               <g>
                 <rect
                   x="5"
                   y={y}
                   rx="2"
                   ry="2"
                   width={data.width - 10}
                   height={data.type === "1D" ? 16 : 8}
                   fill={c(companyData.color)}
                   stroke="black"
                   strokeWidth="1"
                 />
                 {data.type === "1D" && (
                   <text
                     x={data.width / 2}
                     y={y + 9}
                     fontSize="12"
                     textAnchor="middle"
                     dominantBaseline="middle"
                     stroke="none"
                     fill={t(c(companyData.color))}>
                     {companyData.abbrev}
                   </text>)}
               </g>
             )}
    </Color>;
            }, cell.companies || []);

            let text = "value" in cell ? <Currency value={cell.value} type="market"/> : cell.label;

            let width = (cell.width || 1) * data.width;
            let height = (cell.height || 1) * data.height;

            return (
              <g>
                <rect x="0"
                      y="0"
                      width={width}
                      height={height}
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
                    dominantBaseline={subRotated ? (cell.right ? "baseline" : "hanging") : "baseline"}
                    x={subRotated ? (-height + 5) : 5}
                    y={subRotated ? (cell.right ? (width - 5) : 5) : (height - 5)}
                  >
                    {cell.subLabel}
                  </text>
                )}
                {arrowNodes}
                {companyNodes}
              </g>
            );
          }}
        </Color>
      )}
    </GetFont>
  );
};

export default Cell;
