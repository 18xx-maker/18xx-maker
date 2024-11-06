import { compose, sort, chain, propOr, defaultTo, uniq, subtract } from "ramda";

const sideMod = side => {
  return side > 6 ? side - 6 : side;
};

export const sidesFromTrack = track => {
  if (!track) {
    return [];
  }

  let side = track.side || 1;

  switch(track.type) {
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

export const sidesFromTile = compose(uniq,
                                     sort(subtract),
                                     chain(sidesFromTrack),
                                     propOr([], "track"),
                                     defaultTo([]));
