import { HEX_RATIO } from "./map.js";
import { alignSides, sidesFromTile } from "./track.js";

export const getTileSheetContext = (layout, paper, hexWidth) => {
  let c = { layout, paper, hexWidth };

  // Hardcode hexWidth for the layouts corresponding to dies
  switch (layout) {
    case "die":
      c.hexWidth = 150;
      break;
    case "smallDie":
      c.hexWidth = 106.25;
      break;
    default:
      break;
  }

  // Usable Height and Width on the chosen paper
  c.pageWidth = paper.width - paper.margins * 2;
  c.pageHeight = paper.height - paper.margins * 2;

  // The height of a tile
  c.height = c.hexWidth;
  c.bleedHeight = c.hexWidth + 20;

  // The width of a tile
  c.width = c.height * HEX_RATIO * 2;
  c.bleedWidth = c.bleedHeight * HEX_RATIO * 2;

  // How many tiles per row
  c.perRow = 4;
  c.rowsPerPage = 6;

  // Functions to help find tile locations
  c.getXindex = (n) => n % c.perRow;
  c.getYindex = (n) => Math.floor(n / c.perRow);
  c.isOdd = (n) => c.getYindex(n) % 2 !== 0;

  // Layout specific values
  switch (layout) {
    case "die":
      c.perRow = 4;
      c.rowsPerPage = 6;
      c.perPage = c.perRow * c.rowsPerPage;
      c.pageWidth = 800;
      c.pageHeight = 1050;
      c.clipPath = "hexBleedClipPath";

      // The die spaces columns apart by 0.25 inches
      c.tileOffsetX = c.width + 25;
      c.tileOffsetY = c.height;

      // Functions to help find tile locations
      c.getXindex = (n) => Math.floor(n / c.rowsPerPage);
      c.getYindex = (n) => n % c.rowsPerPage;

      // Extra space around the page
      c.extraX = (c.pageWidth - c.perRow * c.width - (c.perRow - 1) * 25) / 2;
      c.extraY = 25 + 37.5; // Half inch above the pins, rest below

      // Functions to get coordinates
      c.getX = (n) => c.width / 2 + c.extraX + c.getXindex(n) * c.tileOffsetX;
      c.getY = (n) => c.height / 2 + c.extraY + c.getYindex(n) * c.tileOffsetY;
      break;
    case "smallDie":
      c.perRow = 7;
      c.rowsPerPage = 9;
      c.perPage = 60;
      c.pageWidth = 800;
      c.pageHeight = 1050;
      c.clipPath = "hexBleedClipPath";

      // The die spaces columns apart by -0.0994 inches
      c.tileOffsetX = c.width - 9.94;
      c.tileOffsetY = c.height;

      // Functions to help find tile locations
      c.getXindex = (n) => {
        let group = Math.floor(n / 17);
        let index = n % 17;

        return group * 2 + (index > 8 ? 1 : 0);
      };

      c.getYindex = (n) => {
        let index = n % 17;

        return index > 8 ? index - 9 : index;
      };

      // Extra space around the page
      c.extraX = (c.pageWidth - 5.5 * c.width - 20.73 * 6) / 2;
      c.extraY = 25 + 37.5; // Half inch above the pins, rest below

      // Functions to get coordinates
      c.getX = (n) => c.width / 2 + c.extraX + c.getXindex(n) * c.tileOffsetX;
      c.getY = (n) => {
        let xIndex = c.getXindex(n);

        if (xIndex % 2 === 0) {
          return c.height / 2 + c.extraY + c.getYindex(n) * c.tileOffsetY;
        } else {
          return (
            c.height / 2 +
            c.extraY +
            c.getYindex(n) * c.tileOffsetY +
            0.5 * c.height
          );
        }
      };
      break;
    case "individual":
      c.perRow = Math.floor((c.pageWidth + 12.5) / (c.width + 12.5));
      c.rowsPerPage = Math.floor((c.pageHeight + 12.5) / (c.height + 12.5));
      c.perPage = c.perRow * c.rowsPerPage;
      c.clipPath = "hexClipPath";

      c.gapX = 12.5;
      c.gapY = 12.5;

      c.tileOffsetX = c.width + 12.5;
      c.tileOffsetY = c.height + 12.5;

      // Extra space around the page
      c.extraX =
        (c.pageWidth - c.perRow * c.width - (c.perRow - 1) * c.gapX) / 2;
      c.extraY =
        (c.pageHeight -
          c.rowsPerPage * c.height -
          (c.rowsPerPage - 1) * c.gapY) /
        2;

      // Functions to get coordinates
      c.getX = (n) =>
        c.bleedWidth / 2 + c.extraX + c.getXindex(n) * c.tileOffsetX;
      c.getY = (n) => c.height / 2 + c.extraY + c.getYindex(n) * c.tileOffsetY;
      break;
    case "offset":
      c.perRow = Math.floor((c.pageWidth - 20 - c.width / 2) / c.width);
      c.rowsPerPage = Math.floor((c.pageHeight - 20) / c.height);
      c.perPage = c.perRow * c.rowsPerPage;

      // Offset tiles are always offset by their plain width and height, regardless of bleed
      c.tileOffsetX = c.width;
      c.tileOffsetY = c.height;

      // Extra space around the page
      c.extraX = (c.pageWidth - c.perRow * c.width - c.width / 2 - 20) / 2;
      c.extraY = (c.pageHeight - c.rowsPerPage * c.height - 20) / 2;

      // Functions to get coordinates
      c.getX = (n) => {
        if (c.isOdd(n)) {
          return (
            c.bleedWidth / 2 +
            c.extraX +
            c.width / 2 +
            c.getXindex(n) * c.tileOffsetX
          );
        } else {
          return c.bleedWidth / 2 + c.extraX + c.getXindex(n) * c.tileOffsetX;
        }
      };
      c.getY = (n) =>
        c.bleedHeight / 2 + c.extraY + c.getYindex(n) * c.tileOffsetY;
      break;
    default:
      break;
  }

  return c;
};

// Die layouts print each column of tiles with bleed running into the next tile,
// so track must meet track. Rotation alone can't always do it (a tile with
// track on one side can't follow one with none), so when a tile can't line up
// with the one above it, swap in a later tile from the same group that can.
// `above(page, i)` returns the tile printed directly above position i, if any.
export const reorderForBleed = (page, groupOf, above) => {
  const result = [...page];
  const placed = [];

  for (let i = 0; i < result.length; i++) {
    if (result[i] === null) {
      placed.push([]);
      continue;
    }

    if (above(result, i)) {
      const fits = (tile) =>
        alignSides(placed[i - 1], sidesFromTile(tile)).matches;

      if (!fits(result[i])) {
        const j = result.findIndex(
          (tile, k) =>
            k > i && tile && groupOf(tile) === groupOf(result[i]) && fits(tile),
        );
        if (j > -1) {
          [result[i], result[j]] = [result[j], result[i]];
        }
      }
    }

    // Same rotation the page applies when it renders the tile
    const sides = sidesFromTile(result[i]);
    const past = placed[i - 1] || [];
    placed.push(past.length > 0 ? alignSides(past, sides).sides : sides);
  }

  return result;
};

// Offset tiles sit on a triangular lattice (every neighbor is one tile width
// away), and each tile's bleed reaches into the gaps it shares with them.
// Where two bleeds overlap the later tile would paint over the earlier one, so
// every tile's bleed stops halfway to each neighbor it actually has.
// Directions, in order: east, south east, south west, west, north west,
// north east (SVG y points down).
const OFFSET_BLEED = [
  [-86.6025, 0],
  [-92.376, -9.999995337],
  [-54.84825, -75],
  [-43.30125, -75],
  [-37.52775, -85],
  [37.52775, -85],
  [43.30125, -75],
  [54.84825, -75],
  [92.376, -9.999995337],
  [86.6025, 0],
  [92.376, 9.999995337],
  [54.84825, 75],
  [43.30125, 75],
  [37.52775, 85],
  [-37.52775, 85],
  [-43.30125, 75],
  [-54.84825, 75],
  [-92.376, 9.999995337],
];
const HALF_SPACING = 86.6025;
const SQRT3_2 = Math.sqrt(3) / 2;
const OFFSET_DIRECTIONS = [
  [1, 0],
  [0.5, SQRT3_2],
  [-0.5, SQRT3_2],
  [-1, 0],
  [-0.5, -SQRT3_2],
  [0.5, -SQRT3_2],
];

// Which of the six neighbors of position i on an offset page hold a tile
export const offsetNeighbors = (c, page, i) => {
  const row = c.getYindex(i);
  const col = c.getXindex(i);
  const odd = c.isOdd(i);
  const cells = [
    [row, col + 1],
    [row + 1, odd ? col + 1 : col],
    [row + 1, odd ? col : col - 1],
    [row, col - 1],
    [row - 1, odd ? col : col - 1],
    [row - 1, odd ? col + 1 : col],
  ];

  return cells.map(
    ([r, k]) => r >= 0 && k >= 0 && k < c.perRow && !!page[r * c.perRow + k],
  );
};

// The offset bleed outline, cut flat halfway to each neighbor in `neighbors`
export const offsetBleedPoints = (neighbors) => {
  let poly = OFFSET_BLEED;

  neighbors.forEach((has, d) => {
    if (!has) return;
    const [ux, uy] = OFFSET_DIRECTIONS[d];
    const dist = ([x, y]) => x * ux + y * uy - HALF_SPACING;
    const out = [];

    poly.forEach((p, k) => {
      const q = poly[(k + 1) % poly.length];
      const dp = dist(p);
      const dq = dist(q);
      if (dp <= 0) out.push(p);
      if (dp < 0 !== dq < 0 && dp !== 0 && dq !== 0) {
        const t = dp / (dp - dq);
        out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
      }
    });

    poly = out;
  });

  return poly;
};

export const offsetBleedId = (neighbors) =>
  `hexBleedClipPathOffset-${neighbors.map((n) => (n ? 1 : 0)).join("")}`;
