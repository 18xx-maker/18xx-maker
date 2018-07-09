import React from "react";
import Games from "./Games";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home">
      <div className="tiles">
        <h1>Tiles</h1>
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
      </div>
      <Games />
    </div>
  );
};

export default Home;
