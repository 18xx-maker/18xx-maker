import { path } from "ramda";

import ReferenceField from "@/components/schemaForm/ReferenceField";
import { isReferenceValue, referenceOf } from "@/components/schemaForm/resolve";

// The editors that take a field before its kind does, first match wins.
// match(node, keys, form) gets the resolved schema of the field, its path and
// the form (root schema and game) and returns the extra props of the editor,
// or nothing to leave the field to its kind. render(props) makes the editor
// (a function, so this module can be loaded from the editors themselves).
export const overrides = [
  {
    // A string (or list of strings) the schema says names something in the
    // game: a combobox of those names
    match: (node, keys, { root, game }) => {
      const reference = referenceOf(node, root);
      if (!reference) return undefined;
      return isReferenceValue(path(keys, game), reference.mode)
        ? { reference }
        : undefined;
    },
    render: (props) => <ReferenceField {...props} />,
  },
];

// The override for a field: { override, props }, or undefined
export const overrideFor = (node, keys, form) => {
  for (const override of overrides) {
    const props = override.match(node, keys, form);
    if (props) return { override, props };
  }
  return undefined;
};
