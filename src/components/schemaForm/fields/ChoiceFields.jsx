import { useContext } from "react";
import { useTranslation } from "react-i18next";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  FieldShell,
  SchemaFormContext,
  UNSET,
  useField,
} from "@/components/schemaForm/fields/shared";
import { resolveAllOf } from "@/components/schemaForm/resolve";

// A list of choices: a checkbox for each, in the order of the schema, then the
// values the game has that the schema does not know (they stay until unchecked).
// No choice is no value.
export const EnumListField = ({ keys, schema }) => {
  const { root } = useContext(SchemaFormContext);
  const field = useField(keys, schema);
  const options = resolveAllOf(schema.items, root).enum;
  const current = Array.isArray(field.value) ? field.value : [];
  const shown = [
    ...options,
    ...current.filter(
      (value, i) => !options.includes(value) && current.indexOf(value) === i,
    ),
  ];

  // Only the value changes: the order and the duplicates of the rest stay
  const toggle = (value, on) => {
    const next = on
      ? [...current, value]
      : current.filter((item) => item !== value);
    if (next.length === 0) field.clear();
    else field.set(next);
  };

  return (
    <FieldShell {...field}>
      <div
        {...field.aria({
          role: "group",
          id: field.id,
          "aria-required": undefined,
        })}
        aria-labelledby={`${field.id}-label`}
        className="flex flex-col gap-2"
      >
        {shown.map((option, index) => (
          <div key={String(option)} className="flex items-center gap-2">
            <Checkbox
              id={`${field.id}-${index}`}
              checked={current.includes(option)}
              onCheckedChange={(on) => toggle(option, on === true)}
            />
            <Label htmlFor={`${field.id}-${index}`}>{String(option)}</Label>
          </div>
        ))}
      </div>
    </FieldShell>
  );
};

// A choice with an entry for "not set", unless the key is required
export const ChoiceField = ({
  keys,
  schema,
  options,
  labelOf = (value) => value,
  label,
}) => {
  const { t } = useTranslation();
  const field = useField(keys, schema);

  return (
    <FieldShell {...field} label={label ?? field.label}>
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

export const BooleanField = (props) => {
  const { t } = useTranslation();
  return (
    <ChoiceField
      {...props}
      options={[true, false]}
      labelOf={(value) => t(`editPanel.${value}`)}
    />
  );
};
