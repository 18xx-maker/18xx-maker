import { useContext } from "react";
import { defaultTo } from "ramda";

import GameContext from "../context/GameContext";
import Color from "../util/Color";

import { getFontProps, multiDefaultTo } from "../util";

const Name = (props) => {
  const { game } = useContext(GameContext);
  let {
    name,
    fontSize,
    fontWeight,
    fontFamily,
    strokeColor,
    strokeWidth,
    color,
    bgColor,
    path,
    doRotation,
    rotation,
    reverse,
    offset,
    x,
    y,
    textLength,
  } = props;

  let font = getFontProps(
    props,
    multiDefaultTo(11, fontSize, game.info.nameFontSize),
    multiDefaultTo("bold", fontWeight, game.info.nameFontWeight),
    multiDefaultTo("sans-serif", fontFamily, game.info.nameFontFamily),
  );

  let nameNode;

  if (path) {
    let id = crypto.randomUUID();
    nameNode = (
      <>
        <defs>
          <path id={id} d={path} />
        </defs>
        <textPath
          startOffset={`${defaultTo(50, offset)}%`}
          href={`#${id}`}
          xlinkHref={`#${id}`}
        >
          {name}
        </textPath>
      </>
    );
  } else {
    nameNode = name;
  }

  y = defaultTo(0, y);

  if (!path && reverse) {
    y += 0.75 * font.fontSize;
  }

  return (
    <Color>
      {(c, t, s, p) => (
        <text
          dy={y}
          dx={x}
          transform={`rotate(${((doRotation && rotation) || 0) + 360})`}
          fill={color ? p(color) : bgColor ? t(c(bgColor)) : p("black")}
          strokeWidth={defaultTo(0, strokeWidth)}
          stroke={c(defaultTo("black", strokeColor))}
          {...font}
          textLength={textLength}
          textAnchor="middle"
        >
          {nameNode}
        </text>
      )}
    </Color>
  );
};

export default Name;
