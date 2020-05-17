import React, { useState } from "react";
import { connect } from "react-redux";
import { Redirect, useParams } from "react-router-dom";
import * as R from "ramda";

import Number from "./Number";
import Private from "./Private";
import Share from "./Share";
import Train from "./Train";

import PageSetup from "../PageSetup";

import Config from "../data/Config";

import games from "../data/games";
import { compileCompanies, overrideCompanies, fillArray } from "../util";
import { getCardData } from "./util";
import Svg from "../Svg";

import GameContext from "../context/GameContext";

import "./card.scss";

export const maxPlayers = R.compose(
  R.reduce(R.max, 0),
  R.map(R.prop("number"))
);

const Cards = ({ override, selection }) => {
  let params = useParams();
  let [state, setState] = useState({
    displayPrivates: true,
    displayShares: true,
    displayTrains: true,
    displayNumbers: true
  });

  let handleDisplay = event => {
    let target = event.target;
    let value = target.checked;
    let name = target.name;

    setState({ ...state, [name]: value });
  };

  let game = games[params.game];

  if (!game.companies && !game.privates && !game.trains) {
    return <Redirect to={`/${params.game}/background`} />;
  }

  let companies = state.displayShares ? overrideCompanies(compileCompanies(game), override, selection) || [] : [];
  let privates = state.displayPrivates ? game.privates || [] : [];
  let trains = fillArray(
    t => t.print || t.quantity,
    state.displayTrains ? game.trains || [] : []
  );
  let numbers = state.displayNumbers
      ? R.range(1, maxPlayers(game.players || []) + 1)
      : [];

  let privateNodes = R.addIndex(R.map)(
    (p, i) => (
      <Private key={`private-${params.game}-${i}`}
               players={game.players}
               {...p} />
    ),
    privates
  );
  let shareNodes = R.addIndex(R.chain)((company, index) => {
    let shares = fillArray(R.prop("quantity"), company.shares || []);
    return R.addIndex(R.map)(
      (share, i) => (
        <Share
          key={`${index}-${company.abbrev}-${i}`}
          company={company}
          name={company.name}
          abbrev={company.abbrev}
          logo={company.logo}
          color={company.color}
          token={company.token || company.color}
          {...share}
          subtext={company.subtext || share.subtext}
          variant={company.variant || share.variant}
        />
      ),
      shares
    );
  }, companies);
  let trainNodes = R.addIndex(R.map)(
    (train, index) => (
      <Train train={train} trains={game.trains} key={`train-${train.name}-${index}`} />
    ),
    trains
  );
  let numberNodes = R.map(
    n => (
      <Number
        number={n}
        background={game.info.background}
        key={`number=${n}`}
      />
    ),
    numbers
  );

  let cardNodes = [...privateNodes, ...shareNodes, ...trainNodes, ...numberNodes];

  return (
    <GameContext.Provider value={params.game}>
      <Config>
        {(config, game) => {
          let cardConfig = R.clone(config.cards);
          let paperConfig = R.clone(config.paper);

          switch(config.cards.layout) {
          case "miniEuroDie":
            paperConfig.width = 850;
            paperConfig.height = 1100;
            paperConfig.margins = 25;

            cardConfig.width = 265.748;
            cardConfig.height = 173.228;
            cardConfig.cutlines = 25;
            cardConfig.bleed = 12.5;
            cardConfig.border = 0;

            break;
          case "dtgDie":
            paperConfig.width = 850;
            paperConfig.height = 1100;
            paperConfig.margins = 25;

            cardConfig.width = 250;
            cardConfig.height = 150;
            cardConfig.cutlines = 0;
            cardConfig.bleed = 0;
            cardConfig.border = 0;

            break;
          default:
            // No overrides for "free" layout
            break;
          }

          let data = getCardData(cardConfig, paperConfig);

          let pins = null;

          if (config.cards.layout !== "free") {
            pins = (<Svg className="pins" viewBox="0 0 50 800">
                      <circle r="12.5" cy="100" cx="25" fill="gray" strokeWidth="1" stroke="black" />
                      <circle r="12.5" cy="700" cx="25" fill="gray" strokeWidth="1" stroke="black" />
                      <circle r="6.25" cy="100" cx="25" fill="white" strokeWidth="1" stroke="black" />
                      <circle r="6.25" cy="700" cx="25" fill="white" strokeWidth="1" stroke="black" />
                    </Svg>);
          }

          let splitCardNodes = R.splitEvery(data.layout.perPage, cardNodes);

          let pageNodes = R.addIndex(R.map)((cardNodes, i) => (
            <div className={`cards cards--${config.cards.layout}`}
                 key={`cards-page-${i}`}
                 style={{width: data.css.printableWidth,
                         height: data.css.printableHeight}}>
              {cardNodes}
              {pins}
            </div>
          ), splitCardNodes);

          let css = `
.cutlines {
    padding: ${data.css.cutlines};
    width: ${data.css.totalWidth};
    height: ${data.css.totalHeight};
}

.cutlines:after,
.cutlines:before {
    width: ${data.css.cutlines};
    height: ${data.css.height};
    top: ${data.css.cutlinesAndBleed};
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

.card,
.card__bleed {
    height: ${data.css.bleedHeight};
    width: ${data.css.bleedWidth};
}

.card__body {
    border: ${data.border}px solid black;
    margin: ${data.css.bleed};
    width: ${data.css.width};
    height: ${data.css.height};
}

.share__hr {
    bottom: calc(0.375in + ${data.css.bleed});
}

.share--left .share__hr {
    left: calc(0.2025in + ${data.css.bleed});
}

.share--gmt .share__hr {
    width: calc(0.67in + ${data.css.bleed});
}

.train__hr {
    height: calc(0.6875in + ${data.css.bleed});
}
`;

          return (
            <React.Fragment>
              <style>{css}</style>
              <div className="PrintNotes">
                <div>
                  <label>
                    <input
                      name="displayPrivates"
                      type="checkbox"
                      checked={state.displayPrivates}
                      onChange={handleDisplay}
                    />
                    Privates
                  </label>
                  <label>
                    <input
                      name="displayShares"
                      type="checkbox"
                      checked={state.displayShares}
                      onChange={handleDisplay}
                    />
                    Shares
                  </label>
                  <label>
                    <input
                      name="displayTrains"
                      type="checkbox"
                      checked={state.displayTrains}
                      onChange={handleDisplay}
                    />
                    Trains
                  </label>
                  <label>
                    <input
                      name="displayNumbers"
                      type="checkbox"
                      checked={state.displayNumbers}
                      onChange={handleDisplay}
                    />
                    Numbers
                  </label>
                  <p>
                    Cards are meant to be printed in <b>{data.layout.landscape ? "landscape" : "portrait"}</b> mode
                  </p>
                </div>
              </div>
              {pageNodes}
              <PageSetup landscape={data.layout.landscape} />
            </React.Fragment>
          );
        }}
      </Config>
    </GameContext.Provider>
  );
};

const mapStateToProps = state => ({
  override: state.config.overrideCompanies,
  selection: state.config.overrideSelection
});

export default connect(mapStateToProps)(Cards);
