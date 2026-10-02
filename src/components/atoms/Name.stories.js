import Name from "@/components/atoms/Name";

import { colorSelect } from "../../../.storybook/controls";

export default {
  title: "Atoms/Name",
  component: Name,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    name: "Boston",
    reverse: false,
    x: 0,
    y: 0,
    fontSize: 20,
    fontWeight: "bold",
    strokeWidth: 0,
  },
  argTypes: {
    name: { control: "text" },
    reverse: { control: "boolean" },
    x: { control: { type: "range", min: -60, max: 60, step: 5 } },
    y: { control: { type: "range", min: -60, max: 60, step: 5 } },
    fontSize: { control: { type: "range", min: 6, max: 40, step: 1 } },
    fontWeight: {
      control: { type: "select" },
      options: ["normal", "bold", "lighter", "bolder"],
    },
    fontFamily: {
      control: { type: "select" },
      options: ["sans-serif", "serif", "monospace", "display"],
    },
    color: colorSelect(),
    bgColor: colorSelect(),
    strokeColor: colorSelect(),
    strokeWidth: { control: { type: "range", min: 0, max: 4, step: 0.5 } },
    textLength: { control: { type: "range", min: 20, max: 160, step: 5 } },
    rotation: { control: { type: "range", min: 0, max: 330, step: 30 } },
    path: { control: "text" },
    offset: { control: { type: "range", min: 0, max: 100, step: 5 } },
    doRotation: { control: "boolean" },
  },
};

export const Standard = {};

export const Reversed = {
  args: { reverse: true },
};

export const Colored = {
  args: { color: "red", strokeColor: "yellow", strokeWidth: 1 },
};

export const OnBackground = {
  args: { bgColor: "red" },
};

export const Stretched = {
  args: { textLength: 120 },
};

export const Rotated = {
  args: { rotation: 90, doRotation: true },
};

export const OnPath = {
  args: {
    name: "New York",
    path: "M -50 0 A 50 50 0 0 1 50 0",
    offset: 50,
  },
};
