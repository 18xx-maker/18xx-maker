import React from "react";
import * as R from "ramda";

import Private from "./Private";
import Share from "./Share";
import Train from "./Train";

import games from "./data/games";
import util from "./util";

class Cards extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayPrivates: true,
      displayShares: true,
      displayTrains: true
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
    let trains = util.fillArray(
      R.prop("quantity"),
      this.state.displayTrains ? game.trains || [] : []
    );

    return (
      <div className="cards">
        <div className="PrintNotes">
          Cards are meant to be printed in <b>landscape</b> mode
          <br />
          <br />
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
        </div>
        {R.addIndex(R.map)(
          (p, i) => (
            <Private key={`private-${match.params.game}-${i}`} {...p} />
          ),
          privates
        )}
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
        {R.addIndex(R.map)(
          (train, index) => (
            <Train train={train} key={`train-${train.name}-${index}`} />
          ),
          trains
        )}
      </div>
    );
  }
}

export default Cards;
