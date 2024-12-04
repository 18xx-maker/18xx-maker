import clsx from "clsx";
import debounce from "lodash.debounce";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

import { assocPath, length, map, path, split } from "ramda";

import { Checkbox } from "@/components/ui/checkbox";
import { Input as FormInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import UnitInput from "@/components/config/UnitInput";

import { useConfig, useValidation } from "@/hooks";
import { getPath, getSchema } from "@/util/input";

const Input = ({ name, label, options = [], description, dimension }) => {
  const { config, setConfig } = useConfig();
  const { isValidByInputName } = useValidation();
  const value = path(split(".", name), config);

  const error = !isValidByInputName(name);
  const className = clsx({ "border-error": error });

  let valuePath = getPath(name);
  let rawUpdateDebounced = debounce(
    (value) => setConfig(assocPath(valuePath, value, config)),
    800,
  );
  let update = (event) =>
    setConfig(
      assocPath(
        valuePath,
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
        config,
      ),
    );

  let inputSchema = getSchema(name);
  let inputNode = null;

  let [tempValue, setTempValue] = useState(value);
  useEffect(() => {
    setTempValue(value);
  }, [value]); // Only re-run the effect if value changes

  if (inputSchema && inputSchema.type === "string") {
    if (inputSchema.enum || length(options) > 0) {
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
        <div className="mt-4">
          <Label htmlFor={name} className="text-lg">
            {label}
          </Label>
          <Select id={name} name={name} onChange={update} value={value}>
            <SelectTrigger className={className}>
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
    } else {
      inputNode = (
        <div className="mt-4">
          <Label htmlFor={name} className="text-lg">
            {label}
          </Label>
          <FormInput
            value={tempValue}
            onChange={(event) =>
              setTempValue(event.target.value === "" ? 0 : event.target.value)
            }
            onBlur={update}
            id={name}
            name={name}
            className={className}
          />
        </div>
      );
    }
  } else if (inputSchema && inputSchema.type === "boolean") {
    const checkClasses = clsx(className, "data-[state=checked]:bg-background");
    inputNode = (
      <div className="mt-4 flex flex-row justify-start items-center">
        <Checkbox
          id={name}
          name={name}
          checked={value}
          onChange={update}
          className={checkClasses}
          variant="outline"
        />
        <Label htmlFor={name} className="ml-2 text-lg">
          {label}
        </Label>
      </div>
    );
  } else {
    const numberClasses = clsx(className, "w-24");
    inputNode = dimension ? (
      <UnitInput
        name={name}
        value={value}
        label={label}
        onChange={rawUpdateDebounced}
        errorValidation={error}
      />
    ) : (
      <div className="mt-4">
        <Label htmlFor={name} className="text-lg">
          {label}
        </Label>
        <FormInput
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
    <div>
      {inputNode}
      <ReactMarkdown className="text-sm mb-4 mt-1">{description}</ReactMarkdown>
    </div>
  );
};

export default Input;
