import { createElement } from "react";

import Currency from "@/components/Currency";

export default {
  title: "Print/Currency",
  component: Currency,
  parameters: {
    layout: "centered",
    game: "1889",
    svg: { width: 400, height: 100, viewBox: "0 0 200 50" },
  },
  // Wraps the value in the currency of the game, when the config formats
  // that kind of value. Numbers only, text is printed as is.
  render: (args) =>
    createElement(
      "text",
      { x: 10, y: 30, fontSize: 24, fontFamily: "display" },
      createElement(Currency, args),
    ),
  args: { value: 1100, type: "train" },
  argTypes: {
    value: { control: { type: "number", min: 0, step: 10 } },
    format: { control: "text" },
    type: {
      control: "select",
      options: [
        "train",
        "market",
        "offboard",
        "par",
        "revenue",
        "value",
        "bank",
        "border",
        "capital",
        "private",
        "share",
        "terrain",
        "token",
        "treasury",
      ],
    },
  },
};

export const Train = {};

// Not formatted in the default config
export const Market = {
  args: { type: "market" },
};

// Text values are printed as they are
export const Text = {
  args: { value: "Free" },
};

// A format string beats the game currency and the config
export const Format = {
  args: { value: 1100, format: "#G" },
};
