import React from "react";
import { withRouter } from "react-router";
import { NavLink } from "react-router-dom";
import games from "./data/games";
import * as R from "ramda";
import GameNav from "./GameNav";
import TileNav from "./TileNav";
import Themes from "./Themes";

import "./GameMenu.css";

const GameMenu = ({ match, location }) => {
  let game = match.params.game;

  let gameList = R.map(title => {
    let to = `/${title}/map`;
    if (game) {
      to = location.pathname.replace(game, title);
    }

    return (
      <li key={`game-link-${title}`}>
        <NavLink to={to}>{title}</NavLink>
      </li>
    );
  }, R.sort(R.ascend(R.identity), R.keys(games)));

  return (
    <div className="GameMenu">
      <h2>
        <NavLink to="/">Home</NavLink>
      </h2>
      <TileNav />
      <Themes />
      <h2>Games</h2>
      <nav>
        <ul>{gameList}</ul>
      </nav>
      {game && (
        <GameNav
          game={game}
          ipo={games[game].ipo}
          minors={games[game].minorCompanies}
          paginated={!(games[match.params.game].info.paginated === false)}
          paginatedMarket={games[match.params.game].stock.paginated}
        />
      )}
    </div>
  );
};

export default withRouter(GameMenu);
