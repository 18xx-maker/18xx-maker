import { Fragment, createElement as h } from "react";

import Hex from "@/components/Hex";

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

const hexColors = [
  "plain",
  "offboard",
  "mountain",
  "water",
  "land",
  "yellow",
  "green",
  "brown",
  "gray",
  "orange",
  "yellow/green",
  "green/brown",
  "brown/gray",
  "red/yellow",
];

// The color is split out of the hex object so it is a select in the Controls
const render = ({ color, hex, ...props }) =>
  h(Hex, { ...props, hex: color ? { ...hex, color } : hex });

export default {
  title: "Hex/Hex",
  component: Hex,
  render,
  decorators: [withClipPaths],
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    color: "",
    hex: { color: "plain" },
    id: "A1",
    border: true,
    transparent: false,
    map: false,
    opacity: 1,
    clipPath: "hexClipPath",
  },
  argTypes: {
    color: {
      control: { type: "select" },
      options: ["", ...hexColors],
      description: "Overrides hex.color",
    },
    hex: { control: { type: "object" } },
    id: { control: { type: "text" } },
    border: { control: { type: "boolean" } },
    transparent: { control: { type: "boolean" } },
    map: { control: { type: "boolean" } },
    opacity: { control: { type: "range", min: 0, max: 1, step: 0.1 } },
    clipPath: {
      control: { type: "select" },
      options: Object.keys(clipPaths),
    },
  },
};

const story = (hex, args = {}) => ({ args: { hex, ...args } });

export const Plain = story({ color: "plain" });

export const Yellow = story({ color: "yellow" });

export const Gradient = story({ color: "yellow/green" }, { color: "" });

export const Mountain = story({ color: "mountain", removeBorders: [1, 4] });

export const Water = story({ color: "water", removeBorders: [1, 3, 5] });

export const Divided = story({ color: "land", divides: [{ side: 3 }] });

export const Tokens = story({
  color: "plain",
  tokens: [{ label: "AA", color: "orange", bar: true, angle: 0 }],
});

export const City = story({
  color: "yellow",
  cities: [{ size: 2, name: { name: "Boston" }, companies: ["NYNH"] }],
  track: [{ side: 1 }, { side: 4 }],
});

export const BigCity = story({
  color: "brown",
  cities: [
    {
      size: 4,
      icons: ["mail", null, null, "boat"],
      name: { name: "Boston" },
      companies: [null, "B&M", { abbrev: "PRR", reserved: true }],
    },
  ],
  values: [{ angle: 210, percent: 0.8, value: 40 }],
});

export const Town = story({
  color: "yellow",
  towns: [{ name: { name: "Austin" } }],
  track: [{ side: 2 }, { side: 5 }],
});

export const CenterTown = story({
  color: "yellow",
  centerTowns: [{ size: 2, name: { name: "Austin" } }],
  track: [{ side: 1 }, { side: 4 }],
});

export const Boomtown = story({
  color: "plain",
  boomtowns: [{ city: true, size: 2, name: { name: "Denver" } }],
});

export const MediumCity = story({
  color: "green",
  mediumCities: [{ color: "orange", name: { name: "Austin" } }],
});

export const Track = story({
  color: "green",
  track: [
    { type: "gentle", side: 1 },
    { type: "sharp", side: 3 },
    { type: "straight", side: 4 },
    { type: "straight", side: 5, cross: "over" },
  ],
});

export const Labels = story({
  color: "yellow",
  labels: [{ label: "NY" }],
  cities: [{}],
});

export const Offboard = story({
  color: "offboard",
  track: [{ type: "offboard", side: 4 }],
  offBoardRevenue: {
    name: { name: "Montreal" },
    revenues: [
      { color: "yellow", cost: 30 },
      { color: "brown", cost: 60 },
    ],
  },
});

export const Borders = story({
  color: "plain",
  borders: [
    { side: 1, color: "water" },
    { side: 2, color: "water" },
    { side: 4, color: "mountain", dashed: true },
    { side: 5, color: "mountain", dashed: true },
  ],
});

export const Terrain = story({
  color: "plain",
  terrain: [{ type: "mountain", cost: 100 }],
});

export const TunnelsAndBridges = story({
  color: "plain",
  tunnels: [{ cost: 40 }],
  bridges: [{ cost: 40 }],
  tunnelEntrances: [{ angle: 120, percent: 1, rotation: -60, color: "red" }],
});

export const Shapes = story({
  color: "plain",
  shapes: [{ type: "diamond", text: "+20", color: "orange" }],
});

export const Icons = story({
  color: "yellow",
  icons: [{ type: "boat" }],
});

export const Values = story({
  color: "plain",
  values: [{ value: 60, color: "orange", shape: "square" }],
});

export const Names = story({
  color: "plain",
  names: [{ name: "Seattle", percent: 0.6, rotate: -60, angle: 120 }],
});

export const Industries = story({
  color: "plain",
  industries: [{ top: "ZH", bottom: 10 }],
  goods: [{ color: "orange" }],
});

export const PrivateCompanies = story({
  color: "plain",
  companies: [{ label: "CdH", left: 50, right: 50, color: "blue" }],
});

export const RouteBonus = story({
  color: "plain",
  routeBonus: [
    {
      value: "+$120",
      fillColor: "black",
      strokeColor: "red",
      textColor: "white",
    },
  ],
});
