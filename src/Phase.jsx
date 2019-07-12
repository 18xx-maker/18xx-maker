import React from "react";
import Color from "./data/Color";
import * as R from "ramda";

const formatCell = value => {
  if(Array.isArray(value)) {
    return R.addIndex(R.chain)((v,i) => [v,<br key={`br-${i}`}/>], value);
  } else {
    return value;
  }
}

const Phase = ({ phases }) => {
  let includeName = !R.all(
    R.compose(
      R.isNil,
      R.prop("name")
    ),
    phases
  );

  let includePhase = !R.all(
    R.compose(
      R.isNil,
      R.prop("phase")
    ),
    phases
  );

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

  let includePrice = !R.all(
    R.compose(
      R.isNil,
      R.prop("price")
    ),
    phases
  );

  let phaseRows = phases.map(phase => {
    return (
      <Color key={phase.phase || phase.name || phase.train}>
        {c => (
          <tr key={phase.phase || phase.name || phase.train}>
            {includeName && <td>{phase.name}</td>}
            {includePhase && <td>{phase.phase}</td>}
            {includeTrain && <td>{formatCell(phase.train)}</td>}
            {includePrice && <td>{phase.price}</td>}
            <td>{formatCell(phase.number)}</td>
            <td>{phase.limit}</td>
            {!excludeTiles && <td style={{ backgroundColor: c(phase.tiles) }}>&nbsp;</td>}
            {!excludeRust && <td>{phase.rust}</td>}
            <td className="phase__notes">{phase.notes}</td>
          </tr>
        )}
      </Color>
    );
  });

  return (
    <table>
      <thead>
        <tr>
          {includeName && <th>Name</th>}
          {includePhase && <th>Phase</th>}
          {includeTrain && <th>Train</th>}
          {includePrice && <th>Price</th>}
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
