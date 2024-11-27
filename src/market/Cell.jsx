import { addIndex, findIndex, is, map, propEq } from "ramda";

import Position from "@/components/Position";
import ColorContext from "@/context/ColorContext";
import GameMapCompanyToken from "@/tokens/GameMapCompanyToken";
import Token from "@/tokens/Token";
import Color from "@/util/Color";
import Currency from "@/util/Currency";
import { compileCompanies, overrideCompanies } from "@/util/companies";

const arrows = {
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
};

const Cell = ({ cell, game, config, data }) => {
  if (is(String, cell)) {
    cell = {
      label: cell,
    };
  } else if (is(Number, cell)) {
    cell = {
      value: cell,
    };
  } else if (is(Object, cell)) {
    // Nothing to do, just assume we have a valid object
  } else {
    // Don't know how to handle cells that aren't objects, numbers or strings
    return null;
  }

  return (
    <Color>
      {(c, t) => {
        // Standard colors
        let color = cell.color
          ? c(cell.color)
          : data.cell && data.cell.color
            ? c(data.cell.color)
            : c("plain");

        let arrowColor = cell.arrowColor ? c(cell.arrowColor) : c("black");

        // Check if legend is used
        if (Number.isInteger(cell.legend) && cell.legend < data.legend.length) {
          color = c(data.legend[cell.legend].color);
        }

        // Check if this is a par
        if (cell.par) {
          color = data.par && data.par.color ? c(data.par.color) : c("gray");
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

        let width = (cell.width || 1) * data.width;
        let height = (cell.height || 1) * data.height;

        let arrowNodes = addIndex(map)(
          (arrow, i) => {
            let left = arrow === "down" || arrow === "left";
            let arrowPadding = arrow === "down" || arrow === "up" ? 10 : 5;
            let arrowY = height - arrowPadding;
            let arrowBaseline = "baseline";
            if (config.stock.arrows === "top") {
              arrowY = 5;
              arrowBaseline = "hanging";
            } else if (config.stock.arrows === "middle") {
              arrowY = height / 2;
              arrowBaseline = "middle";
            }

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
                dominantBaseline={arrowBaseline}
                x={left ? 5 : data.width - 5}
                y={arrowY}
              >
                {arrows[arrow] || "↻"}
              </text>
            );
          },
          cell.arrow ? (is(Array, cell.arrow) ? cell.arrow : [cell.arrow]) : [],
        );

        let companies = overrideCompanies(
          compileCompanies(game),
          config.overrideCompanies,
          config.overrideSelection,
        );

        let companyNodes = addIndex(map)((company, index) => {
          if (is(String, company)) {
            company = {
              row: index + 1,
              abbrev: company,
            };
          }

          // Look into the original game companies and find this abbrev
          let companyIndex = findIndex(
            propEq(company.abbrev, "abbrev"),
            game.companies || [],
          );
          if (companyIndex === -1) {
            return null;
          }
          let companyData = companies[companyIndex];

          let y =
            data.height - (company.row || 1) * (data.type === "1D" ? 21 : 13);
          return (
            <Color key={`company-${company.row}`} context="companies">
              {(c) => (
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
                      fill={t(c(companyData.color))}
                    >
                      {companyData.abbrev}
                    </text>
                  )}
                </g>
              )}
            </Color>
          );
        }, cell.companies || []);

        let text =
          "value" in cell ? (
            <Currency value={cell.value} type="market" />
          ) : (
            cell.label
          );

        let text_x = 5;
        let text_y = 5;
        let text_anchor = "start";
        let text_baseline = "hanging";
        let sub_x = width - 5;
        let sub_y = height - 5;
        let sub_anchor = "end";
        let sub_baseline = "baseline";

        if (config.stock.value === "bottom") {
          // Swap the x/y for sub and text
          [
            text_x,
            text_y,
            text_baseline,
            text_anchor,
            sub_x,
            sub_y,
            sub_baseline,
            sub_anchor,
          ] = [
            sub_x,
            sub_y,
            sub_baseline,
            sub_anchor,
            text_x,
            text_y,
            text_baseline,
            text_anchor,
          ];

          if (rotated) {
            text_x = -height + 5;
            text_anchor = "start";
            text_y = width - 5;
          }

          if (subRotated) {
            sub_x = -5;
            sub_anchor = "end";
          }
        } else {
          if (rotated) {
            text_x = -5;
            text_y = 5;
            text_anchor = "end";
          }

          if (subRotated) {
            sub_x = -height + 5;
            sub_y = width - 5;
            sub_anchor = "start";
          }
        }

        if (cell.tokens) {
          for (var i = 0; i < cell.tokens.length; i++) {
            if (cell.tokens[i].x === undefined) cell.tokens[i].x = width / 2;
            if (cell.tokens[i].y === undefined)
              cell.tokens[i].y = height / 2 + 2;
          }
        }

        let tokens = (
          <ColorContext.Provider value="companies">
            <Position data={cell.tokens}>
              {(t) => {
                if (t.company) {
                  return <GameMapCompanyToken {...t} abbrev={t.company} />;
                } else {
                  return <Token {...t} />;
                }
              }}
            </Position>
          </ColorContext.Provider>
        );

        return (
          <g>
            <rect
              x="0"
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
                textAnchor={text_anchor}
                textDecoration={cell.underline ? "underline" : null}
                dominantBaseline={text_baseline}
                x={text_x}
                y={text_y}
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
                textAnchor={sub_anchor}
                dominantBaseline={sub_baseline}
                x={sub_x}
                y={sub_y}
              >
                {cell.subLabel}
              </text>
            )}
            {arrowNodes}
            {companyNodes}
            {tokens}
          </g>
        );
      }}
    </Color>
  );
};

export default Cell;
