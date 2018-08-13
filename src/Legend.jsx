import React from "react";
import * as R from "ramda";
import { colors, textColor } from "./data";

import Movement from "./Movement";

const Legend = ({ legend, movement, horizontal }) => {
  let items = R.map(item => {
    let backgroundColor = colors[item.color || "orange"];
    let color = item.textColor ? colors[item.textColor] : textColor(item.color || "orange");

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
};

export default Legend;
