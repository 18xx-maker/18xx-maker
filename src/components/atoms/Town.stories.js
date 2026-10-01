import Town from "@/components/atoms/Town";

export default {
  title: "Atoms/Town",
  component: Town,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    border: true,
  },
};

export const Standard = {};

export const WithoutBorder = {
  args: { border: false },
};

export const WideBorder = {
  args: { borderWidth: 6 },
};

export const Named = {
  args: { name: { name: "Dunwich" } },
};
