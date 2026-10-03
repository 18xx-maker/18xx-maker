import CompanyToken from "@/components/tokens/CompanyToken";

import { colorSelect } from "../../../.storybook/controls.js";

export default {
  title: "Tokens/CompanyToken",
  component: CompanyToken,
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
    destination: { control: { type: "boolean" } },
    reserved: { control: { type: "boolean" } },
    inverse: { control: { type: "boolean" } },
  },
};

export const Standard = {};

export const TokenOverrides = {
  args: {
    company: {
      abbrev: "ORR",
      color: "orange",
      token: {
        bar: true,
        curvedStripes: "black",
        curvedStripesDistance: 19,
        stripe: "black",
        stripeWidth: "6.25",
      },
    },
  },
};

export const Logo = {
  args: { company: { abbrev: "NYC", color: "black", logo: "1830/NYC" } },
};

export const NoCompany = {
  args: { company: undefined, label: "AA", color: "orange" },
  argTypes: { label: { control: { type: "text" } } },
};
