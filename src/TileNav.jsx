import React from "react";
import { Link } from "react-router-dom";

const TileNav = () => {
  return (
    <React.Fragment>
      <h2>Tiles</h2>
      <ul>
        <li>
          <Link to={`/tiles`}>All</Link>
        </li>
        <li>
          <Link to={`/tiles/atoms`}>Atoms</Link>
        </li>
        <li>
          <Link to={`/tiles/positioning`}>Positioning</Link>
        </li>
      </ul>
    </React.Fragment>
  );
};

export default TileNav;
