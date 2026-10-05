import ShapeFrame, { shapeScale } from "@/components/atoms/shapes/ShapeFrame";

const Square = (props) => {
  const x = 50 * shapeScale(props);

  return (
    <ShapeFrame shape={props} fontSize={16}>
      {(paint) => (
        <rect x={-x / 2} y={-x / 2} width={x} height={x} {...paint} />
      )}
    </ShapeFrame>
  );
};

export default Square;
