import React from "react";

import Hex from "./Hex";

const Svg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <defs>
      <style>
        @import url('https://fonts.googleapis.com/css?family=Limelight');
      </style>
    </defs>

    <Hex width={150} x={100} y={100} />
  </svg>
);

export default Svg;
