import React from "react";
import Color from "./data/Color";
import * as R from "ramda";

import Currency from "./util/Currency";

const formatCell = value => {
  if(Array.isArray(value)) {
    return R.addIndex(R.chain)((v,i) => [<Currency key={`currency-${i}`} value={v} type="train"/>,<br key={`br-${i}`}/>], value);
  } else {
    return <Currency value={value} type="train"/>;
  }
}

const Phase = ({ phases, minor, company }) => {
  let includeName = !R.all(
    R.compose(
      R.isNil,
      R.prop("name")
    ),
    phases || []
  );

  let includePhase = !R.all(
    R.compose(
      R.isNil,
      R.prop("phase")
    ),
    phases || []
  );

  let includeTrain = !R.all(
    R.compose(
      R.isNil,
      R.prop("train")
    ),
    phases || []
  );

  let excludeRust = R.all(
    R.compose(
      R.isNil,
      R.prop("rust")
    ),
    phases || []
  );

  let excludeTiles = R.all(
    R.compose(
      R.isNil,
      R.prop("tiles")
    ),
    phases || []
  );

  let includePrice = !R.all(
    R.compose(
      R.isNil,
      R.prop("price")
    ),
    phases || []
  );

  let phaseRows = (phases || []).filter(phase => {
    return (phases || []).some(phase => phase.company === company)
      ? phase.company === company
      : !phase.company;
  }).map(phase => {
    return (!!phase.minor === minor) && (
      <Color key={phase.phase || phase.name || phase.train}>
        {c => (
          <tr key={phase.phase || phase.name || phase.train}>
            {includeName && <td>{phase.name}</td>}
            {includePhase && <td>{phase.phase}</td>}
            {includeTrain && <td>{formatCell(phase.train)}</td>}
            {includePrice && <td>{formatCell(phase.price)}</td>}
            <td>{formatCell(phase.number)}</td>
            <td>{phase.limit}</td>
            {!excludeTiles && <td style={{ backgroundColor: c(phase.tiles) }}>&nbsp;</td>}
            {!excludeRust && <td>{phase.rust}</td>}
            <td className="phase__notes">
              {Array.isArray(phase.notes)
                ? phase.notes.reduce((notes, note) => <>{notes}<br />{note}</>)
                : phase.notes}
            </td>
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
