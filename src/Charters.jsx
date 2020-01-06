import React from "react";
import { connect } from "react-redux";
import { Redirect, useParams } from "react-router-dom";
import { getCharterData, compileCompanies, overrideCompanies } from "./util";
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

const Charters = ({charters, paper, override, selection}) => {
  let params = useParams();
  let game = games[params.game];

  if (!game.companies) {
    return <Redirect to={`/${params.game}/background`} />;
  }

  let gameCompanies = overrideCompanies(compileCompanies(game), override, selection);

  let majors = filter(isMajor, gameCompanies);

  let extra = majors.length % (charters.halfWidth ? 4 : 2);
  let padding = 0;
  if (extra > 0) {
    padding = (charters.halfWidth ? 4 : 2) - extra;
  }

  let companies = concat(filter(isMajor, gameCompanies),
                         concat(repeat(null, padding),
                                filter(isMinor, gameCompanies)));

  let data = getCharterData(charters, paper);

  let css = `
.cutlines {
    padding: ${data.css.cutlines};
    width: ${data.css.totalWidth};
    height: ${data.css.totalHeight};
}

.cutlines--minor {
    height: ${data.css.totalMinorHeight};
}

.cutlines--half {
    width: ${data.css.totalHalfWidth};
}

.cutlines:after,
.cutlines:before {
    width: ${data.css.cutlines};
    height: ${data.css.height};
    top: ${data.css.cutlinesAndBleed};
}

.cutlines--minor:after,
.cutlines--minor:before {
    height: ${data.css.minorHeight};
}

.cutlines--half:after,
.cutlines--half:before {
    width: ${data.css.halfWidth};
}

.cutlines > div:after,
.cutlines > div:before {
    width: ${data.css.width};
    height: ${data.css.cutlines};
    left: ${data.css.bleed};
}

.cutlines > div:after {
    bottom: -${data.css.cutlines};
}

.cutlines > div:before {
    top: -${data.css.cutlines};
}

.cutlines--half > div:before,
.cutlines--half > div:after {
    width: ${data.css.halfWidth};
}

.charter,
.charter__bleed {
    height: ${data.css.bleedHeight};
    width: ${data.css.bleedWidth};
}

.charter--minor,
.charter--minor .charter__bleed {
    height: ${data.css.bleedMinorHeight};
}

.charter--half,
.charter--half .charter__bleed {
    width: ${data.css.bleedHalfWidth};
}

.charter__body {
    border: ${data.border}px solid black;
    margin: ${data.css.bleed};
    width: ${data.css.width};
    height: ${data.css.height};
}

.charter--minor .charter__body {
    height: ${data.css.minorHeight};
}

.charter--half .charter__body {
    width: ${data.css.halfWidth};
}

.charter--color .charter__hr {
    height: calc(1.0625in + ${data.css.bleed});
}
.charter--color.charter--minor .charter__hr {
    height: calc(0.875in + ${data.css.bleed});
}

.charter--carth .charter__hr {
    top: calc(1.125in + ${data.css.bleed});
}

.charter--carth.harter--minor .charter__hr,
.charter--carth.charter--half .charter__hr {
    top: calc(0.875in + ${data.css.bleed});
}
`;

  return (
    <GameContext.Provider value={params.game}>
      <div className="charters">
        <style>{css}</style>
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
              company={company}
            /> : <div key="spacer" className={`cutlines${charters.halfWidth ? " cutlines--half" : ""}`}><div className={`charter${charters.halfWidth ? " charter--half" : ""}`}></div></div>
        ), companies)}
        <PageSetup landscape={false}/>
      </div>
    </GameContext.Provider>
  );
};

const mapStateToProps = state => ({
  charters: state.config.charters,
  paper: state.config.paper,
  override: state.config.overrideCompanies,
  selection: state.config.overrideSelection
});

export default connect(mapStateToProps)(Charters);
