import Market from "@/components/market/Market";
import { MarketStory } from "@/components/market/storyFrames";

// A trimmed market of 1889 with the par chart and legend below it
const twoD = {
  type: "2D",
  par: { values: [100, 90, 80] },
  display: {
    par: { x: 0, y: 5 },
    legend: { x: 5, y: 5 },
    roundTracker: { type: "row", x: 5, y: 8 },
  },
  legend: [
    {
      color: "yellow",
      description: "Shares do not count toward the certificate limit",
    },
    {
      color: "orange",
      description: "Players may own more than 60%",
    },
  ],
  market: [
    [
      { label: "75", arrow: "down" },
      80,
      90,
      { label: "100", par: true },
      110,
      125,
      140,
      155,
      175,
    ],
    [
      { label: "70", arrow: "down" },
      75,
      80,
      { label: "90", par: true },
      100,
      110,
      125,
      140,
      { label: "155", arrow: "up" },
    ],
    [
      { label: "65", arrow: "down" },
      70,
      75,
      { label: "80", par: true },
      90,
      100,
      110,
      { label: "125", arrow: "up" },
    ],
    [
      { label: "60", legend: 0, arrow: "down" },
      65,
      70,
      75,
      80,
      90,
      { label: "100", arrow: "up" },
    ],
    [
      { label: "50", legend: 1, arrow: "down" },
      { label: "60", legend: 0 },
      65,
      70,
      { label: "80", arrow: "up" },
    ],
  ],
};

// The start of the 1867 market, one row with a ledge around the open stocks
const oneD = {
  type: "1D",
  ledges: [
    {
      color: "hl4",
      dashed: true,
      width: 6,
      coords: ["4 0", "4 1", "10 1", "10 0", "4 0"],
    },
  ],
  legend: [
    { color: "hl1", description: "Minor companies may start here" },
    { color: "hl2", description: "Any company may start here" },
  ],
  market: [
    35,
    40,
    45,
    { value: 50, legend: 0 },
    { value: 55, legend: 0 },
    { value: 60, legend: 0 },
    { value: 65, legend: 0 },
    { value: 70, legend: 1 },
    { value: 80, legend: 1 },
    { value: 90, legend: 1 },
    { value: 100, legend: 1 },
    110,
    120,
    135,
  ],
};

// The same cells staggered over two rows, some pushed to the bottom
const oneDiag = {
  ...oneD,
  type: "1Diag",
  ledges: [],
  market: [
    ...oneD.market.slice(0, 7),
    { value: 70, legend: 1, bottom: true },
    ...oneD.market.slice(8),
  ],
};

// Ledges split the cells of 1861 into regions
const ledged = {
  type: "2D",
  title: false,
  legend: [],
  ledges: [
    {
      color: "hl4",
      dashed: true,
      width: 6,
      offset: -7,
      coords: ["2 0", "3 0", "3 3", "2 3", "2 0"],
    },
    { color: "black", width: 6, coords: ["3 0", "3 3"] },
  ],
  market: [
    [null, null, 135, 150, 165, { value: 180, color: "hl3" }, 200],
    [null, 110, 120, 135, { value: 150, color: "hl3" }, 165, 180],
    [90, 100, 110, { value: 120, color: "hl2" }, 135, 150, 165],
  ],
};

export default {
  title: "Market/Market",
  component: Market,
  render: MarketStory,
  parameters: {
    layout: "centered",
    game: "1889",
  },
  args: {
    stock: twoD,
    valuePosition: "top",
    displayTitle: true,
  },
  argTypes: {
    stock: { control: "object" },
    valuePosition: { control: "select", options: ["top", "bottom"] },
    arrowPosition: {
      control: "select",
      options: ["bottom", "top", "middle"],
    },
    showLegend: { control: "boolean" },
    showPar: { control: "boolean" },
    showRoundTracker: { control: "boolean" },
    displayTitle: { control: "boolean" },
  },
};

export const TwoD = {
  args: {
    arrowPosition: "bottom",
    showLegend: true,
    showPar: true,
    showRoundTracker: true,
  },
};

export const OneD = {
  args: { stock: oneD, showLegend: true },
};

export const OneDiag = {
  args: { stock: oneDiag, showLegend: true },
};

export const Ledges = {
  args: { stock: ledged },
};
