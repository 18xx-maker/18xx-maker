import Number from "@/components/cards/Number";
import { card } from "@/components/storyFrames";

import { colorSelect } from "../../../.storybook/controls";

export default {
  title: "Cards/Number",
  component: Number,
  decorators: [card],
  parameters: { layout: "centered" },
  args: {
    number: 3,
    background: "purple",
  },
  argTypes: {
    number: { control: { type: "range", min: 1, max: 7, step: 1 } },
    background: colorSelect(),
  },
};

// Priority order cards, one per player
export const Standard = {};

export const Last = {
  args: { number: 7, background: "green" },
};
