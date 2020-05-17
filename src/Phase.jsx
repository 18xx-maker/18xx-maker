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

const filterPhase = R.curry((minor, company, phase) => {
  if (phase.company && phase.company !== company) {
    return false;
  }

  if (!phase.minor === minor) {
    return false;
  }

  return true;
});

const include = (field, phases, minor, company) => {
  return !R.all(
    R.compose(
      R.isNil,
      R.prop(field)
    ),
    R.filter(filterPhase(minor, company), phases || [])
  );
};

const trainInclude = (field, trains) => {
  return !R.all(
    R.compose(
      R.isNil,
      R.prop(field)
    ),
    trains || []
  );
};

const matchTrain = R.curry((phase, train) => {
  if (train.phase === false) {
    return false;
  }

  if (phase.name === train.name) {
    return true;
  }

  if (phase.train === train.name) {
    return true;
  }

  if (Array.isArray(phase.train) && phase.train.includes(train.name)) {
    return true;
  }

  return false;
});

const Phase = ({ phases, trains, minor, company }) => {
  let includeName = include("name", phases, minor, company);
  let includePhase = include("phase", phases, minor, company);
  let includeTrain = include("train", phases, minor, company);
  let includeTiles = include("tiles", phases, minor, company);
  let includeRust = trainInclude("rust", trains);
  let includeObsolete = trainInclude("obsolete", trains);
  let includePhased = trainInclude("phased", trains);

  let phaseRows = R.compose(
    R.map(phase => {
      let notes = phase.notes ? (Array.isArray(phase.notes) ? phase.notes : [phase.notes]) : [];
      if (phase.buy_companies) {
        notes.push("Private companies may be purchased.")
      }
      if ((phase.events || {}).close_companies) {
        notes.push("Private companies close.")
      }
      if ((phase.events || {}).remove_tokens) {
        notes.push("Private tokens removed.")
      }
      notes = R.intersperse(<br/>, notes);

      // Find all trains linked to this phase
      let phaseTrains = R.filter(matchTrain(phase), trains || []);

      // Get the names for each train
      let trainNames = R.map(t => <li key={t.name}>{t.name}</li>, phaseTrains);

      // Prices for each trach
      let prices = R.map(t => <li key={t.name}>{formatCell(t.price)}</li>, phaseTrains);

      // Quantities for each train
      let quantities = R.map(t => <li key={t.name}>{t.quantity}</li>, phaseTrains);

      // Get all trains that rust on this phase
      let rustingTrains = R.filter(t => t.phase !== false && t.rust === phase.name, trains || []);

      // Which trains rust during this phase
      let rusts = R.map(t => <li key={t.name}>{t.name}</li>, rustingTrains);

      // Get all trains that rust on this phase
      let obsoleteTrains = R.filter(t => t.phase !== false && t.obsolete === phase.name, trains || []);

      // Which trains rust during this phase
      let obsoletes = R.map(t => <li key={t.name}>{t.name}</li>, obsoleteTrains);

      // Get all trains that rust on this phase
      let phasedTrains = R.filter(t => t.phase !== false && t.phased === phase.name, trains || []);

      // Which trains rust during this phase
      let phased = R.map(t => <li key={t.name}>{t.name}</li>, phasedTrains);

      return (
        <Color key={phase.name}>
          {c => (
            <tr key={phase.name}>
              {includeName && <td>{phase.name}</td>}
              {includePhase && <td>{phase.phase}</td>}
              {includeTrain && <td><ul>{trainNames}</ul></td>}
              <td><ul>{prices}</ul></td>
              <td><ul>{quantities}</ul></td>
              <td>{phase.limit}</td>
              {includePhased && <td><ul>{phased}</ul></td>}
              {includeObsolete && <td><ul>{obsoletes}</ul></td>}
              {includeRust && <td><ul>{rusts}</ul></td>}
              {includeTiles && <td style={{ backgroundColor: c(phase.tiles) }}>&nbsp;</td>}
              <td className="phase__notes">{notes}</td>
            </tr>
          )}
        </Color>
      );
    }),
    R.filter(filterPhase(minor, company))
  )(phases || []);

  return (
    <table>
      <thead>
        <tr>
          {includeName && <th>Name</th>}
          {includePhase && <th>Phase</th>}
          {includeTrain && <th>Train</th>}
          <th>Price</th>
          <th>#</th>
          <th>Limit</th>
          {includePhased && <th>Phased</th>}
          {includeObsolete && <th>Obsolete</th>}
          {includeRust && <th>Rust</th>}
          {includeTiles && <th>Tiles</th>}
          <th className="phase__notes">Notes</th>
        </tr>
      </thead>
      <tbody>{phaseRows}</tbody>
    </table>
  );
};

export default Phase;
