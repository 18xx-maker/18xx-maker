import React from "react";
import Color from "../data/Color";

const Industry = ({ top, bottom }) => {
  return (
    <Color context="companies">
      {(c,t,s,p) => (
        <g>
          <circle
            fill={p("white")}
            stroke="none"
            r="18"
            cx="0"
            cy="0" />
          <path
            d="M -18 0 A 18 18 0 0 1 18 0 Z"
            fill={c("pink")}
            fillOpacity="0.2"
            stroke={c("pink")}
            strokeWidth="2"
          />
          <path
            d="M -18 0 A 18 18 0 0 0 18 0 Z"
            fill="none"
            stroke={c("pink")}
            strokeWidth="2"
          />
          <text
            fontWeight="bold"
            fontSize={12}
            fontFamily="sans-serif"
            fill={c("pink")}
            dominantBaseline="central"
            textAnchor="middle"
            x="0"
            y="-8"
          >
            {top}
          </text>
          <text
            fontWeight="bold"
            fontSize={12}
            fontFamily="sans-serif"
            fill={c("pink")}
            dominantBaseline="central"
            textAnchor="middle"
            x="0"
            y="8"
          >
            {bottom}
          </text>
        </g>
      )}
    </Color>
  );
};

export default Industry;
