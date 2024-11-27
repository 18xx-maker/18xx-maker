import Circle from "@/components/atoms/shapes/Circle";
import Diamond from "@/components/atoms/shapes/Diamond";
import Ellipse from "@/components/atoms/shapes/Ellipse";
import Hexagon from "@/components/atoms/shapes/Hexagon";
import Square from "@/components/atoms/shapes/Square";
import Star from "@/components/atoms/shapes/Star";
import Triangle from "@/components/atoms/shapes/Triangle";

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
