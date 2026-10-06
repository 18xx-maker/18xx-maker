import { useTranslation } from "react-i18next";

import {
  FieldShell,
  useDraft,
  useField,
} from "@/components/schemaForm/SchemaField";
import ColorInput from "@/components/tokenEditor/ColorInput";

// A color of a token: a name of the theme or the game, a hex color (typed or
// picked) or any other CSS color. A color of nothing is no value.
const ColorField = ({ keys, schema }) => {
  const { t } = useTranslation();
  const field = useField(keys, schema);
  const draft = useDraft(field.value, (text) =>
    text.trim() === "" ? field.clear() : field.set(text.trim()),
  );

  return (
    <FieldShell {...field}>
      <ColorInput
        {...field.aria()}
        value={draft.text}
        pickLabel={t("editPanel.pickColor", { name: field.label })}
        onChange={draft.change}
        onSelect={(color) => {
          draft.change(color);
          field.set(color);
        }}
        onCommit={draft.commit}
      />
    </FieldShell>
  );
};

export default ColorField;
