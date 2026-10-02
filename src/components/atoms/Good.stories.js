import Good from "@/components/atoms/Good";

import { colorSelect } from "../../../.storybook/controls";

const fontFamilies = ["display", "sans-serif", "serif", "monospace"];
const fontWeights = ["normal", "bold", "lighter", "bolder"];

export default {
  title: "Atoms/Good",
  component: Good,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    text: "G",
    width: 40,
    borderWidth: 2,
    opacity: 1,
    dashed: false,
  },
  argTypes: {
    text: { control: "text" },
    color: colorSelect(),
    textColor: colorSelect(),
    borderColor: colorSelect(),
    width: { control: { type: "range", min: 20, max: 100, step: 2 } },
    borderWidth: { control: { type: "range", min: 0, max: 8, step: 1 } },
    opacity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    dashed: { control: "boolean" },
    fontSize: { control: { type: "range", min: 6, max: 40, step: 1 } },
    fontFamily: { control: { type: "select" }, options: fontFamilies },
    fontWeight: { control: { type: "select" }, options: fontWeights },
  },
};

export const Standard = {};

export const Colored = {
  args: { color: "yellow" },
};

export const Dashed = {
  args: { dashed: true, borderColor: "red" },
};

export const Large = {
  args: { text: "Coal", width: 70 },
};
