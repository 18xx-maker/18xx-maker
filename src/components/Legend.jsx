import Color from "@/components/Color";
import { multiDefaultTo } from "@/util";

const Legend = ({
  color,
  borderColor,
  borderWidth,
  description,
  right,
  bottom,
  fontFamily,
  fontSize,
  fontWeight,
}) => {
  fontFamily = multiDefaultTo("sans-serif", fontFamily);
  fontSize = multiDefaultTo("14", fontSize);
  fontWeight = multiDefaultTo("normal", fontWeight);
  return (
    <Color>
      {(c) => (
        <g>
          <circle
            r="12"
            cx={right ? -20 : 20}
            cy={bottom ? -20 : 20}
            stroke={c(borderColor || "black")}
            strokeWidth={borderWidth || 2}
            fill={c(color || "orange")}
          />
          <text
            fontFamily={fontFamily}
            fontSize={fontSize}
            fontWeight={fontWeight}
            textAnchor={right ? "end" : "start"}
            dominantBaseline="middle"
            fill="black"
            stroke="black"
            x={right ? -39 : 39}
            y={bottom ? -20 : 20}
          >
            {description}
          </text>
        </g>
      )}
    </Color>
  );
};

export default Legend;
