import React from "react";
import * as R from "ramda";
import {colors} from "./data";

const Revenue = () => {
  let rows = Array.from(Array(5).keys());
  let cols = Array.from(Array(20).keys());

  let items = R.map(row => {
    let cells = R.map(col => {
      let color = colors["plain"];
      let value = 20 * row + col + 1;
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

  return (
    <div class="revenue">
      <h2>Revenue Tracker</h2>
      <table>
        {items}
      </table>
    </div>
  );
};

export default Revenue;
