import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import MUIInput from "@mui/material/FilledInput";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import makeStyles from "@mui/styles/makeStyles";

import { keys, map } from "ramda";

const useStyles = makeStyles((theme) => ({
  configItem: {
    minWidth: 300,
    margin: theme.spacing(3, 0, 0, 0),
    flexDirection: "row",
  },
  configInput: {
    width: 200,
  },
  configUnits: {
    width: 100,
    marginLeft: theme.spacing(1),
  },
}));

const allUnits = {
  inches: 100.0,
  mm: 3.937007874,
};

// Component to help input units
const UnitInput = ({ name, value, label, onChange, errorValidation }) => {
  const classes = useStyles();
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
    <Box className={classes.configItem}>
      <FormControl variant="filled" error={isError}>
        <InputLabel id={`${name}-label`}>{label}</InputLabel>
        <MUIInput
          id={name}
          name={name}
          className={classes.configInput}
          variant="filled"
          inputProps={{ type: "input" }}
          value={internalValue}
          onChange={handler}
        />
      </FormControl>
      <FormControl variant="filled">
        <Select
          id={`${name}-units`}
          labelId={`${name}-label`}
          className={classes.configUnits}
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
