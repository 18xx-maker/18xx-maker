import * as tinycolor from "tinycolor2";

// Color Scheme default setting
const scheme = "gmt";

// Height and width of paper in SVG units without print margins
const paper = {
  width: 800, // 0.25in side margins
  height: 1025 // 0.25in top and 0.50in bottom margins
};

// This can also be "max"
// equal: evenly divide the item into pages
// max: make the two end pages even, the others are full
const pagination = "equal";

// How to display map coordinates
// outside: On the outside border of the map
// inside: Inside each hex
// edge: Along the edge of the map
// none: No map coordinates
const coords = "outside";

const fonts = ["Bitter:700", "Limelight"];

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

export {
  alpha,
  coords,
  fonts,
  market,
  pagination,
  paper,
  scheme
};
