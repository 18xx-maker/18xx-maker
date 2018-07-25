import React from "react";
import * as R from "ramda";
import { colors } from "./data";

const Par = ({ par }) => {
  let rows = R.map(
    value => (
      <tr key={`par-${value}`}>
        <td style={{ backgroundColor: colors[par.color || "gray"] }}>{value}</td>
      </tr>
    ),
    par.values
  );
  return (
    <div className="par">
      <h2>Par</h2>
      <table>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
};

export default Par;
