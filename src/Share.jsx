import React from "react";
import { colors, textColor } from "./data";
import * as R from "ramda";
import Token from "./Token";

const Share = ({ shares, percent, label, name, abbrev, color }) => {
  let count = shares > 1 ? `${shares} Shares` : `${shares} Share`;

  return (
    <div class="card share">
      <div class="share__name">{name}</div>
      <div class="share__shares">{count}</div>
      <div class="share__percent">{percent}%</div>
      <div class="share__hr" style={{ backgroundColor: color }} />
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
  );
};

export default Share;
