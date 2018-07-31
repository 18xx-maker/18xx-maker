import React from "react";
import { colors, textColor } from "./data";
import * as R from "ramda";

const Train = ({ train }) => {
  let { name, price, color, info, description, players } = train;

  let notes = R.addIndex(R.map)(
    (i, index) => (
      <span key={index}
        className="train__info"
        style={{
          backgroundColor: colors[i.color],
          color: textColor(i.color)
        }}
      >
        {i.note}
      </span>
    ),
    info
  );

  if(players) {
    notes.unshift(<span key="players" className="train__players">Players: {players}</span>);
  };

  return (
    <div className="cutlines">
      <div className="card train">
        <div className="train__price">{price}</div>
        <div className="train__description">{description}</div>
        <div className="train__notes">{notes}</div>
        <div className="train__hr" style={{ backgroundColor: colors[color] }} />
        <div className="train__name">{name}</div>
      </div>
    </div>
  );
};

export default Train;
