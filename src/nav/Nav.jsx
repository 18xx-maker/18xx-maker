import React from "react";
import {Link, NavLink} from "react-router-dom";

import Tiles from "./Tiles";

import RandomTile from "../RandomTile";

import ThemeSelect from "./ThemeSelect";
import GameSelect from "./GameSelect";
import ComponentSelect from "./ComponentSelect";

import "./nav.scss";

let Links = (
  <ul key="config">
    <li><NavLink to="/docs">Docs</NavLink></li>
    <li><NavLink to="/config">Config</NavLink></li>
  </ul>
);

const Nav = ({match}) => {
  let gameName = match.params.game;

  let menuOptions = [<ThemeSelect key="theme"/>];
  switch(gameName) {
  case "tiles":
    menuOptions.push(<Tiles key="tiles"/>);
    break;
  case "logos":
    break;
  case "config":
    break;
  case "docs":
    break;
  default:
    menuOptions.push(<GameSelect key="game"/>);
    menuOptions.push(<ComponentSelect key="component"/>);
  }
  menuOptions.push(Links);

  return (
    <React.Fragment>
      <nav>
        <div>
          <RandomTile/>
          <h1><Link to="/">18xx</Link></h1>
          {menuOptions}
        </div>
      </nav>
      <div className="LegalNotes">
        <div>
          <p>
            <strong>Important:</strong> Please only use this site to print games for which you have a license by owning the game.
          </p>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Nav;
