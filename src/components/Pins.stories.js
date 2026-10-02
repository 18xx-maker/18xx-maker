import Pins from "@/components/Pins";

export default {
  title: "Print/Pins",
  component: Pins,
  parameters: {
    layout: "centered",
    // The pin holes of a page, 50 wide and 800 tall when landscape
    svg: { width: 200, height: 640, viewBox: "0 0 50 800" },
  },
  args: {
    landscape: true,
    config: {
      innerRadius: 6.25,
      outerRadius: 12.5,
      y: 25,
      x1: 100,
      x2: 700,
    },
  },
  argTypes: {
    landscape: { control: "boolean" },
    config: { control: "object" },
  },
};

export const Landscape = {};

export const Portrait = {
  args: { landscape: false },
  parameters: { svg: { width: 640, height: 200, viewBox: "0 0 800 50" } },
};
