import ReferenceField from "@/components/schemaForm/ReferenceField";
import { JsonField } from "@/components/schemaForm/SchemaField";
import {
  isReferenceValue,
  referenceOf,
  valueAt,
} from "@/components/schemaForm/resolve";
import { TokenEditField } from "@/components/tokenEditor/TokenEditButton";

// The places a token of a card is edited in the token editor, by the path of
// the field: the token of a company and of a private
const TOKEN_SOURCES = { companies: "company", privates: "private" };
const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

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
      return isReferenceValue(valueAt(keys, game), reference.mode)
        ? { reference }
        : undefined;
    },
    render: (props) => <ReferenceField {...props} />,
  },
  {
    // The token of a company or a private: its drawing and a button that opens
    // the token editor. A token that is not an object stays in a JSON field.
    match: (node, keys, { game }) => {
      const [section, index, key] = keys;
      const source = TOKEN_SOURCES[section];
      if (!source || keys.length !== 3 || key !== "token") return undefined;
      if (!Number.isInteger(Number(index))) return undefined;
      const value = valueAt(keys, game);
      return {
        tokenSource: source,
        asJson: value !== undefined && !isPlainObject(value),
      };
    },
    render: ({ tokenSource, asJson, ...props }) =>
      asJson ? (
        <JsonField {...props} />
      ) : (
        <TokenEditField {...props} source={tokenSource} />
      ),
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
