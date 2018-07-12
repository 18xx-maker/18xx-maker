import React from "react";
import { colors, textColor } from "./data";
import util from "./util";
import * as R from "ramda";

import Par from "./Par";
import Rounds from "./Rounds";

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
    <div class="market__row">
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
      <table>{nodes}</table>
    </div>
  );
};

const Market1Diag = ({ market, limits, par, rounds, splice }) => {
  return (
    <div className="market market__type__1Diag">
      <h2>Stock Market</h2>
      <div className="market__1Diag">{makeMarket1Diag(market, splice)}</div>
      <Rounds rounds={rounds} />
      {par && <Par1Diag {...par} />}
    </div>
  );
};

const Market2D = ({ market, limits, par, rounds }) => {
  let rows = R.addIndex(R.map)((marketRow, row) => {
    let cells = R.addIndex(R.map)((value, col) => {
      let color = value ? colors[util.marketColor(limits, value)] : null;

      if (
        R.find(
          cell => cell[0] === row && cell[1] === col,
          (par && par.cells) || []
        )
      ) {
        color = colors["gray"];
      }
      let classes = [];
      if (!value) {
        classes.push("empty");
      }
      if (row > 0 && col === marketRow.length - 1) {
        classes.push("up");
      }
      if (col === 0 && market[row + 1] && market[row + 1][0]) {
        classes.push("down");
      }

      let labelColor = "#000";
      if (value && value.color) {
        color = colors[value.color];
        labelColor = textColor(value.color);
      }

      return (
        <td
          style={{ backgroundColor: color, color: labelColor }}
          class={classes.join(" ")}
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
                className="arrow"
              >
                {value.arrow === "up" ? "↑" : "↓"}
              </span>
            )}
        </td>
      );
    }, marketRow);
    return <tr>{cells}</tr>;
  }, market);

  let legend = R.map(limit => {
    let backgroundColor = colors[limit.color || "orange"];
    let color = colors[limit.textColor || "white"];

    return (
      <li>
        <span style={{ backgroundColor, color }}>&nbsp;</span>{" "}
        {limit.description}
      </li>
    );
  }, limits);

  return (
    <div class="market">
      <h2>Stock Market</h2>
      <table>{rows}</table>
      {par && <Par par={par} />}
      <Rounds rounds={rounds} />
      <div class="legend">
        <ul class="notes">{legend}</ul>
      </div>
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
