import Tunnel from "@/components/atoms/Tunnel";

import { colorSelect } from "../../../.storybook/controls";

export default {
  title: "Atoms/Tunnel",
  component: Tunnel,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    cost: 10,
    width: 44,
    fontSize: 11,
    opacity: 1.0,
    borderWidth: 2,
    dashed: false,
    reverse: false,
  },
  argTypes: {
    cost: { control: "number" },
    color: colorSelect(),
    textColor: colorSelect(),
    borderColor: colorSelect(),
    width: { control: { type: "range", min: 20, max: 100, step: 2 } },
    fontSize: { control: { type: "range", min: 6, max: 24, step: 1 } },
    borderWidth: { control: { type: "range", min: 0, max: 8, step: 1 } },
    opacity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    dashed: { control: "boolean" },
    reverse: { control: "boolean" },
  },
};

export const Standard = {};

export const Dashed = {
  args: {
    dashed: true,
  },
};

export const Reversed = {
  args: {
    reverse: true,
  },
};

export const Colored = {
  args: {
    color: "water",
  },
};
