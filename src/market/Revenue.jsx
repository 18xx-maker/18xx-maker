import React from "react";

import Cell from "./Cell";
import Config from "../data/Config";

import addIndex from "ramda/src/addIndex";
import chain from "ramda/src/chain";
import map from "ramda/src/map";
import range from "ramda/src/range";
import splitEvery from "ramda/src/splitEvery";

const Revenue = ({data, title}) => {
  let {min, max, perRow} = data;
  let numbers = splitEvery(perRow, range(min, max + 1));

  return (
    <Config>
      {(config, game) => {
        let cells = addIndex(chain)((row, y) => {
          return addIndex(map)((number, x) => {
            let cell = {
              value: number
            };

            if (number % 10 === 0) {
              cell.color = "orange";
            } else if (number % 5 === 0) {
              cell.color = "yellow";
            }

            return (
              <g key={`revenue-${x}-${y}`}
                 transform={`translate(${x * data.width} ${y * data.height + 50})`}>
                <Cell cell={cell} data={data} />
              </g>
            );
          }, row);
        }, numbers);

        return (
          <g>
            <text
              fontFamily="display"
              fontStyle="bold"
              fontSize="25"
              dominantBaseline="hanging"
              x="0"
              y="12.5"
            >
              {title} Revenue
            </text>
            {cells}
          </g>
        );
      }}
    </Config>
  );
};

export default Revenue;
