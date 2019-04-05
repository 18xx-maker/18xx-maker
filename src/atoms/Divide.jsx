import React from "react";
import Color from "../data/Color";

const Divide = () => {
  return (
    <Color>
      {(c,t,s,p) => (
        <path d="M -43.30125,75 L 43.30125,-75"
              fill="none"
              stroke={p("black")}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="bevel"
        />
      )}
    </Color>
  );
};

export default Divide;
