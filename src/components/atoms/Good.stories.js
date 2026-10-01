import Good from "@/components/atoms/Good";

export default {
  title: "Atoms/Good",
  component: Good,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    text: "G",
  },
};

export const Standard = {};

export const Colored = {
  args: { color: "yellow" },
};
