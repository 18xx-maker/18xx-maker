import ShapeFrame, { shapeScale } from "@/components/atoms/shapes/ShapeFrame";

const Star = (props) => {
  const scale = shapeScale(props);

  return (
    <ShapeFrame
      shape={props}
      fontSize={14}
      groupProps={{ transform: `scale(${scale * 2}) translate(-25 -25)` }}
    >
      {(paint) => (
        <path
          d="m25,1 6,17h18l-14,11 5,17-15-10-15,10 5-17-14-11h18z"
          {...paint}
        />
      )}
    </ShapeFrame>
  );
};

export default Star;
