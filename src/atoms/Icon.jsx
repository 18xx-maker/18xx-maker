import React from "react";
import Color from "../data/Color";
import icons from "../data/icons";

const Icon = ({ type, color }) => {
  let icon;

  if (icons[type]) {
    let iconSvg = icons[type];
    let Component = iconSvg.Component;
    icon = <Component className={`icon-color-main-${color}`}
                      width="25" height="25" x="-12.5" y="-12.5"/>;
  }

  return (
    <Color>
      {(c,t,s,p) => (
        <g>
          <circle
            fill={p("white")}
            stroke={p("black")}
            strokeWidth="2"
            cx="0"
            cy="0"
            r="15"
          />
          {icon}
        </g>
      )}
    </Color>
  );
};

export default Icon;
