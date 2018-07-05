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
    <div class="cutlines">
      <div class="card train">
        <div class="train__name">{name}</div>
        <div class="train__price">{price}</div>
        <div class="train__notes">{notes}</div>
        <div class="train__hr" style={{ backgroundColor: colors[color] }} />
      </div>
    </div>
  );
};

export default Train;
