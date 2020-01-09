import React from "react";

import Svg from "./Svg";
import Tile from "./Tile";

const SingleTile = () => {
  let params = useParams();
  let id = params.id;
  return (
    <Svg width="3072" height="3072" viewBox="-100 -100 200 200">
      <Tile id={id} width="150" x="0" y="0" />
    </Svg>
  );
};

export default SingleTile;
