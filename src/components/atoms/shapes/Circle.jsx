import { defaultTo } from "ramda";

import Color from "@/components/Color";
import Text from "@/components/atoms/shapes/Text";
import { useGame } from "@/hooks";
import { getFontProps, multiDefaultTo } from "@/util";

const Circle = (props) => {
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
  let font = getFontProps(
    props,
    16 * scale,
    undefined,
    multiDefaultTo(undefined, fontFamily, game.info.valueFontFamily),
  );

  let strokeDashArray = dashed
    ? `${width / 7.142857143} ${width / 7.142857143}`
    : undefined;
  let r = 25 * scale;

  return (
    <Color>
      {(c) => (
        <g>
          <circle
            r={r}
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
            fontFamily={fontFamily}
            color={textColor}
          />
        </g>
      )}
    </Color>
  );
};

export default Circle;
