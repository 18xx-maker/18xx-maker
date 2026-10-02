import { useEffect, useState } from "react";

import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import { keys, map } from "ramda";

import { Box, TextField } from "@/ui";
import styles from "./UnitInput.module.css";

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

  let unitsHandler = (event) => {
    setUnits(event.target.value);
    setInternalValue(value / allUnits[event.target.value]);
  };

  return (
    <Box className={styles.configItem}>
      <TextField
        id={name}
        name={name}
        label={label}
        className={styles.configInput}
        error={isError}
        value={internalValue}
        onChange={handler}
      />
      <FormControl variant="filled">
        <Select
          id={`${name}-units`}
          labelId={`${name}-label`}
          className={styles.configUnits}
          value={units}
          onChange={unitsHandler}
        >
          {map(
            (key) => (
              <MenuItem key={key} value={key}>
                {key}
              </MenuItem>
            ),
            keys(allUnits),
          )}
        </Select>
      </FormControl>
    </Box>
  );
};

export default UnitInput;
