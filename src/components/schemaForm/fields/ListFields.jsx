import { useContext, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { move as moveIn } from "ramda";

import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Copy,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import SchemaField from "@/components/schemaForm/SchemaField";
import {
  FORMAT,
  SchemaFormContext,
  useDraft,
} from "@/components/schemaForm/fields/shared";
import { issueText } from "@/components/schemaForm/issueText";
import {
  PRIMARY_KEYS,
  coerceStringOrNumber,
  defaultValue,
  isNamed,
  issuesFor,
  mixedItem,
  newItem,
  nextId,
  nextName,
  resolveAllOf,
  valueAt,
} from "@/components/schemaForm/resolve";
import { useSchemaText } from "@/components/schemaForm/schemaText";
import { usePanelState } from "@/components/schemaForm/usePanelState";

// Moves focus into an item once it is on the page: to its title, or to one of
// its buttons (the other one of the pair when that is disabled). With no such
// item it goes to the add button. Only the list's own items count: a card can
// hold a record whose rows are items too.
export const focusItem = (container, index, action) => {
  const card = container?.querySelector(`:scope > ul > [data-item="${index}"]`);
  const target =
    action === "title"
      ? card?.querySelector("[data-title]")
      : (card?.querySelector(`[data-action="${action}"]:not(:disabled)`) ??
        card?.querySelector("[data-action]:not(:disabled)"));
  (target ?? container?.querySelector(":scope > [data-add]"))?.focus();
};

export const IconButton = ({ label, action, children, ...props }) => (
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

// The buttons of an item: move, duplicate and remove, after the action of the
// list for its items (a button of its own, like the editor of a token)
const ItemButtons = ({
  action,
  names,
  index,
  count,
  onMove,
  onDuplicate,
  onRemove,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-row items-center">
      {action}
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
  );
};

const ItemCard = ({
  primaryKeys,
  keys,
  schema,
  index,
  count,
  open,
  more,
  summary,
  onOpen,
  onMore,
  title,
  kind,
  action,
  onMove,
  onDuplicate,
  onRemove,
}) => {
  const { t } = useTranslation();
  const form = useContext(SchemaFormContext);
  const bodyId = useId();
  const problemId = useId();
  const issues = issuesFor(form.issues, keys, false);
  const names = { item: kind, title };
  // A closed card shows that a field inside it has a problem (a warning is
  // one too, the deprecated note is not)
  const deep = issuesFor(form.issues, keys).filter(
    (issue) => issue.code !== "deprecated",
  );

  const entries = Object.entries(schema.properties);
  const primary = primaryKeys.flatMap((key) =>
    entries.filter(([k]) => k === key),
  );
  const rest = entries.filter(([key]) => !primaryKeys.includes(key));
  const field = ([key, child]) => (
    <SchemaField key={key} keys={[...keys, key]} schema={child} />
  );

  return (
    <li data-item={index} className="flex flex-col gap-3 rounded-md border p-3">
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex min-w-0 flex-row items-center gap-2">
          <button
            type="button"
            className="flex min-w-0 flex-row items-center gap-1 rounded-sm text-left text-sm font-semibold focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
            aria-expanded={open}
            aria-controls={bodyId}
            aria-describedby={!open && deep.length > 0 ? problemId : undefined}
            data-title
            onClick={() => onOpen(index, !open)}
          >
            {open ? (
              <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
            ) : (
              <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
            )}
            {summary ? summary : <span className="truncate">{title}</span>}
          </button>
          {!open && deep.length > 0 && (
            <TriangleAlert
              className="size-4 shrink-0 text-destructive"
              id={problemId}
              role="img"
              aria-label={t("editPanel.hasProblems", names)}
              data-problem
            />
          )}
        </div>
        <ItemButtons
          action={action}
          names={names}
          index={index}
          count={count}
          onMove={onMove}
          onDuplicate={onDuplicate}
          onRemove={onRemove}
        />
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

// An item of a list that is text or a number (a token of the game): one
// field, typed and passed on when it is left, as a number when it is one
const ScalarRow = ({
  keys,
  value,
  title,
  index,
  count,
  kind,
  action,
  onMove,
  onDuplicate,
  onRemove,
}) => {
  const { t } = useTranslation();
  const form = useContext(SchemaFormContext);
  const names = { item: kind, title };
  const draft = useDraft(
    value,
    (text) => form.set(keys, coerceStringOrNumber(text)),
    FORMAT,
    (text, current) => coerceStringOrNumber(text) === current,
  );

  return (
    <li
      data-item={index}
      className="flex flex-row items-center justify-between gap-2 rounded-md border p-3"
    >
      <Input
        className="min-w-0 flex-1"
        value={draft.text}
        aria-label={t("editPanel.itemValue", names)}
        data-title
        onChange={(event) => draft.change(event.target.value)}
        onBlur={draft.commit}
        onKeyDown={(event) => event.key === "Enter" && draft.commit()}
      />
      <div className="shrink-0">
        <ItemButtons
          action={action}
          names={names}
          index={index}
          count={count}
          onMove={onMove}
          onDuplicate={onDuplicate}
          onRemove={onRemove}
        />
      </div>
    </li>
  );
};

// What a list says about its last action: the message for a screen reader,
// the removed item (put back from the note that follows, which stays until the
// next action on the list) and a warning to show with the list
export const useListNotes = () => {
  const [message, setMessage] = useState("");
  const [removed, setRemoved] = useState(null);
  const [warning, setWarning] = useState("");
  return { message, setMessage, removed, setRemoved, warning, setWarning };
};

// The note of a removed item with its undo, the warning and the live region
// (the add button goes between them, so each is its own part)
export const RemovedNote = ({ removed, removedText, onUndo }) => {
  const { t } = useTranslation();
  return (
    removed && (
      <p className="flex flex-row flex-wrap items-center gap-2 rounded-md border bg-muted px-3 py-2 text-sm">
        <span>{removedText}</span>
        <Button type="button" variant="outline" size="sm" onClick={onUndo}>
          {t("editPanel.undo")}
        </Button>
      </p>
    )
  );
};

export const ListWarning = ({ warning }) =>
  warning && (
    <p className="text-xs text-warning-text" data-testid="list-warning">
      {warning}
    </p>
  );

export const ListStatus = ({ message, warning }) => (
  <p role="status" aria-live="polite" className="sr-only">
    {message} {warning}
  </p>
);

// A list of objects, each a card: add, remove, duplicate and reorder. A
// removed item can be put back from the note that follows, which stays until
// the next action on the list. The cards are keyed by their index (their
// drafts follow the game), what is open on a card follows the item. A field
// that is not left yet is passed on first (a click on a button does not
// always move the focus out of it), and the game is read after that.
const FRESH_CARD = { open: true, more: false };
const CLOSED_CARD = { open: false, more: false };

// A stable default for the panel state of a list, so it does not change per render
const EMPTY = [];

// The fields of an item the filter reads, beside its title (which has the
// train of a phase without a name)
const FILTER_KEYS = ["name", "abbrev", "title", "note"];

// primary are the fields shown first, the others are under more fields.
// titleKey is the field that names an item and idKey the one that identifies
// it (a number for the players); with title (a translation key) a card is
// titled with it, counting the titleKey (3 players). Names are kept unique (a new item
// or a copy gets a free one) unless unique is false, as in a legend. With
// unique "named" only a list that has names gets them (phases may be keyed by
// train). With startCollapsed the cards of the items the list starts with
// are closed (a new or copied item is open). summary(item) is what a card shows
// as its title, copyOf(copy, items) changes a copy before it is inserted, and
// defaults may be a function of the items. titleKeys are the fields that
// name an item that has no name, the first one set.
// onChange(kind, from, to) gives back a warning to show with the list after a
// move, remove or insert (a duplicate) of an item. itemAction(item, keys,
// title) is a button of its own for each item, beside its move, duplicate and
// remove buttons (not in the title, a button cannot hold a button).
export const ArrayField = ({
  keys,
  schema,
  defaults,
  primary = PRIMARY_KEYS,
  titleKey = "name",
  idKey = "name",
  title,
  unique = true,
  startCollapsed = false,
  summary,
  copyOf,
  onChange,
  itemKey,
  titleKeys,
  itemAction,
  filterable,
}) => {
  const form = useContext(SchemaFormContext);
  const { t } = useTranslation();
  const text = useSchemaText();
  const list = useRef(null);
  const focus = useRef(null);
  const notes = useListNotes();
  const { message, removed, warning, setMessage, setRemoved, setWarning } =
    notes;
  // What is open on each card, by index
  const [ui, setUi] = usePanelState(`cards:${keys.join("/")}`, EMPTY);
  // The text the items shown are narrowed to
  const [filter, setFilter] = useState("");

  const items = valueAt(keys, form.game) ?? [];
  // Items that are text, a number or an object (a token of the game) are a
  // field or a card each
  const objectSchema = mixedItem(schema.items, form.root);
  const itemSchema = objectSchema ?? resolveAllOf(schema.items, form.root);
  // itemKey names the items of a list in a record, whose last key is a name
  const item = t(`editPanel.items.${itemKey ?? keys[keys.length - 1]}`);
  // The items of a list have the key that identifies them (a name) unless the
  // schema has none, like a note of a pool: then it is not made up. What the
  // schema requires of such an item is started empty (a note has a text).
  const hasId = Object.hasOwn(itemSchema.properties ?? {}, idKey);
  const seed = hasId
    ? {}
    : Object.fromEntries(
        (itemSchema.required ?? [])
          .filter((key) =>
            ["string", "number"].includes(itemSchema.properties?.[key]?.type),
          )
          .map((key) => [
            key,
            defaultValue(itemSchema.properties[key], form.root),
          ]),
      );
  const heading = itemKey
    ? ""
    : t(`editPanel.headings.${keys[keys.length - 1]}`, {
        defaultValue: "",
      });
  // A phase may have no name and be known by its train (or trains)
  const titleOf = (value, index) =>
    (typeof value !== "object" && value !== "" && value != null
      ? String(value)
      : null) ||
    (title
      ? value?.[titleKey] != null &&
        value[titleKey] !== "" &&
        t(title, { count: value[titleKey] })
      : value?.[titleKey]) ||
    value?.note ||
    (titleKeys
      ?.map((key) => value?.[key])
      .filter((text) => text != null && text !== "")
      .map(String)[0] ??
      null) ||
    [value?.train].flat().filter(Boolean).join(", ") ||
    `#${index + 1}`;
  // The items that have the filter text in a name, abbreviation, title or note,
  // by index: the cards keep their place, their state and their numbers
  const wanted = filter.trim().toLowerCase();
  const shown = (value, index) =>
    !wanted ||
    [titleOf(value, index), ...FILTER_KEYS.map((key) => value?.[key])].some(
      (field) =>
        ["string", "number"].includes(typeof field) &&
        String(field).toLowerCase().includes(wanted),
    );
  const matching = items.filter(shown).length;
  const initial = startCollapsed ? CLOSED_CARD : FRESH_CARD;
  const uiOf = (index) => ui[index] ?? initial;
  // The same change of the cards as of the items
  const changeUi = (fn) =>
    setUi((current) =>
      fn(
        Array.from(
          { length: Math.max(current.length, items.length) },
          (_, i) => current[i] ?? initial,
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
  const current = () => valueAt(keys, form.latest()) ?? [];

  // A list of mixed items adds text, or an object when asked for
  const add = (options) => {
    commit();
    const before = current();
    const created =
      objectSchema && !options
        ? ""
        : {
            ...seed,
            ...newItem(before, defaults, hasId && unique, idKey),
          };
    setRemoved(null);
    setWarning("");
    // A new item may not match the filter and would not be seen
    setFilter("");
    form.insert(keys, before.length, created);
    changeUi((cards) => cards.toSpliced(before.length, 0, FRESH_CARD));
    setMessage(
      t("editPanel.added", { item, title: titleOf(created, before.length) }),
    );
    focus.current = { index: before.length, action: "title" };
  };

  const duplicate = (index) => {
    commit();
    const before = current();
    const copy =
      before[index] !== null && typeof before[index] === "object"
        ? {
            ...structuredClone(before[index]),
            ...(hasId &&
              (unique === true || (unique && isNamed([before[index]]))) && {
                [idKey]: nextId(before, idKey),
              }),
            ...(unique === "named" &&
              !isNamed([before[index]]) && {
                train: nextName(before, "train"),
              }),
          }
        : before[index];
    if (copyOf && copy !== null && typeof copy === "object") {
      Object.assign(copy, copyOf(copy, before));
    }
    setRemoved(null);
    setWarning("");
    // A copy may not match the filter and would not be seen
    setFilter("");
    form.insert(keys, index + 1, copy);
    setWarning(onChange?.("insert", index + 1, index + 1) ?? "");
    changeUi((cards) => cards.toSpliced(index + 1, 0, FRESH_CARD));
    setMessage(
      t("editPanel.duplicated", { item, title: titleOf(copy, index + 1) }),
    );
    focus.current = { index: index + 1, action: "title" };
  };

  const remove = (index) => {
    commit();
    const source = current()[index];
    form.remove(keys, index);
    setWarning(onChange?.("remove", index, index) ?? "");
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
    setWarning(onChange?.("move", from, to) ?? "");
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
    setWarning("");
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
      {heading && (
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium">{heading}</h3>
          {schema.description && (
            <p className="text-xs text-muted-foreground">
              {text(schema.description)}
            </p>
          )}
        </div>
      )}
      {filterable && (items.length > 1 || filter) && (
        <div className="flex flex-col gap-1">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              className="pl-8"
              data-list-filter
              value={filter}
              placeholder={t("editPanel.filter.label", { item })}
              aria-label={t("editPanel.filter.label", { item })}
              onChange={(event) => setFilter(event.target.value)}
              onKeyDown={(event) => {
                // The first Escape clears the text, the next one closes the panel
                if (event.key === "Escape" && filter) {
                  event.preventDefault();
                  setFilter("");
                }
              }}
            />
          </div>
          {wanted && (
            <p aria-live="polite" className="text-xs text-muted-foreground">
              {matching === 0
                ? t("editPanel.filter.none")
                : t("editPanel.filter.shown", {
                    shown: matching,
                    count: items.length,
                  })}
            </p>
          )}
        </div>
      )}
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("editPanel.emptyList")}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((value, index) =>
            !shown(value, index) ? null : typeof value !== "object" ||
              value === null ? (
              <ScalarRow
                key={index}
                keys={[...keys, index]}
                value={value}
                title={titleOf(value, index)}
                index={index}
                count={items.length}
                kind={item}
                action={itemAction?.(
                  value,
                  [...keys, index],
                  titleOf(value, index),
                )}
                onMove={move}
                onDuplicate={duplicate}
                onRemove={remove}
              />
            ) : (
              <ItemCard
                key={index}
                primaryKeys={primary}
                keys={[...keys, index]}
                schema={itemSchema}
                index={index}
                count={items.length}
                open={uiOf(index).open}
                more={uiOf(index).more}
                summary={summary?.(value, index)}
                onOpen={(i, open) => setCard(i, { open })}
                onMore={(i, more) => setCard(i, { more })}
                title={titleOf(value, index)}
                kind={item}
                action={itemAction?.(
                  value,
                  [...keys, index],
                  titleOf(value, index),
                )}
                onMove={move}
                onDuplicate={duplicate}
                onRemove={remove}
              />
            ),
          )}
        </ul>
      )}
      <RemovedNote
        removed={removed}
        removedText={
          removed &&
          t("editPanel.removed", {
            item,
            title: titleOf(removed.item, removed.index),
          })
        }
        onUndo={undo}
      />
      <ListWarning warning={warning} />
      <Button
        type="button"
        variant="outline"
        className="self-start"
        data-add
        onClick={() => add(false)}
      >
        <Plus />
        {t("editPanel.add", { item })}
      </Button>
      {objectSchema && (
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={() => add(true)}
        >
          <Plus />
          {t("editPanel.addWithOptions", { item })}
        </Button>
      )}
      <ListStatus message={message} warning={warning} />
    </div>
  );
};
