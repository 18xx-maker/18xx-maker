import City from "@/components/atoms/City";

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
  },
  argTypes: {
    size: {
      control: { type: "select" },
      options: [1, 2, 3, 4],
    },
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

export const Named = {
  args: { name: { name: "Albany" } },
};

export const Border = {
  args: { border: true },
};
