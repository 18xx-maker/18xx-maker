import Town from "@/components/atoms/Town";

export default {
  title: "Atoms/Town",
  component: Town,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    border: false,
  },
};

export const Standard = {};

export const Border = {
  args: { border: true },
};

export const WideBorder = {
  args: { border: true, borderWidth: 6 },
};

export const Named = {
  args: { name: { name: "Dunwich" } },
};
