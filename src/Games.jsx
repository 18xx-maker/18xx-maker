import React from "react";
import { Link } from "react-router-dom";
import games from "./data/games";
import * as R from "ramda";

const Games = () => {
  let gameNodes = R.map(game => {
    return (
      <div className="game" key={`game-${game}`} id={`game-${game}`}>
        <h2>{game}</h2>
        <ul>
          <li>
            <Link to={`/${game}/background`}>Background</Link>
          </li>
          <li>
            <Link to={`/${game}/charters`}>Charters</Link>
          </li>
          {games[game].ipo && (
            <li>
              <Link to={`/${game}/ipo`}>IPO</Link>
            </li>
          )}
          <li>
            <Link to={`/${game}/map`}>Map</Link>&nbsp;/&nbsp;
            <Link to={`/${game}/map-paginated`}>Paginated</Link>
          </li>
          <li>
            <Link to={`/${game}/privates`}>Privates</Link>
          </li>
          <li>
            <Link to={`/${game}/revenue`}>Revenue</Link>
          </li>
          <li>
            <Link to={`/${game}/shares`}>Shares</Link>
          </li>
          <li>
            <Link to={`/${game}/stock`}>Stock</Link>
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

  return (
    <div className="games">
      <h1>Games</h1>
      {gameNodes}
    </div>
  );
};

export default Games;
