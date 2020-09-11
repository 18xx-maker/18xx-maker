import React from "react";
import Color from "../util/Color";

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
            <div className="card__bleed">
              <div className="card__body">
                <div className="number__digit">{number}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Color>
  );
};

export default Number;
