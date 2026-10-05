import { defaultTo } from "ramda";

import ShapeFrame, { shapeScale } from "@/components/atoms/shapes/ShapeFrame";

const Ellipse = (props) => {
  const rx = 25 * shapeScale(props);
  const ry = 25 * (defaultTo(50, props.height) / 50);

  return (
    <ShapeFrame shape={props} fontSize={16}>
      {(paint) => <ellipse rx={rx} ry={ry} {...paint} />}
    </ShapeFrame>
  );
};

export default Ellipse;
