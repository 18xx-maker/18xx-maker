import React from "react";
import * as R from "ramda";

import Number from "./Number";
import Private from "./Private";
import Share from "./Share";
import Train from "./Train";

import games from "../data/games";
import { fillArray } from "../util";

import GameContext from "../context/GameContext";

export const maxPlayers = R.compose(
  R.reduce(R.max, 0),
  R.map(R.prop("number"))
);

class Cards extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayPrivates: true,
      displayShares: true,
      displayTrains: true,
      displayNumbers: true
    };

    this.handleDisplay = this.handleDisplay.bind(this);
  }

  handleDisplay(event) {
    const target = event.target;
    const value = target.checked;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  render() {
    let match = this.props.match;
    let game = games[match.params.game];

    let companies = this.state.displayShares ? game.companies || [] : [];
    let privates = this.state.displayPrivates ? game.privates || [] : [];
    let trains = fillArray(
      R.prop("quantity"),
      this.state.displayTrains ? game.trains || [] : []
    );
    let numbers = this.state.displayNumbers
        ? R.range(1, maxPlayers(game.players) + 1)
        : [];

    return (
      <GameContext.Provider value={match.params.game}>
        <div className="PrintNotes">
          <div>
            <label>
              <input
                name="displayPrivates"
                type="checkbox"
                checked={this.state.displayPrivates}
                onChange={this.handleDisplay}
              />
              Privates
            </label>
            <label>
              <input
                name="displayShares"
                type="checkbox"
                checked={this.state.displayShares}
                onChange={this.handleDisplay}
              />
              Shares
            </label>
            <label>
              <input
                name="displayTrains"
                type="checkbox"
                checked={this.state.displayTrains}
                onChange={this.handleDisplay}
              />
              Trains
            </label>
            <label>
              <input
                name="displayNumbers"
                type="checkbox"
                checked={this.state.displayNumbers}
                onChange={this.handleDisplay}
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
            let shares = fillArray(R.prop("quantity"), company.shares);
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
          <style>{`@media print {@page {size: 11in 8.5in;}}`}</style>
        </div>
      </GameContext.Provider>
    );
  }
}

export default Cards;
