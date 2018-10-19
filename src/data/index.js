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
  lightGreen: "rgb(110,192,55)",
  maroon: "rgb(96,23,44)",
  orange: "rgb(245,129,33)",
  red: "rgb(209,35,42)",
  pink: "rgb(193,60,125)",
  purple: "rgb(95,35,132)"
  // yellow: Same as tile yellow
};

// Height and width of paper in SVG units without print margins
const paper = {
  width: 800, // 0.25in side margins
  height: 1025 // 0.25in top and 0.50in bottom margins
};

const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const textColor = color => {
  let tc = tinycolor(colors[color]);
  return tinycolor.mostReadable(tc, ["white", "black"]).toRgbString();
};

const strokeColor = color =>
  tinycolor(colors[color])
    .darken(10)
    .toString();

export { alpha, colors, paper, textColor, strokeColor };
