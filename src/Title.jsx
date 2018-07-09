import React from "react";
import { colors } from "./data";

const Title = ({ game }) => {
  return (
    <g transform={`translate(${game.info.titleX || 0} ${game.info.titleY || 0})`}>
      <text
        fill={colors["black"]}
        fontFamily="Bitter"
        fontWeight="bold"
        fontSize="200"
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
          y="200"
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
        y={game.info.subtitle ? 240 : 200}
      >
        by {game.info.designer}
      </text>
    </g>
  );
};

export default Title;
