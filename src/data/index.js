const colors = {
  plain: "rgb(252,241,222)",
  yellow: "rgb(255,231,16)",
  green: "rgb(92,174,115)",
  brown: "rgb(179,123,84)",
  gray: "rgb(165,170,170)",
  water: "rgb(101,161,184)",
  offboard: "rgb(216,34,42)",
  blue: "rgb(101,161,184)",
  orange: "rgb(245,129,33)",
  track: "rgb(0,0,0)",
  border: "rgb(255,255,255)",
  city: "rgb(255,255,255)",
  text: "rgb(0,0,0)",
  black: "rgb(0,0,0)",
  white: "rgb(255,255,255)"
};

const textColor = color => {
  switch (color) {
    case "yellow":
      return "rgb(0,0,0)";
    default:
      return "rgb(255,255,255)";
  }
};

export { colors, textColor };
