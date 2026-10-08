import { useMemo, useRef, useState } from "react";

import { equals } from "ramda";

import {
  emptyHistory,
  record,
  redo as redoStep,
  undo as undoStep,
} from "@/components/hexEditor/hexHistory";
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

  // The steps to undo and redo: they start empty with the editor, which
  // starts over for another hex. A batch (a drag) is one step: its first
  // change records the hex it started from, the others do not.
  const history = useRef(emptyHistory());
  const batch = useRef("off");
  const [, refresh] = useState(0);

  return useMemo(() => {
    const read = () => ({ ...game, hex: latest.current });
    const put = (next) => {
      latest.current = next;
      change.current(next);
      refresh((n) => n + 1);
    };
    const apply = (next) => {
      if (next === undefined || equals(next, latest.current)) return;
      if (batch.current !== "open") {
        history.current = record(history.current, latest.current);
        if (batch.current === "fresh") batch.current = "open";
      }
      put(next);
    };
    const step = (fn) => {
      const result = fn(history.current, latest.current);
      if (!result) return false;
      history.current = result.history;
      put(result.value);
      return true;
    };
    const edit = (fn) => apply(fn({ hex: latest.current }).hex);

    return {
      root: HEX_ROOT,
      history: {
        get canUndo() {
          return history.current.past.length > 0;
        },
        get canRedo() {
          return history.current.future.length > 0;
        },
        undo: () => step(undoStep),
        redo: () => step(redoStep),
        begin: () => {
          batch.current = "fresh";
        },
        end: () => {
          batch.current = "off";
        },
      },
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
        // An element that loses its last field stays, as {}: only what is
        // below the element is pruned
        edit((g) => {
          const list = Array.isArray(g.hex?.[keys[1]]);
          return clearValue(g, keys, list ? 3 : 2);
        });
      },
      insert: (keys, index, item) =>
        edit((g) => insertAt(g, keys, index, item)),
      remove: (keys, index) => edit((g) => removeAt(g, keys, index)),
      move: (keys, from, to) => edit((g) => moveItem(g, keys, from, to)),
    };
  }, [value, game, issues]);
};
