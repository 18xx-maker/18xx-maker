import React from "react";
import { Link } from "react-router-dom";
import games from "./data/games";
import * as R from "ramda";

const Games = () => {
  return R.map(game => {
    return (
      <div class="game" id={`game-${game}`}>
        <h1>{game}</h1>
        <ul>
          <li>
            <Link to={`/${game}/charters`}>Charters</Link>
          </li>
          <li>
            <Link to={`/${game}/privates`}>Privates</Link>
          </li>
          <li>
            <Link to={`/${game}/shares`}>Shares</Link>
          </li>
          <li>
            <Link to={`/${game}/tiles`}>Tiles</Link>
          </li>
          <li>
            <Link to={`/${game}/tokens`}>Tokens</Link>
          </li>
          <li>
            <Link to={`/${game}/trains`}>Trains</Link>
          </li>
        </ul>
      </div>
  );
  }, R.keys(games));
};

export default Games;
