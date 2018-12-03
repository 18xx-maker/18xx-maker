import * as tinycolor from "tinycolor2";

const DTG_colors = {
  // Tiles
  yellow: "rgb(100% 100% 0%)",
  green: "rgb(0% 60% 0%)",
  brown: "rgb(70% 45% 4%)",
  gray: "rgb(60% 60% 60%)",

  // Terrain
  plain: "rgb(100% 100% 100%)",
  mountain: "rgb(70% 85% 100%)",
  water: "rgb(46% 77% 94%)",
  offboard: "rgb(83% 0% 0%)",

  // Track
  track: "rgb(0,0,0)",
  border: "rgb(255,255,255)",
  city: "rgb(255,255,255)",
  halt: "rgb(40% 40% 40%)",

  // Misc
  text: "rgb(0,0,0)",
  white: "rgb(255,255,255)",

  // Companies
  black: "rgb(0,0,0)",
  blue: "rgb(10% 40% 80%)",
  cyan: "rgb(50% 50% 80%)",
  darkGreen: "rgb(0% 40% 0%)",
  lightGreen: "rgb(75% 85% 65%)",
  maroon: "rgb(96,23,44)",
  orange: "rgb(100% 55% 0%)",
  red: "rgb(83% 0% 0%)",
  pink: "rgb(193,60,125)",
  purple: "rgb(58% 52% 74%)"
  // yellow: Same as tile yellow
};

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
  halt: "rgb(102,102,102)",

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
  purple: "rgb(95,35,132)",
  goldenrod: "rgb(218, 165, 32)",
  lightYellow: "rgb(255, 255, 224)",
  // yellow: Same as tile yellow

  // Trains
  train_yellow: "rgb(241, 231, 141)",
  train_green: "rgb(165,211,167)",
  train_blue: "rgb(148, 205, 235)",
  train_brown: "rgb(204, 170, 144)",
  train_red: "rgb(231, 103, 113)",
  train_gray: "rgb(180, 180, 180)",
  train_purple: "rgb(202, 161, 221)"
};

// Height and width of paper in SVG units without print margins
const paper = {
  width: 800, // 0.25in side margins
  height: 1025 // 0.25in top and 0.50in bottom margins
};

const fonts = ["Bitter:700", "Limelight"]

const market = {
  fontSize: "0.15in",
  fontWeight: "bold",
  fontFamily: "Bitter, serif",
  arrow: {
    fontSize: "0.15in",
    fontWeight: "bold",
    fontFamily: "Bitter, serif"
  },
  par: {
    fontSize: "0.15in",
    fontWeight: "bold",
    fontFamily: "Bitter, serif",
    width: "2in",
    height: "0.67in"
  }
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

export { alpha, colors, paper, market, fonts, textColor, strokeColor };
