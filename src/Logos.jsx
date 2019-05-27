import React from "react";

import logos from "./data/logos";

import map from "ramda/src/map";
import toPairs from "ramda/src/toPairs";

import "./Logos.scss";

const logoNodes = map(([label, company]) => {
  return (
    <div key={label}>
      <h2>{label}</h2>
      <a href={company.src}><company.Component/></a>
    </div>
  );
}, toPairs(logos));

const Logos = () => {
  return (
    <div className="logos">
      {logoNodes}
    </div>
  );
};

export default Logos;
