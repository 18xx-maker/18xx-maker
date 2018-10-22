import React from "react";
import * as R from "ramda";
import { colors, textColor, market } from "./data";

const groupValues = values => {
  return R.reduce(
    (result, value) => {
      let tail = R.last(result);
      if (!tail || tail.length > 1) {
        return R.append([value], result);
      } else {
        return R.append(R.append(value, tail), R.slice(0, -1, result));
      }
    },
    [],
    values
  );
};

const ParCell = ({ value, par, legend, colSpan }) => {
  let color = "gray";
  if (par.color) {
    color = par.color;
  }
  if (value && Number.isInteger(value.legend) && value.legend < legend.length) {
    color = legend[value.legend].color;
  }
  if (value.color) {
    color = value.color;
  }

  return (
    <td
      style={{
        backgroundColor: colors[color],
        color: textColor(color),
        fontFamily: market.par.fontFamily,
        fontWeight: market.par.fontWeight,
        fontSize: market.par.fontSize,
        lineHeight: market.par.fontSize
      }}
      colSpan={colSpan || 2}
    >
      {(value && value.label) || value}
    </td>
  );
};

const ParDoubleRow = ({ par, legend }) => {
  let rows = R.addIndex(R.map)((value, index) => {
    return (
      <tr key={`par-${index}`}>
        <ParCell {...{ value: value[0], par, legend, colSpan: value[1] ? 1 : 2 }} />
        {value[1] && <ParCell {...{ value: value[1], par, legend, colSpan: 1 }} />}
      </tr>
    );
  }, groupValues(par.values));
  return (
    <div className="par Par--DoubleRow">
      <h2>Par</h2>
      <table>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
};

const ParRow = ({ par, legend }) => {
  let rows = R.map(value => {
    return (
      <tr key={`par-${value}`}>
        <ParCell {...{ value, par, legend }} />
      </tr>
    );
  }, par.values);
  return (
    <div className="par">
      <h2>Par</h2>
      <table>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
};

const Par = props => {
  switch (props.par.type) {
    case "double":
      return <ParDoubleRow {...props} />;
    default:
      return <ParRow {...props} />;
  }
};

export default Par;
