import Legend from "@/components/Legend";

import { colorSelect } from "../../.storybook/controls";

export default {
  title: "Print/Legend",
  component: Legend,
  parameters: {
    layout: "centered",
    // The legend draws a circle and its description to the right of the origin
    svg: { width: 700, height: 200, viewBox: "-60 -20 700 200" },
  },
  args: {
    color: "yellow",
    description: "Shares do not count toward the certificate limit",
    borderWidth: 2,
    right: false,
    bottom: false,
  },
  argTypes: {
    color: colorSelect(),
    borderColor: colorSelect(),
    description: { control: "text" },
    borderWidth: { control: { type: "range", min: 0, max: 8, step: 1 } },
    right: { control: "boolean" },
    bottom: { control: "boolean" },
    fontSize: { control: { type: "range", min: 8, max: 28, step: 1 } },
    fontFamily: {
      control: "select",
      options: ["sans-serif", "display", "serif", "monospace"],
    },
    fontWeight: { control: "select", options: ["normal", "bold"] },
  },
};

export const Standard = {};

export const Orange = {
  args: { color: "orange", description: "Players may own more than 60%" },
};

// Aligned to the right of the origin, as on the right side of a market
export const Right = {
  args: { right: true },
  parameters: { svg: { viewBox: "-640 -20 700 200" } },
};

export const Bottom = {
  args: { bottom: true },
  parameters: { svg: { viewBox: "-60 -160 700 200" } },
};
