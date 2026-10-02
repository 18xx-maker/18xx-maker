import Ledges from "@/components/market/Ledges";
import { LedgesStory } from "@/components/market/storyFrames";

import { colorSelect } from "../../../.storybook/controls";

export default {
  title: "Market/Ledges",
  component: Ledges,
  render: LedgesStory,
  parameters: {
    layout: "centered",
    game: "1889",
  },
  // Coordinates are in cells, from the top left of the market
  args: {
    color: "hl4",
    width: 6,
    dashed: false,
    border: false,
    coords: ["1 0", "1 3", "4 3", "4 0"],
  },
  argTypes: {
    color: colorSelect(),
    width: { control: { type: "range", min: 1, max: 12, step: 1 } },
    borderWidth: { control: { type: "range", min: 1, max: 16, step: 1 } },
    dashed: { control: "boolean" },
    border: { control: "boolean" },
    offset: { control: { type: "range", min: -20, max: 20, step: 1 } },
    dashArray: { control: { type: "range", min: 2, max: 30, step: 1 } },
    coords: { control: "object" },
    columns: { control: { type: "range", min: 3, max: 10, step: 1 } },
    rows: { control: { type: "range", min: 2, max: 6, step: 1 } },
  },
};

export const Solid = {};

export const Dashed = {
  args: { dashed: true },
};

export const Border = {
  args: { border: true, color: "red" },
};

// Like the ledges around 1861 and 1867
export const Closed = {
  args: {
    color: "black",
    coords: ["4 0", "4 4"],
    dashed: false,
  },
};
