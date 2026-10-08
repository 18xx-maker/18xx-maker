import { useMemo, useRef } from "react";

import { equals } from "ramda";

import { HEX_ROOT } from "@/components/hexEditor/hexSchema";
import { SchemaFormContext } from "@/components/schemaForm/SchemaField";
import {
  clearValue,
  insertAt,
  isRequired,
  moveItem,
  removeAt,
  setValue,
  valueAt,
} from "@/components/schemaForm/resolve";

export { SchemaFormContext };

// The pointers of the problems of a hex (relative to it) as the fields have
// them, under "hex"
const rooted = (issues) =>
  (issues ?? []).map((issue) => {
    const rest = issue.pointer ?? "";
    const pointer =
      rest === "" ? "hex" : rest[0] === "[" ? `hex${rest}` : `hex.${rest}`;
    return { ...issue, pointer };
  });

// What the fields of the schema forms need, for a hex that is a value and a
// way to change it (the hex editor is controlled): the game the fields read is
// the game with the hex on it, { ...game, hex }. Every change is made on the
// hex as it is now, also when it follows a change that has not come back as a
// new value yet (a field that is left, then a click).
export const useHexForm = ({ value, onChange, game, issues }) => {
  const latest = useRef(value);
  latest.current = value;
  const change = useRef(onChange);
  change.current = onChange;

  return useMemo(() => {
    const read = () => ({ ...game, hex: latest.current });
    const apply = (next) => {
      if (next === undefined || equals(next, latest.current)) return;
      latest.current = next;
      change.current(next);
    };
    const edit = (fn) => apply(fn({ hex: latest.current }).hex);

    return {
      root: HEX_ROOT,
      game: { ...game, hex: value },
      issues: rooted(issues),
      latest: read,
      edit,
      set: (keys, next) =>
        edit((g) =>
          equals(valueAt(keys, g), next) ? g : setValue(g, keys, next),
        ),
      clear: (keys) => {
        if (isRequired(HEX_ROOT, keys)) return false;
        edit((g) => clearValue(g, keys));
      },
      insert: (keys, index, item) =>
        edit((g) => insertAt(g, keys, index, item)),
      remove: (keys, index) => edit((g) => removeAt(g, keys, index)),
      move: (keys, from, to) => edit((g) => moveItem(g, keys, from, to)),
    };
  }, [value, game, issues]);
};
