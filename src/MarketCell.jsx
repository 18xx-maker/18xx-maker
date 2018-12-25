import React from "react";
import * as R from "ramda";
import { colors, textColor, market } from "./data";
import * as tinycolor from "tinycolor2";

const cap = str => str.charAt(0).toUpperCase() + str.slice(1);

const MarketCell = ({ borders, value, legend, par, colSpan, width, height }) => {
  let color = null;
  let companies = null;

  let classes = [];
  if (!value) {
    classes.push("empty");
  } else {
    color = colors["plain"];
  }

  let labelColor = textColor("plain");
  if (value && value.rawColor) {
    let tc = tinycolor(value.rawColor);
    color = tc.toHexString();
    labelColor = tinycolor
      .mostReadable(tc, ["#000000", "#ffffff"])
      .toHexString();
  } else if (value && value.color) {
    color = colors[value.color];
    labelColor = colors[value.textColor] || textColor(value.color || "white");
  } else if (
    value &&
    Number.isInteger(value.legend) &&
    value.legend < legend.length
  ) {
    color = colors[legend[value.legend].color];
    labelColor =
      colors[value.textColor] || textColor(legend[value.legend].color);
  } else if (value && value.par) {
    color = colors[(par && par.color) || "gray"];
    labelColor =
      colors[value.textColor] || textColor((par && par.color) || "gray");
  }

  if (value && value.companies) {
    companies = (
      <div
        className="MarketCell--Companies"
        style={{ gridTemplateRows: `repeat(8, 0.1in)` }}
      >
        {R.map(
          c => (
            <div
              key={`row-${c.row}`}
              style={{
                backgroundColor: colors[c.color],
                color: textColor(c.color),
                gridRow: `${c.row} / span 1`
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
    width: width ? `${width}in` : "auto",
    height: height ? `${height}in` : "auto",
    fontFamily: market.fontFamily,
    fontWeight: market.fontWeight,
    fontSize: market.fontSize,
    verticalAlign: (value && value.verticalAlign) || "top",
    lineHeight: market.fontSize
  };

  R.forEach(border => {
    style[`border${cap(border.side)}`] = `3px solid ${colors[border.color]}`;
  }, (value && value.borders) || []);

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
      {value &&
        value.arrow && (
          <span
            style={{
              color: value.arrowColor
                ? colors[value.arrowColor]
                : colors["black"],
              fontFamily: market.arrow.fontFamily,
              fontWeight: market.arrow.fontWeight,
              fontSize: market.arrow.fontSize,
              lineHeight: market.arrow.fontSize
            }}
            className={`Arrow Arrow--${value.arrow}`}
          >
            {value.arrow === "up" ? "↑" : "↓"}
          </span>
        )}
    </td>
  );
};

export default MarketCell;
