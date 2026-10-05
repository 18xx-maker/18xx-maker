import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { path as getIn } from "ramda";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import NumberField from "@/components/form/NumberField";
import { issueText } from "@/components/schemaForm/issueText";
import {
  coerceStringOrNumber,
  humanize,
  isRequired,
  issuesFor,
  kindOf,
  resolveSchema,
} from "@/components/schemaForm/resolve";

// What the fields need of the form: the root schema, the game, its problems
// and how to set and clear the value of a path. clear returns false when the
// value cannot be cleared (a required key).
export const SchemaFormContext = createContext(null);

const UNSET = "__unset__";
const FORMAT = (value) =>
  value === undefined || value === null ? "" : String(value);

// A text that is typed and passed on when the field is left. What is typed is
// also passed on when the field is removed (closing the panel, going to
// another page), which fires no blur. submit returns false to refuse the text,
// which then goes back to the value.
const useDraft = (value, submit, format = FORMAT, same) => {
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

export const FieldShell = ({
  id,
  label,
  required,
  description,
  errors = [],
  children,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            {" *"}
          </span>
        )}
      </Label>
      {children}
      {description && (
        <p id={`${id}-help`} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {errors.map((error, index) => (
        <p
          key={index}
          id={`${id}-error-${index}`}
          role="alert"
          className="text-xs text-destructive"
        >
          {typeof error === "string" ? error : issueText(t, error)}
        </p>
      ))}
    </div>
  );
};

const describedBy = (id, description, errors) =>
  [
    description && `${id}-help`,
    ...errors.map((_, index) => `${id}-error-${index}`),
  ]
    .filter(Boolean)
    .join(" ") || undefined;

const useField = (keys, schema) => {
  const form = useContext(SchemaFormContext);
  const { t } = useTranslation();
  const id = useId();
  const [local, setLocal] = useState(null);

  const value = getIn(keys, form.game);
  const issues = issuesFor(form.issues, keys);
  const errors = [...(local ? [t(local)] : []), ...issues];
  const required = isRequired(form.root, keys);

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
    description: schema.description,
    invalid: errors.length > 0,
    aria: (extra) => ({
      id,
      "aria-invalid": errors.length > 0 || undefined,
      "aria-describedby": describedBy(id, schema.description, errors),
      ...extra,
    }),
  };
};

const StringField = ({ keys, schema, long }) => {
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

const FontWeightField = ({ keys, schema }) => {
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

const NumberValueField = ({ keys, schema }) => {
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

// A choice with an entry for "not set", unless the key is required
const ChoiceField = ({ keys, schema, options, labelOf = (value) => value }) => {
  const { t } = useTranslation();
  const field = useField(keys, schema);

  return (
    <FieldShell {...field}>
      <Select
        value={field.value === undefined ? UNSET : String(field.value)}
        onValueChange={(next) => {
          if (next === UNSET) field.clear();
          else field.set(options.find((option) => String(option) === next));
        }}
      >
        <SelectTrigger {...field.aria()}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {!field.required && (
            <SelectItem value={UNSET}>{t("editPanel.unset")}</SelectItem>
          )}
          {options.map((option) => (
            <SelectItem key={String(option)} value={String(option)}>
              {labelOf(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
};

const BooleanField = (props) => {
  const { t } = useTranslation();
  return (
    <ChoiceField
      {...props}
      options={[true, false]}
      labelOf={(value) => t(`editPanel.${value}`)}
    />
  );
};

// Anything without a form: the JSON of the value, set when the field is left
const JsonField = ({ keys, schema }) => {
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

const ObjectField = ({ keys, schema }) => {
  const form = useContext(SchemaFormContext);
  const { t } = useTranslation();
  const issues = issuesFor(form.issues, keys, false);

  return (
    <fieldset className="flex flex-col gap-4 rounded-md border p-3">
      <legend className="px-1 text-sm font-semibold">
        {humanize(keys[keys.length - 1])}
      </legend>
      {schema.description && (
        <p className="-mt-2 text-xs text-muted-foreground">
          {schema.description}
        </p>
      )}
      {issues.map((issue, index) => (
        <p key={index} role="alert" className="text-xs text-destructive">
          {issueText(t, issue)}
        </p>
      ))}
      {Object.entries(schema.properties).map(([key, child]) => (
        <SchemaField key={key} keys={[...keys, key]} schema={child} />
      ))}
    </fieldset>
  );
};

const SchemaField = ({ keys, schema }) => {
  const { root } = useContext(SchemaFormContext);
  const node = resolveSchema(schema, root);
  const props = { keys, schema: node };

  switch (kindOf(node, keys[keys.length - 1])) {
    case "string":
      return <StringField {...props} />;
    case "text":
      return <StringField {...props} long />;
    case "number":
      return <NumberValueField {...props} />;
    case "boolean":
      return <BooleanField {...props} />;
    case "enum":
      return <ChoiceField {...props} options={node.enum} />;
    case "stringOrNumber":
      return <FontWeightField {...props} />;
    case "object":
      return <ObjectField {...props} />;
    default:
      return <JsonField {...props} />;
  }
};

export default SchemaField;
