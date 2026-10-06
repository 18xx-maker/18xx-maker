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
  "revenue",
  "company",
];

// The same for a phase: the others (the company, the event it happens on, the
// notes, buying companies and events) are under "more fields"
export const PHASE_PRIMARY_KEYS = [
  "name",
  "limit",
  "tiles",
  "train",
  "minor",
  "rounds",
];

// Strings that are long text, shown in a textarea
export const LONG_TEXT_KEYS = ["notes", "description"];

// The sections where a description is long text (the description of a market
// legend entry is a one-line label)
export const LONG_DESCRIPTION_SECTIONS = ["trains", "privates"];

const isLongText = (key, keys) =>
  key === "description"
    ? LONG_DESCRIPTION_SECTIONS.includes(keys[0])
    : LONG_TEXT_KEYS.includes(key);

// Keys edited as JSON whatever their schema: a list of objects that is not
// one form (the abilities of a private, each has its own type and keys)
export const JSON_KEYS = ["abilities"];

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

// A number, a list of numbers or text: the revenue of a private
const isRevenue = (alternatives) =>
  alternatives.length === 3 &&
  ["number", "array", "string"].every((type) =>
    typesOf(alternatives).includes(type),
  );

// Text or a number, whatever the count of alternatives (the limit of a phase
// is a number or one of two patterns): every alternative is a string or a
// number, with at least a number and a string that is not a choice
const isStringOrNumber = (alternatives) =>
  alternatives.every((a) => ["string", "number", "integer"].includes(a.type)) &&
  alternatives.some((a) => a.type === "number" || a.type === "integer") &&
  alternatives.some((a) => a.type === "string" && !a.enum);

// Text or a list of texts: the train and the notes of a phase. A choice, a
// pattern or a $ref makes it something else.
const isPlainString = (node) =>
  node?.type === "string" && !node.enum && !node.pattern && !node.$ref;

const isStringList = (alternatives) =>
  alternatives.length === 2 &&
  alternatives.some(isPlainString) &&
  alternatives.some(
    (a) =>
      a.type === "array" &&
      !a.enum &&
      !a.$ref &&
      isPlainString(a.items) &&
      !a.items.$ref,
  );

// How a (resolved) schema node is edited:
// string, text, number, boolean, enum, stringOrNumber, limit, stringList,
// count, revenue, object, array
// (of objects, needs the root to follow the items), or json for everything
// else, so a new construct never disappears from the form
export const kindOf = (node, key, root, keys = []) => {
  if (!node || typeof node !== "object" || node.$ref) return "json";
  if (JSON_KEYS.includes(key)) return "json";
  if (Array.isArray(node.enum)) {
    return node.enum.every((value) => typeof value === "string")
      ? "enum"
      : "json";
  }
  if (node.type === "string") {
    return isLongText(key, keys) ? "text" : "string";
  }
  if (node.type === "number" || node.type === "integer") return "number";
  if (node.type === "boolean") return "boolean";
  if (node.type === "object" && node.properties) return "object";
  if (node.type === "array" && root) {
    const item = resolveAllOf(node.items, root);
    return item?.type === "object" && item.properties ? "array" : "json";
  }
  if (Array.isArray(node.oneOf) && isCount(node.oneOf)) return "count";
  if (Array.isArray(node.oneOf) && isRevenue(node.oneOf)) return "revenue";
  if (Array.isArray(node.oneOf) && isStringList(node.oneOf)) {
    return "stringList";
  }
  if (Array.isArray(node.oneOf) && isStringOrNumber(node.oneOf)) {
    return key === "limit" ? "limit" : "stringOrNumber";
  }
  return "json";
};

// "titleFontWeight" is "Title Font Weight"
export const humanize = (key) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());

const isIndex = (key) => typeof key === "number" || /^\d+$/.test(key);

// The parts of a schema node a path can go on in: a oneOf is replaced by its
// alternatives (resolved, and their own oneOf too), as the cells of a market
// are null, a number, a string or an object
const alternativesOf = (node, root) => {
  const resolved = resolveAllOf(node, root);
  return Array.isArray(resolved?.oneOf)
    ? resolved.oneOf.flatMap((part) => alternativesOf(part, root))
    : [resolved];
};

// The schema one step down a path: an index is an item, a name a property,
// through the alternatives of a oneOf
const stepInto = (node, key, root) => {
  for (const part of alternativesOf(node, root)) {
    const child = isIndex(key) ? part?.items : part?.properties?.[key];
    if (child) return resolveAllOf(child, root);
  }
  return undefined;
};

// The schema of the value at a path in the game, an index is an item
export const schemaAt = (root, keys) =>
  keys.reduce(
    (node, key) => stepInto(node, key, root),
    resolveAllOf(root, root),
  );

// A key listed in the required of its parent cannot be unset, nor one that
// every branch of its anyOf requires (the limit of a phase, but not its name,
// which the train can stand in for)
export const isRequired = (root, keys) => {
  const parent = schemaAt(root, keys.slice(0, -1));
  const key = keys[keys.length - 1];
  const branches = Array.isArray(parent?.anyOf) ? parent.anyOf : [];
  return (
    !!parent?.required?.includes(key) ||
    (branches.length > 0 &&
      branches.every((branch) => branch.required?.includes(key)))
  );
};

// Text that is a whole number is a number (a font weight of 700), anything
// else stays text ("bold")
export const coerceStringOrNumber = (text) => {
  const trimmed = text.trim();
  return /^-?\d+(\.\d+)?$/.test(trimmed) ? Number(trimmed) : text;
};

// Numbers separated by / (or a comma and a space) are a list (one number is a
// number), any other text stays text ("$10/$20", "1,000"), empty is no value
export const parseRevenue = (text) => {
  if (text.trim() === "") return undefined;
  const parts = text.split(/\/|,\s/).map((part) => part.trim());
  if (!parts.every((part) => /^-?\d+(\.\d+)?$/.test(part))) return text;
  const numbers = parts.map(Number);
  return numbers.length === 1 ? numbers[0] : numbers;
};

// A list is written as the card prints it: 10/20
export const formatRevenue = (value) =>
  Array.isArray(value) ? value.join("/") : (value ?? "").toString();

// One text a line is a list of texts, the form of the train and the notes of a
// phase: lines are trimmed and blank ones dropped, no line is no value and one
// line is a string, not a list
export const parseList = (text) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return undefined;
  return lines.length === 1 ? lines[0] : lines;
};

export const formatList = (value) =>
  Array.isArray(value) ? value.join("\n") : (value ?? "").toString();

// The text is the value, a list of one line (["4H"]) is the same as that line
export const sameList = (text, value) => {
  const parsed = parseList(text);
  return equals(parsed, value) || equals([parsed], value);
};

// A whole number of at least 1, "∞" or one digit over one digit ("3/4"), the
// limit of a phase: undefined for any other text
export const parseLimit = (text) => {
  const trimmed = text.trim();
  if (trimmed === "∞" || /^\d\/\d$/.test(trimmed)) return trimmed;
  return /^\d+$/.test(trimmed) && Number(trimmed) >= 1
    ? Number(trimmed)
    : undefined;
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

// The first number, from the count of the list up, that no item has as its
// name (or another key, the train of a phase)
export const nextName = (items = [], key = "name") => {
  const names = items.map((item) => String(item?.[key]));
  let n = items.length + 1;
  while (names.includes(String(n))) n++;
  return String(n);
};

// Whether the items are named: phases may be keyed by their train instead
export const isNamed = (items) => items.some((item) => item?.name);

// A new item: the defaults of its list (what the schema requires besides the
// name), named to not clash with the others. With unique "named" a list of
// items that have no names, a phase list keyed by train, gets a train that is
// free instead (a name would make one phase differ from the others).
export const newItem = (items, defaults = {}, unique = true) => {
  if (unique === "named" && items.length > 0 && !isNamed(items)) {
    return { ...defaults, train: nextName(items, "train") };
  }
  return { ...(unique && { name: nextName(items) }), ...defaults };
};
