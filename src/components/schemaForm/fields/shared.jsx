import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { TriangleAlert } from "lucide-react";

import { Label } from "@/components/ui/label";

import { issueText } from "@/components/schemaForm/issueText";
import {
  humanize,
  isRequired,
  issuesFor,
  valueAt,
} from "@/components/schemaForm/resolve";
import { useSchemaText } from "@/components/schemaForm/schemaText";

// What the fields need of the form: the root schema, the game, its problems
// and how to set and clear the value of a path, and insert, remove and move the
// items of a list. clear returns false when the value cannot be cleared (a
// required key).
export const SchemaFormContext = createContext(null);

export const UNSET = "__unset__";
export const FORMAT = (value) =>
  value === undefined || value === null ? "" : String(value);

// A text that is typed and passed on when the field is left. What is typed is
// also passed on when the field is removed (closing the panel, going to
// another page), which fires no blur. submit returns false to refuse the text,
// which then goes back to the value.
export const useDraft = (value, submit, format = FORMAT, same) => {
  const [text, setText] = useState(format(value));
  const dirty = useRef(false);
  const latest = useRef({});
  latest.current = { text, submit };

  useEffect(() => {
    setText((text) =>
      (same ? same(text, value) : text === format(value))
        ? text
        : format(value),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(
    () => () => {
      if (dirty.current) latest.current.submit(latest.current.text);
    },
    [],
  );

  const change = (next) => {
    dirty.current = true;
    setText(next);
  };

  const commit = () => {
    if (!dirty.current) return;
    dirty.current = false;
    if (submit(text) === false) setText(format(value));
  };

  return { text, change, commit };
};

// A field the schema marks deprecated stays editable: its label has a badge,
// and a note (with a way to remove the value) shows while it has a value
const DeprecatedNote = ({ id, keys, onRemove }) => {
  const { t } = useTranslation();
  const key = keys.filter((k) => typeof k !== "number").join("_");

  return (
    <p
      id={`${id}-deprecated`}
      className="flex flex-row flex-wrap items-center gap-1 text-xs text-warning-text"
    >
      <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
      <span>
        {t([`problems.deprecations.${key}`, "problems.deprecated-generic"])}
      </span>
      <button
        type="button"
        className="underline underline-offset-2"
        onClick={onRemove}
      >
        {t("editPanel.removeValue")}
      </button>
    </p>
  );
};

export const FieldShell = ({
  id,
  label,
  required,
  description,
  errors = [],
  deprecated,
  hasValue,
  keys,
  onRemove,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id} id={`${id}-label`}>
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            {" *"}
          </span>
        )}
        {deprecated && (
          <span className="ml-2 rounded-md border border-warning-text px-1.5 py-0.5 text-xs font-normal text-warning-text">
            {t("problems.deprecated")}
          </span>
        )}
      </Label>
      {children}
      {description && (
        <p id={`${id}-help`} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {deprecated && hasValue && (
        <DeprecatedNote id={id} keys={keys} onRemove={onRemove} />
      )}
      {errors.map((error, index) => (
        <p
          key={index}
          id={`${id}-error-${index}`}
          role="alert"
          className={
            error.severity === "warning"
              ? "text-xs text-warning-text"
              : "text-xs text-destructive"
          }
        >
          {typeof error === "string" ? error : issueText(t, error)}
        </p>
      ))}
    </div>
  );
};

const describedBy = (id, description, errors, deprecated) =>
  [
    description && `${id}-help`,
    deprecated && `${id}-deprecated`,
    ...errors.map((_, index) => `${id}-error-${index}`),
  ]
    .filter(Boolean)
    .join(" ") || undefined;

export const useField = (keys, schema) => {
  const form = useContext(SchemaFormContext);
  const { t } = useTranslation();
  const text = useSchemaText();
  const id = useId();
  const [local, setLocal] = useState(null);

  const value = valueAt(keys, form.game);
  // The deprecated issue is the note of the field (the same warning twice
  // helps nobody)
  const issues = issuesFor(form.issues, keys).filter(
    (issue) => issue.code !== "deprecated",
  );
  const errors = [...(local ? [t(local)] : []), ...issues];
  const required = isRequired(form.root, keys);
  const deprecated = !!schema.deprecated;
  const invalid = errors.some((error) => error.severity !== "warning");

  const set = (next) => {
    setLocal(null);
    form.set(keys, next);
  };
  const clear = () => {
    if (form.clear(keys) === false) {
      setLocal("editPanel.required");
      return false;
    }
    setLocal(null);
  };

  return {
    id,
    value,
    errors,
    required,
    set,
    clear,
    setLocal,
    label: humanize(keys[keys.length - 1]),
    description: text(schema.description),
    keys,
    deprecated,
    hasValue: value !== undefined,
    onRemove: clear,
    invalid,
    aria: (extra) => ({
      id,
      "aria-required": required || undefined,
      "aria-invalid": invalid || undefined,
      "aria-describedby": describedBy(
        id,
        schema.description,
        errors,
        deprecated && value !== undefined,
      ),
      ...extra,
    }),
  };
};
