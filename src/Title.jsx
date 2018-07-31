import React from "react";
import { colors } from "./data";

const Title = ({ game, variation }) => {
  let size = game.info.titleSize || 200;
  let subSize = game.info.subTitleSize || 30;
  let designerSize = game.info.designerSize || 20;

  let mapName = null;
  variation = variation || 0;
  if (Array.isArray(game.map)) {
    mapName = game.map[variation].name;
  }

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
          fontSize={subSize}
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
        fontSize={designerSize}
        alignmentBaseline="hanging"
        textAnchor="start"
        lengthAdjust="spacingAndGlyphs"
        x="0"
        y={size + (game.info.subtitle ? 40 : 0)}
      >
        by {game.info.designer}
        {mapName && ` ⋯ ${mapName}`}
      </text>
    </g>
  );
};

export default Title;
