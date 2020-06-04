import React from "react";
import Color from "../data/Color";
import Config from "../data/Config";

import HexContext from "../context/HexContext";

const Id = ({ id, extra }) => {
  let fontSize = (id && id.length > 4) ? "9" : (id && id.length > 3) ? "10" : "12";
  let extraFontSize = (extra && extra.length > 4) ? "9" : (extra && extra.length > 3) ? "10" : "12";

  return (
    <HexContext.Consumer>
      {hx => (
        <Config>
          {config => {
            if(config.tiles.id === "none") {
              return null;
            }

            // Otherwise it's right or left
            let idAnchor = "end";
            let extraAnchor = "start";
            let idX = 40;
            let extraX = -40;
            if(config.tiles.id === "left") {
              idAnchor = "start";
              extraAnchor = "end";
              idX = -40;
              extraX = 40;
            }

            return (
              <Color>
                {(c,t,s,p) => (
                  <React.Fragment>
                    <g transform={`rotate(${hx.rotation}) translate(${idX} 70)`}>
                      <text
                        fontFamily="sans-serif"
                        fill={p("black")}
                        stroke="none"
                        strokeLinecap="round"
                        strokeLinejoin="bevel"
                        dominantBaseline="baseline"
                        textAnchor={idAnchor}
                        fontSize={fontSize}
                        fontWeight="normal"
                        x="0"
                        y="0"
                      >
                        {id}
                      </text>
                    </g>
                    {extra && (
                      <g transform={`rotate(${hx.rotation}) translate(${extraX} 70)`}>
                        <text
                          fontFamily="sans-serif"
                          fill={c("black")}
                          stroke="none"
                          strokeLinecap="round"
                          strokeLinejoin="bevel"
                          dominantBaseline="baseline"
                          textAnchor={extraAnchor}
                          fontSize={extraFontSize}
                          x="0"
                          y="0"
                        >
                          {extra}
                        </text>
                      </g>
                    )}
                  </React.Fragment>
                )}
              </Color>
            );
        }}</Config>
      )}
    </HexContext.Consumer>
  );
};

export default Id;
