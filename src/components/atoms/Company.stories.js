import Company from "@/components/atoms/Company";

import { colorSelect } from "../../../.storybook/controls";

export default {
  title: "Atoms/Company",
  component: Company,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    label: "A",
    bottom: false,
    reverse: false,
    radius: 6,
    left: 0,
    right: 0,
  },
  argTypes: {
    label: { control: "text" },
    bottom: { control: "boolean" },
    reverse: { control: "boolean" },
    radius: { control: { type: "range", min: 4, max: 14, step: 1 } },
    left: { control: { type: "range", min: 0, max: 60, step: 5 } },
    right: { control: { type: "range", min: 0, max: 60, step: 5 } },
    color: colorSelect(),
  },
};

export const Standard = {};

export const Wide = {
  args: { label: "CdH", left: 50, right: 50, color: "blue" },
};

export const Bottom = {
  args: { label: "C", left: 30, bottom: true },
};

export const Large = {
  args: { label: "ERR", color: "orange", radius: 8, bottom: true },
};

export const Reversed = {
  args: { label: "NYC", reverse: true },
};
