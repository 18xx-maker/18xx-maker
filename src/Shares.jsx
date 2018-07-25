import React from "react";
import Share from "./Share";
import games from "./data/games";
import util from "./util";
import * as R from "ramda";

const Shares = ({ match }) => {
  let game = games[match.params.game];
  let companies = game.companies;

  if(!companies) {
    return null;
  }

  return (
      <div className="cards">
        {R.addIndex(R.chain)((company, index) => {
          let shares = util.fillArray(R.prop("quantity"), company.shares);
          return R.addIndex(R.map)(
            (share, i) => (
              <Share
                key={`${company.abbrev}-${i}`}
                name={company.name}
                abbrev={company.abbrev}
                color={company.color}
                {...share}
              />
            ),
            shares
          );
        }, companies)}
      </div>
  );
};

export default Shares;
