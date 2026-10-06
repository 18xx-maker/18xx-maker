import {
  assocPath,
  dissocPath,
  equals,
  insert,
  isEmpty,
  move,
  omit,
  remove,
} from "ramda";

// Edits of the stock market (game.stock.market) for the edit panel. Plain
// functions from a game to a game: each returns the very same game when
// nothing changes, so editGame makes no edit. The market is never deleted
// (the market pages leave for the game page when it is missing), removing the
// last row or column leaves an empty list.
//
// A 2D market is a list of rows (a row is a list of cells, or a bare cell for
// a row of one), the others are one flat list of cells. A 1Diag market is
// drawn in two rows: the even cells on top, the odd below, so a column of it
// is two cells. Rows have different lengths, they are never padded.

export const isFlat = (type) => type === "1D" || type === "1Diag";

// Cells per column
const unit = (type) => (type === "1Diag" ? 2 : 1);

// A row as a list of cells
const toRow = (row) => (Array.isArray(row) ? row : [row]);

// The rows of the market: the flat markets are one row
export const rowsOf = (stock) => {
  const market = Array.isArray(stock?.market) ? stock.market : [];
  return isFlat(stock?.type) ? [market] : market.map(toRow);
};

// The widest row, in columns
export const columnCount = (stock) => {
  const rows = rowsOf(stock);
  const cells = Math.max(0, ...rows.map((row) => row.length));
  return Math.ceil(cells / unit(stock?.type));
};

// The cell shown at a place of the grid, undefined where the row has none
export const cellAt = (stock, row, col) => rowsOf(stock)[row]?.[col];

// Where the cell is in the game, as the keys the problems and fields use
export const cellKeys = (stock, row, col) => {
  if (isFlat(stock?.type)) return ["stock", "market", col];
  const raw = stock?.market?.[row];
  return Array.isArray(raw)
    ? ["stock", "market", row, col]
    : ["stock", "market", row];
};

// Shorthand: null, a number (the value) and a string (the label) stand for
// the object of a cell
export const promoteCell = (cell) => {
  if (cell === null || cell === undefined) return {};
  if (typeof cell === "number") return { value: cell };
  if (typeof cell === "string") return { label: cell };
  return cell;
};

// The shortest form of a cell
export const demoteCell = (cell) => {
  if (cell === undefined) return null;
  if (cell === null || typeof cell !== "object") return cell;
  const keys = Object.keys(cell);
  if (keys.length === 0) return null;
  if (
    keys.length === 1 &&
    keys[0] === "value" &&
    typeof cell.value === "number"
  )
    return cell.value;
  if (
    keys.length === 1 &&
    keys[0] === "label" &&
    typeof cell.label === "string"
  )
    return cell.label;
  return cell;
};

// The cell with a field set, or removed with undefined, in its shortest form
export const setCellField = (cell, key, value) => {
  const next = { ...promoteCell(cell) };
  if (value === undefined) delete next[key];
  else next[key] = value;
  return demoteCell(next);
};

// The game with these rows as its market
const withRows = (game, rows) => {
  const market = isFlat(game.stock.type) ? rows[0] : rows;
  return !Array.isArray(game.stock.market) || equals(market, game.stock.market)
    ? game
    : assocPath(["stock", "market"], market, game);
};

// Sets a cell that is in the market
export const setCell = (game, row, col, cell) => {
  const current = rowsOf(game.stock)[row];
  if (!current || col < 0 || col >= current.length) return game;
  if (equals(current[col], cell)) return game;

  // A bare cell stays a bare cell
  if (!isFlat(game.stock.type) && !Array.isArray(game.stock.market[row])) {
    return assocPath(["stock", "market", row], cell, game);
  }
  return assocPath(cellKeys(game.stock, row, col), cell, game);
};

// The rows of a 2D market as they are, a bare cell stays one. Undefined for
// anything else, the row operations do nothing there.
const rawRows = (game) =>
  !isFlat(game.stock?.type) && Array.isArray(game.stock?.market)
    ? game.stock.market
    : undefined;

const setRows = (game, rows) => assocPath(["stock", "market"], rows, game);

// Inserts a row of the given cells before the row at the index (at the end
// when past it)
export const insertRow = (game, at, cells) => {
  const rows = rawRows(game);
  if (!rows) return game;
  return setRows(
    game,
    insert(Math.max(0, Math.min(at, rows.length)), cells, rows),
  );
};

// A row of nulls as wide as the row
export const blankRow = (stock, row) =>
  (rowsOf(stock)[row] ?? []).map(() => null);

export const removeRow = (game, at) => {
  const rows = rawRows(game);
  return rows && at >= 0 && at < rows.length
    ? setRows(game, remove(at, 1, rows))
    : game;
};

export const moveRow = (game, from, to) => {
  const rows = rawRows(game);
  if (!rows || from === to || from < 0 || to < 0) return game;
  if (from >= rows.length || to >= rows.length) return game;
  return setRows(game, move(from, to, rows));
};

// A copy of the row right after it
export const duplicateRow = (game, at) => {
  const rows = rawRows(game);
  return rows && at >= 0 && at < rows.length
    ? insertRow(game, at + 1, structuredClone(rows[at]))
    : game;
};

// The cells of a column, a list with a place for each row. A row without the
// column has undefined there.
export const columnCells = (stock, col) => {
  const size = unit(stock?.type);
  return rowsOf(stock).map((row) =>
    row.length > col * size
      ? row.slice(col * size, col * size + size)
      : undefined,
  );
};

// The market with fn(row, index) applied to each row (a list of cells). It
// returns the new list, or undefined for a row that stays as it is: a bare
// cell row only becomes a list when it changes.
const mapRows = (game, fn) => {
  const flat = isFlat(game.stock?.type);
  const raw = flat ? [game.stock?.market] : (game.stock?.market ?? []);
  const rows = rowsOf(game.stock).map((row, index) => {
    const next = fn(row, index);
    return next === undefined ? raw[index] : next;
  });
  return withRows(game, rows);
};

// Inserts a column before the one at the index, in every row that is that
// long. With the cells of a removed column (columnCells) they go back where
// they came from.
export const insertColumn = (game, at, cells) => {
  if (!game.stock || at < 0) return game;
  const size = unit(game.stock.type);
  return mapRows(game, (row, index) => {
    const wanted = cells
      ? cells[index]
      : row.length >= at * size
        ? Array(size).fill(null)
        : undefined;
    if (!wanted) return undefined;
    const place = Math.min(at * size, row.length);
    return [...row.slice(0, place), ...wanted, ...row.slice(place)];
  });
};

export const removeColumn = (game, at) => {
  if (!game.stock || at < 0) return game;
  const size = unit(game.stock.type);
  return mapRows(game, (row) =>
    row.length > at * size ? row.toSpliced(at * size, size) : undefined,
  );
};

// Moves a column among the others, in the rows that have both places
export const moveColumn = (game, from, to) => {
  if (!game.stock || from === to || from < 0 || to < 0) return game;
  const size = unit(game.stock.type);
  return mapRows(game, (row) => {
    if (row.length <= Math.max(from, to) * size) return undefined;
    const cells = row.slice(from * size, from * size + size);
    return row.toSpliced(from * size, size).toSpliced(to * size, 0, ...cells);
  });
};

export const duplicateColumn = (game, at) => {
  if (!game.stock || at < 0) return game;
  const copies = columnCells(game.stock, at).map(
    (cells) => cells && structuredClone(cells),
  );
  return copies.every((cells) => cells === undefined)
    ? game
    : insertColumn(game, at + 1, copies);
};

// The market as another type: the first row only for a flat market, the flat
// market as the one row of a 2D market. display, ledges and cell stay.
export const changeType = (game, type) => {
  const stock = game.stock ?? {};
  if (stock.type === type) return game;

  let next = assocPath(["stock", "type"], type, game);
  const was = isFlat(stock.type);
  const will = isFlat(type);
  if (was !== will && Array.isArray(stock.market) && !isEmpty(stock.market)) {
    const market = will ? toRow(stock.market[0]) : [stock.market];
    next = assocPath(["stock", "market"], market, next);
  }
  return next;
};

// The rows a change of type drops
export const droppedRows = (stock, type) =>
  !isFlat(stock?.type) && isFlat(type) && Array.isArray(stock?.market)
    ? Math.max(0, stock.market.length - 1)
    : 0;

// A new market: a 3 x 3 grid, or a row of three
export const createMarket = (game) => {
  const type = game.stock?.type ?? "2D";
  const market = isFlat(type)
    ? [null, null, null]
    : Array.from({ length: 3 }, () => [null, null, null]);
  return assocPath(["stock"], { ...game.stock, type, market }, game);
};

// The cells that use a legend number from the first to the last (the others
// of the list when to is left out)
export const legendUses = (stock, from, to = from) =>
  rowsOf(stock)
    .flat()
    .filter(
      (cell) =>
        cell &&
        typeof cell === "object" &&
        Number.isInteger(cell.legend) &&
        cell.legend >= Math.min(from, to) &&
        cell.legend <= Math.max(from, to),
    ).length;

// The place kept inside the market: the row and cell it has, or nothing when
// there is none
export const clampCell = (stock, place) => {
  const rows = rowsOf(stock);
  if (!place || rows.length === 0) return null;
  const row = Math.max(0, Math.min(place.row, rows.length - 1));
  const length = rows[row].length;
  if (length === 0) return null;
  return { row, col: Math.max(0, Math.min(place.col, length - 1)) };
};

// The movement texts of a direction or other key (one text per line, empty
// lines left out). No texts remove the key, and the movement with its last.
export const setMovement = (game, key, texts) => {
  if (!game.stock) return game;
  const cleaned = texts.map((text) => text.trim()).filter(Boolean);
  const movement = game.stock.movement ?? {};

  if (cleaned.length === 0) {
    if (!(key in movement)) return game;
    const rest = omit([key], movement);
    return isEmpty(rest)
      ? dissocPath(["stock", "movement"], game)
      : assocPath(["stock", "movement"], rest, game);
  }
  return equals(movement[key], cleaned)
    ? game
    : assocPath(["stock", "movement", key], cleaned, game);
};
