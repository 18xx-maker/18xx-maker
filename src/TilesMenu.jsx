import React from "react";
import { Link } from "react-router-dom";

import "./GameMenu.css";

const TilesMenu = ({ match }) => {
  let game = match.params.game;

  return (
    <div className="GameMenu">
      <h1>Tiles</h1>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/tiles">All</Link>
          </li>
          <li>
            <Link to="/tiles/atoms">Atoms</Link>
          </li>
          <li>
            <Link to="/tiles/positioning">Positioning</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default TilesMenu;
