import Bridge from "@/components/atoms/Bridge";

import { colorSelect } from "../../../.storybook/controls";

export default {
  title: "Atoms/Bridge",
  component: Bridge,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    cost: 20,
    width: 44,
    fontSize: 11,
    reverse: true,
    dashed: false,
    opacity: 1,
    borderWidth: 2,
  },
  argTypes: {
    cost: { control: "number" },
    color: colorSelect(),
    textColor: colorSelect(),
    borderColor: colorSelect(),
    width: { control: { type: "range", min: 20, max: 100, step: 2 } },
    fontSize: { control: { type: "range", min: 6, max: 24, step: 1 } },
    reverse: { control: "boolean" },
    dashed: { control: "boolean" },
    opacity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    borderWidth: { control: { type: "range", min: 0, max: 8, step: 1 } },
  },
};

export const Standard = {};

export const Expensive = {
  args: { cost: 120 },
};

export const Dashed = {
  args: { dashed: true },
};

export const Upright = {
  args: { reverse: false },
};
