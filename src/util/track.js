import { chain, compose, defaultTo, propOr, sort, subtract, uniq } from "ramda";

const sideMod = (side) => {
  return side > 6 ? side - 6 : side;
};

export const sidesFromTrack = (track) => {
  if (!track) {
    return [];
  }

  let side = track.side || 1;

  switch (track.type) {
    case "custom":
      return propOr([], "sides", track);
    case "mid":
      return [];
    case "sharp":
      return [side, sideMod(side + 1)];
    case "gentle":
      return [side, sideMod(side + 2)];
    case "straight":
    case "bent":
      return [side, sideMod(side + 3)];
    case "offboard":
    case "stub":
    case "stop":
    case "straightStop":
    case "gentleStop":
    case "gentleStopRev":
    case "sharpStop":
    case "sharpStopRev":
    default:
      return [side];
  }
};

export const sidesFromTile = compose(
  uniq,
  sort(subtract),
  chain(sidesFromTrack),
  propOr([], "track"),
  defaultTo([]),
);

const rotateSides = (sides) => sides.map((s) => (s % 6) + 1);

// Rotate a tile so its track lines up with the tile above it (die cuts print
// track bleeding onto the neighbor): if the tile above has track on its bottom
// (side 1) we need track on our top (side 4), otherwise none. `matches` is
// false when no rotation can do it.
export const alignSides = (pastSides, currentSides) => {
  let rotation = 0;
  let sides = currentSides;
  const has = (side) => sides.includes(side);

  if (pastSides.includes(1)) {
    if (has(1) && has(4)) {
      // Nothing
    } else if (has(2) && has(5)) {
      rotation = 120;
      sides = rotateSides(rotateSides(sides));
    } else if (has(3) && has(6)) {
      rotation = 60;
      sides = rotateSides(sides);
    } else {
      while (!has(4)) {
        rotation += 60;
        sides = rotateSides(sides);
        if (rotation >= 360) {
          break;
        }
      }
    }
    return { rotation, sides, matches: has(4) };
  }

  while (has(4)) {
    rotation += 60;
    sides = rotateSides(sides);
    if (rotation >= 360) {
      break;
    }
  }
  return { rotation, sides, matches: !has(4) };
};
