import React from "react";
import * as R from "ramda";

import Hex from "./Hex";
import Svg from "./Svg";

import HexContext from "./context/HexContext";

const Positioning = () => {
  let nodes = R.chain(i => {
    let angle = i * 30;

    return (
      <tr>
        {R.map(j => {
          let percent = (j + 1) * 0.25;

          let displayPercent = Math.floor(percent * 100);

          let data = {
            color: "yellow",
            values: [
              {
                value: 20,
                angle,
                percent
              }
            ]
          };

          return (
            <td>
              <Svg width="200" height="200" viewBox="-100 -100 200 200">
                <Hex
                  hex={data}
                  id={`${angle} ${displayPercent}%`}
                  border={true}
                />
              </Svg>
            </td>
          );
        }, Array.from(Array(4).keys()))}
      </tr>
    );
  }, Array.from(Array(12).keys()));

  return (
    <div className="positioning">
      <HexContext.Provider value={{ width: 150, rotation: 90 }}>
        <table>
          <tbody>{nodes}</tbody>
        </table>
      </HexContext.Provider>
    </div>
  );
};

export default Positioning;
