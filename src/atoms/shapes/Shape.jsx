import Circle from "@/atoms/shapes/Circle";
import Diamond from "@/atoms/shapes/Diamond";
import Ellipse from "@/atoms/shapes/Ellipse";
import Hexagon from "@/atoms/shapes/Hexagon";
import Square from "@/atoms/shapes/Square";
import Star from "@/atoms/shapes/Star";
import Triangle from "@/atoms/shapes/Triangle";

const mapping = {
  circle: Circle,
  diamond: Diamond,
  ellipse: Ellipse,
  hexagon: Hexagon,
  square: Square,
  triangle: Triangle,
  star: Star,
};

const Shape = (props) => {
  let { type } = props;

  let Component = mapping[type] || Circle;

  return <Component {...props} />;
};

export default Shape;
