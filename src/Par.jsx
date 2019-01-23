import React from "react";
import * as R from "ramda";
import { market } from "./data";
import Color from "./data/Color";

import "./Par.css";

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

const ParCell = ({ value, par, legend }) => {
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
  let width = value.width || par.width || market.par.width;
  let height = value.height || par.height || market.par.height;

  return (
    <Color context="companies">
      {(c,t) => (
        <div
          className="Par__Cell"
          style={{
            width: width,
            height: height,
            backgroundColor: c(color),
            color: t(c(color)),
            fontFamily: market.par.fontFamily,
            fontWeight: market.par.fontWeight,
            fontSize: market.par.fontSize,
            lineHeight: market.par.fontSize
          }}
        >
          {(value && value.label) || value}
        </div>
      )}
    </Color>
  );
};

const ParDoubleRow = ({ par, legend }) => {
  let rows = R.addIndex(R.map)((value, index) => {
    return (
      <div key={`par-${index}`} className="Par__Row">
        <ParCell
          {...{ value: value[0], par, legend }}
        />
        {value[1] && (
          <ParCell {...{ value: value[1], par, legend }} />
        )}
      </div>
    );
  }, groupValues(par.values));
  return (
    <div className="par Par--DoubleRow">
      <h2>Par</h2>
      <div className="Par__Container">{rows}</div>
    </div>
  );
};

const ParRow = ({ par, legend }) => {
  let rows = R.map(value => {
    return (
      <div key={`par-${R.is(Object,value) ? value.label : value}`} className="Par__Row">
        <ParCell {...{ value, par, legend }} />
      </div>
    );
  }, par.values);
  return (
    <div className="par">
      <h2>Par</h2>
      <div className="Par__Container">{rows}</div>
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
