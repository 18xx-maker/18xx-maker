import Track from "@/components/atoms/Track";

const types = [
  "straight",
  "gentle",
  "sharp",
  "mid",
  "stub",
  "stop",
  "bent",
  "offboard",
];

export default {
  title: "Atoms/Track",
  component: Track,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    type: "straight",
    side: 1,
    border: true,
  },
  argTypes: {
    type: {
      control: { type: "select" },
      options: types,
    },
    side: {
      control: { type: "number", min: 1, max: 6 },
    },
  },
};

export const Straight = {};

export const Gentle = {
  args: { type: "gentle" },
};

export const Sharp = {
  args: { type: "sharp" },
};

export const Stub = {
  args: { type: "stub" },
};

export const NarrowGauge = {
  args: { gauge: "narrow" },
};

export const Dual = {
  args: { gauge: "dual" },
};
