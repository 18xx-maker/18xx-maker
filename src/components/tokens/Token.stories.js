import { createElement as h } from "react";

import { keys, sortBy } from "ramda";

import Token from "@/components/tokens/Token";

import ColorContext from "@/context/ColorContext";
import { icons, logos } from "@/data";
import { colorSelect } from "../../../.storybook/controls.js";

const logoIds = sortBy((id) => id, keys(logos));
const iconIds = sortBy((id) => id, keys(icons));

const number = (min, max, step = 1) => ({
  control: { type: "range", min, max, step },
});
const colors = { control: { type: "object" } };
const pair = ["blue", "orange"];

export default {
  title: "Tokens/Token",
  component: Token,
  // Tokens use the company colors, as they do on the map
  decorators: [
    (Story) => h(ColorContext.Provider, { value: "companies" }, h(Story)),
  ],
  parameters: {
    layout: "centered",
    svg: { width: 400, height: 400, viewBox: "-40 -40 80 80" },
  },
  args: {
    label: "AA",
    color: "orange",
    width: 25,
  },
  argTypes: {
    label: { control: { type: "text" } },
    color: colorSelect(),
    labelColor: colorSelect(),
    labelStrokeColor: colorSelect(),
    labelStrokeWidth: number(0, 3, 0.5),
    labelY: number(-20, 20),
    fontSize: number(4, 30),
    width: number(10, 35),
    rotation: number(0, 330, 30),
    shapeAngle: number(0, 330, 15),
    bleed: { control: { type: "boolean" } },
    destination: { control: { type: "boolean" } },
    reserved: { control: { type: "boolean" } },
    inverse: { control: { type: "boolean" } },
    fixed: { control: { type: "boolean" } },
    outline: colorSelect(),
    outlineWidth: number(0, 5, 0.5),
    tokenShape: { control: { type: "select" }, options: ["circle", "square"] },
  },
};

export const Standard = {};

export const Bar = {
  args: { label: "AA2", bar: true, barHeight: 20 },
  argTypes: {
    bar: { control: { type: "boolean" } },
    barHeight: number(5, 50),
    barBorderColor: colorSelect(),
  },
};

export const ColoredBar = {
  args: { label: "FF", bar: "blue" },
  argTypes: { bar: colorSelect() },
};

export const Square = {
  args: { label: "BB", square: "blue" },
  argTypes: { square: colorSelect() },
};

export const Quarters = {
  args: {
    label: "CC",
    bar: true,
    quarters: ["blue", "orange", "orange", "blue"],
  },
  argTypes: { quarters: colors },
};

export const Halves = {
  args: { label: "DD", bar: true, halves: pair },
  argTypes: { halves: colors },
};

export const Sexies = {
  args: { label: "KK", bar: true, sexies: pair },
  argTypes: { sexies: colors },
};

export const Sunrise = {
  args: { label: "LL", bar: true, sunrise: ["blue", "orange", "yellow"] },
  argTypes: { sunrise: colors },
};

export const Hexagram = {
  args: { label: "MM", bar: true, hexagram: pair },
  argTypes: { hexagram: colors },
};

export const Stripe = {
  args: { label: "GG", bar: true, color: "blue", stripe: "orange" },
  argTypes: { stripe: colorSelect(), stripeWidth: number(1, 30) },
};

export const Stripes = {
  args: {
    label: "EE",
    color: "blue",
    stripes: "orange",
    stripesWidth: 10,
    stripesDistance: 6,
  },
  argTypes: {
    stripes: colorSelect(),
    stripesWidth: number(1, 30),
    stripesDistance: number(0, 25),
  },
};

export const CurvedStripes = {
  args: { label: "JJ", bar: true, color: "blue", curvedStripes: "orange" },
  argTypes: {
    curvedStripes: colorSelect(),
    curvedStripesWidth: number(1, 30),
    curvedStripesDistance: number(0, 25),
  },
};

export const Spiral = {
  args: { label: "NN", color: "blue", spiral: "orange", bar: true },
  argTypes: {
    spiral: colorSelect(),
    spiralWidth: number(1, 10, 0.5),
    spiralDistance: number(1, 25),
  },
};

export const Target = {
  args: { label: "HH", bar: true, color: "blue", target: "orange" },
  argTypes: { target: colorSelect() },
};

export const Circle = {
  args: { label: "OO", color: "blue", circle: "white" },
  argTypes: {
    circle: colorSelect(),
    circleRadius: number(1, 30),
    circleBorderColor: colorSelect(),
  },
};

export const Shield = {
  args: { label: "PP", shield: "white", shieldTop: "blue" },
  argTypes: { shield: colorSelect(), shieldTop: colorSelect() },
};

export const Shield3 = {
  args: {
    label: "QQ",
    shield3: "white",
    shield3TopLeft: "red",
    shield3TopCenter: "white",
    shield3TopRight: "blue",
  },
  argTypes: {
    shield3: colorSelect(),
    shield3TopLeft: colorSelect(),
    shield3TopCenter: colorSelect(),
    shield3TopRight: colorSelect(),
  },
};

export const KiteShield = {
  args: { label: "RR", kiteshield: "white", labelY: 0 },
  argTypes: { kiteshield: colorSelect() },
};

export const Star5 = {
  args: { label: "SS", star5: "white", labelY: 0 },
  argTypes: { star5: colorSelect() },
};

export const Icon = {
  args: { label: "TT", icon: "boat" },
  argTypes: {
    icon: { control: { type: "select" }, options: iconIds },
    iconColor: colorSelect(),
    iconWidth: number(5, 50),
    iconY: number(-50, 20),
  },
};

export const Logo = {
  args: { logo: "1830/NYC" },
  argTypes: {
    logo: { control: { type: "select" }, options: logoIds },
    logoWidth: number(10, 60),
    iconColor: colorSelect(),
  },
};

export const Destination = {
  args: { label: "DEST", destination: true, width: undefined },
};

export const Reserved = { args: { label: "RES", reserved: true } };

export const Inverse = {
  args: { label: "INV", inverse: true, inverseLabelColor: "red" },
  argTypes: { inverseLabelColor: colorSelect() },
};

export const SquareToken = { args: { label: "SQ", tokenShape: "square" } };

export const Bleed = { args: { label: "PR", bleed: true } };
