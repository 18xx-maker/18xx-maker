import React from "react";
import {NavLink} from "react-router-dom";

const Tiles = () => {
  return (
    <>
      <ul>
        <li><NavLink to="/tiles">Tiles</NavLink></li>
        <li><NavLink to="/tiles/atoms">Atom Examples</NavLink></li>
        <li><NavLink to="/tiles/positioning">Positioning Examples</NavLink></li>
      </ul>
    </>
  );
};

export default Tiles;
