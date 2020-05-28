import React from "react";

import Circle from "./Circle";
import Hexagon from "./Hexagon";
import Triangle from "./Triangle";
import Diamond from "./Diamond";
import Square from "./Square";

const Shape = (props) => {
  let { type } = props;

  let Component = Circle;

  switch (type) {
    case "hexagon":
      Component = Hexagon;
      break;
    case "triangle":
      Component = Triangle;
      break;
    case "diamond":
      Component = Diamond;
      break;
    case "square":
      Component = Square;
      break;
  }

  return <Component {...props} />;
}

export default Shape;
