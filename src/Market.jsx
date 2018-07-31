import React from "react";
import { colors, textColor } from "./data";
import util from "./util";
import * as R from "ramda";

import Par from "./Par";

require("./Market.css");

const wrapCell = cell => {
  if (cell === Object(cell)) {
    return cell;
  } else {
    return {
      label: cell
    };
  }
};

const makeCell = ({ label, color, textColor, start, end }, index) => {
  let backgroundColor = colors[color] || colors["plain"];
  let fontColor = colors[textColor] || colors["black"];

  let className = "market__cell";
  if (start === true) {
    className = className + " start";
  }
  if (end === true) {
    className = className + " end";
  }

  let nodes = [];

  if (start === true) {
    nodes.push(
      <div className="market__cell market__start" style={{ backgroundColor }}>
        {label}
      </div>
    );
    nodes.push(
      <div
        className="market__cell market__start_pad"
        style={{ backgroundColor }}
      >
        <div style={{ backgroundColor }} />
      </div>
    );
  } else if (end === true) {
    nodes.push(
      <div className="market__cell market__end" style={{ backgroundColor }}>
        {label}
      </div>
    );
    nodes.push(
      <div className="market__cell market__end_pad" style={{ backgroundColor }}>
        <div style={{ backgroundColor }} />
      </div>
    );
  } else if (index === 0) {
    nodes.push(<div className="market__pad" />);
    nodes.push(
      <div className={className} style={{ backgroundColor, color: fontColor }}>
        {label}
      </div>
    );
  } else {
    nodes.push(
      <div className={className} style={{ backgroundColor, color: fontColor }}>
        {label}
      </div>
    );
  }

  return nodes;
};

const makeRow = market => {
  return (
    <div className="market__row">
      {R.addIndex(R.map)(makeCell, R.map(wrapCell, market))}
    </div>
  );
};

const makeMarket1Diag = (market, splice) => {
  return [
    makeRow(market.slice(0, splice)),
    makeRow(market.slice(splice, market.length))
  ];
};

const Par1Diag = ({ type, values }) => {
  let nodes = R.map(
    row => (
      <tr>
        {R.map(
          value => (
            <td
              rowspan={value.rowspan || 1}
              style={{ backgroundColor: colors[value.color] }}
            >
              {value.label}
              {R.map(
                note => (
                  <div style={{ color: colors[note.color] }}>{note.label}</div>
                ),
                value.labels || []
              )}
            </td>
          ),
          row
        )}
      </tr>
    ),
    values
  );

  return (
    <div className="par">
      <h2>Par</h2>
      <table>
        <tbody>{nodes}</tbody>
      </table>
    </div>
  );
};

const Market1Diag = ({ market, par, splice }) => {
  return (
    <div className="market market__type__1Diag">
      <h2>Stock Market</h2>
      <div className="market__1Diag">{makeMarket1Diag(market, splice)}</div>
      {par && <Par1Diag {...par} />}
    </div>
  );
};

const Market2D = ({ legend, market, par, title, width, height }) => {
  let rows = R.addIndex(R.map)((marketRow, row) => {
    let cells = R.addIndex(R.map)((value, col) => {
      let color = null;

      let classes = [];
      if (!value) {
        classes.push("empty");
      } else {
        color = colors["plain"];
      }

      let labelColor = textColor("plain");
      if (value && value.color) {
        color = colors[value.color];
        labelColor = colors[value.textColor] || textColor(value.color || "white");
      } else if (
        value &&
        Number.isInteger(value.legend) &&
        value.legend < legend.length
      ) {
        color = colors[legend[value.legend].color];
        labelColor = colors[value.textColor] || textColor(legend[value.legend].color);
      } else if (value && value.par) {
        color = colors[par && par.color || "gray"];
        labelColor = colors[value.textColor] || textColor((par && par.color) || "gray");
      }

      return (
        <td
          key={`${row}-${col}`}
          style={{ backgroundColor: color, color: labelColor }}
          className={classes.join(" ")}
        >
          {(value && value.label) || value}
          {value &&
            value.arrow && (
              <span
                style={{
                  color: value.arrowColor
                    ? colors[value.arrowColor]
                    : colors["black"]
                }}
                className={`Arrow Arrow--${value.arrow}`}
              >
                {value.arrow === "up" ? "↑" : "↓"}
              </span>
            )}
        </td>
      );
    }, marketRow);
    return <tr key={row}>{cells}</tr>;
  }, market);

  return (
    <div className="market">
      <h2>{title} Stock Market</h2>
      <table style={{ width, height }}>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
};

const Market = stock => {
  switch (stock.type) {
    case "2D":
      return <Market2D {...stock} />;
    case "1Diag":
      return <Market1Diag {...stock} />;
    default:
      return null;
  }
};

export default Market;
