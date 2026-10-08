import { ELEMENT_KEYS, isSingle } from "@/components/hexEditor/hexModel";
import { mixedItem, resolveAllOf } from "@/components/schemaForm/resolve";

import tilesDefs from "@/schemas/tiles.defs.json";

// The schema the fields of the hex editor read: the editor works on a game of
// its own, { hex }, the hex (a group of the map) as an object.
export const HEX_ROOT = {
  type: "object",
  properties: { hex: { $ref: "tiles.defs.json#/definitions/hex" } },
};

export const HEX_PROPERTIES = tilesDefs.definitions.hex.properties;

// The schema of the hex, with its references followed
export const hexSchema = () =>
  resolveAllOf({ $ref: "tiles.defs.json#/definitions/hex" }, HEX_ROOT);

// How the editor handles each property of a hex:
//   "elements"  a list of elements (or one element) in the element list,
//   "control"   a control of its own above the elements,
//   "managed"   the map decides it (the hexes of the group).
// A property of a tile only (it does nothing for a hex of the map) is in
// RAW_JSON, and stays in the JSON view.
export const FORM_KINDS = {
  ...Object.fromEntries(ELEMENT_KEYS.map((key) => [key, "elements"])),
  color: "control",
  half: "control",
  stripeRotation: "control",
  removeBorders: "control",
  hexes: "managed",
};

export const RAW_JSON = [
  "print",
  "quantity",
  "tile",
  "group",
  "clipPath",
  "rotation",
  "rotations",
];

// The elements whose list holds items of more than one shape (a token is text,
// a number or one of several objects): they have no fields in the form, only
// the JSON of the element
export const JSON_ONLY = ["tokens"];

// The schema of one element: the object a list holds, or the object itself
export const elementSchema = (key) => {
  // Through the hex, so that the references inside are followed in the
  // document they are written in
  const node = resolveAllOf(hexSchema().properties[key], HEX_ROOT);
  if (isSingle(key)) return node;
  const items = node?.items;
  return (
    (items && (mixedItem(items, HEX_ROOT) ?? resolveAllOf(items, HEX_ROOT))) ||
    {}
  );
};
