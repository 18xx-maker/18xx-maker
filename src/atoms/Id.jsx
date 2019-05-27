import React from "react";
import Color from "../data/Color";

import HexContext from "../context/HexContext";

const Id = ({ id, extra }) => {
  return (
    <HexContext.Consumer>
      {hx => (
        <Color>
          {(c,t,s,p) => (
            <React.Fragment>
              <g transform={`rotate(${hx.rotation}) translate(-40 70)`}>
                <text
                  fontFamily="sans-serif"
                  fill={p("black")}
                  stroke="none"
                  strokeLinecap="round"
                  strokeLinejoin="bevel"
                  dominantBaseline="baseline"
                  textAnchor="start"
                  fontSize="12"
                  fontWeight="normal"
                  x="0"
                  y="0"
                >
                  {id}
                </text>
              </g>
              {extra && (
                <g transform={`rotate(${hx.rotation}) translate(40 70)`}>
                  <text
                    fontFamily="sans-serif"
                    fill={c("black")}
                    stroke="none"
                    strokeLinecap="round"
                    strokeLinejoin="bevel"
                    dominantBaseline="baseline"
                    textAnchor="end"
                    fontSize="12"
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
      )}
    </HexContext.Consumer>
  );
};

export default Id;
