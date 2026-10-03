import OffBoardRevenue from "@/components/atoms/OffBoardRevenue";

export default {
  title: "Atoms/OffBoardRevenue",
  component: OffBoardRevenue,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    name: { name: "Boston" },
    reverse: false,
    revenues: [
      { color: "yellow", cost: 20 },
      { color: "brown", cost: 40 },
    ],
  },
  argTypes: {
    name: { control: "object" },
    revenues: { control: "object" },
    reverse: { control: "boolean" },
    rows: { control: { type: "range", min: 1, max: 4, step: 1 } },
    size: { control: { type: "range", min: 8, max: 24, step: 1 } },
    fontFamily: {
      control: { type: "select" },
      options: ["display", "sans-serif", "serif", "monospace"],
    },
  },
};

export const Standard = {};

export const Phases = {
  args: {
    reverse: true,
    revenues: [
      { color: "yellow", cost: 20, phase: 2 },
      { color: "brown", cost: 40, phase: 5, phaseColor: "brown" },
    ],
  },
};

export const TwoRows = {
  args: {
    reverse: true,
    rows: 2,
    revenues: [
      { color: "yellow", cost: 20 },
      { color: "green", cost: 30 },
      { color: "brown", cost: 40 },
      { color: "gray", cost: 120 },
    ],
  },
};

export const Unnamed = {
  args: { name: undefined },
};
