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
    case "triangle":
      return <Triangle {...props} />;
    case "diamond":
      return <Diamond {...props} />;
    case "square":
      return <Square {...props} />;
    default:
      return <Circle {...props} />;
  }
}

export default Shape;
