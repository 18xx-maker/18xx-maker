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

  return (
    <div class="cutlines">
      <div class="card train">
        <div class="train__price">{price}</div>
        <div class="train__tracks">
          <svg>
            <defs>
              <pattern
                id="Tracks"
                x="0"
                y="0"
                width="7.10%"
                height="100%"
                viewBox="0,0,20,50"
              >
                <rect x="5" y="5" width="10" height="40" fill="black" />
              </pattern>
            </defs>
            <rect fill="url(#Tracks)" width="280" height="50" />
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
