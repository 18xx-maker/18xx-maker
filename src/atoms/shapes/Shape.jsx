import React from "react";

import Circle from "./Circle";
import Hexagon from "./Hexagon";
import Triangle from "./Triangle";
import Diamond from "./Diamond";
import Square from "./Square";

const mapping = {
  circle: Circle,
  diamond: Diamond,
  hexagon: Hexagon,
  square: Square,
  triangle: Triangle
}

const Shape = (props) => {
  let { type } = props;

  let Component = mapping[type] || Circle;

  return <Component {...props} />;
}

export default Shape;
