import tinycolor from "tinycolor2";

import { find, propEq } from "ramda";

import Color from "@/components/Color";
import Shape from "@/components/atoms/shapes/Shape";

import ColorContext from "@/context/ColorContext";
import { useGame } from "@/hooks";

// A triangle is drawn off center in its box: its middle sits 7.22 above the
// origin, so it moves down to look as centered as the other shapes.
const TRIANGLE_OFFSET = 7.22;

// The group of the game with this id, if there is one
export const useGroup = (id) => {
  const game = useGame();
  return id ? find(propEq(id, "id"), game.groups || []) : undefined;
};

// The mark of the group a company or private belongs to. It draws nothing for
// a company without a group, or with a group the game does not define. Size it
// with CSS: the svg fills the box it is placed in.
const GroupMark = ({ group, className = "group-mark", style }) => {
  const def = useGroup(group);

  if (!def) {
    return null;
  }

  const { shape = "circle", color, borderColor, text, textColor } = def;

  return (
    <svg
      className={className}
      style={style}
      viewBox="-30 -30 60 60"
      data-testid={`group-mark-${def.id}`}
    >
      <ColorContext.Provider value="companies">
        <Color>
          {(c, t) => (
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
                height={shape === "ellipse" ? 34 : undefined}
                text={text}
                textColor={
                  textColor ||
                  (color
                    ? tinycolor(t(c(color))).isLight()
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
