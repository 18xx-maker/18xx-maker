import React from "react";
import { Link } from "react-router-dom";

import TileNav from "./TileNav";

import "./GameMenu.css";

const TilesMenu = ({ match }) => {
  let game = match.params.game;

  return (
    <div className="GameMenu">
      <h2>
        <Link to="/">Home</Link>
      </h2>
      <TileNav />
    </div>
  );
};

export default TilesMenu;
