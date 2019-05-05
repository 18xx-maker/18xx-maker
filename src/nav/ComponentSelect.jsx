import React from "react";
import {withRouter} from "react-router";

import games from "../data/games";

const ComponentSelect = ({match,history,location}) => {
  let gameName = match.params.game;
  let game = games[gameName];

  let handleChange = event => {
    history.push(`/${gameName}/${event.target.value}`);
  };

  let selection = location.pathname.split('/')[2];

  return (
    <div className="select">
      <h3>Component</h3>
      <select onChange={handleChange}
              value={selection}>
        <option value="background">Background</option>
        <option value="cards">Cards</option>
        <option value="charters">Charters</option>
        {game.minorCompanies && <option value="minors">Minors</option>}
        {false && game.ipo && <option value="ipo">IPO</option>}
        <option value="market">Market</option>
        <option value="market-paginated">Market - Paginated</option>
        <option value="map">Map</option>
        <option value="map-paginated">Map - Paginated</option>
        <option value="tiles">Tiles</option>
        <option value="manifest">Tile Manifest</option>
        <option value="tokens">Tokens</option>
      </select>
    </div>
  );
};

export default withRouter(ComponentSelect);
