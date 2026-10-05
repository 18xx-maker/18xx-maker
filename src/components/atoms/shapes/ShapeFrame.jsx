import { defaultTo } from "ramda";

import Color from "@/components/Color";
import Text from "@/components/atoms/shapes/Text";

import { useGame } from "@/hooks";
import { getFontProps, multiDefaultTo } from "@/util";

// The scale of a shape, relative to its default width of 50
export const shapeScale = ({ width }) => defaultTo(50, width) / 50;

// Everything the shapes share: the colors, the stroke, the dashes and the
// text on top. `children` gets the paint attributes and draws the outline.
const ShapeFrame = ({
  shape,
  fontSize,
  groupProps,
  passFontFamily = true,
  children,
}) => {
  const {
    text,
    textColor,
    fontFamily,
    color,
    opacity,
    borderColor,
    borderWidth,
    width,
    dashed,
  } = shape;
  const game = useGame();

  const font = getFontProps(
    shape,
    fontSize * shapeScale(shape),
    undefined,
    multiDefaultTo(undefined, fontFamily, game.info.valueFontFamily),
  );
  const strokeDasharray = dashed
    ? `${width / 7.142857143} ${width / 7.142857143}`
    : undefined;

  return (
    <Color>
      {(c) => (
        <g {...groupProps}>
          {children({
            fill: defaultTo("none", c(color)),
            fillOpacity: defaultTo(1, opacity),
            stroke: c(defaultTo("black", borderColor)),
            strokeWidth: defaultTo(2, borderWidth),
            strokeDasharray,
            strokeLinecap: "round",
          })}
          <Text
            {...font}
            text={text}
            color={textColor}
            {...(passFontFamily ? { fontFamily } : {})}
          />
        </g>
      )}
    </Color>
  );
};

export default ShapeFrame;
