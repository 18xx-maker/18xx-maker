import Boomtown from "@/components/atoms/Boomtown";

import { colorSelect } from "../../../.storybook/controls";

export default {
  title: "Atoms/Boomtown",
  component: Boomtown,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    city: false,
    size: 1,
    border: false,
    dashed: true,
  },
  argTypes: {
    city: { control: "boolean" },
    size: { control: { type: "select" }, options: [1, 2, 3, 4] },
    border: { control: "boolean" },
    dashed: { control: "boolean" },
    color: colorSelect(),
    bgColor: colorSelect(),
    name: { control: "object" },
    width: { control: { type: "range", min: 10, max: 40, step: 1 } },
    townWidth: { control: { type: "range", min: 5, max: 30, step: 1 } },
    borderWidth: { control: { type: "range", min: 0, max: 12, step: 1 } },
    strokeWidth: { control: { type: "range", min: 1, max: 6, step: 1 } },
  },
};

export const Town = {};

export const City = {
  args: { city: true },
};

export const DoubleTown = {
  args: { size: 2 },
};

export const DoubleCity = {
  args: { city: true, size: 2 },
};

export const Colored = {
  args: { color: "orange" },
};

export const Named = {
  args: { color: "orange", name: { name: "Denver" } },
};

export const NamedCity = {
  args: { city: true, name: { name: "Denver", reverse: true } },
};

export const Solid = {
  args: { dashed: false },
};

export const Border = {
  args: { border: true },
};
