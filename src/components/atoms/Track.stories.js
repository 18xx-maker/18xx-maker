import Track from "@/components/atoms/Track";

import { colorSelect } from "../../../.storybook/controls";

const types = [
  "straight",
  "straightLeft",
  "straightRight",
  "straightStop",
  "straightGentleHalf",
  "gentle",
  "gentleInner",
  "gentleOuter",
  "gentleHalf",
  "gentleStop",
  "gentleHalfRev",
  "gentleStopRev",
  "sharp",
  "sharpInner",
  "sharpOuter",
  "sharpStop",
  "sharpStopRev",
  "mid",
  "stub",
  "stop",
  "bent",
  "offboard",
];

const fraction = { control: { type: "range", min: 0, max: 1, step: 0.05 } };

export default {
  title: "Atoms/Track",
  component: Track,
  parameters: {
    layout: "centered",
    svg: true,
  },
  args: {
    type: "straight",
    border: false,
    width: 12,
  },
  argTypes: {
    type: { control: { type: "select" }, options: types },
    gauge: {
      control: { type: "select" },
      options: ["", "narrow", "dual"],
    },
    border: { control: "boolean" },
    width: { control: { type: "range", min: 4, max: 30, step: 1 } },
    borderWidth: { control: { type: "range", min: 0, max: 12, step: 1 } },
    start: fraction,
    end: fraction,
    trackOffset: { control: { type: "range", min: -30, max: 30, step: 1 } },
    radiusOffset: { control: { type: "range", min: -30, max: 30, step: 1 } },
    color: colorSelect(),
    borderColor: colorSelect(),
    gaugeColor: colorSelect(),
    bgColor: colorSelect(),
    path: { control: "text" },
  },
};

export const Straight = {};

export const Gentle = {
  args: { type: "gentle" },
};

export const Sharp = {
  args: { type: "sharp" },
};

export const Partial = {
  args: { type: "gentle", start: 0.25, end: 0.75 },
};

export const Offset = {
  args: { type: "straight", trackOffset: 17 },
};

export const Stub = {
  args: { type: "stub" },
};

export const Offboard = {
  args: { type: "offboard" },
};

export const NarrowGauge = {
  args: { gauge: "narrow" },
};

export const Dual = {
  args: { gauge: "dual" },
};

export const Colored = {
  args: { color: "red" },
};

export const Border = {
  args: { border: true, borderWidth: 4 },
};

export const BorderColored = {
  args: { border: true, borderColor: "yellow" },
};
