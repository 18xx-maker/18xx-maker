import MarketRoundTracker from "@/components/market/MarketRoundTracker";
import { MarketRoundTrackerStory } from "@/components/market/storyFrames";

export default {
  title: "Market/MarketRoundTracker",
  component: MarketRoundTracker,
  render: MarketRoundTrackerStory,
  parameters: {
    layout: "centered",
    game: "1889",
  },
  // x and y are in market cells
  args: {
    type: "row",
    x: 0,
    y: 0,
    showRoundTracker: true,
    rounds: [
      { name: "OR3", color: "brown" },
      { name: "OR2", color: "green" },
      { name: "OR1", color: "yellow" },
      { name: "SR", color: "white" },
    ],
  },
  argTypes: {
    type: {
      control: "select",
      options: ["row", "row-reverse", "col", "col-reverse", "round"],
    },
    x: { control: { type: "range", min: 0, max: 4, step: 1 } },
    y: { control: { type: "range", min: 0, max: 4, step: 1 } },
    rotation: { control: { type: "range", min: 0, max: 330, step: 30 } },
    showRoundTracker: { control: "boolean" },
    rounds: { control: "object" },
  },
};

export const Row = {};

export const RowReverse = {
  args: { type: "row-reverse" },
};

export const Column = {
  args: { type: "col" },
};

export const Round = {
  args: { type: "round", x: 2, y: 2, rotation: 0 },
};
