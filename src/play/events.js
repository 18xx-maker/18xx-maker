const id = (v) => typeof v === "string" && v.length > 0;
const rotation = (v) => Number.isInteger(v) && v >= 0 && v <= 5;
const num = (v) => typeof v === "number" && Number.isFinite(v);
const int = (v) => Number.isInteger(v);
const place = (v) => v === "bank" || id(v);
const cell = (v) =>
  typeof v === "object" &&
  v !== null &&
  !Array.isArray(v) &&
  Object.keys(v).length === 2 &&
  int(v.row) &&
  int(v.col);

const SPECS = {
  "tile.place": { hex: id, tile: id, rotation },
  "tile.rotate": { hex: id, rotation },
  "tile.remove": { hex: id },
  "token.place": { hex: id, token: id, x: num, y: num },
  "token.remove": { hex: id, token: id, x: num, y: num },
  "market.move": { marker: id, cell },
  "tray.move": { item: id, from: place, to: place },
  "note.set": {
    text: (v) => typeof v === "string" && v.length <= 10000,
  },
  undo: { target: (v) => int(v) && v >= 1 },
};

export const EVENT_TYPES = Object.keys(SPECS);

export function validateEvent(event) {
  if (typeof event !== "object" || event === null || Array.isArray(event))
    return "event must be an object";
  const spec = Object.hasOwn(SPECS, event.type) ? SPECS[event.type] : null;
  if (!spec) return "unknown event type";
  for (const key of Object.keys(event)) {
    if (key !== "type" && !Object.hasOwn(spec, key))
      return `unexpected property ${key}`;
  }
  for (const [key, check] of Object.entries(spec)) {
    if (!check(event[key])) return `invalid ${key}`;
  }
  return null;
}
