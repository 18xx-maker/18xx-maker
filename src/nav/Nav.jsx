import React from "react";
import {Link, NavLink} from "react-router-dom";

import RandomTile from "../RandomTile";

import GameSelect from "./GameSelect";
import ComponentSelect from "./ComponentSelect";

import "./nav.scss";

let Links = (
  <ul key="config">
    <li><NavLink to="/docs">Docs</NavLink></li>
    <li><NavLink to="/config">Config</NavLink></li>
  </ul>
);

const Nav = () => {
  let menuOptions = [<GameSelect key="game"/>,
                     <ComponentSelect key="component"/>,
                     Links];

  return (
    <React.Fragment>
      <nav>
        <div>
          <RandomTile/>
          <h1><Link to="/">18xx Maker</Link></h1>
          {menuOptions}
        </div>
      </nav>
      <div className="LegalNotes">
        <div>
          <p>
            <strong>Important:</strong> Please do not use this site to print games that you don't have a license to print. This tool is not meant to enable piracy. Please support our 18xx designers, developers and publishers.
          </p>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Nav;
