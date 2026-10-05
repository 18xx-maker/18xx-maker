import Private from "@/components/cards/Private";

import { card } from "@/stories/frames";
import { colorSelect } from "../../../.storybook/controls";

const color = colorSelect();

export default {
  title: "Cards/Private",
  component: Private,
  decorators: [card],
  parameters: {
    layout: "centered",
    game: "1889",
  },
  args: {
    name: "Takamatsu E-Railroad",
    price: 20,
    revenue: 5,
    hex: "K4",
    description: "Blocks Takamatsu (K4).",
  },
  argTypes: {
    name: { control: "text" },
    price: { control: { type: "number", min: 0, step: 10 } },
    revenue: { control: { type: "number", min: 0, step: 5 } },
    bid: { control: { type: "number", min: 0, step: 5 } },
    id: { control: "text" },
    note: { control: "text" },
    description: { control: "text" },
    variant: { control: "text" },
    hex: { control: "text" },
    tile: { control: "text" },
    icon: { control: "text" },
    iconColor: color,
    company: { control: "text" },
    token: { control: "object" },
    backgroundColor: color,
    fontColor: color,
    nameColor: color,
    idColor: color,
    idBackgroundColor: color,
    priceColor: color,
    revenueColor: color,
    nameFontSize: { control: { type: "range", min: 6, max: 24, step: 1 } },
    descFontSize: { control: { type: "range", min: 4, max: 14, step: 0.5 } },
    players: { control: "object" },
    minPlayers: { control: { type: "number", min: 1, max: 7 } },
    maxPlayers: { control: { type: "number", min: 1, max: 7 } },
  },
};

// A private with a hex from the map
export const Hex = {};

export const Tile = {
  args: {
    name: "Mitsubishi Ferry",
    price: 30,
    revenue: 5,
    hex: undefined,
    tile: "437",
    description:
      "Player owner may place the port tile on a coastal town (B11, G10, I12, or J9) without a tile on it already.",
  },
};

export const Icon = {
  args: {
    name: "Sumitomo Mines Railway",
    price: 50,
    revenue: 15,
    hex: undefined,
    icon: "mountain",
    description:
      "Owning corporation may ignore building cost for mountain hexes which do not also contain rivers.",
  },
};

export const Token = {
  args: {
    name: "Champlain & St. Lawrence",
    price: 30,
    revenue: 10,
    bid: 20,
    hex: undefined,
    token: { circle: "yellow", label: "$" },
    description: "",
  },
};

export const Company = {
  args: {
    name: "Awa Railroad",
    price: 120,
    revenue: 20,
    hex: undefined,
    company: "AR",
    description: "Comes with the president's certificate of the Awa Railroad.",
  },
};

// A range of revenue values and the player count restriction
export const RevenueOptionsAndPlayers = {
  args: {
    revenue: [10, 20],
    id: "P2",
    note: "Auction on turn one",
    players: [
      { number: 2 },
      { number: 3 },
      { number: 4 },
      { number: 5 },
      { number: 6 },
    ],
    minPlayers: 3,
    maxPlayers: 5,
  },
};

export const Colored = {
  args: {
    backgroundColor: "red",
    fontColor: "white",
    idBackgroundColor: "black",
    id: "R1",
  },
};

// The printed style where the hex or icon moves beside the description
export const BigStyle = {
  parameters: { printConfig: { privates: { style: "big" } } },
};
