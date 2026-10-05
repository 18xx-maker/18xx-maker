import ShapeFrame, { shapeScale } from "@/components/atoms/shapes/ShapeFrame";

const Circle = (props) => {
  const r = 25 * shapeScale(props);

  return (
    <ShapeFrame shape={props} fontSize={16}>
      {(paint) => <circle r={r} {...paint} />}
    </ShapeFrame>
  );
};

export default Circle;
