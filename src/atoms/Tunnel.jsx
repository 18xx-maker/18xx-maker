import React from "react";
import Color from "../data/Color";
import PhaseContext from "../context/PhaseContext";
import Currency from "../util/Currency";

const Tunnel = ({ cost }) => {
  return (
    <PhaseContext.Provider value="default">
      <Color context="map">
        {(c,t) => (
          <g>
            <path
              d="M -22 13 L 0 -24 L 22 13 Z"
              fill={c("mountain")}
              stroke={c("track")}
              strokeWidth="2"
              strokeLinecap="round"
              x="0"
              y="0"
            />
            <text
              fill={t(c("mountain"))}
              fontSize="12"
              dominantBaseline="hanging"
              textAnchor="middle"
              x="0"
              y="-3"
            >
              <Currency value={cost} type="terrain" />
            </text>
          </g>
        )}
      </Color>
    </PhaseContext.Provider>
  );
};

export default Tunnel;
