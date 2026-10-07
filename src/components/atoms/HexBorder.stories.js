import HexBorder from "@/components/atoms/HexBorder";

export default {
  title: "Atoms/HexBorder",
  component: HexBorder,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    border: true,
    removeBorders: [],
    halves: [],
  },
  argTypes: {
    border: { control: "boolean" },
    map: { control: "boolean" },
    removeBorders: {
      control: { type: "check" },
      options: [1, 2, 3, 4, 5, 6],
    },
    halves: {
      control: { type: "check" },
      options: ["top", "bottom", "left", "right"],
    },
  },
};

export const Standard = {};

export const RemovedSides = {
  args: { removeBorders: [1, 2] },
};

export const NoBorder = {
  args: { border: false },
};

export const TopHalf = {
  args: { halves: ["top"] },
};

export const LeftHalf = {
  args: { halves: ["left"] },
};
