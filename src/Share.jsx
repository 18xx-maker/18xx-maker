import React from "react";
import { colors } from "./data";
import Token from "./Token";

const Share = ({
  cost,
  revenue,
  shares,
  percent,
  label,
  name,
  abbrev,
  color
}) => {
  let count = shares > 1 ? `${shares} Shares` : `${shares} Share`;

  return (
    <div className="cutlines">
      <div className="card share">
        {shares && <div className="share__shares">{count}</div>}
        {cost && <div className="share__shares">{cost}</div>}
        {percent && <div className="share__percent">{percent}%</div>}
        {revenue && <div className="share__percent">Revenue: {revenue}</div>}
        <div className="share__token">
          <svg>
            <Token label={abbrev} color={color} width={25} />
          </svg>
        </div>
        <div className="share__hr" style={{ backgroundColor: colors[color] }} />
        {label &&
          label.length > 0 && (
            <div className="share__label">
              <div
                className="share__label__text"
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
