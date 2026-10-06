import {
  assocPath,
  dissocPath,
  equals,
  init,
  insert,
  isEmpty,
  move,
  path,
  remove,
  uniq,
} from "ramda";

// The parts of the game file the edit panel has a form for. Widening the
// panel to more of the game means adding a key here.
export const GAME_INFO_KEYS = ["info", "links", "prototype", "wip"];

// The fields of an array item shown first, the others are under "more fields"
export const PRIMARY_KEYS = [
  "name",
  "quantity",
  "price",
  "color",
  "rust",
  "phased",
  "obsolete",
];

// Strings that are long text, shown in a textarea
export const LONG_TEXT_KEYS = ["notes"];

// The schema node with a local $ref followed (a description next to the $ref
// wins over the one of the target)
export const resolveSchema = (node, root) => {
  let resolved = node;
  for (let i = 0; i < 10 && resolved?.$ref; i++) {
    const { $ref, ...rest } = resolved;
    const target = $ref.startsWith("#/")
      ? path($ref.slice(2).split("/"), root)
      : undefined;
    if (!target) return resolved;
    resolved = { ...target, ...rest };
  }
  return resolved;
};

// A schema node with its allOf merged into one: the properties of all of them
// and the union of their required
export const resolveAllOf = (node, root) => {
  const resolved = resolveSchema(node, root);
  if (!Array.isArray(resolved?.allOf)) return resolved;

  const { allOf, ...rest } = resolved;
  return allOf.reduce((merged, part) => {
    const next = resolveAllOf(part, root);
    return {
      ...merged,
      ...next,
      properties: { ...merged.properties, ...next.properties },
      required: uniq([...(merged.required ?? []), ...(next.required ?? [])]),
    };
  }, rest);
};

// The type of each alternative of a oneOf, a minimum or description does not
// change it. An alternative with an enum is a choice, not just its type.
const typesOf = (alternatives) =>
  alternatives.map((alternative) =>
    alternative.enum ? undefined : alternative.type,
  );

// A whole number or text from a list ("∞"): the quantity of a train
const isCount = (alternatives) =>
  alternatives.length === 2 &&
  alternatives.some((a) => a.type === "integer" || a.type === "number") &&
  alternatives.some(
    (a) => a.type === "string" && a.enum?.every((v) => typeof v === "string"),
  );

// How a (resolved) schema node is edited:
// string, text, number, boolean, enum, stringOrNumber, count, object, array
// (of objects, needs the root to follow the items), or json for everything
// else, so a new construct never disappears from the form
export const kindOf = (node, key, root) => {
  if (!node || typeof node !== "object" || node.$ref) return "json";
  if (Array.isArray(node.enum)) {
    return node.enum.every((value) => typeof value === "string")
      ? "enum"
      : "json";
  }
  if (node.type === "string") {
    return LONG_TEXT_KEYS.includes(key) ? "text" : "string";
  }
  if (node.type === "number" || node.type === "integer") return "number";
  if (node.type === "boolean") return "boolean";
  if (node.type === "object" && node.properties) return "object";
  if (node.type === "array" && root) {
    const item = resolveAllOf(node.items, root);
    return item?.type === "object" && item.properties ? "array" : "json";
  }
  if (Array.isArray(node.oneOf) && isCount(node.oneOf)) return "count";
  if (Array.isArray(node.oneOf) && node.oneOf.length === 2) {
    const types = typesOf(node.oneOf);
    if (types.includes("string") && types.includes("number")) {
      return "stringOrNumber";
    }
  }
  return "json";
};

// "titleFontWeight" is "Title Font Weight"
export const humanize = (key) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());

const isIndex = (key) => typeof key === "number" || /^\d+$/.test(key);

// The schema of the value at a path in the game, an index is an item
export const schemaAt = (root, keys) =>
  keys.reduce(
    (node, key) =>
      resolveAllOf(isIndex(key) ? node?.items : node?.properties?.[key], root),
    resolveAllOf(root, root),
  );

// A key listed in the required of its parent cannot be unset
export const isRequired = (root, keys) =>
  !!schemaAt(root, keys.slice(0, -1))?.required?.includes(
    keys[keys.length - 1],
  );

// Text that is a whole number is a number (a font weight of 700), anything
// else stays text ("bold")
export const coerceStringOrNumber = (text) => {
  const trimmed = text.trim();
  return /^-?\d+(\.\d+)?$/.test(trimmed) ? Number(trimmed) : text;
};

export const setValue = (game, keys, value) => assocPath(keys, value, game);

// Removes the key, and the objects this left empty (an object that was
// already empty stays, and the info is never removed)
export const clearValue = (game, keys) => {
  if (path(keys, game) === undefined) return game;

  let next = dissocPath(keys, game);
  for (
    let parent = init(keys);
    parent.length > 0 &&
    !equals(parent, ["info"]) &&
    !isEmpty(path(parent, game)) &&
    isEmpty(path(parent, next));
    parent = init(parent)
  ) {
    next = dissocPath(parent, next);
  }
  return next;
};

// The path of a field as the problems write it: trains[0].name
export const pointerOf = (keys) =>
  keys.reduce(
    (pointer, key) =>
      isIndex(key) ? `${pointer}[${key}]` : pointer ? `${pointer}.${key}` : key,
    "",
  );

// The problems of the game that belong to a field. A leaf also has the
// problems of what is inside it, a group only its own (an unknown field).
export const issuesFor = (issues, keys, deep = true) => {
  const pointer = pointerOf(keys);
  return (issues ?? []).filter(
    (issue) =>
      issue.pointer === pointer ||
      (deep &&
        (issue.pointer.startsWith(`${pointer}.`) ||
          issue.pointer.startsWith(`${pointer}[`))),
  );
};

// Lists in the game, changed without touching what they hold. Each returns the
// same game when nothing changes, so editGame makes no edit.

// Inserts the item at the index (at the end when out of range)
export const insertAt = (game, keys, index, item) => {
  const list = path(keys, game) ?? [];
  const at = Math.max(0, Math.min(index, list.length));
  return assocPath(keys, insert(at, item, list), game);
};

// Removes the item, and the list when this empties it
export const removeAt = (game, keys, index) => {
  const list = path(keys, game);
  if (!Array.isArray(list) || index < 0 || index >= list.length) return game;
  return list.length === 1
    ? dissocPath(keys, game)
    : assocPath(keys, remove(index, 1, list), game);
};

export const moveItem = (game, keys, from, to) => {
  const list = path(keys, game);
  if (
    !Array.isArray(list) ||
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= list.length ||
    to >= list.length
  ) {
    return game;
  }
  return assocPath(keys, move(from, to, list), game);
};

// The first number, from the count of the list up, that no item is named
export const nextName = (items = []) => {
  const names = items.map((item) => item?.name);
  let n = items.length + 1;
  while (names.includes(String(n))) n++;
  return String(n);
};

// A new item: the defaults of its list (what the schema requires besides the
// name), named to not clash with the others
export const newItem = (items, defaults = {}) => ({
  name: nextName(items),
  ...defaults,
});
