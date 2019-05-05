import React from "react";
import {Link} from "react-router-dom";

import Tiles from "./Tiles";

import RandomTile from "../RandomTile";

import ThemeSelect from "./ThemeSelect";
import GameSelect from "./GameSelect";
import ComponentSelect from "./ComponentSelect";

import "./nav.scss";

const Nav = ({match}) => {
  let gameName = match.params.game;

  let menuOptions = null;
  if (gameName === "tiles") {
    menuOptions = <Tiles/>;
  } else if (gameName !== "logos") {
    menuOptions = (
      <>
        <GameSelect/>
        <ComponentSelect/>
      </>
    );
  }

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
