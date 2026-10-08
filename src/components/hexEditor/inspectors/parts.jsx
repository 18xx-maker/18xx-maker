import { useContext, useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { ChevronDown, ChevronRight } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";

import { isSingle } from "@/components/hexEditor/hexModel";
import { elementSchema } from "@/components/hexEditor/hexSchema";
import SchemaField, {
  FieldShell,
  SchemaFormContext,
  useDraft,
} from "@/components/schemaForm/SchemaField";
import { resolveAllOf, valueAt } from "@/components/schemaForm/resolve";

// What an inspector gets: the element (key, index and the value), the
// orientation of the hex, and the schema of the element.

export const keysOf = (key, index, single) =>
  single ? ["hex", key] : ["hex", key, index];

// The fields of the properties that the schema has, in the order given
export const Fields = ({ keys, schema, names }) => {
  const { root } = useContext(SchemaFormContext);
  const properties = schema.properties ?? {};
  return names
    .filter((name) => Object.hasOwn(properties, name))
    .map((name) => (
      <SchemaField
        key={name}
        keys={[...keys, name]}
        schema={resolveAllOf(properties[name], root)}
      />
    ));
};

// The other properties of the schema, behind a button
export const MoreFields = ({ keys, schema, except }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const id = useId();
  const names = Object.keys(schema.properties ?? {}).filter(
    (name) => !except.includes(name),
  );
  if (names.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        className="flex flex-row items-center gap-1 self-start rounded-sm text-sm text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <ChevronDown className="size-4" aria-hidden="true" />
        ) : (
          <ChevronRight className="size-4" aria-hidden="true" />
        )}
        {t("editPanel.moreFields")}
      </button>
      <div id={id} hidden={!open} className="flex flex-col gap-4">
        {open && <Fields keys={keys} schema={schema} names={names} />}
      </div>
    </div>
  );
};

// The element as JSON text, passed on when the field is left (the JsonField of
// the schema forms names itself after the last key of its path, which here is
// the number of the element)
const ElementJsonField = ({ keys }) => {
  const { t } = useTranslation();
  const form = useContext(SchemaFormContext);
  const id = useId();
  const [invalid, setInvalid] = useState(false);
  const value = valueAt(keys, form.game);
  const draft = useDraft(
    value,
    (input) => {
      try {
        const parsed = JSON.parse(input);
        setInvalid(false);
        form.set(keys, parsed);
      } catch {
        setInvalid(true);
        return true;
      }
    },
    (v) => JSON.stringify(v, null, 2) ?? "",
  );

  return (
    <FieldShell
      id={id}
      label={t("hexEditor.form.asJson")}
      errors={invalid ? [t("editPanel.invalidJson")] : []}
    >
      <Textarea
        id={id}
        className="font-mono"
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error-0` : undefined}
        value={draft.text}
        onChange={(event) => draft.change(event.target.value)}
        onBlur={draft.commit}
      />
    </FieldShell>
  );
};

// The element as JSON, for what the form does not have: unknown properties,
// a value of a shape the fields do not edit. Open from the start when the
// element has properties the schema does not know.
export const ElementJson = ({ keys, schema, element }) => {
  const { t } = useTranslation();
  const properties = schema.properties ?? {};
  const unknown =
    element !== null &&
    typeof element === "object" &&
    Object.keys(element).some((name) => !Object.hasOwn(properties, name));
  const [open, setOpen] = useState(!!unknown || typeof element !== "object");
  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className="flex flex-row items-center gap-1 self-start rounded-sm text-sm text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <ChevronDown className="size-4" aria-hidden="true" />
        ) : (
          <ChevronRight className="size-4" aria-hidden="true" />
        )}
        {t("hexEditor.form.asJson")}
      </button>
      <div id={id} hidden={!open}>
        {open && (
          <>
            {unknown && (
              <p className="mb-2 text-xs text-muted-foreground">
                {t("hexEditor.form.unknownKeys")}
              </p>
            )}
            <ElementJsonField keys={keys} />
          </>
        )}
      </div>
    </div>
  );
};

// The inspector of an element made of a few main fields, the rest behind
// "More fields", and the JSON of the element
export const Inspector = ({
  elementKey,
  index,
  element,
  primary,
  before,
  except = [],
}) => {
  const schema = elementSchema(elementKey);
  const keys = keysOf(elementKey, index, isSingle(elementKey));

  if (element === null || typeof element !== "object") {
    return <ElementJson keys={keys} schema={schema} element={element} />;
  }
  return (
    <div className="flex flex-col gap-4">
      {before}
      <Fields keys={keys} schema={schema} names={primary} />
      <MoreFields
        keys={keys}
        schema={schema}
        except={[...primary, ...except]}
      />
      <ElementJson keys={keys} schema={schema} element={element} />
    </div>
  );
};
