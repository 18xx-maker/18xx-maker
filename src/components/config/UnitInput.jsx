import clsx from "clsx";
import { useEffect, useState } from "react";

import { keys, map } from "ramda";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const allUnits = {
  inches: 100.0,
  mm: 3.937007874,
};

// Component to help input units
const UnitInput = ({ name, value, label, onChange, errorValidation }) => {
  let [error, setError] = useState(false);
  let [units, setUnits] = useState("inches");
  let [internalValue, setInternalValue] = useState(value / allUnits[units]);

  const isError = error || errorValidation;

  useEffect(() => {
    setInternalValue(value / allUnits[units]);
  }, [value, units]);

  // Typing only edits the text. The value is applied on blur or Enter, so a
  // half typed number (or an empty field) never reaches the config
  let handler = (event) => {
    const text = event.target.value;
    setInternalValue(text);

    const failed = text.trim() !== "" && Number.isNaN(Number(text));
    if (failed !== error) {
      setError(failed);
    }
  };

  let commit = () => {
    const text = `${internalValue}`;
    if (text.trim() === "" || Number.isNaN(Number(text))) {
      // Nothing usable was typed, go back to the current value
      setInternalValue(value / allUnits[units]);
      setError(false);
      return;
    }

    const numberValue = Number(text) * allUnits[units];
    if (numberValue !== value) {
      onChange(numberValue);
    }
  };

  let keyHandler = (event) => {
    if (event.key === "Enter") {
      commit();
    }
  };

  let unitsHandler = (newValue) => {
    setUnits(newValue);
    setInternalValue(value / allUnits[newValue]);
  };

  const className = clsx({ "border-error": isError });
  const numberClassName = clsx(className, "w-20");
  const unitClassName = clsx(className, "w-24");

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-lg" htmlFor={name}>
        {label}
      </Label>
      <div className="flex flex-row gap-2 justify-start items-center">
        <Input
          id={name}
          name={name}
          value={internalValue}
          onChange={handler}
          onBlur={commit}
          onKeyDown={keyHandler}
          className={numberClassName}
        />
        <Select onValueChange={unitsHandler} value={units}>
          <SelectTrigger className={unitClassName}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {map(
              (key) => (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              ),
              keys(allUnits),
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default UnitInput;
