import React, { useContext } from "react";
import { Redirect } from "react-router-dom";

import ConfigContext from "../context/ConfigContext";
import GameContext from "../context/GameContext";

import Number from "./Number";
import Private from "./Private";
import Share from "./Share";
import Train from "./Train";

import PageSetup from "../PageSetup";

import { compileCompanies, overrideCompanies, fillArray } from "../util";
import { getCardData } from "./util";
import Svg from "../Svg";

import addIndex from "ramda/src/addIndex";
import chain from "ramda/src/chain";
import clone from "ramda/src/clone";
import compose from "ramda/src/compose";
import reduce from "ramda/src/reduce";
import map from "ramda/src/map";
import max from "ramda/src/max";
import prop from "ramda/src/prop";
import range from "ramda/src/range";
import splitEvery from "ramda/src/splitEvery";

import "./card.scss";

export const maxPlayers = compose(
  reduce(max, 0),
  map(prop("number"))
);

const Cards = ({ hidePrivates, hideShares, hideTrains, hideNumbers }) => {
  const { config } = useContext(ConfigContext);
  const { game } = useContext(GameContext);

  const override = config.overrideCompanies;
  const selection = config.overrideSelection;

  if (!game.companies && !game.privates && !game.trains) {
    return <Redirect to={`/games/${game.slug}/background`} />;
  }

  let companies = !hideShares ? overrideCompanies(compileCompanies(game), override, selection) || [] : [];
  let privates = !hidePrivates ? game.privates || [] : [];
  let trains = fillArray(
    t => t.print || t.quantity,
    !hideTrains ? game.trains || [] : []
  );
  let numbers = hideNumbers ? [] : range(1, maxPlayers(game.players || []) + 1);

  let privateNodes = addIndex(map)(
    (p, i) => (
      <Private key={`private-${game.id}-${i}`}
               players={game.players}
               {...p} />
    ),
    privates
  );
  let shareNodes = addIndex(chain)((company, index) => {
    let shares = fillArray(prop("quantity"), company.shares || []);
    return addIndex(map)(
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
  let trainNodes = addIndex(map)(
    (train, index) => (
      <Train train={train} trains={game.trains} key={`train-${train.name}-${index}`} />
    ),
    trains
  );
  let numberNodes = map(
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

  let cardConfig = clone(config.cards);
  let paperConfig = clone(config.paper);

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

  let splitCardNodes = splitEvery(data.layout.perPage, cardNodes);

  let pageNodes = addIndex(map)((cardNodes, i) => (
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
      {pageNodes}
      <PageSetup landscape={data.layout.landscape} />
    </React.Fragment>
  );
};

export default Cards;
