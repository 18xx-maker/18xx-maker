import { useContext } from "react";
import { useTranslation } from "react-i18next";

import { X } from "lucide-react";

import { Combobox } from "@/components/ui/combobox";

import {
  FieldShell,
  SchemaFormContext,
  useDraft,
  useField,
} from "@/components/schemaForm/SchemaField";
import { referenceList, referenceValue } from "@/components/schemaForm/resolve";

import { refOptions } from "@/util/schemaRefs";

// A string or list of strings that names something in the game (a company, a
// train): free text with the names of the game as suggestions. The names come
// from the game as edited now. A value that names nothing stays as it is, with
// a hint. A list is chips, one name stays a string where the schema allows it.
const ReferenceField = ({ keys, schema, reference: { ref, mode } }) => {
  const { t } = useTranslation();
  const form = useContext(SchemaFormContext);
  const field = useField(keys, schema);
  const multi = mode !== "single";
  const options = refOptions(ref, form.game);
  const names = referenceList(field.value);
  const unknown = names.filter(
    (name) => !options.some((option) => option.value === name),
  );
  const hint = `${field.id}-unknown`;

  const setNames = (list) => {
    const next = referenceValue(list, mode);
    return next === undefined ? field.clear() : field.set(next);
  };
  const add = (name) => {
    const text = name.trim();
    if (text !== "" && !names.includes(text)) setNames([...names, text]);
  };

  const draft = useDraft(
    field.value,
    multi
      ? (text) => {
          add(text);
          return false;
        }
      : (text) => (text === "" ? field.clear() : field.set(text)),
    multi ? () => "" : undefined,
  );

  const aria = field.aria();
  const collection = t(`editPanel.reference.from.${ref.from}`, {
    defaultValue: ref.from,
  });

  return (
    <FieldShell {...field}>
      {multi && names.length > 0 && (
        <div className="flex flex-row flex-wrap gap-1">
          {names.map((name) => (
            <span
              key={name}
              className="flex flex-row items-center gap-1 rounded-md border py-0.5 pr-0.5 pl-2 text-sm"
            >
              {name}
              <button
                type="button"
                className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                aria-label={t("editPanel.reference.remove", { name })}
                onClick={() => setNames(names.filter((n) => n !== name))}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}
      <Combobox
        {...aria}
        aria-describedby={
          [aria["aria-describedby"], unknown.length > 0 && hint]
            .filter(Boolean)
            .join(" ") || undefined
        }
        options={options}
        value={draft.text}
        onValueChange={draft.change}
        onSelect={(option) => {
          if (multi) {
            add(option.value);
            draft.change("");
          } else {
            field.set(option.value);
            draft.change(option.value);
          }
        }}
        onEnter={draft.commit}
        onBlur={draft.commit}
        emptyText={t("editPanel.reference.noMatches", { value: draft.text })}
      />
      {unknown.length > 0 && (
        <p id={hint} className="text-xs text-warning-text">
          {t("editPanel.reference.unknown", {
            value: unknown.join(", "),
            collection,
          })}
        </p>
      )}
    </FieldShell>
  );
};

export default ReferenceField;
