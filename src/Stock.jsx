import React from "react";
import Market from "./Market";
import games from "./data/games";

import Rounds from "./Rounds";
import Par from "./Par";
import Legend from "./Legend";

import "./Stock.css";

class Stock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayMode: "normal"
    };
    this.handleDisplayMode = this.handleDisplayMode.bind(this);
  }

  handleDisplayMode(event) {
    const value = event.target.value;
    this.setState({
      displayMode: value
    });
  }

  render() {
    let match = this.props.match;
    let game = games[match.params.game];
    let stock = game.stock;

    if (!stock) {
      return null;
    }

    return (
      <div className="stock" style={{ height: "100vh" }}>
        <div className="PrintNotes">
          Stock Market is meant to be printed in{" "}
          <b>{stock.orientation || "landscape"}</b> mode
          {false &&
            stock.type === "2D" && (
              <React.Fragment>
                <br />
                <br />
                <label>
                  <select
                    name="displayMode"
                    value={this.state.displayMode}
                    onChange={this.handleDisplayMode}
                  >
                    <option value="normal">Normal</option>
                    <option value="delta">%Δ</option>
                  </select>
                </label>
              </React.Fragment>
            )}
        </div>
        <Market
          {...stock}
          paginated={false}
          title={game.info.title}
          displayMode={this.state.displayMode}
        />
        <div className="StockHelpers">
          {stock.par &&
            stock.par.values && (
              <Par par={stock.par} legend={stock.legend || []} />
            )}
          <Rounds
            rounds={game.rounds}
            horizontal={game.stock.type === "2D" ? false : true}
          />
          <Legend
            legend={game.stock.legend || []}
            movement={game.stock.movement}
            horizontal={game.stock.type === "2D" ? false : true}
          />
        </div>
      </div>
    );
  }
}

export default Stock;
