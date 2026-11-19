import { validateEvent } from "./events.js";

export const initialState = () => ({
  tiles: {},
  tokens: {},
  market: {},
  trays: {},
  notes: "",
});

const sameToken = (a, b) => a.token === b.token && a.x === b.x && a.y === b.y;

function applyEvent(state, e) {
  switch (e.type) {
    case "tile.place":
      return {
        ...state,
        tiles: {
          ...state.tiles,
          [e.hex]: { tile: e.tile, rotation: e.rotation },
        },
      };
    case "tile.rotate":
      if (!state.tiles[e.hex]) return state;
      return {
        ...state,
        tiles: {
          ...state.tiles,
          [e.hex]: { ...state.tiles[e.hex], rotation: e.rotation },
        },
      };
    case "tile.remove": {
      if (!state.tiles[e.hex]) return state;
      const tiles = { ...state.tiles };
      delete tiles[e.hex];
      return { ...state, tiles };
    }
    case "token.place":
      return {
        ...state,
        tokens: {
          ...state.tokens,
          [e.hex]: [
            ...(state.tokens[e.hex] || []),
            { token: e.token, x: e.x, y: e.y },
          ],
        },
      };
    case "token.remove": {
      const list = state.tokens[e.hex] || [];
      const i = list.findIndex((t) => sameToken(t, e));
      if (i < 0) return state;
      return {
        ...state,
        tokens: {
          ...state.tokens,
          [e.hex]: [...list.slice(0, i), ...list.slice(i + 1)],
        },
      };
    }
    case "market.move":
      return {
        ...state,
        market: {
          ...state.market,
          [e.marker]: { row: e.cell.row, col: e.cell.col },
        },
      };
    case "tray.move": {
      const trays = { ...state.trays };
      const from = trays[e.from] || [];
      const i = from.indexOf(e.item);
      if (i >= 0) trays[e.from] = [...from.slice(0, i), ...from.slice(i + 1)];
      trays[e.to] = [...(trays[e.to] || []), e.item];
      return { ...state, trays };
    }
    case "note.set":
      return { ...state, notes: e.text };
    default:
      return state;
  }
}

export function reduce(events, state = initialState()) {
  const valid = events
    .filter((e) => {
      if (typeof e !== "object" || e === null || !Number.isInteger(e.seq))
        return false;
      const body = { ...e };
      delete body.seq;
      return validateEvent(body) === null;
    })
    .sort((a, b) => a.seq - b.seq);
  const seqs = new Set(valid.map((e) => e.seq));
  const cancelled = new Set();
  for (let i = valid.length - 1; i >= 0; i--) {
    const e = valid[i];
    if (e.type !== "undo" || cancelled.has(e.seq)) continue;
    if (e.target < e.seq && seqs.has(e.target)) cancelled.add(e.target);
  }
  let next = state;
  for (const e of valid) {
    if (e.type === "undo" || cancelled.has(e.seq)) continue;
    next = applyEvent(next, e);
  }
  return next;
}

export function usedTiles(state) {
  const counts = {};
  for (const { tile } of Object.values(state.tiles)) {
    counts[tile] = (counts[tile] || 0) + 1;
  }
  return counts;
}
