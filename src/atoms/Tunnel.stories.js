import { ascend, identity, keys, path, sort } from "ramda";

import Tunnel from "@/atoms/Tunnel";
import { mapThemes } from "@/data";

const colors = sort(ascend(identity), keys(path(["gmt", "colors"], mapThemes)));

export default {
  title: "Atoms/Tunnel",
  component: Tunnel,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    cost: 10,
    opacity: 1.0,
    borderWidth: 2,
    dashed: false,
    reverse: false,
  },
  argTypes: {
    borderWidth: {
      control: { type: "number", min: 1 },
    },
    opacity: {
      control: { type: "range", min: 0, max: 1, step: 0.05 },
    },
    color: {
      control: { type: "select" },
      options: colors,
    },
  },
};

export const Standard = {};

export const Dashed = {
  args: {
    dashed: true,
  },
};

export const Reversed = {
  args: {
    reverse: true,
  },
};

export const Colored = {
  args: {
    color: "water",
  },
};
