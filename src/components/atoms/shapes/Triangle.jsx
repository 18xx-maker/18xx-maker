import ShapeFrame, { shapeScale } from "@/components/atoms/shapes/ShapeFrame";

const Triangle = (props) => {
  const { reverse } = props;
  const scale = shapeScale(props);
  const x = 25 * scale;
  const y1 = 14.43375673 * scale * (reverse ? -1 : 1);
  const y2 = -28.86751346 * scale * (reverse ? -1 : 1);

  // These values are for a triangle inscribed IN a circle of r = width
  // let x = 21.6506351 * scale;
  // let y1 = 12.5 * scale * (reverse ? -1 : 1);
  // let y2 = -25 * scale * (reverse ? -1 : 1);

  return (
    <ShapeFrame shape={props} fontSize={16}>
      {(paint) => (
        <path d={`M -${x} ${y1} L 0 ${y2} L ${x} ${y1} z`} {...paint} />
      )}
    </ShapeFrame>
  );
};

export default Triangle;
