import React from "react";
import Color from "../data/Color";

const Divide = () => {
  return (
    <Color>
      {(c,t,s,p) => (
        <path d="M 0,-100 L 0,100"
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
