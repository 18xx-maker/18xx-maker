import Value from "@/components/atoms/Value";

export default {
  title: "Atoms/Value",
  component: Value,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    value: 30,
  },
};

export const Standard = {};

export const Large = {
  args: { value: 120 },
};

export const Colored = {
  args: { color: "yellow", textColor: "black" },
};
