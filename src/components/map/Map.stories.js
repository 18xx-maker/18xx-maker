import { Fragment, createElement as h } from "react";

import Map from "@/components/map/Map";

import { MapOrientation } from "@/context/OrientationContext";
import { useConfig, useGame } from "@/hooks";

// The clip paths normally live in the Root component's svg
const hexClipPath =
  "-86.0252,0 -43.0126,-74.5 43.0126,-74.5 86.0252,0 43.0126,74.5 -43.0126,74.5";

const MapStory = ({ coords, hexWidth, interactive }) => {
  const game = useGame();
  const { config } = useConfig();

  return h(
    MapOrientation,
    null,
    h(
      Fragment,
      null,
      h(
        "defs",
        null,
        h(
          "clipPath",
          { id: "hexClipPath" },
          h("polygon", { points: hexClipPath }),
        ),
      ),
      h(Map, {
        name: game.meta.id,
        game,
        config: {
          ...config,
          coords,
          tiles: { ...config.tiles, mapWidth: hexWidth },
        },
        variation: 0,
        interactive,
      }),
    ),
  );
};

export default {
  title: "Map/Map",
  component: Map,
  render: (args) => h(MapStory, args),
  parameters: {
    layout: "centered",
    game: "18Test",
    svg: { width: 1000, height: 260, viewBox: "0 0 1400 360" },
  },
  args: {
    coords: "edge",
    hexWidth: 150,
  },
  argTypes: {
    coords: {
      control: { type: "select" },
      options: ["edge", "outside", "inside"],
    },
    hexWidth: { control: { type: "range", min: 100, max: 150, step: 10 } },
  },
};

export const Standard = {};

export const OutsideCoordinates = { args: { coords: "outside" } };

export const InsideCoordinates = { args: { coords: "inside" } };

// The layer of the hex editor: with the edit panel open (the url) every hex
// and the empty positions around the map are targets for the pointer
export const PickingHexes = {
  args: { interactive: true },
  parameters: { route: "/games/18Test/map?edit=true&hex=C11&editSection=hex" },
};
