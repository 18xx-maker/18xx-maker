import React from "react";
import * as R from "ramda";
import { colors } from "./data";

import Movement from "./Movement";

const Legend = ({ legend, movement }) => {
  let items = R.map(item => {
    let backgroundColor = colors[item.color || "orange"];
    let color = colors[item.textColor || "white"];

    return (
      <li key={item.description}>
        <i className={`${item.iconStyle || "fas"} fa-${item.icon || "info"}`} style={{ backgroundColor }} />
        {item.description}
      </li>
    );
  }, legend);

  return (
    <div className="Legend">
      <Movement movement={movement} />
      <ul className="notes">{items}</ul>
    </div>
  );
};

export default Legend;
