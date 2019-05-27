import React from "react";
import {NavLink} from "react-router-dom";

const Tiles = () => {
  return (
    <>
      <ul>
        <li><NavLink to="/tiles/yellow">Yellow</NavLink></li>
        <li><NavLink to="/tiles/green">Green</NavLink></li>
        <li><NavLink to="/tiles/brown">Brown</NavLink></li>
        <li><NavLink to="/tiles/gray">Gray</NavLink></li>
        <li><NavLink to="/tiles/atoms">Atom Examples</NavLink></li>
        <li><NavLink to="/tiles/positioning">Positioning Examples</NavLink></li>
      </ul>
    </>
  );
};

export default Tiles;
