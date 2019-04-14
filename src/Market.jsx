import React from "react";
import * as R from "ramda";
import * as util from "./market-utils";
import * as tinycolor from "tinycolor2";

import MarketCell from "./MarketCell";

require("./Market.css");

const divideArray = (market, pad) => {
  let pivot = Math.ceil(market.length / 2);
  return [
    R.slice(0, pivot, market),
    R.concat(
      pad && market.length % 2 !== 0 ? [null] : [],
      R.slice(pivot, Infinity, market)
    )
  ];
};

const splitArray = market => {
  return [
    R.concat(R.addIndex(R.filter)((_, i) => i % 2 !== 1, market), [null]),
    R.concat([null], R.addIndex(R.filter)((_, i) => i % 2 === 1, market))
  ];
};

const Market1D = ({ legend, market, par, title }) => {
  let tables = R.addIndex(R.map)((table, i) => {
    let cells = R.addIndex(R.map)((value, col) => {
      return <MarketCell {...{ value, legend, par }} key={`cell-0-${col}`} />;
    }, table);
    return (
      <table key={`table-${i}`}>
        <tbody>
          <tr key="row-0">{cells}</tr>
        </tbody>
      </table>
    );
  }, divideArray(market, true));

  return (
    <div className="Market Market__1Diag">
      <h2>{title} Stock Market</h2>
      {tables}
    </div>
  );
};

const Market1Diag = ({ legend, market, par, title }) => {
  let tables = R.addIndex(R.map)((table, i) => {
    let rows = R.addIndex(R.map)((marketRow, row) => {
      let cells = R.addIndex(R.map)((value, col) => {
        let colSpan = value ? 2 : 1;
        return (
          <MarketCell
            {...{ value, legend, par, colSpan }}
            key={`cell-${row}-${col}`}
          />
        );
      }, marketRow);

      return <tr key={`row-${row}`}>{cells}</tr>;
    }, splitArray(table));

    return (
      <table key={`table-${i}`}>
        <tbody>{rows}</tbody>
      </table>
    );
  }, divideArray(market));

  return (
    <div
      style={{ width: par && par.values ? "calc(100% - 2.25in)" : "100%" }}
      className="Market Market__1D"
    >
      <h2>{title} Stock Market</h2>
      {tables}
    </div>
  );
};

const Market2D = ({ legend, market, par, title, displayMode, paginated, cell }) => {
  market = util.normalize(market);
  let rows = R.addIndex(R.map)((marketRow, row) => {
    let cells = R.addIndex(R.map)((value, col) => {
      if (displayMode === "delta") {
        if (value) {
          if (!R.is(Object, value)) {
            value = { label: value, value: value };
          } else {
          value = R.clone(value);
        }
          let delta = util.delta(col, row, market);
          value.subLabel = delta;
          // value.rawColor = tinycolor.fromRatio({h:(delta * 0.00667 * 4.0), s:0.85, v:0.85}).toHexString();
          value.rawColor = tinycolor.fromRatio({h:0.0, l:(R.min((25 - delta) * 0.04, 1.0)), s:0.5}).toHexString();
        }
      }

      return (
        <MarketCell {...{value, legend, par, ...cell}} key={`cell-${row}-${col}`} />
      );
    }, marketRow);
    return <tr key={row}>{cells}</tr>;
  }, market);

  return (
    <div className="Market">
      <h2>{title} Stock Market</h2>
      <table>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
};

const Market = stock => {
  switch (stock.type) {
    case "1D":
      return <Market1D {...stock} />;
    case "1Diag":
      return <Market1Diag {...stock} />;
    case "2D":
      return <Market2D {...stock} />;
    default:
      return null;
  }
};

export default Market;
