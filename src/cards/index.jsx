import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import * as R from "ramda";

import Number from "./Number";
import Private from "./Private";
import Share from "./Share";
import Train from "./Train";

import PageSetup from "../PageSetup";

import games from "../data/games";
import { fillArray } from "../util";

import GameContext from "../context/GameContext";

export const maxPlayers = R.compose(
  R.reduce(R.max, 0),
  R.map(R.prop("number"))
);

const Cards = ({ match }) => {
  let [state, setState] = useState({
    displayPrivates: true,
    displayShares: true,
    displayTrains: true,
    displayNumbers: true
  });

  let handleDisplay = (event) => {
    let target = event.target;
    let value = target.checked;
    let name = target.name;

    setState({...state, [name]: value});
  };

  let game = games[match.params.game];

  if (!game.companies && !game.privates && !game.trains) {
    return <Redirect to={`/${match.params.game}/background`} />;
  }

  let companies = state.displayShares ? game.companies || [] : [];
  let privates = state.displayPrivates ? game.privates || [] : [];
  let trains = fillArray(
    R.prop("quantity"),
    state.displayTrains ? game.trains || [] : []
  );
  let numbers = state.displayNumbers
      ? R.range(1, maxPlayers(game.players || []) + 1)
      : [];

  return (
    <GameContext.Provider value={match.params.game}>
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
          <p>Cards are meant to be printed in <b>landscape</b> mode</p>
        </div>
      </div>
      <div className="cards">
        {R.addIndex(R.map)(
          (p, i) => (
            <Private key={`private-${match.params.game}-${i}`} {...p} />
          ),
          privates
        )}
        {R.addIndex(R.chain)((company, index) => {
          let shares = fillArray(R.prop("quantity"), (company.shares || []));
          return R.addIndex(R.map)(
            (share, i) => (
              <Share
                key={`${company.abbrev}-${i}`}
                name={company.name}
                abbrev={company.abbrev}
                token={company.token || company.color}
                {...share}
              />
            ),
            shares
          );
        }, companies)}
        {R.addIndex(R.map)(
          (train, index) => (
            <Train train={train} key={`train-${train.name}-${index}`} />
          ),
          trains
        )}
        {R.map(
          n => <Number number={n} background={game.info.background} key={`number=${n}`} />,
          numbers
        )}
        <PageSetup landscape={true}/>
      </div>
    </GameContext.Provider>
  );
};

export default Cards;
