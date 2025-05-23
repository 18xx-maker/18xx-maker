import { defaultTo } from "ramda";

import Color from "@/components/Color";
import Text from "@/components/atoms/shapes/Text";
import { useGame } from "@/hooks";
import { getFontProps, multiDefaultTo } from "@/util";

const Star = (props) => {
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
  //let x = 25 * scale;

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
        <g transform={`scale(${scale * 2}) translate(-25 -25)`}>
          <path
            d="m25,1 6,17h18l-14,11 5,17-15-10-15,10 5-17-14-11h18z"
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

export default Star;
