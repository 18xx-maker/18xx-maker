import { createElement } from "react";

import Position from "@/components/Position";

const hex =
  "-86.0252,0 -43.0126,-74.5 43.0126,-74.5 86.0252,0 43.0126,74.5 -43.0126,74.5";

// Each positioned element is a numbered dot, so the placement is visible
const Dot = (d, i) =>
  createElement(
    "g",
    { key: i },
    createElement("circle", { r: 10, fill: "white", stroke: "black" }),
    createElement("path", {
      d: "M 0 0 L 0 -16",
      stroke: "black",
      strokeWidth: 2,
    }),
    createElement(
      "text",
      { textAnchor: "middle", dominantBaseline: "middle", fontSize: 12 },
      i + 1,
    ),
  );

export default {
  title: "Print/Position",
  component: Position,
  parameters: { layout: "centered", svg: true },
  render: ({ data, type }) =>
    createElement(
      "g",
      null,
      createElement("polygon", {
        points: hex,
        fill: "none",
        stroke: "gray",
        strokeDasharray: "4 2",
      }),
      createElement(Position, { data, type: type || undefined }, (d) =>
        Dot(d, data.indexOf(d)),
      ),
    ),
  args: {
    data: [
      { angle: 0, percent: 0.5 },
      { angle: 120, percent: 0.7, rotate: 30 },
      { angle: 240, percent: 0.7, side: 2 },
      { x: 20, y: -30 },
    ],
  },
  argTypes: {
    data: { control: "object" },
    type: {
      control: "select",
      options: ["", "icon", "label", "terrain", "value"],
    },
  },
};

// Angle and percent place an element around the center, then rotate it
export const Explicit = {};

// Elements without any positioning of their own are placed by their type
export const Automatic = {
  args: { type: "label", data: [{}, {}] },
};

export const Hidden = {
  args: {
    data: [
      { angle: 0, percent: 0.5 },
      { angle: 120, percent: 0.7, hidden: true },
    ],
  },
};
