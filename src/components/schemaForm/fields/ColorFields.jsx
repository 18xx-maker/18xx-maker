import { useContext } from "react";
import { useTranslation } from "react-i18next";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { JsonField } from "@/components/schemaForm/fields/StringFields";
import {
  FieldShell,
  SchemaFormContext,
  useDraft,
  useField,
} from "@/components/schemaForm/fields/shared";
import { valueAt } from "@/components/schemaForm/resolve";
import ColorInput from "@/components/tokenEditor/ColorInput";
import {
  isBoolOrColorValue,
  isTupleValue,
  padTuple,
  setTuple,
  tupleLength,
} from "@/components/tokenEditor/tokenModel";

// The preview of a color is a swatch that is also the picker: a native color
// input over it, which only knows #rrggbb. The color names of the game and
// other CSS colors are typed.
const HEX = /^#[0-9a-f]{6}$/i;

const ColorField = ({ keys, schema }) => {
  const { t } = useTranslation();
  const field = useField(keys, schema);
  const draft = useDraft(field.value, (text) =>
    text.trim() === "" ? field.clear() : field.set(text.trim()),
  );
  const preview = draft.text.trim();

  return (
    <FieldShell {...field}>
      <div className="flex flex-row items-center gap-2">
        <span
          className="relative size-9 shrink-0 overflow-hidden rounded-md border focus-within:ring-1 focus-within:ring-ring"
          style={{ backgroundColor: preview || undefined }}
          data-testid="color-swatch"
        >
          <input
            type="color"
            aria-label={t("editPanel.pickColor", { name: field.label })}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
            value={HEX.test(preview) ? preview : "#000000"}
            onChange={(event) => field.set(event.target.value)}
          />
        </span>
        <Input
          {...field.aria()}
          value={draft.text}
          onChange={(event) => draft.change(event.target.value)}
          onBlur={draft.commit}
          onKeyDown={(event) => event.key === "Enter" && draft.commit()}
        />
      </div>
    </FieldShell>
  );
};

// A color by phase is an object: JSON, as the other shapes
export const ColorValueField = (props) => {
  const form = useContext(SchemaFormContext);
  const value = valueAt(props.keys, form.game);
  return value !== null && typeof value === "object" ? (
    <JsonField {...props} />
  ) : (
    <ColorField {...props} />
  );
};

// True or a color (the shapes of a token: true draws it in white): a color
// that is typed or picked, and a checkbox for true. A value that is neither
// stays JSON.
const BoolOrColorInput = ({ keys, schema }) => {
  const { t } = useTranslation();
  const field = useField(keys, schema);
  const draft = useDraft(
    field.value,
    (text) => {
      if (text.trim() !== "") return field.set(text.trim());
      if (typeof field.value === "string") return field.clear();
    },
    (value) => (typeof value === "string" ? value : ""),
  );
  const aria = field.aria();

  return (
    <FieldShell {...field}>
      <ColorInput
        {...aria}
        value={draft.text}
        pickLabel={t("editPanel.pickColor", { name: field.label })}
        onChange={draft.change}
        onSelect={(color) => {
          draft.change(color);
          field.set(color);
        }}
        onCommit={draft.commit}
      />
      <div className="flex flex-row items-center gap-2">
        <Checkbox
          id={`${field.id}-true`}
          checked={field.value === true}
          onCheckedChange={(on) =>
            on === true ? field.set(true) : field.clear()
          }
        />
        <Label htmlFor={`${field.id}-true`}>
          {t("editPanel.tokenEditor.white")}
        </Label>
      </div>
    </FieldShell>
  );
};

export const BoolOrColorField = (props) => {
  const form = useContext(SchemaFormContext);
  return isBoolOrColorValue(valueAt(props.keys, form.game)) ? (
    <BoolOrColorInput {...props} />
  ) : (
    <JsonField {...props} />
  );
};

// One color of a list of colors of a fixed length
const TupleColor = ({ keys, field, length, index }) => {
  const { t } = useTranslation();
  const form = useContext(SchemaFormContext);
  const name = t("editPanel.tokenEditor.colorAt", {
    name: field.label,
    index: index + 1,
  });
  const draft = useDraft(padTuple(field.value, length)[index], (text) => {
    const next = setTuple(valueAt(keys, form.latest()), length, index, text);
    return next === undefined ? field.clear() : field.set(next);
  });

  return (
    <ColorInput
      aria-label={name}
      value={draft.text}
      pickLabel={t("editPanel.pickColor", { name })}
      onChange={draft.change}
      onSelect={(color) => {
        draft.change(color);
        field.set(setTuple(valueAt(keys, form.latest()), length, index, color));
      }}
      onCommit={draft.commit}
    />
  );
};

// A list of colors of the same length every time (halves are two): a color
// for each place, the places left empty stay in the list so the colors keep
// theirs. A value that is not a list of texts stays JSON.
const ColorTupleInput = ({ keys, schema }) => {
  const { root } = useContext(SchemaFormContext);
  const field = useField(keys, schema);
  const length = tupleLength(schema, root);

  return (
    <FieldShell {...field}>
      <div
        {...field.aria({ role: "group", "aria-required": undefined })}
        aria-labelledby={`${field.id}-label`}
        className="flex flex-col gap-2"
      >
        {Array.from({ length }, (_, index) => (
          <TupleColor
            key={index}
            keys={keys}
            field={field}
            length={length}
            index={index}
          />
        ))}
      </div>
    </FieldShell>
  );
};

export const ColorTupleField = (props) => {
  const form = useContext(SchemaFormContext);
  const length = tupleLength(props.schema, form.root);
  return isTupleValue(valueAt(props.keys, form.game), length) ? (
    <ColorTupleInput {...props} />
  ) : (
    <JsonField {...props} />
  );
};
