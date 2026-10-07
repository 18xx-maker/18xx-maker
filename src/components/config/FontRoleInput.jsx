import clsx from "clsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";

import { assocPath, dissocPath, init, isEmpty, keys, map, path } from "ramda";

import { X } from "lucide-react";

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

import NumberField from "@/components/form/NumberField";

import { useConfig, useValidation } from "@/hooks";
import schema from "@/schemas/config.schema.json";

const STYLES = schema.definitions.fontRole.properties.style.enum;
const WEIGHTS = [
  "normal",
  "bold",
  ...[100, 200, 300, 400, 500, 600, 700, 800, 900].map(String),
];
const BUILT_IN_FAMILIES = ["display", "serif", "sans-serif"];

// A weight is a keyword or a number, a select only has text
const toWeight = (text) => (/^\d+$/.test(text) ? Number(text) : text);

// Free text that is passed on when the field is left or Enter is pressed. An
// empty field unsets the value.
const FamilyField = ({
  id,
  label,
  value,
  placeholder,
  list,
  error,
  onChange,
}) => {
  const [text, setText] = useState(value ?? "");
  useEffect(() => setText(value ?? ""), [value]);

  const commit = () => {
    const next = text.trim();
    if (next === (value ?? "")) return;
    onChange(next === "" ? undefined : next);
  };

  return (
    <Input
      id={id}
      name={id}
      aria-label={label}
      list={list}
      value={text}
      placeholder={placeholder}
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => event.key === "Enter" && commit()}
      className={clsx("w-40", { "border-error": error })}
    />
  );
};

// A select that can be emptied (Radix has no empty item): a button next to it
const ClearableSelect = ({
  id,
  label,
  clearLabel,
  value,
  placeholder,
  options,
  error,
  onChange,
  onClear,
}) => (
  <div className="flex flex-row items-center gap-1">
    <Select
      value={value === undefined ? "" : String(value)}
      onValueChange={onChange}
    >
      <SelectTrigger
        id={id}
        name={id}
        aria-label={label}
        className={clsx("w-32", { "border-error": error })}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {map(
          (option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ),
          options,
        )}
      </SelectContent>
    </Select>
    {value !== undefined && (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={clearLabel}
        onClick={onClear}
      >
        <X />
      </Button>
    )}
  </div>
);

// The settings of one font role (fonts.roles.<role>) of the config. Only the
// settings the user sets are stored; an unset one shows what it falls back to
// (the body role) as its placeholder.
const FontRoleInput = ({ role, fields, label, description }) => {
  const { t } = useTranslation();
  const { config, userLayerConfig, setConfig } = useConfig();
  const { isValidByInputName } = useValidation();

  const prefix = ["fonts", "roles", role];
  const value = (field) => path([...prefix, field], userLayerConfig);
  const inherited = (field) =>
    role === "body"
      ? undefined
      : path(["fonts", "roles", "body", field], config);
  const error = (field) => !isValidByInputName([...prefix, field].join("."));
  const name = (field) => `fonts.roles.${role}.${field}`;
  const fieldLabel = (field) =>
    t("config.fonts.field", { role: label, field: t(`config.fonts.${field}`) });

  const update = (field, next) => {
    const fieldPath = [...prefix, field];
    if (next !== undefined) {
      setConfig(assocPath(fieldPath, next, userLayerConfig));
      return;
    }

    // Unset the value, and the objects that are left empty by it, up to
    // `fonts` itself: the stored config holds only the difference
    let result = dissocPath(fieldPath, userLayerConfig);
    for (
      let parent = init(fieldPath);
      parent.length > 0 && isEmpty(path(parent, result));
      parent = init(parent)
    ) {
      result = dissocPath(parent, result);
    }
    setConfig(result);
  };

  const suggestions = [
    ...BUILT_IN_FAMILIES,
    ...keys(config.fonts?.families ?? {}),
  ];
  const listId = `fonts-${role}-families`;

  const current = value("weight");

  const control = {
    family: (
      <>
        <FamilyField
          id={name("family")}
          label={fieldLabel("family")}
          value={value("family")}
          placeholder={inherited("family")}
          list={listId}
          error={error("family")}
          onChange={(next) => update("family", next)}
        />
        <datalist id={listId}>
          {suggestions.map((family) => (
            <option key={family} value={family} />
          ))}
        </datalist>
      </>
    ),
    size: (
      <NumberField
        id={name("size")}
        name={name("size")}
        aria-label={fieldLabel("size")}
        value={value("size")}
        placeholder={inherited("size")?.toString()}
        onChange={(next) => update("size", next)}
        onClear={() => update("size", undefined)}
        className={clsx("w-24", { "border-error": error("size") })}
      />
    ),
    weight: (
      <ClearableSelect
        id={name("weight")}
        label={fieldLabel("weight")}
        clearLabel={t("config.fonts.clear", { field: fieldLabel("weight") })}
        value={value("weight")}
        placeholder={inherited("weight")?.toString()}
        options={
          current === undefined || WEIGHTS.includes(String(current))
            ? WEIGHTS
            : [...WEIGHTS, String(current)]
        }
        error={error("weight")}
        onChange={(next) => update("weight", toWeight(next))}
        onClear={() => update("weight", undefined)}
      />
    ),
    style: (
      <ClearableSelect
        id={name("style")}
        label={fieldLabel("style")}
        clearLabel={t("config.fonts.clear", { field: fieldLabel("style") })}
        value={value("style")}
        placeholder={inherited("style")}
        options={STYLES}
        error={error("style")}
        onChange={(next) => update("style", next)}
        onClear={() => update("style", undefined)}
      />
    ),
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg">{label}</h3>
      <div className="flex flex-row flex-wrap items-end gap-4">
        {fields.map((field) => (
          <div key={field} className="flex flex-col gap-1">
            {field === "weight" || field === "style" ? (
              <span className="text-sm">{t(`config.fonts.${field}`)}</span>
            ) : (
              <Label htmlFor={name(field)} className="text-sm">
                {t(`config.fonts.${field}`)}
              </Label>
            )}
            {control[field]}
          </div>
        ))}
      </div>
      <div className="text-sm text-muted-foreground">
        <ReactMarkdown>{description}</ReactMarkdown>
      </div>
    </div>
  );
};

export default FontRoleInput;
