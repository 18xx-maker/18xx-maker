import React from "react";

import Circle from "./Circle";
import Hexagon from "./Hexagon";
import Triangle from "./Triangle";
import Diamond from "./Diamond";
import Square from "./Square";

const Shape = (props) => {
  let { type } = props;

  switch (type) {
    case "hexagon":
      return <Hexagon {...props} />;
      break;
    case "triangle":
      return <Triangle {...props} />;
      break;
    case "diamond":
      return <Diamond {...props} />;
      break;
    case "square":
      return <Square {...props} />;
      break;
    default:
      return <Circle {...props} />;
      break;
  }
}

export default Shape;
