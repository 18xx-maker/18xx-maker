import React from "react";
import {withRouter, useHistory, useLocation, useParams} from "react-router";

import games from "../data/games";

import equals from "ramda/src/equals";

const disabled = value => {
  return value === undefined || value === null || equals(value, []) || equals(value, {})
}

const ComponentSelect = () => {
  let params = useParams();
  let history = useHistory();
  let location = useLocation();

  let gameName = params.game;
  let game = games[gameName];

  let handleChange = event => {
    history.push(`/${gameName}/${event.target.value}`);
  };

  let selection = "";
  if (game) {
    selection = location.pathname.split('/')[2];
  }

  return (
    <div className="select">
      <h3>Component</h3>
      <select onChange={handleChange}
              value={selection}>
        {selection !== "" || <option value="">None</option>}
        <option disabled={!selection} value="background">Background</option>
        <option disabled={!selection || disabled(game.privates || game.companies || game.trains)} value="cards">Cards</option>
        <option disabled={!selection || disabled(game.companies)} value="charters">Charters</option>
        <option disabled={!selection || disabled(game.ipo)} value="ipo">IPO</option>
        <option disabled={!selection || disabled(game.map)} value="map">Map</option>
        <option disabled={!selection || disabled(game.map)} value="map-paginated">Map - Paginated</option>
        <option disabled={!selection || disabled(game.stock)} value="market">Market</option>
        <option disabled={!selection || disabled(game.stock)} value="market-paginated">Market - Paginated</option>
        <option disabled={!selection} value="revenue">Revenue</option>
        <option disabled={!selection || disabled(game.rounds)} value="rounds">Round Tracker</option>
        <option disabled={!selection || disabled(game.tiles)} value="tile-manifest">Tile Manifest</option>
        <option disabled={!selection || disabled(game.tiles)} value="tiles">Tiles</option>
        <option disabled={!selection || disabled(game.companies)} value="tokens">Tokens</option>
      </select>
    </div>
  );
};

export default withRouter(ComponentSelect);
