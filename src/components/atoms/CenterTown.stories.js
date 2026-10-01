import CenterTown from "@/components/atoms/CenterTown";

export default {
  title: "Atoms/CenterTown",
  component: CenterTown,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    border: false,
  },
};

export const Standard = {};

export const Large = {
  args: { size: 2 },
};

export const Wide = {
  args: { width: 30 },
};

export const Border = {
  args: { border: true },
};
