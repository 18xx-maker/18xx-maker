import React, { useContext } from "react";
import GameContext from "../context/GameContext";
import Color from "../data/Color";

const edge = 150 * 0.57735;

const Border = ({ color, dashed, offset, width }) => {
  const { rotation } = useContext(GameContext);

  let strokeDashArray = "none";
  let strokeDashOffset = "-3";
  if (dashed) {
    strokeDashArray = `${width || 16}`;
    if (offset) {
      strokeDashOffset = `${offset}`;
    }
  }
  return (
    <Color context="companies">
      {c => (
        <path
          d={`m ${0.5 * edge} 75 L ${-0.5 * edge} 75`}
          fill="none"
          stroke={c(color)}
          strokeWidth="10"
          strokeDasharray={strokeDashArray}
          strokeDashoffset={strokeDashOffset}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={`rotate(${rotation})`}
        />
      )}
    </Color>
  );
};

export default Border;
