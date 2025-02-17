import { defaultTo } from "ramda";

import Color from "@/components/Color";
import Text from "@/components/atoms/shapes/Text";
import { useGame } from "@/hooks";
import { getFontProps, multiDefaultTo } from "@/util";

const Hexagon = (props) => {
  let {
    text,
    textColor,
    fontFamily,
    color,
    opacity,
    borderColor,
    borderWidth,
    width,
    dashed,
  } = props;
  const game = useGame();

  let scale = defaultTo(50, width) / 50;
  let x = 25 * scale;
  let y = 21.650625 * scale;

  let font = getFontProps(
    props,
    16 * scale,
    undefined,
    multiDefaultTo(undefined, fontFamily, game.info.valueFontFamily),
  );
  let strokeDashArray = dashed
    ? `${width / 7.142857143} ${width / 7.142857143}`
    : undefined;

  return (
    <Color>
      {(c) => (
        <g>
          <path
            d={`M -${x} 0 L -${x / 2} -${y} L ${x / 2} -${y} L ${x} 0 L ${x / 2} ${y} L -${x / 2} ${y} z`}
            fill={defaultTo("none", c(color))}
            fillOpacity={defaultTo(1, opacity)}
            stroke={c(defaultTo("black", borderColor))}
            strokeWidth={defaultTo(2, borderWidth)}
            strokeDasharray={strokeDashArray}
            strokeLinecap="round"
          />
          <Text
            {...font}
            text={text}
            color={textColor}
            fontFamily={fontFamily}
          />
        </g>
      )}
    </Color>
  );
};

export default Hexagon;
