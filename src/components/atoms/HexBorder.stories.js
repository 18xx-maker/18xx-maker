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
  },
  argTypes: {
    border: { control: "boolean" },
    map: { control: "boolean" },
    removeBorders: {
      control: { type: "check" },
      options: [1, 2, 3, 4, 5, 6],
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
