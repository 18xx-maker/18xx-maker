import MapCompanyToken from "@/components/tokens/MapCompanyToken";

import { colorSelect } from "../../../.storybook/controls.js";

export default {
  title: "Tokens/MapCompanyToken",
  component: MapCompanyToken,
  parameters: {
    layout: "centered",
    svg: { width: 400, height: 400, viewBox: "-40 -40 80 80" },
  },
  args: {
    company: { abbrev: "BLRR", color: "black" },
    width: 25,
  },
  argTypes: {
    company: {
      control: { type: "object" },
      description: "A company: abbrev, color, logo and token overrides",
    },
    color: colorSelect(),
    width: { control: { type: "range", min: 10, max: 35, step: 1 } },
    rotation: { control: { type: "range", min: 0, max: 330, step: 30 } },
    bleed: { control: { type: "boolean" } },
    reserved: { control: { type: "boolean" } },
    inverse: { control: { type: "boolean" } },
  },
};

export const Standard = {};

export const Colored = {
  args: { company: { abbrev: "LBRR", color: "lightBlue" } },
};

export const Logo = {
  args: { company: { abbrev: "NYC", color: "black", logo: "1830/NYC" } },
};
