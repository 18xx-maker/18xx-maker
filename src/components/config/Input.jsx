import debounce from "lodash.debounce";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

import { assocPath, map, path, split } from "ramda";

import UnitInput from "@/components/config/UnitInput";
import { useConfig, useValidation } from "@/hooks";
import {
  Checkbox,
  FormControlLabel,
  Select,
  TextField,
  Typography,
} from "@/ui";
import { getPath, getSchema } from "@/util/input";
import styles from "./Input.module.css";

const Input = ({ name, label, description, dimension }) => {
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
        <Select
          id={name}
          name={name}
          label={label}
          className={styles.configItem}
          value={value}
          onChange={update}
          error={error}
          options={map((opt) => ({ value: opt, label: opt }), inputSchema.enum)}
        />
      );
    } else {
      inputNode = (
        <TextField
          className={styles.configItem}
          value={tempValue}
          onChange={(event) =>
            setTempValue(event.target.value === "" ? 0 : event.target.value)
          }
          onBlur={update}
          id={name}
          name={name}
          error={error}
        />
      );
    }
  } else if (inputSchema && inputSchema.type === "boolean") {
    inputNode = (
      <div className={styles.configItem}>
        <FormControlLabel
          label={label}
          control={
            <Checkbox checked={value} onChange={update} name={name} id={name} />
          }
        />
      </div>
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
          <TextField
            className={styles.configItem}
            name={name}
            id={name}
            label={label}
            value={value}
            onChange={update}
            type="number"
            error={error}
          />
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
