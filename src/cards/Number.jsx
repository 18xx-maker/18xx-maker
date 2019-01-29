import React from "react";
import Color from "../data/Color";

import "./number.scss";

const Number = ({ number, background }) => {
  return (
    <Color context="companies">
      {c => (
        <div className="cutlines">
          <div
            className="card number"
            style={{ backgroundColor: c(background || "gray") }}
          >
            <div className="number__digit">{number}</div>
          </div>
        </div>
      )}
    </Color>
  );
};

export default Number;
