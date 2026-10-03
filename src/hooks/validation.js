import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fromPairs, map } from "ramda";

import configSchemaJSON from "@/schemas/config.schema.json";
import { createSetErrors } from "@/state";
import { getValidationPath } from "@/util/input";

// json-schema-library is only needed once a config is validated
let configSchema;
const getConfigSchema = async () => {
  if (!configSchema) {
    const { compileSchema, draft07 } = await import("json-schema-library");
    configSchema = compileSchema(configSchemaJSON, { drafts: [draft07] });
  }
  return configSchema;
};

export const useValidation = () => {
  const dispatch = useDispatch();
  const validationErrors = useSelector((state) => state.errors);

  const validateConfigSchema = useCallback(
    async (config) => {
      const setValidationErrors = (errors) => {
        const errorPointerAsKey = fromPairs(
          map((error) => [error.data.pointer, error], errors),
        );

        dispatch(createSetErrors(errorPointerAsKey));
      };

      const { errors } = (await getConfigSchema()).validate(config);

      setValidationErrors(errors);

      return errors;
    },
    [dispatch],
  );

  const isValidByInputName = useCallback(
    (name) => {
      const validationPath = getValidationPath(name);
      return validationErrors[validationPath] === undefined;
    },
    [validationErrors],
  );

  return {
    isValidByInputName,
    validateConfigSchema,
  };
};
