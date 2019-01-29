import React from "react";

import Color from "../data/Color";

import addIndex from "ramda/es/addIndex";
import map from "ramda/es/map";

const Train = ({ train }) => {
  let { name, price, color, info, description, players } = train;

  let notes = addIndex(map)(
    (i, index) => (
      <Color key={index}>
        {(c,t) => (
          <span
            className="train__info"
            style={{
              backgroundColor: c(i.color),
              color: t(c(i.color))
            }}
          >
            {i.note}
          </span>
        )}
      </Color>
    ),
    info
  );

  if (players) {
    notes.unshift(
      <span key="players" className="train__players">
        {players}
      </span>
    );
  }

  return (
    <div className="cutlines">
      <div className="card train">
        <div className="train__price">{price}</div>
        <div className="train__description">{description}</div>
        <div className="train__notes">{notes}</div>
          <Color>{c => (<div className="train__hr" style={{ backgroundColor: c(color) }} />)}</Color>
        <div className="train__name">{name}</div>
      </div>
    </div>
  );
};

export default Train;
