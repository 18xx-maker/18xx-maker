import React from "react";
import Games from "./Games";

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
