import ShapeFrame, { shapeScale } from "@/components/atoms/shapes/ShapeFrame";

const Hexagon = (props) => {
  const scale = shapeScale(props);
  const x = 25 * scale;
  const y = 21.650625 * scale;

  return (
    <ShapeFrame shape={props} fontSize={16}>
      {(paint) => (
        <path
          d={`M -${x} 0 L -${x / 2} -${y} L ${x / 2} -${y} L ${x} 0 L ${x / 2} ${y} L -${x / 2} ${y} z`}
          {...paint}
        />
      )}
    </ShapeFrame>
  );
};

export default Hexagon;
