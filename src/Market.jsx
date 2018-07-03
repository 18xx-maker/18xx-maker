import React from "react";
import { colors } from "./data";
import util from "./util";
import * as R from "ramda";

const Market2D = ({ market, limits, par }) => {
  let rows = R.addIndex(R.map)((marketRow, row) => {
    let cells = R.addIndex(R.map)((value, col) => {
      let color = value ? colors[util.marketColor(limits, value)] : null;
      if (R.find(cell => cell[0] === row && cell[1] === col, par.cells)) {
        color = colors["gray"];
      }
      let classes = [];
      if(!value) {
        classes.push("empty");
      }
      if(row > 0 && col === (marketRow.length - 1)) {
        classes.push("end");
      }
      if(col === 0 && market[row+1] && market[row+1][0]) {
        classes.push("start");
      }
      return (
        <td
          style={{ backgroundColor: color }}
          class={classes.join(" ")}
        >
          {value}
        </td>
      );
    }, marketRow);
    return <tr>{cells}</tr>;
  }, market);

  return <div class="market"><h2>Stock Market</h2><table>{rows}</table></div>;
};

const Market = ({ market, limits, par, type }) => {
  if (type === "2D") {
    return <Market2D market={market} limits={limits} par={par} />;
  } else {
    return null;
  }
};

export default Market;
