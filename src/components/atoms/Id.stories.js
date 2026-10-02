import Id from "@/components/atoms/Id";

import { colorSelect } from "../../../.storybook/controls";

export default {
  title: "Atoms/Id",
  component: Id,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    id: "57",
    extra: "",
    noID: false,
  },
  argTypes: {
    id: { control: "text" },
    displayID: { control: "text" },
    extra: { control: "text" },
    noID: { control: "boolean" },
    bgColor: colorSelect(),
  },
};

export const Standard = {};

export const Extra = {
  args: { extra: "NYC" },
};

export const Long = {
  args: { id: "X123456", extra: "Extra Text" },
};

export const DisplayID = {
  args: { id: "57", displayID: "57a" },
};

export const Hidden = {
  args: { noID: true },
};
