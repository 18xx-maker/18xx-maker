import React from "react";
import Games from "./Games";
import { Link } from "react-router-dom";

import TileNav from "./TileNav";

const Home = () => {
  return (
    <div className="home">
      <div className="tiles">
        <TileNav />
      </div>
      <Games />
    </div>
  );
};

export default Home;
