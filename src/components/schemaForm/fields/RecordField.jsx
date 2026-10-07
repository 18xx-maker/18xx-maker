import { useContext, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import SchemaField from "@/components/schemaForm/SchemaField";
import {
  IconButton,
  ListStatus,
  ListWarning,
  RemovedNote,
  focusItem,
  useListNotes,
} from "@/components/schemaForm/fields/ListFields";
import {
  SchemaFormContext,
  useDraft,
} from "@/components/schemaForm/fields/shared";
import { issueText } from "@/components/schemaForm/issueText";
import {
  defaultValue,
  freeKey,
  humanize,
  insertKey,
  issuesFor,
  removeKey,
  renameKey,
  resolveAllOf,
  valueAt,
} from "@/components/schemaForm/resolve";

// One name of a record and its value: the name is typed and passed on when
// the field is left, a name that is empty or taken is refused with a message
// and goes back. The rows are keyed by position, so what is typed in a row
// stays with it when its name changes.
const RecordRow = ({
  keys,
  name,
  index,
  schema,
  item,
  rows,
  onRename,
  onRemove,
}) => {
  const { t } = useTranslation();
  // The refusal belongs to the name it was given for
  const [refusal, setProblem] = useState(null);
  const problem = refusal?.name === name ? refusal.text : null;
  const errorId = useId();
  const draft = useDraft(name, (text) => {
    const to = text.trim();
    if (to === name) return false;
    const refused = onRename(name, to);
    if (refused) {
      setProblem({ name, text: refused });
      return false;
    }
  });
  const names = { item, title: name };

  return (
    <li data-item={index} className="flex flex-col gap-3 rounded-md border p-3">
      <div className="flex flex-row items-start gap-2">
        <div className="flex min-w-0 grow flex-col gap-1">
          <Input
            value={draft.text}
            aria-label={t("editPanel.record.name", { name })}
            aria-invalid={problem ? true : undefined}
            aria-describedby={problem ? errorId : undefined}
            data-title
            onChange={(event) => {
              setProblem(null);
              draft.change(event.target.value);
            }}
            onBlur={draft.commit}
            onKeyDown={(event) => event.key === "Enter" && draft.commit()}
          />
          {problem && (
            <p id={errorId} role="alert" className="text-xs text-destructive">
              {t(problem)}
            </p>
          )}
        </div>
        <IconButton
          action="remove"
          label={t("editPanel.remove", names)}
          onClick={() => onRemove(name)}
        >
          <Trash2 />
        </IconButton>
      </div>
      <SchemaField keys={[...keys, name]} schema={schema} {...rows} />
    </li>
  );
};

// An object of any names, each a row: add, rename and remove. A removed row
// can be put back from the note that follows, which stays until the next
// action on the record; it comes back under a free name when its own was
// taken in the meantime. The object is always written whole, in the order of
// the rows (a name that is a whole number is listed first by JavaScript).
// rows are the props of the field of each row's value. usedBy is the field of
// a company that names a row ("tokens" or "shares"): renaming or removing a
// row leaves the companies that use it by that name, and a warning says how
// many.
export const RecordField = ({ keys, schema, rows, usedBy }) => {
  const form = useContext(SchemaFormContext);
  const { t } = useTranslation();
  const list = useRef(null);
  const focus = useRef(null);
  const notes = useListNotes();
  const { message, removed, warning, setMessage, setRemoved, setWarning } =
    notes;

  const record = valueAt(keys, form.game) ?? {};
  const names = Object.keys(record);
  const valueSchema = resolveAllOf(schema.additionalProperties, form.root);
  const item = t([
    `editPanel.items.${keys[keys.length - 1]}`,
    "editPanel.items.entry",
  ]);
  const issues = issuesFor(form.issues, keys, false);

  useEffect(() => {
    if (!focus.current) return;
    const { index, action } = focus.current;
    focus.current = null;
    focusItem(list.current, index, action);
  });

  const commit = () => document.activeElement?.blur?.();
  const current = () => valueAt(keys, form.latest()) ?? {};
  // Writes the record, and clears the key when this empties it
  const write = (next) => {
    if (Object.keys(next).length === 0 && form.clear(keys) !== false) return;
    form.set(keys, next);
  };

  const add = () => {
    commit();
    const before = current();
    const name = freeKey(before, t("editPanel.record.newName"));
    setRemoved(null);
    setWarning("");
    form.set(
      keys,
      insertKey(
        before,
        names.length,
        name,
        defaultValue(valueSchema, form.root),
      ),
    );
    setMessage(t("editPanel.added", { item, title: name }));
    focus.current = { index: Object.keys(before).length, action: "title" };
  };

  // The companies that use a row of the record: by its name, or by default
  // (the "minor" row for a minor, otherwise "default")
  const usersOf = (name, record) =>
    (form.latest().companies ?? []).filter((company) => {
      const own = company?.[usedBy];
      if (typeof own === "string") return own === name;
      if (own) return false;
      return name === (company?.minor && record.minor ? "minor" : "default");
    }).length;
  const usedWarning = (name, record) => {
    const count = usedBy ? usersOf(name, record) : 0;
    return count > 0 ? t("editPanel.record.usedBy", { count, name }) : "";
  };

  const rename = (from, to) => {
    const before = current();
    if (to === "") return "editPanel.record.emptyName";
    if (Object.hasOwn(before, to)) return "editPanel.record.duplicateName";
    setWarning(usedWarning(from, before));
    form.set(keys, renameKey(before, from, to));
  };

  // By name: the rows can have been reordered by a rename since they rendered
  const remove = (name) => {
    commit();
    const before = current();
    const index = Object.keys(before).indexOf(name);
    if (index < 0) return;
    setRemoved({ index, name, value: structuredClone(before[name]) });
    setWarning(usedWarning(name, before));
    write(removeKey(before, name));
    setMessage(t("editPanel.removed", { item, title: name }));
    focus.current = { index, action: "title" };
  };

  const undo = () => {
    commit();
    const before = current();
    const name = freeKey(before, removed.name);
    form.set(keys, insertKey(before, removed.index, name, removed.value));
    setWarning("");
    setMessage(t("editPanel.restored", { item, title: name }));
    focus.current = { index: removed.index, action: "title" };
    setRemoved(null);
  };

  return (
    <fieldset ref={list} className="flex flex-col gap-4 rounded-md border p-3">
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
      {names.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("editPanel.emptyList")}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {names.map((name, index) => (
            <RecordRow
              key={index}
              keys={keys}
              name={name}
              index={index}
              schema={valueSchema}
              item={item}
              rows={rows}
              onRename={rename}
              onRemove={remove}
            />
          ))}
        </ul>
      )}
      <RemovedNote
        removed={removed}
        removedText={
          removed && t("editPanel.removed", { item, title: removed.name })
        }
        onUndo={undo}
      />
      <ListWarning warning={warning} />
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
      <ListStatus message={message} warning={warning} />
    </fieldset>
  );
};
