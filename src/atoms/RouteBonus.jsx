import { useGame } from "../hooks";
import { multiDefaultTo } from "../util";
import Color from "../util/Color";

const RouteBonus = ({
  value,
  size,
  fontFamily,
  fillColor,
  strokeColor,
  strokeWidth,
  textColor,
}) => {
  const game = useGame();
  fontFamily = multiDefaultTo(
    "sans-serif",
    fontFamily,
    game.info.valueFontFamily,
  );
  size = multiDefaultTo(14, size, game.info.valueFontSize);
  let width = ((size * 5.0) / 14.0) * value.length;
  let height = size + 6;
  fillColor = fillColor || "white";
  strokeColor = strokeColor || "black";
  textColor = textColor || "black";
  strokeWidth = strokeWidth || 1;

  return (
    <Color>
      {(c) => (
        <g>
          <polygon
            points={`${-width - 10},0 ${-width},${height * 0.5} ${width},${height * 0.5} ${width + 10},0 ${width},${height * -0.5} ${-width},${height * -0.5}`}
            fill={c(fillColor)}
            stroke={c(strokeColor)}
            strokeWidth={strokeWidth}
          />
          <text
            fontWeight="bold"
            fontSize={size}
            fontFamily={fontFamily}
            fill={c(textColor)}
            dominantBaseline="central"
            textAnchor="middle"
            x="0"
            y="0"
          >
            {value}
          </text>
        </g>
      )}
    </Color>
  );
};

export default RouteBonus;
