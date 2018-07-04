import React from "react";
import {colors} from "./data";

const Phase = ({ phases }) => {
  let phaseRows = phases.map(phase => {
    return (
      <tr>
        <td>{phase.name}</td>
        <td>{phase.number}</td>
        <td>{phase.limit}</td>
        <td style={{backgroundColor: colors[phase.tiles]}}>&nbsp;</td>
        <td>{phase.rust}</td>
        <td class="phase__notes">{phase.notes}</td>
      </tr>
    );
  });

  return (
    <table>
      <thead>
        <tr>
          <th>Train</th>
          <th>#</th>
          <th>Limit</th>
          <th>Tiles</th>
          <th>Rust</th>
          <th class="phase__notes">Notes</th>
        </tr>
      </thead>
      <tbody>
        {phaseRows}
      </tbody>
    </table>
  );
};

export default Phase;
