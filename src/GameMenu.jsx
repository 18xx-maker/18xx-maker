import React from "react";
import { Link } from "react-router-dom";
import games from "./data/games";
import * as R from "ramda";

import "./GameMenu.css";

const GameMenu = ({ match, location }) => {
  let game = match.params.game;

  let gameList = R.map(
    title => (
      <li>
        <Link to={location.pathname.replace(game, title)}>{title}</Link>
      </li>
    ),
    R.keys(games)
  );

  return (
    <div className="GameMenu">
      <h1>Games</h1>
      <nav>
        <ul>{gameList}</ul>
      </nav>
      <h1>{game}</h1>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="background">Background</Link>
          </li>
          <li>
            <Link to="charters">Charters</Link>
          </li>
          {game.ipo && (
            <li>
              <Link to="ipo">IPO</Link>
            </li>
          )}
          <li>
            <Link to="map">Map</Link>&nbsp;/&nbsp;
            <Link to="map-paginated">Paginated</Link>
          </li>
          <li>
            <Link to="privates">Privates</Link>
          </li>
          <li>
            <Link to="revenue">Revenue</Link>
          </li>
          <li>
            <Link to="shares">Shares</Link>
          </li>
          <li>
            <Link to="stock">Stock Market</Link>
          </li>
          <li>
            <Link to="tiles">Tiles</Link>
          </li>
          <li>
            <Link to="tokens">Tokens</Link>
          </li>
          <li>
            <Link to="trains">Trains</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default GameMenu;
