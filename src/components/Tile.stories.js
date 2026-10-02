import { Fragment, createElement as h } from "react";

import { keys, sortBy } from "ramda";

import Tile from "@/components/Tile";

import { tiles } from "@/data";

// The clip paths normally live in the Root component's svg
const clipPaths = {
  hexClipPath:
    "-86.0252,0 -43.0126,-74.5 43.0126,-74.5 86.0252,0 43.0126,74.5 -43.0126,74.5",
  hexBleedClipPath:
    "-98.1495,0 -49.07475,-85 49.07475,-85 98.1495,0 49.07475,85 -49.07475,85",
  hexBleedClipPathDie:
    "-98.1495,0 -54.84825,-75 54.84825,-75 98.1495,0 54.84825,75 -54.84825,75",
};

const withClipPaths = (Story) =>
  h(
    Fragment,
    null,
    h(
      "defs",
      null,
      Object.entries(clipPaths).map(([id, points]) =>
        h("clipPath", { key: id, id }, h("polygon", { points })),
      ),
    ),
    h(Story),
  );

// Every bundled tile id, numbered ones first
const ids = sortBy(
  (id) => [Number.isNaN(parseInt(id, 10)) ? 1 : 0, parseInt(id, 10), id],
  keys(tiles),
);

export default {
  title: "Tiles/Tile",
  component: Tile,
  decorators: [withClipPaths],
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    id: "57",
    border: true,
    clipPath: "hexClipPath",
  },
  argTypes: {
    id: {
      control: { type: "select" },
      options: ids,
      description: "A bundled tile id (src/data/tiles)",
    },
    border: { control: { type: "boolean" } },
    clipPath: {
      control: { type: "select" },
      options: Object.keys(clipPaths),
    },
    gameTiles: {
      control: { type: "object" },
      description:
        "A game's tiles object: aliases, extra data and custom tiles",
    },
  },
};

export const Yellow = { args: { id: "1" } };

export const YellowCity = { args: { id: "57" } };

export const Green = { args: { id: "14" } };

export const Brown = { args: { id: "63" } };

export const Gray = { args: { id: "51" } };

export const Offboard = {
  args: {
    id: "T1",
    gameTiles: {
      T1: { color: "offboard", track: [{ type: "offboard", side: 1 }] },
    },
  },
};

export const Alias = {
  args: { id: "A1", gameTiles: { A1: { tile: "63", quantity: 2 } } },
};

export const ExtraData = {
  args: {
    id: "57",
    gameTiles: { 57: { quantity: 2, labels: [{ label: "B" }] } },
  },
};

export const UnknownId = { args: { id: "NOPE" } };
