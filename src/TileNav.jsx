import React from "react";
import { NavLink } from "react-router-dom";

const TileNav = () => {
  return (
    <React.Fragment>
      <h2>Tiles</h2>
      <ul>
        <li>
          <NavLink exact to={`/tiles`}>All</NavLink>
        </li>
        <li>
          <NavLink to={`/tiles/atoms`}>Atoms</NavLink>
        </li>
        <li>
          <NavLink to={`/tiles/positioning`}>Positioning</NavLink>
        </li>
      </ul>
    </React.Fragment>
  );
};

export default TileNav;
