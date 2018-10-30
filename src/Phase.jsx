import React from "react";
import { colors } from "./data";
import * as R from "ramda";

const formatCell = value => {
  if(Array.isArray(value)) {
    return R.addIndex(R.chain)((v,i) => [v,<br key={`br-${i}`}/>], value);
  } else {
    return value;
  }
}

const Phase = ({ phases }) => {
  let includeTrain = !R.all(
    R.compose(
      R.isNil,
      R.prop("train")
    ),
    phases
  );

  let excludeRust = R.all(
    R.compose(
      R.isNil,
      R.prop("rust")
    ),
    phases
  );

  let excludeTiles = R.all(
    R.compose(
      R.isNil,
      R.prop("tiles")
    ),
    phases
  );

  let phaseRows = phases.map(phase => {
    return (
      <tr key={phase.phase || phase.name}>
        <td>{phase.phase || phase.name}</td>
        {includeTrain && <td>{formatCell(phase.train)}</td>}
        <td>{formatCell(phase.number)}</td>
        <td>{phase.limit}</td>
        {!excludeTiles && <td style={{ backgroundColor: colors[phase.tiles] }}>&nbsp;</td>}
        {!excludeRust && <td>{phase.rust}</td>}
        <td className="phase__notes">{phase.notes}</td>
      </tr>
    );
  });

  return (
    <table>
      <thead>
        <tr>
          <th>Phase</th>
          {includeTrain && <th>Train</th>}
          <th>#</th>
          <th>Limit</th>
          {!excludeTiles && <th>Tiles</th>}
          {!excludeRust && <th>Rust</th>}
          <th className="phase__notes">Notes</th>
        </tr>
      </thead>
      <tbody>{phaseRows}</tbody>
    </table>
  );
};

export default Phase;
