import ParCell from "@/components/market/ParCell";

import { ParCellStory } from "@/stories/marketFrames";
import { colorSelect } from "../../../.storybook/controls";

const color = colorSelect();

export default {
  title: "Market/ParCell",
  component: ParCell,
  render: ParCellStory,
  parameters: {
    layout: "centered",
    game: "1889",
    // Par cells are 4 cells wide by default: 280 by 85
    svg: { width: 560, height: 170, viewBox: "-5 -5 290 95" },
  },
  args: {
    value: 100,
    legendColors: ["yellow", "orange"],
  },
  argTypes: {
    value: { control: { type: "number", min: 0, step: 5 } },
    label: { control: "text" },
    subLabel: { control: "text" },
    color,
    parColor: color,
    labelColor: color,
    underline: { control: "boolean" },
    legend: { control: "select", options: ["", 0, 1] },
    legendColors: { control: "object" },
  },
};

export const Value = {};

export const Colored = {
  args: { parColor: "orange" },
};

export const SubLabel = {
  args: { value: 90, subLabel: "Par" },
};

export const Legend = {
  args: { legend: 0 },
};
