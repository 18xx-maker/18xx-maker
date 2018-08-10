import React from "react";
import * as R from "ramda";
import { colors, textColor } from "./data";

const ParTable = ({ par }) => {
  return null;
};

const ParRow = ({ par }) => {
  let rows = R.map(
    value => (
      <tr key={`par-${value}`}>
        <td style={{ backgroundColor: colors[par.color || "gray"], color: textColor(par.color || "gray") }}>{value}</td>
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

const Par = (props) => {
  switch (props.par.type) {
  case "table":
    return <ParTable {...props} />;
  default:
    return <ParRow {...props} />;
  }
};

export default Par;
