import Phase from "@/components/Phase";

import { phase } from "@/stories/frames";

// The phases and trains of 1889
const phases = [
  { name: "2", limit: 4, tiles: "yellow" },
  { name: "3", limit: 4, tiles: "green", buy_companies: true },
  { name: "4", limit: 3, tiles: "green", buy_companies: true },
  { name: "5", limit: 2, tiles: "brown", events: { close_companies: true } },
  { name: "6", limit: 2, tiles: "brown", notes: "D Trains available" },
  { name: "D", limit: 2, tiles: "brown" },
];
const trains = [
  { name: "2", quantity: 6, price: 80, rust: "4", color: "yellow" },
  { name: "3", quantity: 5, price: 180, rust: "6", color: "green" },
  { name: "4", quantity: 4, price: 300, rust: "D", color: "green" },
  { name: "5", quantity: 3, price: 450, color: "brown" },
  { name: "6", quantity: 2, price: 630, color: "brown" },
  { name: "D", quantity: "∞", price: 1100, color: "brown" },
];

export default {
  title: "Print/Phase",
  component: Phase,
  decorators: [phase],
  parameters: {
    layout: "centered",
    game: "1889",
    htmlSize: { width: 6.5, height: 2.5 },
  },
  args: {
    phases,
    trains,
    minor: false,
  },
  argTypes: {
    phases: { control: "object" },
    trains: { control: "object" },
    minor: { control: "boolean" },
    company: { control: "text" },
  },
};

export const Standard = {};

// The test game has obsolete and phased trains, and phases for minors only
export const Longevity = {
  args: {
    phases: [
      { name: "2", limit: 4, tiles: "yellow", minor: true },
      { name: "3", train: "3+1", limit: 4, tiles: "green", minor: true },
      { name: "2", limit: 4, tiles: "yellow" },
      { name: "3", train: "3+1", limit: 4, tiles: "green" },
      { name: "4", train: "4D", limit: 3, tiles: "brown" },
      { name: "8", train: "8E", limit: 2, tiles: "brown" },
      { name: "9", train: "8E", limit: 2, tiles: "gray", company: "AR" },
    ],
    company: "AR",
    trains: [
      { name: "2", quantity: 4, price: 80, color: "yellow", rust: "4D" },
      { name: "3+1", quantity: 3, price: 300, color: "green", obsolete: "8E" },
      { name: "4D", quantity: 2, price: 800, color: "brown", phased: "8E" },
      { name: "8E", quantity: "∞", price: 1100, color: "gray" },
    ],
  },
};

export const Minor = {
  args: { ...Longevity.args, minor: true, company: undefined },
};

export const NoTrains = {
  args: { trains: [] },
};
