import { COORD_PATTERN } from "@/util/hexEdit";
import { alphaToInt, toAlpha } from "@/util/map";

// Moves a whole game on the map: every coordinate of every map variation (and
// what refers to a hex) changes by one row or column. A coordinate is letters
// and a number (B12): the letters are the row (y), the number the column (x).
// Pixel positions (the trackers, the market, the players) are not coordinates
// and stay.

const PREFIXED = /^([A-Z]+)([0-9]+)(.*)$/;

// The step of a button, in columns (x) and rows (y). A horizontal map is
// turned on the page, so its buttons change the other axis.
export const moveDelta = (direction, horizontal = false) => {
  const step = {
    up: { dx: 0, dy: -1 },
    down: { dx: 0, dy: 1 },
    left: { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 },
  }[direction];
  return horizontal ? { dx: step.dy, dy: step.dx } : step;
};

const join = (x, y) => (x < 1 || y < 1 ? null : `${toAlpha(y)}${x}`);

// A coordinate moved, null when it would leave the map (below A or 1). Takes
// a name or an array [x, y] and gives the same kind.
export const shiftCoord = (coord, dx, dy) => {
  if (Array.isArray(coord)) {
    const x = coord[0] + dx;
    const y = coord[1] + dy;
    return x < 1 || y < 1 ? null : [x, y];
  }
  if (typeof coord !== "string" || !COORD_PATTERN.test(coord)) return null;
  const [, letters, number] = coord.match(PREFIXED);
  return join(Number(number) + dx, alphaToInt(letters) + dy);
};

// A coordinate with a suffix (B16p4, A17a30p0.6) moved, the suffix is kept
const shiftPrefixed = (text, dx, dy) => {
  const found = typeof text === "string" && text.match(PREFIXED);
  if (!found) return null;
  const moved = join(Number(found[2]) + dx, alphaToInt(found[1]) + dy);
  return moved && `${moved}${found[3]}`;
};

const eachBorder = (list) => (Array.isArray(list) ? list : []);

// The column and row of every coordinate the map fields hold
const mapPoints = (map) => {
  const points = [];
  const add = (x, y) => points.push([x, y]);
  const read = (text) => {
    const found = typeof text === "string" && text.match(PREFIXED);
    if (found) add(Number(found[2]), alphaToInt(found[1]));
  };
  (map.hexes ?? []).forEach((group) => {
    (group.hexes ?? []).forEach((coord) =>
      Array.isArray(coord) ? add(coord[0], coord[1]) : read(coord),
    );
    if (typeof group.copy === "string") read(group.copy);
  });
  (map.remove ?? []).forEach(read);
  [map.borders, map.lines, map.removeBorders].forEach((list) =>
    eachBorder(list).forEach((item) => (item?.coords ?? []).forEach(read)),
  );
  eachBorder(map.borderTexts).forEach((item) => read(item?.coord));
  return points;
};

const mapsOf = (game) =>
  [game.map].flat().filter((map) => map && typeof map === "object");

// The smallest column and row of the map fields (Infinity when there are none)
export const shiftBounds = (game) => {
  const points = mapsOf(game).flatMap(mapPoints);
  return {
    minX: Math.min(...points.map(([x]) => x)),
    minY: Math.min(...points.map(([, y]) => y)),
    any: points.length > 0,
  };
};

// Only the map fields decide: the references stay when they cannot move
export const canShift = (game, dx, dy) => {
  const { minX, minY, any } = shiftBounds(game);
  return any && (dx >= 0 || minX + dx >= 1) && (dy >= 0 || minY + dy >= 1);
};

const mapOver = (list, fn) => (Array.isArray(list) ? list.map(fn) : list);

const shiftMap = (map, dx, dy) => {
  const coord = (c) => shiftCoord(c, dx, dy) ?? c;
  const item = (it) =>
    it && it.coords
      ? {
          ...it,
          coords: it.coords.map((c) => shiftPrefixed(c, dx, dy) ?? c),
        }
      : it;
  const next = { ...map };
  if (map.hexes)
    next.hexes = map.hexes.map((group) => ({
      ...group,
      ...(group.hexes && { hexes: group.hexes.map(coord) }),
      ...(typeof group.copy === "string" && { copy: coord(group.copy) }),
    }));
  if (map.remove) next.remove = mapOver(map.remove, coord);
  ["borders", "lines", "removeBorders"].forEach((key) => {
    if (map[key]) next[key] = mapOver(map[key], item);
  });
  if (map.borderTexts)
    next.borderTexts = mapOver(map.borderTexts, (it) =>
      it && typeof it.coord === "string"
        ? { ...it, coord: shiftPrefixed(it.coord, dx, dy) ?? it.coord }
        : it,
    );
  return next;
};

// The game moved, and how many coordinates that are not map fields were left
// as they are: a reference that would leave the map and a token label that
// looks like a coordinate
const apply = (game, dx, dy) => {
  let left = 0;
  const ref = (value) => {
    if (typeof value !== "string" || !COORD_PATTERN.test(value)) return value;
    const moved = shiftCoord(value, dx, dy);
    if (moved === null) left += 1;
    return moved ?? value;
  };
  const next = { ...game };
  if (game.map) {
    next.map = Array.isArray(game.map)
      ? game.map.map((map) => (map ? shiftMap(map, dx, dy) : map))
      : shiftMap(game.map, dx, dy);
  }
  if (game.privates)
    next.privates = game.privates.map((p) =>
      p && p.hex !== undefined ? { ...p, hex: ref(p.hex) } : p,
    );
  if (game.companies)
    next.companies = game.companies.map((company) => {
      if (!company) return company;
      const out = { ...company };
      if (company.home !== undefined)
        out.home = Array.isArray(company.home)
          ? company.home.map(ref)
          : ref(company.home);
      if (company.destination !== undefined)
        out.destination = ref(company.destination);
      if (Array.isArray(company.tokens))
        company.tokens.forEach((token) => {
          if (typeof token === "string" && COORD_PATTERN.test(token)) left += 1;
        });
      return out;
    });
  return { game: next, left };
};

// The game with every map coordinate moved by dx columns and dy rows, the
// same game when a map field would leave the map
export const shiftGame = (game, dx, dy) =>
  canShift(game, dx, dy) ? apply(game, dx, dy).game : game;

// How many coordinates a move leaves as they are (see apply)
export const countLeft = (game, dx, dy) => apply(game, dx, dy).left;
