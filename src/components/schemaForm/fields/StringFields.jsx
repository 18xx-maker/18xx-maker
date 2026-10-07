import { useTranslation } from "react-i18next";

import { equals } from "ramda";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  FORMAT,
  FieldShell,
  useDraft,
  useField,
} from "@/components/schemaForm/fields/shared";
import {
  coerceStringOrNumber,
  formatLines,
  formatList,
  formatRevenue,
  parseLines,
  parseList,
  parseRevenue,
  sameList,
} from "@/components/schemaForm/resolve";

export const StringField = ({ keys, schema, long }) => {
  const field = useField(keys, schema);
  const draft = useDraft(field.value, (text) =>
    text === "" ? field.clear() : field.set(text),
  );
  const Control = long ? Textarea : Input;

  return (
    <FieldShell {...field}>
      <Control
        {...field.aria()}
        value={draft.text}
        onChange={(event) => draft.change(event.target.value)}
        onBlur={draft.commit}
        onKeyDown={(event) => !long && event.key === "Enter" && draft.commit()}
      />
    </FieldShell>
  );
};

export const StringOrNumberField = ({ keys, schema }) => {
  const field = useField(keys, schema);
  const draft = useDraft(
    field.value,
    (text) =>
      text.trim() === ""
        ? field.clear()
        : field.set(coerceStringOrNumber(text)),
    FORMAT,
    (text, value) => coerceStringOrNumber(text) === value,
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

// A number, a list of numbers (10/20) or text, from what is typed
export const RevenueField = ({ keys, schema }) => {
  const field = useField(keys, schema);
  const draft = useDraft(
    field.value,
    (text) => {
      const revenue = parseRevenue(text);
      return revenue === undefined ? field.clear() : field.set(revenue);
    },
    formatRevenue,
    (text, value) => equals(parseRevenue(text), value),
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

// One text a line: a string for one line, a list for more (the train and the
// notes of a phase)
export const StringListField = ({ keys, schema }) => {
  const { t } = useTranslation();
  const field = useField(keys, schema);
  const draft = useDraft(
    field.value,
    (text) => {
      const list = parseList(text);
      if (list === undefined) return field.clear();
      if (!sameList(text, field.value)) field.set(list);
    },
    formatList,
    sameList,
  );
  const aria = field.aria();
  const hint = `${field.id}-hint`;

  return (
    <FieldShell {...field}>
      <Textarea
        {...aria}
        aria-describedby={[aria["aria-describedby"], hint]
          .filter(Boolean)
          .join(" ")}
        value={draft.text}
        onChange={(event) => draft.change(event.target.value)}
        onBlur={draft.commit}
      />
      <p id={hint} className="text-xs text-muted-foreground">
        {t("editPanel.onePerLine")}
      </p>
    </FieldShell>
  );
};

// One text a line, always a list of texts, even for a line (the numbers of
// the number cards, the upgrades of a tile)
export const StringArrayField = ({ keys, schema }) => {
  const { t } = useTranslation();
  const field = useField(keys, schema);
  const draft = useDraft(
    field.value,
    (text) => {
      const lines = parseLines(text);
      if (lines === undefined) return field.clear();
      if (!equals(lines, field.value)) field.set(lines);
    },
    formatLines,
    (text, value) => equals(parseLines(text), value),
  );
  const aria = field.aria();
  const hint = `${field.id}-hint`;

  return (
    <FieldShell {...field}>
      <Textarea
        {...aria}
        aria-describedby={[aria["aria-describedby"], hint]
          .filter(Boolean)
          .join(" ")}
        value={draft.text}
        onChange={(event) => draft.change(event.target.value)}
        onBlur={draft.commit}
      />
      <p id={hint} className="text-xs text-muted-foreground">
        {t("editPanel.onePerLineList")}
      </p>
    </FieldShell>
  );
};

// Anything without a form: the JSON of the value, set when the field is left
export const JsonField = ({ keys, schema }) => {
  const field = useField(keys, schema);
  const format = (value) =>
    value === undefined ? "" : JSON.stringify(value, null, 2);
  const draft = useDraft(
    field.value,
    (text) => {
      if (text.trim() === "") return field.clear();
      try {
        field.set(JSON.parse(text));
      } catch {
        field.setLocal("editPanel.invalidJson");
        return true;
      }
    },
    format,
  );

  return (
    <FieldShell {...field}>
      <Textarea
        {...field.aria()}
        className="font-mono"
        value={draft.text}
        onChange={(event) => draft.change(event.target.value)}
        onBlur={draft.commit}
      />
    </FieldShell>
  );
};
