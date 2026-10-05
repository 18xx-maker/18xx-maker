import Cutlines from "@/components/Cutlines";

import { tileSheet } from "@/stories/frames";

export default {
  title: "Print/Cutlines",
  component: Cutlines,
  decorators: [tileSheet],
  parameters: {
    layout: "centered",
    // The cut lines between hexes on an 850 by 1100 sheet of tiles
    svg: { width: 510, height: 660, viewBox: "0 0 850 1100" },
  },
  args: { width: 150 },
  argTypes: {
    width: { control: { type: "range", min: 100, max: 200, step: 10 } },
  },
};

export const Offset = {};

export const Small = {
  args: { width: 100 },
};
