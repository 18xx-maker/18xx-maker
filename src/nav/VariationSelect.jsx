import React from "react";
import {withRouter} from "react-router";

import map from "ramda/src/map";
import addIndex from "ramda/src/addIndex";

const VariationSelect = ({base, variations, match, history}) => {
  let handleChange = e => {
    if(e.target.value !== match.params.variation) {
      history.push(`${base}${e.target.value}`);
    }
  };

  return (
    <div className="select">
      <h3>Variation</h3>&nbsp;
      <select value={match.params.variation} onChange={handleChange}>
        {addIndex(map)((variation, index) => (
          <option key={index} value={index}>{variation}</option>
        ), variations)}
      </select>
    </div>
  );
};

export default withRouter(VariationSelect);
