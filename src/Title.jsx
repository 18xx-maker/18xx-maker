import React from "react";
import { colors } from "./data";

const Title = ({ game }) => {
  let size = game.info.titleSize || 200;
  return (
    <g
      transform={`translate(${game.info.titleX || 0} ${game.info.titleY ||
        0}) rotate(${game.info.titleRotate || 0})`}
    >
      <text
        fill={colors["black"]}
        fontFamily="Bitter"
        fontWeight="bold"
        fontSize={size}
        alignmentBaseline="hanging"
        textAnchor="start"
        lengthAdjust="spacingAndGlyphs"
        x="0"
        y="0"
      >
        {game.info.title}
      </text>
      {game.info.subtitle && (
        <text
          fill={colors["black"]}
          fontFamily="Bitter"
          fontWeight="bold"
          fontSize="30"
          alignmentBaseline="hanging"
          textAnchor="start"
          lengthAdjust="spacingAndGlyphs"
          x="0"
          y={size}
        >
          {game.info.subtitle}
        </text>
      )}
      <text
        fill={colors["black"]}
        fontFamily="Bitter"
        fontWeight="bold"
        fontSize="20"
        alignmentBaseline="hanging"
        textAnchor="start"
        lengthAdjust="spacingAndGlyphs"
        x="0"
        y={game.info.subtitle ? size + 40 : size}
      >
        by {game.info.designer}
      </text>
    </g>
  );
};

export default Title;
