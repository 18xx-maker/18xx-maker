import clsx from "clsx";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

import { assocPath, map, path, split } from "ramda";

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

// Keeps what is typed as text (so "1." and "-" can be typed) and only passes
// on a number when the field is left or Enter is pressed
const NumberInput = ({ value, onChange, ...pass }) => {
  const [text, setText] = useState(`${value}`);

  useEffect(() => {
    setText((text) => (Number(text) === value ? text : `${value}`));
  }, [value]);

  const commit = () => {
    const number = Number(text);
    if (text.trim() !== "" && Number.isFinite(number)) {
      if (number !== value) {
        onChange(number);
      }
    } else {
      setText(`${value}`);
    }
  };

  return (
    <FormInput
      type="number"
      step="any"
      value={text}
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => event.key === "Enter" && commit()}
      {...pass}
    />
  );
};

const Input = ({
  name,
  label,
  options = [],
  description,
  dimension,
  large = false,
}) => {
  const { config, setConfig } = useConfig();
  const { isValidByInputName } = useValidation();
  const value = path(split(".", name), config);

  const error = !isValidByInputName(name);
  const className = clsx({ "border-error": error });

  let valuePath = getPath(name);
  let update = (value) => {
    setConfig(assocPath(valuePath, value, config));
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
      />
    ) : (
      <div className="flex flex-col gap-2">
        <Label htmlFor={name} className="text-lg">
          {label}
        </Label>
        <NumberInput
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
