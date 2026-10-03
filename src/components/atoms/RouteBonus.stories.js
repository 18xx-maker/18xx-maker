import RouteBonus from "@/components/atoms/RouteBonus";

import { colorSelect } from "../../../.storybook/controls";

export default {
  title: "Atoms/RouteBonus",
  component: RouteBonus,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    value: "$40",
    size: 14,
    strokeWidth: 1,
  },
  argTypes: {
    value: { control: "text" },
    size: { control: { type: "range", min: 8, max: 30, step: 1 } },
    fontFamily: {
      control: { type: "select" },
      options: ["sans-serif", "serif", "monospace", "display"],
    },
    fillColor: colorSelect(),
    strokeColor: colorSelect(),
    textColor: colorSelect(),
    strokeWidth: { control: { type: "range", min: 0, max: 6, step: 1 } },
  },
};

export const Standard = {};

export const Inverted = {
  args: {
    value: "+$120",
    fillColor: "black",
    strokeColor: "red",
    textColor: "white",
  },
};
