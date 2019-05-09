import React from "react";
import {NavLink} from "react-router-dom";

const Tiles = () => {
  return (
    <div className="PrintNotes">
      <div>
        <ul>
          <li><NavLink exact to="/tiles">All Tiles</NavLink></li>
          <li><NavLink to="/tiles/atoms">Atom Examples</NavLink></li>
          <li><NavLink to="/tiles/positioning">Positioning Examples</NavLink></li>
        </ul>
      </div>
    </div>
  );
};

export default Tiles;
