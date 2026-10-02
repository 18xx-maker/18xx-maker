import City from "@/components/atoms/City";

import { colorSelect, rotation } from "../../../.storybook/controls";

export default {
  title: "Atoms/City",
  component: City,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    size: 1,
    border: false,
    width: 25,
    strokeWidth: 2,
  },
  argTypes: {
    size: { control: { type: "select" }, options: [1, 2, 3, 4, 5, 6] },
    border: { control: "boolean" },
    pass: { control: "boolean" },
    extend: { control: { type: "select" }, options: ["", "left", "right"] },
    width: { control: { type: "range", min: 15, max: 40, step: 1 } },
    strokeWidth: { control: { type: "range", min: 0, max: 6, step: 1 } },
    borderWidth: { control: { type: "range", min: 0, max: 12, step: 1 } },
    rotation,
    color: colorSelect(),
    outlineColor: colorSelect(),
    borderColor: colorSelect(),
    bgColor: colorSelect(),
    name: { control: "object" },
    companies: { control: "object" },
    icons: { control: "object" },
  },
};

export const Single = {};

export const Double = {
  args: { size: 2 },
};

export const Triple = {
  args: { size: 3 },
};

export const Quad = {
  args: { size: 4 },
};

export const Five = {
  args: { size: 5 },
};

export const Six = {
  args: { size: 6 },
};

export const Colored = {
  args: { color: "orange", outlineColor: "red" },
};

export const Named = {
  args: { name: { name: "Albany" } },
};

export const NamedReversed = {
  args: { size: 2, name: { name: "Baltimore", reverse: true } },
};

export const Pass = {
  args: { pass: true },
};

export const WithCompanies = {
  args: {
    size: 2,
    companies: [{}, "B&O"],
    rotation: 0,
    name: { name: "Baltimore" },
  },
};

export const WithIcons = {
  args: { icons: ["boat"] },
};

export const Border = {
  args: { border: true },
};
