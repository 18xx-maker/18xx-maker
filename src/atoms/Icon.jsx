import React from "react";
import Color from "../util/Color";
import icons from "../data/icons";

const Icon = ({ type, color, width, fillColor, strokeColor, strokeWidth }) => {
  let icon;
  let iconWidth = width || "25";
  let iconPos = -1 * (width / 2) || "-12.5";
  let circleR = width - 10 || "15";
  let fill = fillColor || "white";
  let stroke = strokeColor || "black";
  let sWidth = strokeWidth || "2";

  if (icons[type]) {
    let iconSvg = icons[type];
    let Component = iconSvg.Component;
    icon = <Component className={`icon-color-main-${color}`}
                      width={iconWidth} height={iconWidth}
                      x={iconPos} y={iconPos} />;
  }

  return (
    <Color>
      {(c,t,s,p) => (
        <g>
          <circle
            fill={p(fill)}
            stroke={p(stroke)}
            strokeWidth={sWidth}
            cx="0"
            cy="0"
            r={circleR}
          />
          {icon}
        </g>
      )}
    </Color>
  );
};

export default Icon;
