import Terrain from "@/components/atoms/Terrain";

export default {
  title: "Atoms/Terrain",
  component: Terrain,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    type: "mountain",
    cost: 60,
  },
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["mountain", "swamp", "cow-skull", "wheat", "noenter"],
    },
  },
};

export const Mountain = {};

export const Swamp = {
  args: { type: "swamp", cost: 20 },
};

export const CowSkull = {
  args: { type: "cow-skull", cost: 40 },
};

export const Wheat = {
  args: { type: "wheat", cost: 10 },
};

export const NoEnter = {
  args: { type: "noenter", cost: undefined },
};
