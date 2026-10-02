import Label from "@/components/atoms/Label";

import { colorSelect, rotation } from "../../../.storybook/controls";

const fontFamilies = ["display", "sans-serif", "serif", "monospace"];
const fontWeights = ["normal", "bold", "lighter", "bolder"];

export default {
  title: "Atoms/Label",
  component: Label,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    label: "B",
    fixed: false,
  },
  argTypes: {
    label: { control: "text" },
    color: colorSelect(),
    fontSize: { control: { type: "range", min: 6, max: 60, step: 1 } },
    fontFamily: { control: { type: "select" }, options: fontFamilies },
    fontWeight: { control: { type: "select" }, options: fontWeights },
    rotation,
    fixed: { control: "boolean" },
  },
};

export const Short = {};

export const Medium = {
  args: { label: "NYC" },
};

export const Long = {
  args: { label: "Chicago Terminal" },
};

export const Colored = {
  args: { label: "OO", color: "red" },
};
