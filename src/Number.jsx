import React from "react";
import { colors } from "./data";

import "./Number.css";

const Number = ({ number, background }) => {
  return (
    <div className="cutlines">
      <div
        className="card number"
        style={{ backgroundColor: colors[background || "gray"] }}
      >
        <div className="number__digit">{number}</div>
      </div>
    </div>
  );
};

export default Number;
