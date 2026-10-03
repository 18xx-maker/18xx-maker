import { identity, keys, sortBy } from "ramda";

import Icon from "@/components/atoms/Icon";

import { icons } from "@/data";
import { colorSelect } from "../../../.storybook/controls";

export default {
  title: "Atoms/Icon",
  component: Icon,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    type: "boat",
    width: 25,
    noCircle: false,
  },
  argTypes: {
    type: {
      control: { type: "select" },
      options: sortBy(identity, keys(icons)),
    },
    width: { control: { type: "range", min: 15, max: 60, step: 1 } },
    noCircle: { control: "boolean" },
    color: colorSelect(),
    fillColor: colorSelect(),
    strokeColor: colorSelect(),
    strokeWidth: { control: { type: "range", min: 0, max: 8, step: 1 } },
  },
};

export const Standard = {};

export const Colored = {
  args: { color: "lightBlue" },
};

export const NoCircle = {
  args: { type: "cactus", noCircle: true },
};

export const CustomCircle = {
  args: {
    type: "bridge",
    fillColor: "yellow",
    strokeColor: "red",
    strokeWidth: 4,
  },
};
