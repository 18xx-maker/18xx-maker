import ShapeFrame, { shapeScale } from "@/components/atoms/shapes/ShapeFrame";

const Diamond = (props) => {
  const x = 25 * shapeScale(props);

  return (
    <ShapeFrame shape={props} fontSize={14} passFontFamily={false}>
      {(paint) => (
        <path d={`M -${x} 0 L 0 -${x} L ${x} 0 L 0 ${x} z`} {...paint} />
      )}
    </ShapeFrame>
  );
};

export default Diamond;
