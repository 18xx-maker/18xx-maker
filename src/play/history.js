import { getTile } from "../util/index.js";
import { effectiveEvents, usedTiles } from "./reduce.js";

// The seq an undo event would target: the newest event still in effect.
// An effective undo is a valid target (undoing it is a redo).
export function undoTarget(log) {
  const list = effectiveEvents(Array.isArray(log) ? log : []);
  return list.length ? list[list.length - 1].seq : null;
}

export function describeEvent(event, { seats = [] } = {}) {
  const seat = (Array.isArray(seats) ? seats : []).find(
    (s) => s && s.userId === event.userId,
  );
  const user =
    (seat && (seat.name || seat.username)) ||
    (event.userId !== undefined ? String(event.userId) : "");
  const params = { user };
  for (const key of [
    "hex",
    "tile",
    "rotation",
    "token",
    "x",
    "y",
    "marker",
    "item",
    "from",
    "to",
    "target",
    "text",
  ]) {
    if (event[key] !== undefined) params[key] = event[key];
  }
  if (event.cell) {
    params.row = event.cell.row;
    params.col = event.cell.col;
  }
  return { key: `play.events.${event.type}`, params };
}

export function supply(game, state) {
  const defs = (game && game.tiles) || {};
  const used = usedTiles(state);
  const tiles = {};
  for (const id of Object.keys(defs)) {
    const total = getTile({}, defs, id).quantity;
    const u = Object.hasOwn(used, id) ? used[id] : 0;
    tiles[id] = { total, used: u, left: total - u };
  }
  for (const [id, u] of Object.entries(used)) {
    if (!Object.hasOwn(tiles, id)) tiles[id] = { total: 0, used: u, left: -u };
  }
  const tokens = {};
  for (const list of Object.values(state.tokens)) {
    for (const { token } of list) {
      tokens[token] = { used: (tokens[token] ? tokens[token].used : 0) + 1 };
    }
  }
  return { tiles, tokens };
}
