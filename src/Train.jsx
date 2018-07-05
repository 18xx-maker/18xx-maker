import React from "react";
import { colors, textColor } from "./data";
import * as R from "ramda";

const Train = ({ train }) => {
  let { name, price, color, info, description } = train;

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

  let tracks = R.map(i => {
    return <rect x={i * 18} y="5" width="10" height="40" fill="black" />;
  }, Array.from(Array(16).keys()));

  return (
    <div class="cutlines">
      <div class="card train">
        <div class="train__price">{price}</div>
        <div class="train__tracks">
          <svg>
            {tracks}
            <rect
              fill="black"
              stroke="white"
              strokeWidth="2"
              height="6"
              width="280"
              x="0"
              y="10"
            />
            <rect
              fill="black"
              stroke="white"
              strokeWidth="2"
              height="6"
              width="280"
              x="0"
              y="30"
            />
          </svg>
        </div>
        <div class="train__description">{description}</div>
        <div class="train__notes">{notes}</div>
        <div class="train__hr" style={{ backgroundColor: colors[color] }} />
        <div class="train__name">{name}</div>
      </div>
    </div>
  );
};

export default Train;
