import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { path as getIn, move as moveIn } from "ramda";

import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Copy,
  Plus,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
  PRIMARY_KEYS,
  coerceStringOrNumber,
  humanize,
  isRequired,
  issuesFor,
  kindOf,
  newItem,
  nextName,
  resolveAllOf,
} from "@/components/schemaForm/resolve";

// What the fields need of the form: the root schema, the game, its problems
// and how to set and clear the value of a path, and insert, remove and move the
// items of a list. clear returns false when the value cannot be cleared (a
// required key).
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
      <Label htmlFor={id}>
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

const useField = (keys, schema) => {
  const form = useContext(SchemaFormContext);
  const { t } = useTranslation();
  const id = useId();
  const [local, setLocal] = useState(null);

  const value = getIn(keys, form.game);
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
    description: schema.description,
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

const StringOrNumberField = ({ keys, schema }) => {
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

// A whole number of at least 1, or ∞: undefined for any other text
const parseCount = (text) => {
  const trimmed = text.trim();
  if (trimmed === "∞") return trimmed;
  return /^\d+$/.test(trimmed) && Number(trimmed) >= 1
    ? Number(trimmed)
    : undefined;
};

const CountField = ({ keys, schema }) => {
  const field = useField(keys, schema);
  const draft = useDraft(
    field.value,
    (text) => {
      if (text.trim() === "") return field.clear();
      const count = parseCount(text);
      if (count === undefined) {
        field.setLocal("editPanel.invalidCount");
        return true;
      }
      field.set(count);
    },
    FORMAT,
    (text, value) => parseCount(text) === value,
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

// Moves focus into an item once it is on the page: to its title, or to one of
// its buttons (the other one of the pair when that is disabled). With no such
// item it goes to the add button.
const focusItem = (container, index, action) => {
  const card = container?.querySelector(`[data-item="${index}"]`);
  const target =
    action === "title"
      ? card?.querySelector("[data-title]")
      : (card?.querySelector(`[data-action="${action}"]:not(:disabled)`) ??
        card?.querySelector("[data-action]:not(:disabled)"));
  (target ?? container?.querySelector("[data-add]"))?.focus();
};

const IconButton = ({ label, action, children, ...props }) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className="size-8"
    aria-label={label}
    title={label}
    data-action={action}
    {...props}
  >
    {children}
  </Button>
);

const ItemCard = ({
  keys,
  schema,
  index,
  count,
  open,
  more,
  onOpen,
  onMore,
  title,
  kind,
  onMove,
  onDuplicate,
  onRemove,
}) => {
  const { t } = useTranslation();
  const form = useContext(SchemaFormContext);
  const bodyId = useId();
  const issues = issuesFor(form.issues, keys, false);
  const names = { item: kind, title };

  const entries = Object.entries(schema.properties);
  const primary = PRIMARY_KEYS.flatMap((key) =>
    entries.filter(([k]) => k === key),
  );
  const rest = entries.filter(([key]) => !PRIMARY_KEYS.includes(key));
  const field = ([key, child]) => (
    <SchemaField key={key} keys={[...keys, key]} schema={child} />
  );

  return (
    <li data-item={index} className="flex flex-col gap-3 rounded-md border p-3">
      <div className="flex flex-row items-center justify-between gap-2">
        <button
          type="button"
          className="flex min-w-0 flex-row items-center gap-1 rounded-sm text-left text-sm font-semibold focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
          aria-expanded={open}
          aria-controls={bodyId}
          data-title
          onClick={() => onOpen(index, !open)}
        >
          {open ? (
            <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
          )}
          <span className="truncate">{title}</span>
        </button>
        <div className="flex flex-row">
          <IconButton
            action="up"
            label={t("editPanel.moveUp", names)}
            disabled={index === 0}
            onClick={() => onMove(index, index - 1, "up")}
          >
            <ArrowUp />
          </IconButton>
          <IconButton
            action="down"
            label={t("editPanel.moveDown", names)}
            disabled={index === count - 1}
            onClick={() => onMove(index, index + 1, "down")}
          >
            <ArrowDown />
          </IconButton>
          <IconButton
            action="duplicate"
            label={t("editPanel.duplicate", names)}
            onClick={() => onDuplicate(index)}
          >
            <Copy />
          </IconButton>
          <IconButton
            action="remove"
            label={t("editPanel.remove", names)}
            onClick={() => onRemove(index)}
          >
            <Trash2 />
          </IconButton>
        </div>
      </div>
      <div id={bodyId} hidden={!open} className="flex flex-col gap-4">
        {issues.map((issue, i) => (
          <p key={i} role="alert" className="text-xs text-destructive">
            {issueText(t, issue)}
          </p>
        ))}
        {primary.map(field)}
        {rest.length > 0 && (
          <>
            <button
              type="button"
              className="flex flex-row items-center gap-1 self-start rounded-sm text-sm text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              aria-expanded={more}
              onClick={() => onMore(index, !more)}
            >
              {more ? (
                <ChevronDown className="size-4" aria-hidden="true" />
              ) : (
                <ChevronRight className="size-4" aria-hidden="true" />
              )}
              {t("editPanel.moreFields")}
            </button>
            {more && rest.map(field)}
          </>
        )}
      </div>
    </li>
  );
};

// A list of objects, each a card: add, remove, duplicate and reorder. A
// removed item can be put back from the note that follows, which stays until
// the next action on the list. The cards are keyed by their index (their
// drafts follow the game), what is open on a card follows the item. A field
// that is not left yet is passed on first (a click on a button does not
// always move the focus out of it), and the game is read after that.
const FRESH_CARD = { open: true, more: false };

const ArrayField = ({ keys, schema, defaults }) => {
  const form = useContext(SchemaFormContext);
  const { t } = useTranslation();
  const list = useRef(null);
  const focus = useRef(null);
  const [message, setMessage] = useState("");
  const [removed, setRemoved] = useState(null);
  // What is open on each card, by index
  const [ui, setUi] = useState([]);

  const items = getIn(keys, form.game) ?? [];
  const itemSchema = resolveAllOf(schema.items, form.root);
  const item = t(`editPanel.items.${keys[keys.length - 1]}`);
  const titleOf = (value, index) => value?.name || `#${index + 1}`;
  const uiOf = (index) => ui[index] ?? FRESH_CARD;
  // The same change of the cards as of the items
  const changeUi = (fn) =>
    setUi((current) =>
      fn(
        Array.from(
          { length: Math.max(current.length, items.length) },
          (_, i) => current[i] ?? FRESH_CARD,
        ),
      ),
    );
  const setCard = (index, patch) =>
    changeUi((cards) =>
      cards.map((card, i) => (i === index ? { ...card, ...patch } : card)),
    );

  // The focus goes where the last action asked for it, once the page has it
  useEffect(() => {
    if (!focus.current) return;
    const { index, action } = focus.current;
    focus.current = null;
    focusItem(list.current, index, action);
  });

  const commit = () => document.activeElement?.blur?.();
  const current = () => getIn(keys, form.latest()) ?? [];

  const add = () => {
    commit();
    const before = current();
    const created = newItem(before, defaults);
    setRemoved(null);
    form.insert(keys, before.length, created);
    setMessage(t("editPanel.added", { item, title: created.name }));
    focus.current = { index: before.length, action: "title" };
  };

  const duplicate = (index) => {
    commit();
    const before = current();
    const copy = {
      ...structuredClone(before[index]),
      name: nextName(before),
    };
    setRemoved(null);
    form.insert(keys, index + 1, copy);
    changeUi((cards) => cards.toSpliced(index + 1, 0, FRESH_CARD));
    setMessage(t("editPanel.duplicated", { item, title: copy.name }));
  };

  const remove = (index) => {
    commit();
    const source = current()[index];
    form.remove(keys, index);
    setRemoved({ index, item: structuredClone(source), card: uiOf(index) });
    changeUi((cards) => cards.toSpliced(index, 1));
    setMessage(t("editPanel.removed", { item, title: titleOf(source, index) }));
    focus.current = { index, action: "title" };
  };

  const move = (from, to, action) => {
    commit();
    const before = current();
    setRemoved(null);
    form.move(keys, from, to);
    changeUi((cards) => moveIn(from, to, cards));
    setMessage(
      t("editPanel.moved", {
        item,
        title: titleOf(before[from], from),
        position: to + 1,
        count: before.length,
      }),
    );
    focus.current = { index: to, action };
  };

  const undo = () => {
    commit();
    form.insert(keys, removed.index, removed.item);
    changeUi((cards) => cards.toSpliced(removed.index, 0, removed.card));
    setMessage(
      t("editPanel.restored", {
        item,
        title: titleOf(removed.item, removed.index),
      }),
    );
    focus.current = { index: removed.index, action: "title" };
    setRemoved(null);
  };

  return (
    <div ref={list} className="flex flex-col gap-3">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("editPanel.emptyList")}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((value, index) => (
            <ItemCard
              key={index}
              keys={[...keys, index]}
              schema={itemSchema}
              index={index}
              count={items.length}
              open={uiOf(index).open}
              more={uiOf(index).more}
              onOpen={(i, open) => setCard(i, { open })}
              onMore={(i, more) => setCard(i, { more })}
              title={titleOf(value, index)}
              kind={item}
              onMove={move}
              onDuplicate={duplicate}
              onRemove={remove}
            />
          ))}
        </ul>
      )}
      {removed && (
        <p className="flex flex-row flex-wrap items-center gap-2 rounded-md border bg-muted px-3 py-2 text-sm">
          <span>
            {t("editPanel.removed", {
              item,
              title: titleOf(removed.item, removed.index),
            })}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={undo}>
            {t("editPanel.undo")}
          </Button>
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        className="self-start"
        data-add
        onClick={add}
      >
        <Plus />
        {t("editPanel.add", { item })}
      </Button>
      <p role="status" aria-live="polite" className="sr-only">
        {message}
      </p>
    </div>
  );
};

const SchemaField = ({ keys, schema, defaults }) => {
  const { root } = useContext(SchemaFormContext);
  const node = resolveAllOf(schema, root);
  const props = { keys, schema: node };

  switch (kindOf(node, keys[keys.length - 1], root)) {
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
      return <StringOrNumberField {...props} />;
    case "count":
      return <CountField {...props} />;
    case "object":
      return <ObjectField {...props} />;
    case "array":
      return <ArrayField {...props} defaults={defaults} />;
    default:
      return <JsonField {...props} />;
  }
};

export default SchemaField;
