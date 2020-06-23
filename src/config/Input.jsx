import React, { useContext, useEffect, useState } from "react";
import ConfigContext from "../context/ConfigContext";
import ReactMarkdown from "react-markdown";
import UnitInput from "./UnitInput";

import schema from "@18xx-maker/schemas/schemas/config.schema.json";

import assocPath from "ramda/src/assocPath";
import chain from "ramda/src/chain";
import compose from "ramda/src/compose";
import complement from "ramda/src/complement";
import filter from "ramda/src/filter";
import isEmpty from "ramda/src/isEmpty";
import map from "ramda/src/map";
import path from "ramda/src/path";
import split from "ramda/src/split";

import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputLabel from "@material-ui/core/InputLabel";
import MUIInput from "@material-ui/core/FilledInput";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Typography from "@material-ui/core/Typography";

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  configItem: {
    minWidth: 200,
    margin: theme.spacing(3,0,0,0)
  }
}));

export const getPath = split('.');
export const getSchemaPath = compose(chain(n => ['properties', n]),
                                     filter(complement(isEmpty)),
                                     split('.'));
export const getSchema = name => path(getSchemaPath(name), schema);

const Input = ({name, label, description, dimension}) => {
  const classes = useStyles();
  const { config, setConfig } = useContext(ConfigContext);
  const value = path(split('.', name), config);

  let valuePath = getPath(name);
  let rawUpdate = value => setConfig(assocPath(valuePath,value,config));
  let update = event => setConfig(assocPath(valuePath,
                                            event.target.type === "checkbox" ?
                                            event.target.checked :
                                            event.target.value,
                                            config));

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
          <Select id={name} name={name} labelId={`${name}-label`} value={value} onChange={update}>
            {map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>, inputSchema.enum)}
          </Select>
        </FormControl>
      );
    } else {
      inputNode = (
        <FormControl className={classes.configItem} variant="filled">
          <MUIInput value={tempValue}
                    onChange={event => setTempValue(event.target.value)}
                    onBlur={update}
                    id={name}
                    name={name}
                    label={label} />
        </FormControl>
      );
    }
  } else if (inputSchema && inputSchema.type === "boolean") {
    inputNode = (
      <FormControl className={classes.configItem} variant="filled">
        <FormControlLabel label={label}
                          control={<Checkbox checked={value} onChange={update} name={name} id={name}/>}/>
      </FormControl>
    );
  } else {
    inputNode = (
      <>
        {dimension ? (
          <UnitInput name={name} value={value} label={label} onChange={rawUpdate}/>
        ) : (
          <FormControl className={classes.configItem} variant="filled">
            <InputLabel id={`${name}-label`}>{label}</InputLabel>
            <MUIInput variant="filled" name={name} id={name} value={value} onChange={update} inputProps={{type: 'number'}} />
          </FormControl>
        )}
      </>
    );
  }

  return (
    <>
      {inputNode}
      <Typography variant="caption" display="block" gutterBottom>
        <ReactMarkdown source={description}/>
      </Typography>
    </>
  );
};

export default Input;
