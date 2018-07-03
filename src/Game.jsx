import React from "react";
import { Link } from "react-router-dom";

const Game = ({ match }) => {
  let game = match.params.game;

  return (
    <div id={`game-${game}`}>
      <h1>{game}</h1>
      <nav>
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
            <Link to={`/${game}/stock`}>Stock</Link>
          </li>
          <li>
            <Link to={`/${game}/tokens`}>Tokens</Link>
          </li>
          <li>
            <Link to={`/${game}/trains`}>Trains</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Game;
