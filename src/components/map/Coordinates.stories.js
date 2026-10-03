import { createElement as h, useMemo } from "react";

import Coordinates from "@/components/map/Coordinates";

import { useGame } from "@/hooks";
import { getMapData } from "@/util/map";

// Coordinates need the sizes of a map, so they come from the loaded game
const MapCoordinates = ({ coords, hexWidth, mapCoordinates }) => {
  const game = useGame();
  const data = useMemo(
    () =>
      getMapData(
        { ...game, info: { ...game.info, mapCoordinates } },
        coords,
        hexWidth,
        0,
      ),
    [game, coords, hexWidth, mapCoordinates],
  );

  return h(Coordinates, data);
};

export default {
  title: "Map/Coordinates",
  component: Coordinates,
  render: (args) => h(MapCoordinates, args),
  parameters: {
    layout: "centered",
    game: "18Test",
    svg: { width: 1000, height: 260, viewBox: "0 0 1400 360" },
  },
  args: {
    coords: "edge",
    hexWidth: 150,
    mapCoordinates: "numbersVertical",
  },
  argTypes: {
    coords: {
      control: { type: "select" },
      options: ["edge", "outside", "inside"],
      description: "inside draws nothing here, the ids are on the hexes",
    },
    hexWidth: { control: { type: "range", min: 100, max: 150, step: 10 } },
    mapCoordinates: {
      control: { type: "select" },
      options: [
        "numbersVertical",
        "reversed",
        "lettersHorizontal",
        "numbersHorizontal",
        "lettersVertical",
      ],
    },
  },
};

export const Edge = {};

export const Outside = { args: { coords: "outside" } };

export const Reversed = { args: { mapCoordinates: "reversed" } };
