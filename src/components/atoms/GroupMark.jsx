import tinycolor from "tinycolor2";

import { find, propEq } from "ramda";

import Color from "@/components/Color";
import Shape from "@/components/atoms/shapes/Shape";

import ColorContext from "@/context/ColorContext";
import { useGame } from "@/hooks";

// A triangle is drawn off center in its box: its middle sits 7.22 above the
// origin, so it moves down to look as centered as the other shapes.
const TRIANGLE_OFFSET = 7.22;

// The mark of the group a company or private belongs to. It draws nothing for
// a company without a group, or with a group the game does not define. Size it
// with CSS: the svg fills the box it is placed in.
const GroupMark = ({ group, className = "group-mark" }) => {
  const game = useGame();
  const def = group ? find(propEq(group, "id"), game.groups || []) : null;

  if (!def) {
    return null;
  }

  const { shape = "circle", color, borderColor, text, textColor } = def;

  return (
    <svg
      className={className}
      viewBox="-30 -30 60 60"
      data-testid={`group-mark-${def.id}`}
    >
      <ColorContext.Provider value="companies">
        <Color>
          {(c) => (
            <g
              transform={
                shape === "triangle"
                  ? `translate(0 ${TRIANGLE_OFFSET})`
                  : undefined
              }
            >
              <Shape
                type={shape}
                color={color}
                borderColor={borderColor}
                text={text}
                textColor={
                  textColor ||
                  (color
                    ? tinycolor(c(color)).isDark()
                      ? "white"
                      : "black"
                    : undefined)
                }
                fontSize={24}
              />
            </g>
          )}
        </Color>
      </ColorContext.Provider>
    </svg>
  );
};

export default GroupMark;
