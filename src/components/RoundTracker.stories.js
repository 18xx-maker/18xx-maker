import RoundTracker from "@/components/RoundTracker";
import { RoundTrackerStory } from "@/components/storyFrames";

export default {
  title: "Print/RoundTracker",
  component: RoundTracker,
  render: RoundTrackerStory,
  parameters: { layout: "centered", game: "1889" },
  args: {
    type: "row",
    size: 50,
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
    size: { control: { type: "range", min: 20, max: 80, step: 5 } },
    rotation: { control: { type: "range", min: 0, max: 330, step: 30 } },
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
  args: { type: "round", rotation: 0 },
};

// Like 18TraXX2020, with a smaller token for the merger rounds
export const SmallRounds = {
  args: {
    type: "row-reverse",
    rounds: [
      { name: "OR3", color: "brown" },
      { name: "MR", color: "gray", small: true },
      { name: "OR2", color: "green" },
      { name: "MR", color: "gray", small: true },
      { name: "OR1", color: "yellow" },
      { name: "SR", color: "white" },
    ],
  },
};
