import React, { useContext } from "react";
import ConfigContext from "../context/ConfigContext";
import GameContext from "../context/GameContext";

import Color from "../util/Color";
import Currency, { format } from "../util/Currency";
import RotateContext from "../context/RotateContext";

import { multiDefaultTo } from "../util";

const Value = ({ value, fontFamily, color, textColor, shape, fixed, outerBorderColor, rotation }) => {
  const { game } = useContext(GameContext);
  const { config } = useContext(ConfigContext);

  let length = format(value, game, config.currency["value"]).length;
  let size = 15;
  let ry = 14;
  let rx = length > 2 ? length * 6 : 14;
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
                        width={2*rx} height={2*ry} />
                );
              }

              bg = (
                <rect
                      transform={(fixed || rotateContext.fixed) ? null : `rotate(${-rotateContext.angle - (rotation || 0)})`}
                      fill={p(color)} stroke={p("black")} strokeWidth="2"
                      x={-rx} y={-ry}
                      width={2*rx} height={2*ry} />
              );
            } else {
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
                  fontWeight="bold"
                  fontSize={size}
                  fontFamily={multiDefaultTo("sans-serif", game.info.valueFontFamily, fontFamily)}
                  fill={c(textColor) || t(c(color))}
                  dominantBaseline="central"
                  textAnchor="middle"
                  textLength={length > 2 ? (rx + 6) : null}
                  lengthAdjust="spacingAndGlyphs"
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
