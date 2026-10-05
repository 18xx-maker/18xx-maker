import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { equals, path } from "ramda";

import SchemaField, {
  SchemaFormContext,
} from "@/components/schemaForm/SchemaField";
import {
  GAME_INFO_KEYS,
  clearValue,
  isRequired,
  setValue,
} from "@/components/schemaForm/resolve";

import schema from "@/schemas/game.schema.json";
import { editGame, selectGameProblems } from "@/state";

// A form for the game info, generated from the game schema: a property, type
// or enum value added to the schema in these sections shows up here. Edits go
// through editGame, saving stays with the changes page.
const GameInfoForm = ({ game }) => {
  const dispatch = useDispatch();
  const issues = useSelector((state) =>
    selectGameProblems(state, game.meta.slug),
  );

  const set = useCallback(
    (keys, value) => {
      dispatch(
        editGame((g) =>
          equals(path(keys, g), value) ? g : setValue(g, keys, value),
        ),
      );
    },
    [dispatch],
  );

  const clear = useCallback(
    (keys) => {
      if (isRequired(schema, keys)) return false;
      dispatch(editGame((g) => clearValue(g, keys)));
    },
    [dispatch],
  );

  const context = useMemo(
    () => ({ root: schema, game, issues, set, clear }),
    [game, issues, set, clear],
  );

  return (
    <SchemaFormContext.Provider value={context}>
      <div className="flex flex-col gap-4">
        {GAME_INFO_KEYS.map((key) => (
          <SchemaField key={key} keys={[key]} schema={schema.properties[key]} />
        ))}
      </div>
    </SchemaFormContext.Provider>
  );
};

export default GameInfoForm;
