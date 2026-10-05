import { assocPath, dissocPath, equals, init, isEmpty, path } from "ramda";

// The parts of the game file the edit panel has a form for. Widening the
// panel to more of the game means adding a key here.
export const GAME_INFO_KEYS = ["info", "links", "prototype", "wip"];

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

const typesOf = (alternatives) =>
  alternatives.map((alternative) =>
    Object.keys(alternative).length === 1 ? alternative.type : undefined,
  );

// How a (resolved) schema node is edited:
// string, text, number, boolean, enum, stringOrNumber, object, or json for
// everything else, so a new construct never disappears from the form
export const kindOf = (node, key) => {
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

// The schema of the value at a path in the game
const schemaAt = (root, keys) =>
  keys.reduce(
    (node, key) => resolveSchema(node?.properties?.[key], root),
    resolveSchema(root, root),
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

// The problems of the game that belong to a field. A leaf also has the
// problems of what is inside it, a group only its own (an unknown field).
export const issuesFor = (issues, keys, deep = true) => {
  const pointer = keys.join(".");
  return (issues ?? []).filter(
    (issue) =>
      issue.pointer === pointer ||
      (deep &&
        (issue.pointer.startsWith(`${pointer}.`) ||
          issue.pointer.startsWith(`${pointer}[`))),
  );
};
