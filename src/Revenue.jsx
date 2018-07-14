import React from "react";
import * as R from "ramda";
import { colors, textColor } from "./data";
import games from "./data/games";

import Pool from "./Pool";
import Players from "./Players";

require("./Revenue.css");

const generateCells = (rows, cols) => {
  let length = cols.length;
  let items = R.map(row => {
    let cells = R.map(col => {
      let color = "plain";
      let value = length * row + col + 1;
      if (value % 5 === 0) {
        color = "yellow";
      }
      if (value % 10 === 0) {
        color = "green";
      }
      return (
        <td
          key={`${row}-${col}`}
          style={{ backgroundColor: colors[color], color: textColor(color) }}
        >
          {value}
        </td>
      );
    }, cols);

    return <tr key={row}>{cells}</tr>;
  }, rows);

  return items;
};

const Revenue = ({ match }) => {
  let game = games[match.params.game];

  let rows = Array.from(Array(5).keys());
  let cols = Array.from(Array(20).keys());

  let items = generateCells(rows, cols);

  return (
    <div className="revenue">
      <div className="revenue__tracker">
        <h2>Revenue</h2>
        <table>
          <tbody>{items}</tbody>
        </table>
      </div>
      <Pool label="Bank Pool" />
      <Players players={game.players} />
    </div>
  );
};

export default Revenue;
