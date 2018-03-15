import React from "react";
import util from "./util";
import TrackBorder from "./TrackBorder";

const Hex = ({ width, x, y }) => {
  let data = util.hexData(width, true, x, y);

  return (
    <g>
      <polygon points={util.pointsToString(data.points)} fill="#5fb479" />

      <path
        d="m 25 100 A 129.90375 129.90375 0 0 0 137.5 35.048125"
        fill="none"
        stroke="#ffffff"
        strokeLinecap="butt"
        strokeLinejoin="bevel"
        strokeWidth="14"
      />
      <path
        d="m 25 100 A 129.90375 129.90375 0 0 0 137.5 35.048125"
        fill="none"
        stroke="#000000"
        strokeLinecap="butt"
        strokeLinejoin="bevel"
        strokeWidth="10"
      />
      <path
        d="m 62.5 35.048125 L 137.5 164.95187500000003"
        fill="none"
        stroke="#ffffff"
        strokeLinecap="butt"
        strokeLinejoin="bevel"
        strokeWidth="14"
      />
      <path
        d="m 62.5 35.048125 L 137.5 164.95187500000003"
        fill="none"
        stroke="#000000"
        strokeLinecap="butt"
        strokeLinejoin="bevel"
        strokeWidth="10"
      />
      <text
        fontFamily="Helvetica, Arial, sans-serif"
        fill="#000000"
        stroke="none"
        strokeLinecap="round"
        strokeLinejoin="bevel"
        x="164.5"
        y="137.239075"
        alignmentBaseline="middle"
        textAnchor="middle"
        fontSize="12"
      >
        19
      </text>

      <polygon
        points={util.pointsToString(data.points)}
        fill="transparent"
        stroke="#000000"
        strokeLinecap="round"
        strokeLinejoin="bevel"
        strokeWidth="2"
      />
    </g>
  );
};

export default Hex;
