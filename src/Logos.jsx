import React from "react";

import logos from "./data/logos";

import map from "ramda/src/map";
import toPairs from "ramda/src/toPairs";

import "./Logos.scss";

const logoNodes = map(([label, company]) => {
  return (
    <div key={label}>
      <h2>{label}</h2>
      <a href={encodeURIComponent(company.src)}>
        <company.Component width="128" height="128"/>
      </a>
    </div>
  );
});

const Logos = () => {
  return (
    <div className="logos">
      {logoNodes(toPairs(logos))}
    </div>
  );
};

export default Logos;
