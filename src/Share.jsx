import React from "react";
import { colors } from "./data";
import * as R from "ramda";
import Token from "./Token";

const Share = ({ shares, percent, label, name, abbrev, color }) => {
  let count = shares > 1 ? `${shares} Shares` : `${shares} Share`;

  return (
    <div class="cutlines">
      <div class="card share">
        <div class="share__shares">{count}</div>
        <div class="share__percent">{percent}%</div>
        <div class="share__token">
          <svg>
            <Token label={abbrev} color={color} width={25} />
          </svg>
        </div>
        <div class="share__hr" style={{ backgroundColor: colors[color] }} />
        {label &&
          label.length > 0 && (
            <div class="share__label">
              <div
                class="share__label__text"
                style={{ backgroundColor: colors["yellow"] }}
              >
                {label}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default Share;
