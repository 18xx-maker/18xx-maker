import { defaultTo } from "ramda";

import Text from "@/atoms/shapes/Text";
import Color from "@/components/Color";
import { useGame } from "@/hooks";
import { getFontProps, multiDefaultTo } from "@/util";

const Diamond = (props) => {
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

  let font = getFontProps(
    props,
    14 * scale,
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
            d={`M -${x} 0 L 0 -${x} L ${x} 0 L 0 ${x} z`}
            fill={defaultTo("none", c(color))}
            fillOpacity={defaultTo(1, opacity)}
            stroke={c(defaultTo("black", borderColor))}
            strokeWidth={defaultTo(2, borderWidth)}
            strokeDasharray={strokeDashArray}
            strokeLinecap="round"
          />
          <Text {...font} text={text} color={textColor} />
        </g>
      )}
    </Color>
  );
};

export default Diamond;
