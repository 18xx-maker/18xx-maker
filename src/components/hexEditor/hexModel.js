import { equals, omit } from "ramda";

import { autoPosition, hasPositioning } from "@/components/Position";

import { sidesFromTrack } from "@/util/tiles/track";

// What the hex editor does with a hex (a group of the map or a tile), without
// a component. Every change gives a new hex and leaves the one it was given
// alone. What the editor does not know stays where it is: unknown keys, the
// order of the keys, items that are text or a number. A change writes only
// what it was given (never a default), and one that changes nothing gives the
// same object back. Only a list the editor itself empties is dropped.

// The elements of a hex that are a list of objects, in the order the editor
// lists them
export const LIST_KEYS = [
  "track",
  "cities",
  "mediumCities",
  "towns",
  "centerTowns",
  "boomtowns",
  "labels",
  "values",
  "names",
  "icons",
  "terrain",
  "tokens",
  "shapes",
  "goods",
  "industries",
  "companies",
  "bridges",
  "tunnels",
  "tunnelEntrances",
  "borders",
  "routeBonuses",
  "divides",
];

// The elements that are one object
export const SINGLE_KEYS = ["offBoardRevenue"];

export const ELEMENT_KEYS = [...LIST_KEYS, ...SINGLE_KEYS];

// What an element the editor adds starts with: a valid element the map can
// draw, with the properties the schema asks for and nothing more
export const NEW_ELEMENT = {
  track: { side: 1, type: "straight" },
  cities: {},
  mediumCities: {},
  towns: {},
  centerTowns: {},
  boomtowns: {},
  labels: { label: "A" },
  values: { value: 10 },
  names: { name: "Name" },
  icons: { type: "flag" },
  terrain: { type: "mountain" },
  shapes: { type: "circle" },
  goods: { text: "G" },
  industries: { top: "Coal" },
  companies: { label: "A" },
  bridges: { cost: 20 },
  tunnels: { cost: 20 },
  tunnelEntrances: { side: 1 },
  borders: { side: 1, color: "red" },
  routeBonuses: { value: "+10" },
  divides: { side: 1 },
  offBoardRevenue: { revenues: [{ color: "yellow", value: 20 }] },
};

export const ADDABLE_KEYS = Object.keys(NEW_ELEMENT);

export const isSingle = (key) => SINGLE_KEYS.includes(key);

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

// What the key holds as a list: the game may write one element without a list
const listOf = (hex, key) => {
  const value = hex?.[key];
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
};

// The elements of the hex as { key, index, element }, in the order of
// ELEMENT_KEYS
export const elementsOf = (hex) =>
  ELEMENT_KEYS.flatMap((key) =>
    listOf(hex, key).map((element, index) => ({ key, index, element })),
  );

export const countOf = (hex, key) => listOf(hex, key).length;

export const elementAt = (hex, key, index) => listOf(hex, key)[index];

// The property a text or number element stands for, when an edit has to turn
// it into an object
const SHORT = { labels: "label", values: "value", names: "name" };

const asObject = (key, element) => {
  if (isObject(element)) return element;
  if (element === undefined || element === null) return {};
  return SHORT[key] ? { [SHORT[key]]: element } : {};
};

// The key keeps its place when the hex has it, else it goes last
const withKey = (hex, key, value) => ({ ...hex, [key]: value });

const withoutKey = (hex, key) =>
  Object.fromEntries(Object.entries(hex).filter(([name]) => name !== key));

// Whether an element of the hex is held as a list (an element written alone
// stays alone)
const inList = (hex, key) => Array.isArray(hex?.[key]);

// The hex with an element added at the end of its list (an element that is
// one object is replaced)
export const addElement = (hex, key, element) => {
  if (isSingle(key)) return withKey(hex, key, element);
  return withKey(hex, key, [...listOf(hex, key), element]);
};

// The hex with the element at the index replaced
export const replaceElement = (hex, key, index, element) => {
  const list = listOf(hex, key);
  if (index < 0 || index >= list.length) return hex;
  if (equals(list[index], element)) return hex;
  if (!inList(hex, key)) return withKey(hex, key, element);
  return withKey(
    hex,
    key,
    list.map((item, i) => (i === index ? element : item)),
  );
};

// The hex with a property of an element set, or dropped when the value is
// undefined. A text or number element becomes an object only when it has to.
export const setElementKey = (hex, key, index, field, value) => {
  const list = listOf(hex, key);
  if (index < 0 || index >= list.length) return hex;
  const element = list[index];
  if (value === undefined && !(isObject(element) && field in element)) {
    return hex;
  }
  const object = asObject(key, element);
  const next =
    value === undefined
      ? Object.fromEntries(
          Object.entries(object).filter(([name]) => name !== field),
        )
      : { ...object, [field]: value };
  return replaceElement(hex, key, index, next);
};

// The hex without the element at the index, and without the list when that
// was its last element
export const removeElement = (hex, key, index) => {
  const list = listOf(hex, key);
  if (index < 0 || index >= list.length) return hex;
  const rest = list.filter((_, i) => i !== index);
  return rest.length === 0 || !inList(hex, key)
    ? withoutKey(hex, key)
    : withKey(hex, key, rest);
};

// The hex with the element moved to another place of its list
export const moveElement = (hex, key, from, to) => {
  const list = listOf(hex, key);
  const target = Math.max(0, Math.min(list.length - 1, to));
  if (from < 0 || from >= list.length || from === target) return hex;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(target, 0, item);
  return withKey(hex, key, next);
};

// The hex with a copy of the element after it
export const duplicateElement = (hex, key, index) => {
  if (isSingle(key)) return hex;
  const list = listOf(hex, key);
  if (index < 0 || index >= list.length) return hex;
  const next = [...list];
  next.splice(index + 1, 0, structuredClone(list[index]));
  return withKey(hex, key, next);
};

// The hex with a property of the hex itself set, or dropped for undefined
export const setHexKey = (hex, field, value) => {
  if (value === undefined) {
    return field in hex ? withoutKey(hex, field) : hex;
  }
  return equals(hex[field], value) ? hex : withKey(hex, field, value);
};

// Sides: 1 to 6, side 1 at the bottom of a hex that is not turned and the
// others going on clockwise

export const SIDES = [1, 2, 3, 4, 5, 6];

export const normalizeSide = (side) => ((((side - 1) % 6) + 6) % 6) + 1;

export const rotateSide = (side, steps) => normalizeSide(side + steps);

// The sides a track touches: its side, and the one it turns to when its type
// is a curve or a straight (a stub or an offboard track ends inside the hex)
export const trackEnds = (track) =>
  sidesFromTrack(track).filter(
    (side) => Number.isInteger(side) && side >= 1 && side <= 6,
  );

// The side and type of the track that joins two sides, or null for the same
// side. A curve turns the same way from its side: the one that joins 5 to 4
// starts on 4.
export const trackBetween = (a, b) => {
  if (a === b) return null;
  const turn = (((b - a) % 6) + 6) % 6;
  if (turn === 3) return { side: a, type: "straight" };
  if (turn === 1) return { side: a, type: "sharp" };
  if (turn === 2) return { side: a, type: "gentle" };
  if (turn === 5) return { side: b, type: "sharp" };
  return { side: b, type: "gentle" };
};

// The track with the sides it touches changed: two sides make the track that
// joins them, one side moves the start of the track
export const setTrackEnds = (track, ends) => {
  const given = isObject(track) ? track : {};
  if (given.type === "custom" && ends.length === 1) {
    return { ...given, sides: [...ends] };
  }
  // A custom track lists its sides: they are stale when the type changes
  const object = given.type === "custom" ? omit(["sides"], given) : given;
  if (ends.length >= 2) {
    const joined = trackBetween(ends[0], ends[1]);
    return joined ? { ...object, ...joined } : object;
  }
  if (ends.length === 1) return { ...object, side: ends[0] };
  return object;
};

// Whether a track joins or touches the side
export const touchesSide = (track, side) => trackEnds(track).includes(side);

// The hex with a track added between two sides
export const addTrack = (hex, a, b) => {
  const joined = trackBetween(a, b);
  return joined ? addElement(hex, "track", joined) : hex;
};

// The sides listed by removeBorders (true is all of them)
export const removedSides = (hex) => {
  const value = hex?.removeBorders;
  if (value === true) return [...SIDES];
  return Array.isArray(value) ? value : [];
};

// The hex with a side added to removeBorders or taken from it
export const toggleRemovedBorder = (hex, side) => {
  const sides = removedSides(hex);
  const next = sides.includes(side)
    ? sides.filter((s) => s !== side)
    : [...sides, side];
  if (next.length === 0) return setHexKey(hex, "removeBorders", undefined);
  return setHexKey(hex, "removeBorders", next);
};

// Turning the hex: every side of it, and the angle of the elements that sit
// by an angle, turn by the steps (60 degrees each, clockwise). An element
// placed by x and y has no angle to turn and stays.
export const rotateHex = (hex, steps) => {
  const turn = ((steps % 6) + 6) % 6;
  if (turn === 0) return hex;

  const rotateItem = (item) => {
    if (!isObject(item)) return item;
    let next = item;
    if (typeof item.side === "number") {
      next = { ...next, side: rotateSide(item.side, turn) };
    }
    if (typeof item.angle === "number") {
      next = { ...next, angle: (item.angle + turn * 60) % 360 };
    }
    return next;
  };

  const result = {};
  for (const [key, value] of Object.entries(hex)) {
    if (key === "removeBorders" && Array.isArray(value)) {
      result[key] = value.map((s) => rotateSide(s, turn));
    } else if (ELEMENT_KEYS.includes(key) && Array.isArray(value)) {
      result[key] = value.map(rotateItem);
    } else if (ELEMENT_KEYS.includes(key) && isObject(value)) {
      result[key] = rotateItem(value);
    } else {
      result[key] = value;
    }
  }
  return equals(result, hex) ? hex : result;
};

// The elements that sit by x and y, and so can be dragged
export const DRAGGABLE_KEYS = [
  "cities",
  "mediumCities",
  "towns",
  "centerTowns",
  "boomtowns",
  "labels",
  "values",
  "names",
  "icons",
  "terrain",
  "shapes",
  "goods",
  "industries",
  "companies",
  "offBoardRevenue",
];

const tenth = (n) => Math.round(n * 10) / 10;

// The kinds of element the map places by itself when they have no position,
// as Position.jsx names them
const AUTO_TYPE = {
  icons: "icon",
  labels: "label",
  terrain: "terrain",
  values: "value",
};

// The element as the map places it: with its automatic angle and percent when
// it has no position of its own
const placed = (hex, key, element, index) => {
  const type = AUTO_TYPE[key];
  if (!type || !isObject(element) || hasPositioning(element)) return element;
  return autoPosition(element, index, hex, type);
};

// Elements that share the center are spread a little so each can be picked
const spreadOf = (item, index) => {
  const percent = typeof item.percent === "number" ? item.percent : 0;
  if (percent !== 0 || item.x || item.y) return { x: 0, y: 0 };
  return { x: (index % 3) * 14 - 14, y: Math.floor(index / 3) * 14 };
};

// The hex with an element moved by (dx, dy) in the frame of the hex, from
// where the editor shows it: its x and y change by the same, whatever else
// places it (a side, an angle and a percent add to x and y). An element the
// map places by itself is given the place it has. Written to a tenth. A move
// of nothing gives the same hex.
export const dragElement = (hex, key, index, dx, dy) => {
  const element = elementAt(hex, key, index);
  if (!DRAGGABLE_KEYS.includes(key) || element === undefined) return hex;
  const start = placed(hex, key, element, index);
  const item = isObject(start) ? start : {};
  const spread = spreadOf(item, index);
  const x = tenth((typeof item.x === "number" ? item.x : 0) + spread.x + dx);
  const y = tenth((typeof item.y === "number" ? item.y : 0) + spread.y + dy);
  let next = hex;
  for (const field of ["angle", "percent"]) {
    if (start !== element && start[field] !== undefined) {
      next = setElementKey(next, key, index, field, start[field]);
    }
  }
  next = setElementKey(next, key, index, "x", x || undefined);
  return setElementKey(next, key, index, "y", y || undefined);
};

// Geometry, in the frame of a hex 150 across the flats, centered on 0

// The point at a distance from the center towards a side. The hex turns by the
// orientation (90 for a map with vertical hexes).
export const sidePoint = (side, orientation = 0, distance = 75) => {
  const angle = (((side - 1) * 60 + orientation) * Math.PI) / 180;
  return { x: -distance * Math.sin(angle), y: distance * Math.cos(angle) };
};

// Where an element sits, as the map places it (src/components/Position.jsx):
// by x and y, an angle and a percent of the way to the edge, or a side. The
// automatic places of labels and values (and of the icons and terrain that
// share a hex with a city) are not repeated here, the center stands for them.
export const elementPoint = (
  key,
  element,
  index,
  orientation = 0,
  hex = undefined,
) => {
  const given = isObject(element) ? element : {};
  const item = hex ? placed(hex, key, given, index) : given;
  if (key === "track") {
    const ends = trackEnds(item);
    if (ends.length === 0) return { x: 0, y: 0 };
    const points = ends.map((side) => sidePoint(side, orientation, 38));
    return {
      x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
      y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
    };
  }
  let angle = typeof item.angle === "number" ? item.angle : 0;
  let percent = typeof item.percent === "number" ? item.percent : 0;
  if (
    typeof item.side === "number" &&
    typeof item.angle !== "number" &&
    typeof item.percent !== "number" &&
    key !== "cities" &&
    key !== "towns" &&
    key !== "centerTowns"
  ) {
    angle = (item.side - 1) * 60 + orientation;
    percent = key === "borders" || key === "divides" ? 1 : 0.7;
  }
  const x = typeof item.x === "number" ? item.x : 0;
  const y = typeof item.y === "number" ? item.y : 0;
  const t = 75 * percent;
  const radians = (angle * Math.PI) / 180;
  const point = { x: x - t * Math.sin(radians), y: y + t * Math.cos(radians) };
  const spread = spreadOf(item, index);
  point.x += spread.x;
  point.y += spread.y;
  return point;
};
