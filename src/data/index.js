const colors = {
  // Hexes
  plain: "rgb(252,241,222)",
  yellow: "rgb(255,231,16)",
  green: "rgb(92,174,115)",
  brown: "rgb(179,123,84)",
  gray: "rgb(165,170,170)",
  // Terrain
  mountain: "rgb(179,123,84)",
  water: "rgb(101,161,184)",
  offboard: "rgb(209,35,42)",
  // Colors
  blue: "rgb(101,161,184)",
  orange: "rgb(245,129,33)",
  black: "rgb(0,0,0)",
  white: "rgb(255,255,255)",
  // Track
  track: "rgb(0,0,0)",
  border: "rgb(255,255,255)",
  city: "rgb(255,255,255)",
  // Misc
  text: "rgb(0,0,0)"
};

const companies = {
  green: "rgb(50,118,63)",
  black: "rgb(0,0,0)",
  red: "rgb(209,35,42)",
  blue: "rgb(2,90,170)",
  cyan: "rgb(141,215,248)",
  yellow: "rgb(255,231,16)",
  orange: "rgb(245,129,33)",
  maroon: "rgb(96,23,44)"
};

const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const textColor = color => {
  switch (color) {
    case "yellow":
      return "rgb(0,0,0)";
    default:
      return "rgb(255,255,255)";
  }
};

export { alpha, colors, companies, textColor };
