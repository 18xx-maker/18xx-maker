import TunnelEntrance from "@/components/atoms/TunnelEntrance";

import { colorSelect } from "../../../.storybook/controls";

export default {
  title: "Atoms/TunnelEntrance",
  component: TunnelEntrance,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    border: false,
    size: 15,
  },
  argTypes: {
    border: { control: "boolean" },
    size: { control: { type: "range", min: 8, max: 30, step: 1 } },
    color: colorSelect(),
    trackColor: colorSelect(),
    borderColor: colorSelect(),
  },
};

export const Standard = {};

export const Colored = {
  args: { color: "orange", trackColor: "red" },
};

export const Large = {
  args: { size: 25 },
};

export const Border = {
  args: { border: true },
};
