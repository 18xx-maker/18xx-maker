import { Input } from "@/components/ui/input";

import CountInput from "@/components/form/CountInput";
import NumberField from "@/components/form/NumberField";
import {
  FORMAT,
  FieldShell,
  useDraft,
  useField,
} from "@/components/schemaForm/fields/shared";

// A whole number of at least 1, or ∞: undefined for any other text
export const parseCount = (text) => {
  const trimmed = text.trim();
  if (trimmed === "∞") return trimmed;
  return /^\d+$/.test(trimmed) && Number(trimmed) >= 1
    ? Number(trimmed)
    : undefined;
};

// A number or text from a short list (a train quantity, a phase limit): the
// parse gives undefined for text that is neither, which shows the message
export const CountField = ({
  keys,
  schema,
  parse = parseCount,
  invalid = "editPanel.invalidCount",
}) => {
  const field = useField(keys, schema);
  const draft = useDraft(
    field.value,
    (text) => {
      if (text.trim() === "") return field.clear();
      const count = parse(text);
      if (count === undefined) {
        field.setLocal(invalid);
        return true;
      }
      field.set(count);
    },
    FORMAT,
    (text, value) => parse(text) === value,
  );

  return (
    <FieldShell {...field}>
      <Input
        {...field.aria()}
        value={draft.text}
        onChange={(event) => draft.change(event.target.value)}
        onBlur={draft.commit}
        onKeyDown={(event) => event.key === "Enter" && draft.commit()}
      />
    </FieldShell>
  );
};

// A count whose only text is "∞" has a toggle for it; any other list of text
// (a toggle cannot choose among several) stays a text field
export const CountValueField = ({ keys, schema }) => {
  const text = schema.oneOf.find((a) => a.type === "string");
  const number = schema.oneOf.find((a) => a.type !== "string");
  if (text?.enum?.length !== 1 || text.enum[0] !== "∞") {
    return <CountField keys={keys} schema={schema} />;
  }
  return <CountInputField keys={keys} schema={schema} min={number?.minimum} />;
};

const CountInputField = ({ keys, schema, min = 1 }) => {
  const field = useField(keys, schema);

  return (
    <FieldShell {...field}>
      <CountInput
        {...field.aria()}
        value={field.value}
        min={min}
        onChange={field.set}
        onClear={field.clear}
        onInvalid={(invalid) =>
          field.setLocal(invalid ? "editPanel.invalidCount" : null)
        }
      />
    </FieldShell>
  );
};

export const NumberValueField = ({ keys, schema }) => {
  const field = useField(keys, schema);

  return (
    <FieldShell {...field}>
      <NumberField
        {...field.aria()}
        value={field.value}
        min={schema.minimum}
        max={schema.maximum}
        onChange={field.set}
        onClear={field.clear}
        onInvalid={(invalid) =>
          field.setLocal(invalid ? "editPanel.invalidNumber" : null)
        }
        flush
      />
    </FieldShell>
  );
};
