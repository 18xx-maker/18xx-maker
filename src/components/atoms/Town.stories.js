import Town from "@/components/atoms/Town";

import { colorSelect } from "../../../.storybook/controls";

export default {
  title: "Atoms/Town",
  component: Town,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    border: false,
  },
  argTypes: {
    border: { control: "boolean" },
    borderWidth: { control: { type: "range", min: 0, max: 12, step: 1 } },
    color: colorSelect(),
    bgColor: colorSelect(),
    name: { control: "object" },
  },
};

export const Standard = {};

export const Colored = {
  args: { color: "orange" },
};

export const Border = {
  args: { border: true },
};

export const WideBorder = {
  args: { border: true, borderWidth: 6 },
};

export const Named = {
  args: { name: { name: "Dunwich" } },
};

export const NamedReverse = {
  args: { name: { name: "Boston", reverse: true } },
};
