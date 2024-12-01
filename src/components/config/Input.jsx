import debounce from "lodash.debounce";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

import Checkbox from "@mui/material/Checkbox";
import MUIInput from "@mui/material/FilledInput";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";

import { assocPath, map, path, split } from "ramda";

import UnitInput from "@/components/config/UnitInput";
import { useConfig, useValidation } from "@/hooks";
import { getPath, getSchema } from "@/util/input";

const useStyles = makeStyles((theme) => ({
  configItem: {
    minWidth: 200,
    margin: theme.spacing(3, 0, 0, 0),
  },
}));

const Input = ({ name, label, description, dimension }) => {
  const classes = useStyles();
  const { config, setConfig } = useConfig();
  const { isValidByInputName } = useValidation();
  const value = path(split(".", name), config);

  const error = !isValidByInputName(name);

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
    if (inputSchema.enum) {
      inputNode = (
        <FormControl className={classes.configItem} variant="filled">
          <InputLabel id={`${name}-label`}>{label}</InputLabel>
          <Select
            id={name}
            name={name}
            labelId={`${name}-label`}
            value={value}
            onChange={update}
            error={error}
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
            error={error}
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
            onChange={rawUpdateDebounced}
            errorValidation={error}
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
              error={error}
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
