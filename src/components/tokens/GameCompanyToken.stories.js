import GameCompanyToken from "@/components/tokens/GameCompanyToken";

const abbrevs = [
  "BLRR",
  "LBRR",
  "BRR",
  "NVRR",
  "BWRR",
  "GRRR",
  "GERR",
  "LVRR",
  "LRR",
  "BGRR",
  "GORR",
  "NRR",
  "ORR",
  "PRR",
  "VRR",
  "RRR",
  "LBRRR",
  "TRR",
  "WRR",
  "YRR",
];

export default {
  title: "Tokens/GameCompanyToken",
  component: GameCompanyToken,
  parameters: {
    layout: "centered",
    game: "18Test",
    svg: { width: 400, height: 400, viewBox: "-40 -40 80 80" },
  },
  args: {
    abbrev: "BLRR",
    width: 25,
  },
  argTypes: {
    abbrev: {
      control: { type: "select" },
      options: abbrevs,
      description: "A company abbrev from the loaded game (18Test)",
    },
    width: { control: { type: "range", min: 10, max: 35, step: 1 } },
    rotation: { control: { type: "range", min: 0, max: 330, step: 30 } },
    bleed: { control: { type: "boolean" } },
    destination: { control: { type: "boolean" } },
    reserved: { control: { type: "boolean" } },
    inverse: { control: { type: "boolean" } },
  },
};

export const Standard = {};

export const TokenOverrides = { args: { abbrev: "ORR" } };

export const Reserved = { args: { abbrev: "GERR", reserved: true } };

export const Destination = {
  args: { abbrev: "BRR", destination: true, width: undefined },
};

// An abbrev the game does not have renders a plain token
export const Unknown = { args: { abbrev: "XX", label: "XX", color: "red" } };
