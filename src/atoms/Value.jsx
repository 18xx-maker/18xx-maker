import React from "react";

import Color from "../data/Color";
import Config from "../data/Config";
import Currency, { format } from "../util/Currency";
import RotateContext from "../context/RotateContext";

const Value = ({ value, fixed, outerBorderColor }) => {
  return (
    <RotateContext.Consumer>
      {rotation => (
        <Config>
          {(config, game) => {
            let length = format(value, game, config.currency["value"]).length;
            let size = 15;
            let ry = 14;
            let rx = length > 2 ? length * 6 : 14;
            return (
              <Color>
                {(c,t,s,p) => (
                  <g>
                    if(outerBorderColor) {
                      <ellipse
                        stroke={p(outerBorderColor)}
                        strokeWidth="7"
                        cx="0"
                        cy="0"
                        rx={rx}
                        ry={ry}
                      />
                    }
                    <ellipse
                      fill={p("white")}
                      stroke={p("black")}
                      strokeWidth="2"
                      cx="0"
                      cy="0"
                      rx={rx}
                      ry={ry}
                    />
                    <text
                      transform={fixed ? null : `rotate(-${rotation})`}
                      fontWeight="bold"
                      fontSize={size}
                      fontFamily="sans-serif"
                      fill={p("black")}
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
                )}
              </Color>
            );
          }}
        </Config>
      )}
    </RotateContext.Consumer>
  );
};

export default Value;
