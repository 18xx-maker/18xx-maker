import React from "react";

import Color from "../data/Color";

import addIndex from "ramda/src/addIndex";
import map from "ramda/src/map";

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
        <Color>
          {(c,t) => (
            <React.Fragment>
              <div className="train__hr" style={{ backgroundColor: c(color) }} />
              <div className="train__price" style={{ color: t(c(color)) }}>{price}</div>
              <div className="train__description">{description}</div>
              <div className="train__notes">{notes}</div>
              <div className="train__name" style={{ color: t(c(color)) }}>{name}</div>
            </React.Fragment>
          )}
        </Color>
      </div>
    </div>
  );
};

export default Train;
