import React from "react";
import { colors, textColor } from "./data";
import * as R from "ramda";

const Train = ({ train }) => {
  let { name, price, color, info } = train;

  let notes = R.map(
    i => (
      <span
        class="train__info"
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

  return (
    <div class="card train">
      <div class="train__name" style={{ color: colors[color] }}>
        {name}
      </div>
      <div class="train__price">{price}</div>
      <div class="train__notes">{notes}</div>
      <svg viewBox="0 0 60mm auto">
        <use href="#train-image" fill={ colors["track"] } />
      </svg>
    </div>
  );
};

export default Train;
