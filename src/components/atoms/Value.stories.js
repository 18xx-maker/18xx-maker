import Value from "@/components/atoms/Value";

import { colorSelect, rotation } from "../../../.storybook/controls";

export default {
  title: "Atoms/Value",
  component: Value,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    value: 30,
    shape: "circle",
    borderWidth: 2,
    fixed: false,
  },
  argTypes: {
    value: { control: "number" },
    shape: {
      control: { type: "select" },
      options: ["circle", "square", "none"],
    },
    color: colorSelect(),
    textColor: colorSelect(),
    outerBorderColor: colorSelect(),
    fontSize: { control: { type: "range", min: 6, max: 40, step: 1 } },
    fontWeight: {
      control: { type: "select" },
      options: ["normal", "bold", "lighter", "bolder"],
    },
    fontFamily: {
      control: { type: "select" },
      options: ["sans-serif", "display", "serif", "monospace"],
    },
    width: { control: { type: "range", min: 10, max: 100, step: 1 } },
    height: { control: { type: "range", min: 10, max: 60, step: 1 } },
    borderWidth: { control: { type: "range", min: 0, max: 8, step: 1 } },
    rotation,
    fixed: { control: "boolean" },
  },
};

export const Standard = {};

export const Large = {
  args: { value: 120 },
};

export const Colored = {
  args: { color: "yellow", textColor: "black" },
};

export const Square = {
  args: { shape: "square", color: "green" },
};

export const OuterBorder = {
  args: { outerBorderColor: "red" },
};

export const NoShape = {
  args: { shape: "none" },
};
