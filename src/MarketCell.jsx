import React from "react";
import { connect } from "react-redux";
import { GetFont } from "./context/FontContext";
import * as R from "ramda";
import Color from "./data/Color";
import * as tinycolor from "tinycolor2";

import addIndex from "ramda/src/addIndex";
import is from "ramda/src/is";
import map from "ramda/src/map";

const cap = str => str.charAt(0).toUpperCase() + str.slice(1);

const arrows = {
  up: "↑",
  down: "↓",
  left: "←",
  right: "→"
};

const MarketCell = ({ borders, value, legend, par, colSpan, width, height }) => {
  let color = null;
  let companies = null;

  return (
    <GetFont>
      {font => (
        <Color>
          {(c,t) => {

            let classes = [];
            if (!value) {
              classes.push("empty");
            } else {
              color = c("plain");
            }

            let labelColor = t(c("plain"));
            if (value && value.rawColor) {
              let tc = tinycolor(value.rawColor);
              color = tc.toHexString();
              labelColor = tinycolor
                .mostReadable(tc, ["#000000", "#ffffff"])
                .toHexString();
            } else if (value && value.color) {
              color = c(value.color);
              labelColor = value.textColor ? c(value.textColor) : t(c(value.color || "white"));
            } else if (
              value &&
                Number.isInteger(value.legend) &&
                value.legend < legend.length
            ) {
              color = c(legend[value.legend].color);
              labelColor = value.textColor ? c(value.textColor) : t(c(legend[value.legend].color));
            } else if (value && value.par) {
              color = c((par && par.color) || "gray");
              labelColor = value.textColor ? c(value.textColor) : t(c((par && par.color) || "gray"));
            }

            if (value && value.companies) {
              companies = (
                <div
                  className="MarketCell--Companies"
                  style={{ gridTemplateRows: `repeat(8, 0.1in)` }}
                >
                  {R.map(
                    company => (
                      <div
                        key={`row-${company.row}`}
                        style={{
                          backgroundColor: c(company.color),
                          color: t(c(company.color)),
                          gridRow: `${company.row} / span 1`
                        }}
                        className="MarketCell--Company"
                      />
                    ),
                    value.companies
                  )}
                </div>
              );
            }

            let style = {
              backgroundColor: color,
              color: labelColor,
              width: width ? `${width / 100.0}in` : "auto",
              height: height ? `${height / 100.0}in` : "auto",
              verticalAlign: (value && value.verticalAlign) || "top",
              ...font
            };

            R.forEach(border => {
              style[`border${cap(border.side)}`] = `3px solid ${c(border.color)}`;
            }, (value && value.borders) || []);

            let arrow = null;
            if (value && value.arrow) {
              arrow = addIndex(map)((a,i) => (
                <span
                  key={`arrow-${i}`}
                  style={{
                    color: value.arrowColor
                      ? c(value.arrowColor)
                      : c("black"),
                    ...font
                  }}
                  className={`Arrow Arrow--${a}`}
                >
                  {arrows[a] || "↻"}
                </span>
              ), is(Array, value.arrow) ? value.arrow : [value.arrow]);
            }

            return (
              <td
                style={style}
                className={classes.join(" ")}
                colSpan={colSpan}
              >
                {R.is(Object, value) ? (value.label || "") : value}
                {value &&
                 R.has("subLabel") && (
                   <span className="MarketCell--SubLabel">{value.subLabel}</span>
                 )}
                {companies}
                {arrow}
              </td>
            );
          }}
        </Color>
      )}
    </GetFont>
  );
};

const mapStateToProps = state => ({
  width: state.config.stock.cell.width,
  height: state.config.stock.cell.height
});

export default connect(mapStateToProps)(MarketCell);
