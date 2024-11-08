import { useContext, useEffect, useState } from "react";
import ConfigContext from "../context/ConfigContext";
import ReactMarkdown from "react-markdown";
import UnitInput from "./UnitInput";

import { assocPath, map, path, split } from "ramda";

import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MUIInput from "@mui/material/FilledInput";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";

import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  configItem: {
    minWidth: 200,
    margin: theme.spacing(3, 0, 0, 0),
  },
}));

import { getPath, getSchema } from "../util/input";

const Input = ({ name, label, description, dimension }) => {
  const classes = useStyles();
  const { config, setConfig } = useContext(ConfigContext);
  const value = path(split(".", name), config);

  let valuePath = getPath(name);
  let rawUpdate = (value) => setConfig(assocPath(valuePath, value, config));
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
    if (inputSchema.enum) {
      inputNode = (
        <FormControl className={classes.configItem} variant="filled">
          <InputLabel id={`${name}-label`}>{label}</InputLabel>
          <Select
            variant="standard"
            id={name}
            name={name}
            labelId={`${name}-label`}
            value={value}
            onChange={update}
          >
            {map(
              (opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ),
              inputSchema.enum,
            )}
          </Select>
        </FormControl>
      );
    } else {
      inputNode = (
        <FormControl className={classes.configItem} variant="filled">
          <MUIInput
            value={tempValue}
            onChange={(event) =>
              setTempValue(event.target.value === "" ? 0 : event.target.value)
            }
            onBlur={update}
            id={name}
            name={name}
            label={label}
          />
        </FormControl>
      );
    }
  } else if (inputSchema && inputSchema.type === "boolean") {
    inputNode = (
      <FormControl className={classes.configItem} variant="filled">
        <FormControlLabel
          label={label}
          control={
            <Checkbox checked={value} onChange={update} name={name} id={name} />
          }
        />
      </FormControl>
    );
  } else {
    inputNode = (
      <>
        {dimension ? (
          <UnitInput
            name={name}
            value={value}
            label={label}
            onChange={rawUpdate}
          />
        ) : (
          <FormControl className={classes.configItem} variant="filled">
            <InputLabel id={`${name}-label`}>{label}</InputLabel>
            <MUIInput
              variant="filled"
              name={name}
              id={name}
              value={value}
              onChange={update}
              inputProps={{ type: "number" }}
            />
          </FormControl>
        )}
      </>
    );
  }

  return (
    <>
      {inputNode}
      <Typography variant="caption" display="block" gutterBottom>
        <ReactMarkdown>{description}</ReactMarkdown>
      </Typography>
    </>
  );
};

export default Input;
