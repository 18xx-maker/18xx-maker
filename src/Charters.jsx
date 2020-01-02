import React from "react";
import { connect } from "react-redux";
import { Redirect, useParams } from "react-router-dom";
import { compileCompanies } from "./util";
import Charter from "./Charter";
import games from "./data/games";
import * as R from "ramda";

import GameContext from "./context/GameContext";
import PageSetup from "./PageSetup";

import compose from "ramda/src/compose";
import concat from "ramda/src/concat";
import filter from "ramda/src/filter";
import not from "ramda/src/not";
import prop from "ramda/src/prop";
import repeat from "ramda/src/repeat";

const isMinor = prop("minor");
const isMajor = compose(not, prop("minor"));

const Charters = ({halfWidthCharters, override, selection}) => {
  let params = useParams();
  let game = games[params.game];

  if (!game.companies) {
    return <Redirect to={`/${params.game}/background`} />;
  }

  let gameCompanies = compileCompanies(game, override, selection);

  let majors = filter(isMajor, gameCompanies);

  let extra = majors.length % (halfWidthCharters ? 4 : 2);
  let padding = 0;
  if (extra > 0) {
    padding = (halfWidthCharters ? 4 : 2) - extra;
  }

  let companies = concat(filter(isMajor, gameCompanies),
                         concat(repeat(null, padding),
                                filter(isMinor, gameCompanies)));

  return (
    <GameContext.Provider value={params.game}>
      <div className="charters">
        <div className="PrintNotes">
          <div>
            <p>
              Charters are meant to be printed in <b>portait</b> mode
            </p>
          </div>
        </div>
        {R.addIndex(R.chain)((company, index) => (
          company ?
            <Charter
              game={game.info.title}
              key={company.abbrev}
              name={company.name}
              abbrev={company.abbrev}
              logo={company.logo}
              token={company.token || company.color}
              tokens={company.tokens}
              phases={game.phases}
              turns={game.turns}
              minor={!!company.minor}
            /> : <div key="spacer" className="cutlines"><div className={`charter${halfWidthCharters ? " charter--half" : ""}`}></div></div>
        ), companies)}
        <PageSetup landscape={false}/>
      </div>
    </GameContext.Provider>
  );
};

const mapStateToProps = state => ({
  halfWidthCharters: state.config.halfWidthCharters,
  override: state.config.overrideCompanies,
  selection: state.config.overrideSelection
});

export default connect(mapStateToProps)(Charters);
