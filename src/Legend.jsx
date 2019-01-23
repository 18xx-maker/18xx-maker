import React from "react";
import * as R from "ramda";
import Color from "./data/Color";

import Movement from "./Movement";

const Legend = ({ legend, movement, horizontal }) => {
  return (
    <Color context="companies">
      {(c,t) => {
        let items = R.map(item => {
          let backgroundColor = c(item.color || "orange");
          let color = item.textColor ? c(item.textColor) : t(c(item.color || "orange"));

          return (
            <li key={item.description}>
              <i className={`${item.iconStyle || "fas"} fa-${item.icon || "info"}`} style={{ backgroundColor, color }} />
              {item.description}
            </li>
          );
        }, legend);

        return (
          <div className={`Legend${horizontal ? " Legend--Horizontal" : "" }`}>
            <Movement movement={movement} />
            <ul className="notes">{items}</ul>
          </div>
        );
      }}
    </Color>
  );
};

export default Legend;
