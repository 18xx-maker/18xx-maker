import React from "react";
import { useParams } from "react-router-dom";

import Svg from "../Svg";
import Tile from "../Tile";

const TilePage = () => {
  let params = useParams();
  let id = params.id;

  return (
    <Svg key={id}
         width="200"
         height="200"
         viewBox="-100 -100 200 200"
         transform="rotate(-90)">
      <Tile id={id} width={150} x={0} y={0} />
    </Svg>
  )
};

export default TilePage;
