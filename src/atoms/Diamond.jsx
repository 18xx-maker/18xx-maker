import React from "react";
import Color from "../data/Color";
import PhaseContext from "../context/PhaseContext";
import Currency from "../util/Currency";

const Diamond = ({ cost }) => {
  return (
    <PhaseContext.Provider value="default">
      <Color context="map">
        {(c,t) => (
          <g>
            <path
              d="M -22 0 L 0 -22 L 22 0 L 0 22 L -22 0"
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
              x="-2"
              y="-5"
            >
              <Currency value={cost} type="terrain" />
            </text>
          </g>
        )}
      </Color>
    </PhaseContext.Provider>
  );
};

export default Diamond;
