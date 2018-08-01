import React from "react";
import { NavLink } from "react-router-dom";
import games from "./data/games";
import * as R from "ramda";
import GameNav from "./GameNav";

import "./GameMenu.css";

const GameMenu = ({ match, location }) => {
  let game = match.params.game;

  let gameList = R.map(
    title => (
      <li key={`game-link-${title}`}>
        <NavLink to={location.pathname.replace(game, title)}>{title}</NavLink>
      </li>
    ),
    R.sort(R.ascend(R.identity), R.keys(games))
  );

  return (
    <div className="GameMenu">
      <h2>
        <NavLink to="/">Home</NavLink>
      </h2>
      <h2>Games</h2>
      <nav>
        <ul>{gameList}</ul>
      </nav>
      <GameNav
        game={match.params.game}
        ipo={game.ipo}
        paginated={!(games[match.params.game].info.paginated === false)}
      />
    </div>
  );
};

export default GameMenu;
