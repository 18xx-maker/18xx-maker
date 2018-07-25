import React from "react";
import {colors} from "./data";

const Phase = ({ phases }) => {
  let phaseRows = phases.map(phase => {
    return (
      <tr key={phase.name}>
        <td>{phase.name}</td>
        <td>{phase.number}</td>
        <td>{phase.limit}</td>
        <td style={{backgroundColor: colors[phase.tiles]}}>&nbsp;</td>
        <td>{phase.rust}</td>
        <td className="phase__notes">{phase.notes}</td>
      </tr>
    );
  });

  return (
    <table>
      <thead>
        <tr>
          <th>Phase</th>
          <th>#</th>
          <th>Limit</th>
          <th>Tiles</th>
          <th>Rust</th>
          <th className="phase__notes">Notes</th>
        </tr>
      </thead>
      <tbody>
        {phaseRows}
      </tbody>
    </table>
  );
};

export default Phase;
