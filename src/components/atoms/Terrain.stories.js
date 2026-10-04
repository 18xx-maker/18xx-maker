import Terrain from "@/components/atoms/Terrain";

import { colorSelect, rotation } from "../../../.storybook/controls";

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
    size: "small",
    fixed: false,
  },
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["mountain", "swamp", "cow-skull", "wheat", "noenter", "flag"],
    },
    cost: { control: "number" },
    size: {
      control: { type: "select" },
      options: ["tiny", "small", "medium", "large"],
    },
    color: colorSelect(),
    fontSize: { control: { type: "range", min: 6, max: 30, step: 1 } },
    fontFamily: {
      control: { type: "select" },
      options: ["display", "sans-serif", "serif", "monospace"],
    },
    rotation,
    fixed: { control: "boolean" },
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

export const Medium = {
  args: { size: "medium", cost: 60 },
};

export const Large = {
  args: { size: "large", type: "noenter", cost: 120 },
};

export const Tiny = {
  args: { size: "tiny", cost: 20 },
};
