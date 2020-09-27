import React from "react";

import Circle from "./Circle";
import Diamond from "./Diamond";
import Ellipse from "./Ellipse";
import Hexagon from "./Hexagon";
import Square from "./Square";
import Triangle from "./Triangle";
import Star from "./Star";

const mapping = {
  circle: Circle,
  diamond: Diamond,
  ellipse: Ellipse,
  hexagon: Hexagon,
  square: Square,
  triangle: Triangle,
  star: Star
}

const Shape = (props) => {
  let { type } = props;

  let Component = mapping[type] || Circle;

  return <Component {...props} />;
}

export default Shape;
