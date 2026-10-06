import { path, uniqBy } from "ramda";

import { resolveSchema } from "@/components/schemaForm/resolve";

// A string field of the game schema can name something else in the game: a
// company, a train. The schema says so with the annotation
//   "x-ref": { "from": "companies", "key": "abbrev", "label": "name" }
// from is the dotted path of a list in the game, key the property of its items
// that names them (none for a list of strings) and label the property shown
// next to the name. It is an annotation: validation ignores it, a value that
// names nothing stays valid.

// The annotated places of a schema, as { path, ref }: a property is its name,
// the items of a list "*". A field that is a string or a list of strings gives
// both its own path and the one of its items. Follows $ref (not into itself),
// oneOf, anyOf and allOf.
export const refPaths = (schema, root = schema) => {
  const found = [];
  const walk = (node, keys, seen) => {
    if (!node || typeof node !== "object") return;
    if (node.$ref) {
      if (seen.includes(node.$ref)) return;
      const { $ref, ...rest } = node;
      walk(resolveSchema({ $ref }, root), keys, [...seen, $ref]);
      walk(rest, keys, seen);
      return;
    }
    if (node["x-ref"]) found.push({ path: keys, ref: node["x-ref"] });
    for (const part of [
      ...(node.oneOf ?? []),
      ...(node.anyOf ?? []),
      ...(node.allOf ?? []),
    ]) {
      walk(part, keys, seen);
    }
    for (const [key, child] of Object.entries(node.properties ?? {})) {
      walk(child, [...keys, key], seen);
    }
    if (node.items && !Array.isArray(node.items)) {
      walk(node.items, [...keys, "*"], seen);
    }
  };
  walk(schema, [], []);
  return found;
};

// The names the game has for an x-ref: [{ value, label }], without
// duplicates. A game without the list has none.
export const refOptions = (ref, game) => {
  const list = path(ref.from.split("."), game);
  if (!Array.isArray(list)) return [];

  const options = list.flatMap((item) => {
    const named = ref.key ? item?.[ref.key] : item;
    if (typeof named !== "string" && typeof named !== "number") return [];
    const label = ref.label ? item?.[ref.label] : undefined;
    return String(named) === ""
      ? []
      : [
          {
            value: String(named),
            ...(label !== undefined &&
              label !== "" && { label: String(label) }),
          },
        ];
  });
  return uniqBy((option) => option.value, options);
};
