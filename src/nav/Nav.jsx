import React from "react";
import {NavLink} from "react-router-dom";

import Tiles from "./Tiles";

import ThemeSelect from "./ThemeSelect";
import GameSelect from "./GameSelect";
import ComponentSelect from "./ComponentSelect";

import "./nav.scss";

const Nav = ({match}) => {
  let gameName = match.params.game;

  return (
    <nav>
      <div>
        <h1><NavLink to="/">18xx</NavLink></h1>
        <ThemeSelect/>
        {gameName === "tiles" && <Tiles/>}
        {gameName !== "tiles" && <GameSelect/>}
        {gameName !== "tiles" && <ComponentSelect/>}
      </div>
    </nav>
  );
}

export default Nav;
