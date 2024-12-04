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

  let handler = (event) => {
    setInternalValue(event.target.value);

    let numberValue = Number(event.target.value);
    if (Number.isNaN(numberValue)) {
      if (!error) {
        setError(true);
      }
      return;
    } else {
      if (error) {
        setError(false);
      }
    }

    onChange(numberValue * allUnits[units]);
  };

  let unitsHandler = (newValue) => {
    setUnits(newValue);
    setInternalValue(value / allUnits[newValue]);
  };

  const className = clsx({ "border-error": isError });
  const numberClassName = clsx(className, "w-24");

  return (
    <div className="mt-4">
      <Label className="w-min text-lg" htmlFor={name}>
        {label}
      </Label>
      <div className="flex flex-row gap-2 my-1 justify-start items-center">
        <Input
          id={name}
          name={name}
          value={internalValue}
          onChange={handler}
          className={numberClassName}
        />
        <Select onValueChange={unitsHandler} value={units}>
          <SelectTrigger className={className}>
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
