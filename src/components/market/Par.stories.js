import Par from "@/components/market/Par";

import { ParStory } from "@/stories/marketFrames";
import { colorSelect } from "../../../.storybook/controls";

export default {
  title: "Market/Par",
  component: Par,
  render: ParStory,
  parameters: {
    layout: "centered",
    game: "1889",
  },
  args: {
    title: "1889 Par",
    values: [100, 90, 80, 75, 70, 65],
  },
  argTypes: {
    title: { control: "text" },
    values: { control: "object" },
    color: colorSelect(),
    width: { control: { type: "range", min: 1, max: 6, step: 1 } },
    height: { control: { type: "range", min: 1, max: 3, step: 1 } },
  },
};

export const Standard = {};

export const Colored = {
  args: { color: "orange" },
};

export const Columns = {
  args: {
    width: 2,
    values: [
      [100, 95],
      [90, 85],
      [80, 75],
    ],
  },
};

export const Labels = {
  args: {
    values: [
      { label: "100", subLabel: "max" },
      90,
      { label: "80", color: "red" },
    ],
  },
};
