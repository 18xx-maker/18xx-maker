import React from "react";

import addIndex from "ramda/src/addIndex";
import map from "ramda/src/map";

import { mapCoord } from "./util";
import Color from "../data/Color";
import Currency from "../util/Currency";

const BorderText = ({ text, data }) => {
  let coord = mapCoord(text.coord, data);
  let color = text.color || "black";
  let fontSize = text.fontSize || 13;
  let fontWeight = text.fontWeight || "normal";
  let fontFamily = text.fontFamily || "display";
  let rotation = text.rotation || 0;

  let bgColor = text.bgColor || "white";
  let borderColor = text.borderColor || "black";
  let borderWidth = text.borderWidth || 2;

  let textNode = text.cost ?
      <Currency value={text.cost} type="border" /> :
      text.label || "";

  return (
    <Color context="companies">
      {c => (
        <g transform={`translate(${coord}) translate(0 1) rotate(${rotation})`}>
          {text.circle && (<circle cx="0" cy="0" r={text.circle}
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
