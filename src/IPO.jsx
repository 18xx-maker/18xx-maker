import React from "react";
import games from "./data/games";
import * as R from "ramda";
import { colors } from "./data";

import Token from "./Token";
import Svg from "./Svg";

require("./IPO.css");

const IPO = ({ match }) => {
  let game = games[match.params.game];
  let companies = game.companies;

  return (
    <div className="ipo">
      <h2>IPO</h2>
      <div className="ipo__companies">
        {R.map(
          company => (
            <div className="ipo__company" style={{backgroundColor: colors["plain"]}}>
              <div className="ipo__token">
                <Svg viewBox="-25 -25 50 50">
                  <Token label={company.abbrev} color={company.color} />
                </Svg>
              </div>
            </div>
          ),
          companies
        )}
      </div>
    </div>
  );
};

export default IPO;
