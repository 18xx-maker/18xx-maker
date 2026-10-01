import Label from "@/components/atoms/Label";

export default {
  title: "Atoms/Label",
  component: Label,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    label: "B",
  },
};

export const Short = {};

export const Medium = {
  args: { label: "NYC" },
};

export const Long = {
  args: { label: "Chicago Terminal" },
};
