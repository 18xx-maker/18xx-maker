import React from "react";
import * as R from "ramda";
import Color from "./data/Color";
import games from "./data/games";

import Pool from "./Pool";
import Players from "./Players";
import PageSetup from "./PageSetup";

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
        color = "orange";
      }
      return (
        <Color key={`${row}-${col}`}
               context="companies">
          {(c,t) => (
            <td style={{ backgroundColor: c(color), color: t(c(color)) }}>
              {value}
            </td>
          )}
        </Color>
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
  let pools = R.map(p => <Pool key={`pool-${p.name}`} {...p}/>, game.pools || []);

  return (
    <div className="revenue">
      <div className="PrintNotes">
        <div>
          <p>Revenue is meant to be printed in <b>landscape</b> mode</p>
        </div>
      </div>
      <div className="revenue__tracker">
        <h2>{game.info.title} Revenue</h2>
        <table className="revenue__table">
          <tbody>{items}</tbody>
        </table>
      </div>
      <div className="pool-wrapper">
        {pools}
        <Players players={game.players} bank={game.bank} capital={game.capital} />
      </div>
      <PageSetup landscape={true}/>
    </div>
  );
};

export default Revenue;
