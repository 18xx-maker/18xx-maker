import Charter from "@/components/Charter";

import { charter } from "@/stories/frames";
import { colorSelect } from "../../.storybook/controls";

// The phases, trains and turns of 1889
const phases = [
  { name: "2", limit: 4, rounds: 1, tiles: "yellow" },
  { name: "3", limit: 4, rounds: 2, tiles: "green", buy_companies: true },
  { name: "4", limit: 3, rounds: 2, tiles: "green", buy_companies: true },
  {
    name: "5",
    limit: 2,
    rounds: 3,
    tiles: "brown",
    events: { close_companies: true },
  },
  { name: "6", limit: 2, rounds: 3, tiles: "brown" },
  { name: "D", limit: 2, rounds: 3, tiles: "brown" },
];
const trains = [
  { name: "2", quantity: 6, price: 80, rust: "4", color: "yellow" },
  { name: "3", quantity: 5, price: 180, rust: "6", color: "green" },
  { name: "4", quantity: 4, price: 300, rust: "D", color: "green" },
  { name: "5", quantity: 3, price: 450, color: "brown" },
  { name: "6", quantity: 2, price: 630, color: "brown" },
  { name: "D", quantity: "∞", price: 1100, color: "brown" },
];
const turns = [
  {
    name: "Stock Round",
    steps: ["Buy one certificate", "Sell any number of certificates"],
    ordered: false,
  },
  {
    name: "Operating Round",
    steps: [
      "Lay or upgrade track",
      "Purchase a station",
      "Run trains",
      "Pay dividends or withhold revenue",
      "Purchase trains",
    ],
    ordered: true,
  },
];
const company = {
  name: "Awa Railroad",
  abbrev: "AR",
  logo: "1889/AR",
  color: "black",
  capital: 400,
};

export default {
  title: "Print/Charter",
  component: Charter,
  decorators: [charter],
  parameters: { layout: "centered", game: "1889" },
  args: {
    name: "Awa Railroad",
    color: "black",
    company,
    tokens: ["Free", 40],
    phases,
    trains,
    turns,
    minor: false,
    halfWidth: false,
  },
  argTypes: {
    name: { control: "text" },
    subtext: { control: "text" },
    variant: { control: "text" },
    color: colorSelect(),
    backgroundColor: colorSelect(),
    tokens: { control: "object" },
    company: { control: "object" },
    phases: { control: "object" },
    trains: { control: "object" },
    turns: { control: "object" },
    minor: { control: "boolean" },
    halfWidth: { control: "boolean" },
    fontSize: { control: { type: "range", min: 10, max: 40, step: 1 } },
    fontFamily: {
      control: "select",
      options: ["display", "serif", "sans-serif", "monospace"],
    },
  },
};

export const Color = {};

export const Carth = {
  args: { color: "red" },
  parameters: { printConfig: { charters: { style: "carth" } } },
};

export const Minor = {
  args: { minor: true, tokens: ["Free"] },
};

export const HalfWidth = {
  args: { halfWidth: true },
  parameters: { printConfig: { charters: { halfWidth: true } } },
};

export const WithoutPhaseChart = {
  parameters: {
    printConfig: { charters: { showPhaseChart: false, showTurnOrder: false } },
  },
};
