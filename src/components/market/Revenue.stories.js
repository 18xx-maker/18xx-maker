import Revenue from "@/components/market/Revenue";
import { RevenueStory } from "@/components/market/storyFrames";

export default {
  title: "Market/Revenue",
  component: Revenue,
  render: RevenueStory,
  parameters: {
    layout: "centered",
    game: "1889",
  },
  args: {
    min: 10,
    max: 100,
    perRow: 10,
  },
  argTypes: {
    min: { control: { type: "number", min: 0, step: 5 } },
    max: { control: { type: "number", min: 10, max: 200, step: 10 } },
    perRow: { control: { type: "range", min: 5, max: 20, step: 5 } },
  },
};

export const Standard = {};

export const Wide = {
  args: { min: 1, max: 100, perRow: 20 },
};
