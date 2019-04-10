// Color Scheme default setting
const scheme = "gmt";

// Height and width of paper in SVG units without print margins
const paper = {
  width: 800, // 0.25in side margins
  height: 1025 // 0.25in top and 0.50in bottom margins
};

// equal: evenly divide the item into pages
// max: make the two end pages even, the others are full
const pagination = "equal";

// If true don't use tokens as map home locations,
// just display in black and white
const plainMapHomes = false;

// If true don't use tokens as map destination locations,
// just display in black and white
const plainMapDestinations = false;

// This can be "left" to get bands of color with circles on the left, or
// "center" for the tokens in the center
const shareLayout = "left";

// How to display map coordinates
// outside: On the outside border of the map
// inside: Inside each hex
// edge: Along the edge of the map
// none: No map coordinates
const coords = "outside";

// Stock market font settings
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

// What alpha digits to use for coordinates
const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export {
  alpha,
  coords,
  market,
  pagination,
  paper,
  scheme,
  plainMapHomes,
  plainMapDestinations,
  shareLayout
};
