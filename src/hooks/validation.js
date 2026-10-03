import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fromPairs, map } from "ramda";

import configSchemaJSON from "@/schemas/config.schema.json";
import { createSetErrors } from "@/state";
import { getValidationPath } from "@/util/input";

// json-schema-library loads in its own chunk without holding up the first
// render, and is long loaded by the time a config is edited
const configSchema = import("json-schema-library").then(
  ({ compileSchema, draft07 }) =>
    compileSchema(configSchemaJSON, { drafts: [draft07] }),
);

export const useValidation = () => {
  const dispatch = useDispatch();
  const validationErrors = useSelector((state) => state.errors);

  // Errors for a config without touching the stored errors
  const checkConfigSchema = useCallback(
    async (config) => (await configSchema).validate(config).errors,
    [],
  );

  const validateConfigSchema = useCallback(
    async (config) => {
      const setValidationErrors = (errors) => {
        const errorPointerAsKey = fromPairs(
          map((error) => [error.data.pointer, error], errors),
        );

        dispatch(createSetErrors(errorPointerAsKey));
      };

      const errors = await checkConfigSchema(config);

      setValidationErrors(errors);

      return errors;
    },
    [dispatch, checkConfigSchema],
  );

  const isValidByInputName = useCallback(
    (name) => {
      const validationPath = getValidationPath(name);
      return validationErrors[validationPath] === undefined;
    },
    [validationErrors],
  );

  return {
    checkConfigSchema,
    isValidByInputName,
    validateConfigSchema,
  };
};
