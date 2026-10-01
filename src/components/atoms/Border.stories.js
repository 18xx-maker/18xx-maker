import Border from "@/components/atoms/Border";

export default {
  title: "Atoms/Border",
  component: Border,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    color: "water",
    width: 16,
    dashed: false,
  },
};

export const Standard = {};

export const Dashed = {
  args: { dashed: true },
};

export const Offset = {
  args: { dashed: true, offset: 8 },
};
