import React from "react";

import logos from "./data/logos";

import chain from "ramda/src/chain";
import toPairs from "ramda/src/toPairs";

import "./Logos.scss";

const logoNodes = chain(([label, company]) => {
  if (company.src) {
    return [(
      <div key={label}>
        <h2>{label}</h2>
        <a href={encodeURIComponent(company.src)}>
          <company.Component width="128" height="128"/>
        </a>
      </div>
    )];
  } else {
    return logoNodes(toPairs(company))
  }
});

const Logos = () => {
  return (
    <div className="logos">
      {logoNodes(toPairs(logos))}
    </div>
  );
};

export default Logos;
