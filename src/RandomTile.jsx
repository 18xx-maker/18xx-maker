import React, { useState, useEffect } from "react";
import {withRouter} from "react-router";

import Svg from "./Svg";
import Tile from "./Tile";

import keys from "ramda/src/keys";

const randomTile = () => keys(tiles)[Math.floor(Math.random() * keys(tiles).length)];

const RandomTile = ({ history }) => {
  let [tile, setTile] = useState(randomTile());
  let tiles = require("../src/data/tiles/").default;

  // Handle listening to router updates
  useEffect(() => {
    return history.listen(() => setTile(randomTile()));
  });

  return (
    <Svg viewBox={`-86.6025 -75 173.205 150`}>
      <Tile id={tile} />
    </Svg>
  );
};

export default withRouter(RandomTile);
