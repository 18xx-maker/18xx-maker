import GroupMark from "@/components/atoms/GroupMark";

export default {
  title: "Atoms/GroupMark",
  component: GroupMark,
  parameters: { layout: "centered", svg: true, game: "18Test" },
  args: { group: "orange" },
  argTypes: {
    group: {
      control: { type: "select" },
      options: ["orange", "blue", "dark", "red", "outline"],
    },
  },
};

export const Circle = {};

export const Square = { args: { group: "blue" } };

export const DiamondWithText = { args: { group: "dark" } };

export const Triangle = { args: { group: "red" } };

export const Outline = { args: { group: "outline" } };
