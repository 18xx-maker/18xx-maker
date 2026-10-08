import { omit } from "ramda";

// The pure parts of the tile editor: the tiles of a game (`game.tiles`, an
// object of tile id to one of four shapes) and the changes the Tiles tab makes.
// Plain functions of the game, no window and no library import: the library of
// generic tiles (`tiles` of "@/data") is an argument where it is needed.
//
// An entry of `game.tiles` is one of
//   "quantity"    an integer, how many of the generic tile with the id there are,
//   "alias"       { tile: "57", ... } drawn like the generic tile it names,
//   "override"    an object without a `color`, laid over the generic tile of the
//                 id (the same order getTile and Tile.jsx follow),
//   "definition"  an object with a `color`, the whole tile.
// An id may have a variant after a "|" (26|T2): the generic tile is found by the
// part before it. Nothing here promotes an entry to another shape or fills in a
// default unless the change needs it.

export const baseId = (id) => String(id).split("|")[0];

const isObject = (entry) => entry !== null && typeof entry === "object";

// The same order getTile follows: an alias wins over a color
export const tileShape = (entry) => {
  if (!isObject(entry) || Array.isArray(entry)) return "quantity";
  if (entry.tile) return "alias";
  return entry.color ? "definition" : "override";
};

export const tileIds = (game) => Object.keys(game?.tiles ?? {});

export const hasTile = (game, id) =>
  game?.tiles !== undefined && Object.hasOwn(game.tiles, id);

// The generic tile with the id, or the one of its base id
export const libraryTile = (library, id) =>
  library?.[id] ?? library?.[baseId(id)];

// The tile an entry is drawn as: the whole tile for a definition, the generic
// tile the entry names for an alias, the generic tile with the entry laid over
// it for an override and the generic tile for a quantity. undefined when no
// generic tile has the id.
export const effectiveTile = (game, id, library) => {
  const entry = game.tiles[id];
  switch (tileShape(entry)) {
    case "definition":
      return entry;
    case "alias":
      return libraryTile(library, entry.tile);
    case "override": {
      const base = libraryTile(library, id);
      return base && { ...base, ...entry };
    }
    default:
      return libraryTile(library, id);
  }
};

// The fields of the entry the form edits: a quantity as { quantity }
export const tileFields = (entry) =>
  tileShape(entry) === "quantity" ? { quantity: entry } : entry;

// The entry after the form changed its fields. A quantity stays an integer
// while the quantity is all that changes (and stays as it is when the change
// leaves nothing: an integer cannot be empty); every other shape keeps its
// shape, an object.
export const writeTile = (entry, next) => {
  const shape = tileShape(entry);
  if (shape === "quantity") {
    const keys = Object.keys(next);
    if (keys.length === 0) return entry;
    return keys.length === 1 && Number.isInteger(next.quantity)
      ? next.quantity
      : next;
  }
  // Without its tile an alias, without its color a definition would be another
  // shape: the form does not change a shape, it keeps the entry
  if (shape === "alias" && !next.tile) return entry;
  if (shape === "definition" && !next.color) return entry;
  return next;
};

// The game with the entry of the id replaced; the order of the tiles stays
export const setTile = (game, id, entry) => {
  if (!hasTile(game, id)) return game;
  return { ...game, tiles: { ...game.tiles, [id]: entry } };
};

// The game with the entries of the tiles rebuilt by the function, which gets
// the [id, entry] pairs
const withTiles = (game, fn) => ({
  ...game,
  tiles: Object.fromEntries(fn(Object.entries(game.tiles ?? {}))),
});

// The privates of the game that draw the tile (private.tile is a tile id)
export const privatesUsing = (game, id) =>
  (game.privates ?? []).flatMap((item, index) =>
    item?.tile === id ? [index] : [],
  );

// An id as the game has it, or "" when there is none to use
const cleanId = (id) => String(id ?? "").trim();

// A new tile: the generic tile when the library has the id (an integer, the
// quantity), else a plain definition of your own to draw. { error } when the id
// is empty or taken.
export const addTile = (game, id, library) => {
  const name = cleanId(id);
  if (name === "") return { error: "empty" };
  if (hasTile(game, name)) return { error: "exists" };
  const entry = libraryTile(library, name)
    ? 1
    : { color: "yellow", quantity: 1 };
  return {
    game: withTiles(game, (pairs) => [...pairs, [name, entry]]),
    id: name,
  };
};

// An id for a copy that no tile has: a variant of the generic tile ("63|2")
// for an entry that is drawn from the library, else a name of its own
const copyId = (game, id, shape) => {
  for (let n = 2; ; n++) {
    const next =
      shape === "definition"
        ? `${id}-copy${n === 2 ? "" : n}`
        : `${baseId(id)}|${n}`;
    if (!hasTile(game, next)) return next;
  }
};

// The tile copied right after the original, with a new id
export const duplicateTile = (game, id) => {
  if (!hasTile(game, id)) return { error: "missing" };
  const entry = game.tiles[id];
  const to = copyId(game, id, tileShape(entry));
  return {
    game: withTiles(game, (pairs) =>
      pairs.flatMap(([key, value]) =>
        key === id
          ? [
              [key, value],
              [to, structuredClone(value)],
            ]
          : [[key, value]],
      ),
    ),
    id: to,
  };
};

// The game without the tile, and without `tiles` when it was the last one (a
// game with no tiles has no tile sheets)
export const removeTile = (game, id) => {
  if (!hasTile(game, id)) return game;
  const rest = omit([id], game.tiles);
  if (Object.keys(rest).length === 0) return omit(["tiles"], game);
  return { ...game, tiles: rest };
};

// A tile of the library as a definition of the game: the library tile with the
// keys of the entry laid over it, without the keys of the library only (its id
// and aliases). Nothing else is added. { error } when there is no such library
// tile or the entry already is a definition.
export const customizeTile = (game, id, library) => {
  if (!hasTile(game, id)) return { error: "missing" };
  const entry = game.tiles[id];
  const shape = tileShape(entry);
  if (shape === "definition") return { error: "definition" };
  const base = effectiveTile(game, id, library);
  if (!base) return { error: "library" };
  const tile = omit(["id", "aliases", "tile"], base);
  const rest = omit(["tile"], isObject(entry) ? entry : { quantity: entry });
  return {
    game: setTile(game, id, structuredClone({ ...tile, ...rest })),
    id,
  };
};

// Renames a tile: its key in `tiles` (in the same place), and the privates that
// draw it. The alias entries of other tiles name generic tiles of the library,
// never an entry of the game, and the map has no tile ids, so there is nothing
// else to follow. { error } instead of a game when:
//   "missing"  there is no tile with the id,
//   "empty"    the new id is empty,
//   "exists"   another tile has the new id,
//   "library"  the entry is drawn from the library by its id (a quantity or an
//              override) and the new id has another base: it would draw
//              another tile. The part after "|" may change; customize the tile
//              to rename it freely.
// The same id gives the same game.
export const renameTile = (game, from, to) => {
  const name = cleanId(to);
  if (!hasTile(game, from)) return { error: "missing" };
  if (name === "") return { error: "empty" };
  if (name === from) return { game };
  if (hasTile(game, name)) return { error: "exists" };
  const shape = tileShape(game.tiles[from]);
  if (
    (shape === "quantity" || shape === "override") &&
    baseId(name) !== baseId(from)
  ) {
    return { error: "library" };
  }

  const renamed = withTiles(game, (pairs) =>
    pairs.map(([key, value]) => [key === from ? name : key, value]),
  );
  const used = privatesUsing(game, from);
  if (used.length === 0) return { game: renamed };
  return {
    game: {
      ...renamed,
      privates: game.privates.map((item, index) =>
        used.includes(index) ? { ...item, tile: name } : item,
      ),
    },
  };
};
