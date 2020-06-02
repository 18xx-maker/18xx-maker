import React, { useContext } from "react";
import ConfigContext from "../context/ConfigContext";
import Color from "../data/Color";

const Title = ({ game, variation, hexWidth }) => {
  const { config } = useContext(ConfigContext);
  hexWidth = hexWidth || config.tiles.width;

  let scale = hexWidth / 150.0;

  let titleFont = game.info.titleFontFamily || "display";
  let titleWeight = game.info.titleFontWeight || "bold";
  let titleSize = (game.info.titleSize || 200) * scale;

  let subtitleFont = game.info.subtitleFontFamily || game.info.titleFontFamily || "display";
  let subtitleWeight = game.info.subtitleFontWeight || game.info.titleFontWeight || "bold";
  let subtitleSize = (game.info.subtitleSize || 30) * scale;

  let designerFont = game.info.designerFontFamily || game.info.titleFontFamily || "display";
  let designerWeight = game.info.designerFontWeight || game.info.titleFontWeight || "bold";
  let designerSize = (game.info.designerSize || 20) * scale;

  let mapName = null;
  variation = variation || 0;
  if (variation !== 0 && Array.isArray(game.map)) {
    mapName = game.map[variation].name;
  }

  let x = (game.info.titleX || 0) * scale + 50;
  let y = ((game.info.titleY || 0) + 170) * scale + 50;
  let rotate = (game.info.titleRotate || 0);

  return (
    <Color>
      {c => (
        <g
          transform={`translate(${x} ${y}) rotate(${rotate})`}
        >
          <text
            fill={c("black")}
            fontFamily={titleFont}
            fontWeight={titleWeight}
            fontSize={titleSize}
            textAnchor="start"
            lengthAdjust="spacingAndGlyphs"
            x="0"
            y="0"
          >
            {game.info.title}
          </text>
          {game.info.subtitle && (
            <text
              fill={c("black")}
              fontFamily={subtitleFont}
              fontWeight={subtitleWeight}
              fontSize={subtitleSize}
              textAnchor="start"
              lengthAdjust="spacingAndGlyphs"
              x="0"
              y={subtitleSize + 10}
            >
              {game.info.subtitle}
            </text>
          )}
          <text
            fill={c("black")}
            fontFamily={designerFont}
            fontWeight={designerWeight}
            fontSize={designerSize}
            textAnchor="start"
            lengthAdjust="spacingAndGlyphs"
            x="0"
            y={designerSize + 10 + (game.info.subtitle ? (subtitleSize + 10) : 0)}
          >
            by {game.info.designer}
            {mapName && ` ⋯ ${mapName}`}
          </text>
        </g>
      )}
    </Color>
  );
};

export default Title;
