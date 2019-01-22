import React from "react";
import Color from "../data/Color";

const Divide = () => {
  return (
    <Color>
      {c => (
        <path d="M -43.30125,75 L 43.30125,-75"
              fill="none"
              stroke={c("black")}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="bevel"
        />
      )}
    </Color>
  );
};

export default Divide;
