import React from "react";
import * as R from "ramda";
import {colors} from "./data";

const generateCells = (rows, cols) => {
  let length = cols.length;
  let items = R.map(row => {
    let cells = R.map(col => {
      let color = colors["plain"];
      let value = length * row + col + 1;
      if(value % 5 === 0) {
        color = colors["yellow"];
      }
      if(value % 10 === 0) {
        color = colors["green"];
      }
      return <td style={{backgroundColor: color}}>{value}</td>;
    }, cols);

    return <tr>{cells}</tr>;
  }, rows);

  return items;
};

const Revenue = () => {
  let rows = Array.from(Array(5).keys());
  let cols = Array.from(Array(20).keys());

  let items = generateCells(rows, cols);

  return (
    <div class="revenue">
      <h2>Revenue</h2>
      <table>
        {items}
      </table>
    </div>
  );
};

export default Revenue;
