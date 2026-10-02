import Cell from "@/components/market/Cell";
import { CellStory } from "@/components/market/storyFrames";

import { colorSelect } from "../../../.storybook/controls";

const color = colorSelect();

export default {
  title: "Market/Cell",
  component: Cell,
  render: CellStory,
  parameters: {
    layout: "centered",
    game: "1889",
    // Cells of a 2D market are 70 by 85
    svg: { width: 280, height: 340, viewBox: "-5 -5 80 95" },
  },
  args: {
    type: "2D",
    value: 100,
    valuePosition: "top",
    legendColors: ["yellow", "orange"],
  },
  argTypes: {
    type: { control: "select", options: ["2D", "1D", "1Diag"] },
    value: { control: { type: "number", min: 0, step: 5 } },
    label: { control: "text" },
    subLabel: { control: "text" },
    color,
    labelColor: color,
    arrowColor: color,
    arrow: {
      control: "select",
      options: ["", "up", "down", "left", "right"],
    },
    legend: { control: "select", options: ["", 0, 1] },
    legendColors: { control: "object" },
    par: { control: "boolean" },
    underline: { control: "boolean" },
    rotated: { control: "boolean" },
    subRotated: { control: "boolean" },
    width: { control: { type: "range", min: 1, max: 2, step: 1 } },
    height: { control: { type: "range", min: 1, max: 2, step: 1 } },
    companies: { control: "object" },
    tokens: { control: "object" },
    valuePosition: { control: "select", options: ["top", "bottom"] },
    arrowPosition: {
      control: "select",
      options: ["bottom", "top", "middle"],
    },
  },
};

export const Value = {};

export const Label = {
  args: {
    value: undefined,
    label: "Closed",
    color: "black",
    labelColor: "white",
  },
};

export const Arrow = {
  args: { value: 75, arrow: "down", arrowPosition: "bottom" },
};

export const Arrows = {
  args: {
    value: 315,
    arrow: ["up", "right"],
    arrowColor: "red",
    arrowPosition: "bottom",
  },
};

export const Colored = {
  args: { value: 150, color: "yellow", underline: true },
};

// Colors the cell from the legend of the market
export const Legend = {
  args: { value: 50, legend: 1 },
};

export const Par = {
  args: { value: 100, par: true },
};

export const SubLabel = {
  args: { value: 100, subLabel: "Par" },
};

export const ValueAtBottom = {
  args: { value: 100, subLabel: "Par", valuePosition: "bottom" },
};

export const Companies = {
  args: { value: 100, companies: ["AR", "IR"] },
};

export const Tokens = {
  args: { value: 100, tokens: [{ color: "red", label: "A", width: 15 }] },
};

export const Rotated = {
  args: { value: undefined, label: "Closed", rotated: true },
};

export const Wide = {
  args: { width: 2 },
  parameters: { svg: { width: 560, height: 340, viewBox: "-5 -5 150 95" } },
};

// Cells of a 1D market are taller, and the label runs sideways
export const OneD = {
  args: {
    type: "1D",
    value: undefined,
    label: "Closed",
    color: "black",
    labelColor: "white",
  },
  parameters: { svg: { width: 140, height: 680, viewBox: "-5 -5 80 350" } },
};
