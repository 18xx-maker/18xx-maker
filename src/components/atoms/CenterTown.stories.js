import CenterTown from "@/components/atoms/CenterTown";

import { colorSelect } from "../../../.storybook/controls";

export default {
  title: "Atoms/CenterTown",
  component: CenterTown,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    border: false,
    size: 1,
    width: 20,
  },
  argTypes: {
    border: { control: "boolean" },
    size: { control: { type: "select" }, options: [1, 2] },
    width: { control: { type: "range", min: 10, max: 50, step: 1 } },
    borderWidth: { control: { type: "range", min: 0, max: 12, step: 1 } },
    color: colorSelect(),
    outlineColor: colorSelect(),
    bgColor: colorSelect(),
    name: { control: "object" },
  },
};

export const Standard = {};

export const Large = {
  args: { size: 2 },
};

export const Wide = {
  args: { width: 30 },
};

export const Colored = {
  args: { color: "orange" },
};

export const Named = {
  args: { color: "orange", name: { name: "Austin" } },
};

export const NamedReverse = {
  args: { name: { name: "Boston", reverse: true } },
};

export const Border = {
  args: { border: true },
};
