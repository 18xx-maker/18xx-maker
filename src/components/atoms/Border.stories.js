import Border from "@/components/atoms/Border";

import { colorSelect } from "../../../.storybook/controls";

export default {
  title: "Atoms/Border",
  component: Border,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    color: "water",
    dashed: false,
  },
  argTypes: {
    color: colorSelect(),
    dashed: { control: "boolean" },
    width: { control: { type: "range", min: 4, max: 40, step: 2 } },
    offset: { control: { type: "range", min: -20, max: 20, step: 1 } },
  },
};

export const Standard = {};

export const Dashed = {
  args: { dashed: true, width: 16 },
};

export const Offset = {
  args: { dashed: true, width: 16, offset: 8 },
};

export const Offboard = {
  args: { color: "offboard" },
};
