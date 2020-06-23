import React, { useState, useEffect } from "react";

import Box from "@material-ui/core/Box";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MUIInput from "@material-ui/core/FilledInput";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

import keys from "ramda/src/keys";
import map from "ramda/src/map";

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  configItem: {
    minWidth: 300,
    margin: theme.spacing(3,0,0,0),
    flexDirection: "row"
  },
  configInput: {
    width: 200
  },
  configUnits: {
    width: 100,
    marginLeft: theme.spacing(1)
  }
}));

const allUnits = {
  inches: 100.0,
  mm: 3.937007874
};

// Component to help input units
const UnitInput = ({name, value, label, onChange}) => {
  const classes = useStyles();
  let [units, setUnits] = useState("inches");
  let [internalValue, setInternalValue] = useState(value / allUnits[units]);

  useEffect(() => {
    setInternalValue(value / allUnits[units]);
  }, [value, units]);

  let handler = event => {
    setInternalValue(event.target.value);
    onChange(event.target.value * allUnits[units]);
  };

  let unitsHandler = event => {
    setUnits(event.target.value);
    setInternalValue(value / allUnits[event.target.value]);
  };

  return (
    <Box className={classes.configItem}>
      <FormControl variant="filled">
        <InputLabel id={`${name}-label`}>{label}</InputLabel>
        <MUIInput id={name} name={name}
                  className={classes.configInput}
                  variant="filled"
                  inputProps={{type: 'input'}}
                  value={internalValue}
                  onChange={handler}/>
      </FormControl>
      <FormControl variant="filled">
        <Select id={`${name}-units`}
                labelId={`${name}-label`}
                className={classes.configUnits}
                value={units} onChange={unitsHandler}>
          {map(key => <MenuItem key={key} value={key}>{key}</MenuItem>, keys(allUnits))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default UnitInput;
