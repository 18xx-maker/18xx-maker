import { createElement as h, useMemo } from "react";

import Borders from "@/components/map/Borders";

import { useGame } from "@/hooks";
import { getMapData } from "@/util/map";

// The pieces are drawn from the map data of the loaded game, with the borders
// of that data replaced by the control
const MapBorders = ({ borders, coords, hexWidth }) => {
  const game = useGame();
  const data = useMemo(
    () => ({ ...getMapData(game, coords, hexWidth, 0), borders }),
    [game, borders, coords, hexWidth],
  );

  return h(Borders, { data });
};

export default {
  title: "Map/Borders",
  component: Borders,
  render: (args) => h(MapBorders, args),
  parameters: {
    layout: "centered",
    game: "18Test",
    svg: { width: 1000, height: 260, viewBox: "0 0 1400 360" },
  },
  args: {
    borders: [
      { color: "white", coords: ["B16p4", "B16p5"], width: 6 },
      {
        color: "red",
        coords: ["A13p1", "A13p2", "A13p3"],
        width: 8,
        dashed: true,
      },
    ],
    coords: "edge",
    hexWidth: 150,
  },
  argTypes: {
    borders: { control: { type: "object" } },
    coords: {
      control: { type: "select" },
      options: ["edge", "outside", "inside"],
    },
    hexWidth: { control: { type: "range", min: 100, max: 150, step: 10 } },
  },
};

export const Standard = {};

export const Empty = { args: { borders: [] } };
