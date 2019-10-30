import React from "react";
import { useParams } from "react-router-dom";
import games from "./data/games";
import * as R from "ramda";
import Color from "./data/Color";
import ColorContext from "./context/ColorContext";

import Token from "./Token";
import Svg from "./Svg";
import PageSetup from "./PageSetup";

require("./IPO.css");

const IPO = () => {
  let params = useParams();
  let game = games[params.game];
  let companies = R.filter(company => (!company.minor), game.companies); // only show non-minor companies in IPO

  return (
    <Color>
      {c => (
        <div className="ipo">
          <h2>{game.info.title} IPO</h2>
          <div className="ipo__companies">
            {R.map(
              company => (
                <div key={`ipo-${company.abbrev}`} className="ipo__company" style={{backgroundColor: c("plain")}}>
                  <div className="ipo__token">
                    <ColorContext.Provider value="companies">
                      <Svg viewBox="-25 -25 50 50">
                        <Token company={company.abbrev} />
                      </Svg>
                    </ColorContext.Provider>
                  </div>
                </div>
              ),
              companies
            )}
          </div>
          <PageSetup landscape={true}/>
        </div>
      )}
    </Color>
  );
};

export default IPO;
