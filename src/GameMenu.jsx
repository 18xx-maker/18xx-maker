import React from "react";
import { Link } from "react-router-dom";
import games from "./data/games";
import * as R from "ramda";
import GameNav from "./GameNav";

import "./GameMenu.css";

const GameMenu = ({ match, location }) => {
  let game = match.params.game;

  let gameList = R.map(
    title => (
      <li>
        <Link to={location.pathname.replace(game, title)}>{title}</Link>
      </li>
    ),
    R.sort(R.ascend(R.identity), R.keys(games))
  );

  return (
    <div className="GameMenu">
      <h2>
        <Link to="/">Home</Link>
      </h2>
      <h2>Games</h2>
      <nav>
        <ul>{gameList}</ul>
      </nav>
      <GameNav game={match.params.game} ipo={game.ipo} />
    </div>
  );
};

export default GameMenu;
