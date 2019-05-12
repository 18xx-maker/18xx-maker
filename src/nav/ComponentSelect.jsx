import React from "react";
import {withRouter} from "react-router";

import games from "../data/games";

const ComponentSelect = ({match,history,location}) => {
  let gameName = match.params.game;
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
        <option disabled={!selection} value="cards">Cards</option>
        <option disabled={!selection} value="charters">Charters</option>
        {false && game.ipo && <option disabled={!selection} value="ipo">IPO</option>}
        <option disabled={!selection} value="map">Map</option>
        <option disabled={!selection} value="map-paginated">Map - Paginated</option>
        <option disabled={!selection} value="market">Market</option>
        <option disabled={!selection} value="market-paginated">Market - Paginated</option>
        {game && game.minorCompanies && <option disabled={!selection} value="minors">Minors</option>}
        <option disabled={!selection} value="revenue">Revenue</option>
        <option disabled={!selection} value="tile-manifest">Tile Manifest</option>
        <option disabled={!selection} value="tiles">Tiles</option>
        <option disabled={!selection} value="tokens">Tokens</option>
      </select>
    </div>
  );
};

export default withRouter(ComponentSelect);
