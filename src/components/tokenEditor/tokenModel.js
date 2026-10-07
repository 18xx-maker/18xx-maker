import { isEmpty } from "ramda";

import { resolveAllOf } from "@/components/schemaForm/resolve";

import { isObject } from "@/util/jsonEditor";

// What the token editor does with the value of a token, without a component.

// Whether a value says nothing: no value, empty text, nothing in a list or
// object. A list of only empty texts says nothing either (a list of colors
// with none picked).
export const isBlank = (value) => {
  if (value === undefined || value === null || value === "") return true;
  if (Array.isArray(value)) return value.every(isBlank);
  return isObject(value) && isEmpty(value);
};

// The token with a value set at the key, or the key dropped when the value
// says nothing. A value false stays: the token can ask for it. Every other
// key stays as it is, a blank one the game has included (it can be on
// purpose). The key order of the token does not change.
export const setTokenKey = (token, key, value) => {
  const object = isObject(token) ? token : {};
  if (!isBlank(value)) return { ...object, [key]: value };
  return Object.fromEntries(
    Object.entries(object).filter(([name]) => name !== key),
  );
};

// A token of a list of tokens is text or a number (the label) or an object.
// The editor edits an object.
export const tokenToObject = (value) => {
  if (isObject(value)) return value;
  return typeof value === "string" || typeof value === "number"
    ? { label: value }
    : {};
};

// What to store for the object the editor made: the token the item was. An
// item that was text or a number stays one while only its label is set, the
// label keeping its type. A token of a company or private is always an object
// (bare is false). An object with nothing in it is no token: undefined, or an
// empty text for a bare item.
export const tokenFromObject = (object, { bare = false, original } = {}) => {
  const keys = Object.keys(object);
  const bareOriginal =
    bare && (typeof original === "string" || typeof original === "number");
  if (bareOriginal && keys.length === 0) return "";
  if (bareOriginal && keys.length === 1 && keys[0] === "label") {
    return object.label;
  }
  return keys.length === 0 && !bare ? undefined : object;
};

// The decorations of a token, the shapes drawn on it: the property that turns
// one on, in the order the editor lists them
export const DECORATIONS = [
  "bar",
  "target",
  "stripe",
  "stripes",
  "curvedStripes",
  "spiral",
  "circle",
  "shield",
  "shield3",
  "kiteshield",
  "star5",
  "square",
  "halves",
  "quarters",
  "sexies",
  "sunrise",
  "hexagram",
];

// The properties of the schema that belong to a decoration: it starts with the
// name of the decoration and goes on in capitals (barHeight, shield3TopLeft;
// not "stripesWidth" for "stripe"). Derived from the schema, so a property
// that is added later joins its decoration.
export const decorationCatalog = (properties) => {
  const keys = Object.keys(properties ?? {});
  return DECORATIONS.filter((name) => keys.includes(name)).map((name) => ({
    name,
    keys: [
      name,
      ...keys.filter(
        (key) => key !== name && new RegExp(`^${name}[A-Z]`).test(key),
      ),
    ],
  }));
};

// The groups of the editor besides decorations; every other property is in
// "advanced"
export const TOKEN_GROUPS = {
  shape: ["tokenShape", "width", "destination", "reserved"],
  content: ["logo", "icon", "label", "label2", "label2Position"],
  colors: ["color", "labelColor", "label2Color", "iconColor", "outline"],
};

// The properties of the schema that no group has: they are all in "advanced"
export const advancedKeys = (properties) => {
  const taken = new Set([
    ...Object.values(TOKEN_GROUPS).flat(),
    ...decorationCatalog(properties).flatMap((decoration) => decoration.keys),
  ]);
  return Object.keys(properties ?? {}).filter((key) => !taken.has(key));
};

// The decorations the token has: one of its properties is set
export const activeDecorations = (properties, token) =>
  decorationCatalog(properties).filter((decoration) =>
    decoration.keys.some((key) => !isBlank(token?.[key])),
  );

// The length of a list of colors of the schema (halves have two)
export const tupleLength = (node, root) => resolveAllOf(node, root)?.maxItems;

// The colors of a tuple as the field shows them: as many as the schema asks,
// an empty text for a color not given
export const padTuple = (value, length) =>
  Array.from({ length }, (_, index) =>
    Array.isArray(value) && typeof value[index] === "string"
      ? value[index]
      : "",
  );

// The tuple with a color changed, the length kept ("" for the others), or
// undefined when no color is left
export const setTuple = (value, length, index, color) => {
  const next = padTuple(value, length).map((current, i) =>
    i === index ? color.trim() : current,
  );
  return next.every((item) => item === "") ? undefined : next;
};

// A value the editor's field of this kind understands; anything else is left
// to the JSON field, so it is not lost
export const isBoolOrColorValue = (value) =>
  value === undefined ||
  typeof value === "boolean" ||
  typeof value === "string";

// A list longer than the schema asks is left to the JSON field: the tuple
// field would cut it
export const isTupleValue = (value, length = Infinity) =>
  value === undefined ||
  (Array.isArray(value) &&
    value.length <= length &&
    value.every((item) => typeof item === "string"));
