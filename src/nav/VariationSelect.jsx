import React from "react";
import {withRouter, useHistory, useParams} from "react-router";

import map from "ramda/src/map";
import addIndex from "ramda/src/addIndex";

const VariationSelect = ({base, variations}) => {
  let params = useParams();
  let history = useHistory();
  let handleChange = e => {
    if(e.target.value !== params.variation) {
      history.push(`${base}${e.target.value}`);
    }
  };

  return (
    <div className="select">
      <h3>Variation</h3>&nbsp;
      <select value={params.variation} onChange={handleChange}>
        {addIndex(map)((variation, index) => (
          <option key={index} value={index}>{variation}</option>
        ), variations)}
      </select>
    </div>
  );
};

export default withRouter(VariationSelect);
