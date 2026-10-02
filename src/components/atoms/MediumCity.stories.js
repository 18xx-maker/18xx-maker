import MediumCity from "@/components/atoms/MediumCity";

import { colorSelect } from "../../../.storybook/controls";

export default {
  title: "Atoms/MediumCity",
  component: MediumCity,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    border: false,
    width: 22,
    strokeWidth: 1,
    fillOpacity: 1,
  },
  argTypes: {
    border: { control: "boolean" },
    name: { control: "object" },
    color: colorSelect(),
    fillColor: colorSelect(),
    strokeColor: colorSelect(),
    outlineColor: colorSelect(),
    outlineStroke: colorSelect(),
    width: { control: { type: "range", min: 12, max: 40, step: 1 } },
    strokeWidth: { control: { type: "range", min: 0, max: 6, step: 1 } },
    outlineStrokeWidth: { control: { type: "range", min: 0, max: 8, step: 1 } },
    fillOpacity: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    strokeDashArray: { control: "text" },
  },
};

export const Standard = {};

export const Colored = {
  args: { color: "orange", name: { name: "Austin" } },
};

export const Reversed = {
  args: { name: { name: "Boston", reverse: true } },
};

export const Dashed = {
  args: { strokeDashArray: "3 3", strokeWidth: 2 },
};

export const Border = {
  args: { border: true },
};
