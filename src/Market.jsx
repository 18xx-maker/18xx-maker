import React from "react";
import { colors } from "./data";
import util from "./util";
import * as R from "ramda";

import Par from "./Par";
import Rounds from "./Rounds";

const Market2D = ({ market, limits, par, rounds }) => {
  let rows = R.addIndex(R.map)((marketRow, row) => {
    let cells = R.addIndex(R.map)((value, col) => {
      let color = value ? colors[util.marketColor(limits, value)] : null;
      if (R.find(cell => cell[0] === row && cell[1] === col, par.cells)) {
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
      return (
        <td style={{ backgroundColor: color }} class={classes.join(" ")}>
          {value}
        </td>
      );
    }, marketRow);
    return <tr>{cells}</tr>;
  }, market);

  let legend = R.map(limit => {
    let backgroundColor = colors[limit.color || "orange"];
    let color = colors[limit.textColor || "white"];

    return (<li><span style={{backgroundColor, color}}>&nbsp;</span> {limit.description}</li>);
  }, limits);

  return (
    <div class="market">
      <h2>Stock Market</h2>
      <table>{rows}</table>
      <Par par={par} />
      <Rounds rounds={rounds} />
      <div class="legend">
        <ul class="notes">{legend}</ul>
      </div>
    </div>
  );
};

const Market = ({ market, limits, par, rounds, type }) => {
  if (type === "2D") {
    return (
      <Market2D market={market} limits={limits} par={par} rounds={rounds} />
    );
  } else {
    return null;
  }
};

export default Market;
