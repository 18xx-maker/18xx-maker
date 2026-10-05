import Share from "@/components/cards/Share";

import { card } from "@/stories/frames";
import { colorSelect } from "../../../.storybook/controls";

const color = colorSelect();

export default {
  title: "Cards/Share",
  component: Share,
  decorators: [card],
  parameters: {
    layout: "centered",
    game: "1889",
    printConfig: { cards: { shareStyle: "gmt" } },
  },
  args: {
    name: "Awa Railroad",
    color: "black",
    company: {
      name: "Awa Railroad",
      abbrev: "AR",
      logo: "1889/AR",
      color: "black",
    },
    label: "President's Certificate",
    percent: 20,
    shares: 2,
  },
  argTypes: {
    name: { control: "text" },
    subtext: { control: "text" },
    color,
    backgroundColor: color,
    labelColor: color,
    label: { control: "text" },
    percent: { control: { type: "range", min: 5, max: 100, step: 5 } },
    shares: { control: { type: "range", min: 1, max: 5, step: 1 } },
    tokenCount: { control: { type: "range", min: 0, max: 4, step: 0.5 } },
    cost: { control: { type: "number", min: 0, step: 10 } },
    revenue: { control: { type: "number", min: 0, step: 5 } },
    variant: { control: "text" },
    fontFamily: {
      control: { type: "select" },
      options: ["display", "serif", "sans-serif", "monospace"],
    },
    company: { control: "object" },
  },
};

// The default gmt style, a band down the left of the card
export const President = {};

export const Regular = {
  args: { label: "", percent: 10, shares: 1 },
};

export const Short = {
  args: {
    label: "",
    subtext: "Short Share",
    percent: 10,
    shares: 1,
    backgroundColor: "orange",
    variant: "short",
  },
};

export const CostAndRevenue = {
  args: { label: "", percent: 10, shares: 1, cost: 100, revenue: 10 },
};

export const LeftStyle = {
  parameters: { printConfig: { cards: { shareStyle: "left" } } },
};

export const BlackBand = {
  args: { color: "white" },
  parameters: {
    printConfig: { cards: { shareStyle: "left", blackBand: true } },
  },
};

export const CenterStyle = {
  parameters: { printConfig: { cards: { shareStyle: "center" } } },
};
