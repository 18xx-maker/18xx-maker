import clsx from "clsx";
import ReactMarkdown from "react-markdown";

import { assocPath, dissocPath, init, isEmpty, map, path, split } from "ramda";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import UnitInput from "@/components/config/UnitInput";
import NumberField from "@/components/form/NumberField";

import { useConfig, useValidation } from "@/hooks";
import { getPath, getSchema } from "@/util/input";

const Input = ({
  name,
  label,
  options = [],
  description,
  dimension,
  clearable = false,
  inherit,
  large = false,
  fallback,
}) => {
  const { config, userLayerConfig, setConfig } = useConfig();
  const { isValidByInputName } = useValidation();
  const value = path(split(".", name), config) ?? fallback;

  const error = !isValidByInputName(name);
  const className = clsx({ "border-error": error });

  let valuePath = getPath(name);
  let update = (value) => {
    if (value !== undefined) {
      setConfig(assocPath(valuePath, value, userLayerConfig));
      return;
    }

    // Unset the value, and the objects that are left empty by it
    let next = dissocPath(valuePath, userLayerConfig);
    for (
      let parent = init(valuePath);
      parent.length > 1 && isEmpty(path(parent, next));
      parent = init(parent)
    ) {
      next = dissocPath(parent, next);
    }
    setConfig(next);
  };

  let inputSchema = getSchema(name);
  let inputNode;

  if (inputSchema && inputSchema.type === "string") {
    const selectOptions = inputSchema.enum
      ? map(
          (value) => ({
            value,
            label: value,
          }),
          inputSchema.enum,
        )
      : options;

    inputNode = (
      <div className="flex flex-col gap-2">
        <Label htmlFor={name} className="text-lg">
          {label}
        </Label>
        <Select onValueChange={update} value={value}>
          <SelectTrigger
            id={name}
            name={name}
            className={clsx(large ? "w-48" : "w-32", className)}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {map(
              (opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ),
              selectOptions,
            )}
          </SelectContent>
        </Select>
      </div>
    );
  } else if (inputSchema && inputSchema.type === "boolean") {
    const checkClasses = clsx(className, "data-[state=checked]:bg-background");
    inputNode = (
      <div className="flex flex-row justify-start items-center">
        <Checkbox
          id={name}
          name={name}
          checked={value}
          onCheckedChange={update}
          className={checkClasses}
          variant="outline"
        />
        <Label htmlFor={name} className="ml-2 text-lg">
          {label}
        </Label>
      </div>
    );
  } else {
    const numberClasses = clsx(className, "w-20");
    inputNode = dimension ? (
      <UnitInput
        name={name}
        value={value}
        label={label}
        onChange={update}
        errorValidation={error}
        clearable={clearable}
        placeholder={inherit ? path(split(".", inherit), config) : undefined}
      />
    ) : (
      <div className="flex flex-col gap-2">
        <Label htmlFor={name} className="text-lg">
          {label}
        </Label>
        <NumberField
          id={name}
          name={name}
          value={value}
          onChange={update}
          className={numberClasses}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {inputNode}
      <div className="text-sm text-muted-foreground">
        <ReactMarkdown>{description}</ReactMarkdown>
      </div>
    </div>
  );
};

export default Input;
