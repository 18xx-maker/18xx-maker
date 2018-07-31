import React from "react";
import { NavLink } from "react-router-dom";

import TileNav from "./TileNav";

import "./GameMenu.css";

const TilesMenu = () => {
  return (
    <div className="GameMenu">
      <h2>
        <NavLink to="/">Home</NavLink>
      </h2>
      <TileNav />
    </div>
  );
};

export default TilesMenu;
