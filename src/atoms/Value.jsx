import React, { useContext } from "react";
import ConfigContext from "../context/ConfigContext";
import GameContext from "../context/GameContext";

import Color from "../util/Color";
import Currency, { format } from "../util/Currency";
import RotateContext from "../context/RotateContext";

import { multiDefaultTo } from "../util";

const Value = ({ value, fontSize, fontWeight, fontFamily, color, textColor, shape, fixed, outerBorderColor, rotation, height, width }) => {
  const { game } = useContext(GameContext);
  const { config } = useContext(ConfigContext);

  let length = format(value, game, config.currency["value"]).length;
  let ry_default = (fontSize === undefined);

  fontSize = multiDefaultTo(15, fontSize, game.info.valueFontSize);
  fontWeight = multiDefaultTo("bold", fontWeight, game.info.valueFontWeight);
  fontFamily = multiDefaultTo("sans-serif", fontFamily, game.info.valueFontFamily);

  let rx, ry;
  if (height !== undefined) {
    ry = height/2;
  } else if (ry_default) {
    ry = 14;
  } else {
    ry = fontSize * 3 / 4;
  }
  if (width !== undefined)
    rx = width/2;
  else
    rx = length > 2 ? length * ry * 3 / 5 : ry;
  height = multiDefaultTo(ry*2, height);
  width = multiDefaultTo(rx*2, width);
  color = color || "white";
  textColor = textColor || "black";

  return (
    <RotateContext.Consumer>
      {rotateContext => (
        <Color>
          {(c,t,s,p) => {
            let outline = null;
            let bg = null
            if (shape === "square") {
              if (outerBorderColor) {
                outline = (
                  <rect
                        transform={(fixed || rotateContext.fixed) ? null : `rotate(${-rotateContext.angle - (rotation || 0)})`}
                        stroke={p(outerBorderColor)} strokeWidth="7"
                        x={-rx} y={-ry}
                        width={width} height={height} />
                );
              }

              bg = (
                <rect
                      transform={(fixed || rotateContext.fixed) ? null : `rotate(${-rotateContext.angle - (rotation || 0)})`}
                      fill={p(color)} stroke={p("black")} strokeWidth="2"
                      x={-rx} y={-ry}
                      width={width} height={height} />
              );
            } else if (shape !== "none") {
              if (outerBorderColor) {
                outline = (
                  <ellipse
                           transform={(fixed || rotateContext.fixed) ? null : `rotate(${-rotateContext.angle - (rotation || 0)})`}
                           stroke={p(outerBorderColor)} strokeWidth="7"
                           cx="0" cy="0"
                           rx={rx} ry={ry} />
                );
              }

              bg = (
                <ellipse
                         transform={(fixed || rotateContext.fixed) ? null : `rotate(${-rotateContext.angle - (rotation || 0)})`}
                         fill={p(color)} stroke={p("black")} strokeWidth="2"
                         cx="0" cy="0"
                         rx={rx} ry={ry}
                />
              );
            }

            return (
              <g>
                {outline}
                {bg}
                <text
                  transform={(fixed || rotateContext.fixed) ? null : `rotate(${-rotateContext.angle - (rotation || 0)})`}
                  fontSize={fontSize}
                  fontWeight={fontWeight}
                  fontFamily={fontFamily}
                  fill={c(textColor) || t(c(color))}
                  dominantBaseline="central"
                  textAnchor="middle"
                  x="0"
                  y="0"
                >
                  <Currency value={value} type="value"/>
                </text>
              </g>
            );
          }}
        </Color>
      )}
    </RotateContext.Consumer>
  );
};

export default Value;
