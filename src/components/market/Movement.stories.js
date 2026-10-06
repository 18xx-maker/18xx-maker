import Movement from "@/components/market/Movement";

import { MovementStory } from "@/stories/marketFrames";

export default {
  title: "Market/Movement",
  component: Movement,
  render: MovementStory,
  parameters: {
    layout: "centered",
    game: "1889",
  },
  args: {
    title: "Share price movement",
    movement: {
      up: ["Sold out"],
      down: ["Every share sold"],
      left: ["Withheld revenue"],
      right: ["Paid dividends"],
    },
  },
  argTypes: {
    title: { control: "text" },
    movement: { control: "object" },
  },
};

export const Standard = {};

export const OtherKeys = {
  args: {
    movement: {
      up: ["Sold out"],
      down: ["Every share sold"],
      left: ["Revenue withheld"],
      right: ["Pay at least half of the current share price"],
      "2x right": [
        "Pay at least two times the current share price, or more than the current share price",
      ],
    },
  },
};
