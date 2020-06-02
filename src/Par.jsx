import React from "react";
import * as R from "ramda";
import { unitsToCss } from "./util";
import Color from "./data/Color";
import { GetFont, SetFont } from "./context/FontContext";

import Currency from "./util/Currency";

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
  const { config } = useContext(ConfigContext);
  const stock = config.stock;
 
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
  let width = value.width || par.width || unitsToCss(stock.par.width);
  let height = value.height || par.height || unitsToCss(stock.par.height);

  return (
    <Color context="companies">
      {(c,t) => (
        <GetFont>{font => (
          <div
            className="Par__Cell"
            style={{
              width: width,
              height: height,
              backgroundColor: c(color),
              color: t(c(color)),
              lineHeight: font.fontSize,
              ...font
            }}
          >
            <Currency value={(value && value.label) || value} type="par"/>
          </div>
        )}</GetFont>
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
      <h3>Par Values</h3>
      <div className="Par__Container">
        {rows}
      </div>
    </div>
  );
};

const Par = props => {
  let par = null;
  switch (props.par.type) {
  case "double":
    par = <ParDoubleRow {...props} />;
    break;
  default:
    par = <ParRow {...props} />;
  }

  return (
    <SetFont context="par">
      {par}
    </SetFont>
  );
};

export default Par;
