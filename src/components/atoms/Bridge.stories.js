import Bridge from "@/components/atoms/Bridge";

export default {
  title: "Atoms/Bridge",
  component: Bridge,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    cost: 20,
  },
};

export const Standard = {};

export const Expensive = {
  args: { cost: 120 },
};
