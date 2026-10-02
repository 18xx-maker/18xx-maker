import { createElement as h, useMemo } from "react";

import Lines from "@/components/map/Lines";

import { useGame } from "@/hooks";
import { getMapData } from "@/util/map";

// The pieces are drawn from the map data of the loaded game, with the lines
// of that data replaced by the control
const MapLines = ({ lines, coords, hexWidth }) => {
  const game = useGame();
  const data = useMemo(
    () => ({ ...getMapData(game, coords, hexWidth, 0), lines }),
    [game, lines, coords, hexWidth],
  );

  return h(Lines, { data });
};

export default {
  title: "Map/Lines",
  component: Lines,
  render: (args) => h(MapLines, args),
  parameters: {
    layout: "centered",
    game: "18Test",
    svg: { width: 1000, height: 260, viewBox: "0 0 1400 360" },
  },
  args: {
    lines: [
      { color: "mountain", coords: ["A15p1", "A15p4"], width: 8 },
      {
        color: "water",
        coords: ["A13p1", "A13p5", "B14p2"],
        width: 6,
        dashed: true,
      },
    ],
    coords: "edge",
    hexWidth: 150,
  },
  argTypes: {
    lines: { control: { type: "object" } },
    coords: {
      control: { type: "select" },
      options: ["edge", "outside", "inside"],
    },
    hexWidth: { control: { type: "range", min: 100, max: 150, step: 10 } },
  },
};

export const Standard = {};

export const Empty = { args: { lines: [] } };
