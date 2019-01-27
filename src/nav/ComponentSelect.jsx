import React from "react";
import {withRouter} from "react-router";

import games from "../data/games";
import tiles from "../data/tiles";

import compose from "ramda/es/compose";
import map from "ramda/es/map";
import keys from "ramda/es/keys";
import prop from "ramda/es/prop";
import uniq from "ramda/es/uniq";

const ComponentSelect = ({match,history,location}) => {
  let gameName = match.params.game;
  let game = games[gameName];

  let handleChange = event => {
    history.push(`/${gameName}/${event.target.value}`);
  };

  let selection = location.pathname.split('/')[2];

  let colors = compose(
    uniq,
    map(prop("color")),
    map(id => tiles[id] || tiles[id.split("|")[0]])
  )(keys(game.tiles));

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
        {game.stock.paginated && <option value="market-paginated">Market - Paginated</option>}
        <option value="map">Map</option>
        <option value="map-paginated">Map - Paginated</option>
        <option value="tiles">Tiles</option>
        <option value="manifest">Tile Manifest</option>
        <option value="tokens">Tokens</option>
        {map(color => (
          <option key={color} value={`b18-tiles-${color}`}>Board18 Tiles - {color}</option>
        ), colors)}
      </select>
    </div>
  );
};

export default withRouter(ComponentSelect);
