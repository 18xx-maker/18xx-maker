import { equals, init, insert, isEmpty, move, path, remove, uniq } from "ramda";

import tilesDefs from "@/schemas/tiles.defs.json";

// The parts of the game file the edit panel has a form for. Widening the
// panel to more of the game means adding a key here.
export const GAME_INFO_KEYS = ["info", "links", "prototype", "wip"];

// The lists of the rounds tab, in the order of the tab
export const ROUND_KEYS = ["rounds", "turns", "numberCards", "number_cards"];

// The record of the colors tab
export const COLOR_KEYS = ["colors"];

// The keys of the output tab: the chart range and the export defaults
export const OUTPUT_KEYS = ["revenue", "exports"];

// Properties the schema keeps for old files but the form never shows (they
// stay in the game untouched): the deprecated and ignored exports.paginated
export const HIDDEN_PATHS = [["exports", "paginated"]];

export const isHidden = (keys) =>
  HIDDEN_PATHS.some(
    (hidden) =>
      hidden.length === keys.length &&
      hidden.every((key, index) => key === keys[index]),
  );

// A deprecated field without a value is not offered: the form shows the old
// name only while a game still has it
export const isUnsetDeprecated = (keys, schema, root, game) =>
  !!resolveAllOf(schema, root).deprecated && valueAt(keys, game) === undefined;

// The lists of the tokens tab, in the order of the tab
export const TOKEN_KEYS = ["tokens", "tokenTypes", "shareTypes"];

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
  "note",
];

// The fields of a turn of the rounds tab, none is under "more fields"
export const TURN_PRIMARY_KEYS = ["name", "steps", "ordered", "optional"];

// The same for a token of the game, a token of a token type and a share of a
// share type: the rest is under "more fields"
export const GAME_TOKEN_PRIMARY_KEYS = ["label", "icon", "logo", "color"];
export const CHARTER_TOKEN_PRIMARY_KEYS = ["cost", "start"];
export const SHARE_PRIMARY_KEYS = ["quantity", "label", "percent", "cost"];

// The same for a company: the rest (the shares, tokens, logo and the other
// charter fields) are under "more fields"
export const COMPANY_PRIMARY_KEYS = ["name", "abbrev", "color", "minor"];

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

// The game-wide values of the players tab; the players table itself is
// "players"
export const PLAYER_KEYS = ["bank", "capital", "certLimit"];

// The fields of a player count shown first: the bank is under "more fields"
export const PLAYER_PRIMARY_KEYS = ["number", "capital", "certLimit"];

// The keys of a map variation the Map tab edits: all of them but the hexes,
// which the map editor and the Hex tab own (in the order of the tab)
export const MAP_KEYS = [
  "name",
  "copy",
  "remove",
  "title",
  "trim",
  "roundTracker",
  "movement",
  "market",
  "players",
  "borders",
  "lines",
  "borderTexts",
];

// The fields of a border, a line and a border text shown first on its card
export const BORDER_PRIMARY_KEYS = ["coords", "color", "width"];
export const BORDER_TEXT_PRIMARY_KEYS = ["coord", "label", "cost"];

// Strings that are long text, shown in a textarea
export const LONG_TEXT_KEYS = ["notes", "description"];

// The sections where a description is long text (the description of a market
// legend entry is a one-line label)
export const LONG_DESCRIPTION_SECTIONS = ["trains", "privates"];

const isLongText = (key, keys) =>
  key === "description"
    ? LONG_DESCRIPTION_SECTIONS.includes(keys[0])
    : LONG_TEXT_KEYS.includes(key);

// The schema documents a $ref can point into besides the root, by file name
const DOCUMENTS = { "tiles.defs.json": tilesDefs };

const isObject = (value) => value !== null && typeof value === "object";
const own = (object, key) => isObject(object) && Object.hasOwn(object, key);

// A node of another document with its own local refs written with the file
// ("#/definitions/x" is "tiles.defs.json#/definitions/x"), so that they are
// followed in that document and not in the root of the form
const qualified = new WeakMap();
const qualify = (node, file) => {
  if (Array.isArray(node)) return node.map((part) => qualify(part, file));
  if (!isObject(node)) return node;
  if (qualified.has(node)) return qualified.get(node);
  const result = Object.fromEntries(
    Object.entries(node).map(([key, value]) => [
      key,
      key === "$ref" && typeof value === "string" && value.startsWith("#/")
        ? `${file}${value}`
        : qualify(value, file),
    ]),
  );
  qualified.set(node, result);
  return result;
};

// The schema a $ref points to: in the root for "#/..." and in a known
// document for "file.json#/...". Undefined for any other.
const targetOf = ($ref, root) => {
  const at = $ref.indexOf("#");
  const file = $ref.slice(0, at).split("/").pop();
  const pointer = $ref.slice(at + 1);
  const document = file ? DOCUMENTS[file] : root;
  if (at < 0 || !pointer.startsWith("/") || !document) return undefined;
  const target = path(
    pointer
      .slice(1)
      .split("/")
      .map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~")),
    document,
  );
  return file && target ? qualify(target, file) : target;
};

// The schema node with a $ref followed, in the root or in another schema file
// (a description next to the $ref wins over the one of the target). A $ref
// that goes round in a circle, or to nothing, is left on the node.
export const resolveSchema = (node, root) => {
  let resolved = node;
  const seen = new Set();
  while (resolved?.$ref) {
    const { $ref, ...rest } = resolved;
    const target = seen.has($ref) ? undefined : targetOf($ref, root);
    if (!target) return resolved;
    seen.add($ref);
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

const isEnumStrings = (node) =>
  Array.isArray(node?.enum) &&
  node.enum.length > 0 &&
  node.enum.every((value) => typeof value === "string");

// An object of any names with one schema for the values (the colors of a
// game), not the closed set of names of an object with properties
const isRecord = (node) =>
  isObject(node.additionalProperties) &&
  !Array.isArray(node.additionalProperties) &&
  !isEmpty(node.additionalProperties);

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

// The list items that are text, a number or an object (a token of the game):
// the schema of the object, undefined for any other items (text that names
// something else in the game is a reference, not text)
export const mixedItem = (node, root) => {
  const parts = alternativesOf(node, root);
  const objects = parts.filter((part) => part?.type === "object");
  return objects.length === 1 &&
    objects[0].properties &&
    parts.length > 1 &&
    parts.every(
      (part) =>
        ["string", "number", "object"].includes(part?.type) && !part["x-ref"],
    )
    ? objects[0]
    : undefined;
};

// A color of the game: text, or an object of colors by phase
const isColor = (alternatives) =>
  alternatives.length === 2 &&
  alternatives.some(isPlainString) &&
  alternatives.some((a) => a.type === "object" && isRecord(a));

// True or a color: the shapes of a token ("true draws it in white"). The
// alternatives are a boolean (or the one value true) and a plain string.
const isBoolOrColor = (alternatives) =>
  alternatives.length === 2 &&
  alternatives.some(isPlainString) &&
  alternatives.some((a) => a.type === "boolean");

// A list of text that always has the same length (the two colors of halves):
// its minimum and maximum agree
const isTuple = (node, item) =>
  Number.isInteger(node.minItems) &&
  node.minItems > 0 &&
  node.minItems === node.maxItems &&
  isPlainString(item);

// How a (resolved) schema node is edited:
// string, text, number, boolean, enum, stringOrNumber, limit, stringList,
// count, revenue, color, object, record (an object of any names, each a value
// of one schema), array (of objects, needs the root to follow the items),
// stringArray (of texts), colorTuple (a fixed number of texts, the length is
// kept), boolOrColor (true or a text), enumList (of choices), or json for everything
// else, so a new construct never disappears from the form.
// The color kind is structural (text, or an object of colors by phase, shown
// as JSON), not tied to a field name.
export const kindOf = (schema, key, root, keys = []) => {
  const node = resolveSchema(schema, root);
  if (!node || typeof node !== "object" || node.$ref) return "json";
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
  if (node.type === "object" && isRecord(node)) return "record";
  if (node.type === "array") {
    const item = resolveAllOf(node.items, root);
    if (root && item?.type === "object" && item.properties) return "array";
    if (root && mixedItem(node.items, root)) return "array";
    if (isEnumStrings(item)) return "enumList";
    if (isTuple(node, item)) return "colorTuple";
    return isPlainString(item) ? "stringArray" : "json";
  }
  if (Array.isArray(node.oneOf) && isCount(node.oneOf)) return "count";
  if (Array.isArray(node.oneOf) && isRevenue(node.oneOf)) return "revenue";
  if (Array.isArray(node.oneOf) && isColor(alternativesOf(node, root))) {
    return "color";
  }
  if (Array.isArray(node.oneOf) && isBoolOrColor(node.oneOf)) {
    return "boolOrColor";
  }
  if (Array.isArray(node.oneOf) && isStringList(node.oneOf)) {
    return "stringList";
  }
  if (Array.isArray(node.oneOf) && isStringOrNumber(node.oneOf)) {
    return key === "limit" ? "limit" : "stringOrNumber";
  }
  return "json";
};

// A field that names something else in the game (the schema marks the string
// with x-ref): { ref, mode }, or undefined for any other field. mode is
// "single" for a string, "list" for a list of strings and "either" for both
// (a train event is a name or a list of them). The alternatives that are
// objects (the Nth train of a name) are allowed: a value that is one is not
// edited here (see isReferenceValue).
export const referenceOf = (node, root) => {
  const parts = alternativesOf(node, root);
  let ref;
  let single = false;
  let list = false;

  for (const part of parts) {
    if (part?.type === "string" && part["x-ref"]) {
      ref = part["x-ref"];
      single = true;
    } else if (part?.type === "array" && part.items) {
      const items = alternativesOf(part.items, root);
      const named = items.find((item) => item?.type === "string");
      if (!named?.["x-ref"]) return undefined;
      ref = named["x-ref"];
      list = true;
    } else if (part?.type !== "object") {
      return undefined;
    }
  }
  if (!ref) return undefined;
  return { ref, mode: single && list ? "either" : single ? "single" : "list" };
};

// The picker of app data a string field asks for (the schema marks the string
// with x-widget: "icon", "logo" or "publisher"), also when the string is one of
// the alternatives of a oneOf; undefined for any other field.
export const widgetOf = (node, root) =>
  alternativesOf(node, root).find(
    (part) => part?.type === "string" && part["x-widget"],
  )?.["x-widget"];

// Whether the value is what a reference field edits: nothing, a string (not
// for a list) or a list of strings (not for a string). Anything else (an
// object, a list with one) stays in the JSON field, so nothing is lost.
export const isReferenceValue = (value, mode) =>
  value === undefined ||
  (typeof value === "string" && mode !== "list") ||
  (Array.isArray(value) &&
    mode !== "single" &&
    value.every((item) => typeof item === "string"));

// The strings of a reference value as a list
export const referenceList = (value) =>
  value === undefined ? [] : [value].flat();

// The value to store for a list of names: nothing for none, a string for one
// when the schema allows a string, a list otherwise
export const referenceValue = (list, mode) => {
  if (list.length === 0) return undefined;
  return list.length === 1 && mode === "either" ? list[0] : list;
};

// "titleFontWeight" is "Title Font Weight"
export const humanize = (key) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
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

// The schema one step down a path: an index is an item, a name a property
// or, when the object lets in any name, the schema of its values; through the
// alternatives of a oneOf
const stepInto = (node, key, root) => {
  for (const part of alternativesOf(node, root)) {
    const child =
      (isIndex(key) && part?.items) ||
      (own(part?.properties, key) && part.properties[key]) ||
      (isRecord(part ?? {}) && part.additionalProperties);
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
    // The value of a name of a record is there as long as the name is
    (parent?.type === "object" &&
      isRecord(parent) &&
      !own(parent.properties, key)) ||
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

// One text a line, always a list (a single line is a list of one), no line is
// no value: the form of a list of texts
export const parseLines = (text) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length === 0 ? undefined : lines;
};

export const formatLines = (value) =>
  Array.isArray(value) ? value.join("\n") : (value ?? "").toString();

// One text a line is a list of texts, the form of the train and the notes of a
// phase: lines are trimmed and blank ones dropped, no line is no value and one
// line is a string, not a list
export const parseList = (text) => {
  const lines = parseLines(text) ?? [];
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

// Reading and writing a path of the game, safe for the names of a record: any
// name works, "__proto__" and "constructor" too (ramda sets the prototype for
// the first and reads the inherited value of the second)
export const valueAt = (keys, object) =>
  keys.reduce((node, key) => (own(node, key) ? node[key] : undefined), object);

const copyOf = (node) =>
  Array.isArray(node)
    ? [...node]
    : Object.fromEntries(Object.entries(isObject(node) ? node : {}));

const define = (node, key, value) =>
  Object.defineProperty(node, key, {
    value,
    enumerable: true,
    writable: true,
    configurable: true,
  });

const assocSafe = (keys, value, object) => {
  if (keys.length === 0) return value;
  const [key, ...rest] = keys;
  const child = own(object, key) ? object[key] : undefined;
  return define(
    copyOf(object),
    key,
    rest.length === 0
      ? value
      : assocSafe(rest, value, child ?? (Number.isInteger(rest[0]) ? [] : {})),
  );
};

const dissocSafe = (keys, object) => {
  if (object == null || keys.length === 0) return object;
  const [key, ...rest] = keys;
  if (rest.length === 0) {
    if (Array.isArray(object) && isIndex(key)) return remove(key, 1, object);
    const result = copyOf(object);
    delete result[key];
    return result;
  }
  return own(object, key) && object[key] != null
    ? define(copyOf(object), key, dissocSafe(rest, object[key]))
    : copyOf(object);
};

export const setValue = (game, keys, value) => assocSafe(keys, value, game);

// Removes the key, and the objects this left empty (an object that was
// already empty stays, and the info is never removed). The objects at or above
// the floor (a number of keys) are kept even when emptied.
export const clearValue = (game, keys, floor = 0) => {
  if (valueAt(keys, game) === undefined) return game;

  let next = dissocSafe(keys, game);
  for (
    let parent = init(keys);
    parent.length > floor &&
    !equals(parent, ["info"]) &&
    !isEmpty(valueAt(parent, game)) &&
    isEmpty(valueAt(parent, next));
    parent = init(parent)
  ) {
    next = dissocSafe(parent, next);
  }
  return next;
};

// The entries of a record (an object of any names) in another order or with
// another name, built so that no name is special
export const renameKey = (record, from, to) =>
  Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key === from ? to : key,
      value,
    ]),
  );

export const removeKey = (record, name) =>
  Object.fromEntries(Object.entries(record).filter(([key]) => key !== name));

// The record with the name and its value inserted at the index (at the end
// when out of range)
export const insertKey = (record, index, name, value) =>
  Object.fromEntries(insert(index, [name, value], Object.entries(record)));

// The name, or the name and the first number from 2 that is free
export const freeKey = (record, name) => {
  let candidate = name;
  for (let n = 2; own(record, candidate); n++) candidate = `${name}${n}`;
  return candidate;
};

// The value a new entry of a record starts with: what the schema asks for
// (its default, the first choice, the empty value of its type)
export const defaultValue = (schema, root) => {
  const node = resolveAllOf(schema, root);
  if (node?.default !== undefined) return structuredClone(node.default);
  if (Array.isArray(node?.enum)) return node.enum[0];
  const alternative = node?.oneOf?.[0] ?? node?.anyOf?.[0];
  if (alternative) return defaultValue(alternative, root);
  switch (node?.type) {
    case "number":
    case "integer":
      return node.minimum ?? 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object":
      return {};
    default:
      return "";
  }
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
  const list = valueAt(keys, game) ?? [];
  const at = Math.max(0, Math.min(index, list.length));
  return assocSafe(keys, insert(at, item, list), game);
};

// Removes the item, and the list when this empties it
export const removeAt = (game, keys, index) => {
  const list = valueAt(keys, game);
  if (!Array.isArray(list) || index < 0 || index >= list.length) return game;
  return list.length === 1
    ? dissocSafe(keys, game)
    : assocSafe(keys, remove(index, 1, list), game);
};

export const moveItem = (game, keys, from, to) => {
  const list = valueAt(keys, game);
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
  return assocSafe(keys, move(from, to, list), game);
};

// The first number, from the count of the list up, that no item has as its
// name (or another key, the train of a phase)
export const nextName = (items = [], key = "name") => {
  const names = items.flatMap((item) =>
    [item?.[key]]
      .flat()
      .filter((name) => name !== undefined)
      .map(String),
  );
  let n = items.length + 1;
  while (names.includes(String(n))) n++;
  return String(n);
};

// The highest number of the items plus one, for a list whose items are
// identified by a number (the players): a number, not text
export const nextNumber = (items = [], key = "number") =>
  items.reduce(
    (max, item) =>
      typeof item?.[key] === "number" && item[key] > max ? item[key] : max,
    0,
  ) + 1;

// The free identity of a new item: a name, or a number for a list keyed by one
export const nextId = (items, idKey = "name") =>
  idKey === "name" ? nextName(items) : nextNumber(items, idKey);

// Whether the items are named: phases may be keyed by their train instead
export const isNamed = (items) => items.some((item) => item?.name);

// A new item: the defaults of its list (what the schema requires besides the
// name), named to not clash with the others. With unique "named" a list of
// items that have no names, a phase list keyed by train, gets a train that is
// free instead (a name would make one phase differ from the others).
export const newItem = (
  items,
  defaults = {},
  unique = true,
  idKey = "name",
) => {
  const base = typeof defaults === "function" ? defaults(items) : defaults;
  if (unique === "named" && items.length > 0 && !isNamed(items)) {
    return { ...base, train: nextName(items, "train") };
  }
  return { ...(unique && { [idKey]: nextId(items, idKey) }), ...base };
};

// An abbreviation no company has, whatever the case: the base, or the base
// and the first number from 2 that is free (PRR, PRR2). A number the base ends
// with is not kept (PRR2 is copied as PRR3, not PRR22).
export const nextAbbrev = (items = [], base = "NEW") => {
  const taken = items.map((item) => String(item?.abbrev ?? "").toLowerCase());
  if (typeof base !== "string") base = "NEW";
  const stem = base.replace(/\d+$/, "") || base;
  let candidate = base;
  for (let n = 2; taken.includes(candidate.toLowerCase()); n++) {
    candidate = `${stem}${n}`;
  }
  return candidate;
};
