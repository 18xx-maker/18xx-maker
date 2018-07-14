import * as tinycolor from "tinycolor2";

const colors = {
  // Tiles
  yellow: "rgb(255,231,16)",
  green: "rgb(92,174,115)",
  brown: "rgb(179,123,84)",
  gray: "rgb(165,170,170)",

  // Terrain
  plain: "rgb(252,241,222)",
  mountain: "rgb(179,123,84)",
  water: "rgb(101,161,184)",
  offboard: "rgb(209,35,42)",

  // Track
  track: "rgb(0,0,0)",
  border: "rgb(255,255,255)",
  city: "rgb(255,255,255)",

  // Misc
  text: "rgb(0,0,0)",
  white: "rgb(255,255,255)",

  // Companies
  black: "rgb(0,0,0)",
  blue: "rgb(2,90,170)",
  cyan: "rgb(141,215,248)",
  darkGreen: "rgb(50,118,63)",
  maroon: "rgb(96,23,44)",
  orange: "rgb(245,129,33)",
  red: "rgb(209,35,42)",
  pink: "rgb(193,60,125)"
  // yellow: Same as tile yellow
};

// Height and width of paper in SVG units without print margins
const paper = {
  width: 800,
  height: 1025
};

const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const textColor = color => {
  switch (color) {
    case "yellow":
    case "cyan":
  case "plain":
    case "white":
      return "rgb(0,0,0)";
    default:
      return "rgb(255,255,255)";
  }
};

const strokeColor = color =>
  tinycolor(colors[color])
    .darken(10)
    .toString();

export { alpha, colors, paper, textColor, strokeColor };
