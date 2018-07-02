import React from "react";
import Share from "./Share";
import games from "./data/games";
import util from "./util";
import * as R from "ramda";

const Shares = ({ match }) => {
  let game = games[match.params.game];
  let companies = game.companies;
  let trains = util.fillArray(R.prop("quantity"), game.trains);

  return (
      <div class="cards">
        {R.addIndex(R.chain)((company, index) => {
          let shares = util.fillArray(R.prop("quantity"), company.shares);
          return R.map(
            share => (
              <Share
                shares={share.shares}
                percent={share.percent}
                name={company.name}
                abbrev={company.abbrev}
                label={share.label}
                color={company.color}
              />
            ),
            shares
          );
        }, companies)}
      </div>
  );
};

export default Shares;
