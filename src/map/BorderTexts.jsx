import React, { useContext } from "react";
import GameContext from "../context/GameContext";

import addIndex from "ramda/src/addIndex";
import map from "ramda/src/map";

import { mapCoord } from "./util";
import { multiDefaultTo } from "../util";
import Color from "../util/Color";
import Currency from "../util/Currency";

const BorderText = ({ text, data }) => {
  const { game } = useContext(GameContext);

  let coord = mapCoord(text.coord, data);
  let color = text.color || "black";
  let fontSize = multiDefaultTo(13, game.info.valueFontSize, text.fontSize) * data.scale;
  let fontWeight = multiDefaultTo("normal", game.info.valueFontWeight, text.fontWeight);
  let fontFamily = multiDefaultTo("display", game.info.valueFontFamily, text.fontFamily);
  let rotation = text.rotation || 0;

  let bgColor = text.bgColor || "white";
  let borderColor = text.borderColor || "black";
  let borderWidth = (text.borderWidth || 2) * data.scale;
  let circleRadius = text.circle * data.scale;

  let textNode = text.cost ?
      <Currency value={text.cost} type="border" /> :
      text.label || "";

  return (
    <Color context="companies">
      {c => (
        <g transform={`translate(${coord}) translate(0 1) rotate(${rotation})`}>
          {text.circle && (<circle cx="0" cy="0" r={circleRadius}
                                  fill={c(bgColor)}
                                  stroke={c(borderColor)}
                                  strokeWidth={borderWidth}/>)}
          <text
            fill={c(color)}
            fontSize={fontSize}
            fontWeight={fontWeight}
            fontFamily={fontFamily}
            dominantBaseline="middle"
            textAnchor="middle">
            {textNode}
          </text>
        </g>
      )}
    </Color>
  );
}

const BorderTexts = ({ data }) => {
  let texts = addIndex(map)((t, i) => <BorderText key={`border-text-${i}`} text={t} data={data}/>, data.borderTexts || []);
  return texts;
}

export default BorderTexts;
