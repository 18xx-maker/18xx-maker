import React from "react";
import { NavLink } from "react-router-dom";
import games from "./data/games";

const GameNav = ({ game, ipo, paginated }) => {
  return (
    <React.Fragment>
      <h2>{game}</h2>
      <ul>
        <li>
          <NavLink to={`/${game}/background`}>Background</NavLink>
        </li>
        <li>
          <NavLink to={`/${game}/cards`}>Cards</NavLink>
        </li>
        <li>
          <NavLink to={`/${game}/charters`}>Charters</NavLink>
        </li>
        {ipo && (
          <li>
            <NavLink to={`/${game}/ipo`}>IPO</NavLink>
          </li>
        )}
        <li>
          <NavLink to={`/${game}/map`}>Map</NavLink>
          {paginated && (
            <React.Fragment>
              &nbsp;/&nbsp;
              <NavLink to={`/${game}/map-paginated`}>Paginated</NavLink>
            </React.Fragment>
          )}
        </li>
        <li>
          <NavLink to={`/${game}/revenue`}>Revenue</NavLink>
        </li>
        <li>
          <NavLink to={`/${game}/stock`}>Stock Market</NavLink>
        </li>
        <li>
          <NavLink to={`/${game}/tiles`}>Tiles</NavLink>&nbsp;/&nbsp;
          <NavLink to={`/${game}/manifest`}>Manifest</NavLink>
        </li>
        <li>
          <NavLink to={`/${game}/tokens`}>Tokens</NavLink>
        </li>
      </ul>
    </React.Fragment>
  );
};

export default GameNav;
