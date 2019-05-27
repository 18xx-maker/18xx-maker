import React from "react";
import {Link, NavLink} from "react-router-dom";

import RandomTile from "../RandomTile";

import GameSelect from "./GameSelect";
import ComponentSelect from "./ComponentSelect";

import "./nav.scss";

let Links = (
  <ul key="config">
    <li><NavLink to="/tiles">Tiles</NavLink></li>
    <li><NavLink to="/docs">Docs</NavLink></li>
    <li><NavLink to="/cheat">Cheat Sheet</NavLink></li>
    <li><NavLink to="/config">Config</NavLink></li>
  </ul>
);

const Nav = ({match}) => {
  let menuOptions = [<GameSelect key="game"/>,
                     <ComponentSelect key="component"/>,
                     Links];

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
