import { createElement } from "react";

import TrainBack from "@/components/cards/TrainBack";

import { card } from "@/stories/frames";
import { colorSelect } from "../../../.storybook/controls";

const color = colorSelect();

export default {
  title: "Cards/TrainBack",
  component: TrainBack,
  decorators: [card],
  parameters: { layout: "centered", game: "1889" },
  // The component takes a train with a back, the controls are the back
  render: ({ name, ...back }) =>
    createElement(TrainBack, { train: { name, back } }),
  args: {
    name: "2",
    text: "Rusts with the first 4",
    backgroundColor: "yellow",
  },
  argTypes: {
    name: { control: "text" },
    title: { control: "text" },
    text: { control: "text" },
    color,
    backgroundColor: color,
  },
};

// The title is the name of the train
export const Default = {};

export const Title = { args: { title: "Two Train" } };

export const Dark = {
  args: { name: "D", text: "", backgroundColor: "black" },
};

export const LongTitle = {
  args: { title: "The Great Northern Express", text: "A long title wraps" },
};

// A back with a name is a full train, printed like a normal train card
export const FullTrain = {
  render: () =>
    createElement(TrainBack, {
      train: {
        name: "2",
        back: { name: "3", color: "green", price: 180 },
      },
    }),
};
