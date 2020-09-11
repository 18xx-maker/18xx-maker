import React from "react";
import Color from "../util/Color";

const TunnelEntrance = ({ border, borderColor, trackColor, color, size }) => {
  size = size || 15;
  color = color || "city";
  borderColor = borderColor || "border";
  trackColor = trackColor || "track";

  if (border) {
    return (
      <Color>
        {c => (
          <g>
            <circle fill={c(borderColor)} stroke="none"
                    cx="0" cy="0"
                    r={size + 3} />
            <rect fill={c(borderColor)} stroke="none"
                  x={-((1.5 * size) + 3)} y="-8"
                  width={(3 * size) + 6} height="16" />
          </g>
        )}
      </Color>
    );
  } else {
    return (
      <g>
        <Color context="companies">
          {c => (
            <g>
              <circle
                fill={c(color)}
                stroke="none"
                cx="0"
                cy="0"
                r={size} />
              <circle
                fill="none"
                stroke={c(trackColor)}
                strokeWidth="2"
                cx="0"
                cy="0"
                r={size} />
              <rect
                fill={c(color)}
                stroke="none"
                x={-(1.5 * size)} y="-4"
                width={(3 * size)} height="8" />
              <path
                d={`M ${-size + 0.5} -5 l -${(0.5 * size) + 0.5} 0 0 10 ${(0.5 * size) + 0.5} 0`}
                fill="none"
                stroke={c(trackColor)}
                strokeWidth="2" />
              <path
                d={`M ${size - 0.5} -5 l ${(0.5 * size) + 0.5} 0 0 10 -${(0.5 * size) + 0.5} 0`}
                fill="none"
                stroke={c(trackColor)}
                strokeWidth="2" />
            </g>
          )}
        </Color>
      </g>
    );
  }
};

export default TunnelEntrance;
