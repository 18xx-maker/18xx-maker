const colors = {
  plain: "rgb(255,254,242)",
  yellow: "rgb(254,241,4)",
  green: "rgb(95,180,121)",
  brown: "rgb(191,125,85)",
  gray: "rgb(191,191,191)",
  blue: "rgb(103,168,198)",
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
