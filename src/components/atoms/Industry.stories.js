import Industry from "@/components/atoms/Industry";

export default {
  title: "Atoms/Industry",
  component: Industry,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    top: "Ore",
    bottom: "Coal",
  },
  argTypes: {
    top: { control: "text" },
    bottom: { control: "text" },
  },
};

export const Standard = {};

export const Short = {
  args: { top: "3", bottom: "Oil" },
};
