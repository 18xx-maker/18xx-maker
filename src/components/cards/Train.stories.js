import { createElement } from "react";

import Train from "@/components/cards/Train";
import { card } from "@/components/storyFrames";

import { colorSelect } from "../../../.storybook/controls";

const color = colorSelect();

// The trains of 1889, the longevity notes look the other trains up
const trains = [
  { name: "2", quantity: 6, price: 80, rust: "4", color: "yellow" },
  { name: "3", quantity: 5, price: 180, rust: "6", color: "green" },
  { name: "4", quantity: 4, price: 300, rust: "D", color: "green" },
  { name: "5", quantity: 3, price: 450, color: "brown" },
  { name: "6", quantity: 2, price: 630, color: "brown" },
  { name: "D", quantity: "∞", price: 1100, color: "brown" },
];
const names = ["", ...trains.map((t) => t.name)];
const trainName = { control: "select", options: names };

export default {
  title: "Cards/Train",
  component: Train,
  decorators: [card],
  parameters: { layout: "centered", game: "1889" },
  // The component takes one train object, so the controls are its fields
  render: ({ trains, ...train }) => createElement(Train, { train, trains }),
  args: {
    trains,
    name: "2",
    price: 80,
    color: "yellow",
  },
  argTypes: {
    trains: { control: "object" },
    name: { control: "text" },
    price: { control: { type: "number", min: 0, step: 10 } },
    tradeInPrice: { control: { type: "number", min: 0, step: 10 } },
    color,
    backgroundColor: color,
    permanentColor: color,
    description: { control: "text" },
    players: { control: "text" },
    variant: { control: "text" },
    rust: trainName,
    obsolete: trainName,
    phased: trainName,
    permanent: { control: "boolean" },
    nameFontSize: { control: { type: "range", min: 12, max: 60, step: 2 } },
    priceFontSize: { control: { type: "range", min: 8, max: 36, step: 2 } },
    image: { control: "select", options: ["", "2T", "3T", "4T", "6T"] },
  },
};

// No longevity: the train is permanent
export const Permanent = {};

export const Rusts = {
  args: { name: "3", price: 180, color: "green", rust: "6" },
};

export const Obsolete = {
  args: { name: "4", price: 300, color: "green", obsolete: "D" },
};

export const Phased = {
  args: { name: "5", price: 450, color: "brown", phased: "6" },
};

export const TradeIn = {
  args: {
    name: "D",
    price: 1100,
    color: "brown",
    tradeInPrice: 800,
    description: "Cost ¥800 when trading in a 4T, 5T or 6T",
  },
};

export const Players = {
  args: { players: "3-4 players", description: "Only in the short game" },
};

export const WithImages = {
  parameters: { printConfig: { trains: { images: true } } },
};

export const TextStyle = {
  parameters: { printConfig: { trains: { style: "text" } } },
};
