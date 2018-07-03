import React from "react";
import * as R from "ramda";
import { colors } from "./data";

const Par = ({ par }) => {
  let rows = R.map(
    value => (
      <tr>
        <td style={{ backgroundColor: colors["gray"] }}>{value}</td>
      </tr>
    ),
    par.values
  );
  return (
    <div class="par">
      <h2>Par</h2>
      <table>{rows}</table>
    </div>
  );
};

export default Par;
