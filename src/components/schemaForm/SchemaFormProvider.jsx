import { useCallback, useMemo } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";

import { equals } from "ramda";

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

import schema from "@/schemas/game.schema.json";
import { editGame, selectGameProblems } from "@/state";

// What the forms generated from the game schema share: the game, its problems
// and the ways to change it. Edits go through editGame, saving stays with the
// changes page.
const SchemaFormProvider = ({ game, children }) => {
  const dispatch = useDispatch();
  const store = useStore();
  const issues = useSelector((state) =>
    selectGameProblems(state, game.meta.slug),
  );

  const edit = useCallback((fn) => dispatch(editGame(fn)), [dispatch]);

  const set = useCallback(
    (keys, value) =>
      edit((g) =>
        equals(valueAt(keys, g), value) ? g : setValue(g, keys, value),
      ),
    [edit],
  );

  const clear = useCallback(
    (keys) => {
      if (isRequired(schema, keys)) return false;
      edit((g) => clearValue(g, keys));
    },
    [edit],
  );

  const insert = useCallback(
    (keys, index, item) => edit((g) => insertAt(g, keys, index, item)),
    [edit],
  );
  const remove = useCallback(
    (keys, index) => edit((g) => removeAt(g, keys, index)),
    [edit],
  );
  const move = useCallback(
    (keys, from, to) => edit((g) => moveItem(g, keys, from, to)),
    [edit],
  );

  // The game now, not the one of the last render: an edit that was just
  // dispatched (a blur) is in it
  const latest = useCallback(() => store.getState().game, [store]);

  const context = useMemo(
    () => ({
      root: schema,
      game,
      issues,
      latest,
      edit,
      set,
      clear,
      insert,
      remove,
      move,
    }),
    [game, issues, latest, edit, set, clear, insert, remove, move],
  );

  return (
    <SchemaFormContext.Provider value={context}>
      {children}
    </SchemaFormContext.Provider>
  );
};

export default SchemaFormProvider;
